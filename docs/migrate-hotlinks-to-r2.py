#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
MEIYU 竞品热链迁移工具 · hotlink-migrator v1.0
════════════════════════════════════════════════════════════════════
用途：把已发布文章里指向第三方域名（默认 prancebuilding.com）的图片，批量搬到自家 R2，
      并生成可直接在 Supabase SQL Editor 运行的 UPDATE 脚本 + 新旧 URL 映射表。

设计原则：
  · 本工具**只用 anon key 读数据库**，绝不写库；改库由用户执行生成的 .sql（可控、可回滚、有留档）。
  · 下载 / 命名 / 去重上传 / 公开校验 / 清理 全部复用 docs/r2-image-pipeline.py（pipeline-core v1.1），
    不重复实现第二套规则。
  · 旧对象**不自动删除**：必须等 SQL 执行并核对页面无裂图后，再由用户确认后单独清理。

依赖：boto3；密钥与站点配置读取优先级：环境变量 > 项目根 .env / .env.local > docs/r2-credentials.env
      （R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / PUBLIC_SUPABASE_URL / PUBLIC_SUPABASE_ANON_KEY）
      —— 三个来源均已被 .gitignore 忽略；本脚本不打印、不写入任何输出文件。

阶段（--stage）：
  plan      只生成迁移清单 .tmp-migrate/plan.json（含推导的主题与语义名），不下载
  download  按清单下载到 .tmp-migrate/（供 vision 核对主题与命名；可手改 plan.json 后重跑 upload）
  upload    上传 R2（HEAD 去重 + 公开校验 200）→ 写回 plan.json 的 new_url，并删除本地副本
  sql       由 plan.json 生成 docs/sql/<日期>-hotlink-to-r2.sql 与 .mapping.csv
  all       plan → download → upload → sql

常用：
  python docs/migrate-hotlinks-to-r2.py --stage plan          # 先看清单与命名是否合理
  python docs/migrate-hotlinks-to-r2.py --stage download      # 下载，逐张 vision 核对主题
  python docs/migrate-hotlinks-to-r2.py --stage upload        # 上传（此时以 plan.json 为准）
  python docs/migrate-hotlinks-to-r2.py --stage sql           # 出 SQL 与映射表
  python docs/migrate-hotlinks-to-r2.py --domain example.com  # 迁移其它竞品域名
  python docs/migrate-hotlinks-to-r2.py --verify              # 只读校验：库里还剩多少竞品引用
  python docs/migrate-hotlinks-to-r2.py --stage all --allow-partial
      部分图下载/上传失败（如源站 404）时，仍为已成功部分出 SQL；
      失败项会在 SQL 头部注释里逐条列为 TODO（需人工补图或删该图位）。

幂等：download / upload 均会跳过已成功的条目（以 plan.json 的 new_url 为准），可反复重跑；
      重跑 --stage plan 时，上一轮已上传成功的条目会**沿用原 key / URL / 命名**（不因为
      语义名推导规则微调而改名 → 不产生重复对象、不让已出的 SQL 失效）；
      确需按最新命名规则重传时加 --fresh（旧对象会变成孤儿，需事后单独清理）。
"""

from __future__ import annotations

import argparse
import csv
import datetime as _dt
import importlib.util
import json
import os
import re
import sys
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE) if os.path.basename(HERE) == "docs" else HERE
# 全部锚定仓库根，保证从任意工作目录调用行为一致
MIG_DIR = os.path.join(ROOT, ".tmp-migrate")
PLAN_FILE = os.path.join(MIG_DIR, "plan.json")
SQL_DIR = os.path.join(ROOT, "docs", "sql")
DEFAULT_DOMAIN = "prancebuilding.com"

# ── 复用 pipeline-core（文件名带连字符，用 importlib 载入）──────────────
_spec = importlib.util.spec_from_file_location(
    "r2core", os.path.join(HERE, "r2-image-pipeline.py"))
core = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(core)


# ── .env 读取（Supabase 两项；R2 两项由 core 自己读）───────────────────
def load_env() -> dict:
    """环境变量优先；其次项目根 .env / .env.local；最后 docs/r2-credentials.env。
    后两个路径由 core.creds_sources() 统一给出，保证两个脚本行为一致。"""
    env = dict(os.environ)
    for path in core.creds_sources():
        for k, v in core.read_env_file(path).items():
            env.setdefault(k, v)
    return env


def sb_get(env: dict, path: str):
    url = env.get("PUBLIC_SUPABASE_URL")
    key = env.get("PUBLIC_SUPABASE_ANON_KEY")
    if not (url and key):
        raise SystemExit("[!] 缺 PUBLIC_SUPABASE_URL / PUBLIC_SUPABASE_ANON_KEY（见 docs/r2-setup.md）")
    req = urllib.request.Request(
        url.rstrip("/") + "/rest/v1/" + path,
        headers={"apikey": key, "Authorization": "Bearer " + key})
    with urllib.request.urlopen(req, timeout=90) as r:
        return json.load(r)


# ── 命名与主题推导 ══════════════════════════════════════════════════
# 语义名前缀：优先用人工校准过的短前缀（≤4 段，加序号后 ≤5 段，符合命名规范）；
# 未收录的文章自动退化为 slug 前 4 段。
POST_PREFIX = {
    7: "beijing-airport-baffle",
    8: "hk-airport-honeycomb",
    9: "changi-perforated-panel",
    10: "istanbul-airport-ceiling",
    11: "dubai-emaar-ceiling",
    12: "haikou-hongyuan-ceiling",
    13: "haikou-dutyfree-ceiling",
    14: "shenzhen-mixc-panel",
    15: "shenzhen-oppo-facade",
    16: "baghdad-facade",
    17: "humid-metal-ceiling",
}
# 主题：按提示词「主题判定顺序」逐篇判定（材质/产品族 → 功能 → 项目语境）
POST_TOPIC = {
    7: "ceiling-grid-baffle",   # 曲面挡板（baffle）
    8: "wall-panel",            # 蜂窝铝板墙面 + 挡板天花，以墙面为主
    9: "acoustic-ceiling",      # 穿孔铝板（穿孔/吸音功能优先）
    10: "metal-ceiling",
    11: "metal-ceiling",
    12: "metal-ceiling",
    13: "metal-ceiling",
    14: "metal-panel",          # 三角长城板
    15: "facade-cladding",      # 总部大楼外立面
    16: "facade-cladding",
    17: "metal-ceiling",        # 文件名均为 metal drop/suspended ceiling、无穿孔吸音特征 → 不归 acoustic
    18: "projects",             # Tree of Life：CAD/试装/生产/渲染等制造过程记录
}
# Tree of Life 14 张沿用已校准的阶段化命名（比纯序号更有信息量）
POST18_NAMES = {
    "1776398251183-01.jpg": "tree-of-life-hero",
    "1776398165655-canada-golf-club-tree-of-life-clients-design.jpg": "tree-of-life-clients-design",
    "1776407555829-tree-of-life.jpg": "tree-of-life-model-gray",
    "1778050401120-tree-of-life-5.jpg": "tree-of-life-model-color",
    "1776398168212-1.jpg": "tree-of-life-cad-1",
    "1776398168631-2.jpg": "tree-of-life-cad-2",
    "1776398167512-tree-of-life-project-trial-assembly-1.jpg": "tree-of-life-trial-1",
    "1776398167757-tree-of-life-project-trial-assembly-2.jpg": "tree-of-life-trial-2",
    "1776398165389-canada-golf-club-tree-of-life-production-2.jpg": "tree-of-life-coating",
    "1776398165098-canada-golf-club-tree-of-life-production-1.jpg": "tree-of-life-wrapping",
    "1776398166172-tree-of-life-project-renderings-1.jpg": "tree-of-life-render-1",
    "1776398166439-tree-of-life-project-renderings-2.jpg": "tree-of-life-render-2",
    "1776398166713-tree-of-life-project-renderings-3.jpg": "tree-of-life-render-3",
    "1776398167262-tree-of-life-project-renderings-5.jpg": "tree-of-life-render-5",
}
SLUG_STOP = {"the", "a", "an", "and", "or", "of", "in", "for", "vs", "how", "to",
             "guide", "project", "projects", "aluminum", "metal"}


def derive_prefix(slug: str) -> str:
    toks = [t for t in re.split(r"[^a-z0-9]+", (slug or "").lower()) if t]
    keep = [t for t in toks if t not in SLUG_STOP][:4]
    return "-".join(keep) or "image"


def semantic_for(post_id: int, slug: str, filename: str, order: int) -> str:
    if post_id == 18 and filename in POST18_NAMES:   # Tree of Life：用阶段化语义名
        return POST18_NAMES[filename]
    prefix = POST_PREFIX.get(post_id) or derive_prefix(slug)
    return core.sanitize_semantic(f"{prefix}-{order}")


def topic_for(post_id: int) -> str:
    return core.topic_of(POST_TOPIC.get(post_id, "projects"))


# ── 清单收集 ════════════════════════════════════════════════════════
def collect(env: dict, domain: str) -> list:
    posts = sb_get(env, "posts?select=id,slug,primary_tag,image_url,content&order=id.asc")
    pat = re.compile("https?://[^" + chr(34) + chr(39) + r"\s<>)]+")
    img = re.compile(r"\.(jpg|jpeg|png|webp|gif)", re.I)
    items, seen = [], set()
    for p in posts:
        blob = (p.get("content") or "") + " " + (p.get("image_url") or "")
        hits = [u for u in pat.findall(blob) if domain in u and img.search(u)]
        if not hits:
            continue
        order = 0
        for u in hits:
            order += 1
            if u in seen:                      # 同一 URL 多篇/多处复用 → 只上传一次
                for it in items:
                    if it["src"] == u:
                        if p["id"] not in it["post_ids"]:   # 同篇多处（正文 + image_url）只记一次
                            it["post_ids"].append(p["id"])
                        it["refs"] += 1
                        break
                continue
            seen.add(u)
            fn = u.rsplit("/", 1)[-1]
            items.append({
                "post_ids": [p["id"]], "slug": p["slug"], "refs": 1, "order": order,
                "src": u, "filename": fn,
                "topic": topic_for(p["id"]),
                "semantic": semantic_for(p["id"], p["slug"], fn, order),
                "local": "", "new_key": "", "new_url": "", "status": "planned",
            })
    return items


def carry_over(items: list) -> int:
    """沿用上一轮 plan.json 里已上传成功的结果（按 src 匹配）。
    不这么做的话：重跑 --stage plan 一旦语义名推导发生变化，就会把已上传的图
    换成新 key 重传 → 桶里多出一批孤儿对象，且已生成的 SQL 与新 plan 不一致。"""
    if not os.path.exists(PLAN_FILE):
        return 0
    try:
        old = {i["src"]: i for i in load_plan() if i.get("new_url")}
    except Exception:                      # noqa: BLE001  旧清单损坏 → 当没有
        return 0
    n = 0
    for it in items:
        o = old.get(it["src"])
        if not o:
            continue
        # 连同 topic / semantic 一起沿用，保证 key ↔ 命名 ↔ CSV ↔ SQL 四者一致
        it.update({k: o[k] for k in ("topic", "semantic", "new_key", "new_url", "status")
                   if k in o})
        n += 1
    return n


def save_plan(items: list) -> None:
    os.makedirs(MIG_DIR, exist_ok=True)
    with open(PLAN_FILE, "w", encoding="utf-8") as f:
        json.dump(items, f, ensure_ascii=False, indent=2)


def load_plan() -> list:
    if not os.path.exists(PLAN_FILE):
        raise SystemExit(f"[!] 找不到 {PLAN_FILE} → 先跑 --stage plan")
    with open(PLAN_FILE, encoding="utf-8") as f:
        return json.load(f)


# ── 各阶段 ══════════════════════════════════════════════════════════
def stage_plan(env, domain, fresh: bool = False) -> list:
    items = collect(env, domain)
    if fresh:
        print("[i] --fresh：忽略上一轮结果，按最新命名规则重建清单（已传对象可能变孤儿）")
    else:
        n = carry_over(items)
        if n:
            print(f"[i] 沿用上一轮已上传结果 {n} 条（避免改名产生重复对象；确需重传加 --fresh）")
    save_plan(items)
    refs = sum(i["refs"] for i in items)
    posts = sorted({pid for i in items for pid in i["post_ids"]})
    print(f"[i] 域名 {domain}：{len(posts)} 篇文章 / {refs} 处引用 / {len(items)} 个唯一图片")
    print(f"[i] 清单已写入 {PLAN_FILE}")
    per_topic = {}
    for i in items:
        per_topic[i["topic"]] = per_topic.get(i["topic"], 0) + 1
    print("[i] 主题分布：" + ", ".join(f"{k}={v}" for k, v in sorted(per_topic.items())))
    print("[i] 命名预览（前 8 条）：")
    for i in items[:8]:
        print(f"    post {i['post_ids']} {i['topic']:<20} {i['semantic']}")
    return items


def stage_download(items) -> int:
    os.makedirs(MIG_DIR, exist_ok=True)
    fail = 0
    for n, it in enumerate(items, 1):
        if it.get("new_url"):                      # 已上传过（本地副本已清）→ 不必再下载
            continue
        if it.get("local") and os.path.exists(it["local"]):
            continue
        try:
            data = core.download(it["src"])
            path = os.path.join(MIG_DIR, f"{n:03d}-{it['semantic']}.{core.sniff_ext(data)}")
            with open(path, "wb") as f:
                f.write(data)
            it.update({"local": path, "status": "downloaded", "bytes": len(data)})
            print(f"  [{n}/{len(items)}] OK {len(data)//1024}KB → {path}")
        except Exception as e:                # noqa: BLE001
            it.update({"status": "download-failed", "error": str(e)})
            fail += 1
            print(f"  [{n}/{len(items)}] FAIL {it['src']} → {e}")
    save_plan(items)
    print(f"[i] 下载完成：成功 {len(items)-fail}/{len(items)}，失败 {fail}")
    return fail


def stage_upload(items) -> int:
    cli = core.make_client()
    fail = 0
    for n, it in enumerate(items, 1):
        try:
            local = it.get("local") or ""
            if not (local and os.path.exists(local)):
                if it.get("new_url"):              # 幂等重跑：已上传过 → 只复核公开可读
                    code, ct = core.verify_public(it["new_url"])
                    if code == 200:
                        it.update({"status": "reused", "public_check": f"{code} {ct}"})
                        print(f"  [{n}/{len(items)}] reused   {it.get('new_key','')}")
                        continue
                raise RuntimeError("本地文件缺失，请先跑 --stage download")
            with open(local, "rb") as f:
                data = f.read()
            key = core.build_key(it["topic"], it["semantic"], data)
            url = core.public_url(key)
            if core.head_exists(cli, key):
                status = "reused"
            else:
                core.put_object(cli, key, data)
                status = "uploaded"
            code, ct = core.verify_public(url)
            if code != 200:
                raise RuntimeError(f"公开校验失败 HTTP {code} {ct}")
            it.update({"new_key": key, "new_url": url, "status": status,
                       "sha1_6": core.hashlib.sha1(data).hexdigest()[:6],
                       "public_check": f"{code} {ct}"})
            os.remove(local)                   # 校验通过 → 清理本地副本
            it["local"] = ""
            print(f"  [{n}/{len(items)}] {status:<8} {key}")
        except Exception as e:                 # noqa: BLE001
            it["status"] = "upload-failed"
            it["error"] = str(e)
            fail += 1
            print(f"  [{n}/{len(items)}] FAIL {it['src']} → {e}")
    save_plan(items)
    ok = len(items) - fail
    print(f"[i] 上传完成：成功 {ok}/{len(items)}（复用 "
          f"{sum(1 for i in items if i['status']=='reused')}），失败 {fail}")
    return fail


def stage_sql(items, domain) -> str:
    done = [i for i in items if i.get("new_url")]
    skip = [i for i in items if not i.get("new_url")]
    if skip:
        print(f"[!] {len(skip)} 条没有 new_url（未上传成功），SQL 中将跳过：")
        for i in skip[:10]:
            print(f"    post {i['post_ids']} {i['src']} → {i.get('status')} {i.get('error','')}")
    by_post = {}
    for it in done:
        for pid in it["post_ids"]:
            by_post.setdefault(pid, []).append(it)
    today = _dt.date.today().isoformat()
    os.makedirs(SQL_DIR, exist_ok=True)
    sql_path = os.path.join(SQL_DIR, f"{today}-hotlink-to-r2.sql")
    csv_path = os.path.join(SQL_DIR, f"{today}-hotlink-to-r2.mapping.csv")

    lines = [
        f"-- {domain} → R2 图片链接迁移（生成于 {today}，hotlink-migrator v1.0）",
        f"-- 覆盖 {len(by_post)} 篇文章 / {len(done)} 个唯一图片链接",
        "-- 注：同一链接在正文与头图各出现一次时，replace() 会同时命中（实际替换次数 ≥ 链接数）",
        "-- 执行方式：Supabase → SQL Editor → 粘贴 → Run",
        "-- 幂等：已替换过的链接不会再匹配，可重复运行",
        "-- 回滚：见同目录 .mapping.csv（old_url → new_url 全量对照）",
    ]
    if skip:
        lines.append(f"-- ⚠️ 未迁移 {len(skip)} 张（源站 404 / 下载失败 → 库里仍是竞品链接，需人工补图或删该图位）：")
        for i in skip:
            lines.append("--    post " + ",".join(str(x) for x in i["post_ids"]) + "  " + i["src"])
    lines += ["BEGIN;", ""]
    for pid in sorted(by_post):
        rows = by_post[pid]
        lines.append(f"-- post id={pid}（{rows[0]['slug']}）：{len(rows)} 张")
        content_expr, image_expr = "content", "image_url"
        for r in rows:
            old, new = r["src"], r["new_url"]
            content_expr = f"replace({content_expr}, '{old}', '{new}')"
            image_expr = f"replace({image_expr}, '{old}', '{new}')"
        lines.append(f"UPDATE posts SET\n  content   = {content_expr},\n"
                     f"  image_url = {image_expr}\nWHERE id = {pid};")
        lines.append("")
    lines += [
        "COMMIT;",
        "",
        "-- 校验（执行后可单独跑下面这句）：",
        f"-- SELECT id, slug FROM posts WHERE content LIKE '%{domain}%' OR image_url LIKE '%{domain}%';",
    ]
    if skip:
        left = sorted({pid for i in skip for pid in i["post_ids"]})
        lines.append(f"-- 预期结果：返回 {len(left)} 行（即上方 TODO 里那 {len(skip)} 张未迁移图所在的篇："
                     + ",".join(str(x) for x in left) + "）；待补图后才会归 0 行。")
    else:
        lines.append("-- 预期结果：返回 0 行。")
    lines.append("")
    with open(sql_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    with open(csv_path, "w", encoding="utf-8", newline="") as f:
        w = csv.writer(f)
        w.writerow(["post_ids", "slug", "topic", "semantic", "old_url", "new_key", "new_url", "status"])
        for it in items:
            w.writerow([",".join(str(x) for x in it["post_ids"]), it["slug"], it["topic"],
                        it["semantic"], it["src"], it.get("new_key", ""),
                        it.get("new_url", ""), it.get("status", "")])
    print(f"[i] SQL     → {sql_path}")
    print(f"[i] 映射表  → {csv_path}")
    return sql_path


def do_verify(env, domain) -> int:
    posts = sb_get(env, "posts?select=id,slug,content,image_url&order=id.asc")
    bad = []
    for p in posts:
        blob = (p.get("content") or "") + " " + (p.get("image_url") or "")
        n = blob.count(domain)
        if n:
            bad.append((p["id"], p["slug"], n))
    if not bad:
        print(f"[i] 校验通过：库内已无 {domain} 引用")
        return 0
    print(f"[!] 仍有 {len(bad)} 篇引用 {domain}（共 {sum(b[2] for b in bad)} 处）：")
    for b in bad:
        print(f"    id={b[0]:<3} {b[2]:<3} {b[1]}")
    return 1


def main() -> int:
    ap = argparse.ArgumentParser(description="竞品热链 → 自家 R2 批量迁移")
    ap.add_argument("--stage", choices=("plan", "download", "upload", "sql", "all"), default="plan")
    ap.add_argument("--domain", default=DEFAULT_DOMAIN)
    ap.add_argument("--verify", action="store_true", help="只读校验库里还剩多少竞品引用")
    ap.add_argument("--allow-partial", action="store_true",
                    help="部分图片下载/上传失败时，仍为已成功部分生成 SQL（失败项在 SQL 头注释里列为 TODO）")
    ap.add_argument("--fresh", action="store_true",
                    help="--stage plan 时忽略上一轮已上传结果，按最新命名规则重建清单（会重传，旧对象变孤儿）")
    a = ap.parse_args()
    env = load_env()

    if a.verify:
        return do_verify(env, a.domain)

    items = None
    if a.stage in ("plan", "all"):
        items = stage_plan(env, a.domain, fresh=a.fresh)
    if a.stage in ("download", "all"):
        items = items if items is not None else load_plan()
        stage_download(items)
    if a.stage in ("upload", "all"):
        items = items if items is not None else load_plan()
        if stage_upload(items) and not a.allow_partial:
            print("[!] 存在上传失败项，已中止生成 SQL（确认只为已成功部分出 SQL 时加 --allow-partial）")
            return 1
    if a.stage in ("sql", "all"):
        items = items if items is not None else load_plan()
        stage_sql(items, a.domain)
    if os.path.isdir(MIG_DIR) and not os.listdir(MIG_DIR):
        os.rmdir(MIG_DIR)
        print(f"[i] 已清理空目录 {MIG_DIR}/")
    return 0


if __name__ == "__main__":
    sys.exit(main())
