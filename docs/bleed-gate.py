# -*- coding: utf-8 -*-
"""全幅出血闸门（只读）：astro build 之后跑 —— python docs/bleed-gate.py

全站只允许一套出血算法：global.css 的 :root { --inner-w: 100vw; --bleed: calc(50% -
var(--inner-w)/2) }，宽度由 src/scripts/innerWidth.js 写成 documentElement.clientWidth。
不要再写 calc(50% - 50vw)：100vw 含竖向滚动条，而 .container 的居中按不含滚动条的
clientWidth 算，所以它会比可视区宽一条滚动条（左右各半个）。溢出被 body{overflow-x:clip}
裁掉，肉眼看不见，但 html 的 scrollWidth 会多出 8px，任何读 scrollWidth 的判断都被误导。

为什么需要闸门而不是靠人记：两种失败都很安静。

  1. 某个出血点漏改 → 它照样把 html 撑出 8px，而整页看起来完全正常；
  2. CSS 写了 var(--bleed)，但页面没装载写 --inner-w 的脚本 → 变量退回默认 100vw，
     等于没修，肉眼同样看不出来。

产物形态要先摸清（实测）：本站 Astro 7 + Cloudflare 把组件的 scoped CSS 与 module script
内联进 HTML，`_astro/*.css` 里只剩一部分；SSR 页（首页 / 产品 / 博客 / 分类）的样式和脚本
则在 dist/server 的 chunk 里。所以只看 dist/client/_astro 会得到「.page-hero 没走 --bleed」
的假故障 —— 把「查不到」当「通过」同样危险，因此三处文本都并进来扫，并要求每个出血选择器
都必须命中。新增出血点时把它的选择器加进下面的 NEED 表。

只读 dist/，不改任何东西。
"""
import glob
import os
import re
import sys

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

DIST = "dist/client"
ASTRO = os.path.join(DIST, "_astro")
SERVER = os.path.join("dist", "server")
WRITER = r'setProperty\(\s*["\'`]--inner-w'   # 脚本签名，比裸 --inner-w 硬：
#                                          # CSS 里也出现 --inner-w，用它判装载会假通过
# 注：esbuild 压缩时会把字符串改成反引号（实测 setProperty(`--inner-w`, …)），
# 只列引号会报「没装载」的假故障。
fails = []


def read(p):
    return open(p, encoding="utf-8", errors="replace").read()


htmls = [f for f in glob.glob(os.path.join(DIST, "**", "*.html"), recursive=True)
         if os.sep + "404" not in f]
css_files = glob.glob(os.path.join(ASTRO, "*.css"))
srv_files = [f for f in glob.glob(os.path.join(SERVER, "**", "*"), recursive=True)
             if os.path.isfile(f)]

# 待检查的全部样式文本：产物 CSS + 预渲染 HTML 内联 <style> + 服务端 chunk
blobs = {}
for f in css_files:
    blobs[os.path.basename(f)] = read(f)
for f in htmls:
    for i, body in enumerate(re.findall(r"<style[^>]*>(.*?)</style>",
                                        read(f), re.S)):
        blobs[os.path.relpath(f, DIST) + "#style%d" % i] = body
for f in srv_files:
    blobs["server/" + os.path.basename(f)] = read(f)
all_css = "\n".join(blobs.values())

print("=== A) 样式文本（CSS %d + 内联 %d + 服务端 %d = %d 段）==="
      % (len(css_files), len(htmls), len(srv_files), len(blobs)))

leftover = sorted({k for k, t in blobs.items() if "50vw" in t})
if leftover:
    bad = "产物里还有 50vw（压缩后不留注释，命中即真声明）：%s" % leftover[:6]
    fails.append(bad)
    print("  ✗ " + bad)
else:
    print("  ✅ 50vw 命中 0")

for pat, why in (
    (r"--inner-w:100vw", "--inner-w 的默认值丢了（禁用 JS 时出血宽度会不存在）"),
    (r"--bleed:calc\(50%\s*-\s*var\(--inner-w\)\s*/\s*2\)", "--bleed 定义丢了或被改写"),
):
    if not re.search(pat, all_css):
        fails.append(pat)
        print("  ✗ 缺 %s（%s）" % (pat, why))

# 每个出血点都必须确实用上 --bleed/--inner-w。选择器里的 [data-astro-cid-*] 先剥掉。
NEED = [
    (r"\.page-hero\b", "PageHero 页头（16 个内页共用）"),
    (r"\.video-hero\b", "首页全屏视频头"),
    (r"\.solutions-section-bronze\b", "首页解决方案色带"),
    (r"\.video-gallery-section\b", "首页视频画廊带"),
    (r"\.products-section\b", "首页产品区"),
    (r"\.certificates-section\b", "首页证书区"),
    (r"\.trust-section\b", "首页 Trusted By 深蓝带"),
    (r"\.meiyu-map-wrapper\b", "首页全球地图带"),
    (r"\.ft(?![\-\w])", "工厂视频轨深色带"),   # 不能写成 \.ft\b：那会连 .ft-rail 也算命中
    (r"\.ab-band\b", "About 全幅带"),
    (r"\.ins-shell\b", "灵感页两端出血"),
    (r"\.toc-rail\b", "博客目录浮轨（对齐 1400 左 gutter）"),
]
strip_cid = lambda s: re.sub(r"\[data-astro-cid-[a-z0-9]+\]", "", s)  # noqa: E731
found = set()
for sel, body in re.findall(r"([^{}]{0,300}?)\{([^}]*)\}", all_css):
    s = strip_cid(sel)
    if "--bleed" in body or "--inner-w" in body:
        for pat, _what in NEED:
            if re.search(pat, s):
                found.add(pat)
miss_sel = 0
for pat, what in NEED:
    if pat not in found:
        miss_sel += 1
        fails.append(what)
        print("  ✗ %s（%s）没有一条规则走 --bleed/--inner-w：漏改或选择器改名了"
              % (what, pat))
print("  出血点确认：%d/%d" % (len(NEED) - miss_sel, len(NEED)))

# ── B) 用到出血的预渲染页，HTML 里必须能找到写入脚本 ─────────────────────
print("\n=== B) 预渲染页装载检查 ===")
BLEED_CLS = ("page-hero", "video-hero", "ab-band", "meiyu-map-wrapper",
             "trust-section", "ins-shell", "ft-rail", "solutions-section-bronze")


def chunks_of(html_text):
    """内联脚本之外还要跟一遍外链 chunk（万一哪天不内联了，这条不能瞎）。"""
    out = []
    for src in re.findall(r'<script[^>]+src="([^"]+\.js)"', html_text):
        p = os.path.join(ASTRO, os.path.basename(src))
        if os.path.isfile(p):
            out.append(read(p))
    return out


need = miss = 0
for h in htmls:
    t = read(h)
    if not any(m in t for m in BLEED_CLS):
        continue
    need += 1
    if not re.search(WRITER, t) and not any(re.search(WRITER, c) for c in chunks_of(t)):
        miss += 1
        print("  ✗ %s 用出血但找不到写入脚本" % os.path.relpath(h, DIST))
print("  用到出血的预渲染页 = %d / 共 %d 个 HTML" % (need, len(htmls)))
if need == 0:
    fails.append("need0")
    print("  ✗ 一个出血页都没扫到 —— 标记写错了，别把「查不到」当「通过」")
elif miss:
    fails.append("miss")
    print("  ✗ %d 页缺写入脚本" % miss)
else:
    print("  ✅ 每页都装载了写 --inner-w 的脚本")

# ── C) SSR 侧：首页/产品/博客由 worker 渲染，脚本与样式都在服务端产物里 ─────
print("\n=== C) SSR 产物 ===")
hit = [os.path.basename(f) for f in srv_files if re.search(WRITER, read(f))]
print("  服务端文件 %d 个，含写入脚本的：%s" % (len(srv_files), hit or "无"))
if not hit:
    fails.append("ssr")
    print("  ✗ SSR 产物里找不到写入脚本 —— 首页/产品页/博客页的出血会退回 100vw")

print("\n" + ("全部通过" if not fails else "有 %d 项不通过" % len(fails)))
sys.exit(1 if fails else 0)
