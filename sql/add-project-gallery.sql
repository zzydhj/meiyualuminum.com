-- ============================================================
-- Project Gallery 画廊页 + 示例项目案例
-- ============================================================
-- 使用方法：在 Supabase SQL Editor 中执行本文件
-- 1. 第一部分：插入画廊页到 pages 表
-- 2. 第二部分：插入示例项目案例到 posts 表
-- ============================================================

-- ============================================================
-- 第一部分：pages 表 — 插入 Project Gallery 画廊页
-- ============================================================
-- 先修复 pages 表的自增序列（否则 INSERT 会报 id 冲突）
SELECT setval(pg_get_serial_sequence('pages', 'id'), COALESCE((SELECT MAX(id) FROM pages), 0) + 1, false);

-- 插入 Project Gallery 画廊页（已存在则跳过）
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pages WHERE slug = 'project-gallery') THEN
    INSERT INTO pages (slug, title, status, seo_title, seo_description, keywords, content, hero_title, hero_subtitle)
    VALUES (
      'project-gallery',
      'Project Gallery',
      'published',
      'Project Gallery — MEIYU Aluminum Building Materials',
      'Explore MEIYU aluminum facade, ceiling, and cladding projects across airports, hotels, malls, offices, and public buildings worldwide.',
      ARRAY['project gallery', 'aluminum facade projects', 'ceiling installation', 'building case studies', 'aluminum cladding portfolio'],
      '<p style="text-align:center;color:#64748b;font-size:1rem;">Browse our portfolio of aluminum building material installations across 8 sectors and multiple continents. Click any project to view full details.</p>',
      'Our Global Portfolio',
      'Aluminum facade, ceiling, and cladding solutions delivered across airports, hotels, shopping malls, and office buildings worldwide.'
    );
  END IF;
END $$;

-- ============================================================
-- 第二部分：posts 表 — 插入示例项目案例
-- primary_tag = 'projects' 标记这些是项目案例
-- tags 数组包含分类标签（airport/hotel/mall等）和地区标签
-- ============================================================

-- 先修复 posts 表的自增序列
SELECT setval(pg_get_serial_sequence('posts', 'id'), COALESCE((SELECT MAX(id) FROM posts), 0) + 1, false);

-- === Airport Projects ===

INSERT INTO posts (slug, title, description, content, image_url, image_alt, pub_date, author, status, primary_tag, tags)
VALUES (
  'beijing-daxing-airport-curved-baffle-cladding',
  'Beijing Daxing International Airport — Curved Baffle Cladding',
  'Curved aluminum baffle cladding for retail spaces, delivering a seamless modern aesthetic across high-traffic zones in one of the world''s largest airports.',
  '<h2>Project Overview</h2><p>PRANCE supplied curved aluminum baffle cladding for Beijing Daxing International Airport''s retail store areas. The project required precision manufacturing to achieve the flowing, organic ceiling geometry while maintaining strict fire safety and acoustic performance standards.</p><h2>Solution</h2><p>Custom curved aluminum baffles were fabricated using CNC bending technology, finished with PVDF coating for long-term color stability. The modular installation system allowed rapid deployment across 2,000+ square meters of retail space.</p><h2>Key Specifications</h2><ul><li>Material: 1.0mm aluminum alloy 3003-H24</li><li>Surface: PVDF coating, RAL custom color</li><li>Coverage: 2,400 sqm</li><li>Fire rating: Class A1</li></ul>',
  'https://prancebuilding.com/lifisher-m4842/1782288890933-beijing-airport-retail-store-curved-baffle-cladding-project-3.jpg',
  'Beijing Daxing Airport retail store with curved aluminum baffle cladding ceiling',
  '2025-12-15',
  'MEIYU Aluminum',
  'published',
  'projects',
  ARRAY['projects', 'airport', 'china']
),
(
  'hong-kong-airport-honeycomb-wall-baffle-ceiling',
  'Hong Kong Airport Terminal 1 — Honeycomb Wall & Baffle Ceiling',
  'Aluminum honeycomb wall panels and profile baffle ceilings for the landmark Terminal 1 renovation, combining lightweight construction with premium aesthetics.',
  '<h2>Project Overview</h2><p>The Hong Kong International Airport Terminal 1 renovation required a ceiling and wall system that could be installed during limited overnight maintenance windows while maintaining full terminal operations.</p><h2>Solution</h2><p>We delivered a dual-system approach: aluminum honeycomb panels for wall cladding (lightweight, rigid, impact-resistant) and extruded profile baffle ceilings (easy access to MEP services above). Both systems used a unified color scheme for visual coherence.</p>',
  'https://prancebuilding.com/lifisher-m4842/1780036040852-hong-kong-international-airport-terminal-1-profile-baffle-ceiling-project-1.jpg',
  'Hong Kong Airport Terminal 1 with aluminum profile baffle ceiling system',
  '2025-11-20',
  'MEIYU Aluminum',
  'published',
  'projects',
  ARRAY['projects', 'airport', 'china']
),
(
  'singapore-changi-airport-perforated-panel',
  'Singapore Changi Airport — Perforated Aluminum Panel',
  'Custom perforated aluminum panels enhancing acoustics, airflow management, and visual identity in one of Asia''s premier aviation hubs.',
  '<h2>Project Overview</h2><p>Singapore Changi Airport required custom perforated aluminum panels that serve both functional and aesthetic purposes — managing airflow patterns in the terminal while creating a distinctive visual identity.</p><h2>Solution</h2><p>CNC-perforated panels with variable hole patterns (2mm to 8mm diameter) were produced to create a gradient transparency effect. The panels also serve as acoustic absorbers, reducing ambient noise by 12dB in passenger waiting areas.</p>',
  'https://prancebuilding.com/lifisher-m4842/1760579215486-singapore-changi-airport-perforated-aluminum-panel-project-11.jpg',
  'Singapore Changi Airport terminal with perforated aluminum acoustic panels',
  '2025-08-10',
  'MEIYU Aluminum',
  'published',
  'projects',
  ARRAY['projects', 'airport', 'asia']
),
(
  'istanbul-airport-aluminum-ceiling',
  'Istanbul Airport — Aluminum Strip Ceiling',
  'Customized aluminum strip ceiling system with precision manufacturing for one of Europe''s busiest aviation hubs.',
  '<h2>Project Overview</h2><p>Istanbul Airport, serving 90+ million passengers annually, required a ceiling system combining grand architectural vision with practical maintenance access and durability.</p><h2>Solution</h2><p>Linear aluminum strip ceiling panels were installed across departure halls and concourses, creating a rhythmic visual flow that guides passenger movement. The clip-in system enables rapid panel removal for MEP maintenance.</p>',
  'https://prancebuilding.com/lifisher-m0/1716949365021-720x576turkey-istanbul-airport.jpg',
  'Istanbul Airport departure hall with aluminum strip ceiling system',
  '2025-06-22',
  'MEIYU Aluminum',
  'published',
  'projects',
  ARRAY['projects', 'airport', 'europe']
);

-- === Hotel & Resort Projects ===

INSERT INTO posts (slug, title, description, content, image_url, image_alt, pub_date, author, status, primary_tag, tags)
VALUES (
  'dubai-emaar-beachfront-metal-ceiling',
  'Dubai Emaar Beachfront Towers — 50,000 sqm Metal Ceiling',
  'Comprehensive metal ceiling solution for Emaar''s iconic Bayview and Seapoint residential towers, covering 50,000 sqm across multiple buildings.',
  '<h2>Project Overview</h2><p>Emaar Properties required a unified ceiling system across the Bayview and Seapoint tower complex in Dubai Beachfront — a massive 50,000 sqm installation spanning lobbies, corridors, parking areas, and amenity spaces.</p><h2>Solution</h2><p>We delivered a multi-product ceiling package: lay-in tiles for standard areas, clip-in panels for wet zones, and custom baffle ceilings for feature lobbies. All products share a unified color palette and are manufactured to withstand Dubai''s extreme heat and humidity.</p>',
  'https://prancebuilding.com/lifisher-m0/1716949424838-720x576dubai-emaar.jpg',
  'Dubai Emaar Beachfront towers with aluminum metal ceiling system',
  '2025-10-05',
  'MEIYU Aluminum',
  'published',
  'projects',
  ARRAY['projects', 'hotel', 'middle-east']
),
(
  'haikou-hongyuan-hotel-aluminum-ceiling',
  'Haikou Hongyuan Hotel — Aluminum Ceiling & Cladding',
  'Aluminum panels, ceilings, and sunshades blending Song Dynasty aesthetics with modern weather-resistant performance for a landmark hospitality project.',
  '<h2>Project Overview</h2><p>The Haikou Hongyuan Hotel renovation required exterior and interior aluminum systems that reference traditional Chinese Song Dynasty architectural motifs while meeting modern building codes and tropical climate demands.</p><h2>Solution</h2><p>Custom aluminum sunshades with laser-cut traditional patterns were fabricated for the facade. Interior ceilings combine wood-grain finished aluminum panels with acoustic backing for guest comfort.</p>',
  'https://prancebuilding.com/lifisher-m0/1716949428857-720x576haikou-hongyuan-hotel.jpg',
  'Haikou Hongyuan Hotel with traditional pattern aluminum sunshade facade',
  '2025-09-18',
  'MEIYU Aluminum',
  'published',
  'projects',
  ARRAY['projects', 'hotel', 'china']
);

-- === Shopping Mall Projects ===

INSERT INTO posts (slug, title, description, content, image_url, image_alt, pub_date, author, status, primary_tag, tags)
VALUES (
  'haikou-duty-free-plaza-metal-ceiling',
  'Haikou Sun & Moon Duty Free Plaza — 10,000 sqm Premium Ceiling',
  'High-end ceiling system for luxury duty-free retail, meeting the highest standards for durability, aesthetics, and integrated lighting.',
  '<h2>Project Overview</h2><p>The Haikou Sun & Moon Global Duty Free Plaza is one of China''s largest duty-free shopping destinations. The ceiling system needed to integrate extensive lighting, signage, and HVAC while maintaining a premium retail atmosphere across 10,000 sqm.</p><h2>Solution</h2><p>Custom aluminum lay-in ceiling panels with integrated LED lighting channels and acoustic perforations were manufactured in a unified champagne gold finish. The modular system allows individual panel access for maintenance without disrupting adjacent retail operations.</p>',
  'https://prancebuilding.com/lifisher-m0/1716949448585-720x576haikou-duty-free.jpg',
  'Haikou Duty Free Plaza with premium aluminum lay-in ceiling system',
  '2025-07-30',
  'MEIYU Aluminum',
  'published',
  'projects',
  ARRAY['projects', 'mall', 'china']
),
(
  'shenzhen-mixc-triangle-metal-panel',
  'Shenzhen MixC World — Triangle Metal Great Wall Panel',
  'Bold triangle metal panels creating striking visual depth and modern identity in high-traffic elevator lobby spaces.',
  '<h2>Project Overview</h2><p>Shenzhen MixC World required distinctive wall cladding for elevator lobbies that would create a memorable visual identity while withstanding heavy foot traffic.</p><h2>Solution</h2><p>Triangle-profile metal "Great Wall" panels were custom fabricated in brushed aluminum finish. The 3D geometry creates dynamic light and shadow effects that change throughout the day, transforming a functional space into an architectural feature.</p>',
  'https://prancebuilding.com/lifisher-m0/1716949441741-720x576shenzhen-mixc.jpg',
  'Shenzhen MixC World elevator lobby with triangle metal Great Wall panels',
  '2025-05-14',
  'MEIYU Aluminum',
  'published',
  'projects',
  ARRAY['projects', 'mall', 'china']
);

-- === Office Building Projects ===

INSERT INTO posts (slug, title, description, content, image_url, image_alt, pub_date, author, status, primary_tag, tags)
VALUES (
  'shenzhen-oppo-headquarters-facade',
  'Shenzhen OPPO Headquarters — 185,000 sqm Aluminum Facade',
  'Four interconnected 200m elliptical towers with comprehensive custom aluminum facade systems, one of China''s most ambitious office developments.',
  '<h2>Project Overview</h2><p>OPPO''s new Shenzhen headquarters comprises four interconnected elliptical towers reaching 200m height across 42 floors. The facade system required custom curvature, high wind-load resistance, and seamless integration across 185,000 sqm.</p><h2>Solution</h2><p>We engineered a unitized curtain wall system with custom aluminum profiles following the tower''s elliptical geometry. Each panel was CNC-fabricated to precise tolerances (±1mm), with PVDF coating in a custom silver-grey finish selected for its heat-reflective properties.</p>',
  'https://prancebuilding.com/lifisher-m4842/1779848607538-china-shenzhen-oppo-headquarters-building-project-1.jpg',
  'Shenzhen OPPO Headquarters towers with custom aluminum facade system',
  '2025-04-20',
  'MEIYU Aluminum',
  'published',
  'projects',
  ARRAY['projects', 'office', 'china']
),
(
  'baghdad-modern-facade-project',
  'Baghdad Modern Office — Geometric Aluminum Facade',
  'Large-format geometric aluminum panels creating a bold minimalist statement for a commercial office complex in Iraq''s capital.',
  '<h2>Project Overview</h2><p>A new commercial office building in Baghdad required a facade that would make an architectural statement while withstanding extreme temperatures (up to 50°C) and sandstorms.</p><h2>Solution</h2><p>Large-format flat aluminum panels (up to 2m × 4m) with angular geometric joints were installed on a ventilated facade substructure. The PVDF coating system includes a sand-resistant topcoat specifically formulated for Middle Eastern climates.</p>',
  'https://prancebuilding.com/lifisher-m0/1716949468622-720x576baghdad-iraq.jpg',
  'Baghdad office building with geometric aluminum facade panels',
  '2025-03-08',
  'MEIYU Aluminum',
  'published',
  'projects',
  ARRAY['projects', 'office', 'middle-east']
);

-- ============================================================
-- 验证查询
-- ============================================================
-- 检查画廊页是否创建成功：
-- SELECT slug, title, status FROM pages WHERE slug = 'project-gallery';
--
-- 检查项目案例数量：
-- SELECT count(*) FROM posts WHERE primary_tag = 'projects' AND status = 'published';
--
-- 查看所有项目案例：
-- SELECT slug, title, primary_tag, tags FROM posts WHERE primary_tag = 'projects' ORDER BY pub_date DESC;
