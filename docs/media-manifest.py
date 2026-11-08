"""素材缓存键闸门：核对站点引用的每个 R2 对象，字节变了有没有同时抬缓存键。

用法（在仓库根）：
    python docs/media-manifest.py                 # 只查，不改基线；有问题退出码 1
    python docs/media-manifest.py --update        # 查完把当前状态写回基线
    python docs/media-manifest.py --only home/aluminum-strip-ceiling/
    python docs/media-manifest.py --csv out.csv

为什么需要它：file.meiyualuminum.com 是 R2 直链套 Cloudflare 边缘缓存，源站默认发
`Cache-Control: max-age=31536000`，也就是同一个 URL 一旦被边缘取过，接下来一年它都
只回源站当时的字节。所以"在桶里原地覆盖同名文件"这件事，访客看到什么取决于边缘条目
有没有碰巧过期——纯运气。

2026-11-07 一天里连踩两次：
  * 6 条画廊视频压完替换，边缘还在发 10 月 8 日的旧字节（TTL 还剩 364 天），只能靠
    index.astro 里的 VG_V 抬到 ?v=20261107b 才真正生效；
  * 那张 1.1 MB 的 Tab 图压完替换，正好撞上边缘 EXPIRED 才回源拿到新字节。
前者有人发现，后者没人发现——这正是必须上闸门的理由。

命名规则决定风险：
  * `covers/`、`products/`、`renders/` 走 docs/r2-image-pipeline.py，按内容哈希命名，
    换图必换 URL，天生安全；
  * `home/**` 与 `video-project/**` 是固定文件名，只有靠 ?v= 才安全。首页引用的
    94 个素材里有 62 个是"固定文件名且不带 ?v="，换文件就是赌运气。

判据（失败即退出码 1）：
  1) CHANGED-STALEKEY 对象 ETag 变了，但引用它的 URL 里 ?v= 没变（或本来就没带）
     → 边缘会继续发旧字节，必须抬版本号，或改用哈希命名。
  2) MISSING  对象 404 → 引用悬空（改名换址忘了更新，或素材被删）。
  3) UNREACHABLE 取不到 → 闸门本身失效，绝不允许当成"没问题"。
     2026-10-29 那轮锚点审计就是因为把 403 当无问题，报出"0 问题"的假通过。
  4) NEW 新出现的对象只报告不失败：新 URL 天生不可能有旧缓存。

只读：全程 HEAD，不进边缘缓存、不下载正文，不会像当天那次探测那样把即将被替换的
旧字节预热进正式缓存键。
"""
import argparse
import csv
import http.client
import json
import os
import re
import sys
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from collections import defaultdict

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CDN_HOST = "file.meiyualuminum.com"
CDN = f"https://{CDN_HOST}/"
MANIFEST = os.path.join(ROOT, "docs", "media-manifest.json")

_tls = threading.local()
HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; media-manifest-gate/1.0)"}

# 有意接受的例外：对象路径 -> 理由。没有理由的命中就是漏改。
#
# 下面这批是 2026-11-08 首跑抽出来的 19 个死引用。它们全部只在数据库字段里，
# 页面不渲染——已逐个到生产页面 HTML 验过，不是猜测：
#   /technical-documentation/ 里只有 1 条 CDN 链接（favicon），12 个 pdf/zip 一条未出现；
#   /products/aluminum-wall-panels/ 里那 6 个旧图名 0 处引用（页面用的是 enriched_specs 图）。
# 所以不阻塞闸门，但该清库：一旦哪天有人把那些字段接上渲染，就是买家看得见的 404。
ALLOW = {
    "docs/acoustic-performance-report.pdf":
        "pages:technical-documentation 陈旧下载字段，模板不渲染；桶内从未有 docs/ 前缀对象",
    "docs/anodized-finish-guide.pdf": "同上",
    "docs/baffle-ceiling-spec.pdf": "同上",
    "docs/ceiling-installation-manual.pdf": "同上",
    "docs/ceiling-suspension-details.zip": "同上",
    "docs/ceiling-system-spec.pdf": "同上",
    "docs/cleaning-maintenance-guide.pdf": "同上",
    "docs/color-finish-chart.pdf": "同上",
    "docs/facade-installation-manual.pdf": "同上",
    "docs/facade-node-details.zip": "同上",
    "docs/fire-classification-report.pdf": "同上",
    "docs/wind-load-performance.pdf": "同上",
    "technical-documentation/MC%20catalogue.pdf":
        "同上；第三方目录册，本来就不该站外热链到自家页面上",
    "products/aluminum-wall-panels-2.webp":
        "products:aluminum-wall-panels 旧热链名，2026-10-06 hotlink→R2 迁移未覆盖该字段；页面实际不用它",
    "products/aluminum-wall-panels-3.webp": "同上",
    "products/aluminum-wall-panels-detail.webp": "同上",
    "products/aluminum-wall-panels-exterior.webp": "同上",
    "products/aluminum-wall-panels-interior.webp": "同上",
    "products/aluminum-wall-panels-main.webp": "同上",
}

# 内容哈希命名（末段带 -<6 位 hex> 后缀），换文件即换 URL，无需缓存键
HASHED = re.compile(r"-[0-9a-f]{6}\.(?:webp|png|jpe?g|mp4)$", re.I)

# 站内引用素材的表；整行所有文本字段都要扫，旧 URL 常常藏在 JSON 里
TABLES = ("products", "videos", "posts", "pages", "categories")

UA = HEADERS


def load_env():
    vals = {}
    for name in (".env", ".env.local"):
        p = os.path.join(ROOT, name)
        if not os.path.exists(p):
            continue
        for line in open(p, encoding="utf-8"):
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            vals.setdefault(k.strip().removeprefix("export ").strip(),
                            v.strip().strip('"').strip("'"))
    return vals


URL_RE = re.compile(r'https?://file\.meiyualuminum\.com/[^\s"\'<>\\)]+')


def from_dist():
    """已构建站点里出现的每个 CDN URL —— 这是访客真正会拿到的东西。

    连出处一起记：同一个死链在 dist HTML 里（买家看得见）还是只在 DB 的 JSON
    字段里（渲染不出来），两者的严重程度完全不同。
    """
    found = defaultdict(set)
    origin = defaultdict(set)
    root = os.path.join(ROOT, "dist", "client")
    if not os.path.isdir(root):
        return found, origin
    for dirpath, _dirs, files in os.walk(root):
        for f in files:
            if not f.endswith(".html"):
                continue
            rel = os.path.relpath(os.path.join(dirpath, f), root).replace("\\", "/")
            text = open(os.path.join(dirpath, f), encoding="utf-8",
                        errors="replace").read()
            for m in URL_RE.findall(text):
                path, q = url_parts(m)
                found[path].add(q)
                origin[path].add("页面:" + rel)
    return found, origin


def from_supabase(vals):
    """内容表里的 CDN URL。逐表独立重试，一张挂不牵连其余——但没读全就不能报通过。"""
    found = defaultdict(set)
    origin = defaultdict(set)
    failed = []
    base, key = vals.get("PUBLIC_SUPABASE_URL"), vals.get("PUBLIC_SUPABASE_ANON_KEY")
    if not (base and key):
        print("!! .env 缺 PUBLIC_SUPABASE_URL / ANON_KEY，跳过内容表（只扫了 dist）")
        return found, origin, False, [".env"]
    for table in TABLES:
        url = f"{base.rstrip('/')}/rest/v1/{table}?select=*"
        rows = None
        for i in range(4):
            if i:
                time.sleep(0.8 * i)
            req = urllib.request.Request(url, headers={
                "User-Agent": UA["User-Agent"], "apikey": key,
                "Authorization": f"Bearer {key}"})
            try:
                with urllib.request.urlopen(req, timeout=120) as r:
                    rows = json.load(r)
                break
            except Exception as e:
                last = e
        if rows is None:
            print(f"!! {table} 读取失败（已重试 4 次）：{str(last)[:70]}")
            failed.append(table)
            continue
        for row in rows:
            ident = str(row.get("slug") or row.get("name") or row.get("id") or "?")
            blob = json.dumps(row, ensure_ascii=False)
            for m in URL_RE.findall(blob):
                path, q = url_parts(m)
                found[path].add(q)
                origin[path].add(f"{table}:{ident}")
    return found, origin, not failed, failed


def url_parts(u):
    """-> (对象路径, query 去掉 ? 号)。片段 #t=0.1 不算缓存键的一部分。"""
    sp = urllib.parse.urlsplit(u.split("#")[0])
    return sp.path.lstrip("/"), sp.query


def head(path, query, attempts=4):
    """HEAD 永远不进缓存也不落边缘条目，只问源站要元数据。

    用线程内长连接：2026-11-08 首版每请求新建 TLS 连接，221 个对象就是 221 次
    握手，6 线程并发下成批报 SSL UNEXPECTED_EOF_WHILE_READING（93/221 是假异常）。
    长连接把握手降到每线程一次，既快又不给源站制造握手风暴。失败时必须关掉连接重建。
    把取不到当通过更糟：2026-10-29 那轮锚点审计就是因为把 403 归为“无问题”，
    报了“0 问题”的假通过。所以重试完仍取不到就是 UNREACHABLE，并且退出码 1。
    """
    target = "/" + urllib.parse.quote(path)
    if query:
        target += "?" + query
    conn = getattr(_tls, "conn", None)
    last = ""
    for i in range(attempts):
        try:
            if conn is None:
                conn = http.client.HTTPSConnection(CDN_HOST, timeout=40)
                _tls.conn = conn
            conn.request("HEAD", target, headers=HEADERS)
            r = conn.getresponse()
            status, etag = r.status, (r.getheader("ETag") or "").strip('"')
            size = int(r.getheader("Content-Length") or 0)
            lm = r.getheader("Last-Modified") or ""
            r.read()
            if status >= 400:
                # 4xx/5xx 是确定的答复，不重试
                return {"status": status, "etag": "", "size": 0, "last_modified": "",
                        "error": f"HTTP {status}" if status != 404 else "HTTP 404"}
            return {"status": status, "etag": etag, "size": size,
                    "last_modified": lm, "error": ""}
        except Exception as e:
            last = str(e)[:80]
            if conn is not None:
                try:
                    conn.close()
                except Exception:
                    pass
            conn = None
            _tls.conn = None
            time.sleep(0.3 * (i + 1))
    return {"status": 0, "etag": "", "size": 0, "last_modified": "", "error": last}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--update", action="store_true", help="把当前状态写回基线")
    ap.add_argument("--only", default="", help="只看路径含此子串的对象")
    ap.add_argument("--workers", type=int, default=6)
    ap.add_argument("--csv", default="")
    args = ap.parse_args()

    env = load_env()
    dist, dist_origin = from_dist()
    db, db_origin, db_ok, db_failed = from_supabase(env)

    refs = defaultdict(set)
    origins = defaultdict(set)
    for src, org in ((dist, dist_origin), (db, db_origin)):
        for path, queries in src.items():
            refs[path] |= queries
            origins[path] |= org.get(path, set())
    paths = sorted(p for p in refs if not args.only or args.only in p)

    print(f"引用点：dist HTML {len(dist)} 个对象，内容表 {len(db)} 个对象"
          f"{'（读取正常）' if db_ok else '（' + ','.join(db_failed) + ' 未读到，本轮不完整）'}")
    print(f"待核对象：{len(paths)} 个\n")
    if not paths:
        print("没有可比对象 —— dist 不存在或 --only 过窄，闸门拒绝判过。")
        return 1
    if not db_ok:
        # 覆盖不完整时不写基线，否则会把“没看到”固化成“不存在”
        print("内容表未读全：本轮只用于查看，--update 拒绝写入基线。\n")

    prev = {}
    if os.path.exists(MANIFEST):
        prev = json.load(open(MANIFEST, encoding="utf-8")).get("objects", {})

    with ThreadPoolExecutor(max_workers=args.workers) as ex:
        got = list(ex.map(
            lambda p: (p, head(p, sorted(refs[p])[-1] if refs[p] else "")),
            paths))

    # 主轮没测通的，串行补一轮（并发引发的 TLS 问题在串行下不会重现）
    retry = [i for i, (p, r) in enumerate(got) if r["error"] and r["status"] != 404]
    if retry:
        print(f"主轮 {len(retry)} 个没测通，串行补测中…\n")
        for i in retry:
            p = got[i][0]
            got[i] = (p, head(p, sorted(refs[p])[-1] if refs[p] else ""))

    cur, fails, rows = {}, [], []
    for path, res in got:
        queries = sorted(refs[path])
        key_state = "无 ?v=" if queries == [""] else " / ".join(q for q in queries if q) or "无 ?v="
        hashed = bool(HASHED.search(path))
        entry = {"etag": res["etag"], "size": res["size"], "last_modified": res["last_modified"],
                 "cache_keys": queries, "busted": queries != [""], "hashed_name": hashed}
        cur[path] = entry
        old = prev.get(path)

        if res["error"]:
            kind = "MISSING" if res["status"] == 404 else "UNREACHABLE"
            # 出处决定严重程度：写在页面 HTML 里的是买家看得见的死链，
            # 只在 DB 字段里的是陈旧数据，两者都要报，但不能当成一回事。
            src = ", ".join(sorted(origins[path])[:3]) or "出处未知"
            if kind == "MISSING" and path in ALLOW:
                # 例外只豁免死链，不豁免“字节变了没抬键”和“闸门自己没测通”
                rows.append(("MISSING-ALLOWED", path, key_state,
                             f"{res['error']} ←出自 {src}"))
            else:
                fails.append((kind, path, key_state, f"{res['error']}  ←出自 {src}"))
        elif old is None:
            rows.append(("NEW", path, key_state, f"{res['size']:,} B"))
        elif old.get("etag") and res["etag"] and old["etag"] != res["etag"]:
            if old.get("cache_keys") == queries and not hashed:
                fails.append(("CHANGED-STALEKEY", path, key_state,
                              f"ETag {old['etag'][:12]}… -> {res['etag'][:12]}…，"
                              f"字节 {old.get('size', 0):,} -> {res['size']:,}"
                              f"（边缘 TTL 一年，访客还会看到旧文件）"))
            else:
                why = "内容哈希命名，URL 已随之更换" if hashed else "查询串已变，键确实抬了"
                rows.append(("CHANGED-BUSTED", path, key_state, f"字节变化已抬键：{why}"))
        elif old.get("size") != res["size"]:
            fails.append(("SIZE-DRIFT", path, key_state,
                          f"{old.get('size', 0):,} B -> {res['size']:,} B 而 ETag 没变"))

    n_ok = sum(1 for _p, r in got if not r["error"])
    n_new = len([r for r in rows if r[0] == "NEW"])
    print(f"合计核对 {len(paths)} 个：取到元数据 {n_ok} / 异常 {len(fails)} / 基线外新出现 {n_new}\n")

    for kind, path, ks, note in rows:
        print(f"  [{kind:>14}] {path[:60]:60} {ks[:18]:18} {note[:70]}")
    if fails:
        print("\n失败项：")
        for kind, path, ks, note in fails:
            print(f"  [{kind:>17}] {path[:52]:52} {ks[:14]:14} {note[:96]}")
        print("\n处置：")
        print("  CHANGED-STALEKEY —— 在 src/lib/mediaVersions.ts 里把该对象（或其所在目录）")
        print("                     的版本值抬一次，重新构建部署；或改用 r2-image-pipeline.py")
        print("                     的哈希命名，让换图必然换 URL。")
        print("  MISSING          —— 引用悬空，确认是改名还是误删，再更新引用或 --update 收新条目。")
        print("                     已收录在 ALLOW 里的只报告不阻塞，但那些字段该清库。")
        print("  UNREACHABLE      —— 闸门本身没测到，修网络/权限后重跑，别当通过。")
    else:
        print("\n闸门通过：没有任何对象在缓存键未变的情况下换过字节。")

    if args.csv:
        with open(os.path.join(ROOT, args.csv), "w", newline="", encoding="utf-8-sig") as fh:
            w = csv.writer(fh)
            w.writerow(["path", "cache_keys", "hashed_name", "size", "etag", "last_modified",
                        "verdict", "note"])
            for kind, path, ks, note in fails:
                w.writerow([path, ks, cur[path]["hashed_name"], cur[path]["size"],
                            cur[path]["etag"], cur[path]["last_modified"], kind, note])
            for r in rows:
                w.writerow([r[1], r[2], cur[r[1]]["hashed_name"], cur[r[1]]["size"],
                            cur[r[1]]["etag"], cur[r[1]]["last_modified"], r[0], r[3]])
        print(f"CSV 已写出：{args.csv}")

    if args.update:
        if not db_ok:
            print("\n--update 已取消：覆盖不完整，写基线会把没看到的引用固化成不存在。")
        else:
            # 取不到的项不进基线：基线里留一个空 ETag，下轮 old.etag 为假值就会
            # 跳过比对——等于给那个对象开了免检通道，正是本闸门存在的理由反例。
            objects = {p: e for p, e in cur.items() if e["etag"]}
            dropped = len(cur) - len(objects)
            nokey = [p for p, e in objects.items()
                     if not e["busted"] and not e["hashed_name"]]
            json.dump({"generated_note":
                       "docs/media-manifest.py --update 生成；比对用基线，勿手改",
                       "cdn": CDN, "objects": objects},
                      open(MANIFEST, "w", encoding="utf-8"), indent=1, sort_keys=True)
            print(f"\n基线已写入 {os.path.relpath(MANIFEST, ROOT)}（{len(objects)} 个对象，"
                  f"本轮未取到的 {dropped} 个已排除，不会被当成免检）。"
                  f"\n其中固定文件名且不带缓存键的有 {len(nokey)} 个 —— "
                  f"这些换文件而没抬键时，就是本闸门报警的对象。")

    # 内容表没读全 = 本轮覆盖不完整，哪怕所有对象都取到了也不能算过
    return 1 if (fails or not db_ok) else 0


if __name__ == "__main__":
    sys.exit(main())
