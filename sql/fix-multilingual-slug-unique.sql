-- ============================================================
-- 修复多语言唯一约束（关键前置迁移）
--
-- 问题：products 表存在 slug 单列唯一约束 products_slug_key，
--       导致「同一 slug + 不同 lang」的翻译记录无法插入（报 23505 duplicate key）。
--       add-multilingual.sql 当初只加了 lang 列与普通索引，未删除旧的单列唯一约束。
--
-- 方案：删除各内容表 slug 单列唯一约束，改建 (slug, lang) 复合唯一索引。
--       这样同一 slug 可在不同语言各存一条，且同语言内 slug 仍唯一。
--
-- 执行：Supabase Dashboard → SQL Editor → 粘贴运行（应用密钥无法执行 DDL）。
-- 幂等：全部用 IF EXISTS / IF NOT EXISTS，可重复运行。
-- ============================================================

-- ---------- products ----------
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_slug_key;
DROP INDEX IF EXISTS products_slug_key;
CREATE UNIQUE INDEX IF NOT EXISTS products_slug_lang_uq ON products (slug, lang);

-- ---------- posts（博客/项目案例）----------
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_slug_key;
DROP INDEX IF EXISTS posts_slug_key;
CREATE UNIQUE INDEX IF NOT EXISTS posts_slug_lang_uq ON posts (slug, lang);

-- ---------- videos ----------
ALTER TABLE videos DROP CONSTRAINT IF EXISTS videos_slug_key;
DROP INDEX IF EXISTS videos_slug_key;
CREATE UNIQUE INDEX IF NOT EXISTS videos_slug_lang_uq ON videos (slug, lang);

-- ---------- pages（独立单页；原本可能无 slug 唯一约束，统一建复合唯一）----------
ALTER TABLE pages DROP CONSTRAINT IF EXISTS pages_slug_key;
DROP INDEX IF EXISTS pages_slug_key;
CREATE UNIQUE INDEX IF NOT EXISTS pages_slug_lang_uq ON pages (slug, lang);

-- ============================================================
-- 验证：应能看到复合唯一索引，且不再有 slug 单列唯一约束
-- ============================================================
-- SELECT indexname, indexdef FROM pg_indexes
-- WHERE tablename IN ('products','posts','videos','pages')
--   AND indexdef ILIKE '%UNIQUE%'
-- ORDER BY tablename, indexname;
