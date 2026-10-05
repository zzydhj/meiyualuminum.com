-- ============================================================
-- 中文（zh）产品翻译示例：Aluminum Wall Panels → 铝墙板
-- 演示「同一 slug + 不同 lang + original_id 指向英文原文」的多语言数据模型
-- 英文原文：products.id = 1, slug = 'aluminum-wall-panels', lang = 'en'
--
-- 执行方式：Supabase Dashboard → SQL Editor → 粘贴运行
-- 生效：products 详情页/列表页是 SSR，运行后刷新即可见（无需重启 dev）
-- 回滚：DELETE FROM products WHERE slug='aluminum-wall-panels' AND lang='zh';
-- ============================================================

-- 修复自增序列，避免主键冲突（手动插入历史可能使序列错位）
SELECT setval(pg_get_serial_sequence('products', 'id'), COALESCE((SELECT MAX(id) FROM products), 0) + 1, false);

-- 防重复：仅当 zh 版本不存在时插入
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM products WHERE slug = 'aluminum-wall-panels' AND lang = 'zh') THEN
    INSERT INTO products (
      slug, title, description, content,
      image_url, image_alt, gallery,
      status, lang, original_id,
      keywords, seo_title, seo_description,
      primary_category_id, enriched_specs, created_at
    )
    VALUES (
      'aluminum-wall-panels',
      '铝墙板',
      '高端铝制墙面装饰板，将现代美学与卓越耐用性融为一体。耐腐蚀、轻质，可全面定制，适用于室内外建筑装饰工程。',

      -- 长内容 HTML（Tab 详情 + FAQ）
      '<h2>为什么选择铝墙板？</h2>
<p>铝墙板凭借其轻质结构、耐腐蚀性能与设计灵活性的卓越组合，已成为全球建筑师与建造单位的首选。我们的铝制墙面装饰系统经过精心设计，能够抵御严苛气候条件，并数十年如一日地保持美观。</p>

<h3>材料优势</h3>
<p>我们的板材采用优质铝合金（AA1100、AA3003、AA5052）制造，相比传统装饰材料具有更高的强度重量比。每一块板材从原材料甄选到表面处理，都经过严格的质量管控。</p>

<h3>设计多样性</h3>
<p>提供平板、曲面、冲孔及定制型材等多种配置，我们的铝墙板可适配任何建筑设计理念。可从 200 多种 RAL 颜色、定制金属漆、木纹转印或仿石涂层中自由选择，精准呈现项目所需的视觉效果。</p>

<h3>应用场景</h3>
<ul>
<li>商业建筑外立面与幕墙</li>
<li>室内背景墙与大堂装饰</li>
<li>机场航站楼、火车站及交通枢纽</li>
<li>酒店、购物中心与娱乐场所</li>
<li>医院、学校与政府建筑</li>
<li>住宅高层外墙装饰</li>
</ul>

<h2>生产流程</h2>
<p>我们的制造工艺确保每一块板材品质稳定：</p>
<ol>
<li><strong>原材料甄选</strong> —— 采用认证供应商的优质铝卷</li>
<li><strong>CNC 切割与成型</strong> —— 按精确规格切割与折弯</li>
<li><strong>焊接与组装</strong> —— TIG/MIG 焊接并加设加强筋以保证结构强度</li>
<li><strong>表面预处理</strong> —— 多级清洗与铬酸盐转化涂层</li>
<li><strong>涂装</strong> —— 按规格进行 PVDF 喷涂、粉末喷涂或阳极氧化</li>
<li><strong>质量检测</strong> —— 色差、厚度、附着力与盐雾测试</li>
<li><strong>包装与发运</strong> —— 保护膜 + 泡沫 + 木箱，确保运输安全</li>
</ol>

<h2>常见问题</h2>

<h3>铝墙板的典型使用寿命有多长？</h3>
<p>采用合适的表面处理（PVDF 涂层）时，铝墙板可使用 25-30 年甚至更久而无明显褪色或老化。粉末喷涂板材通常可用 15-20 年。铝基材本身几乎不会损坏，也不会生锈或腐蚀。</p>

<h3>铝墙板能否用于沿海或高湿环境？</h3>
<p>可以。铝天然形成一层保护性氧化膜，具有抗腐蚀能力。对于海洋环境，我们建议采用 PVDF（氟碳）涂层、板材厚度不低于 4mm，并配合海洋级紧固件，以获得最佳的长期性能。</p>

<h3>外墙推荐使用多厚的板材？</h3>
<p>外墙装饰推荐使用 2.5mm 至 4.0mm 的铝板厚度，具体取决于板材尺寸与风荷载要求。多数商业项目的标准厚度为 3.0mm。我们的工程团队可针对您的具体项目提供结构计算。</p>

<h3>你们如何处理异形与曲面板材？</h3>
<p>我们的 CNC 加工中心几乎可生产任何形状——曲面、折面、冲孔或锥形板材。您只需提供建筑图纸或 CAD 文件，我们的团队将在 48 小时内给出详细的加工方案与报价。</p>

<h3>常规订单的交货周期是多久？</h3>
<p>标准板材：订单确认后 15-20 个工作日。异形或特殊颜色板材：20-30 个工作日。我们对热门规格与颜色备有库存以应对紧急项目——具体货期请联系咨询。</p>',

      'https://file.meiyualuminum.com/products/aluminum-wall-panels-main.webp',
      '用于建筑外墙的铝制墙面装饰板',
      ARRAY[
        'https://file.meiyualuminum.com/products/aluminum-wall-panels-2.webp',
        'https://file.meiyualuminum.com/products/aluminum-wall-panels-3.webp',
        'https://file.meiyualuminum.com/products/aluminum-wall-panels-interior.webp',
        'https://file.meiyualuminum.com/products/aluminum-wall-panels-exterior.webp',
        'https://file.meiyualuminum.com/products/aluminum-wall-panels-detail.webp'
      ]::text[],

      'published',
      'zh',
      1,  -- original_id 指向英文原文 products.id=1

      ARRAY['铝墙板', '铝制墙面装饰板', '铝幕墙板', '金属墙板', '铝装饰系统', '外墙板', '铝单板墙面'],
      '铝墙板 | 室内外墙面装饰 | MEIYU',
      '耐用、耐腐蚀的铝墙板，适用于室内外墙面装饰。PVDF/粉末喷涂，形状与颜色可全面定制。MEIYU 厂家直供。',

      (SELECT id FROM categories WHERE slug = 'aluminum-wall-panels' LIMIT 1),

      '{
        "summary": "面向商业、住宅与公共建筑的高性能铝制墙面装饰系统。提供平板、曲面与冲孔型材，表面处理可选 PVDF、粉末喷涂或阳极氧化。",
        "specs": [
          {"label": "材料", "value": "铝合金 AA1100 / AA3003 / AA5052"},
          {"label": "厚度", "value": "1.5mm / 2.0mm / 2.5mm / 3.0mm / 4.0mm"},
          {"label": "最大板幅", "value": "1500mm × 6000mm（可定制尺寸）"},
          {"label": "表面处理", "value": "PVDF 涂层 / 粉末喷涂 / 阳极氧化 / 木纹转印"},
          {"label": "颜色选择", "value": "200+ RAL 颜色，定制金属漆、木纹、仿石效果"},
          {"label": "防火等级", "value": "A2-s1, d0 级（不燃）"},
          {"label": "抗风压", "value": "最高 5.0 kPa（视板材厚度与固定方式而定）"},
          {"label": "重量", "value": "4.1 kg/m²（2.0mm）/ 6.1 kg/m²（3.0mm）"},
          {"label": "质保", "value": "15 年（PVDF）/ 10 年（粉末喷涂）"}
        ],
        "features": [
          "轻质 —— 重量仅为钢制装饰板的 1/3，降低结构荷载",
          "耐腐蚀 —— 天然氧化膜 + 保护涂层系统",
          "100% 可回收 —— 环境可持续的建筑材料",
          "A2 级防火 —— 不燃，满足国际消防安全规范",
          "设计灵活 —— 平板、曲面、冲孔及定制型材",
          "低维护 —— 自洁表面，无需重新涂装",
          "保温隔热 —— 空气层设计提升建筑节能效率",
          "隔声降噪 —— 可将外界噪音降低最多 15 dB"
        ],
        "applications": [
          "商业外立面",
          "室内背景墙",
          "机场与交通枢纽",
          "酒店与商场",
          "高层住宅",
          "医院与学校"
        ]
      }'::jsonb,

      NOW()
    );
  END IF;
END $$;

-- 验证
-- SELECT id, slug, lang, original_id, title, status FROM products WHERE slug='aluminum-wall-panels' ORDER BY lang;
