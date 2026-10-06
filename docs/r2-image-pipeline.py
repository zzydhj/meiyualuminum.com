#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
MEIYU R2 图片资产流水线 · pipeline-core v1.1
════════════════════════════════════════════════════════════════════
用途：下载参考图 → 语义命名(+内容哈希) → 去重上传 Cloudflare R2 → 返回最终公开 URL，
      并在上传校验通过后自动清理本地临时文件。

配套文档：docs/r2-setup.md（首次配置 / 令牌获取）
          docs/blog-prompt-v5.md 附录 B、docs/Project-Promotion-V5.8.md 附录 B（同源）

依赖：Python 3.9+ 与 boto3          安装： pip install boto3
密钥（优先级从高到低，三个来源均已被 .gitignore 忽略）：
      1) 环境变量 R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY
      2) 项目根 .env 或 .env.local
      3) docs/r2-credentials.env（随 docs/ 文件夹拷走 → 新电脑/新项目零配置直接跑）
      —— 脚本不打印密钥、不把密钥写进任何输出文件/交付页/SQL。
非机密配置（account_id / endpoint / 桶名 / 公开域）已写死在下方，换电脑无需修改。

常用命令（在项目根目录执行）：
  python docs/r2-image-pipeline.py --check
      连通性自检：Python/boto3/密钥/桶可达/公开域可达

  python docs/r2-image-pipeline.py --plan plan.json --stage download
      P1 仅下载：把清单里的图抓到 .tmp-img/，输出本地路径清单（供 vision 逐张核对）

  python docs/r2-image-pipeline.py --plan plan.json --stage upload
      P3–P4 上传：按清单命名(主题/语义名/哈希) → HEAD 去重 → 上传 → 公开 URL 200 校验
      → 校验通过即删除该临时文件；全部完成后清理空的 .tmp-img/

  python docs/r2-image-pipeline.py --plan plan.json
      一次跑完 download+upload（不需要 vision 核对时用）

  python docs/r2-image-pipeline.py --url <图片URL> --topic metal-ceiling --semantic tree-of-life-hero
  python docs/r2-image-pipeline.py --file .tmp-img/a.jpg --topic projects --semantic site-install
      单图模式

  python docs/r2-image-pipeline.py --stats
      桶内统计：各主题文件夹对象数 + general 里高频语义名前缀（供决定是否新增主题）

  python docs/r2-image-pipeline.py --cleanup
      强制清理 .tmp-img/

  通用开关：--keep-tmp 保留临时目录不清理   --out result.json 另存映射结果

路径说明：.tmp-img/ 与 docs/r2-credentials.env 均按仓库根定位（不受当前工作目录影响）；
          但 --plan / --file / --out 传的是你自己给的路径，按当前工作目录解析。

plan.json 格式（数组，topic 非法值自动落 general，semantic 会被自动清洗）：
  [
    {"src": "https://ref-site.com/a.jpg", "topic": "metal-ceiling", "semantic": "tree-of-life-hero"},
    {"src": "https://ref-site.com/b.jpg", "topic": "projects",       "semantic": "trial-assembly"}
  ]
"""

from __future__ import annotations

import argparse
import glob
import hashlib
import json
import os
import re
import shutil
import sys
import time
import urllib.request
from urllib.parse import quote

# ══ 非机密配置（换电脑零配置）═══════════════════════════════════════
R2_ACCOUNT_ID = "c58d6530184ba13658bd5a73cf611ff6"
R2_ENDPOINT = f"https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com"
R2_BUCKET = "meiyu"
R2_PUBLIC_BASE = "https://file.meiyualuminum.com/"
KEY_PREFIX = "blog"
REGION = "auto"

# 有界主题闭集（恒定不增长；新增主题须由用户升提示词版本）
TOPICS = (
    "acoustic-ceiling", "metal-ceiling", "other-ceiling", "facade-cladding",
    "metal-panel", "wall-panel", "ceiling-grid-baffle", "projects", "general",
)
FALLBACK_TOPIC = "general"
# 竞品品牌词：从语义名中删除（与提示词 denylist 同步）
BRAND_DENY = ("prance", "lifisher", "autopartsfirst")

USER_AGENT = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
              "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36")

# 路径一律锚定仓库根：脚本在 docs/ 下 → 取上一级；也兼容直接放根目录。
# 这样从任意工作目录调用，临时文件与密钥文件的位置都一致（不依赖 CWD）。
_HERE = os.path.dirname(os.path.abspath(__file__))
_ROOT = os.path.dirname(_HERE) if os.path.basename(_HERE) == "docs" else _HERE
TMP_DIR = os.path.join(_ROOT, ".tmp-img")

MIN_BYTES = 1024          # 小于此值视为下载失败（占位图/错误页）
SEMANTIC_MAX_TOKENS = 5
CORE_VERSION = "pipeline-core v1.1"

CT = {"jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png",
      "gif": "image/gif", "webp": "image/webp", "svg": "image/svg+xml",
      "ico": "image/x-icon", "avif": "image/avif"}


# ── 项目根定位 ──────────────────────────────────────────────────────
def project_root() -> str:
    return _ROOT


# ── 密钥读取：环境变量 > 项目根 .env / .env.local > docs/r2-credentials.env ──
# 第三个来源是为了「把 docs/ 整个文件夹拷到新电脑/新项目就能直接跑」；
# 该文件已被 .gitignore 忽略 → 不进仓库、不进提示词、不会被粘贴给第三方 AI。
CREDS_FILE = os.path.join(_HERE, "r2-credentials.env")


def read_env_file(path: str) -> dict:
    """读 KEY=VALUE 格式的配置文件，容错注释/空行/引号/export 前缀。"""
    out = {}
    if not os.path.exists(path):
        return out
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            out[k.strip().removeprefix("export ").strip()] = v.strip().strip('"').strip("'")
    return out


def creds_sources():
    """按优先级返回待读的配置文件（存在的才返回）。"""
    root = project_root()
    for p in (os.path.join(root, ".env"), os.path.join(root, ".env.local"), CREDS_FILE):
        if os.path.exists(p):
            yield p


def load_creds(quiet: bool = False):
    ak = os.environ.get("R2_ACCESS_KEY_ID") or ""
    sk = os.environ.get("R2_SECRET_ACCESS_KEY") or ""
    if not (ak and sk):
        for path in creds_sources():
            vals = read_env_file(path)
            ak = ak or vals.get("R2_ACCESS_KEY_ID", "")
            sk = sk or vals.get("R2_SECRET_ACCESS_KEY", "")
            if ak and sk:
                break
    if not (ak and sk):
        if not quiet:
            print("[!] 缺少 R2 密钥。三选一：环境变量 R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY；"
                  "项目根 .env 写这两行；或拷入 docs/r2-credentials.env（见 docs/r2-setup.md）。")
        return None, None
    return ak, sk


def make_client():
    try:
        import boto3
    except ImportError:
        raise SystemExit("[!] 未安装 boto3 → 先执行： pip install boto3")
    ak, sk = load_creds()
    if not ak:
        raise SystemExit(1)
    return boto3.client("s3", endpoint_url=R2_ENDPOINT, aws_access_key_id=ak,
                        aws_secret_access_key=sk, region_name=REGION)


# ── 图片类型嗅探（Python 3.13 已移除 imghdr，故用魔数判断）──────────
def sniff_ext(data: bytes) -> str:
    if data[:3] == b"\xff\xd8\xff":
        return "jpg"
    if data[:8] == b"\x89PNG\r\n\x1a\n":
        return "png"
    if data[:6] in (b"GIF87a", b"GIF89a"):
        return "gif"
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "webp"
    if data[:4] == b"\x00\x00\x01\x00":
        return "ico"
    if data[4:8] == b"ftyp":
        return "avif"
    return "jpg"


# ── 命名规则（与提示词 P3 完全一致）═════════════════════════════════
def sanitize_semantic(raw: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", (raw or "").lower()).strip("-")
    for brand in BRAND_DENY:
        s = s.replace(brand, "")
    s = re.sub(r"-{2,}", "-", s).strip("-")
    s = "-".join(s.split("-")[:SEMANTIC_MAX_TOKENS])
    return (s or "image")[:60]


def topic_of(raw: str) -> str:
    t = (raw or "").strip().lower()
    return t if t in TOPICS else FALLBACK_TOPIC


def build_key(topic: str, semantic: str, data: bytes) -> str:
    digest = hashlib.sha1(data).hexdigest()[:6]
    return f"{KEY_PREFIX}/{topic_of(topic)}/{sanitize_semantic(semantic)}-{digest}.{sniff_ext(data)}"


def public_url(key: str) -> str:
    # 逐段百分号编码（保留 /）：桶里可能存在带空格 / 中文的旧对象，
    # 不编码会让 urllib 报 "URL can't contain control characters"。
    # 本流水线自己生成的 key 均为 [a-z0-9-/.] → quote 为无害的 no-op。
    return R2_PUBLIC_BASE + quote(key, safe="/")


def tmp_stem(src: str) -> str:
    return hashlib.sha1(src.encode("utf-8")).hexdigest()[:12]


# ── 下载（带浏览器 UA + 重试；默认 UA 会被参考站 403）════════════════
def download(url: str, retries: int = 3, timeout: int = 45) -> bytes:
    if url.startswith("//"):
        url = "https:" + url
    last = None
    for i in range(retries):
        try:
            req = urllib.request.Request(url, headers={
                "User-Agent": USER_AGENT,
                "Referer": url,
                "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
            })
            with urllib.request.urlopen(req, timeout=timeout) as r:
                data = r.read()
            if len(data) >= MIN_BYTES:
                return data
            last = RuntimeError(f"响应过小 {len(data)} bytes（疑似占位图/错误页）")
        except Exception as e:            # noqa: BLE001
            last = e
        time.sleep(1.5 * (i + 1))
    raise RuntimeError(f"下载失败：{url} → {last}")


def save_tmp(data: bytes, src: str) -> str:
    os.makedirs(TMP_DIR, exist_ok=True)
    path = os.path.join(TMP_DIR, f"{tmp_stem(src)}.{sniff_ext(data)}")
    with open(path, "wb") as f:
        f.write(data)
    return path


def find_tmp(src: str):
    hits = sorted(glob.glob(os.path.join(TMP_DIR, tmp_stem(src) + ".*")))
    return hits[0] if hits else None


# ── R2 操作：HEAD 去重 / 上传 / 公开校验 ═════════════════════════════
def head_exists(cli, key: str) -> bool:
    from botocore.exceptions import ClientError
    try:
        cli.head_object(Bucket=R2_BUCKET, Key=key)
        return True
    except ClientError as e:
        if e.response.get("Error", {}).get("Code") in ("404", "NoSuchKey", "NotFound"):
            return False
        raise


def put_object(cli, key: str, data: bytes, retries: int = 3) -> None:
    ext = key.rsplit(".", 1)[-1].lower()
    last = None
    for i in range(retries):
        try:
            cli.put_object(Bucket=R2_BUCKET, Key=key, Body=data,
                           ContentType=CT.get(ext, "application/octet-stream"))
            return
        except Exception as e:            # noqa: BLE001
            last = e
            time.sleep(1.5 * (i + 1))
    raise RuntimeError(f"上传失败：{key} → {last}")


def verify_public(url: str, retries: int = 2):
    """返回 (HTTP 状态码, Content-Type)。
    HTTPError（404 / 403 等）也是有效应答 → 返回其状态码（说明域可达）；
    只有网络层失败（DNS / 超时 / 连接拒绝）才返回 (None, 原因)。
    部分域不支持 HEAD → 自动改用带 Range 的 GET 重试。"""
    from urllib.error import HTTPError
    last = None
    for _ in range(retries + 1):
        for method in ("HEAD", "GET"):
            headers = {"User-Agent": USER_AGENT}
            if method == "GET":
                headers["Range"] = "bytes=0-0"
            try:
                with urllib.request.urlopen(
                        urllib.request.Request(url, method=method, headers=headers),
                        timeout=30) as r:
                    return r.status, r.headers.get("Content-Type", "")
            except HTTPError as e:
                if method == "HEAD" and e.code in (403, 405, 501):
                    continue                      # 换 GET 再试一次
                ct = e.headers.get("Content-Type", "") if e.headers else ""
                return e.code, ct
            except Exception as e:                # noqa: BLE001
                last = e
        time.sleep(2)
    return None, f"校验失败：{last}"


def cleanup_tmp(force: bool = False) -> None:
    if not os.path.isdir(TMP_DIR):
        return
    if force or not os.listdir(TMP_DIR):
        shutil.rmtree(TMP_DIR, ignore_errors=True)
        print(f"[i] 已清理临时目录 {TMP_DIR}/")


# ── 单张处理 ════════════════════════════════════════════════════════
def process(cli, item: dict, keep_tmp: bool = False) -> dict:
    src = (item.get("src") or item.get("url") or "").strip()
    local = (item.get("local") or item.get("file") or "").strip()
    topic = topic_of(item.get("topic", ""))
    semantic = item.get("semantic") or item.get("name") or "image"
    out = {"src": src or local, "topic_requested": item.get("topic", ""),
           "topic": topic, "semantic_raw": semantic}
    try:
        data = None
        if local and os.path.exists(local):
            with open(local, "rb") as f:
                data = f.read()
            out["local"] = local
        elif src:
            cached = find_tmp(src)
            if cached:
                with open(cached, "rb") as f:
                    data = f.read()
                out["local"] = cached
            else:
                data = download(src)
                out["local"] = save_tmp(data, src)
        else:
            raise RuntimeError("缺少 src / local")

        key = build_key(topic, semantic, data)
        out.update({"key": key, "url": public_url(key), "bytes": len(data),
                    "sha1_6": hashlib.sha1(data).hexdigest()[:6]})

        if head_exists(cli, key):
            out["status"] = "reused"      # 已存在同 key（同内容）→ 直接复用 URL，不重传
        else:
            put_object(cli, key, data)
            out["status"] = "uploaded"

        code, ct = verify_public(out["url"])
        out["public_check"] = f"{code} {ct}".strip()
        if code != 200:
            out["status"] = "verify-failed"
            return out

        if not keep_tmp and out.get("local") and os.path.exists(out["local"]):
            os.remove(out["local"])       # 校验通过 → 清理本地副本
            out["cleaned"] = True
        return out
    except Exception as e:                # noqa: BLE001
        out.update({"status": "failed", "error": str(e)})
        return out


# ── 自检 / 统计 ═════════════════════════════════════════════════════
def do_check() -> int:
    print(f"[i] {CORE_VERSION}")
    print(f"    python   {sys.version.split()[0]}")
    try:
        import boto3
        print(f"    boto3    {boto3.__version__}")
    except ImportError:
        print("    boto3    未安装 → pip install boto3")
        return 1
    ak, sk = load_creds(quiet=True)
    print(f"    密钥     {'已找到（不显示内容）' if ak else '缺失 → 见 docs/r2-setup.md'}")
    print(f"    endpoint {R2_ENDPOINT}")
    print(f"    bucket   {R2_BUCKET}   prefix {KEY_PREFIX}/   domain {R2_PUBLIC_BASE}")
    if not ak:
        return 1
    cli = make_client()
    sample = ""
    try:
        r = cli.list_objects_v2(Bucket=R2_BUCKET, Prefix=KEY_PREFIX + "/", MaxKeys=1)
        contents = r.get("Contents") or []
        sample = contents[0]["Key"] if contents else ""
        print(f"    桶可达   OK（{KEY_PREFIX}/ 下示例 key: {sample or '(暂无对象)'}）")
    except Exception as e:                # noqa: BLE001
        print(f"    桶可达   FAIL → {e}")
        return 1
    # 公开读校验：优先用一个真实存在的对象（桶根目录无 index，404 属正常，不能当失败）
    probe = public_url(sample) if sample else R2_PUBLIC_BASE
    code, ct = verify_public(probe)
    ok = (code == 200) if sample else (code in (200, 403, 404))
    print(f"    公开读   {'OK' if ok else 'FAIL'}（HTTP {code} {ct}）")
    if not ok:
        print("             ↳ 对象已存在但公开读失败：检查桶的公开访问 / 自定义域 CNAME"
              "（docs/r2-setup.md §7）")
        return 1
    return 0


def do_stats() -> int:
    cli = make_client()
    token, keys = None, []
    while True:
        kw = {"Bucket": R2_BUCKET, "Prefix": KEY_PREFIX + "/", "MaxKeys": 1000}
        if token:
            kw["ContinuationToken"] = token
        r = cli.list_objects_v2(**kw)
        keys += [o["Key"] for o in r.get("Contents", [])]
        if not r.get("IsTruncated"):
            break
        token = r.get("NextContinuationToken")
    per_topic = {}
    for k in keys:
        parts = k.split("/")
        t = parts[1] if len(parts) > 2 else "(root)"
        per_topic[t] = per_topic.get(t, 0) + 1
    print(f"[i] {KEY_PREFIX}/ 下共 {len(keys)} 个对象")
    for t in TOPICS:
        if per_topic.get(t):
            print(f"    {t:<22} {per_topic[t]}")
    for t, n in sorted(per_topic.items()):
        if t not in TOPICS:
            print(f"    {t:<22} {n}   ← 非闭集主题，请核查")
    prefixes = {}
    for k in keys:
        parts = k.split("/")
        if len(parts) > 2 and parts[1] == FALLBACK_TOPIC:
            stem = re.sub(r"-[0-9a-f]{6}\.\w+$", "", parts[-1])
            head = stem.split("-")[0]
            prefixes[head] = prefixes.get(head, 0) + 1
    if prefixes:
        print(f"[i] general 高频语义前缀（Top 15，供决定是否新增主题）：")
        for p, n in sorted(prefixes.items(), key=lambda x: -x[1])[:15]:
            print(f"    {p:<28} {n}")
    return 0


# ── CLI ═════════════════════════════════════════════════════════════
def main() -> int:
    ap = argparse.ArgumentParser(description="MEIYU R2 图片资产流水线")
    ap.add_argument("--check", action="store_true", help="连通性自检")
    ap.add_argument("--stats", action="store_true", help="桶内统计 + general 高频前缀")
    ap.add_argument("--cleanup", action="store_true", help="强制清理 .tmp-img/")
    ap.add_argument("--plan", help="批量清单 JSON 文件路径")
    ap.add_argument("--stage", choices=("download", "upload", "all"), default="all")
    ap.add_argument("--url", help="单图：源图片 URL")
    ap.add_argument("--file", help="单图：本地文件路径")
    ap.add_argument("--topic", default="general", help="主题文件夹（九选一，非法落 general）")
    ap.add_argument("--semantic", default="image", help="语义名（2~5 连字符关键词）")
    ap.add_argument("--keep-tmp", action="store_true", help="保留临时文件不清理")
    ap.add_argument("--out", help="把结果 JSON 另存到该路径")
    a = ap.parse_args()

    if a.cleanup:
        cleanup_tmp(force=True)
        return 0
    if a.check:
        return do_check()
    if a.stats:
        return do_stats()

    items = []
    if a.plan:
        with open(a.plan, encoding="utf-8") as f:
            raw = json.load(f)
        items = raw if isinstance(raw, list) else raw.get("items", [])
    if a.url or a.file:
        items.append({"src": a.url or "", "local": a.file or "",
                      "topic": a.topic, "semantic": a.semantic})
    if not items:
        ap.print_help()
        return 2

    # stage=download：只抓到 .tmp-img/ 并输出本地路径（供 vision 逐张核对）
    if a.stage == "download":
        res = []
        for it in items:
            src = (it.get("src") or "").strip()
            row = {"src": src, "topic": topic_of(it.get("topic", "")),
                   "semantic": sanitize_semantic(it.get("semantic", ""))}
            try:
                local = it.get("local") if it.get("local") and os.path.exists(it["local"]) \
                    else save_tmp(download(src), src)
                row.update({"local": local, "status": "downloaded",
                            "bytes": os.path.getsize(local)})
            except Exception as e:        # noqa: BLE001
                row.update({"status": "failed", "error": str(e)})
            res.append(row)
        _emit(res, a.out)
        return 0 if all(r["status"] == "downloaded" for r in res) else 1

    cli = make_client()
    results = [process(cli, it, keep_tmp=a.keep_tmp) for it in items]
    _emit(results, a.out)
    cleanup_tmp(force=bool(a.keep_tmp is False and a.stage == "all"))
    bad = [r for r in results if r["status"] in ("failed", "verify-failed")]
    ok = len(results) - len(bad)
    reused = sum(1 for r in results if r["status"] == "reused")
    print(f"[i] 完成：成功 {ok}/{len(results)}（其中复用 {reused}），失败 {len(bad)}")
    return 1 if bad else 0


def _emit(results: list, out_path: str | None) -> None:
    text = json.dumps(results, ensure_ascii=False, indent=2)
    print(text)
    if out_path:
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(text)
        print(f"[i] 结果已写入 {out_path}")


if __name__ == "__main__":
    sys.exit(main())
