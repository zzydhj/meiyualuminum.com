# -*- coding: utf-8 -*-
"""3D 指南包与站内接线的一致性校验（public/ 下有几份就查几份）。

用法：先起 dev server（默认 http://localhost:4323，可跟一个端口号参数），
再在仓库根跑 `python docs/guides-audit.py [port]`。退出码非 0 表示有 ❌，
可直接当上线前的闸门用。

为什么按 slug 循环而不是写死一份包：注册表里每加一条指南，旧写法就只查到
第一条，等于对新包完全不设防。现在注册表、包内数据、index.html 三方对齐才算过。
工序与部件数量不数源码、走运行时 import（见 steps_dump），因为新包的工序
是函数生成的，数源码会得出一个看起来很正常的错数。
"""
import html
import json
import re
import subprocess
import sys
import urllib.request
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
ROOT = Path(__file__).resolve().parents[1]
GUIDES = ROOT / "public" / "interactive-guides"
BASE = "http://localhost:%s" % (sys.argv[1] if len(sys.argv) > 1 else "4323")

fails = []
skips = []


def skip(label, why):
    """本次查不了就要明说查不了。当成 ✅ 是假绿，当成 ❌ 是假红，
       两种都会让人下一轮不看这条。"""
    print("  ⚠️  %s  跳过：%s" % (label, why))
    skips.append(label)


def check(label, ok, detail=""):
    print("  %s %s%s" % ("✅" if ok else "❌", label, ("  " + detail) if detail else ""))
    if not ok:
        fails.append(label)


def read(p):
    return (p).read_text(encoding="utf-8")


def visible_text(src):
    """去掉注释后的剩余内容 —— 只有这里的中文才是访客在页面上看到的。
       三类注释都要剔：JS 块注释、JS 行注释（避开 URL 里的 //）、HTML 注释。
       注：public/ 下的文件原样下发，HTML 注释会出现在 view-source 里，
       但那不是「渲染给访客的文案」，本项目一直按这个口径区分（与中文维护
       注释是否要改英文是两件事，后者属另一个待讨论项）。"""
    t = re.sub(r"/\*.*?\*/", " ", src, flags=re.S)
    t = re.sub(r"<!--[\s\S]*?-->", " ", t)
    t = re.sub(r"(?<!:)//[^\n]*", " ", t)
    return t


def brand_values(src):
    """只取 brand.js 里实际会显示的句子（v: '…' / label 等字符串值），
       不拿注释——上一版把「成立年份 2015→2011」这种说明注释也算命中。"""
    return " ".join(re.findall(r"(?:v|spec|tag|word|value|text):\s*'([^']*)'", src))


def registry_block(slug):
    src = read(ROOT / "src" / "lib" / "interactiveGuides.ts")
    m = re.search(r'slug:\s*"%s".*?\n    \},' % re.escape(slug), src, re.S)
    return m.group(0) if m else ""


_DUMPS = {}


def steps_dump(pkg):
    """工序与部件数据取运行时真实值，不数源码。

    铝单板包的工序与部件 id 都是函数 / spread 生成的：源码里只有 2 个 name:
    字面量，运行时是 12 道工序。用正则数源码会把每一条步数一致性检查带偏，
    而且错得看起来很正常。所以直接 import 那个包（docs/guide-steps-dump.mjs）。
    """
    key = pkg.name
    if key not in _DUMPS:
        out = subprocess.run(
            ["node", str(Path(__file__).with_name("guide-steps-dump.mjs")), str(pkg)],
            capture_output=True, text=True, encoding="utf-8", timeout=180, cwd=str(ROOT))
        try:
            _DUMPS[key] = json.loads(out.stdout)
        except Exception as e:  # noqa: BLE001
            check("%s 的工序数据能导入" % key, False, (out.stderr or out.stdout)[:130])
            _DUMPS[key] = {"count": 0, "orders": [], "names": [], "partSteps": [],
                           "partIds": [], "builderKeys": None}
    return _DUMPS[key]


# ── 每个包 ──────────────────────────────────────────────────────────────
for pkg in sorted(GUIDES.iterdir()):
    if not pkg.is_dir():
        continue
    slug = pkg.name
    print("\n══ 包 %s ══" % slug)

    steps_src = read(pkg / "js/data/steps.js")
    parts_src = read(pkg / "js/data/parts.js")
    builders_src = read(pkg / "js/model/builders.js")
    html_src = read(pkg / "index.html")
    brand_src = read(pkg / "js/data/brand.js")
    block = registry_block(slug)

    if not block:
        check("注册表里有这一条", False, "src/lib/interactiveGuides.ts 找不到 slug")
        continue
    check("注册表里有这一条", True)

    dump = steps_dump(pkg)
    orders = dump["orders"]
    n = dump["count"]
    check("steps.js 工序号连续从 1 开始", orders == list(range(1, n + 1)), str(orders))
    check("steps.js 导出的 STEP_COUNT 与数组长度一致",
          dump["declaredCount"] in (None, n), "%s vs %d" % (dump["declaredCount"], n))

    step_count = int(re.search(r"stepCount:\s*(\d+)", block).group(1))
    check("注册表 stepCount == STEPS.length", step_count == n, "%d vs %d" % (step_count, n))

    totals = re.findall(r'id="stepTotal">(\d+)<', html_src)
    meta = re.findall(r'id="metaStep">(\d+)/(\d+)<', html_src)
    check("index.html stepTotal 与工序数一致", totals == [str(n)], str(totals))
    check("index.html metaStep 分母一致", meta and meta[0][1] == str(n), str(meta))
    # 文案里写死的「N build-up steps」也要跟着（u-baffle 曾漏过同类）
    claims = set(re.findall(r"(\d+)\s+(?:sequenced|build-up)\s+steps", html_src))
    check("HTML 文案中写死的步数一致", claims <= {str(n)}, str(claims or "无"))

    part_ids = dump["partIds"]
    builder_ids = dump["builderKeys"] or []
    check("部件 ↔ 构造器一一对应", sorted(part_ids) == sorted(builder_ids),
          "parts=%d builders=%d" % (len(part_ids), len(builder_ids)))
    only_p = set(part_ids) - set(builder_ids)
    only_b = set(builder_ids) - set(part_ids)
    if only_p:
        check("  部件缺构造器", False, str(sorted(only_p)))
    if only_b:
        check("  构造器无部件", False, str(sorted(only_b)))

    part_steps = dump["partSteps"]
    check("部件引用的工序号都在范围内", all(1 <= s <= n for s in part_steps),
          str(sorted(set(part_steps))))

    smap = {int(k): int(v) for k, v in re.findall(r"(\d+):\s*(\d+)",
                                                  re.search(r"stepMap:\s*\{([^}]*)\}", block).group(1))}
    check("stepMap 目标工序都在 1..N 内", all(1 <= v <= n for v in smap.values()),
          str(smap))

    canon = re.search(r'rel="canonical" href="([^"]+)"', html_src)
    check("canonical 指向真实挂载路径",
          canon is not None and canon.group(1).endswith("/interactive-guides/%s/" % slug),
          canon.group(1) if canon else "缺失")
    check("有回 3D 清单页的入口", 'href="/interactive-guides/"' in html_src)

    # 静态工序文案：不执行 JS 的抓取器只能读到 index.html 里这一份，
    # 所以它必须存在、必须齐 8 条，而且必须与 steps.js 逐字一致——
    # 两边一旦漂了，爬虫看到的就和真人看到的不是一回事。
    js_names = dump["names"]
    # HTML 实体必须还原后再比：工序名里带 &（Survey & Setting Out）时，
    # index.html 写的是 &amp;，不还原就会报出一个假差异。
    html_names = [html.unescape(x) for x in
                  re.findall(r'<span class="st-no">\d+</span>([^<]+)</h3>', html_src)]
    check("index.html 预置了全部 %d 道工序的静态文案" % len(js_names),
          bool(js_names) and js_names == html_names,
          "steps.js %d / HTML %d%s" % (len(js_names), len(html_names),
                                       "" if js_names == html_names
                                       else " 差异：%s" % str(set(js_names) ^ set(html_names))[:70]))
    body = re.search(r'<ol class="st-list-wrap">([\s\S]*?)</ol>\s*</div>', html_src)
    check("静态文案含机具/工艺/验收正文", bool(body) and "st-checks" in html_src
          and html_src.count('class="st-row"') >= len(js_names),
          "st-row %d 处 / st-checks %d 处" % (html_src.count('class="st-row"'),
                                            html_src.count('class="st-checks"')))
    check("stepsPanel 填充前清空容器（不会重复渲染）",
          "listEl.innerHTML = ''" in read(pkg / "js" / "ui" / "stepsPanel.js"))

    # 断面尺寸：文字层写的面宽必须等于模型里的面宽。
    # 条扣包曾经文字写 86×10、模型画 88 宽/90 模数，买家量一下模型就知道两处不同。
    spec_src = read(pkg / "js" / "model" / "spec.js")
    face = re.search(r"(?:STRIP|BAFFLE)\s*=\s*\{[^}]*?width:\s*([\d.]+)", spec_src, re.S)
    if face:
        mm = round(float(face.group(1)) * 100)
        stale = []
        for f in ("js/data/parts.js", "js/data/overview.js", "js/data/steps.js", "js/data/brand.js"):
            for m in re.finditer(r"(\d{2,3})\s*[×x]\s*\d{1,2}\s*[×x]\s*0?\.\d", read(pkg / f)):
                if int(m.group(1)) != mm:
                    stale.append("%s:%s" % (f, m.group(0)))
            for m in re.finditer(r"(\d{2,3})\s+wide face", read(pkg / f)):
                if int(m.group(1)) != mm:
                    stale.append("%s:%s wide" % (f, m.group(1)))
        check("文字层面宽 = 模型面宽（%d mm）且无旧值残留" % mm, not stale,
              str(stale) if stale else "parts/overview/steps/brand 全部对齐")

    # 会渲染给访客的中文（注释已剔除）
    bad = []
    for f in sorted((pkg / "js").rglob("*.js")) + [pkg / "index.html"]:
        body = visible_text(read(f))
        for m in re.finditer(r"[一-鿿]+", body):
            bad.append("%s: …%s…" % (f.name, body[max(0, m.start() - 30):m.end() + 20].replace("\n", " ")))
    check("包内无会渲染的中文", not bad, "; ".join(bad[:3]))

    brand_shown = brand_values(brand_src)
    stale = [p for p in ("2015", "Dongguan", "东莞", "20–25", "30–40") if p in brand_shown]
    check("brand.js 展示值无过期公司事实", not stale, str(stale))
    check("brand.js 与 companyProfile 同口径",
          "established 2011" in brand_shown and "7–10 working days" in brand_shown)

# ── 站内接线 ────────────────────────────────────────────────────────────
print("\n══ 站内接线 ══")


def get(path):
    with urllib.request.urlopen(BASE + path, timeout=150) as r:
        return r.status, r.read().decode("utf-8", "replace")


# 包列表从目录读，不写死——写死的清单会让第四份指南悄悄漏检。
# 注册表与目录的一一对应单独查：漏挂入口或漏建目录都会红。
disk_slugs = sorted(p.name for p in GUIDES.iterdir() if p.is_dir())
reg_src = read(ROOT / "src" / "lib" / "interactiveGuides.ts")
reg_slugs = sorted(re.findall(r'slug:\s*"([^"]+)"', reg_src))
# slug → 工序数：卡片徽章的期望值从注册表取，不写死 8。
# 上一版写死了 8，第四份指南（12 道）一接进来就假失败。
REG_STEPS = {s: int(n) for s, n in re.findall(r'slug:\s*"([^"]+)"[\s\S]*?stepCount:\s*(\d+)', reg_src)}
check("注册表与 public/ 包一一对应", disk_slugs == reg_slugs,
      "目录 %s / 注册表 %s" % (disk_slugs, reg_slugs))

for slug in disk_slugs:
    try:
        code, html = get("/interactive-guides/%s/" % slug)
        check("GET /interactive-guides/%s/" % slug, code == 200, "HTTP %d" % code)
    except Exception as e:  # noqa: BLE001
        check("GET /interactive-guides/%s/" % slug, False, str(e)[:70])
        continue
    check("  main.js 有 #step=N 深链", "stepFromLocation" in read(GUIDES / slug / "js/main.js"))
    # 卡片徽章上的数来自注册表，工序正文来自包内 steps.js：两处不一致就是骗访客
    n_pkg = steps_dump(GUIDES / slug)["count"]
    n_reg = re.search(r'slug:\s*"%s"[\s\S]*?stepCount:\s*(\d+)' % re.escape(slug), reg_src)
    check("  注册表 stepCount = 包内工序数", bool(n_reg) and int(n_reg.group(1)) == n_pkg,
          "注册表 %s / 运行时 %d 道" % (n_reg.group(1) if n_reg else "缺", n_pkg))

try:
    code, ig = get("/installation-guides/")
    check("GET /installation-guides/", code == 200, "HTTP %d" % code)
    check("两张卡都有 3D 徽章", ig.count("ig-3d-badge") >= 2,
          "共 %d 个" % ig.count("ig-3d-badge"))
    check("条扣卡有小预览 canvas",
          'data-preview="strip-ceiling"' in ig)
    check("条扣卡有 3D build-up 链接",
          re.search(r'href="/interactive-guides/strip-ceiling/"[^>]*>\s*3D build-up', ig) is not None)

    # 业主 10-28 定的新版式：有 3D 的卡不列步骤预览，徽章数 = 3D 工序数。
    # 逐卡判定，不能用全页字符串包含——没 3D 的卡本来就可能叫「6 Steps」。
    cards = re.split(r'<div class="ig-card"', ig)[1:]
    check("卡片数与知识库条目数相当", len(cards) >= 12, "%d 张" % len(cards))
    for c in cards:
        name = re.search(r'<h3[^>]*>(.*?)</h3>', c, re.S)
        name = re.sub(r"<[^>]+>", "", name.group(1)).strip() if name else "?"
        has3d = "ig-3d-badge" in c
        badge = re.search(r'class="ig-steps-count"[^>]*>\s*([^<]+?)\s*<', c)
        badge = badge.group(1) if badge else "?"
        listed = "ig-card-steps" in c
        if has3d:
            m = re.search(r'href="/interactive-guides/([^"/]+)/"', c)
            want = REG_STEPS.get(m.group(1)) if m else None
            check("3D 卡「%s」徽章数=注册表工序数、不列步骤、无 #step= 深链"
                  % name[:28],
                  want is not None and badge == "%d Stages" % want
                  and not listed and "#step=" not in c,
                  "徽章=%s 期望=%s 列表=%s" % (badge, want, listed))
        else:
            check("非 3D 卡「%s」保持原样（N Steps + 步骤列表）" % name[:28],
                  badge.endswith("Steps") and listed,
                  "徽章=%s 列表=%s" % (badge, listed))
except Exception as e:  # noqa: BLE001
    check("GET /installation-guides/", False, str(e)[:70])

# 删了卡上列表之后，逐工序深链只剩产品页一处，必须确认它真的在 HTML 里
try:
    code, prod = get("/products/aluminum-strip-ceiling/")
    check("GET /products/aluminum-strip-ceiling/", code == 200, "HTTP %d" % code)
    if "pk-step-num" not in prod:
        # 产品页是 SSR：连不上数据库时 dev server 会发一个兜底的 200 页，
        # 整页没有步骤块。这时候判「深链丢了」是假红，必须计成跳过。
        skip("产品页带逐工序 #step=N 深链",
             "这一页没渲染出来（SSR 背的数据库本次不可达），不能拿兜底页判深链")
    else:
        steps = sorted({int(x) for x in re.findall(r'/interactive-guides/strip-ceiling/#step=(\d+)', prod)})
        check("产品页带逐工序 #step=N 深链", len(steps) >= 5, "工序号 %s" % steps)
except Exception as e:  # noqa: BLE001
    check("产品页带逐工序 #step=N 深链", False, str(e)[:70])

print("\n══ 结果 ══")
if skips:
    print("⚠️  %d 项本次没查到（不是通过，是没查）：%s" % (len(skips), "、".join(skips)))
if fails:
    print("❌ %d 项未过：" % len(fails))
    for f in fails:
        print("   -", f)
    sys.exit(1)
print("✅ 全部通过" + ("（但有 %d 项跳过，见上）" % len(skips) if skips else ""))
