"""交付文本闸门：扫 dist 产物，确认访客 view-source 看不到内部判断和无来源断言。

用法（在仓库根）：
    python docs/dist-leak-gate.py             # 检查，有问题退出码 1
    python docs/dist-leak-gate.py --extra "per item" --extra "..."

查两类东西：
1) 中文模板注释与中文可见文本。Astro 会把模板里的 <!-- --> 原样写进 HTML，
   所以「Distributor：删项」这类内部判断是会被竞对看到的（AGENTS.md 红线）；
   维护注释必须写 `{/* */}`（编译期，永不输出）。public/ 下的文件原样下发，
   没有编译期注释形式，所以那里的注释只能写英文。
2) 已被业主口径否决的措辞。这类词一旦回潮就说明某处改动把旧文案带回来了。

注意：CSS/JS 里的注释是另一回事——那两个包是业主自己维护的源码，注释留中文
便于他读，所以本闸门只把「HTML 里的注释与可见文本」算作泄漏，JS/CSS 注释仅报告。
"""
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# 业主口径已否决的措辞（2026-10-28 一轮）。新增否决项时往这里加，别靠记忆。
BANNED = [
    "per item",                    # MOQ 基数：业主无法确认 item 定义，改为 per order
    "A2 fire rating",              # 无测试报告的防火裸断言
    "A2-s1,d0</td>",               # 规格表里的裸分级
    "person/day",                  # 无来源的施工效率
    "5 years (exterior)",          # 无来源的室外色保
    "virtually indistinguishable", # 木纹转印的过度承诺
    "standard suspended ceiling grid",  # U 型方通走龙骨，不是 T 型格栅
    "1500mm × 6000mm",             # 板幅上限已统一 2000 × 6000
]
for i, a in enumerate(sys.argv):
    if a == "--extra" and i + 1 < len(sys.argv):
        BANNED.append(sys.argv[i + 1])

CJK = re.compile(r"[\u4e00-\u9fff]")
root = Path("dist")
if not root.exists():
    raise SystemExit("dist/ 不存在，先 npx astro build")
files = list(root.rglob("*.html")) + list(root.rglob("*.css")) + list(root.rglob("*.js"))

html_leaks, phrase_hits, script_cjk = [], [], 0
for f in files:
    src = f.read_text(encoding="utf-8", errors="replace")
    for w in BANNED:
        if w in src:
            phrase_hits.append((f.as_posix(), w))
    if f.suffix != ".html":
        continue
    # 可见文本：先剔除 script/style（其中内容不是可见文字），再剥标签
    body = re.sub(r"<(script|style)\b[\s\S]*?</\1>", "", src, flags=re.I)
    for m in CJK.finditer(re.sub(r"<[^>]*>", " ", body)):
        html_leaks.append((f.as_posix(), "可见中文", m.group(0)))
    for m in re.finditer(r"<!--([\s\S]{0,140}?)-->", src):
        if CJK.search(m.group(1)):
            html_leaks.append((f.as_posix(), "中文注释", m.group(1).strip()[:80]))

print("扫描 %d 个产物文件（HTML %d / CSS·JS %d）"
      % (len(files), sum(1 for f in files if f.suffix == ".html"),
         sum(1 for f in files if f.suffix != ".html")))

if html_leaks:
    print("\n❌ HTML 层泄漏 %d 处（应改为 {/* */} 或英文注释）" % len(html_leaks))
    for path, kind, txt in html_leaks[:12]:
        print("   · [%s] %s → %s" % (kind, path, txt))
    if len(html_leaks) > 12:
        print("   …另有 %d 处" % (len(html_leaks) - 12))
else:
    print("\n✅ HTML 层无中文注释、无中文可见文本")

if phrase_hits:
    print("\n❌ 被否决的措辞回潮 %d 处：" % len(phrase_hits))
    for path, w in phrase_hits[:12]:
        print("   · %s 含 %r" % (path, w))
else:
    print("✅ %d 条否决措辞在产物里全部归零" % len(BANNED))

ok = not html_leaks and not phrase_hits
print("\n结论：%s" % ("闸门通过" if ok else "有项需修，勿部署"))
sys.exit(0 if ok else 1)
