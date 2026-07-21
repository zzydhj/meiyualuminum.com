# 产品搜索分页 + 博客分页 + 询盘表单

## 架构变更

当前项目为纯静态（`output: "static"`），需要改为混合渲染（`output: "hybrid"`）：
- **产品列表页** `/products/` → SSR 实时查询 Supabase（支持筛选+分页）
- **产品详情页** `/products/[slug]/` → 保持静态（加 `export const prerender = true`）
- **其余所有页面** → 保持静态（加 `export const prerender = true`）

---

## 一、产品列表页（SSR + 筛选 + 分页）

### 改动文件：`astro.config.mjs`
```js
output: "hybrid"  // 从 "static" 改为 "hybrid"
```

### 改动文件：`src/pages/products/index.astro`
- 移除 `export const prerender`（默认 SSR in hybrid）
- 从 `Astro.url.searchParams` 读取筛选参数和页码
- 构建 Supabase 查询：根据传入参数动态添加 `.eq()` / `.ilike()` / `.contains()` 条件
- 分页：每页 12 条，用 `.range(from, to)` 实现
- 查询 total count 用于计算总页数

**筛选维度：**
| 筛选器 | 字段 | 类型 |
|--------|------|------|
| 关键词搜索 | title / part_code / description | 文本输入，ilike 模糊匹配 |
| OE 码搜索 | oe_codes (数组) | 文本输入，contains 匹配 |
| 产品分类 | primary_category_id | 下拉框 |
| 产品品牌 | brand | 下拉框 |
| 适配车型品牌 | vehicle_brand | 下拉框 |
| 适配车型型号 | vehicle_model | 下拉框（联动） |

**URL 格式示例：**
```
/products/?q=brake&category=1&brand=Toyota&v_brand=Toyota&v_model=Camry&page=2
```

### 改动文件：`src/pages/products/[slug].astro`
- 添加 `export const prerender = true` 保持静态生成

### 新增文件：`src/components/ProductFilters.astro`
- 筛选表单组件：搜索框 + 下拉框 + 筛选按钮
- 表单提交用 GET 方式，参数自动进入 URL

### 新增文件：`src/components/Pagination.astro`
- 通用分页组件：上一页/下一页 + 页码链接
- 接收 props: `currentPage`, `totalPages`, `baseUrl`（带筛选参数的基础 URL）

### 其余静态页面
以下文件需添加 `export const prerender = true`：
- `src/pages/index.astro`
- `src/pages/[page].astro`
- `src/pages/blog.astro`
- `src/pages/blog/[...slug].astro`
- `src/pages/categories/index.astro`
- `src/pages/categories/[slug].astro`
- `src/pages/tags/index.astro`
- `src/pages/tags/[tag].astro`

---

## 二、博客分页（SSG）

### 改动文件：`src/pages/blog.astro`
- 使用 Astro 的 `paginate()` 工具函数
- 每页 10 篇
- 生成 `/blog/`、`/blog/2/`、`/blog/3/` 等静态页面
- 添加 `Pagination` 组件

---

## 三、询盘表单（Web3Forms 纯静态）

### 方案说明
使用 [Web3Forms](https://web3forms.com)（免费，无需后端）：
1. 注册获取 Access Key（免费）
2. HTML form 的 action 指向 `https://api.web3forms.com/submit`
3. 提交后 Web3Forms 自动发邮件到你指定的邮箱（可配多个）

### 改动文件：`src/pages/contact.astro`（或新建，取决于 contact 页面当前实现方式）
- 当前 contact 是数据库 pages 表中的页面，通过 `[page].astro` 渲染
- **方案**：新建 `src/pages/contact.astro` 专用页面（覆盖动态路由）
- 包含：姓名、邮箱、公司、产品型号（可选）、询盘内容
- 提交后直接发邮件

### 数据库改动
- 在 Supabase 中新建 `inquiries` 表（可选，如果想留存记录的话）
- 但 Web3Forms 本身就能发邮件 + 在后台查看，所以数据库表是可选的

---

## 四、实施顺序

1. 改 `astro.config.mjs` 为 hybrid
2. 给所有现有页面加 `prerender = true`
3. 构建验证（确保没破坏）
4. 创建 `Pagination.astro` 通用组件
5. 重写 `products/index.astro`（SSR + 筛选 + 分页）
6. 创建 `ProductFilters.astro` 组件
7. 改 `blog.astro` 用 paginate()
8. 新建 `contact.astro` 询盘表单页
9. 最终构建验证
