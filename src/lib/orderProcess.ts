/**
 * orderProcess.ts —— 订单交付流程节点的单一事实源
 *
 * 为什么单独成文件而不是写在 about.astro 里：这个版面要同时出现在首页与 About，
 * 而两处一旦各写一份，改一处忘一处就是《网站采购体验评估》P3 点名的老问题
 * （"统一资料更新负责人，避免各页再次出现不同口径"）。数据在这里，渲染在
 * components/OrderProcess.astro，两个页面各引一次。
 *
 * 措辞纪律（docs/blog-prompt-v5.md【附录 A】+ src/lib/companyProfile.ts）：
 *   · 附录 A 授权过的数字才写死：7–10 工作日交期、PE 10 年 / PVDF 15 年 /
 *     材料与制造缺陷自发货起 1 年、1 小时首次回复、15 条产线、80 人、ISO 9001 / CE /
 *     ASTM E84 Class A / EN 13501-1 B-s1。
 *   · 附录 A 没有的数字一律不编：报价有效期、付款比例、初稿天数与免费修改轮次、
 *     补板周期、分批发货规则、计价基数（可见面 vs 展开面）都改写成
 *     "写在您的报价单上 / 询价时提出"，把机制说清楚但不替业主承诺条款。
 *   · clock 字段专门放"时间从哪里算"。采购评审最在意的不是天数，是起算点，
 *     所以每个节点都必须有一条口径，没有授权口径就明确指向报价单。
 */

export interface ProcessNode {
    /** 序号，渲染成 01 / 02 */
    n: string;
    /** 阶段名 */
    t: string;
    /** 一句话定位，brief 变体只显示这一行 */
    s: string;
    /** 甲方在这一步要提供什么 */
    you: string;
    /** 本厂在这一步交出什么（文件 / 实物） */
    ours: string;
    /** 完成判据与责任边界：谁签字、谁承担 */
    gate: string;
    /** 时间口径：从什么起算，或指向报价单 */
    clock: string;
}

export const PROCESS_NODES: ProcessNode[] = [
    {
        n: "01",
        t: "Enquiry and documents in",
        s: "A full drawing set is not required to start; what you already have is enough to price.",
        you: "Architectural or reflected-ceiling drawings, a bill of quantities, a schedule of finishes — or a room size with photographs at the sketch stage.",
        ours: "A specification recommendation and an itemised quotation in which the exclusions are written out rather than left to be discovered on site.",
        gate: "Both sides know the product, the alloy and gauge, the finish and what is not in the price. Nothing is assumed on either side.",
        clock: "The quotation carries its own expiry date; if you need it held longer because a design is still moving, ask before it lapses.",
    },
    {
        n: "02",
        t: "Clause-by-clause compliance review",
        s: "Every specification line is answered as compliant, deviating or not verified — never as a blanket “we comply”.",
        you: "The project specification with the standard each clause is written to, plus any fire, coating or acoustic test requirement.",
        ours: "A compliance statement listing where we meet the clause, where we do not, what we propose instead, and what we have not tested and will not imply.",
        gate: "No silent substitution: a deviation you have not accepted is not made, and a claim we cannot support with a report is not made either.",
        clock: "Issued with the quotation, or separately on request when you are still writing the specification.",
    },
    {
        n: "03",
        t: "Setting-out, shop drawings and panel numbering",
        s: "The stage where a project either gets built or gets rebuilt; drawings are made to the point a crew can fix from them.",
        you: "Design intent and the dimensions your trade is holding on site.",
        ours: "Fabrication-level shop drawings: module setting-out, joint widths, expansion and perimeter detail, the attachment interface to the substructure, and a panel numbering schedule that is also the packing list.",
        gate: "Production does not start on a drawing nobody has signed. The signed revision is the datum and earlier issues stop governing; calculation of the supporting structure stays with the project engineer unless we are separately engaged to do it.",
        clock: "First-issue timing, the number of included revision rounds and any charge beyond them are stated on your quotation — ask for the figure before you sign rather than assuming free iterations.",
    },
    {
        n: "04",
        t: "Samples and approval",
        s: "Colour, perforation and surface are approved on physical samples before tooling and before mass production.",
        you: "The finish you want matched, and where a colour is being matched to something, the reference itself.",
        ours: "Sample panels for colour, perforation and finish approval, and the retained record of what was approved.",
        gate: "The approved sample is the datum for the batch. If your project demands a measured tolerance instead of a visual match, name it at enquiry — it changes coating batch control.",
        clock: "Sample production and courier time sit ahead of the production clock, not inside it; confirm the date your programme is measured from.",
    },
    {
        n: "05",
        t: "Production",
        s: "Forming, perforation and coating run on our own 15 lines — 7–10 working days for standard and custom work alike.",
        you: "The approved drawing revision and the released order.",
        ours: "Cut, formed, perforated and coated material to the approved drawings, on 15 in-house lines under a controlled process change record.",
        gate: "A drawing issued after release is a change order, not an edit; we tell you what it costs and what it does to the date before we act on it.",
        clock: "Lead time is 7–10 working days for standard panels and for perforated, formed and special-surface work alike, subject to order size and shop loading. The starting date is the one on your proforma.",
    },
    {
        n: "06",
        t: "Inspection and release",
        s: "Each lot is inspected and recorded before it is allowed into a carton.",
        you: "Your acceptance criteria, if they are stricter than the standard offer.",
        ours: "Coating adhesion, salt spray and sag-resistance checks from our own QC, plus the dimensional and appearance check on the lot and the release record that goes with it.",
        gate: "Third-party inspection is accommodated: nominated inspectors are given access at the packing stage. What we cannot do is issue a report for a test that was never run.",
        clock: "Inspection happens inside the quoted production window, not after it.",
    },
    {
        n: "07",
        t: "Packing, loading plan and staged despatch",
        s: "Packed so a site crew can find the panel the drawing names, without opening crates to look.",
        you: "The site sequence — which area is being closed first, and whether the order has to arrive in more than one lot.",
        ours: "Panels flat in cartons on pallets with carriers and trim boxed separately, crate and package labels tied to the panel numbering schedule, and a container loading plan.",
        gate: "The lot split is fixed before the first container closes, because it changes the packing sequence. A second consignment is planned there, not improvised at the port.",
        clock: "Shipment dates per lot are confirmed at the packing-plan stage; ocean transit sits outside the 7–10 working-day production figure.",
    },
    {
        n: "08",
        t: "After despatch",
        s: "The gap between a delivered order and a finished ceiling is answered, not argued about.",
        you: "Photographs, the panel number and the drawing reference — not a general complaint.",
        ours: "Installation guidance in English, the numbering schedule read against your drawings, remote support, and a quotation for any replacement or supplementary batch.",
        gate: "Responsibility for rework, freight on a replacement and the cost of taking down and refitting is settled by what the record shows, which is why the record is kept. Cover runs one year from shipment against material and workmanship defects.",
        clock: "We reply within 1 hour to an email, WhatsApp or site form message; replacement batches are quoted on their own scale rather than folded into the original MOQ.",
    },
];

/** 商务与责任条款（只在 About 的完整版出现；首页放精简版并链过来） */
export const RESPONSIBILITY_MATRIX = [
    {
        task: "Field re-measurement of the opening",
        who: "The site contractor, unless a factory survey is separately engaged",
        ours: "We raise a query when your dimensions cannot be what the drawings assume, rather than quietly re-drawing around them.",
    },
    {
        task: "Structural and fixing calculations",
        who: "The project engineer of record",
        ours: "We design the product and its attachment detail; we do not sign off your substrate or the building's load path.",
    },
    {
        task: "Fire and acoustic classification",
        who: "Whoever commissioned the test",
        ours: "We state the standard and the classification the tested build-up carries, and say plainly when a build-up has not been tested.",
    },
    {
        task: "Shop drawings and panel numbering",
        who: "MEIYU",
        ours: "Issued for your signature; the signed revision is the production and packing datum.",
    },
    {
        task: "Installation",
        who: "Your crew",
        ours: "English-language guidance, the numbering schedule and remote support — the same reason the labels exist.",
    },
    {
        task: "As-built and handover documents",
        who: "Contractor-led, we supply our side",
        ours: "Release and inspection records, packing list and the approved drawing revision on request for your file.",
    },
];

export const COMMERCIAL_TERMS = [
    {
        t: "What a price is measured on",
        d: "Perforated and formed work priced on developed area and flat panel on visible face are two different numbers for the same wall. Check which basis your quotation uses before comparing suppliers — it is where an apples-to-apples comparison fails first.",
    },
    {
        t: "What is in the price and what is not",
        d: "Our itemisation separates material, forming, perforation, coating, subframe and accessories, fixings, packing and the drawing work. Read the exclusion lines, not the total.",
    },
    {
        t: "Trade terms",
        d: "Freight and customs clearance sit on different sides of an EXW / FOB / CIF line. The term used is stated on the quotation; a landed-cost comparison between two suppliers only works if both were quoted on the same term.",
    },
    {
        t: "Payment stages",
        d: "Deposit and balance stages are set out on the proforma, and the production clock is measured from the date on that document — not from the day the enquiry was sent.",
    },
    {
        t: "Change after release",
        d: "A drawing revision issued after production starts is priced as a change order with its effect on the date, so nobody discovers the cost after the fact.",
    },
    {
        t: "Short, damaged or late-added panels",
        d: "Replacement and supplementary batches are quoted on their own quantity rather than inheriting the original order's minimum — which is how a small site correction does not become a fight.",
    },
    {
        t: "Third-party inspection",
        d: "Nominated inspectors are accommodated at the packing stage. We do not publish certificate or test report numbers; they are released against a request at quotation stage.",
    },
    {
        t: "Warranty scope",
        d: "10 years PE and 15 years PVDF coating under standard atmospheric exposure, and one year from shipment against material and workmanship defects. Coastal and high-salt exposure can require a different coating specification.",
    },
];
