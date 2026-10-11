#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SEO 体检脚本 · 只读，不写库
════════════════════════════════════════════════════════════════════
用途：把站内所有内容的 SEO 字段（seo_title / seo_description / keywords）拉出来，
      回答三件事：
        1. 有哪些页面缺 SEO 信息、长度会不会被搜索引擎截断；
        2. 哪些页面在抢同一个关键词（自相残杀 / cannibalisation）；
        3. 哪些页面的 keywords 集合高度重叠，建议区分定位。

设计前提：keywords[] 的**第一个**元素视为该页的主攻词（站内约定）。

用法（在项目根执行）：
  python docs/seo-audit.py                # 控制台报告
  python docs/seo-audit.py --csv out.csv  # 另存明细，便于在表格里排序筛选
  python docs/seo-audit.py --lang en      # 只看某一语言（默认 all）

依赖：仅标准库。密钥读项目根 .env（不回显）。
"""
from __future__ import annotations

import argparse
import csv
import json
import os
import re
import sys
import time
import urllib.request

BASE = KEY = None
for name in (".env", ".env.local", os.path.join("docs", "r2-credentials.env")):
    if not os.path.exists(name):
        continue
    for line in open(name, encoding="utf-8"):
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        v = v.strip().strip('"').strip("'")
        if k.strip() == "PUBLIC_SUPABASE_URL" and not BASE:
            BASE = v.rstrip("/")
        elif k.strip() == "PUBLIC_SUPABASE_ANON_KEY" and not KEY:
            KEY = v
if not (BASE and KEY):
    sys.exit("[!] 读不到 PUBLIC_SUPABASE_URL / PUBLIC_SUPABASE_ANON_KEY")

# 报告里有 ⚠ / ² / — 等非 ASCII 字符：Windows 控制台默认 GBK，一旦被管道接管就会
# UnicodeEncodeError 中断报告。统一把 stdout 切成 UTF-8，编不出的字符降级替代。
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

HDRS = {"apikey": KEY, "Authorization": "Bearer " + KEY}

# 表 → 配置。各表列名不统一：categories 用 name 且无 status / lang 列。
#   url_prefix  路由前缀
#   label       人类可读类型名
#   title_col   用作“页面标题”的列名
#   has_lang / has_status  该表是否有这两列
TABLES = {
    "products":   {"url_prefix": "/products/",    "label": "产品页",   "title_col": "title", "has_lang": True,  "has_status": True},
    "posts":      {"url_prefix": "/blog/",        "label": "博客文章", "title_col": "title", "has_lang": True,  "has_status": True},
    "pages":      {"url_prefix": "/",             "label": "CMS 单页", "title_col": "title", "has_lang": True,  "has_status": True},
    "videos":     {"url_prefix": "/videos/",      "label": "视频页",   "title_col": "title", "has_lang": True,  "has_status": True},
    "categories": {"url_prefix": "/categories/",  "label": "分类页",   "title_col": "name",  "has_lang": False, "has_status": False},
}

TITLE_MAX, TITLE_MIN = 60, 25        # 超出会被截断；过短浪费关键词位
DESC_MAX, DESC_MIN = 160, 70


def fetch(table: str, retries: int = 5) -> list[dict]:
    """拉一张表。该 Supabase 域偶发 TLS 握手中断（UNEXPECTED_EOF），必须退避重试。"""
    cfg = TABLES[table]
    cols = ["slug", cfg["title_col"], "seo_title", "seo_description", "keywords"]
    if cfg["has_status"]:
        cols.append("status")
    if cfg["has_lang"]:
        cols.append("lang")
    url = f"{BASE}/rest/v1/{table}?select={','.join(cols)}&order=slug"
    last = None
    for i in range(retries):
        try:
            req = urllib.request.Request(url, headers=HDRS)
            with urllib.request.urlopen(req, timeout=60) as r:
                return json.loads(r.read().decode("utf-8"))
        except Exception as e:            # noqa: BLE001
            last = e
            time.sleep(1.2 * (i + 1))
    raise SystemExit(f"[!] 读取 {table} 失败（已重试 {retries} 次）：{last}")


def norm(s: str) -> str:
    """关键词归一化：小写、去标点、压空白。用于比较 'Aluminium Ceiling' 与 'aluminium  ceiling'。"""
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9 ]", " ", (s or "").lower())).strip()


def url_of(table: str, slug: str, lang: str) -> str:
    prefix = TABLES[table]["url_prefix"]
    path = f"{prefix}{slug}/"
    return f"/{lang}{path}" if lang and lang != "en" else path


def main() -> int:
    ap = argparse.ArgumentParser(description="MEIYU 站内 SEO 体检（只读）")
    ap.add_argument("--csv", help="把明细另存为 CSV")
    ap.add_argument("--lang", default="all", help="只看某语言（如 en / zh / de），默认 all")
    a = ap.parse_args()

    rows: list[dict] = []
    for table, cfg in TABLES.items():
        for r in fetch(table):
            lang = r.get("lang") or "en"
            rows.append({
                "table": table,
                "type": cfg["label"],
                "slug": r.get("slug") or "",
                "lang": lang,
                "status": (r.get("status") or "published") if cfg["has_status"] else "published",
                "title": r.get(cfg["title_col"]) or "",
                "url": url_of(table, r.get("slug") or "", lang),
                "seo_title": r.get("seo_title") or "",
                "seo_description": r.get("seo_description") or "",
                "keywords": [k for k in (r.get("keywords") or []) if k.strip()],
            })

    if a.lang != "all":
        rows = [r for r in rows if r["lang"] == a.lang]

    pub = [r for r in rows if r["status"] == "published"]
    print("=" * 78)
    print("SEO 体检报告")
    print("=" * 78)
    print(f"\n【1】清单（语言 {a.lang}）")
    for table, cfg in TABLES.items():
        n = len([r for r in rows if r["table"] == table])
        p = len([r for r in pub if r["table"] == table])
        print(f"  {cfg['label']:<10} 共 {n:>3} 条，已发布 {p:>3} 条   {cfg['url_prefix']}")
    print(f"  {'合计':<10} 共 {len(rows):>3} 条，已发布 {len(pub):>3} 条")

    # ── 缺失与长度 ──
    miss_t = [r for r in pub if not r["seo_title"].strip()]
    miss_d = [r for r in pub if not r["seo_description"].strip()]
    miss_k = [r for r in pub if not r["keywords"]]

    print("\n【2】缺失项（只统计已发布）")
    for label, lst in (("缺 seo_title", miss_t), ("缺 seo_description", miss_d),
                       ("缺 keywords", miss_k)):
        print(f"  {label:<20} {len(lst):>3} 条")
        for r in lst[:12]:
            print(f"      - [{r['type']}] {r['url']}")
        if len(lst) > 12:
            print(f"      … 另有 {len(lst) - 12} 条")

    print("\n【3】长度风险（Google 桌面约截断于 title 60 字符 / desc 160 字符）")
    long_t = [r for r in pub if len(r["seo_title"]) > TITLE_MAX]
    short_t = [r for r in pub if 0 < len(r["seo_title"]) < TITLE_MIN]
    long_d = [r for r in pub if len(r["seo_description"]) > DESC_MAX]
    short_d = [r for r in pub if 0 < len(r["seo_description"]) < DESC_MIN]
    print(f"  标题过长（>{TITLE_MAX}）  {len(long_t):>3} 条  ← 会被截断，重点词可能落在省略号后")
    for r in sorted(long_t, key=lambda x: -len(x["seo_title"]))[:10]:
        print(f"      {len(r['seo_title']):>3} 字符  {r['url']}")
    print(f"  标题过短（<{TITLE_MIN}）  {len(short_t):>3} 条")
    print(f"  描述过长（>{DESC_MAX}） {len(long_d):>3} 条")
    print(f"  描述过短（<{DESC_MIN}） {len(short_d):>3} 条")

    # ── 主攻词冲突 ──
    print("\n【4】主攻词冲突（keywords 第一个词 = 该页想排名的词）")
    by_primary: dict[str, list[dict]] = {}
    for r in pub:
        if r["keywords"]:
            by_primary.setdefault(norm(r["keywords"][0]), []).append(r)
    clash = {k: v for k, v in by_primary.items() if k and len(v) > 1}
    if not clash:
        print("  ✅ 没有两个已发布页面主攻同一个关键词。")
    for k, v in sorted(clash.items()):
        print(f"  ⚠ 主攻词 “{k}” 被 {len(v)} 个页面争用：")
        for r in v:
            print(f"      [{r['type']}] {r['url']}")

    # ── 关键词集合重叠 ──
    print("\n【5】关键词集合高度重叠（同一对页面共享 ≥3 个关键词）")
    keys = {norm(k) for r in pub for k in r["keywords"]}
    sets = {f"{r['type']}|{r['url']}": {norm(k) for k in r["keywords"]} for r in pub}
    names = list(sets)
    pairs = []
    for i in range(len(names)):
        for j in range(i + 1, len(names)):
            shared = sets[names[i]] & sets[names[j]]
            if len(shared) >= 3:
                pairs.append((len(shared), names[i], names[j], sorted(shared)))
    pairs.sort(reverse=True)
    if not pairs:
        print("  ✅ 未发现高度重叠的关键词组合。")
    for n, x, y, shared in pairs[:15]:
        print(f"  ⚠ 共享 {n} 个词：\n      {x}\n      {y}\n      重叠：{', '.join(shared[:6])}")
    if len(pairs) > 15:
        print(f"  … 另有 {len(pairs) - 15} 对")

    # ── 标题重复 ──
    print("\n【6】seo_title 完全相同")
    by_title: dict[str, list[str]] = {}
    for r in pub:
        if r["seo_title"].strip():
            by_title.setdefault(norm(r["seo_title"]), []).append(r["url"])
    dup = {k: v for k, v in by_title.items() if len(v) > 1}
    if not dup:
        print("  ✅ 无重复标题。")
    for k, v in dup.items():
        print(f"  ⚠ “{k[:60]}”\n      " + "\n      ".join(v))

    if a.csv:
        with open(a.csv, "w", newline="", encoding="utf-8-sig") as f:
            w = csv.writer(f)
            w.writerow(["类型", "语言", "URL", "状态", "seo_title", "title 字符数",
                        "seo_description", "desc 字符数", "主攻词", "全部关键词"])
            for r in sorted(pub, key=lambda x: (x["type"], x["url"])):
                w.writerow([r["type"], r["lang"], r["url"], r["status"],
                            r["seo_title"], len(r["seo_title"]),
                            r["seo_description"], len(r["seo_description"]),
                            r["keywords"][0] if r["keywords"] else "",
                            " | ".join(r["keywords"])])
            print(f"\n[i] 明细已写入 {a.csv}（{len(pub)} 行）")

    print("\n注：本脚本只读，不会修改任何数据。静态页（About / 首页 / 采购须知 / 安装指南 /"
          "\n    表面处理对比）的 SEO 写在 .astro 源码里，不在数据库中，因此不在本报告内。")
    return 0


if __name__ == "__main__":
    sys.exit(main())
