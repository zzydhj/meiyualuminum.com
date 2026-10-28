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
    // 2026-10-27 业主指令：成立年份由 2015 改为 2011，对外地址不再写城市（东莞/佛山禁用）。
    // 注意：由此推出的“约 15 年经验”仍不得写成 “15+ Years Experience”（页脚历史注释里有此红线）。
    established: "2011",
    location: "Guangdong Province, China",
    plantArea: "15,000 m²",
    productionLines: "15",
    staff: "80",
    email: "info@meiyualuminum.com",
    phone: "+86 135 0983 8008",
};

/**
 * WhatsApp 链接的唯一构造入口。
 *
 * 号码仍然只存上面 companyFacts.phone 一处（wa.me 只收纯数字，所以剔掉符号）。
 * 以前页眉 / 页脚 / 悬浮按钮 / About / 采购须知 / 询盘区块各写一份，
 * 其中四处把 8613509838008 硬写在代码里，而号码换过一次（旧号 8617671728821 已作废），
 * 再换一次就得改六个地方。
 *
 * 带 data-wa-source 的埋点由 BaseLayout 全局监听 wa.me 上报 GA4，新加链接时记得传 waSource。
 */
export const WHATSAPP_NUMBER = companyFacts.phone.replace(/[^\d]/g, "");
export const whatsappUrl = (message: string): string =>
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

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
        // 业主 2026-10-28：口径就是「50 平就能做」，无法确认 item 的定义，
        // 所以对外不写 per item / 每项——一个说不清的限定词比不写更安全。
        value: "50 m² for standard panels; 1,000 m² for custom perforation or profiles (tooling dependent)",
    },
    {
        // 2026-10-27 业主指令：取消原「标准 20–25 / 定制 30–40 工作日」双档，
        // 标准品与定制穿孔/异形/特殊表面共用同一口径。产述句式里不得再出现两档数字。
        label: "Lead Time",
        value: "7–10 working days for standard and custom orders alike, including perforation, formed work and special finishes, subject to order size and production schedule",
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

/**
 * 询盘首次回复时效（附录 A【响应时效】，业主已确认属实）。
 *
 * 单独成字段而不是各处敲字：全站曾同时存在 “within 1 hour”（13 处）与
 * “within 24 hours”（博客与视频详情页各 1 处）两种口径 —— 客户在同一个站上
 * 看到两个承诺，等于两个都不信。改这一处即可全站同步。
 *
 * 注意：嵌在长句里的 “within 1 hour” 仍是文字形式（About / 采购指南的叙述段落），
 * 改值时需与本文件、附录 A 三处同步核对。
 */
export const responseTime = "1 hour";
