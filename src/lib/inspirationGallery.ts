/**
 * inspirationGallery.ts — 灵感瀑布流（/inspiration/）的唯一数据源。
 *
 * ★ 这个文件由 .tmp-work/insp-pick.py + insp-emit.py 从 R2 实际盘点结果生成，
 *   之后再改请直接改这里（加一行、删一行都行），不要重跑脚本 —— 重跑会把
 *   手工剔掉的六张「图里带字」的图捞回来。
 *
 * 三条入选规则（业主 2026-10-30 口径 + AGENTS.md 图片红线）：
 *   1. 只用自有命名空间：home/（首页素材）、products/（业主实拍）、
 *      renders/（本厂生成图）。blog/ 下的图当年是从参考文章转存的，版权不在我们手上。
 *   2. 语义名带真实建筑 / 机场 / 品牌的一律不用：这页鼠标放上去就是「找我们定制」，
 *      配一张写着某机场的图等于宣称那是我们做的工程。
 *   3. 图里带文字的不用（CAD 图、安装示意、色卡大字标题），逐张目检过。
 *
 * ★ 全部图片都在 R2 的 inspiration/<分类>/ 命名空间下，是从 home/ products/ renders/
 *   复制过来的副本，不是引用 —— 业主删掉或换掉这里的图，不会影响产品页与首页。
 *   新增图片：先传到 inspiration/<分类>/（走 docs/r2-image-pipeline.py --prefix），再往下加一行。
 *
 * cats 里的分类可以多个；weight 只影响出图顺序（0 场景 / 1 节点近景 / 2 白底样板），
 * 目的是让第一屏是空间图而不是一排目录切图。
 */

export type InspoCat = "facade" | "ceiling" | "perforation" | "fluted-wall" | "finish" | "other";

export interface InspoItem {
    src: string;
    alt: string;
    w: number;
    h: number;
    cats: InspoCat[];
    weight: number;
}

export const INSPO_TABS: { id: InspoCat | "all"; label: string }[] = [
    { id: "all", label: "Everything" },
    { id: "facade", label: "Facades & Cladding" },
    { id: "ceiling", label: "Ceilings" },
    { id: "fluted-wall", label: "Fluted & Wall Panels" },
    { id: "perforation", label: "Perforation & Acoustic" },
    { id: "finish", label: "Finishes & Details" },
    { id: "other", label: "More" },
];

export const INSPO_ITEMS: InspoItem[] = [
    { src: "https://file.meiyualuminum.com/inspiration/ceiling/black-perforated-aluminum-ceiling-circular-holes-backlit-office-lobby.webp", alt: "Black perforated aluminium ceiling circular holes backlit office lobby", w: 700, h: 700, weight: 0, cats: ["ceiling", "perforation", "finish"] },
    { src: "https://file.meiyualuminum.com/inspiration/ceiling/gradient-perforated-aluminum-ceiling-panels-linear-led-library-office.webp", alt: "Gradient perforated aluminium ceiling panels linear LED library office", w: 700, h: 700, weight: 0, cats: ["ceiling", "perforation", "finish"] },
    { src: "https://file.meiyualuminum.com/inspiration/ceiling/wood-finish-aluminum-strip-ceiling-steel-frame-office-lobby-8-bishopsgate.webp", alt: "Wood finish aluminium strip ceiling steel frame office lobby 8 bishopsgate", w: 700, h: 700, weight: 0, cats: ["ceiling", "finish"] },
    { src: "https://file.meiyualuminum.com/inspiration/facade/modern-skyscraper-perforated-facade-low-angle.webp", alt: "Modern skyscraper perforated low angle", w: 700, h: 700, weight: 0, cats: ["facade", "perforation"] },
    { src: "https://file.meiyualuminum.com/inspiration/facade/parametric-tower-undulating-metal-fins-aerial.webp", alt: "Parametric tower undulating metal fins aerial", w: 700, h: 700, weight: 0, cats: ["facade"] },
    { src: "https://file.meiyualuminum.com/inspiration/facade/white-wave-balcony-residential-tower-facade.webp", alt: "White wave balcony residential tower", w: 700, h: 700, weight: 0, cats: ["facade", "finish"] },
    { src: "https://file.meiyualuminum.com/inspiration/facade/aluminium-batten-corridor-doorway-cladding-integrated-linear-lighting.webp", alt: "Aluminium batten corridor doorway cladding integrated linear lighting", w: 700, h: 700, weight: 0, cats: ["facade", "ceiling", "fluted-wall"] },
    { src: "https://file.meiyualuminum.com/inspiration/fluted-wall/aluminium-batten-feature-wall-backlit-landscape-projection-interior.webp", alt: "Aluminium batten feature wall backlit landscape projection interior", w: 700, h: 700, weight: 0, cats: ["fluted-wall"] },
    { src: "https://file.meiyualuminum.com/inspiration/fluted-wall/aluminium-batten-partition-wall-moss-green-wall-biophilic-office-interior.webp", alt: "Aluminium batten partition wall moss green wall biophilic office interior", w: 700, h: 700, weight: 0, cats: ["fluted-wall"] },
    { src: "https://file.meiyualuminum.com/inspiration/facade/aluminium-batten-wall-ceiling-continuous-cladding-led-strip-public-corridor.webp", alt: "Aluminium batten wall ceiling continuous cladding LED strip public corridor", w: 700, h: 700, weight: 0, cats: ["facade", "ceiling", "fluted-wall"] },
    { src: "https://file.meiyualuminum.com/inspiration/fluted-wall/black-aluminium-batten-wall-wave-woven-accent-luxury-corridor.webp", alt: "Black aluminium batten wall wave woven accent luxury corridor", w: 700, h: 700, weight: 0, cats: ["fluted-wall", "finish"] },
    { src: "https://file.meiyualuminum.com/inspiration/ceiling/curved-aluminium-batten-ceiling-wall-luxury-restaurant-interior.webp", alt: "Curved aluminium batten ceiling wall luxury restaurant interior", w: 700, h: 700, weight: 0, cats: ["ceiling", "fluted-wall"] },
    { src: "https://file.meiyualuminum.com/inspiration/facade/exterior-aluminium-batten-facade-cladding-commercial-building.webp", alt: "Exterior aluminium batten cladding commercial building", w: 700, h: 700, weight: 0, cats: ["facade", "fluted-wall"] },
    { src: "https://file.meiyualuminum.com/inspiration/ceiling/large-scale-aluminium-batten-wall-ceiling-corridor-white-linear-lights.webp", alt: "Large scale aluminium batten wall ceiling corridor white linear lights", w: 700, h: 700, weight: 0, cats: ["ceiling", "fluted-wall", "finish"] },
    { src: "https://file.meiyualuminum.com/inspiration/ceiling/circular-ring-aluminum-baffle-ceiling-led-strip-shopping-mall-corridor.webp", alt: "Circular ring aluminium baffle ceiling LED strip shopping mall corridor", w: 700, h: 700, weight: 0, cats: ["ceiling"] },
    { src: "https://file.meiyualuminum.com/inspiration/facade/curved-wood-grain-aluminum-baffle-ceiling-linear-led-public-building-corridor.webp", alt: "Curved wood grain aluminium baffle ceiling linear LED public building corridor", w: 700, h: 700, weight: 0, cats: ["facade", "ceiling", "finish"] },
    { src: "https://file.meiyualuminum.com/inspiration/ceiling/curved-wood-grain-aluminum-baffle-ceiling-warm-led-cove-lighting-hotel-lobby.webp", alt: "Curved wood grain aluminium baffle ceiling warm LED cove lighting hotel lobby", w: 700, h: 700, weight: 0, cats: ["ceiling", "finish"] },
    { src: "https://file.meiyualuminum.com/inspiration/ceiling/white-wave-aluminum-baffle-ceiling-atrium-large-columns-shopping-complex.webp", alt: "White wave aluminium baffle ceiling atrium large columns shopping complex", w: 700, h: 700, weight: 0, cats: ["ceiling", "fluted-wall", "finish"] },
    { src: "https://file.meiyualuminum.com/inspiration/facade/indoor-aluminium-strip-ceiling-glass-curtain-wall-interior.webp", alt: "Indoor aluminium strip ceiling glass curtain wall interior", w: 700, h: 700, weight: 0, cats: ["facade", "ceiling", "fluted-wall"] },
    { src: "https://file.meiyualuminum.com/inspiration/facade/large-span-outdoor-aluminium-strip-ceiling-steel-structure-canopy.webp", alt: "Large span outdoor aluminium strip ceiling steel structure canopy", w: 1000, h: 1000, weight: 0, cats: ["facade", "ceiling"] },
    { src: "https://file.meiyualuminum.com/inspiration/ceiling/wide-plank-aluminium-strip-ceiling-outdoor-corridor-wood-grain-texture.webp", alt: "Wide plank aluminium strip ceiling outdoor corridor wood grain texture", w: 700, h: 700, weight: 0, cats: ["ceiling", "finish"] },
    { src: "https://file.meiyualuminum.com/inspiration/ceiling/installed-ceiling-access-opening-4a8fc8.webp", alt: "Installed ceiling access opening", w: 1200, h: 1200, weight: 0, cats: ["ceiling"] },
    { src: "https://file.meiyualuminum.com/inspiration/ceiling/installed-office-corridor-ceiling-93dac3.webp", alt: "Installed office corridor ceiling", w: 934, h: 934, weight: 0, cats: ["ceiling"] },
    { src: "https://file.meiyualuminum.com/inspiration/ceiling/installed-perforated-room-ceiling-b6a228.webp", alt: "Installed perforated room ceiling", w: 1200, h: 1200, weight: 0, cats: ["ceiling", "perforation"] },
    { src: "https://file.meiyualuminum.com/inspiration/perforation/installed-perforated-showroom-b49dac.webp", alt: "Installed perforated showroom", w: 599, h: 599, weight: 0, cats: ["perforation"] },
    { src: "https://file.meiyualuminum.com/inspiration/ceiling/large-panel-concourse-ceiling-57f00c.webp", alt: "Large panel concourse ceiling", w: 1024, h: 1024, weight: 0, cats: ["ceiling"] },
    { src: "https://file.meiyualuminum.com/inspiration/ceiling/mesh-retail-installed-45d3fd.webp", alt: "Mesh retail installed", w: 1024, h: 1024, weight: 0, cats: ["ceiling", "perforation"] },
    { src: "https://file.meiyualuminum.com/inspiration/fluted-wall/column-wrap-lobby-42f79a.webp", alt: "Column wrap lobby", w: 1024, h: 1024, weight: 0, cats: ["fluted-wall"] },
    { src: "https://file.meiyualuminum.com/inspiration/facade/canopy-radial-joints-28a261.webp", alt: "Canopy radial joints", w: 1024, h: 1024, weight: 0, cats: ["facade"] },
    { src: "https://file.meiyualuminum.com/inspiration/fluted-wall/faceted-vs-true-arc-column-aa664f.webp", alt: "Faceted versus true arc column", w: 1024, h: 1024, weight: 0, cats: ["fluted-wall"] },
    { src: "https://file.meiyualuminum.com/inspiration/fluted-wall/wave-feature-wall-lobby-25146f.webp", alt: "Wave feature wall lobby", w: 1024, h: 1024, weight: 0, cats: ["fluted-wall"] },
    { src: "https://file.meiyualuminum.com/inspiration/facade/canopy-fascia-scene-de42a3.webp", alt: "Canopy fascia scene", w: 1024, h: 1024, weight: 0, cats: ["facade"] },
    { src: "https://file.meiyualuminum.com/inspiration/facade/fluted-facade-scene-954e31.webp", alt: "Fluted scene", w: 1024, h: 1024, weight: 0, cats: ["facade", "fluted-wall"] },
    { src: "https://file.meiyualuminum.com/inspiration/other/transit-platform-scene-e0c8c4.webp", alt: "Transit platform scene", w: 1024, h: 1024, weight: 0, cats: ["other"] },
    { src: "https://file.meiyualuminum.com/inspiration/facade/soffit-column-scene-6a6b7d.webp", alt: "Soffit column scene", w: 1024, h: 1024, weight: 0, cats: ["facade", "fluted-wall"] },
    { src: "https://file.meiyualuminum.com/inspiration/facade/tower-elevation-scene-619664.webp", alt: "Tower elevation scene", w: 1024, h: 1024, weight: 0, cats: ["facade"] },
    { src: "https://file.meiyualuminum.com/inspiration/fluted-wall/column-wrap-lobby-51d9c6.webp", alt: "Column wrap lobby", w: 1024, h: 1024, weight: 0, cats: ["fluted-wall"] },
    { src: "https://file.meiyualuminum.com/inspiration/ceiling/corridor-ceiling-scene-db8f61.webp", alt: "Corridor ceiling scene", w: 1024, h: 1024, weight: 0, cats: ["ceiling"] },
    { src: "https://file.meiyualuminum.com/inspiration/finish/install-clip-detail-c023d6.webp", alt: "Install clip detail", w: 1024, h: 1024, weight: 0, cats: ["finish"] },
    { src: "https://file.meiyualuminum.com/inspiration/fluted-wall/lobby-feature-wall-scene-b545ad.webp", alt: "Lobby feature wall scene", w: 1024, h: 1024, weight: 0, cats: ["fluted-wall"] },
    { src: "https://file.meiyualuminum.com/inspiration/ceiling/grid-concourse-installed-43c744.webp", alt: "Grid concourse installed", w: 1024, h: 1024, weight: 0, cats: ["ceiling"] },
    { src: "https://file.meiyualuminum.com/inspiration/ceiling/atrium-ceiling-scene-dd5b6f.webp", alt: "Atrium ceiling scene", w: 1024, h: 1024, weight: 0, cats: ["ceiling"] },
    { src: "https://file.meiyualuminum.com/inspiration/facade/facade-screen-shade-scene-438c49.webp", alt: "Screen shade scene", w: 1024, h: 1024, weight: 0, cats: ["facade", "perforation"] },
    { src: "https://file.meiyualuminum.com/inspiration/other/metro-concourse-installed-a7c71b.webp", alt: "Metro concourse installed", w: 1024, h: 1024, weight: 0, cats: ["other"] },
    { src: "https://file.meiyualuminum.com/inspiration/facade/canopy-soffit-scene-935c6e.webp", alt: "Canopy soffit scene", w: 1024, h: 1024, weight: 0, cats: ["facade"] },
    { src: "https://file.meiyualuminum.com/inspiration/facade/tower-facade-scene-426d98.webp", alt: "Tower scene", w: 1024, h: 1024, weight: 0, cats: ["facade"] },
    { src: "https://file.meiyualuminum.com/inspiration/ceiling/atrium-radial-blade-ceiling-6ac322.webp", alt: "Atrium radial blade ceiling", w: 1024, h: 1024, weight: 0, cats: ["ceiling"] },
    { src: "https://file.meiyualuminum.com/inspiration/ceiling/hexagonal-honeycomb-aluminum-ceiling-large-span-public-space.webp", alt: "Hexagonal honeycomb aluminium ceiling large span public space", w: 700, h: 700, weight: 1, cats: ["ceiling", "fluted-wall"] },
    { src: "https://file.meiyualuminum.com/inspiration/ceiling/modular-aluminum-strip-ceiling-diamond-steel-node-commercial-arcade.webp", alt: "Modular aluminium strip ceiling diamond steel node commercial arcade", w: 700, h: 700, weight: 1, cats: ["ceiling"] },
    { src: "https://file.meiyualuminum.com/inspiration/facade/perforated-metal-ceiling-backlit-triangular-pattern-building-entrance.webp", alt: "Perforated metal ceiling backlit triangular pattern building entrance", w: 700, h: 700, weight: 1, cats: ["facade", "ceiling", "perforation"] },
    { src: "https://file.meiyualuminum.com/inspiration/facade/avant-garde-skyscraper-dark-fins-gold-trim-under-construction.webp", alt: "Avant garde skyscraper dark fins gold trim under construction", w: 700, h: 700, weight: 1, cats: ["facade", "fluted-wall", "finish"] },
    { src: "https://file.meiyualuminum.com/inspiration/facade/modern-building-corner-perforated-metal-panel-louvers-detail.webp", alt: "Modern building corner perforated metal panel louvers detail", w: 700, h: 700, weight: 1, cats: ["facade", "perforation", "fluted-wall", "finish"] },
    { src: "https://file.meiyualuminum.com/inspiration/facade/organic-wave-balcony-apartment-building-streetview.webp", alt: "Organic wave balcony apartment building streetview", w: 700, h: 700, weight: 1, cats: ["facade"] },
    { src: "https://file.meiyualuminum.com/inspiration/ceiling/dark-gray-aluminum-baffle-ceiling-linear-led-marble-staircase-interior.webp", alt: "Dark gray aluminium baffle ceiling linear LED marble staircase interior", w: 700, h: 700, weight: 1, cats: ["ceiling"] },
    { src: "https://file.meiyualuminum.com/inspiration/ceiling/u-baffle-wood-grain-aluminum-square-tube-ceiling-commercial-interior.webp", alt: "U baffle wood grain aluminium square tube ceiling commercial interior", w: 700, h: 700, weight: 1, cats: ["ceiling", "finish"] },
    { src: "https://file.meiyualuminum.com/inspiration/ceiling/wave-wood-grain-aluminum-baffle-ceiling-shopping-mall.webp", alt: "Wave wood grain aluminium baffle ceiling shopping mall", w: 700, h: 700, weight: 1, cats: ["ceiling", "finish"] },
    { src: "https://file.meiyualuminum.com/inspiration/ceiling/commercial-interior-aluminium-strip-ceiling-grid-recessed-warm-lights.webp", alt: "Commercial interior aluminium strip ceiling grid recessed warm lights", w: 700, h: 700, weight: 1, cats: ["ceiling"] },
    { src: "https://file.meiyualuminum.com/inspiration/ceiling/luxury-interior-aluminium-strip-ceiling-living-room-design.webp", alt: "Luxury interior aluminium strip ceiling living room design", w: 700, h: 700, weight: 1, cats: ["ceiling"] },
    { src: "https://file.meiyualuminum.com/inspiration/facade/modern-exterior-aluminium-strip-ceiling-black-steel-frame-glass-facade.webp", alt: "Modern exterior aluminium strip ceiling black steel frame glass", w: 700, h: 700, weight: 1, cats: ["facade", "ceiling", "finish"] },
    { src: "https://file.meiyualuminum.com/inspiration/facade/outdoor-aluminium-strip-ceiling-balcony-overhang-spotlight.webp", alt: "Outdoor aluminium strip ceiling balcony overhang spotlight", w: 700, h: 700, weight: 1, cats: ["facade", "ceiling"] },
    { src: "https://file.meiyualuminum.com/inspiration/ceiling/semi-outdoor-aluminium-strip-ceiling-recessed-lights-open-air-space.webp", alt: "Semi outdoor aluminium strip ceiling recessed lights open air space", w: 700, h: 700, weight: 1, cats: ["ceiling"] },
    { src: "https://file.meiyualuminum.com/inspiration/ceiling/aluminum-clip-in-ceiling.webp", alt: "Aluminium clip in ceiling", w: 800, h: 800, weight: 1, cats: ["ceiling"] },
    { src: "https://file.meiyualuminum.com/inspiration/ceiling/aluminum-edge-trim-strip.webp", alt: "Aluminium edge trim strip", w: 800, h: 800, weight: 1, cats: ["ceiling", "fluted-wall"] },
    { src: "https://file.meiyualuminum.com/inspiration/fluted-wall/aluminum-honeycomb-panel.webp", alt: "Aluminium honeycomb panel", w: 800, h: 800, weight: 1, cats: ["fluted-wall"] },
    { src: "https://file.meiyualuminum.com/inspiration/ceiling/aluminum-mesh-ceiling.webp", alt: "Aluminium mesh ceiling", w: 800, h: 800, weight: 1, cats: ["ceiling", "perforation"] },
    { src: "https://file.meiyualuminum.com/inspiration/ceiling/aluminum-open-cell-ceiling.webp", alt: "Aluminium open cell ceiling", w: 800, h: 800, weight: 1, cats: ["ceiling"] },
    { src: "https://file.meiyualuminum.com/inspiration/perforation/aluminum-screen-partition-sq.webp", alt: "Aluminium screen partition", w: 800, h: 800, weight: 1, cats: ["perforation", "fluted-wall"] },
    { src: "https://file.meiyualuminum.com/inspiration/fluted-wall/aluminum-skirting-board.webp", alt: "Aluminium skirting board", w: 800, h: 800, weight: 1, cats: ["fluted-wall"] },
    { src: "https://file.meiyualuminum.com/inspiration/ceiling/c-shape-baffle-ceiling.webp", alt: "C shape baffle ceiling", w: 800, h: 800, weight: 1, cats: ["ceiling"] },
    { src: "https://file.meiyualuminum.com/inspiration/ceiling/ceiling-aluminum-honeycomb.webp", alt: "Ceiling aluminium honeycomb", w: 800, h: 800, weight: 1, cats: ["ceiling", "fluted-wall"] },
    { src: "https://file.meiyualuminum.com/inspiration/fluted-wall/led-aluminum-skirting-board.webp", alt: "LED aluminium skirting board", w: 800, h: 800, weight: 1, cats: ["fluted-wall"] },
    { src: "https://file.meiyualuminum.com/inspiration/ceiling/metal-furring-channel.webp", alt: "Metal furring channel", w: 800, h: 800, weight: 1, cats: ["ceiling"] },
    { src: "https://file.meiyualuminum.com/inspiration/ceiling/round-tube-baffle-ceiling.webp", alt: "Round tube baffle ceiling", w: 800, h: 800, weight: 1, cats: ["ceiling"] },
    { src: "https://file.meiyualuminum.com/inspiration/ceiling/square-tube-baffle-ceiling.webp", alt: "Square tube baffle ceiling", w: 800, h: 800, weight: 1, cats: ["ceiling"] },
    { src: "https://file.meiyualuminum.com/inspiration/ceiling/teardrop-shape-baffle-ceiling.webp", alt: "Teardrop shape baffle ceiling", w: 800, h: 800, weight: 1, cats: ["ceiling"] },
    { src: "https://file.meiyualuminum.com/inspiration/ceiling/threaded-ceiling-hanger-rod.webp", alt: "Threaded ceiling hanger rod", w: 800, h: 800, weight: 1, cats: ["ceiling"] },
    { src: "https://file.meiyualuminum.com/inspiration/ceiling/u-type-baffle-ceiling.webp", alt: "U type baffle ceiling", w: 750, h: 750, weight: 1, cats: ["ceiling"] },
    { src: "https://file.meiyualuminum.com/inspiration/ceiling/v-shape-baffle-ceiling.webp", alt: "V shape baffle ceiling", w: 800, h: 800, weight: 1, cats: ["ceiling"] },
    { src: "https://file.meiyualuminum.com/inspiration/ceiling/aluminum-ceiling-tile-sq.webp", alt: "Aluminium ceiling tile", w: 800, h: 800, weight: 1, cats: ["ceiling"] },
    { src: "https://file.meiyualuminum.com/inspiration/fluted-wall/aluminum-honeycomb-core-panel-sq.webp", alt: "Aluminium honeycomb core panel", w: 800, h: 800, weight: 1, cats: ["fluted-wall"] },
    { src: "https://file.meiyualuminum.com/inspiration/ceiling/aluminum-square-tube-sq.webp", alt: "Aluminium square tube", w: 800, h: 800, weight: 1, cats: ["ceiling"] },
    { src: "https://file.meiyualuminum.com/inspiration/ceiling/aluminum-strip-panel-sq.webp", alt: "Aluminium strip panel", w: 800, h: 800, weight: 1, cats: ["ceiling"] },
    { src: "https://file.meiyualuminum.com/inspiration/facade/aluminum-veneer-sq.webp", alt: "Aluminium veneer", w: 800, h: 800, weight: 1, cats: ["facade"] },
    { src: "https://file.meiyualuminum.com/inspiration/fluted-wall/fluted-aluminum-panel-sq.webp", alt: "Fluted aluminium panel", w: 800, h: 800, weight: 1, cats: ["fluted-wall"] },
    { src: "https://file.meiyualuminum.com/inspiration/ceiling/u-shaped-aluminum-square-tube-sq.webp", alt: "U shaped aluminium square tube", w: 533, h: 533, weight: 1, cats: ["ceiling"] },
    { src: "https://file.meiyualuminum.com/inspiration/ceiling/clip-in-edge-profile-stack-0bc704.webp", alt: "Clip in edge profile stack", w: 750, h: 750, weight: 1, cats: ["ceiling", "fluted-wall"] },
    { src: "https://file.meiyualuminum.com/inspiration/ceiling/clip-in-panel-corner-stacked-1e9eab.webp", alt: "Clip in panel corner stacked", w: 1200, h: 1200, weight: 1, cats: ["ceiling", "fluted-wall"] },
    { src: "https://file.meiyualuminum.com/inspiration/ceiling/clip-in-sharp-edge-closeup-74c3ed.webp", alt: "Clip in sharp edge closeup", w: 750, h: 750, weight: 1, cats: ["ceiling", "fluted-wall", "finish"] },
    { src: "https://file.meiyualuminum.com/inspiration/ceiling/clip-in-spring-clip-edge-70ecf0.webp", alt: "Clip in spring clip edge", w: 800, h: 800, weight: 1, cats: ["ceiling", "fluted-wall"] },
    { src: "https://file.meiyualuminum.com/inspiration/ceiling/clip-in-tile-demount-hand-d12d33.webp", alt: "Clip in tile demount hand", w: 800, h: 800, weight: 1, cats: ["ceiling"] },
    { src: "https://file.meiyualuminum.com/inspiration/ceiling/decorative-perforated-tile-932a30.webp", alt: "Decorative perforated tile", w: 1200, h: 1200, weight: 1, cats: ["ceiling", "perforation"] },
    { src: "https://file.meiyualuminum.com/inspiration/fluted-wall/folded-edge-cassette-hook-5f1766.webp", alt: "Folded edge cassette hook", w: 1024, h: 1024, weight: 1, cats: ["fluted-wall"] },
    { src: "https://file.meiyualuminum.com/inspiration/fluted-wall/honeycomb-core-cutaway-b3b352.webp", alt: "Honeycomb core cutaway", w: 1024, h: 1024, weight: 1, cats: ["fluted-wall"] },
    { src: "https://file.meiyualuminum.com/inspiration/ceiling/expanded-metal-diamond-mesh-74cebb.webp", alt: "Expanded metal diamond mesh", w: 1024, h: 1024, weight: 1, cats: ["ceiling", "perforation"] },
    { src: "https://file.meiyualuminum.com/inspiration/ceiling/mesh-cassette-stiffened-edge-04873e.webp", alt: "Mesh cassette stiffened edge", w: 1024, h: 1024, weight: 1, cats: ["ceiling", "perforation", "fluted-wall"] },
    { src: "https://file.meiyualuminum.com/inspiration/ceiling/woven-crimped-wire-mesh-d6030a.webp", alt: "Woven crimped wire mesh", w: 1024, h: 1024, weight: 1, cats: ["ceiling", "perforation", "fluted-wall"] },
    { src: "https://file.meiyualuminum.com/inspiration/other/roll-bending-workshop-0b4e1d.webp", alt: "Roll bending workshop", w: 1024, h: 1024, weight: 1, cats: ["other"] },
    { src: "https://file.meiyualuminum.com/inspiration/finish/open-joint-drain-detail-809151.webp", alt: "Open joint drain detail", w: 1024, h: 1024, weight: 1, cats: ["finish"] },
    { src: "https://file.meiyualuminum.com/inspiration/finish/allmetal-core-macro-f598ab.webp", alt: "Allmetal core macro", w: 1024, h: 1024, weight: 1, cats: ["finish"] },
    { src: "https://file.meiyualuminum.com/inspiration/finish/open-joint-detail-e86b14.webp", alt: "Open joint detail", w: 1024, h: 1024, weight: 1, cats: ["finish"] },
    { src: "https://file.meiyualuminum.com/inspiration/finish/hygiene-cutout-detail-5c8e61.webp", alt: "Hygiene cutout detail", w: 1024, h: 1024, weight: 1, cats: ["finish"] },
    { src: "https://file.meiyualuminum.com/inspiration/perforation/acoustic-perforated-detail-af0268.webp", alt: "Acoustic perforated detail", w: 1024, h: 1024, weight: 1, cats: ["perforation", "finish"] },
    { src: "https://file.meiyualuminum.com/inspiration/ceiling/channel-crossing-joint-detail-8f0259.webp", alt: "Channel crossing joint detail", w: 1024, h: 1024, weight: 1, cats: ["ceiling", "finish"] },
    { src: "https://file.meiyualuminum.com/inspiration/ceiling/open-cell-grid-panel-920f4b.webp", alt: "Open cell grid panel", w: 1024, h: 1024, weight: 1, cats: ["ceiling"] },
    { src: "https://file.meiyualuminum.com/inspiration/perforation/gradient-partition-screen-cd10ec.webp", alt: "Gradient partition screen", w: 1024, h: 1024, weight: 1, cats: ["perforation", "fluted-wall", "finish"] },
    { src: "https://file.meiyualuminum.com/inspiration/perforation/macro-hole-fleece-a504bb.webp", alt: "Macro hole fleece", w: 1024, h: 1024, weight: 1, cats: ["perforation", "finish"] },
    { src: "https://file.meiyualuminum.com/inspiration/ceiling/blade-row-rolled-heads-73deeb.webp", alt: "Blade row rolled heads", w: 1024, h: 1024, weight: 1, cats: ["ceiling"] },
    { src: "https://file.meiyualuminum.com/inspiration/perforation/perforated-pattern-options-8bc2c1-sq.webp", alt: "Perforated pattern options", w: 608, h: 608, weight: 2, cats: ["perforation"] },
    { src: "https://file.meiyualuminum.com/inspiration/finish/wood-grain-finish-options-9a666a-sq.webp", alt: "Wood grain finish options", w: 1199, h: 1199, weight: 2, cats: ["finish"] },
    { src: "https://file.meiyualuminum.com/inspiration/finish/finish-options-samples-339f98.webp", alt: "Finish options samples", w: 1024, h: 1024, weight: 2, cats: ["finish"] },
    { src: "https://file.meiyualuminum.com/inspiration/finish/finish-options-samples-d4fca6.webp", alt: "Finish options samples", w: 1024, h: 1024, weight: 2, cats: ["finish"] },
    { src: "https://file.meiyualuminum.com/inspiration/finish/finish-options-samples-c31f42.webp", alt: "Finish options samples", w: 1024, h: 1024, weight: 2, cats: ["finish"] },
    { src: "https://file.meiyualuminum.com/inspiration/finish/joint-options-samples-475031.webp", alt: "Joint options samples", w: 1024, h: 1024, weight: 2, cats: ["finish"] },
    { src: "https://file.meiyualuminum.com/inspiration/finish/pvdf-color-range-6d9b67.webp", alt: "PVDF color range", w: 1024, h: 1024, weight: 2, cats: ["finish"] },
    { src: "https://file.meiyualuminum.com/inspiration/finish/pvdf-finish-samples-990c33.webp", alt: "PVDF finish samples", w: 1024, h: 1024, weight: 2, cats: ["finish"] },
    { src: "https://file.meiyualuminum.com/inspiration/fluted-wall/edge-treatment-options-81c65c.webp", alt: "Edge treatment options", w: 1024, h: 1024, weight: 2, cats: ["fluted-wall"] },
    { src: "https://file.meiyualuminum.com/inspiration/finish/finish-samples-254f42.webp", alt: "Finish samples", w: 1024, h: 1024, weight: 2, cats: ["finish"] },
    { src: "https://file.meiyualuminum.com/inspiration/finish/rib-geometry-samples-eddf28.webp", alt: "Rib geometry samples", w: 1024, h: 1024, weight: 2, cats: ["finish"] },
    { src: "https://file.meiyualuminum.com/inspiration/perforation/hole-family-samples-f927aa.webp", alt: "Hole family samples", w: 1024, h: 1024, weight: 2, cats: ["perforation", "finish"] },
    { src: "https://file.meiyualuminum.com/inspiration/finish/finish-options-samples-9d79dc.webp", alt: "Finish options samples", w: 1024, h: 1024, weight: 2, cats: ["finish"] },
    { src: "https://file.meiyualuminum.com/inspiration/finish/pitch-spacing-samples-e65ab0.webp", alt: "Pitch spacing samples", w: 1024, h: 1024, weight: 2, cats: ["finish"] },
    { src: "https://file.meiyualuminum.com/inspiration/finish/cell-size-samples-ad582e.webp", alt: "Cell size samples", w: 1024, h: 1024, weight: 2, cats: ["finish"] },
    { src: "https://file.meiyualuminum.com/inspiration/ceiling/blade-spacing-density-samples-98d196.webp", alt: "Blade spacing density samples", w: 1024, h: 1024, weight: 2, cats: ["ceiling", "finish"] },
    { src: "https://file.meiyualuminum.com/inspiration/finish/finish-options-samples-f0533c.webp", alt: "Finish options samples", w: 1024, h: 1024, weight: 2, cats: ["finish"] },
];
