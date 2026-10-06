# R2 图片流水线 · 配置与使用（跨设备可复现）

> 配套脚本：[`docs/r2-image-pipeline.py`](./r2-image-pipeline.py)（pipeline-core v1.1）、
> [`docs/migrate-hotlinks-to-r2.py`](./migrate-hotlinks-to-r2.py)（hotlink-migrator v1.0，见 §9）
> 配套提示词：[`docs/blog-prompt-v5.md`](./blog-prompt-v5.md) 附录 B、
> [`docs/Project-Promotion-V5.8.md`](./Project-Promotion-V5.8.md) 附录 B
>
> **迁移方式**：把整个 `docs/` 文件夹拷到新电脑/新仓库即可复用——密钥文件
> `docs/r2-credentials.env` 就在里面（已被 `.gitignore` 忽略，**拷文件夹会跟着走、提交仓库不会走**），
> 因此只需再装 `boto3` 就能跑，零配置。

---

## 0. 固定配置（非机密，已写死在脚本里，换电脑不用改）

| 项 | 值 |
|---|---|
| Cloudflare Account ID | `c58d6530184ba13658bd5a73cf611ff6` |
| S3 兼容 Endpoint | `https://c58d6530184ba13658bd5a73cf611ff6.r2.cloudflarestorage.com` |
| Region | `auto` |
| Bucket | `meiyu` |
| 公开访问域名 | `https://file.meiyualuminum.com/` |
| Key 前缀 | `blog/` |
| 完整 Key 格式 | `blog/<主题>/<语义名>-<sha1前6位>.<ext>` |

**唯一机密**是 AK/SK 两项，只从环境变量、项目根 `.env` 或 `docs/r2-credentials.env` 读取（三者均已 gitignore）。

---

## 1. 前置依赖（新电脑一次性）

```powershell
python --version          # 需 3.9+
pip install boto3         # 唯一第三方依赖
```

装不上 boto3 时的备用方案（无需 Python）：

```powershell
aws s3 cp .tmp-img\a.jpg s3://meiyu/blog/metal-ceiling/a-<hash6>.jpg `
  --endpoint-url https://c58d6530184ba13658bd5a73cf611ff6.r2.cloudflarestorage.com `
  --content-type image/jpeg
```

---

## 2. 令牌与密钥

### 2.1 令牌从哪来（Cloudflare 面板）

R2 → 选择桶 `meiyu` → **API Tokens** → Create API Token：

- 权限：**Object Read & Write**（允许读取、写入和列出特定存储桶中的对象）
- 指定存储桶：`meiyu`（**只勾这一个** → 最小权限，泄露也只影响本桶）
- 创建后 **Secret Access Key 只显示一次**，立刻保存

> ⚠️ 令牌是**按桶授权**的：这份令牌碰不到 `autopartsfirst` 等其它桶，
> `list_buckets` 会被拒（AccessDenied）属正常现象。要操作别的桶必须另建令牌。

### 2.2 密钥填在哪（三选一）

**A · `docs/r2-credentials.env`（推荐：随 docs/ 文件夹一起迁移，换机零配置）**

```ini
R2_ACCESS_KEY_ID=<你的 AK>
R2_SECRET_ACCESS_KEY=<你的 SK>
# 迁移工具还要读这两项（只读文章，不写库）
PUBLIC_SUPABASE_URL=<站点 URL>
PUBLIC_SUPABASE_ANON_KEY=<publishable key>
```

**B · 项目根 `.env`（`.gitignore` 已忽略）**

```ini
R2_ACCESS_KEY_ID=<你的 AK>
R2_SECRET_ACCESS_KEY=<你的 SK>
```

**C · 临时环境变量（只当次会话有效，最安全）**

```powershell
# PowerShell
$env:R2_ACCESS_KEY_ID="<AK>"; $env:R2_SECRET_ACCESS_KEY="<SK>"
```

```bash
# bash / zsh
export R2_ACCESS_KEY_ID="<AK>"; export R2_SECRET_ACCESS_KEY="<SK>"
```

脚本读取顺序：**进程环境变量 → 项目根 `.env` → `.env.local` → `docs/r2-credentials.env`**
（先找到的生效，三处同时存在也不冲突）。

### 2.3 安全红线（已写进两个提示词）

- 密钥**禁止**出现在：仓库任何被跟踪文件、提示词正文、交付页 HTML、导入 SQL、日志、聊天回复、AI 输出里；
- **`docs/r2-credentials.env` 只能随文件夹物理拷贝**：不要提交（已 gitignore）、不要粘给第三方 AI、
  不要截图外发、不要上传网盘/聊天工具；两个提示词的附录 B 只引用它的**路径**，不包含密钥值；
- 脚本不打印密钥内容（`--check` 只显示“已找到”）；
- `.env` / `.env.local` / `docs/r2-credentials.env` / `.tmp-img/` / `.tmp-migrate/` / `__pycache__/` 均已在 `.gitignore` 中；
- 令牌泄露时的处置：Cloudflare 面板删除该令牌并重建（不影响已上传对象），然后更新本文件与 `.env`。

---

## 3. 连通性自检

```powershell
python docs/r2-image-pipeline.py --check
```

期望输出（全部 OK 才算通；下面是脚本实际会打的字，逐行对得上才算通过）：

```
[i] pipeline-core v1.1
    python   3.13.7
    boto3    1.43.77
    密钥     已找到（不显示内容）
    endpoint https://c58d6530184ba13658bd5a73cf611ff6.r2.cloudflarestorage.com
    bucket   meiyu   prefix blog/   domain https://file.meiyualuminum.com/
    桶可达   OK（blog/ 下示例 key: blog/metal-ceiling/xxx-441f73.jpg）
    公开读   OK（HTTP 200 image/jpeg）
```

任一步失败 → 脚本非 0 退出，AI 会自动改走**回退路径**（热链原图 + Zone 4 待替换 TODO），
文章照样写得出来，不会卡住。

---

## 4. 日常用法（对应提示词 P1–P5）

### 4.1 推荐三阶段（需要 vision 核对图内容时）

```powershell
# P1 下载到 .tmp-img/，输出本地路径清单
python docs/r2-image-pipeline.py --plan plan.json --stage download

# P2 AI 逐张 Read 本地图片做 vision 核对，必要时修订 plan.json 里的 topic / semantic

# P3–P4 命名 + HEAD 去重 + 上传 + 公开 URL 200 校验 + 校验通过即删本地副本
python docs/r2-image-pipeline.py --plan plan.json --stage upload --out result.json
```

`plan.json`：

```json
[
  {"src": "https://ref-site.com/a.jpg", "topic": "metal-ceiling", "semantic": "tree-of-life-hero"},
  {"src": "https://ref-site.com/b.jpg", "topic": "projects",       "semantic": "trial-assembly"}
]
```

`result.json`（供交付页 Zone 4 与 figure src 直接取用）：

```json
[{"src":"...","topic":"metal-ceiling","semantic_raw":"tree-of-life-hero",
  "key":"blog/metal-ceiling/tree-of-life-hero-441f73.jpg",
  "url":"https://file.meiyualuminum.com/blog/metal-ceiling/tree-of-life-hero-441f73.jpg",
  "bytes":184320,"sha1_6":"441f73","status":"uploaded","public_check":"200 image/jpeg","cleaned":true}]
```

`status` 取值：`uploaded`（新传）/ `reused`（同 key 已存在，直接复用 URL）/
`verify-failed`（公开域校验没过）/ `failed`（下载或上传异常，含原因）。

### 4.2 一次跑完 / 单图

```powershell
python docs/r2-image-pipeline.py --plan plan.json                      # download+upload
python docs/r2-image-pipeline.py --url https://ref/a.jpg --topic acoustic-ceiling --semantic perforated-tile-atrium
python docs/r2-image-pipeline.py --file .tmp-img\a.jpg --topic projects --semantic site-install
python docs/r2-image-pipeline.py --plan plan.json --keep-tmp            # 保留临时文件
```

---

## 5. 命名与主题规则速查（与提示词完全一致）

**主题闭集（9 个，恒定不增长）**
`acoustic-ceiling` / `metal-ceiling` / `other-ceiling` / `facade-cladding` /
`metal-panel` / `wall-panel` / `ceiling-grid-baffle` / `projects` / `general`

**判定顺序**：① 材质/产品族 → ② 功能修饰（穿孔/吸音优先 `acoustic-ceiling`；非铝天花 `other-ceiling`）
→ ③ 项目语境（工地/安装中/项目渲染 → `projects`）→ ④ 九类内最接近 → ⑤ `general` 兜底。
**禁止自创文件夹**（脚本会把非法 topic 自动落 `general`）。

**语义名**：2~5 个连字符关键词、全小写；脚本自动清洗为 `[^a-z0-9]→-`、截断到 5 段、
删除竞品品牌词（`prance` / `lifisher` / `autopartsfirst`）。

**哈希后缀**：`sha1(文件字节)[:6]` → 同内容同 key（幂等复用），不同内容必不同 key（永不覆盖），
因此并发/多 AI/重写都不会撞名，无需任何登记表。

---

## 6. 清理与治理

```powershell
python docs/r2-image-pipeline.py --cleanup    # 强制删 .tmp-img/
python docs/r2-image-pipeline.py --stats      # 各主题对象数 + general 高频语义前缀 Top15
```

- **临时文件**：默认在"上传 + 公开校验 200"通过后**立即删除**该副本；批次结束再清理空的 `.tmp-img/`。
  需要留档时用 `--keep-tmp`。
- **general 治理**：`--stats` 报出的高频语义前缀若成规模（例如某前缀 ≥10 张），
  由**用户决定是否新增主题**并升提示词版本；AI 不得自行新增；旧图不强制迁移（URL 不变不坏）。
- **文件夹名不影响 SEO**：关键词信号在文件名 / alt / 正文，不在路径。

---

## 7. 故障排查

| 现象 | 原因 | 处置 |
|---|---|---|
| 下载 403 | 默认 UA 被参考站拦 | 脚本已带浏览器 UA + Referer + 重试；仍 403 → 用 Browser 子代理取图或请用户提供 |
| `AccessDenied` / `list_buckets` 被拒 | 令牌按桶授权，无账号级权限 | 正常现象；确认桶名是 `meiyu` |
| `未安装 boto3` | 缺依赖 | `pip install boto3`，或改用 §1 的 aws cli 备用命令 |
| `缺少 R2 密钥` | 三个来源都没找到 | 按 §2.2 任选一种填写；AI 会自动转回退热链路径 |
| 上传成功但公开 URL 404 | 自定义域 `file.meiyualuminum.com` 未绑定/CNAME 未生效 | Cloudflare → 桶 → Settings → Custom Domains 检查 |
| 公开 URL 403 | 桶未开公开访问或域未走 CDN | 同上，确认公开访问已启用 |
| 想换桶 / 换站点 | 令牌只授权旧桶 | 新建对应桶的令牌，并改脚本顶部 `R2_BUCKET` / `R2_PUBLIC_BASE` |

---

## 8. 换新电脑 / 换 IDE 的完整步骤

1. 拷贝 `docs/` 整个文件夹（含本文件、两个脚本、两个提示词、`r2-credentials.env`）到新项目；
2. `pip install boto3`；
3. `python docs/r2-image-pipeline.py --check` → 全 OK 即可用（密钥随文件夹到位，无需再填）；
4. 让 AI 按提示词写文章，它会自动调用本脚本完成 P1–P5，交付页里的图片 URL 就是最终 R2 地址。

> 只拷提示词正文、不带 `docs/` 时：附录 B 仍可就地复现流水线，但密钥需你自己在对话里给
> （安全性差于拷文件夹），或在新项目根建 `.env`。

> 提示词里的「附录 B」内嵌了同一套 core 代码，因此**即使只把提示词正文粘贴给别的 AI**
> （不带 docs 文件夹），它也能就地复现整条流水线。三处代码同源，修改时以
> `docs/r2-image-pipeline.py` 为准并同步两个附录 B（版本号：pipeline-core v1.1）。

---

## 9. 已发布文章的竞品热链批量迁移

旧文章里直接引用了第三方域名（如 `prancebuilding.com`）的图，用
[`docs/migrate-hotlinks-to-r2.py`](./migrate-hotlinks-to-r2.py) 一次搜完：

```powershell
python docs/migrate-hotlinks-to-r2.py --stage plan      # 只读：出清单 + 推导主题/语义名（不下载）
python docs/migrate-hotlinks-to-r2.py --stage download   # 下载到 .tmp-migrate/（可逐张 vision 核对后手改 plan.json）
python docs/migrate-hotlinks-to-r2.py --stage upload     # 上传 R2（HEAD 去重 + 公开校验 200 + 删本地副本）
python docs/migrate-hotlinks-to-r2.py --stage sql        # 出 docs/sql/<日期>-hotlink-to-r2.sql 与 .mapping.csv
python docs/migrate-hotlinks-to-r2.py --stage all --allow-partial   # 一次跑完，允许部分图失败
python docs/migrate-hotlinks-to-r2.py --verify           # 只读校验：库里还剩多少竞品引用
python docs/migrate-hotlinks-to-r2.py --domain other.com # 迁移其它竞品域名
```

安全约束（已写进脚本）：

- **只用 anon key 读库，绝不写库**；改库由你在 Supabase SQL Editor 手动跑生成的 `.sql`（可控、可回滚、有留档）；
- SQL 用 `replace()` 嵌套、包在 `BEGIN; … COMMIT;` 里，**幂等**（已换过的链接不会再匹配，可重复跑）；
- **旧对象不自动删除**：等你跑完 SQL、核对页面无裂图后，再单独确认清理；
- 下载 404 的图（参考站已删）会被标为 `download-failed`；**默认会中止 SQL 生成**，
  确认只为已成功部分出 SQL 时加 `--allow-partial`，失败项会在 SQL 头部注释里逐条列为 TODO（绝不编造 URL）；
- 重跑 `--stage plan` 默认**沿用上一轮已上传的 key / URL / 命名**（不因为命名规则微调而改名重传）；
  确需按最新规则重传加 `--fresh`（旧对象会变孤儿，需事后清理）；
- `.tmp-migrate/` 已 gitignore；`docs/sql/` 是有意的迁移留档（不含密钥，可进仓库）。
