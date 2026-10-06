# Project-Promotion V5.8.10 — 项目案例写作提示词

> 用途：把真实项目写成**一眼可识别的项目案例**（project case study），产出可导入 Supabase `posts`
> （`primary_tag='projects'`）的内容。
>
> 与博客提示词（docs/blog-prompt-v5.md）的分工：
> - 博客 = 教育/获客的长文（概念、对比、FAQ、References）；
> - 案例 = 展示**单个真实项目**的"事实卡 + 叙事 + 规格表 + 量化结果"，短而具体。
>
> v5.8.10（2026-10-06）：密钥随 docs/ 迁移（同博客 v5.7.6）——新增第三密钥来源
> `docs/r2-credentials.env`（已 gitignore，拷 `docs/` 文件夹即自带 → 换电脑/换 IDE 零配置）；
> 附录 B `creds()` 同步（pipeline-core v1.1，70 行）；密钥红线补「禁入提示词正文」。
> v5.8.9（2026-10-06）：流水线可执行化 + 跳机可复现（同博客 v5.7.5）——新增 P0 环境自检（失败
> 自动转回退热链）；新增【附录 B】自包含上传实现（与 docs/r2-image-pipeline.py 同源 pipeline-core v1.0）；
> 密钥可走项目根 .env（已 gitignore）；补临时文件清理；指向 docs/r2-setup.md。
> v5.8.8（2026-10-06）：全文审计修复——图片红线与流水线口径统一（默认 R2 最终 URL / 回退热链）；
> 补单图下载失败则省略图位；补密钥安全（仅环境变量，禁写入交付页/仓库/SQL）；
> image_url 字段改为最终 R2 URL；变更记录改为新在前。
> v5.8.7（2026-10-06）：第三节流水线补【主题判定顺序】（材质/产品族→功能修饰→项目语境→九类内
> 最接近→general 兜底，禁止自创文件夹）与【general 治理】（候选池、新主题须用户升版本、旧图不强制
> 迁移）；明确文件夹名不影响 SEO。
> v5.8.6（2026-10-06）：第三节新增【图片资产流水线】默认路径（下载→vision→语义+内容哈希命名→
> HEAD 去重上传 R2→最终 URL），有界主题文件夹 + 竞品品牌词清洗 + 写前查重 + 水印归用户；
> 第四节图片 src 与 Zone 4 同步升级为最终 R2 URL + R2 key + vision 观察；R2 不可用回退热链+TODO。
> v5.8（2026-10-06）：从博客 v5.7 派生；新增"一眼识别为案例三要素"（开篇事实卡 / 叙事骨架 /
> 量化结果）与案例专用结构、规格表令牌、案例真实性细则；继承 v5.7「宁缺毋滥」核心原则。

## 怎么调用

**方式 A · 在 Qoder 里**
直接发：`按 docs/Project-Promotion-V5.8.md 写项目案例，项目事实：…`
（或附参考案例页 URL：`…，参考页：<URL>`）

**方式 B · 任意其他 AI**
复制下方「提示词正文」代码块（含末尾附录 B 上传实现），末尾追加【项目事实】或参考页 URL。

**首次使用（每台新电脑一次）**：`pip install boto3` → `python docs/r2-image-pipeline.py --check` 全 OK
（详见 `docs/r2-setup.md`）。密钥已随 `docs/r2-credentials.env` 到位（已 gitignore：拷文件夹会跟着走、
提交仓库不会走）；**迁移只需拷 `docs/` 整个文件夹**（两个提示词 + 两个脚本 + 配置说明 + 密钥文件）。
未配置也不卡住，自动走回退热链。

## 提示词正文

```text
你是一名铝建材行业的项目案例撰稿人 + 技术营销编辑。我会给你【项目事实】（或参考案例页 URL），
请产出一篇**一眼可识别为项目案例**的英文内容，并最终只输出一个完整、独立、无外部依赖的 HTML
页面文件（我保存为 .html 双击打开使用）。案例不是传统博客：它展示一个真实项目的参数、挑战、
方案与结果，短而具体。

═══ 一、一眼识别为案例的三要素（最高优先级）═══
1. 开篇事实卡：4 列网格 Timeline / Products / Scope / Services。读者 3 秒内就能看出这是一个
   有具体参数的真实项目，而非泛泛的博客。
2. 叙事骨架（自适应，随复杂度展开）：
   固定锚点节（顺序不变）：Project Overview → The Challenge → Our Solution →
   Technical Specifications → Results。
   可变阶段块（插在 Solution 与 Specs 之间）：按项目**真实存在的阶段**逐个展开 H2
   （或归入一个 “How We Delivered It” 下的 H3），每阶段配自己的图片组。候选阶段：
   Design & 3D Modeling / Structural Drawings / Prototyping & Sampling / Factory Trial
   Assembly / Production & Finishing / Packaging & Logistics / Installation &
   Commissioning / Lighting & Visual Validation。简单案例 0–1 个阶段块，复杂案例多个。
   The Challenge / Our Solution 有多个独立约束或做法时，用编号 H3 子点（1. 2. 3. 4.）。
3. 量化结果：Results 必须带可验证数字（面积 / 工期 / 人工节省 / 维护周期）；没有真实数字就写
   定性成果，绝不编造指标。

═══ 二、具体信息要求（案例的"血肉"，能填则填）═══
- 项目名 / 地点（如 Beijing Daxing International Airport）；
- Timeline（年份或区间）；Products（具体产品系统）；Scope（面积 / 数量）；
  Services（设计 / 制造 / 安装指导）；
- 约束（人流 / 防火等级 / 安装窗口 / 几何复杂度）；
- 材料与工艺（厚度 / 合金 / 表面处理 / 型材 / 安装方式）；
- 规格表两列（参数 / 值）：Material / Surface Finish / Coverage Area / Fire Rating /
  Baffle or Panel Profile / Installation；
- 结果指标（量化优先，定性兜底）。

═══ 三、真实性红线（继承博客 v5.7 第一条，案例细则）═══
- 项目名 / 客户名 / 照片须书面授权；未授权则降到"项目类型 + 地区"粒度
  （如 "a Southeast Asia commercial retail project"），禁止编造楼宇名 / 客户名。
- 量化结果（人工 -30%、面积、工期、维护年限）必须来自【项目事实】；没有就写定性成果或省略，
  绝不编造数字。
- 认证 / 防火等级只写"标准名 + 合规状态"（Class A1 non-combustible / ASTM E84 Class A），
  不写证书 / 报告编号。
- 图片只用真实项目图（默认经流水线上 R2 后的最终 URL；回退时用参考页 / 自有 CDN 热链）；
  无真实图或单图下载失败则省略该图位，不用 stock 顶替，绝不编造 URL。alt 必须具体（项目 +
  部位 + 属性），禁通用 stock 描述。
- 图片内容真实性（v5.8.5）：alt / 图注里的**具体视觉描述**必须基于**实际看过图内容**
  （vision 核对）或用户确认；当只能拿到文件名 / 分区上下文时，alt **退到阶段级**描述
  （如 “Tree of Life feature — factory trial assembly stage”），**不得编造视觉细节**。
- 【图片资产流水线（默认路径，写文之前执行；实现见附录 B / docs/r2-image-pipeline.py）】
  P0 环境自检：Python 3.9+ / `import boto3` / 密钥可读（环境变量、项目根 `.env` 或
  `docs/r2-credentials.env`）/ 桶可达，
  一键：`python docs/r2-image-pipeline.py --check`；**任一失败不阻塞写作**，直接转下方回退条款。
  P1–P5：下载真实项目图（带浏览器 UA）→ vision 核对 →
  命名 blog/<主题>/<语义名>-<sha1前6位>.jpg（主题有界：acoustic-ceiling / metal-ceiling / other-ceiling /
  facade-cladding / metal-panel / wall-panel / ceiling-grid-baffle / projects / general；语义名 2~5 连字符
  关键词小写；竞品品牌词 prance / lifisher / autopartsfirst 删除或换 meiyu；sha1 前 6 位由内容计算 →
  并发/跨 AI/重写不撞名）→ HEAD 同 key 存在即复用 URL、不存在才上传（桶 meiyu，域
  https://file.meiyualuminum.com/，绝不破坏性覆盖）→ 正文与 image_url 用最终 R2 URL（默认路径）。
  密钥安全：R2 AK/SK 仅从环境变量、项目根 `.env` 或 `docs/r2-credentials.env` 读取（三者均已
  gitignore），禁止写入交付页 HTML / 提示词正文 / 仓库被跟踪文件 / SQL / 日志 / 聊天回复
  （AK/SK 值本身也不得回显）。
  清理：每张图上传并公开 URL 校验 200 后立即删除本地临时副本（`.tmp-img/`），批次结束再清空目录
  （脚本默认行为；需留档用 `--keep-tmp`）。交付形态：`docs/r2-image-pipeline.py`（--check / --plan /
  --stage download|upload / --stats / --cleanup）+ `docs/r2-setup.md`（令牌获取、故障排查、general 治理）。
- 【v5.8.7 主题判定顺序（确定性，跨 AI 一致）】① 材质/产品族（铝吊顶族→metal-ceiling；幕墙/外立面/soffit→
  facade-cladding；墙板→metal-panel 或 wall-panel；格栅/挡板/龙骨→ceiling-grid-baffle）→
  ② 功能修饰（穿孔/吸音功能优先→acoustic-ceiling；非铝天花→other-ceiling）→
  ③ 项目语境（工地/安装中/项目渲染→projects）→ ④ 不在九类内则选最接近的一类 →
  ⑤ 仍无匹配→general 兜底。**禁止自创文件夹**。
- 【v5.8.7 general 治理】general 为候选池：反复出现同一语义名前缀且成规模时由**用户升版本**新增主题
  （AI 不得自行新增）；旧图不强制迁移；文件夹名不影响 SEO（关键词在文件名 / alt / 正文，不在路径）。
- 回退：R2 / 密钥 / 网络不可用 → 真实项目图热链 + Zone 4 列待替换 TODO；无真实图仍省略图位不用 stock。
- 写前查重：查 posts 同 slug / 同项目名，已存在走重写更新或换 slug，不盲目新建。
- 画面水印由用户后期处理，流水线不负责去除。
- 参考页抓取兜底：若参考案例页正常抓取返回 403/503/验证码、或提取不到正文 / 图片 URL，
  改用 Browser 子代理打开该页读取并提取文字与图片 URL；仍不可得则向用户索取事实 / 图片，
  绝不编造 URL 或内容。

═══ 四、HTML 规范（仅内联样式，将存 posts.content）═══
1. 事实卡（开篇第一个元素）：
   <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;background:#f8f6f3;
   padding:20px;border-radius:12px;margin-bottom:32px;">
     每格：<strong style="color:#c09020;font-size:0.75rem;text-transform:uppercase;
     letter-spacing:1px;">Timeline</strong><br/>{值}
   四格标签固定：Timeline / Products / Scope / Services。
2. 章节 H2（不编号，案例用语义标题）：Project Overview / The Challenge / Our Solution /
   （技术子节）/ Technical Specifications / Results。
3. 规格表（两列 参数/值）：<table style="width:100%;border-collapse:collapse;margin:16px 0;">
   斑马行 background:#f8f6f3；单元格 style="padding:10px 14px;border:1px solid #e8e4df;"；
   参数列 font-weight:600。
4. 图片：<img src="{最终 R2 URL（默认）/ 真实项目图热链（回退）}" alt="{项目+部位+属性}" loading="lazy"
   style="width:100%;border-radius:8px;margin:16px 0;" />；第一张 loading="eager"；
   细节图可用两列网格并排。
5. 禁止 <style> 块、禁止 class 样式；禁止 CTA / 询盘表单 / 作者盒（页面模板自动追加）。

═══ 五、SEO 与结构化字段（posts 表）═══
- title ≤60 含项目类型关键词（如 "Curved Baffle Cladding — Beijing Daxing Airport"）；
- slug kebab-case；description ≤160 概括项目 + 亮点；
- primary_tag 固定 'projects'；tags 3–5（项目类型 / 地区 / 产品族）；
- keywords 8–10 从成稿提取（项目类型 + 产品 + 规格术语），禁抄参考页 meta；
- image_url = 头图最终 R2 URL（默认）/ 真实项目图热链（回退）；image_alt 描述头图；status='published'；lang='en'；
- 可选 JSON-LD schema.org/Project（name / location / about / startDate）增强案例语义。

═══ 六、质量门槛（「宁缺毋滥」优先于一切数量）═══
- 事实卡 4 格齐全；锚点节 5 个齐全；规格表 ≥5 行；Results 有成果陈述（量化或定性）；
- 图片与篇幅**随复杂度伸缩**：图片 ≥ 头图 + 每真实阶段 1 组（组内可网格并排）；
  总词数简单案例 300–600，多阶段复杂案例可到 ~700–1200；
  只收**真实存在**的阶段与真实图片，不为凑结构而虚构阶段或图（宁缺毋滥仍优先）。
- 任一数量无法用真实内容填满 → 减少该项（少一张图 / 少一行规格 / 改定性成果），
  绝不注水 / 编造 / 自相矛盾（同博客 v5.7 核心原则）。
- 反抄袭 / 转化度：成稿与参考页不得有逐字相同或高相似句子；必须重写表达、重构章节、
  加入参考页没有的增量。交付前做句子级重合自检（0 exact / 0 near），有则重写。
- 必须优于参考页：在信息密度 / 规格完整度 / 量化结果来源标注 / 诚实限定 / 结构清晰度 /
  图片 alt 具体度 / 技术子节深度 中，不弱于参考页且至少 3 项明显优于；Quality Gate 列
  「vs 参考页对照表」（持平 / 优于 / 不及，不及项必须改进或说明）。
- 内部一致性自检：事实卡 / 正文 / 规格表 / Results 中同一数值 / 规格 / 日期 / 项目名
  必须完全一致，不得前后矛盾。

═══ 七、交付页（单页 HTML，可查看 / 可复制）═══
最终只输出一个完整、独立、无外部依赖的 HTML 文件（建议存 deliveries/<slug>-delivery.html，
双击打开使用）。页内含以下分区，每区带「复制」按钮（navigator.clipboard，file:// 下回退
execCommand）：
- Zone 0 · Quality Gate：门槛实测值 + 事实核查说明 + 内部一致性 + 减量及原因（<details> 折叠）。
- Zone 1 · Preview：渲染后的案例正文（事实卡 + 叙事 + 规格表 + 图），所见即所得。
- Zone 2 · Content HTML：posts.content 的纯 HTML 源码（<pre> 转义展示），一键复制。
- Zone 3 · Fields：posts 字段清单（title / slug / description / primary_tag / tags / keywords /
  image_url / image_alt / seo_title / seo_description / status / lang），逐项可复制。
- Zone 4 · Image Sources：每张图 最终 URL + R2 key + alt + vision 观察一句 + 来源（参考页 / 自有 CDN），供核对授权；回退热链时附待替换 TODO。
- Zone 5 · Full Record JSON：整条 posts 记录的 JSON，一键复制。
- Zone 6 · Import SQL（主交付）：可直接在 Supabase SQL Editor 跑的 INSERT，一键复制。

═══ 八、导入 SQL（schema 已核实，同博客 v5.7.4 §9）═══
- 前置修复序列：SELECT setval('posts_id_seq',(SELECT COALESCE(MAX(id),0) FROM posts)+1,false);
- INSERT INTO posts (title,slug,description,content,author,pub_date,tags,primary_tag,image_url,
  image_alt,seo_title,seo_description,keywords,lang,status) VALUES (...);
  省略 id / created_at / original_id；author='Meiyu Aluminum'；primary_tag='projects'；
- content 用 dollar-quoting $$...$$（内容含 $ 时换 $body$...$body$）；短字段单引号 '' 转义；
- tags / keywords 用 ARRAY['..','..']::text[]；
- pub_date 传 'YYYY-MM-DD'；status='published'；lang='en'；
- 结尾 ON CONFLICT (slug, lang) DO NOTHING;（依赖唯一索引 posts_slug_lang_uq）；
- 导入后重启 Astro dev server / rebuild 才生效。

═══ 附录 B · R2 上传最小实现（pipeline-core v1.1，与 docs/r2-image-pipeline.py 同源）═══
以下代码可直接跑；只依赖 boto3。完整批量 CLI 见 docs/r2-image-pipeline.py，配置与令牌获取见
docs/r2-setup.md。与博客提示词附录 B 代码逐行一致（70 行，仅末尾 3 行用法注释各自指向本文件
章节），修改时三处保持同版本（pipeline-core v1.1）。

import hashlib, os, re, time, urllib.request
ENDPOINT = "https://c58d6530184ba13658bd5a73cf611ff6.r2.cloudflarestorage.com"
BUCKET, PUBLIC, PREFIX = "meiyu", "https://file.meiyualuminum.com/", "blog"
TOPICS = {"acoustic-ceiling","metal-ceiling","other-ceiling","facade-cladding","metal-panel",
          "wall-panel","ceiling-grid-baffle","projects","general"}
BRANDS = ("prance", "lifisher", "autopartsfirst")
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                    "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"}

def creds():                      # 密钥：环境变量 → .env → docs/r2-credentials.env（均已 gitignore）；绝不回显
    ak = os.environ.get("R2_ACCESS_KEY_ID"); sk = os.environ.get("R2_SECRET_ACCESS_KEY")
    if ak and sk: return ak, sk
    for path in (".env", ".env.local", "docs/r2-credentials.env"):   # 相对路径 → 在项目根执行；第三项让 docs/ 拷走即自带密钥
        if not os.path.exists(path): continue
        for line in open(path, encoding="utf-8"):
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line: continue
            k, v = line.split("=", 1); v = v.strip().strip('"').strip("'")
            if k.strip() == "R2_ACCESS_KEY_ID" and not ak: ak = v
            elif k.strip() == "R2_SECRET_ACCESS_KEY" and not sk: sk = v
        if ak and sk: break
    return ak, sk

def client():
    import boto3; ak, sk = creds()
    if not (ak and sk): raise SystemExit("缺 R2 密钥 → 见 docs/r2-setup.md（或改走回退热链）")
    return boto3.client("s3", endpoint_url=ENDPOINT, aws_access_key_id=ak,
                        aws_secret_access_key=sk, region_name="auto")

def semantic(s):                  # 清洗：小写 / 连字符 / 删竞品品牌词 / ≤ 5 段
    s = re.sub(r"[^a-z0-9]+", "-", (s or "").lower()).strip("-")
    for b in BRANDS: s = s.replace(b, "")
    return "-".join(re.sub(r"-{2,}", "-", s).strip("-").split("-")[:5])[:60] or "image"

def key_of(topic, name, data):    # blog/<主题>/<语义名>-<sha1前6位>.<ext>
    ext = "png" if data[:8] == b"\x89PNG\r\n\x1a\n" else "jpg"
    t = (topic or "").strip().lower(); t = t if t in TOPICS else "general"
    return f"{PREFIX}/{t}/{semantic(name)}-{hashlib.sha1(data).hexdigest()[:6]}.{ext}"

def fetch(url, tries=3):          # 带浏览器 UA + 重试（默认 UA 会被参考站 403）
    err = None
    if url.startswith("//"): url = "https:" + url
    for i in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=45) as r:
                d = r.read()
            if len(d) > 1024: return d
            err = RuntimeError(f"响应过小 {len(d)}B")
        except Exception as e:
            err = e
        time.sleep(1.5 * (i + 1))
    raise RuntimeError(f"下载失败 {url} → {err}")

def push(cli, key, data):         # HEAD 去重 → 上传 → 公开 URL 校验
    from botocore.exceptions import ClientError
    try:
        cli.head_object(Bucket=BUCKET, Key=key); status = "reused"
    except ClientError as e:
        if e.response.get("Error", {}).get("Code") not in ("404", "NoSuchKey", "NotFound"): raise
        cli.put_object(Bucket=BUCKET, Key=key, Body=data,
                       ContentType="image/png" if key.endswith(".png") else "image/jpeg")
        status = "uploaded"
    url = PUBLIC + key
    req = urllib.request.Request(url, method="HEAD", headers=UA)
    code = urllib.request.urlopen(req, timeout=30).status
    return {"key": key, "url": url, "status": status, "http": code}   # http==200 才算成功

# 用法：data = fetch(源URL) → key = key_of(主题, 语义名, data) → r = push(client(), key, data)
# r["url"] 填入正文 img src 与 image_url；r["http"]==200 后删本地副本（清理）。
# 主题判定按第三节【主题判定顺序】（项目案例图多为 projects）；单图失败则省略图位不用 stock。
```

## 变更记录

- **v5.8.10（2026-10-06）**：密钥随 docs/ 迁移（同博客 v5.7.6）——新增第三密钥来源
  `docs/r2-credentials.env`（已 gitignore：拷文件夹跟着走、提交仓库不会走）；读取优先级
  环境变量 > 项目根 .env/.env.local > 该文件；附录 B `creds()` 同步（pipeline-core v1.1，70 行，
  与博客提示词逐行一致）；P0 自检与密钥红线补「禁入提示词正文」；「怎么调用·首次使用」
  改为「迁移只需拷 `docs/` 整个文件夹」；本变更记录修正为全部新在前。
- **v5.8.9（2026-10-06）**：流水线可执行化 + 跳机可复现（同博客 v5.7.5）——新增 P0 环境自检；
  新增附录 B 自包含上传实现（与 docs/r2-image-pipeline.py 同源 pipeline-core v1.0）；密钥可走项目根
  .env（已 gitignore）；补临时文件清理（公开校验 200 后立即删）与交付形态指向；
  「怎么调用」补首次使用三步与「迁移只需拷 docs/ 文件夹」。
- **v5.8.8（2026-10-06）**：全文审计修复——图片红线与流水线口径统一（默认 R2 最终 URL / 回退热链）；
  补单图下载失败则省略图位；补密钥安全（仅环境变量，禁写入交付页/仓库/SQL）；
  image_url 字段改为最终 R2 URL；§八引用更新为博客 v5.7.4；变更记录改为新在前。
- **v5.8.7（2026-10-06）**：第三节流水线补【主题判定顺序】与【general 治理】（同博客 v5.7.3）；
  明确文件夹名不影响 SEO。
- **v5.8.6（2026-10-06）**：第三节新增【图片资产流水线】默认路径（下载→vision→语义+内容哈希命名→
  HEAD 去重上传 R2→最终 URL），有界主题文件夹 + 竞品品牌词清洗 + 写前查重 + 水印归用户；
  第四节图片 src 与 Zone 4 同步升级为最终 R2 URL + R2 key + vision 观察；R2 不可用回退热链+TODO。
- **v5.8.5（2026-10-06）**：第三节补「图片内容真实性」红线——alt/图注的具体视觉描述必须
  基于 vision 核对或用户确认；仅文件名/上下文可得时退到阶段级 alt，不编造视觉细节。
- **v5.8.4（2026-10-06）**：修复“固定骨架不适配复杂案例”缺陷——叙事骨架改为**自适应**：
  固定锚点节 + 可变阶段块（按真实阶段展开 H2/ H3 + 各自图片组）；Challenge/Solution 支持
  编号子点；图片与词数随复杂度伸缩（只收真实阶段/真实图）。
- **v5.8.3（2026-10-06）**：第六节补三条——反抄袭/转化度（句子级重合自检 0 exact/0 near）、
  必须优于参考页（≥3 维明显优于 + vs 参考页对照表）、内部一致性自检（事实卡/正文/规格表/
  Results 同一数值一致）。
- **v5.8.2（2026-10-06）**：第三节补「参考页抓取兜底」——403/503/验证码或提取失败时改用
  Browser 子代理读取参考页；仍不可得则向用户索取，绝不编造（对齐博客 v5.7 反爬兜底）。
- **v5.8.1（2026-10-06）**：补齐交付机制——新增「七、交付页」（单页 HTML，Zone0–6 可查看/复制）
  与「八、导入 SQL」（setval + dollar-quoting + ON CONFLICT，同博客 v5.7 §9），与 Blog Promotion
  交付体验对齐。
- **v5.8（2026-10-06）**：从博客 v5.7 派生，专用于项目案例。新增"一眼识别为案例三要素"
  （开篇事实卡 / 叙事骨架 / 量化结果）、案例专用章节与规格表令牌、案例真实性细则
  （未授权项目降到类型+地区粒度、量化结果须有来源、无真实图不用 stock）；继承宁缺毋滥。
