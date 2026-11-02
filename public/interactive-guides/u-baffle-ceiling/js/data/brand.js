/**
 * data/brand.js —— 品牌与商务信息（面板内品牌块的唯一来源）
 *
 * 取值对齐 meiyualuminum.com 的 src/lib/companyProfile.ts，那边改了要同步过来；
 * 该公司红线是「公司事实里没有的数字一律不写」，所以这里只放已确认的事实。
 * 本目录下的注释用中文（业主自己维护的源码，闸门只拦 HTML 里的注释与可见文本）。
 *
 * 分工（避免同一句话在两处漂移）：
 *   index.html  —— 顶栏 logo、视口水印、启动遮罩、SEO 元信息（无 JS 也必须可见）
 *   本文件      —— 右侧面板底部的品牌块与 System Data 里的商务条款
 */
export const BRAND = {
  name: 'MEIYU',
  legalName: 'MEIYU Aluminum Industry Co., Ltd.',
  site: 'https://www.meiyualuminum.com/',
  productPage:
    'https://www.meiyualuminum.com/categories/u-shaped-aluminum-square-tube/',
  contactPage: 'https://www.meiyualuminum.com/contact/',
  // 2026-11-01 业主指令：对外邮箱改 william@，电话改 139 段（本字段只做 tel: 链接）；
  // WhatsApp 是另一个号码，不写在本站静态页上。
  email: 'william@meiyualuminum.com',
  phone: '+86 139 2214 1133',
  responseTime: '1 hour',

  blockTitle: 'Manufacturer & commercial terms',
  ctaLabel: 'Ask MEIYU about this system',
  productLinkLabel: 'See the U-Shaped Square Tube range',
  credit:
    'Prepared by the MEIYU engineering team. Reference document — always build to the approved project drawings.',
  termsNote:
    'Figures above are our standard offer; final terms are confirmed with your quotation.',

  /** 板底样板段喷字（由 model/parts/substructure.js 手绘成贴图，单色漆所以不能太长） */
  stencil: {
    word: 'MEIYU',
    tag: 'SAMPLE SECTION · MEIYU CEILINGS',
    spec: 'U-baffle 50×100×1.0 · carrier 30×30×1.0',
  },

  facts: [
    {
      k: 'Manufacturer',
      // 同步 companyProfile.ts：成立 2011，对外地址不写城市，全称含 Industry。
      v: 'MEIYU Aluminum Industry Co., Ltd. — established 2011, Guangdong Province, China',
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
      v: '50 m² per order for standard panels; 1,000 m² for custom perforation or profiles (tooling dependent)',
    },
  ],
};
