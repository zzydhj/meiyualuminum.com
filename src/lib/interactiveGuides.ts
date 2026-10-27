/**
 * interactiveGuides.ts —— 交互式 3D 装配指南的注册表，站内这类内容的唯一数据源。
 *
 * 页面本体是 public/interactive-guides/<slug>/ 下的独立 three.js 应用：
 * 它自带全屏暗色布局与 importmap，不能套进 BaseLayout，也不走 Astro 路由，
 * 由 Workers 的 assets 直出。本文件负责的是它在站内出现的所有入口——
 * 清单页 /interactive-guides/、安装指引卡片、产品页 Installation 标签、导航。
 *
 * 新增一份指南 = 往 public/interactive-guides/ 放目录 + 在这里加一条记录，
 * 其余入口自动接上，不需要再改任何 .astro。
 */

export interface InteractiveGuide {
    /** 同时是 public/interactive-guides/<slug>/ 的目录名与 URL 片段 */
    slug: string;
    /** 挂靠的产品品类（productKnowledge 的 categorySlug），决定哪些卡片和产品页出现入口 */
    categorySlug: string;
    /** 卡片与导航上显示的短标题 */
    title: string;
    /** 一句话说明：讲的是什么构造，不是营销文案 */
    summary: string;
    /** 3D 工序数，必须与包内 js/data/steps.js 的 STEPS.length 一致 */
    stepCount: number;
    /**
     * 品类安装步骤号 → 3D 工序号。
     * 品类卡上的步骤是压缩口径（4 步），3D 里是完整工序（9 步），
     * 这里只登记能明确对应的项，对不上的步骤不链，避免把用户送到不相干的画面。
     */
    stepMap: Record<number, number>;
    /** 清单页上展示的构造要点，取自模型本身，不写模型里没有的东西 */
    highlights: string[];
    /** 内容更新日期，清单页显示，提醒这是做过核对的版本 */
    updated: string;
}

export const interactiveGuides: InteractiveGuide[] = [
    {
        slug: "u-baffle-ceiling",
        categorySlug: "u-shaped-aluminum-square-tube",
        title: "U-Shaped Aluminum Square Tube Ceiling",
        summary:
            "A to-scale 3D build-up of the open-cell baffle ceiling: toothed carrier with dovetail slots, baffles clipped in by hand, and the nine site operations from setting-out to handover.",
        stepCount: 9,
        // 品类卡的 4 步是压缩口径：Carrier Installation / Level Carriers 对应 3D 里的
        // 吊杆与载板安装（第 3、4 道工序），Clip Baffles 与 Splice Long Runs 一一对应。
        stepMap: { 1: 3, 2: 4, 3: 5, 4: 6 },
        highlights: [
            "Toothed carrier, dovetail slot pitch punched at the factory",
            "Baffles clipped in with the opening facing upward — no visible fixings",
            "Rod plumb, camber over 4 m spans, splice engagement",
            "Each step lists tools, materials, method and acceptance criteria",
        ],
        updated: "2026-10-27",
    },
];

/** 指南地址；传 step 时深链到指定工序（包内 main.js 读 #step=N） */
export const guidePath = (slug: string, step?: number): string =>
    `/interactive-guides/${slug}/${step ? `#step=${step}` : ""}`;

/** 按品类取指南；安装指引卡片用单个 categorySlug 查 */
export const guideForCategory = (categorySlug: string | null | undefined): InteractiveGuide | null =>
    interactiveGuides.find((g) => g.categorySlug === categorySlug) ?? null;

/** 按整条分类链取指南；产品页的叶子分类可能是线级分类，链上任意一级命中即算 */
export const guideForCategories = (
    slugs: (string | null | undefined)[],
): InteractiveGuide | null => {
    const list = slugs.filter(Boolean) as string[];
    return interactiveGuides.find((g) => list.includes(g.categorySlug)) ?? null;
};

/** 品类安装步骤号 → 深链地址；没有对应关系时返回 null，调用方据此不渲染链接 */
export const guideStepHref = (guide: InteractiveGuide, step: number): string | null => {
    const order = guide.stepMap[step];
    return order ? guidePath(guide.slug, order) : null;
};
