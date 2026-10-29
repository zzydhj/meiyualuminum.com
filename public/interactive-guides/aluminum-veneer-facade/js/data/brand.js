/**
 * data/brand.js —— 品牌与商务信息（面板内品牌块的唯一来源）
 *
 * 取值对齐 meiyualuminum.com 的 src/lib/companyProfile.ts，那边改了要同步过来；
 * 该公司红线是「附录 A 没有的数字一律不写」，所以这里只放已确认的事实。
 *
 * 分工（避免同一句话在两处漂移）：
 *   index.html  —— 顶栏 logo、视口水印、启动遮罩、SEO 元信息（无 JS 也必须可见）
 *   本文件      —— 右侧面板底部的品牌块与 System Data 里的商务条款
 */
export const BRAND = {
  name: 'MEIYU',
  legalName: 'MEIYU Aluminum Co., Ltd.',
  site: 'https://www.meiyualuminum.com/',
  // 铝单板幕墙挂在本站的 Aluminum Veneer 类目（id=101，叶子链：aluminum-veneer ← facade-exterior-cladding）。
  // 本行必须与 src/lib/interactiveGuides.ts 的 categorySlug 一致，否则两处入口会指到不同页。
  productPage:
    'https://www.meiyualuminum.com/categories/aluminum-veneer/',
  contactPage: 'https://www.meiyualuminum.com/contact/',
  email: 'info@meiyualuminum.com',
  phone: '+86 135 0983 8008',
  responseTime: '1 hour',

  blockTitle: 'Manufacturer & commercial terms',
  ctaLabel: 'Ask MEIYU about this system',
  productLinkLabel: 'See the Aluminium Veneer range',
  credit:
    'Prepared by the MEIYU engineering team. Reference document — always build to the approved project drawings.',
  termsNote:
    'Figures above are our standard offer; final terms are confirmed with your quotation.',

  /** 厂标喷字文案（预留；现由板面 decal 走 brandWordmarkMap，此处仅存档）
   *  截面尺寸必须等于 model/spec.js 的 STEEL_GRID（40×40）与 PANEL.thickness（3.0）：
   *  原先写的 RHS 80×40 与模型不一致，买家量一下模型就会看到两处不同。 */
  stencil: {
    word: 'MEIYU',
    tag: 'SAMPLE SECTION · MEIYU FAÇADES',
    spec: 'Veneer 3.0 formed panel · subframe RHS 40×40×3',
  },

  facts: [
    {
      k: 'Manufacturer',
      // 同步 companyProfile.ts：成立年份 2015→2011，地址不写城市（业主 2026-10-27 指令）。
      v: 'MEIYU Aluminum Co., Ltd. — established 2011, Guangdong Province, China',
    },
    {
      k: 'Plant',
      v: '15,000 m² · 15 production lines · 80 staff · OEM & ODM, factory-direct',
    },
    {
      k: 'Coating warranty',
      v: '10 years PE / 15 years PVDF under standard atmospheric exposure; 1 year against material and workmanship defects',
    },
    {
      k: 'Compliance',
      v: 'ISO 9001 · CE · ASTM E84 Class A · EN 13501-1 B-s1,d0',
    },
    {
      k: 'Lead time',
      // One figure for everything since 2026-10-27; the old two-tier lead time was retired.
      v: '7–10 working days for standard and custom orders alike, including perforation, formed work and special finishes, subject to order size and production schedule',
    },
    {
      k: 'MOQ',
      // Counted on the whole order, not on each specification line (owner's call, 2026-10-28).
      v: '50 m² per order for standard panels; 1,000 m² for custom perforation or profiles (tooling dependent)',
    },
  ],
};
