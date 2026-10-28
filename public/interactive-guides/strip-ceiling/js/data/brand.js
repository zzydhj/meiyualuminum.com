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
  // 条扣板类目已确认：/categories/aluminum-strip-panel/（200，该类目只 1 个英文产品所以 noindex，
  // 但作为导航入口有效）；产品 203 aluminum-strip-ceiling 的分类链就经它，
  // 所以注册表里的 categorySlug 也是这个，两边必须一致。
  productPage:
    'https://www.meiyualuminum.com/categories/aluminum-strip-panel/',
  contactPage: 'https://www.meiyualuminum.com/contact/',
  email: 'info@meiyualuminum.com',
  phone: '+86 135 0983 8008',
  responseTime: '1 hour',

  blockTitle: 'Manufacturer & commercial terms',
  ctaLabel: 'Ask MEIYU about this system',
  productLinkLabel: 'See the Aluminium Strip Panel range',
  credit:
    'Prepared by the MEIYU engineering team. Reference document — always build to the approved project drawings.',
  termsNote:
    'Figures above are our standard offer; final terms are confirmed with your quotation.',

  /** 板底样板段喷字（由 model/parts/substructure.js 手绘成贴图，单色漆所以不能太长） */
  stencil: {
    word: 'MEIYU',
    tag: 'SAMPLE SECTION · MEIYU CEILINGS',
    spec: 'Strip panel 86×10×0.8 clip-in · carrier 30×30×1.0',
  },

  facts: [
    {
      k: 'Manufacturer',
      // 同步 companyProfile.ts：成立年份 2015→2011，对外地址不写城市（业主 2026-10-27 指令）。
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
      // 原写的「标准 20–25 / 定制 30–40 工作日」双档已于 2026-10-27 取消。
      v: '7–10 working days for standard and custom orders alike, including perforation, formed work and special finishes, subject to order size and production schedule',
    },
    {
      k: 'MOQ',
      v: '50 m² per item for standard profiles; 1,000 m² for custom perforation or profiles (tooling dependent)',
    },
  ],
};
