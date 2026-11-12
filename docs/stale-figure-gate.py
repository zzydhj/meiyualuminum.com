"""内容事实闸门：扫五张内容表，找出已被业主口径否决或过时的数字。

用法（在仓库根）：
    python docs/stale-figure-gate.py            # 检查，有意外命中退出码 1
    python docs/stale-figure-gate.py --csv out.csv

为什么需要它：公司资料一更新，旧数字不会自己消失——它们散在 products.pages.posts.
videos 的正文与 JSON 字段里，而 anon key 写不进 posts，所以每次改完必须扫一遍才知道
还剩什么。2026-11-02 那轮就是靠它把 14 处降到 4 处。

两类输出：
1) 否决数字（算失败）。ALLOW 里逐条写明「为什么这处是有意保留」，没有理由的命中
   就是漏改。新增否决项时往 PATTERNS 加，别靠记忆。
2) 产品级 enriched_specs 覆盖品类层（仅报告，不影响退出码）。productKnowledge.ts 是
   品类层，产品行自己的 specs 优先级更高——改了品类层却发现页面没变，八成是被挡住了。

还有第三类（仅报告）：幅面类规格行没写出公司级上限。评审 F03 的根因就是这一类——
它不是写错数字，而是正文有上限、规格表只给常规档，字符串黑名单对「缺失」无能为力。
"""
import csv
import json
import os
import re
import sys
import urllib.request

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ── 否决 / 过时数字 ──────────────────────────────────────────────────
# (标签, [匹配串…])。开孔率两种写法都要列：库里既有 `10-30 %` 也有 `10–30%`。
PATTERNS = [
    ("旧开孔率 10-30%", ["10-30 % open area", "10-30% open area",
                         "10–30 % open area", "10–30% open area",
                         "open area of 10-30", "open area 10-30"]),
    ("U 型方通假格式", ["50×150", "50x150 mm", "80×200", "80x200 mm"]),
    ("旧厚度保守口径", ["standard range 0.8–1.5 mm", "standard range 0.8-1.5 mm"]),
    ("禁用城市名", ["Dongguan", "Foshan", "东莞", "佛山"]),
    ("旧交期分档", ["20–25 working", "20-25 working", "30–40 working", "30-40 working"]),
    ("旧厂房面积", ["25,000 m", "25000 m"]),
    # 2026-11-11 公司基础数据三项变更（成立 2011→2017、厂房 15,000→30,000–50,000 m²、
    # 产线 15→9）。只列完整短语：裸“2011”会命中 CPR 法规号 (EU) No 305/2011，
    # 裸“15 years”会命中 PVDF 涂层质保，两者都不是公司年限。
    ("作废公司数据（2026-11-11）", ["15,000 m²", "15,000 m&sup2;", "15 production lines",
                                "15 in-house lines", "established 2011", "established in 2011",
                                "founded in 2011", "Since 2011", "since 2011", "Est. 2011",
                                "15 条产线", "15 条生产线"]),
    # 2026-11-12 板幅上限。附录 A 统一公司级上限 2000 × 6000 mm，作废值 1500 × 6000
    # 曾藏在 aluminum-wall-panels 的停放**中文行**里——中文行不渲染，所以 dist-leak-gate
    # 看不到它，只有数据库层能拦住。只列「1500 与 6000 成对」的写法，避免误伤：
    # 蜂窝幕墙板的 1500–1800 mm wide and 3000–6000 mm long、吊顶模块 600 × 1500、
    # 曲面板 1500 × 4000 都是附录 A 允许的带工程理由上限，不是漏改。
    ("作废板幅上限（2026-11-12）", ["1500mm × 6000mm", "1500 × 6000 mm", "1500×6000",
                              "1,500 × 6,000", "1500 x 6000", "1500mmx6000mm"]),
    ("作废联系方式/旧全称", ["info@meiyualuminum", "MEIYU Aluminum Co., Ltd."]),
    ("未授权费用承诺", ["free sample", "Free sample", "免费样品", "at no cost"]),
    ("无报告防火断言", ["A2-s1,d0 certified", "A2 fire rating", "non-combustible A2"]),
    ("随报价走的标配用量", ["hanger point per m", "triangular grid per m",
                            "nuts and 1 expansion", "Allow about 4 % waste",
                            "Allow about 4% waste", "allow about 5% waste"]),
    ("上站的 US$ 单价", ["US$", "USD/", "$/sqm", "$/sq m", "$/m²", "$ per sq m"]),
]

# 有意保留的例外：(表, 行标识, 字段) -> 保留理由。命中但在此表内 = 不报错。
ALLOW = {
    ("products", "perforated-aluminum-panel", "spec"):
        "幕墙冲孔板：开孔率按产品线分开写，只有声学类升到 15–65%",
    ("products", "insulated-facade-panel", "content"):
        "保温复合板：同上，且本厂资料未覆盖该产品线",
    ("posts", "nigeria-hotel-resort-aluminum-glass-facade-design", "content"):
        "该句标的是 (manufacturer range) 行业范围，不是我方能力宣称",
    # wave-square-tube-ceiling 的 50×150 / 100×200 曾挂在这里等厂里确认，
    # 2026-11-11 复查该行已不含这些格式 → 例外已撤。以后若再回潮就是意外，该报错。
}


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
    base, key = vals.get("PUBLIC_SUPABASE_URL"), vals.get("PUBLIC_SUPABASE_ANON_KEY")
    if not (base and key):
        raise SystemExit("[!] 读不到 PUBLIC_SUPABASE_URL / PUBLIC_SUPABASE_ANON_KEY")
    return base, key


def sb_get(base, key, table):
    req = urllib.request.Request(
        base.rstrip("/") + "/rest/v1/" + table + "?select=*",
        headers={"apikey": key, "Authorization": "Bearer " + key})
    with urllib.request.urlopen(req, timeout=180) as r:
        return json.load(r)


def ident_of(row):
    return (row.get("slug") or row.get("page_key") or row.get("name")
            or str(row.get("id")))


# 幅面类规格行的标签特征（附录 A【最大板幅】）。故意不收 module size / unit size /
# curved length 这类——吊顶模块与百叶箱体不吃板幅上限，把它们列进来只会造常年噪音。
FORMAT_LABEL = re.compile(r"(format|板幅|panel size)", re.I)
CAP_MENTION = re.compile(r"2[\s,]?0[\s,]?0[\s,]?0\s*[×x]\s*6[\s,]?0[\s,]?0[\s,]?0", re.I)


def main():
    to_csv = None
    if "--csv" in sys.argv:
        i = sys.argv.index("--csv")
        if i + 1 >= len(sys.argv):
            raise SystemExit("[!] --csv 后面要跟文件名")
        to_csv = sys.argv[i + 1]

    base, key = load_env()
    hits, shadowed, nocap, scanned = [], [], [], 0
    for table in ("products", "pages", "posts", "videos", "categories"):
        try:
            rows = sb_get(base, key, table)
        except Exception as exc:  # noqa: BLE001
            print("[!] %s 读取失败：%s" % (table, exc))
            continue
        scanned += len(rows)
        for row in rows:
            ident = ident_of(row)
            for field, value in row.items():
                if not isinstance(value, str):
                    continue
                for label, needles in PATTERNS:
                    for needle in needles:
                        if needle in value:
                            i = value.find(needle)
                            hits.append((table, ident, field, label, needle,
                                         value[max(0, i - 55):i + 65].replace("\n", " "),
                                         (table, ident, field) in ALLOW))
            # 仅对英文在售产品判断品类层遮蔽
            if table == "products" and row.get("lang") == "en" and row.get("status") == "published":
                es = row.get("enriched_specs")
                if isinstance(es, str):
                    try:
                        es = json.loads(es)
                    except Exception:  # noqa: BLE001
                        es = None
                if isinstance(es, dict) and es.get("specs"):
                    shadowed.append((ident, len(es["specs"])))
                    # 按产品聚合：只要该行集合里任何一处写过公司上限就算覆盖
                    # （蜂窝板那类用单独一行 Maximum Single Piece 表达）。
                    fmt = [s for s in es["specs"]
                           if FORMAT_LABEL.search(s.get("label", ""))]
                    if fmt and not any(CAP_MENTION.search(s.get("value", ""))
                                       for s in es["specs"]):
                        nocap.append((ident, " / ".join(s.get("label", "") for s in fmt)))

    unexpected = [h for h in hits if not h[6]]
    allowed = [h for h in hits if h[6]]

    print("扫描 %d 行（products / pages / posts / videos / categories）" % scanned)
    print("否决数字：%d 处意外 + %d 处已登记例外" % (len(unexpected), len(allowed)))

    if unexpected:
        print("\n❌ 需要处理 %d 处：" % len(unexpected))
        for table, ident, field, label, needle, seg, _ in unexpected[:15]:
            print("   · [%s] %s.%s → %s\n       …%s…" % (table, ident, field, label, seg))
        if len(unexpected) > 15:
            print("   …另有 %d 处" % (len(unexpected) - 15))
    else:
        print("\n✅ 无意外命中（全部归零或已登记理由）")

    if allowed:
        print("\n已登记的例外（改动前先读理由）：")
        for table, ident, field, label, _n, _s, _ok in allowed:
            print("   · %s.%s.%s — %s" % (table, ident, field, ALLOW[(table, ident, field)]))

    if shadowed:
        print("\nℹ 以下英文在售产品自带 specs，会遮蔽 productKnowledge.ts 的品类层"
              "（改品类层时页面不会变）：")
        for ident, n in sorted(shadowed):
            print("   · %-40s %d 行" % (ident, n))

    if nocap:
        # 已知应继续亮着的一项：insulated-facade-panel。附录 A【产品线】只授权了铝皮
        # 复合工艺本身，未给该线的幅面数据，拿公司级上限去填就是替厂里认下一个
        # 没确认的能力。业主哪天确认了夹芯板的可成幅面，这行就该消失。
        print("\nℹ 有幅面类规格行但全页未写出公司级上限 2000 × 6000 mm（评审 F03 型缺口，仅提示）："
              "\n   若该产品确实有更小的工程上限（蜂窝板总厚、曲面板弯曲半径），把理由写在那一行里；"
              "\n   否则就是只写了常规档、买家从规格表拿不到上限：")
        for ident, labs in sorted(nocap):
            print("   · %-34s %s" % (ident[:34], labs[:60]))

    if to_csv:
        with open(to_csv, "w", newline="", encoding="utf-8-sig") as f:
            w = csv.writer(f)
            w.writerow(["table", "ident", "field", "label", "needle", "allowed", "snippet"])
            for row in hits:
                w.writerow(list(row[:5]) + ["是" if row[6] else "否", row[5]])
        print("\nCSV → %s" % to_csv)

    ok = not unexpected
    print("\n结论：%s" % ("闸门通过" if ok else "有项需修，勿部署"))
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
