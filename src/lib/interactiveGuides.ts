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
            "A to-scale 3D build-up of the open-cell baffle ceiling: toothed carrier with dovetail slots, baffles clipped in by hand, and the eight site operations from setting-out to handover.",
        stepCount: 8,
        // 品类卡的 4 步是压缩口径：Carrier Installation / Level Carriers 对应 3D 里的
        // 吊杆与载板安装（第 3、4 道工序），Clip Baffles 对第 5 道，
        // Details and Service Openings 对第 6 道。
        // 原本第 4 步是 Splice Long Runs（对第 6 道“Splices and End Caps”）——
        // 业主 2026-10-28 明确方通不接长、不配堵头，那道工序已从模型里删除。
        stepMap: { 1: 3, 2: 4, 3: 5, 4: 6 },
        highlights: [
            "Toothed carrier, dovetail slot pitch punched at the factory",
            "Baffles clipped in with the opening facing upward — no visible fixings",
            "Rod plumb, camber over 4 m spans, service openings cut from the back panel",
            "Each step lists tools, materials, method and acceptance criteria",
        ],
        updated: "2026-10-28",
    },
    {
        slug: "strip-ceiling",
        // 条扣吊顶产品（id=203 aluminum-strip-ceiling）的分类链：
        // aluminum-strip-panel ← aluminum-ceilings，所以挂叶子类目。
        // 包内 js/data/brand.js 的 productPage 也指同一个类目页，两处必须一致。
        categorySlug: "aluminum-strip-panel",
        title: "Aluminium Strip Panel Ceiling",
        summary:
            "A to-scale 3D build-up of the closed clip-in strip ceiling: toothed carrier with dovetail slots, narrow aluminium strips snapped in side by side on a 90 mm module, and the eight site operations from setting-out to handover.",
        stepCount: 8,
        // 品类卡的 6 步是压缩口径，对应关系按动作而不是标题字面：
        //   1 Datum and Run Direction      → 工序 1 Marking Out
        //   2 Anchor and Hang the Main Carrier → 工序 3 Threaded Rods（与 u-baffle 同一对应逻辑）
        //   3 Set Out the Strip Carriers   → 工序 4 Carriers: Lift, Level, Camber
        //   4 Install the Strips           → 工序 5 Laying In the Strip Panels
        //   5 Perimeter, Splices, Joints   → 工序 6 Details and Service Openings
        //   6 Sight, Level, Cut in Services → 工序 7 Final Levelling and Cleaning
        // 工序 2（钻孔与膨胀螺栓）与 8（验收交接）在品类卡里没有对应行，不链。
        stepMap: { 1: 1, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7 },
        highlights: [
            "Closed, flush ceiling: strips snap into the carrier wall dovetails, no visible fixings",
            "Smooth-arc clip-in edge with an inward fishhook that hangs on the slot shoulder",
            "Independent panels — a wrong one lifts straight back out for service access",
            "Each step lists tools, materials, method and acceptance criteria",
        ],
        updated: "2026-10-28",
    },
    {
        slug: "aluminum-veneer-facade",
        // 铝单板幕墙两个产品页（flat / curved veneer）的分类链叶子都是 aluminum-veneer，
        // 包内 js/data/brand.js 的 productPage 指同一个类目页，两处必须一致。
        categorySlug: "aluminum-veneer",
        title: "Aluminium Veneer Façade",
        summary:
            "A to-scale 3D build-up of an aluminium veneer rainscreen on a concrete wall: an anchor-fixed galvanised RHS grid set on the panel module, 3.0 mm formed panels hung on integral bent ears and driven with eight self-tapping screws per panel, then backer rod and weatherseal — twelve site operations from as-built survey to handover.",
        stepCount: 12,
        // 品类卡的 6 步按动作对应，不按标题字面：
        //   1 Subframe Installation      → 工序 2 Fix Steel Grid to Wall（第 1 道是放线，不是装骨架）
        //   3 Panel Positioning          → 工序 3 Place Panel 1
        //   4 Fixing                     → 工序 4 Screw Panel 1
        //   5 Joint Sealing              → 工序 11 Seal the Joints
        //   6 Protection Film Removal    → 工序 12 Inspection & Handover（正文就是撕膜起始）
        // 品类第 2 步 Waterproof Membrane 不链：模型里没有防潮层这一层，
        // 链过去会把人送到一个不相干的画面。要么补模型，要么改品类文案。
        stepMap: { 1: 2, 3: 3, 4: 4, 5: 11, 6: 12 },
        highlights: [
            "Galvanised RHS 40×40×3 grid anchored on the module lines — wall tolerance is taken at the anchors, never at the panel face",
            "Ears are bent on to the sheet in the shop and sit flat on the tube; nothing is screwed through the visible face",
            "Eight self-tapping screws per panel, so any single panel can come back off for access or replacement",
            "Adjacent panels' ears are staggered where they share a tube, so the two sets do not overlap",
            "Each step lists tools, materials, method and acceptance criteria",
        ],
        updated: "2026-10-28",
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
