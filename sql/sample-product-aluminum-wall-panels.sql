-- ============================================================
-- 产品数据示例：Aluminum Wall Panels
-- 参考 PRANCE 页面结构生成，内容原创
-- 图片 URL 为占位符，替换为实际 CDN 地址即可
-- ============================================================

-- 1. 确保有对应的产品分类（如已有可跳过）
INSERT INTO categories (slug, name, description, parent_id)
SELECT 'aluminum-wall-panels', 'Aluminum Wall Panels', 'Interior and exterior aluminum wall cladding panels for commercial and residential buildings.', NULL
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'aluminum-wall-panels');

-- 2. 插入产品
INSERT INTO products (
    slug,
    title,
    description,
    content,
    image_url,
    image_alt,
    gallery,
    status,
    lang,
    keywords,
    seo_title,
    seo_description,
    primary_category_id,
    enriched_specs,
    created_at
)
VALUES (
    'aluminum-wall-panels',

    -- 标题
    'Aluminum Wall Panels',

    -- 短描述（产品 Hero 区域显示）
    'Premium aluminum wall cladding panels combining modern aesthetics with outstanding durability. Corrosion-resistant, lightweight, and fully customizable for interior and exterior architectural applications.',

    -- 长内容 HTML（Tab 内详情 + FAQ）
    '<h2>Why Choose Aluminum Wall Panels?</h2>
<p>Aluminum wall panels have become the preferred choice for architects and builders worldwide due to their exceptional combination of lightweight construction, corrosion resistance, and design versatility. Our aluminum wall cladding systems are engineered to withstand harsh weather conditions while maintaining their aesthetic appeal for decades.</p>

<h3>Material Excellence</h3>
<p>Our panels are manufactured from high-grade aluminum alloy (AA1100, AA3003, AA5052), offering superior strength-to-weight ratio compared to traditional cladding materials. Each panel undergoes rigorous quality control from raw material selection through final surface treatment.</p>

<h3>Design Versatility</h3>
<p>Available in flat, curved, perforated, and custom-profile configurations, our aluminum wall panels adapt to any architectural vision. Choose from over 200 RAL colors, custom metallic finishes, wood-grain textures, or stone-effect coatings to achieve the exact look your project demands.</p>

<h3>Applications</h3>
<ul>
<li>Commercial building facades and curtain walls</li>
<li>Interior feature walls and lobby cladding</li>
<li>Airport terminals, train stations, and transit hubs</li>
<li>Hotels, shopping malls, and entertainment venues</li>
<li>Hospitals, schools, and government buildings</li>
<li>Residential high-rise exterior cladding</li>
</ul>

<h2>Production Process</h2>
<p>Our manufacturing process ensures consistent quality across every panel:</p>
<ol>
<li><strong>Raw Material Selection</strong> — Premium aluminum alloy coils from certified suppliers</li>
<li><strong>CNC Cutting & Forming</strong> — Precision cutting and bending to exact specifications</li>
<li><strong>Welding & Assembly</strong> — TIG/MIG welding with reinforcement ribs for structural integrity</li>
<li><strong>Surface Preparation</strong> — Multi-stage cleaning and chromate conversion coating</li>
<li><strong>Coating Application</strong> — PVDF, powder coating, or anodizing per specification</li>
<li><strong>Quality Inspection</strong> — Color consistency, thickness, adhesion, and salt-spray testing</li>
<li><strong>Packaging & Shipping</strong> — Protective film + foam + wooden crate for safe transit</li>
</ol>

<h2>Frequently Asked Questions</h2>

<h3>What is the typical lifespan of aluminum wall panels?</h3>
<p>With proper surface treatment (PVDF coating), aluminum wall panels can last 25-30 years or more without significant color fading or degradation. Powder-coated panels typically last 15-20 years. The aluminum substrate itself is virtually indestructible and will not rust or corrode.</p>

<h3>Can aluminum wall panels be used in coastal or high-humidity environments?</h3>
<p>Yes. Aluminum naturally forms a protective oxide layer that resists corrosion. For marine environments, we recommend PVDF (fluorocarbon) coating with a minimum 4mm panel thickness and marine-grade fasteners for optimal long-term performance.</p>

<h3>What panel thickness do you recommend for exterior walls?</h3>
<p>For exterior wall cladding, we recommend 2.5mm to 4.0mm aluminum thickness depending on panel size and wind load requirements. Standard thickness is 3.0mm for most commercial applications. Our engineering team can provide structural calculations for your specific project.</p>

<h3>How do you handle custom shapes and curved panels?</h3>
<p>Our CNC fabrication facility can produce virtually any shape — curved, folded, perforated, or tapered panels. Send us your architectural drawings or CAD files, and our team will provide a detailed fabrication plan and quote within 48 hours.</p>

<h3>What is the lead time for a typical order?</h3>
<p>Standard panels: 15-20 working days after order confirmation. Custom-shaped or special-color panels: 20-30 working days. We maintain stock of popular sizes and colors for urgent projects — contact us for availability.</p>',

    -- 主图（替换为实际 CDN 地址）
    'https://file.meiyualuminum.com/products/aluminum-wall-panels-main.webp',
    'Aluminum wall cladding panels for building facades',

    -- 图片画廊（替换为实际 CDN 地址）
    ARRAY[
        'https://file.meiyualuminum.com/products/aluminum-wall-panels-2.webp',
        'https://file.meiyualuminum.com/products/aluminum-wall-panels-3.webp',
        'https://file.meiyualuminum.com/products/aluminum-wall-panels-interior.webp',
        'https://file.meiyualuminum.com/products/aluminum-wall-panels-exterior.webp',
        'https://file.meiyualuminum.com/products/aluminum-wall-panels-detail.webp'
    ]::text[],

    'published',
    'en',

    -- SEO 关键词
    ARRAY[
        'aluminum wall panels',
        'aluminum wall cladding',
        'aluminum facade panels',
        'metal wall panels',
        'aluminum cladding system',
        'exterior wall panels',
        'aluminum veneer wall'
    ],

    -- SEO 标题
    'Aluminum Wall Panels | Interior & Exterior Cladding | MEIYU',

    -- SEO 描述
    'Durable, corrosion-resistant aluminum wall panels for interior and exterior cladding. PVDF/powder coated, fully customizable shapes and colors. Factory direct from MEIYU.',

    -- 分类 ID（关联到上面创建的分类）
    (SELECT id FROM categories WHERE slug = 'aluminum-wall-panels' LIMIT 1),

    -- enriched_specs JSONB（产品专属技术规格）
    '{
        "summary": "High-performance aluminum wall cladding system designed for commercial, residential, and public buildings. Available in flat, curved, and perforated profiles with PVDF, powder coating, or anodized surface treatment.",
        "specs": [
            {"label": "Material", "value": "Aluminum Alloy AA1100 / AA3003 / AA5052"},
            {"label": "Thickness", "value": "1.5mm / 2.0mm / 2.5mm / 3.0mm / 4.0mm"},
            {"label": "Max Panel Size", "value": "1500mm × 6000mm (custom sizes available)"},
            {"label": "Surface Treatment", "value": "PVDF Coating / Powder Coating / Anodized / Wood-grain Transfer"},
            {"label": "Color Options", "value": "200+ RAL colors, custom metallic, wood-grain, stone-effect"},
            {"label": "Fire Rating", "value": "Class A2-s1, d0 (non-combustible)"},
            {"label": "Wind Load Resistance", "value": "Up to 5.0 kPa (depending on panel thickness and fixing)"},
            {"label": "Weight", "value": "4.1 kg/m² (2.0mm) / 6.1 kg/m² (3.0mm)"},
            {"label": "Warranty", "value": "15 years (PVDF) / 10 years (Powder Coating)"}
        ],
        "features": [
            "Lightweight — 1/3 the weight of steel cladding, reducing structural load",
            "Corrosion resistant — natural oxide layer + protective coating system",
            "100% recyclable — environmentally sustainable building material",
            "Fire rated A2 — non-combustible, meets international fire safety codes",
            "Design flexibility — flat, curved, perforated, and custom profiles",
            "Low maintenance — self-cleaning surface, no repainting required",
            "Thermal insulation — air gap design improves building energy efficiency",
            "Sound attenuation — reduces exterior noise by up to 15 dB"
        ],
        "applications": [
            "Commercial Facades",
            "Interior Feature Walls",
            "Airport & Transit Hubs",
            "Hotels & Malls",
            "High-rise Residential",
            "Hospitals & Schools"
        ]
    }'::jsonb,

    NOW()
);
