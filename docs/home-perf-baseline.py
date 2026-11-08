r"""首页性能闸门：把「有没有变慢」和「逻辑有没有被改坏」分成两层判。

用法（在仓库根）：
    python docs/home-perf-baseline.py --static-only     # 只跑静态断言，无需 Chrome/网络
    python docs/home-perf-baseline.py                  # 静态 + Lighthouse，与基线比
    python docs/home-perf-baseline.py --runs 6         # 每个端跑 6 次（噪声大时用）
    python docs/home-perf-baseline.py --update --reason "业主把 hero 换成 2MB 版"
                                                        # 写回基线，理由必须给
    python docs/home-perf-baseline.py --update --reason-file docs/baseline-reason.txt
                                                        # 同一个理由，从文件读

--reason-file 不是锦上添花：2026-11-08 用 PowerShell 传中文 --reason 时，参数被
编码拆坏，argparse 直接报 unrecognized arguments，Lighthouse 一次都没跑，
而 stdout 是空的 —— 看上去像「还在跑」。中文理由一律走文件，别走命令行。

为什么分两层（2026-11-08 的教训）：
  这台机器单次 Lighthouse 不是证据。同码重复实测的移动端 total-byte-weight 极差
  7.69 MB（3.00 ↔ 10.74），LCP 在 3.02 / 3.45 之间晃；到 CDN 的 RTT 观测过
  210 ms ↔ 1670 ms，单这一项就能把移动 LCP 从 5.2 s 推到 11.7 s。
  所以「快了多少 / 慢了多少」必须取中位数，并且拿同码实测的离散度当门限
  （基线里每个指标都存 spread，判据是 max(spread_a, spread_b, 该指标的地板值)）。
  反过来，「结构性事实」是确定的、一次就能判：hero 的 poster 在不在、
  首条 mp4 请求是不是早于 DOMContentLoaded、全站 video 选择器有没有被改回去。
  这一层不需要浏览器，也不需要网络，所以它单独可跑（--static-only），
  也就可以放进每次部署前的例行检查里。

为什么静态层查这三件事：
  1) hero <video> 必须 preload="none" 且带 poster。index.astro 里写死了理由：
     metadata 也要排队抢连接，移动端实测拖慢首屏底图；而不带 poster 时 Chrome
     拿「首帧」当 LCP 候选，首帧要等整片下完才画，移动端实测被图片队列堵到 30s+。
  2) src/scripts/videoCover.js 的选择器必须是 [data-video-cover] video。
     它原先是全站 querySelectorAll("video")，于是顺手摘掉了 hero 的 poster
     （运行时实测 poster=null，而交付 HTML 里有）—— 业主口径被一个兜底脚本推翻，
     而且静默。这条断言防的就是同一类"全局兜底误伤组件自管元素"。
  3) head 里必须有 hero 底图的 preload as=image（poster 与 <img> 同一 URL，
     靠它命中缓存才能"秒画"）。

Lighthouse 调用的两个坑（都踩过，别再试）：
  * 桌面必须 --preset=desktop。用 --form-factor=desktop --screenFactor=desktop 会在
    assertValidSettings 直接中止，表现是「跑得很快、什么都没写出来」。
  * 移动是默认 preset，所以不要给 --preset，否则和 form-factor 冲突。
  报告写完还要回读 configSettings.formFactor 核对，因为"文件存在"不等于"端类型对"。
"""
import argparse
import json
import re
import statistics
import subprocess
import sys
import tempfile
from pathlib import Path

# 用 reconfigure，不用 sys.stdout = io.TextIOWrapper(sys.stdout.buffer, ...)：
# 后者在被 import 时会把上一轮 wrapper 连同底层 buffer 一起关掉，自测脚本
# （.tmp-work/gate-negative-test.py）import 本文件时就是当场炸
# ValueError: I/O operation on closed file。dist-leak-gate.py 早就用的是 reconfigure。
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = Path(__file__).resolve().parent.parent
BASELINE = ROOT / "docs" / "home-perf-baseline.json"
DEFAULT_URL = "https://www.meiyualuminum.com/"

# (audit id, 显示名, 越大越好?, 地板值：门限至少这么宽，单位与 numericValue 一致)
AUDITS = [
    ("first-contentful-paint", "FCP", False, 200.0),
    ("largest-contentful-paint", "LCP", False, 400.0),
    ("cumulative-layout-shift", "CLS", False, 0.02),
    ("total-blocking-time", "TBT", False, 80.0),
    ("speed-index", "SI", False, 400.0),
    ("server-response-time", "TTFB", False, 250.0),
    ("total-byte-weight", "bytes", False, 1_500_000.0),
]


# 哪些指标真的参与判定。这不是偷懒，是 2026-11-08 实测出来的：
#   移动端 4 次 LCP = 23226 / 3985 / 6214 / 4058，极差 19.2 秒；请求数 33↔106。
#   分组一看就明白：req=106 的两次 hero mp4 计入 5768KB（下完），req=33/35 的两次
#   只计入 2887/3284KB（窗口提前关）。所以方差主因是「测量窗口跑完没跑完」，
#   不是网络。拿它当门限（tolerance = spread）得到的就是一个永不 FAIL 的判据，
#   那比没有闸门更坏 —— 它会给人假安全感。
#   「桌面没这个问题」—— 这句上一版写在这里，**它错了**：重跑时
#   desktop #1 = 4.51MB / 55 req，desktop #2 = 14.80MB / 125 req，LCP 1676 vs 2248。
#   种子那 4 次碰巧全落在「早关」模式，spread 才只有 259ms —— 幸运样本不是稳定性质。
#   真正的驱动量是「后台预热队列在测量窗口内跑完没跑完」，**两个端都会分裂**。
# 所以只判 CLS 与 TBT：今天累计 10+ 次实测里，CLS 每次都落在 0 / 0.0056，
# TBT 除一次 155 外全为 0 —— 只有这两个不随机器负载变。
# FCP 也不行：同一份代码桌面 FCP 实测 357 ↔ 1072（本文件上一版把 FCP/TTFB 放进
# 判定集，紧接着就撞上桌面 FCP 1072 的误报 —— 那就是假 FAIL 的代价）。
GATED = {
    "mobile": {"CLS", "TBT"},
    "desktop": {"CLS", "TBT"},
}

# requests 极差超过这个数，就认定这一批 run 分裂成了两种完成度。
# 实测两个群体：早关 33~66，跑完 106~125，跳 25 能把它们分开。
MODE_SPLIT_REQ = 25


def strip_js_comments(text):
    """剥掉 // 与 /* */ 注释。不是可选项：本文件写完后第一次跑就把这条断言
    判成 ❌，因为 videoCover.js 的维护注释里原文引用了旧代码
    document.querySelectorAll("video")——注释里的字符串被当成了代码。
    判据要是能被注释骗到，它迟早会被当成噪音绕过。"""
    t = re.sub(r"/\*[\s\S]*?\*/", "", text)
    t = re.sub(r"(?m)^\s*//.*$", "", t)
    return re.sub(r"(?m)^\s*\*.*$", "", t)


def static_checks():
    """确定性断言。返回 [(名字, 通过?, 实际看到的)]。不碰网络，不碰浏览器。"""
    out = []
    idx = ROOT / "dist" / "client" / "index.html"
    if not idx.exists():
        return [("dist/client/index.html 存在", False, "先 npx astro build")]
    html = idx.read_text(encoding="utf-8", errors="replace")

    m = re.search(r"<video[^>]*video-hero-bg[^>]*>", html)
    tag = re.sub(r"\s+", " ", m.group(0)) if m else ""
    out.append(("hero <video> 标签找到", bool(m), tag[:70]))
    out.append(("hero preload=none", bool(m) and 'preload="none"' in tag,
                (re.findall(r'preload="([^"]*)"', tag) or ["<无>"])[0]))
    out.append(("hero 带 poster", bool(m) and "poster=" in tag,
                (re.findall(r'poster="([^"]*)"', tag) or ["<无>"])[0][:60]))
    out.append(("head 里 hero 底图 preload as=image",
                bool(re.search(r'<link[^>]+rel="preload"[^>]+as="image"[^>]+meiyu-video-4', html))
                or bool(re.search(r'<link[^>]+as="image"[^>]+meiyu-video-4', html)),
                "命中" if re.search(r'as="image"[^>]+meiyu-video-4|meiyu-video-4[^>]+as="image"', html) else "未见"))

    # 全站 video 选择器必须已经收进 [data-video-cover]
    scope = r"querySelectorAll\([`'\"]\[data-video-cover\] video[`'\"]\)"
    glob_ = r"querySelectorAll\([`'\"]video[`'\"]\)"
    src = strip_js_comments((ROOT / "src" / "scripts" / "videoCover.js").read_text(encoding="utf-8"))
    out.append(("源码 videoCover.js 用限定作用域（已剥注释）",
                bool(re.search(scope, src)) and not re.search(glob_, src),
                "scoped" if re.search(scope, src) else "仍是全站"))
    built = []
    for f in list((ROOT / "dist" / "client").rglob("*.html")) + \
             list((ROOT / "dist" / "client").rglob("*.js")) + \
             list((ROOT / "dist" / "server").rglob("*.mjs")):
        t = f.read_text(encoding="utf-8", errors="replace")
        if re.search(glob_, t):
            built.append(f.name)
    out.append(("产物里无全站 querySelectorAll('video') 残留", not built, built[:4] or "0 处"))

    # 4 个正文容器都要打上 data-video-cover（漏一个 = 那类正文视频不出首帧封面）
    for cls, where in [("page-content", "src/pages/[page].astro"),
                       ("article-content", "src/pages/blog/[...slug].astro"),
                       ("pk-db-content", "src/pages/products/[slug].astro"),
                       ("video-content", "src/pages/videos/[...slug].astro")]:
        txt = (ROOT / where).read_text(encoding="utf-8")
        hit = re.search(r'class="%s"[^>]*data-video-cover|data-video-cover[^>]*class="%s"'
                        % (cls, cls), txt)
        out.append(("正文容器 .%s 已打标记" % cls, bool(hit), where))

    # 预热阶梯三级都必须看 desktop：NetProfile.desktop 的注释本来就写着
    # 「<1024px 不预热视频，也不做整页铺图」，而 2026-11-08 之前只有 P6 真按它做。
    # 手机上实测多下 ~3.3MB / 59 张屏外图、跑 38.5 秒 —— 一个 enabled: true 就能推翻
    # 整份口径，所以这条留在静态层，不靠人记。
    lad = strip_js_comments((ROOT / "src" / "lib" / "homeMediaLoader.ts").read_text(encoding="utf-8"))
    block = re.search(r"function buildLadder[\s\S]*?\n}", lad)
    # 只拿返回数组里的三个对象字面量：函数签名 `{ enabled: boolean; tasks: … }[]`
    # 也是这个形状，靠「值后面紧跟一个逗号再接 tasks:」把它排除掉（它是分号）。
    tiers = re.findall(r"\{\s*enabled:\s*([^{}]+?),\s*tasks:", block.group(0)) if block else []
    out.append(("buildLadder 三级都按 profile.desktop 收口", bool(block) and len(tiers) == 3
                and all("profile.desktop" in t for t in tiers),
                "无 buildLadder" if not block else "%d 级：%s" % (
                    len(tiers), " | ".join(re.sub(r"\s+", " ", t).strip() for t in tiers))))
    return out


def print_static(rows):
    print("=== 静态不变量（确定性，一次就能判）===")
    bad = 0
    for name, ok, seen in rows:
        if not ok:
            bad += 1
        print("   %s %-44s 实际: %s" % ("✓" if ok else "❌", name, seen))
    return bad


def lh_flags(form):
    """按踩过的坑给参数：桌面必须 --preset=desktop；移动不给 --preset。"""
    base = ["lighthouse", DEFAULT_URL, "--only-categories=performance",
            "--quiet", "--output=json"]
    if form == "desktop":
        return base + ["--preset=desktop", "--chrome-flags=--headless"]
    return base + ["--form-factor=mobile", "--screenFactor=mobile",
                   "--chrome-flags=--headless --window-size=390,844"]


def run_lighthouse(form, out_path):
    cmd = ["npx.cmd"] + lh_flags(form) + ["--output-path", str(out_path)]
    subprocess.run(cmd, capture_output=True, timeout=420)
    if not out_path.exists():
        return None, "报告没写出来（这不代表跑过了）"
    data = json.loads(out_path.read_text(encoding="utf-8", errors="replace"))
    got = (data.get("configSettings") or {}).get("formFactor")
    if got != form:
        return None, "formFactor=%r 与要求的 %s 不符" % (got, form)
    return data, ""


def metrics_from(data):
    a = data.get("audits") or {}
    m = {}
    score = ((data.get("categories") or {}).get("performance") or {}).get("score")
    if score is not None:
        m["score"] = round(score * 100, 1)
    for aid, label, _, _ in AUDITS:
        if aid in a:
            m[label] = a[aid].get("numericValue")
    items = ((a.get("network-requests") or {}).get("details") or {}).get("items")
    if items is not None:
        m["requests"] = len(items)
    return m


def collect(runs):
    """每个端跑 runs 次，返回 {form: {metric: [值...]}}；任何一次拿不到就整体失败。

    每条进度都带 flush=True：2026-11-08 把本脚本重定向到文件后台跑时，
    stdout 被全缓冲，运行期间文件是 0 字节，看上去像「还没开始」；
    而另一个后台实例被控制台 CTRL_C 打断时，同样什么都没留下。
    一个报不了进度的计时工具，会被当成「还在跑」而白等。"""
    samples = {}
    tmp = Path(tempfile.mkdtemp(prefix="home-perf-"))
    for form in ("mobile", "desktop"):
        vals = []
        for i in range(1, runs + 1):
            p = tmp / ("lh-%s-%d.json" % (form, i))
            data, err = run_lighthouse(form, p)
            if err:
                print("   !! %s #%d 无效：%s" % (form, i, err), flush=True)
                return None
            m = metrics_from(data)
            vals.append(m)
            print("   %s #%d  LCP=%s FCP=%s bytes=%s req=%s" % (
                form, i, _fmt(m, "LCP"), _fmt(m, "FCP"),
                _fmt(m, "bytes"), _fmt(m, "requests")), flush=True)
        samples[form] = vals
    return samples


def _fmtv(v, label):
    """按指标名把一个数值格式化。单独拆出来是因为上一版在这里出过显示 bug：
    打印时把整个 {"median":…, "spread":…} 字典传给了按标签取值的函数，
    取不到就一律打「—」—— 数字算对了，显示层是空的，这种错最难发现。"""
    if v is None:
        return "—"
    if label == "bytes":
        return "%.2fMB" % (v / 1048576)
    if label == "CLS":
        return "%.4f" % v
    return "%.0f" % v


def _fmt(m, label):
    v = m.get(label)
    if v is None:
        return "—"
    if label == "bytes":
        return "%.2fMB" % (v / 1048576)
    if label == "CLS":
        return "%.4f" % v
    return "%.0f" % v


def summarize(vals):
    """把 N 次样本压成 {metric: {median, spread, lo, hi}}。"""
    keys = set()
    for v in vals:
        keys |= set(v.keys())
    out = {}
    for k in sorted(keys):
        xs = [v[k] for v in vals if v.get(k) is not None]
        if not xs:
            continue
        out[k] = {"median": round(statistics.median(xs), 4),
                  "spread": round(max(xs) - min(xs), 4),
                  "lo": round(min(xs), 4), "hi": round(max(xs), 4), "n": len(xs)}
    return out


def judge(base, cur):
    """只对 GATED 里的指标判；其余只报不判（原因见 GATED 上方那段）。"""
    bad = []
    for form in ("mobile", "desktop"):
        b, c = base["forms"].get(form, {}), cur.get(form, {})
        pairs = [(l, hb, fl) for _, l, hb, fl in AUDITS] + \
                [("score", True, 6.0), ("requests", False, 6.0)]
        for label, higher_better, floor in pairs:
            if label not in GATED.get(form, set()) or label not in b or label not in c:
                continue
            bm, cm = b[label]["median"], c[label]["median"]
            tol = max(b[label]["spread"], c[label]["spread"], floor)
            if higher_better:
                if cm < bm - tol:
                    bad.append((form, label, bm, cm, tol))
            else:
                if cm > bm + tol:
                    bad.append((form, label, bm, cm, tol))
    return bad


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--static-only", action="store_true")
    ap.add_argument("--runs", type=int, default=3)
    ap.add_argument("--update", action="store_true", help="把本次结果写回基线")
    ap.add_argument("--reason", default="", help="--update 必须给理由")
    ap.add_argument("--reason-file", default="",
                    help="从 UTF-8 文件读理由（PowerShell 传中文参数会被拆坏，走这个）")
    ap.add_argument("--url", default=DEFAULT_URL)
    args = ap.parse_args()

    bad_static = print_static(static_checks())

    if args.static_only:
        print("\n结论：%s（静态层）" % ("闸门通过" if not bad_static else "%d 项需修，勿部署" % bad_static))
        sys.exit(0 if not bad_static else 1)

    print("\n=== Lighthouse 层：%d 次/端，取中位数 ===" % args.runs)
    cur = collect(args.runs)
    if cur is None:
        print("\n❌ 有 run 没出有效报告，判不了。别用「跑完了」当通过。")
        sys.exit(1)
    cur_sum = {f: summarize(v) for f, v in cur.items()}

    if args.update:
        reason = args.reason.strip()
        if args.reason_file:
            reason = (Path(args.reason_file).read_text(encoding="utf-8").strip()
                      or reason)
        if not reason:
            print("\n❌ --update 必须带 --reason 或 --reason-file，写清这次基线为什么可以变。")
            sys.exit(1)
        doc = {"url": DEFAULT_URL, "runs_per_form": args.runs,
               "updated": "2026-11-08", "reason": reason,
               "note": "spread 是同码重复实测的极差，判据门限取 max(spread_a, spread_b, 地板值)；"
                       "单次样本永不参与判定。地板值在 docs/home-perf-baseline.py 的 AUDITS 里。",
               "forms": cur_sum}
        BASELINE.write_text(json.dumps(doc, ensure_ascii=False, indent=1), encoding="utf-8")
        print("\n已写回基线：%s（理由：%s）" % (BASELINE.name, reason))
        sys.exit(0 if not bad_static else 1)

    if not BASELINE.exists():
        print("\n❌ 还没有基线。先跑：python docs/home-perf-baseline.py --update --reason \"建立基线：<为什么是现在这个状态>\"")
        sys.exit(1)

    base = json.loads(BASELINE.read_text(encoding="utf-8"))
    print("\n=== 与基线比对（基线 %s，%d 次/端）===" % (base.get("updated"), base.get("runs_per_form")))
    regress = judge(base, cur_sum)
    for form in ("mobile", "desktop"):
        print("  %s:  (只判 %s)" % (form, "/".join(sorted(GATED.get(form, set()))) or "无"))
        # 先把每个 run 原样列出来：中位数会把「早关」和「跑完」两个群体混成一个
        # 没意义的数，但完成度分裂本身就是要看的对象。
        reqs = [m.get("requests") for m in cur.get(form, []) if m.get("requests")]
        lcs = [m.get("LCP") for m in cur.get(form, []) if m.get("LCP") is not None]
        print("      逐 run req=%s  LCP=%s" % (
            reqs, [int(x) for x in lcs]))
        if reqs and (max(reqs) - min(reqs)) > MODE_SPLIT_REQ:
            print("      ⚠ 这一批 run 分裂成两种完成度（req 极差 %d > %d）："
                  "LCP/SI/bytes 的中位数跨了两个群体，不要当结论"
                  % (max(reqs) - min(reqs), MODE_SPLIT_REQ))
        labels = [l for _, l, _, _ in AUDITS] + ["score", "requests"]
        for label in labels:
            b = base["forms"].get(form, {}).get(label)
            c = cur_sum.get(form, {}).get(label)
            if not b or not c:
                continue
            gated = label in GATED.get(form, set())
            if gated and (form, label) in [(r[0], r[1]) for r in regress]:
                mark = "❌"
            elif gated:
                mark = "✓"
            else:
                mark = "·"
            tail = "" if gated else "  仅报告（受预热队列完成度影响，不拿它判）"
            print("    %s %-6s 基线 %s → 本次 %s （极差 基线%.1f / 本次%.1f）%s" % (
                mark, label, _fmtv(b["median"], label), _fmtv(c["median"], label),
                b["spread"], c["spread"], tail))

    ok = not regress and not bad_static
    print("\n结论：%s" % ("闸门通过" if ok else
                          "有 %d 项超标（判定集 = CLS/TBT + 静态不变量），勿部署/需回看"
                          % (len(regress) + bad_static)))
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
