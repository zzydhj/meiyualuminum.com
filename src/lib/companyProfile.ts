/**
 * companyProfile.ts — 公司级事实与标准条款的唯一代码来源。
 *
 * 数据一律对齐 docs/blog-prompt-v5.md【附录 A · 公司事实】（公司数据的唯一权威）；
 * 附录 A 没有的项只写不含具体数字的能力陈述，绝不用「厂商典型值」凑数
 * （例：包装每箱片数来自第三方供应商公开资料，故此处不写）。
 *
 * 用途：产品详情页右栏「Ordering & Terms」、About 页数据条与徽章等共用，
 * 避免同一组公司数字在多个页面各自硬编码而漂移。
 * 注意：叙述性句子中出现的数字（About 的流程步骤、FAQ 等）仍是文字形式，
 * 修改时以本文件与附录 A 为准同步核对。
 */

export interface TermRow {
    label: string;
    value: string;
}

/** 公司基础数据（About 页 Hero 数据条、页脚等处共用） */
export const companyFacts = {
    name: "MEIYU Aluminum Co., Ltd.",
    brand: "MEIYU",
    established: "2015",
    location: "Dongguan City, Guangdong Province, China",
    plantArea: "15,000 m²",
    productionLines: "15",
    staff: "80",
    email: "info@meiyualuminum.com",
    phone: "+86 135 0983 8008",
};

/** 认证与合规徽章：只写「标准名 + 合规状态」，证书/报告编号不公开（附录 A 红线） */
export const certBadges = [
    "ISO 9001",
    "CE",
    "ASTM E84 Class A",
    "EN 13501-1 B-s1,d0",
    "OEM & ODM",
    "Factory-Direct",
];

/**
 * 标准商务条款（附录 A【MOQ/交期】【质保】原文口径）。
 * 数字必须带标准 offer 限定，见 termsNote。
 */
export const standardTerms: TermRow[] = [
    {
        label: "MOQ",
        value: "500 m² per item for standard panels; 1,000 m² for custom perforation or profiles (tooling dependent)",
    },
    {
        label: "Lead Time",
        value: "20–25 working days for standard orders; 30–40 days for custom perforation or special finishes, subject to production schedule",
    },
    {
        label: "Warranty",
        value: "10 years PE / 15 years PVDF coating under standard atmospheric exposure; 1 year against material and workmanship defects",
    },
    {
        // 附录 A 无样品政策条目 → 只写不含数字与费用承诺的能力陈述
        label: "Samples",
        value: "Sample panels available for colour, perforation and finish approval before production",
    },
];

/** 条款限定语：附录 A 要求质保/MOQ/交期必须带此限定 */
export const termsNote =
    "Figures above are our standard offer; final terms are confirmed with your quotation.";
