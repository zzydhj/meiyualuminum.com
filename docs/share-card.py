#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""生成全站社交分享卡（og:image）1200×630。

BaseLayout.astro 的 SHARE_IMAGE 指向本脚本的产物：WhatsApp / LinkedIn / 微信
转发任何链接时，卡片显示的就是这张图。原图是 800×800 方图时会被 WhatsApp 的
1.91:1 卡片框居中裁成一条横带（丢 LOGO 与底部联系方式），所以做成 1200×630。

设计：右侧满幅项目实拍 + 左侧深蓝渐变压暗承载文字；LOGO 用站内真实 PNG，
文字全部用系统字体排版 —— 不走 AI 生成，避免糊字（AGENTS.md 同源要求）。
文案红线：只用 src/lib/companyProfile.ts 与附录 A 里的事实，不编数字。

用法（项目根目录执行，依赖 Pillow）：
  python docs/share-card.py
      → .tmp-work/share-card/share-card-1200x630.jpg（另有 .webp 与聊天框预览图）

换图后上传并接线（文件名带内容哈希，天然绕开 Meta 的 URL 缓存）：
  python docs/r2-image-pipeline.py --file .tmp-work/share-card/share-card-1200x630.jpg \
      --prefix home --semantic social-share-card
  # 把返回的 URL 与 1200 / 630 填进 src/layouts/BaseLayout.astro 的
  # SHARE_IMAGE / SHARE_IMAGE_W / SHARE_IMAGE_H，再 astro build + wrangler deploy。
"""

import io
import os
import re
import urllib.request

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT_DIR = os.path.join(ROOT, ".tmp-work", "share-card")
os.makedirs(OUT_DIR, exist_ok=True)

# Meta 推荐比例 1.91:1；偏离这个比例就会被客户端居中裁切
W, H = 1200, 630

# 品牌色（与全站一致：global.css / PageHero 用的深蓝 + 金铜）
NAVY = (13, 9, 80)
BRONZE = (192, 168, 130)
WHITE = (255, 255, 255)

# 素材：站内已有的实拍项目图与真 LOGO（不引第三方素材）
BG_SRC = "https://file.meiyualuminum.com/home/aluminum-ceiling-project/beijing-daxing-airport-terminal-tree-column-curved-aluminum-ceiling-interior.webp"
LOGO_SRC = "https://file.meiyualuminum.com/home/logo-white-2.png"

# 电话与网址不手抄：从单一事实源 companyProfile.ts 与 astro.config.mjs 的 site 读，
# 避免这张图将来和站内对不上（数字与资质同理由附录 A 管）。
_profile = open(
    os.path.join(ROOT, "src", "lib", "companyProfile.ts"), encoding="utf-8"
).read()
_phone = re.search(r'phone: "([^"]+)"', _profile).group(1)
_site = re.search(
    r'^\s*site:\s*"([^"]+)"',
    open(os.path.join(ROOT, "astro.config.mjs"), encoding="utf-8").read(),
    re.M,
).group(1).rstrip("/")

HEADLINE = ["Aluminium Ceilings", "& Facade Panels"]
SUBLINE = "Custom shapes  ·  Perforation  ·  PVDF & powder coat"
# 地址只写国家、不写城市：2026-10-25 用户定口径 —— 分享卡上的产地展示 China，
# 不要出现 Dongguan（城市名放在站内正文与附录 A 里，卡片上只保留国家级信息）。
FACTLINE = "Direct factory in China · ISO 9001 · CE"
SITE_LINE = _site.replace("https://", "")
WA_LINE = "WhatsApp  %s" % _phone


def fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    return urllib.request.urlopen(req, timeout=60).read()


def font(bold: bool, size: int):
    return ImageFont.truetype(
        os.path.join(
            os.environ.get("WINDIR", "C:\\Windows"),
            "Fonts",
            "arialbd.ttf" if bold else "arial.ttf",
        ),
        size,
    )


def fit_font(draw, text, fbold, size, max_w, min_size=18):
    """从 size 往下缩，直到文字宽度不超过 max_w（换更长文案时不必手调字号）。"""
    while size > min_size:
        f = font(fbold, size)
        if draw.textlength(text, font=f) <= max_w:
            return f
        size -= 2
    return font(fbold, min_size)


# ── 1. 背景：等比放大后居中裁成 1200×630（不拉伸变形）────────────────
bg = Image.open(io.BytesIO(fetch(BG_SRC))).convert("RGB")
scale = max(W / bg.width, H / bg.height)
bg = bg.resize((round(bg.width * scale), round(bg.height * scale)), Image.LANCZOS)
left = (bg.width - W) // 2
top = (bg.height - H) // 2
canvas = bg.crop((left, top, left + W, top + H))

# ── 2. 左侧渐变遮罩：文字列（x<380）近乎不透明深蓝 → x=760 处完全透明 ──
# 前段必须压得实：实拍图上半部是白色铝板，遮罩不够厚时铜色小字会糊进亮区。
grad = Image.new("L", (W, H), 0)
gd = ImageDraw.Draw(grad)
SOLID, STOP, PEAK = 380, 760, 248
for x in range(STOP):
    if x < SOLID:
        a = PEAK
    else:
        t = (x - SOLID) / (STOP - SOLID)
        a = int(PEAK * (1 - t) ** 1.45)
    gd.line([(x, 0), (x, H)], fill=a)
canvas = Image.composite(Image.new("RGB", (W, H), NAVY), canvas, grad)

# 底部再压一条横向暗带，保证网址/电话落在亮图上时也可读
band = Image.new("L", (W, H), 0)
bd = ImageDraw.Draw(band)
for y in range(H - 150, H):
    t = (y - (H - 150)) / 150
    bd.line([(0, y), (W, y)], fill=int(165 * t**1.3))
canvas = Image.composite(Image.new("RGB", (W, H), NAVY), canvas, band)

d = ImageDraw.Draw(canvas)

# ── 3. LOGO：真实白色 PNG，等比缩到 300px 宽 ────────────────────────
logo = Image.open(io.BytesIO(fetch(LOGO_SRC))).convert("RGBA")
lw = 300
lh = round(logo.height * lw / logo.width)
logo = logo.resize((lw, lh), Image.LANCZOS)
LX = 64
canvas.paste(logo, (LX, 58), logo)

# ── 4. 文字块 ───────────────────────────────────────────────────────
TEXT_X = LX
TEXT_W = 520  # 文字可用宽度（控制在渐变淡出点之前，保证对比度）

y = 58 + lh + 44
d.rectangle([TEXT_X, y, TEXT_X + 74, y + 5], fill=BRONZE)  # 金色短横
y += 30

f_head = fit_font(d, max(HEADLINE, key=len), True, 64, TEXT_W)
for line in HEADLINE:
    d.text((TEXT_X, y), line, font=f_head, fill=WHITE)
    y += int(f_head.size * 1.16)

y += 10
f_sub = fit_font(d, SUBLINE, False, 27, TEXT_W)
d.text((TEXT_X, y), SUBLINE, font=f_sub, fill=(228, 228, 236))
y += f_sub.size + 12

f_fact = fit_font(d, FACTLINE, False, 24, TEXT_W)
d.text((TEXT_X, y), FACTLINE, font=f_fact, fill=BRONZE)

# 底部：网址 + WhatsApp（与上方文字同列左对齐，字号层级低于标题）
f_site = fit_font(d, SITE_LINE, True, 30, TEXT_W)
f_wa = fit_font(d, WA_LINE, False, 25, TEXT_W)
d.text((TEXT_X, H - 96), SITE_LINE, font=f_site, fill=WHITE)
d.text((TEXT_X, H - 56), WA_LINE, font=f_wa, fill=(228, 228, 236))

# ── 5. 输出：JPG 为交付格式（Meta 官方推荐，微信 / LinkedIn 兼容性最稳）──
out_jpg = os.path.join(OUT_DIR, "share-card-1200x630.jpg")
canvas.save(out_jpg, "JPEG", quality=90, optimize=True, progressive=True)
canvas.save(os.path.join(OUT_DIR, "share-card-1200x630.webp"), "WEBP", quality=88, method=6)
# 聊天框预览：按 WhatsApp 卡片实际显示尺寸缩一遍，确认文字仍可读
canvas.resize((600, 315), Image.LANCZOS).save(os.path.join(OUT_DIR, "preview-in-chat.png"))

print("已生成：")
for name in ("share-card-1200x630.jpg", "share-card-1200x630.webp", "preview-in-chat.png"):
    p = os.path.join(OUT_DIR, name)
    print("  %-58s %d KB" % (os.path.relpath(p, ROOT), os.path.getsize(p) // 1024))
print("\n下一步：见本文件 docstring 的上传与接线命令。")
