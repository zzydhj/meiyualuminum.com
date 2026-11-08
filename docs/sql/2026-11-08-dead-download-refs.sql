-- ============================================================================
-- 死引用清理：/technical-documentation/ 的 13 个下载按钮 + 停用 zh 产品行的 6 个旧图名
-- 生成于 2026-11-08（docs/media-manifest.py 首跑报 19 处 404 引用；复验后其中 18 处
-- 是真死链，1 处是闸门自己的误报——MC catalogue.pdf 实际 200，本脚本把 19 处引用一并摘掉）
-- 修订于同日 v2：校验改成读临时视图，先看数字再落库；并修掉 v1 的两处错
--   v1 错① 八步嵌套只开了 7 个括号（Postgres 当场语法错）
--   v1 错② jsonb_array_length(gallery) —— gallery 真实类型是 text[]，不是 jsonb，
--         那句炸在 LINE 149，整个事务回滚，库里一个字都没变（已读回确认）
--
-- 推荐流程：先按下边【预演】那一段跑（带 ROLLBACK），十二列数字全对，再整段 Run 本文件。
--
-- 执行方式：Supabase → SQL Editor → 整段粘贴 → Run
-- 幂等：可重复运行。第二次跑各步命中 0 处，内容不再变化。
-- 回滚：见文件末尾【回滚】段（执行时先落了两张备份表）
--
-- ⚠️ 顺序：先部署随本 SQL 一起的 InquiryModal.astro 改动（commit 3049805，已上线），
--    再跑本 SQL。反了不会坏 —— 按钮照样打开询盘弹窗，只是 Message 里不会自动带上
--    客户点的那份文档名，业主收到询盘时不知道对方要哪一份。
--
-- ── 为什么要改（取证结论，全部实测过）────────────────────────────────────
-- 1) /technical-documentation/ 是主导航里的公开页（Navigation.astro L134、
--    MobileMenu.astro L575），14 个静态页的 HTML 里都有链向它的 href。不是隐藏页。
-- 2) content 里有 13 个 <button class="td-btn" data-download-file="…" data-doc-name="…">。
--    InquiryModal.astro 的「下载门禁」消费 data-download-file：点按钮 → 开询盘弹窗 →
--    客户填完表单 → 提交成功后 startDownload() 用 <a href download> 拉那个 URL。
--    所以买家是「留下联系方式之后」才拿到 404。这是全站对买家最坏的一处缺陷。
-- 3) 13 条 data-download-file 的实测结果（curl GET，访客真相）：
--      technical-documentation/MC%20catalogue.pdf → 200，9,818,081 B，对象真实存在。
--        （闸门早先报它 404 是我自己的 bug：把已经编码好的 %20 又 quote() 一遍变成
--         %2520。已修 docs/media-manifest.py。）
--      其余 12 条 docs/*.pdf|zip → 404。桶里从未有 docs/ 前缀（已列举全桶 510 个对象，
--        文档类只有 technical-documentation/ 下 3 个 PDF）。
-- 4) 卡片 td-tag 是编的：13 个「N MB」只有 1 个（9.8 MB）碰巧对上 MC catalogue 的真实体积；
--    12.3 / 8.7 MB 对应的 .zip 根本不存在；Rev. 2026-01 ×5、AutoCAD 2018+ ×2、
--    Third-party ×3 全部无据。AGENTS.md：附录 A 没写的数字只能写成不含数字的能力陈述。
-- 5) products id=8（slug=aluminum-wall-panels, lang=zh）的 image_url + gallery 还指着
--    2026-10-06 hotlink→R2 迁移未覆盖的旧名。这行是停用的翻译行
--    （src/lib/i18n.ts 里 MULTILINGUAL_ENABLED=false，没有 /zh/ 站），买家看不到，
--    英文页用的是 id=1。但库里挂着 404 名，哪天开多语言就是当场可见的死图，一并清。
--
-- ── 改成什么 ────────────────────────────────────────────────────────────
-- 不删页面、不删卡片、不猜新路径。把「立即免费下载」这个兑现不了的承诺，换成同页面
-- 已经跑通的询盘动作（data-open-inquiry-modal 是现有机制，底部 Request Custom Document
-- 按钮今天就这么工作）：
--   按钮   Download + 死链            →  Request + 打开询盘弹窗（带文档名）
--   标签   PDF | 9.8 MB | Rev. 2026-01 →  PDF | On request
--   文案   publishes complete technical documentation / the file starts immediately
--          / Third-party verified → 不含数字、不含身份断言的能力陈述
-- 询盘线索一条不少，只是不再假承诺一个不存在的文件。
-- ============================================================================

-- ── 【执行前体检】先单独选中这一段跑一次，七个数必须完全对上 ──
--    对不上说明库内形状已变，停下来找我，不要直接 Run 下面的事务。
--    最后一列是真正的开关：步骤 ③ 的 \s 和步骤 ④ 的 \1 都靠
--    standard_conforming_strings=on 才能原样进到正则里；它要是被关过，
--    Postgres 会先把反斜杠吃掉，那两步静默打不中（不报错，只是没改）。
SELECT
  current_setting('standard_conforming_strings')                                          AS g_must_be_on,
  (SELECT length(content) FROM pages WHERE slug = 'technical-documentation')            AS a_content_len_expected_22807,
  (SELECT count(*) FROM regexp_matches(
      (SELECT content FROM pages WHERE slug = 'technical-documentation'),
      'data-download-file="[^"]*"', 'g'))                                               AS b_dead_buttons_expected_13,
  (SELECT count(*) FROM regexp_matches(
      (SELECT content FROM pages WHERE slug = 'technical-documentation'),
      'file\.meiyualuminum\.com/docs/', 'g'))                                           AS c_docs_404_expected_12,
  (SELECT count(*) FROM regexp_matches(
      (SELECT content FROM pages WHERE slug = 'technical-documentation'),
      'class="td-btn"', 'g'))                                                           AS d_td_btn_expected_13,
  (SELECT count(*) FROM pages WHERE content LIKE '%data-download-file%')                AS e_rows_expected_1,
  (SELECT count(*) FROM products WHERE id = 8 AND lang = 'zh'
     AND image_url LIKE '%aluminum-wall-panels-main.webp%')                             AS f_product_row_expected_1;

-- ─────────────────────────────────────────────────────────────────────────
-- 【预演】想先看到"改完是什么样"再决定落不落库：
--   选中从下面 BEGIN; 到「第二步：先校验」那句 SELECT 结尾的全部文字，
--   在末尾自己补一句 ROLLBACK; ，然后 Run 这一整段。
--   数字全对  → 回头整段跑本文件（含 COMMIT）；
--   数字不对  → 什么都不要改，把结果拍给我。
--   备份表也在事务里，ROLLBACK 后不会留下；临时视图只在这条连接里存在。
-- 不要把 BEGIN 和后面的语句分开跑：分开就是自动提交，预演会变成真改。
-- ─────────────────────────────────────────────────────────────────────────

BEGIN;

-- ── 备份：只备份要动的两行，回滚就靠这两张表 ──
-- 用 IF NOT EXISTS 是故意的：万一这脚本被跑过两次，第一次的备份才是原始内容，
-- 第二次不许把它覆盖掉（覆盖了就再也回不去）。
CREATE TABLE IF NOT EXISTS _backup_20261108_deadrefs_pages AS
  SELECT id, slug, content FROM pages WHERE slug = 'technical-documentation';

CREATE TABLE IF NOT EXISTS _backup_20261108_deadrefs_products AS
  SELECT id, slug, lang, image_url, gallery FROM products WHERE id = 8;

-- ── 第一步：定义临时视图 = 把八步改写算出来，但不写库 ──
-- 八步套在同一个表达式里。执行顺序＝由内向外（② 最内，⑧ 最外）。
-- 任何一步打不中不会报错（replace/regexp_replace 都是原样返回），所以第二步的
-- 校验必须逐项对上，那是本脚本唯一的成功判据。
-- 共 6 个 regexp_replace( + 2 个 replace( = 8 个开括号，对 8 个右括号。
CREATE TEMP VIEW v_after_td AS
SELECT
  -- ⑧ 05 分区副标题：「Third-party verified performance data」是对不存在的报告的出具方断言
  --    去掉身份断言，保留不靠它的说法（字面 replace，唯一命中）
  replace(
  -- ⑦ 最后一个 h2 断言「Need a document we haven't published?」→ 中性提问。
  --    这里用 replace() 而不是 regexp_replace()：`?` 在正则里是量词，
  --    写成正则会把 "publishe" 也算命中，能过但不严谨
  replace(
  -- ⑥ 顶部维护注释整块删除：「占位文件地址：把 data-download-file 换成真实 PDF 链接即可」
  --    是模板施工说明，不该留在对外字段里；而且 `^` 锁定了串首，不会误吃后面的分节注释
  regexp_replace(
  -- ⑤b 「Free download … the file starts immediately」→ 免费，但由工程师准备后 email
  --    （svg 原样保留，它不参与匹配；整段 <span> 由 (?s) 跨行吃掉）
  regexp_replace(
  -- ⑤a 「publishes complete technical documentation … All documents reflect current
  --    production standards」这句空头断言 → 不含数字的能力陈述（AGENTS.md 口径）
  regexp_replace(
  -- ④ td-meta 三标签 → 两标签：保留格式（PDF/DWG），把编造的大小/版本/出具方换成 On request
  --    '\1' 是反向引用，依赖 standard_conforming_strings=on（Supabase 默认 on）；
  --    若被显式关掉过，请先 SET standard_conforming_strings = on;
  regexp_replace(
  -- ③ 按钮文字 Download → Request；svg 与缩进由 \s* 跨过 CRLF 原样保留
  regexp_replace(
  -- ② 死链下载属性 → 现有的询盘触发属性（data-doc-name 保持不动，InquiryModal 用它预填 Message）
  --    只吃 data-download-file="…" 这一段属性，不动 <button> 本体；
  --    顶部那条注释里的 data-download-file 不带 ="…"，所以这一步不会命中它（共 13 处）
  regexp_replace(
    content,
    'data-download-file="[^"]*"',
    'data-open-inquiry-modal', 'g'),
    '(?s)</svg>\s*Download\s*</button>',
    '</svg> Request</button>', 'g'),
    '<div class="td-meta">(<span class="td-tag">[A-Z]+</span>)<span class="td-tag">[^<]*</span><span class="td-tag">[^<]*</span></div>',
    '<div class="td-meta">\1<span class="td-tag">On request</span></div>', 'g'),
    '(?s)<p class="td-intro">.*?</p>',
    '<p class="td-intro">Everything your project team needs, in one place. MEIYU&reg; holds technical documentation for our aluminum facade, ceiling and baffle systems: product specifications, installation procedures, CAD details, finishes and test reports. Pick what you need below and our engineers will prepare and send it.</p>',
    'g'),
    '(?s)<span class="td-note">.*?</span>',
    '<span class="td-note"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/></svg> No charge and no sales call first — fill in the short form and our engineers will prepare the document and email it to you.</span>',
    'g'),
    '(?s)^<!--.*?占位.*?-->',
    '', 'g'),
    'Need a document we haven''t published?',
    'Need something not listed here?'),
    '<p>Third-party verified performance data for approvals and tenders</p>',
    '<p>Performance data for approvals and tenders, compiled for your project</p>')
AS content
FROM pages
WHERE slug = 'technical-documentation';

-- ── 第二步：先校验（此时库里还没动，看的是"改完应该是什么样"）──
-- 十二列必须逐个对上；任何一列不对，就只跑 ROLLBACK; 不要跑后面的 UPDATE。
SELECT
  (SELECT count(*) FROM regexp_matches(content, 'data-download-file', 'g'))                     AS refs_must_be_0,
  (SELECT count(*) FROM regexp_matches(content, 'file\.meiyualuminum\.com/', 'g'))              AS r2_urls_must_be_0,
  (SELECT count(*) FROM regexp_matches(content, '[0-9.]+ MB</span>', 'g'))                      AS fake_mb_must_be_0,
  (SELECT count(*) FROM regexp_matches(content, 'Rev\. 20', 'g'))                               AS fake_rev_must_be_0,
  (SELECT count(*) FROM regexp_matches(content, 'AutoCAD 2018', 'g'))                           AS fake_cad_must_be_0,
  (SELECT count(*) FROM regexp_matches(content, 'Third-party', 'g'))                            AS fake_3p_must_be_0,
  (SELECT count(*) FROM regexp_matches(content, '占位|haven''t published|the file starts immediately|publishes complete', 'g')) AS fake_words_must_be_0,
  (SELECT count(*) FROM regexp_matches(content, 'class="td-btn"', 'g'))                         AS buttons_must_stay_13,
  (SELECT count(*) FROM regexp_matches(content, 'data-open-inquiry-modal', 'g'))                AS triggers_must_be_14,
  (SELECT count(*) FROM regexp_matches(content, '<span class="td-tag">On request</span>', 'g')) AS on_request_must_be_13,
  (SELECT count(*) FROM regexp_matches(content, '<div class="td-card"', 'g'))                   AS cards_must_stay_13,
  length(content)                                                                               AS new_len_must_be_20897
FROM v_after_td;

-- ── 第三步：真改 pages（把上面校验过的那个表达式落库）──
UPDATE pages
SET content = (SELECT content FROM v_after_td)
WHERE slug = 'technical-documentation';

-- ── 第四步：products id=8 旧热链名 → 直接抄 id=1 的现值 ──
-- 素材路径与语言无关，停用的 zh 行没理由保留一套 404 名。抄同一产品的英文行，
-- 以后开多语言时它天然就是对的；这一句不新增任何猜测。
-- gallery 是 text[]（不是 jsonb），所以这里直接等值赋值即可，不需要任何类型转换。
UPDATE products AS zh SET
  image_url = en.image_url,
  gallery   = en.gallery
FROM products AS en
WHERE zh.id = 8 AND en.id = 1 AND en.lang = 'en';

-- ── 第五步：落库后的真相（这一次读的是表，不是视图）──
-- 两个数应与第二步完全一致；gallery_n 用 array_length，因为 gallery 是 text[]。
SELECT
  (SELECT length(content) FROM pages WHERE slug = 'technical-documentation')              AS committed_len_20897,
  (SELECT count(*) FROM regexp_matches(
      (SELECT content FROM pages WHERE slug = 'technical-documentation'),
      'data-download-file', 'g'))                                                          AS must_be_0,
  (SELECT count(*) FROM regexp_matches(
      (SELECT content FROM pages WHERE slug = 'technical-documentation'),
      'data-open-inquiry-modal', 'g'))                                                     AS must_be_14,
  z.id, z.lang, z.image_url,
  array_length(z.gallery, 1)                                                              AS gallery_n_must_be_6,
  (SELECT count(*) FROM regexp_matches(array_to_string(z.gallery, ','),
      'aluminum-wall-panels-(main|2|3|interior|exterior|detail)\.webp', 'g'))              AS old_names_must_be_0
FROM products z
WHERE z.id = 8;

COMMIT;

-- ============================================================================
-- 【回滚】改完发现不对，整段执行即可恢复原值（备份表由本文件创建）
--
-- BEGIN;
-- UPDATE pages p    SET content   = b.content     FROM _backup_20261108_deadrefs_pages   b WHERE p.id = b.id;
-- UPDATE products q SET image_url = b.image_url, gallery = b.gallery
--   FROM _backup_20261108_deadrefs_products b WHERE q.id = b.id;
-- COMMIT;
--
-- 线上确认无误后再删备份表：
--   DROP TABLE _backup_20261108_deadrefs_pages;
--   DROP TABLE _backup_20261108_deadrefs_products;
--
-- 注意：`data-open-inquiry-modal` 的计数应为 14 而不是 13 —— 第 14 个是页面底部
-- 「Request Custom Document」按钮，它本来就有这个属性。
--
-- 【执行完之后】
-- 0. 八步每步的命中数（13/13/13/1/1/1/1/1）与结果长度 20,897，最初是在本地拿库里
--    当时那份 content 按同一组模式串跑出来的（.tmp-work/sql-simulate.py）。
--    Postgres 的 ARE 与 Python re 在这些模式上同构，但不保证逐字同构，所以真判据
--    是上面第二步/第五步那几列。v2 起这个表达式只写了一遍（临时视图），
--    校验和 UPDATE 用的是同一个结果，不存在"校验过了但写的是另一套"。
-- 1. 开 https://meiyualuminum.com/technical-documentation/ 肉眼确认：13 个按钮都写
--    Request；点任意一个弹出询盘表单，Message 里已带文档名；页面上不再出现 MB/Rev.。
-- 2. 回来跑 `python docs/media-manifest.py`：18 条 MISSING-ALLOWED 应全部消失
--    （引用没了，豁免自动失效）。
-- 3. 桶里只有两份内容明确的真实文档：MC catalogue.pdf（31 页，9,818,081 B）和
--    Extrusion Profile Color Cards.pdf（8 页，13,675,481 B）。本次把它们的引用也一起
--    摘了，因为页面没有一张卡片的标题能诚实对上「31 页企业画册」。业主确认内容后，
--    我再补一条 SQL 把对应卡片接回真链接（那时 td-tag 可以写真实大小，因为它就是真的）。
--    桶内另有内容待确认、站内 0 引用的对象，不在本 SQL 范围内 —— 确认之前不要把它的
--    --    key / 体积 / 页数 / 作者字段写进任何会公开的文件（仓库是公开的）。
-- ============================================================================
