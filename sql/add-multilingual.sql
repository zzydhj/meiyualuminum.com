-- ============================================================
-- 多语言框架 — 数据库改造
-- 为所有内容表添加 lang（语言）和 original_id（翻译溯源）列
-- 现有数据自动标记为 lang='en'，零迁移
-- ============================================================

-- posts 表（博客文章 / 项目案例）
ALTER TABLE posts ADD COLUMN IF NOT EXISTS lang TEXT DEFAULT 'en';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS original_id INTEGER;

-- pages 表（单页内容 / 项目画廊页）
ALTER TABLE pages ADD COLUMN IF NOT EXISTS lang TEXT DEFAULT 'en';
ALTER TABLE pages ADD COLUMN IF NOT EXISTS original_id INTEGER;

-- products 表（产品）
ALTER TABLE products ADD COLUMN IF NOT EXISTS lang TEXT DEFAULT 'en';
ALTER TABLE products ADD COLUMN IF NOT EXISTS original_id INTEGER;

-- videos 表（视频）
ALTER TABLE videos ADD COLUMN IF NOT EXISTS lang TEXT DEFAULT 'en';
ALTER TABLE videos ADD COLUMN IF NOT EXISTS original_id INTEGER;

-- ============================================================
-- 索引：加速按语言查询
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_posts_lang ON posts(lang);
CREATE INDEX IF NOT EXISTS idx_pages_lang ON pages(lang);
CREATE INDEX IF NOT EXISTS idx_products_lang ON products(lang);
CREATE INDEX IF NOT EXISTS idx_videos_lang ON videos(lang);

-- original_id 索引：加速 hreflang 翻译关联查询
CREATE INDEX IF NOT EXISTS idx_posts_original ON posts(original_id);
CREATE INDEX IF NOT EXISTS idx_pages_original ON pages(original_id);
CREATE INDEX IF NOT EXISTS idx_products_original ON products(original_id);
CREATE INDEX IF NOT EXISTS idx_videos_original ON videos(original_id);

-- ============================================================
-- 验证
-- ============================================================
-- SELECT table_name, column_name FROM information_schema.columns
-- WHERE column_name IN ('lang', 'original_id')
-- ORDER BY table_name;
