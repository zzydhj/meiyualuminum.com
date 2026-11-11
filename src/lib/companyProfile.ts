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
    // 2026-11-01 业主指令：对外全称按公司资料补上 Industry，本站长期用的是短版。
    name: "MEIYU Aluminum Industry Co., Ltd.",
    brand: "MEIYU",
    // 2026-10-27 业主指令：对外地址不再写城市（东莞/佛山禁用）。
    // 2026-11-11 业主指令：成立年份 2011 → 2017，厂房 15,000 m² → 30,000–50,000 m²，产线 15 → 9。
    // 注意：由此推出的“约 9 年经验”仍不得写成 “9+ Years Experience”（页脚历史注释里有此红线）。
    established: "2017",
    location: "Guangdong Province, China",
    // 厂房面积按业主资料给的区间写，不取中值也不取单值。
    plantArea: "30,000–50,000 m²",
    productionLines: "9",
    staff: "80",
    // 2026-11-01 业主指令：对外邮箱换成主联系人邮箱（原 info@ 不再出现在站上）。
    email: "william@meiyualuminum.com",
    // 号码字段：2026-11-01 曾拆为两个不同号（直拨 139… / WhatsApp 135…），
    // 2026-11-07 业主指令全站 WhatsApp 改回与直拨同一个号。
    // 两个字段仍分开保留（而不是合回一个）：当初拆分就是为了“改直拨号不要连带
    // 改掉全站 wa.me 链接”，合回一个就把那层保护拆了；以后两边再分叉只改本行。
    phone: "+86 139 2214 1133",
    whatsappPhone: "+86 139 2214 1133",
};

/**
 * WhatsApp 链接的唯一构造入口。
 *
 * 号码取自 companyFacts.whatsappPhone（不是 phone：那是直拨号，两者自 2026-11-01 起不同）。
 * wa.me 只收纯数字，所以剔掉符号。
 * 以前页眉 / 页脚 / 悬浮按钮 / About / 采购须知 / 询盘区块各写一份，
 * 其中四处把号码硬写在代码里，而号码换过一次（旧号 8617671728821 已作废），
 * 再换一次就得改六个地方。
 *
 * 带 data-wa-source 的来源标记仍在新加链接时传入：GA 已于 2026-11-06 应业主要求整体
 * 移除（BaseLayout 的全局 wa.me 上报一并删掉），属性留着当来源标识，以后接任何
 * 统计都不用再回头补。
 */
export const WHATSAPP_NUMBER = companyFacts.whatsappPhone.replace(/[^\d]/g, "");
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
 * 产品卡片用的 MOQ 短句（附录 A【MOQ/交期】的半句，不是新口径）。
 * 卡片只有一行宽度，写不下 standardTerms 的完整双档句式；这里保留
 * “standard panels” 这个限定词，是为了不把定制（穿孔/异形）的 1,000 m²
 * 说成 50 m²。完整口径仍在产品页 Ordering & Terms 表与采购须知页。
 * 数字只此一处，改附录 A 时跟着改 standardTerms 与本行。
 */
export const moqCardLine = "50 m² (standard panels)";

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
