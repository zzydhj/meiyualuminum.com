/**
 * productKnowledge.ts — 产品知识库
 *
 * 按品类 slug 索引，为产品详情页提供丰富的技术参数、安装指南、
 * 表面处理选项、应用场景等结构化数据。
 *
 * 使用方式：
 *   import { productKnowledge } from '../lib/productKnowledge';
 *   const knowledge = productKnowledge[categorySlug];
 */

// ─── 类型定义 ───────────────────────────────────────────────

export interface SpecRow {
    label: string;
    value: string;
}

export interface SurfaceOption {
    name: string;
    description: string;
    thickness: string;
    warranty: string;
    suitableFor: string[];
}

export interface ApplicationScenario {
    type: string;
    whyUse: string;
    recommendedProducts: string[];
    keyBenefit: string;
}

export interface InstallationStep {
    step: number;
    title: string;
    description: string;
}

/**
 * products.enriched_specs（JSONB）—— 产品级数据覆盖层。
 *
 * 详情页按「产品级优先、品类级回退」取值：同一品类下的不同产品
 * （如 lay-in 与 clip-in 两种铝扣板）安装方式与规格不同，靠本结构覆盖，
 * 不必为每个产品拆一个品类知识条目。所有字段可选，缺失即回退 ProductKnowledge。
 */
export interface ProductEnrichedSpecs {
    /** 产品专属概述（Overview 顶部高亮段） */
    summary?: string;
    /** 覆盖 technicalSpecs */
    specs?: SpecRow[];
    /** 覆盖 keyFeatures */
    features?: string[];
    /** 产品专属推荐场景标签（Applications Tab 顶部胶囊） */
    applications?: string[];
    /** 覆盖 standardSizes */
    standardSizes?: SpecRow[];
    /** 覆盖 installationSteps */
    installationSteps?: InstallationStep[];
    /** 覆盖 installationTips */
    installationTips?: string[];
}

export interface ProductKnowledge {
    categorySlug: string;
    categoryName: string;
    overview: string;
    keyFeatures: string[];
    technicalSpecs: SpecRow[];
    surfaceOptions: SurfaceOption[];
    standardSizes: SpecRow[];
    installationSteps: InstallationStep[];
    installationTips: string[];
    applications: ApplicationScenario[];
    certifications: string[];
}

// ─── 产品知识库数据 ─────────────────────────────────────────

export const productKnowledge: Record<string, ProductKnowledge> = {

    // ═══════════════════════════════════════════════════════════
    // 1. Aluminum Veneer（铝单板）
    // ═══════════════════════════════════════════════════════════
    "aluminum-veneer": {
        categorySlug: "aluminum-veneer",
        categoryName: "Aluminum Veneer",
        overview: "Aluminum veneer is a facade and lining material formed from aluminium alloy sheet (1100 / 3003 / 5005 series). Through CNC cutting, folding and welding it can be formed into flat panels, curved surfaces and complex geometric shapes. Finished with PVDF, powder or PE coating, it offers the weather resistance and colour stability of a non-combustible metal surface.",
        keyFeatures: [
            "Custom shapes: flat, curved, folded, perforated and parametric forms",
            "PVDF coating at the AAMA 2605 performance tier — 15-year standard-offer warranty",
            "Light for its stiffness: about 4 kg/m² at 1.5 mm and 8 kg/m² at 3.0 mm (calculated at 2 700 kg/m³)",
            "100% recyclable aluminium alloy — sustainable building material",
            "Non-combustible substrate; declared ASTM E84 Class A and EN 13501-1 Class B-s1 for the coated product",
            "Factory pre-fabrication ensures consistent quality and fast installation",
            "Compatible with concealed fix and face-fix subframe systems"
        ],
        technicalSpecs: [
            { label: "Material", value: "AA1100 / AA3003 / AA5005 Aluminum Alloy" },
            { label: "Panel Thickness", value: "Our standard range 0.8–1.5 mm; facade gauges of 1.5 / 2.0 / 2.5 / 3.0 mm produced to the specified drawing" },
            { label: "Panel Format", value: "Cut to project drawing — no fixed module for facade veneer" },
            { label: "Weight", value: "≈ gauge (mm) × 2.7 kg/m² — 2.0 mm ≈ 5.4, 3.0 mm ≈ 8.1 kg/m²" },
            { label: "Tensile Strength", value: "AA3003-H24 nominal ≈ 130 MPa minimum (material property, not a design value)" },
            { label: "Yield Strength", value: "AA3003-H24 nominal ≈ 115 MPa (material property, not a design value)" },
            { label: "Fire Rating", value: "Substrate non-combustible; our declarations are ASTM E84 Class A and EN 13501-1 Class B-s1 for the coated product" },
            { label: "Wind Load Resistance", value: "Engineered and tested per project (ASTM E330 / EN 12150 basis) — not a fixed product rating" },
            { label: "Thermal Expansion", value: "2.4 × 10⁻⁵ /°C" },
            { label: "Sound Insulation", value: "A property of the assembled wall, not of the panel; test the build-up (ASTM E90 / ISO 10140)" },
            { label: "Flatness Tolerance", value: "Agreed on the shop drawing per gauge, format and joint; verified on the first article" },
            { label: "Coating Adhesion", value: "Cross-cut test per ISO 2409, judged on the delivered finish" },
        ],
        surfaceOptions: [
            { name: "PVDF (Fluorocarbon) Coating", description: "2-coat, 3-coat or 4-coat PVDF system at the AAMA 2605 resin tier. Superior UV, chemical and salt-spray resistance.", thickness: "25–40 μm total film", warranty: "15-year standard offer (AAMA 2605 class)", suitableFor: ["Exterior facades", "Coastal environments", "High-UV regions", "Landmark architecture"] },
            { name: "Powder Coating (Polyester)", description: "Electrostatic powder coating, thermoset polyester. Wide RAL color range with excellent mechanical durability.", thickness: "60–80 μm film", warranty: "Standard offer per quotation (PE coil tier: 10 years)", suitableFor: ["Interior applications", "Covered exterior", "Budget-conscious projects", "Standard commercial facades"] },
            { name: "Anodized Finish", description: "Electrochemical anodizing creates a hard, integral oxide layer. Metallic appearance with natural aluminum luster.", thickness: "15–25 μm oxide layer (AA Class I/II)", warranty: "Outside the coating warranty schedule; the oxide is UV-stable", suitableFor: ["Modern minimalist design", "Interior feature walls", "Low-maintenance applications"] },
        ],
        standardSizes: [
            { label: "Ceiling / Wall Formats", value: "300 × 300mm to 600 × 1200mm standard, custom to project drawing" },
            { label: "Facade Panels", value: "Cut to the job — larger formats are a project decision, not a catalogue size" },
            { label: "Curved Panel (Single Curve)", value: "Formed to the model; cold roll-forming is commonly held to a radius of about 5 × sheet thickness" },
            { label: "Curved Panel (Double Curve)", value: "Custom formed, project-specific" },
            { label: "Perforated Panel", value: "Ø1.5–6mm, open area 10–30% (our stated capability range)" },
        ],
        installationSteps: [
            { step: 1, title: "Subframe Installation", description: "Install aluminum or galvanized steel subframe to the structural wall using expansion bolts or chemical anchors. Typical spacing: 600–1200mm horizontally." },
            { step: 2, title: "Waterproof Membrane", description: "Apply breather membrane over the subframe to create a ventilated rain-screen cavity." },
            { step: 3, title: "Panel Positioning", description: "Lift panels using suction cups or mechanical lifts. Start from bottom-up for horizontal layouts." },
            { step: 4, title: "Fixing", description: "Secure panels to subframe using concealed angle brackets (rear fix) or face-fix screws with color-matched caps. Allow 3mm gap per 1000mm for thermal expansion." },
            { step: 5, title: "Joint Sealing", description: "Apply weather-grade silicone sealant to open joints. For closed-joint systems, install backing rod and seal per spec." },
            { step: 6, title: "Protection Film Removal", description: "Remove PE protective film within 30 days of installation." },
        ],
        installationTips: [
            "Always allow 3–5mm expansion gaps between panels",
            "Store panels flat and dry on-site; do not stack more than 30 panels high",
            "Use nylon or rubber-tipped tools to avoid scratching the coating",
            "Cut panels only with carbide-tipped blades; deburr edges before installation",
            "Install panels in consistent grain/coating direction",
        ],
        applications: [
            { type: "Commercial Skyscrapers", whyUse: "Lightweight cladding reduces structural cost while enabling bold architectural expression.", recommendedProducts: ["3.0mm PVDF flat panels", "Curved panels for corners", "Perforated panels for ventilation zones"], keyBenefit: "Far lighter than stone or GRC; 15-year PVDF coating warranty (standard offer)" },
            { type: "Airport Terminals", whyUse: "Large-format panels minimise joints for clean aesthetics, on a non-combustible metal substrate.", recommendedProducts: ["2.5mm PVDF metallic panels", "Curved panels for ceiling transitions"], keyBenefit: "Fast large-area installation, non-combustible substrate" },
            { type: "Sports Stadiums", whyUse: "Custom curved and angular panels create dynamic facades.", recommendedProducts: ["3.0mm PVDF folded panels", "Parametric CNC-cut panels"], keyBenefit: "Design freedom, high wind load resistance" },
            { type: "Hospitals & Healthcare", whyUse: "Smooth, non-porous surface is easy to clean and maintain.", recommendedProducts: ["2.0mm powder-coated (interior)", "PVDF panels (exterior)"], keyBenefit: "Hygienic, low maintenance, fire-rated" },
        ],
        certifications: ["ISO 9001", "CE", "ASTM E84 Class A", "EN 13501-1 Class B-s1"],
    },

    // ═══════════════════════════════════════════════════════════
    // 2. Aluminum Strip Panel（铝条扣板）
    // ═══════════════════════════════════════════════════════════
    "aluminum-strip-panel": {
        categorySlug: "aluminum-strip-panel",
        categoryName: "Aluminum Strip Panel",
        overview: "An aluminium strip ceiling — sold variously as a linear, batten, slat or strip-panel ceiling — is a run of narrow metal strips hung side by side on a suspended carrier grid, either butted so the surface reads as one continuous plane (closed or concealed joint) or held apart so a shadow line or an open cavity shows between them (open joint). Each strip is a shallow formed section: a flat face with both edges turned down at right angles, and it is carried by those turned-down legs — clipped, hooked or screwed — never through the visible face, which is why a finished ceiling shows no fixings at all. Lengths run to 6 m without a joint, so corridors, platforms and storefront soffits keep one unbroken line, and the open-joint version doubles as a soffit or low facade cladding that screens the structure without sealing it. One warning worth stating plainly: the trade's own listings cannot tell you which joint you are buying. The same strip is photographed and sold as 'conceal', 'open' and 'S-strip' by different sellers, so the section drawing — not the product title or the attribute field — is the only document to trust.",
        keyFeatures: [
            "Two genuinely different ceilings share one name — a closed, near-seamless plane or an open linear screen with a shadow gap; the choice changes the section, the carrier and the price, so settle it before quoting",
            "Invisible fixing: the strip hangs by its turned-down legs, so nothing screws through the face and the visible surface stays uninterrupted",
            "Every strip is independently demountable, which is why the system is specified over plenums full of ducts, valves and sprinklers that will have to be opened again",
            "Runs to 6 000 mm without an intermediate joint, keeping a single line along corridors, platforms and shopfront soffits",
            "Face widths from 50 to 400 mm can be mixed within one run — alternating widths is the standard way to break up a long ceiling or to draw a route across it",
            "Perforated strip plus fleece backing is the acoustic version of the same part; a solid strip is a finish and a reflector, not an absorber",
        ],
        technicalSpecs: [
            { label: "Material", value: "AA1100 / AA1100-H24 and AA3003 where the strip is roll-formed from pre-finished coil; AA6063-T5 where it is an extruded section. Aluminium throughout [industry typical]" },
            { label: "Forming Route", value: "Roll-formed from coil (the common route, cheapest, and genuinely flat on shallow sections) or extruded (crisper arris, stiffer leg, better straightness on wide faces). The two behave differently over a long run, so state which is required" },
            { label: "Face Width", value: "100 / 150 / 200 / 300 mm is what the trade actually stocks; 50 and 400 mm to order. Mixed widths in one ceiling are normal, not an upcharge exception [industry typical]" },
            { label: "Section Height", value: "Two distinct families: a shallow strip about 14–16 mm deep, and a deeper baffle-type strip from 30 to 80 mm. Height is what buys the shadow line and the rigidity — it is the variable that changes the look most [industry typical]" },
            { label: "Sheet / Wall Gauge", value: "0.5–1.2 mm across the trade, with 0.6–1.0 mm the usual specification. Wider faces and longer unsupported spans belong at the thicker end [industry typical]" },
            { label: "Strip Length", value: "Cut to the run; 6 000 mm is the practical maximum before a joint [industry typical]" },
            { label: "Edge & Joint Type", value: "Bevel (chamfered) edge closes up to a near-invisible joint; a square or L-angle edge, or a deliberate gap, makes a shadow line. The trade also distinguishes C-type and G-type strip edges, which differ in how the strip is retained and whether it slides in or hooks up — confirm on the section, because listings apply these labels inconsistently" },
            { label: "Carrier & Suspension", value: "Threaded hanger rod off the slab to a main carrier, a strip carrier clipped or hooked below it, and a perimeter angle at the wall; the assembly is completed with carrier splices, panel/end splices, retaining (fixing) clips and a joint profile at the seam. Wind-resistant carriers and extra clips are used on soffits and exposed elevations. Carrier profile and spacing are published by no supplier and are set per project on span, gauge and wind exposure [industry typical]" },
            { label: "Metal Per Square Metre", value: "≈ (developed width ÷ cover width) × gauge × 2.7. A 100 mm face with 15 mm legs at 0.6 mm lands near 2.1 kg/m² of ceiling — light, but not weightless, and the carrier grid has to carry it [derived]" },
            { label: "Openness & Joint Width", value: "No supplier publishes a standard joint width or openness ratio, because both follow from the section and the carrier chosen. Specify the gap on the drawing; anything quoted back as a catalogue figure is a guess" },
            { label: "Fire Reaction", value: "Bare or anodised aluminium is A1 to EN 13501-1; a coated assembly is graded on that build-up, not on the metal. AS 1530.1 non-combustibility is the test Australian specifications ask for. Third-party certificates are issued per project on request" },
            { label: "Acoustic Behaviour", value: "Perforation with a geotextile or fleece backing is the only route to absorption; a solid strip reflects. Hole diameter, pattern and open area are project choices quoted from the drawing — an NRC or αw figure requires an EN ISO 354 test on that exact assembly, and none is claimed here" },
            { label: "Finish Route", value: "Powder, PE or PVDF coil coating, wood-grain transfer or applied film, anodised, brushed or PVD. Coil-coated stock is finished before forming and leaves bare metal at the cut edge and leg; post-form powder coats the whole section" },
            { label: "Standard / Test Basis", value: "EN 13964 (factory-made suspended ceilings, incl. humidity and corrosion classes) · EN 13501-1 · AS 1530.1 · EN ISO 354 / EN ISO 11654 · ASTM E84 · ASTM E3090/E3090M (suspension load testing)" },
        ],
        surfaceOptions: [
            { name: "Powder Coating (post-form)", description: "The default interior finish and the safest one: the formed strip is coated after bending, so the legs and the return are covered as well as the face. Matte or satin flatters a long run, because gloss turns every strip into a bright line and repeats any deviation.", thickness: "60–80 µm typical", warranty: "Standard offer — confirm at quotation", suitableFor: ["Interior ceilings", "Offices", "Retail", "Corridors"] },
            { name: "Coil / Roller Coating (PE)", description: "Pre-finished aluminium coil, rolled and cut, so colour is perfectly even and the price is the lowest on the page. The catch is real: coating stops where the strip is cut or folded, so the leg and the end are bare metal.", thickness: "18–25 µm polyester", warranty: "Standard offer — confirm at quotation", suitableFor: ["Large interior areas", "Budget schemes", "Concealed-leg details"] },
            { name: "PVDF (Fluorocarbon)", description: "The exterior grade, on coil or post-form. Specify it wherever the ceiling sees sun, rain or salt air — an entrance soffit will fail early on interior polyester.", thickness: "25–35 µm, 70 %+ PVDF resin", warranty: "15 years (standard offer)", suitableFor: ["Entrance soffits", "Canopies", "Coastal sites", "Low facade"] },
            { name: "Wood-Grain Transfer or Film", description: "Timber appearance on aluminium, either sublimation-printed into the coating or bonded as a laminate film. The species names on every supplier's chart — oak, teak, walnut, cedar — are marketing labels, not a botanical or grade specification, so approve a physical sample.", thickness: "Film / transfer system over base coat", warranty: "Standard offer — confirm at quotation", suitableFor: ["Hotels", "Restaurants", "Retail feature", "Lobbies"] },
            { name: "Anodised, Brushed or PVD", description: "Integral oxide, optionally with a brushed grain or a PVD metallic tone. Genuine metal depth, no film to break at the fold, and the only finish that reads correctly under raking light along a long run.", thickness: "10–25 µm oxide layer", warranty: "Standard offer — confirm at quotation", suitableFor: ["Feature ceilings", "Lobbies", "Exhibition", "Boutique retail"] },
        ],
        standardSizes: [
            { label: "Shallow Closed-Joint Strip", value: "100 / 150 / 200 mm face × 14–16 mm height at 0.6–0.8 mm — the near-seamless plane, most specified for offices" },
            { label: "Deep Linear Strip", value: "100 / 150 / 200 / 300 mm face × 30–80 mm height at 0.8–1.2 mm — reads as a baffle line and stays stiff over a long span" },
            { label: "Narrow Feature Widths", value: "50 and 75 mm, used for perimeter bands, cornices and the odd width in a mixed-width layout" },
            { label: "Lengths", value: "Cut to the run, up to 6 000 mm; beyond that the run is jointed deliberately rather than butted and hoped for" },
            { label: "Custom", value: "Perforated with fleece backing, mixed-width setting-out, curved to radius, shadow-line carriers, special RAL colours and wood-grain" },
        ],
        installationSteps: [
            { step: 1, title: "Datum and Run Direction", description: "Mark the finished ceiling level on the wall all round, then fix the run direction from the main sight line — the entry axis or the long dimension of the room. On a linear ceiling the direction decision is far more visible than the level, and it also decides where the joint profiles and cut ends fall." },
            { step: 2, title: "Anchor and Hang the Main Carrier", description: "Fix hanger rods to the slab on expansion or chemical anchors at the spacing the structure allows, and hang the main carrier level. Level it properly before anything else goes near it: strips will not correct a carrier that is out of plane, they will repeat its error along every metre of the run." },
            { step: 3, title: "Set Out the Strip Carriers", description: "Clip or screw the strip carriers below the main carrier at the centres on the setting-out drawing, perpendicular to the run. This is the step where closed-joint and open-joint ceilings part company — the carrier decides the joint — so confirm which one is being built before the first carrier is fixed. There is no default pitch to fall back on." },
            { step: 4, title: "Install the Strips", description: "Slide or hook each strip into the carrier, working from one end of the room to the other. Strips are independent, so a wrong one lifts straight back out; do not drag a strip along the carrier, which marks the finish. Check the joint width with a feeler at intervals rather than by eye." },
            { step: 5, title: "Perimeter, Splices and Movement Joints", description: "Close the perimeter with the angle or shadow-line trim the detail calls for, join carrier and strip runs with the matching splices, and place movement joints where the drawing shows them. On long or externally exposed runs, agree the joint positions with us before manufacture rather than finding them on site." },
            { step: 6, title: "Sight, Level, then Cut in Services", description: "Look along the ceiling from the end of the run and from the entry — that is where a wandering line, an uneven gap or a bowed strip shows; adjust hanger nuts until the face reads straight. Only then cut in luminaires, diffusers and sprinkler collars, and re-seal any cut edge whose coating was broken." },
        ],
        installationTips: [
            "Agree the joint type and the edge profile in writing before manufacture — 'conceal', 'open', 'C-type' and 'G-type' are used inconsistently across the trade, so the section drawing is the only thing both sides are actually building to",
            "On an open-joint ceiling, paint the slab, ducts and cable tray above one dark tone before the strips go up; the gaps are windows and bright services will read as clutter for the life of the building",
            "Wear clean gloves throughout. A strip's turned-down leg is often left exposed at the joint, so a mark is not hidden the way it is behind a board edge",
            "On coil-coated stock the cut end and the folded leg are bare metal — specify post-form coating where the section shows, or plan to touch up every cut",
            "Nothing hangs from the strips: luminaires, signage, projectors and sprinkler backings are independent of the ceiling, and each strip must still lift out for the access the services team will need",
        ],
        applications: [
            { type: "Offices and Open-Plan Ceilings", whyUse: "A closed-joint shallow strip gives the calm, near-seamless plane that open-plan lighting wants, while every strip still lifts for the ductwork and data runs above.", recommendedProducts: ["150 × 15 mm at 0.6–0.7 mm, white or light-grey post-form powder"], keyBenefit: "Seamless look with full plenum access" },
            { type: "Metro, Rail and Airport Concourses", whyUse: "Long unbroken runs across very wide halls, and an open build that does not fight smoke extraction, sprinkler discharge or the services mess of a terminal plenum.", recommendedProducts: ["200 × 40 mm strips, 6 m lengths, dark matte powder above and colour on the face"], keyBenefit: "Joint-free long runs, unobstructed fire and air systems" },
            { type: "Retail Storefront Soffits and Malls", whyUse: "Mixed widths let a soffit read as a designed edge rather than a bulkhead, and wood-grain on a narrow strip gives the warm shopfront look without timber's maintenance.", recommendedProducts: ["Mixed 100 + 150 + 200 mm widths, wood-grain transfer or satin metallic"], keyBenefit: "Design rhythm and wayfinding from one part family" },
            { type: "Swimming Pools, Kitchens and Healthcare", whyUse: "Aluminium does not rot, swell or support mould, and a solid or wiped-clean strip has no ledge to collect dust — but pool air is chemically aggressive, so the coating and the corrosion class are what decide the build-up.", recommendedProducts: ["Post-form powder or anodised, sealed folded edges, EN 13964 humidity and corrosion class stated"], keyBenefit: "Durable and cleanable in continuous humidity" },
            { type: "Entrance Soffits, Canopies and Low Facade", whyUse: "An open-joint strip passes wind instead of loading it like a sealed panel, cannot oil-can, and screens the structure overhead — provided the finish and the carrier are specified for exposure.", recommendedProducts: ["Thicker-gauge extruded strip, PVDF finish, wind-resistant carriers and retaining clips"], keyBenefit: "Weather-tolerant linear soffit with no wind-loaded plane" },
        ],
        certifications: ["ISO 9001", "CE", "ASTM E84 Class A", "EN 13501-1 Class B-s1"],
    },

    // ═══════════════════════════════════════════════════════════
    // 3–8: 其余品类数据结构相同，此处用精简版填充框架
    // ═══════════════════════════════════════════════════════════

    "u-shaped-aluminum-square-tube": {
        categorySlug: "u-shaped-aluminum-square-tube",
        categoryName: "U-Shaped Aluminum Square Tube",
        overview: "U-shaped aluminum square tubes (baffle ceiling) are open-cell linear elements creating bold architectural aesthetics. The open design promotes ventilation and provides visual depth. Widely used in airports, malls, atriums, and contemporary commercial spaces.",
        keyFeatures: ["Open-cell ventilation", "Deep visual depth", "Multiple depths and spacing", "Individual removal", "Integrated LED lighting", "Wood grain option", "Spans up to 2400mm"],
        technicalSpecs: [
            { label: "Material", value: "AA3003 / AA6063 Aluminum" },
            { label: "Wall Thickness", value: "0.6 / 0.8 / 1.0 / 1.2mm" },
            { label: "Width (Face)", value: "30 / 40 / 50 / 60 / 80 / 100mm" },
            { label: "Depth", value: "50 / 80 / 100 / 120 / 150 / 200mm" },
            { label: "Length", value: "Up to 6000mm" },
            { label: "Spacing", value: "50–300mm center-to-center, set by the design intent" },
            { label: "Fire Rating", value: "Non-combustible aluminium substrate; classification of the finished board is tested per build-up" },
            { label: "Acoustic NRC", value: "Open baffles absorb little on their own; any NRC figure belongs to a tested assembly" },
        ],
        surfaceOptions: [
            { name: "Powder Coating", description: "Uniform matte/gloss across all surfaces.", thickness: "60–80 μm", warranty: "Standard offer per quotation", suitableFor: ["Lobbies", "Malls", "Exhibition halls"] },
            { name: "Wood Grain Transfer", description: "Timber appearance, zero maintenance.", thickness: "Film layer", warranty: "Standard offer per quotation", suitableFor: ["Hotels", "Restaurants", "Cultural venues"] },
            { name: "PVDF", description: "For semi-exposed soffit applications.", thickness: "25–40 μm", warranty: "15-year standard offer", suitableFor: ["Exterior soffits", "Canopies", "Stadiums"] },
        ],
        standardSizes: [
            { label: "30×50mm (Slim)", value: "0.6mm wall, lightweight baffles" },
            { label: "50×100mm (Standard)", value: "0.8mm wall, most common" },
            { label: "50×150mm (Deep)", value: "1.0mm wall, dramatic depth" },
            { label: "80×200mm (Extra Deep)", value: "1.2mm wall, large spans" },
        ],
        installationSteps: [
            { step: 1, title: "Carrier Installation", description: "Install main carriers perpendicular to baffle direction, 1200–1800mm spacing." },
            { step: 2, title: "Level Carriers", description: "Laser-level, tolerance ±2mm over 10m." },
            { step: 3, title: "Clip Baffles", description: "Push into carrier slots until spring clip clicks." },
            { step: 4, title: "Splice Long Runs", description: "Use internal splice connectors at carrier locations." },
        ],
        installationTips: ["Tighter spacing = more visual density + better acoustics", "Align with primary viewing direction", "Coordinate LED slots before carrier install", "Variable depths create wave effects"],
        applications: [
            { type: "Airport Terminals", whyUse: "Open-cell allows HVAC air return.", recommendedProducts: ["50×150mm metallic silver"], keyBenefit: "HVAC integration, fire-rated" },
            { type: "Shopping Malls", whyUse: "Variable depths create dynamic effects.", recommendedProducts: ["Mixed depths, alternating colors"], keyBenefit: "Design flexibility" },
            { type: "Exhibition Halls", whyUse: "Deep baffles conceal overhead services.", recommendedProducts: ["80×200mm matte black"], keyBenefit: "Service concealment" },
        ],
        certifications: ["ISO 9001", "CE", "ASTM E84 Class A"],
    },

    "aluminum-honeycomb-core-panel": {
        categorySlug: "aluminum-honeycomb-core-panel",
        categoryName: "Aluminum Honeycomb Core Panel",
        overview: "Ultra-lightweight, high-rigidity composite panels with two aluminum face sheets bonded to hexagonal honeycomb core. Originally aerospace technology, now used for large-format facades, interior partitions, and applications requiring maximum flatness over large spans.",
        keyFeatures: ["Stiffness of a deep section at the mass of a thin sheet", "Flat over large spans — the reason it is specified where solid sheet would oil-can", "Formats cut to the project drawing", "All-aluminium build-up keeps the fire question on the adhesive line, not the metal", "A sealed sandwich is a sound barrier, not an absorber", "Thermal break across the thickness", "100% recyclable"],
        technicalSpecs: [
            { label: "Face Sheet", value: "AA3003 / 5005; the market quotes 0.5–1.5 mm skins [vendor-typical], our standard sheet range is 0.8–1.5 mm" },
            { label: "Core", value: "AA3003 hexagonal honeycomb" },
            { label: "Cell Size", value: "6 / 10 / 15 / 20mm [vendor-typical]" },
            { label: "Total Thickness", value: "10 / 15 / 20 / 25 / 50mm [vendor-typical]" },
            { label: "Max Panel", value: "Cut to the job — suppliers quote up to 2000 × 6000 mm [vendor-typical, unverified]" },
            { label: "Weight", value: "Roughly 7 kg/m² for a 20 mm facade panel against about 8 kg/m² for a 3 mm solid sheet [vendor-typical]" },
            { label: "Fire Rating", value: "All-aluminium cores argue for the top classes, but an A2 declaration needs a test report for the exact build-up; our own declarations are ASTM E84 Class A and EN 13501-1 Class B-s1 for the coated product" },
            { label: "Acoustic STC", value: "A property of the assembled wall; single-number claims without a test standard are not comparable" },
        ],
        surfaceOptions: [
            { name: "PVDF (on face)", description: "Premium fluorocarbon for exterior.", thickness: "25–40 μm", warranty: "15-year standard offer", suitableFor: ["Exterior facades", "Curtain wall infill"] },
            { name: "Powder Coating", description: "For interior applications.", thickness: "60–80 μm", warranty: "Standard offer per quotation", suitableFor: ["Wall panels", "Elevator lobbies", "Partitions"] },
            { name: "Stone Veneer Composite", description: "Thin stone bonded to honeycomb.", thickness: "5–8mm stone + honeycomb", warranty: "Project-specific", suitableFor: ["Luxury interiors", "Elevator cabs"] },
        ],
        standardSizes: [
            { label: "Typical Build-Up", value: "Face + core + rear skin, e.g. 1.0 + 18 + 1.0 mm for a 20 mm panel [vendor-typical]" },
            { label: "Formats", value: "Cut to project drawing — 1250 × 2500 mm and larger are quoted by suppliers [vendor-typical, unverified]" },
            { label: "Interior Lining", value: "Thinner skins with 6–25 mm totals are the market steps for walls, doors and furniture [vendor-typical]" },
        ],
        installationSteps: [
            { step: 1, title: "Subframe", description: "Install aluminum subframe, 1200–1500mm spacing." },
            { step: 2, title: "Bracket Fixing", description: "Attach concealed brackets using structural adhesive + mechanical fasteners." },
            { step: 3, title: "Panel Hanging", description: "Hang on Z-clip system — no visible fixings." },
            { step: 4, title: "Joint Treatment", description: "Open or sealed joints per design." },
        ],
        installationTips: ["Never drill through entire panel", "Use adhesive + mechanical fixings for brackets", "Edge sealing critical for exterior", "Handle edges carefully"],
        applications: [
            { type: "High-Rise Curtain Wall", whyUse: "Ultra-light reduces dead load on mullions.", recommendedProducts: ["20mm PVDF face"], keyBenefit: "Deep-section stiffness at thin-sheet mass" },
            { type: "Interior Feature Walls", whyUse: "Maximum flatness for premium finishes.", recommendedProducts: ["10mm powder coated or stone veneer"], keyBenefit: "Ultra-flat, luxury materials" },
        ],
        certifications: ["ISO 9001", "CE", "ASTM E84 Class A", "EN 13501-1 Class B-s1"],
    },

    "aluminum-ceiling-tile": {
        categorySlug: "aluminum-ceiling-tile",
        categoryName: "Aluminum Ceiling Tile",
        overview: "Modular aluminum ceiling panels in standard grid sizes (600×600, 300×600mm) for lay-in or clip-in suspended ceiling systems. Combines aluminum durability with modular grid practicality — the standard for commercial offices, hospitals, and clean environments.",
        keyFeatures: ["Standard modular sizes", "Lay-in or clip-in options", "Perforated acoustic options", "100% moisture-proof", "Adds to room brightness — the gain depends on gloss and colour, not on the metal alone", "Individual tile removable", "Recyclable"],
        technicalSpecs: [
            { label: "Material", value: "AA3003 / AA5005" },
            { label: "Thickness", value: "Our standard range 0.8–1.5 mm; the market also quotes 0.5–0.7 mm tiles [vendor-typical]" },
            { label: "Sizes", value: "300×300 / 300×600 / 600×600 / 600×1200mm" },
            { label: "Edge Profile", value: "Lay-in / Tegular / Clip-in" },
            { label: "Weight", value: "≈ 2.2 kg/m² at 0.8 mm and 3.2 kg/m² at 1.2 mm (calculated at 2 700 kg/m³)" },
            { label: "Fire Rating", value: "Bare aluminium is non-combustible; our coated product is declared ASTM E84 Class A and EN 13501-1 Class B-s1" },
            { label: "NRC", value: "Perforated + fleece tiles are quoted in the 0.5–0.75 region by suppliers [vendor-typical]; the rating belongs to the tested assembly, cavity included" },
            { label: "Humidity", value: "Up to 100% RH" },
        ],
        surfaceOptions: [
            { name: "Powder Coating", description: "Standard RAL colors.", thickness: "60–80 μm", warranty: "Standard offer per quotation", suitableFor: ["Offices", "Schools", "Hospitals"] },
            { name: "Roller Coating (PE)", description: "Cost-effective for large projects.", thickness: "18–25 μm", warranty: "10-year standard offer (PE)", suitableFor: ["Large-area ceilings", "Budget projects"] },
            { name: "Perforated + Fleece", description: "Factory perforated with acoustic backing.", thickness: "Ø1.5–6mm, 10–30% open area (our range)", warranty: "Same as base coat", suitableFor: ["Open-plan offices", "Classrooms"] },
        ],
        standardSizes: [
            { label: "300×300mm", value: "0.8–1.0mm, lay-in or clip-in" },
            { label: "600×600mm", value: "0.8–1.2mm, most common" },
            { label: "600×1200mm", value: "1.0–1.2mm, lay-in or tegular" },
        ],
        installationSteps: [
            { step: 1, title: "Grid Installation", description: "Install T-bar grid system, main runners at 1200mm centers." },
            { step: 2, title: "Level Grid", description: "Laser-level, tolerance ±1mm." },
            { step: 3, title: "Drop In Tiles", description: "Simply drop tiles into grid openings — no tools needed." },
            { step: 4, title: "Cut-Outs", description: "Cut for fixtures with fine jigsaw blade." },
        ],
        installationTips: ["Handle with clean hands", "Use suction puller for clip-in removal", "Perforated: fleece faces up", "Start layout from room center"],
        applications: [
            { type: "Corporate Offices", whyUse: "Standard grid compatibility with lighting and HVAC.", recommendedProducts: ["600×600 white lay-in"], keyBenefit: "Easy maintenance, acoustic control" },
            { type: "Hospitals", whyUse: "Non-porous, resists bacteria and mold.", recommendedProducts: ["600×600 clip-in, solid"], keyBenefit: "Hygienic, cleanable" },
            { type: "Swimming Pools", whyUse: "100% moisture-proof.", recommendedProducts: ["600×600 powder coated"], keyBenefit: "Zero moisture damage" },
        ],
        certifications: ["ISO 9001", "CE", "ASTM E84 Class A", "EN 13501-1 Class B-s1"],
    },

    "aluminum-square-tube": {
        categorySlug: "aluminum-square-tube",
        categoryName: "Aluminum Square Tube",
        overview: "Closed rectangular/box section profiles for structural and decorative use. Used as ceiling baffles, facade fins, sun louvers, screens, and structural framing. Unlike open U-channels, square tubes look clean from all angles.",
        keyFeatures: ["Closed box section", "20×20mm to 100×200mm", "Structural + decorative", "Sun louvers & fins", "AA6063-T5 extruded", "Full coating all sides", "Bolt or bracket connections"],
        technicalSpecs: [
            { label: "Material", value: "AA6063-T5 / AA6061-T6" },
            { label: "Sizes", value: "20×20 to 100×100mm" },
            { label: "Wall Thickness", value: "1.0 / 1.2 / 1.5 / 2.0 / 2.5 / 3.0mm" },
            { label: "Length", value: "3000 / 4000 / 6000mm" },
            { label: "Fire Rating", value: "A1 (non-combustible)" },
        ],
        surfaceOptions: [
            { name: "Anodized", description: "Metallic finish, durable.", thickness: "10–25 μm", warranty: "Outside the coating warranty schedule; the oxide is UV-stable", suitableFor: ["Facade fins", "Screens", "Structural framing"] },
            { name: "Powder Coating", description: "Full RAL range.", thickness: "60–100 μm", warranty: "Standard offer per quotation", suitableFor: ["Color-matched facades", "Interior features"] },
            { name: "PVDF", description: "Premium exterior.", thickness: "25–40 μm", warranty: "15-year standard offer", suitableFor: ["Sun louvers", "Coastal environments"] },
        ],
        standardSizes: [
            { label: "25×25×1.5mm", value: "Lightweight decorative elements" },
            { label: "50×50×2.0mm", value: "Standard baffles and fins" },
            { label: "50×100×2.0mm", value: "Deep facade fins, louvers" },
            { label: "100×100×3.0mm", value: "Large fins, column covers" },
        ],
        installationSteps: [
            { step: 1, title: "Bracket Installation", description: "Fix mounting brackets at 600–1200mm spacing." },
            { step: 2, title: "Position Tubes", description: "Place tubes on brackets, align carefully." },
            { step: 3, title: "Bolt Fixing", description: "Secure with stainless steel bolts through pre-drilled holes." },
            { step: 4, title: "End Caps", description: "Install caps on exposed ends for finished look." },
        ],
        installationTips: ["Pre-drill all holes", "Use EPDM washers between dissimilar metals", "Allow 3mm expansion per meter", "Store horizontally on bearers"],
        applications: [
            { type: "Sun Louvers", whyUse: "Solar shading while maintaining views.", recommendedProducts: ["50×100 PVDF"], keyBenefit: "Shading gain depends on depth, pitch and orientation — model it per project" },
            { type: "Decorative Screens", whyUse: "Semi-transparent privacy.", recommendedProducts: ["25×25 anodized"], keyBenefit: "Privacy + ventilation" },
        ],
        certifications: ["ISO 9001", "CE"],
    },

    "fluted-aluminum-panel": {
        categorySlug: "fluted-aluminum-panel",
        categoryName: "Fluted Aluminum Panel",
        overview: "Corrugated or ribbed surface panels adding visual texture, depth, and rigidity. Available in sinusoidal wave, trapezoidal rib, and micro-flute profiles. Creates distinctive facades with dynamic light-and-shadow effects.",
        keyFeatures: ["Wave, trapezoidal, micro-flute profiles", "Increased rigidity from corrugation", "Dynamic light-and-shadow effect", "Horizontal or vertical install", "Full RAL + metallic colors", "Exterior and interior use", "Standard subframe compatible"],
        technicalSpecs: [
            { label: "Material", value: "AA3003 / AA5005" },
            { label: "Thickness", value: "0.7 / 0.8 / 1.0 / 1.2mm" },
            { label: "Flute Pitch", value: "18 / 25 / 30 / 50 / 76mm" },
            { label: "Flute Depth", value: "5 / 10 / 15 / 20 / 25mm" },
            { label: "Width", value: "1000 / 1200mm" },
            { label: "Length", value: "Up to 6000mm" },
            { label: "Fire Rating", value: "Non-combustible aluminium substrate; the finished board is classified on a test of that build-up — our declarations are ASTM E84 Class A and EN 13501-1 Class B-s1" },
        ],
        surfaceOptions: [
            { name: "PVDF", description: "Premium exterior, metallic/pearlescent.", thickness: "25–40 μm", warranty: "15-year standard offer", suitableFor: ["Exterior facades", "Coastal areas"] },
            { name: "Powder Coating", description: "Standard interior.", thickness: "60–80 μm", warranty: "Standard offer per quotation", suitableFor: ["Feature walls", "Retail", "Hospitality"] },
            { name: "Anodized", description: "Natural metallic enhancing light play.", thickness: "15–25 μm", warranty: "Outside the coating warranty schedule", suitableFor: ["Minimalist facades", "Interior accents"] },
        ],
        standardSizes: [
            { label: "Micro-Flute 18/5", value: "0.7mm, interior walls" },
            { label: "Sinusoidal 25/10", value: "0.8mm, feature walls" },
            { label: "Trapezoidal 50/15", value: "1.0mm, facades" },
            { label: "Box Rib 76/25", value: "1.2mm, exterior cladding" },
        ],
        installationSteps: [
            { step: 1, title: "Subframe", description: "Install subframe at 400–600mm spacing." },
            { step: 2, title: "Flashing", description: "Install base flashing and corner trims first." },
            { step: 3, title: "Panel Fixing", description: "Fix through flute valleys with self-drill screws." },
            { step: 4, title: "Side Laps", description: "Overlap one full pitch, seal with butyl tape." },
        ],
        installationTips: ["Same flute direction throughout", "Bottom-to-top for vertical install", "Use nibblers, not shears", "Plan penetrations at flute valleys"],
        applications: [
            { type: "Commercial Facades", whyUse: "Dynamic light-play changes all day.", recommendedProducts: ["Trapezoidal 50/15 PVDF metallic"], keyBenefit: "Distinctive identity" },
            { type: "Interior Feature Walls", whyUse: "Subtle texture without overwhelming.", recommendedProducts: ["Micro-flute 18/5 matte white"], keyBenefit: "Premium feel" },
        ],
        certifications: ["ISO 9001", "CE", "ASTM E84 Class A"],
    },

    "aluminum-skirting-board": {
        categorySlug: "aluminum-skirting-board",
        categoryName: "Aluminum Skirting Board",
        overview: "Extruded aluminum baseboard profiles — durable, modern alternative to MDF/PVC/timber skirting. Protects wall bases from impact and moisture with clean minimalist aesthetics. Available in flat, recessed (shadow-gap), and curved profiles.",
        keyFeatures: ["Impact resistant — won't chip or dent", "100% moisture-proof", "Shadow-gap floating wall effect", "Cable management channels", "Pre-finished, zero maintenance", "Curved options available", "100% recyclable, zero VOC"],
        technicalSpecs: [
            { label: "Material", value: "AA6063-T5 Extruded Aluminum" },
            { label: "Height", value: "40 / 50 / 60 / 70 / 80 / 100mm" },
            { label: "Depth", value: "8 / 10 / 12 / 15mm" },
            { label: "Wall Thickness", value: "1.0 / 1.2 / 1.5mm" },
            { label: "Length", value: "2500 / 3000 / 5800mm" },
            { label: "Profile Types", value: "Flat / Recessed / Curved / Clip-On" },
            { label: "Fire Rating", value: "A1 (non-combustible)" },
            { label: "Moisture", value: "100% waterproof" },
        ],
        surfaceOptions: [
            { name: "Anodized", description: "Hard anodized for max abrasion resistance.", thickness: "10–20 μm", warranty: "Outside the coating warranty schedule", suitableFor: ["Commercial offices", "Hotels", "High-traffic areas"] },
            { name: "Powder Coating", description: "Color-matched to wall/floor.", thickness: "60–80 μm", warranty: "Standard offer per quotation", suitableFor: ["Color-coordinated interiors", "Healthcare"] },
            { name: "Wood Grain Transfer", description: "Timber appearance.", thickness: "Film layer", warranty: "Standard offer per quotation", suitableFor: ["Residential", "Hospitality"] },
        ],
        standardSizes: [
            { label: "Flat 50×10mm", value: "Standard, screw or adhesive fix" },
            { label: "Recessed 60×15mm", value: "Shadow-gap, 10mm recess" },
            { label: "Recessed 80×15mm", value: "With LED strip channel" },
            { label: "Clip-On 50×12mm", value: "Snap-on, zero visible fixings" },
            { label: "Curved (R200+)", value: "Factory curved to radius" },
        ],
        installationSteps: [
            { step: 1, title: "Wall Preparation", description: "Ensure flat, clean wall base. Create rebate for recessed profiles." },
            { step: 2, title: "Mounting Rail (Clip-On)", description: "Screw the rail to the wall at the centres set by the setting-out drawing." },
            { step: 3, title: "Fix Skirting", description: "Adhesive or mechanical fix. Press firmly." },
            { step: 4, title: "Corner Joints", description: "Use pre-formed 90° and 135° corner pieces." },
        ],
        installationTips: ["Ensure floor is level before starting", "Seal joints in wet areas", "Use pre-formed corners for clean joints", "Cut with fine-tooth blade"],
        applications: [
            { type: "Commercial Offices", whyUse: "Durable, clean lines, cable management.", recommendedProducts: ["Recessed 60mm anodized silver"], keyBenefit: "Professional finish, cable routing" },
            { type: "Hospitals", whyUse: "Hygienic, cleanable, impact resistant.", recommendedProducts: ["Flat 70mm powder coated"], keyBenefit: "Infection control, durability" },
        ],
        certifications: ["ISO 9001", "CE"],
    },

    // ═══════════════════════════════════════════════════════
    // 10. OPEN CELL CEILING（开放 cell 网格吊顶）
    //     数值来源标注：[标准] = 条文要求；[行业典型] = 多家制造商公开资料交叉印证的范围，
    //     不是本公司实测数据；[推算] = 由几何尺寸算出的示例值。
    //     不写任何未经 EN ISO 354 实测的吸声系数。
    // ═══════════════════════════════════════════════════════
    "open-cell-ceiling": {
        categorySlug: "open-cell-ceiling",
        categoryName: "Open Cell Ceiling",
        overview: "Open cell ceilings are an exposed grid of intersecting aluminium channels that forms square or rectangular cells, with the plenum left open to view. The grid is the finish: there is no tile or panel closing the plane, so air, light and sprinkler discharge pass through and every service above stays accessible. Cell size, web width and section depth set both the look and the stiffness, and acoustic absorption has to be designed in above the grid rather than expected from the grid itself.",
        keyFeatures: [
            "Open square grid — plenum, services and structure stay visible and reachable",
            "No tiles to lift: the whole ceiling area acts as access",
            "Air, sprinkler water and smoke pass through instead of being trapped above",
            "High rigidity for its weight — the two-way grid works as a structural lattice",
            "Demountable and reusable; sections are cut to length and replaced individually",
            "Cell size, web width and depth are modular — mix them to change scale and openness",
        ],
        technicalSpecs: [
            { label: "Material", value: "AA3003-H24 / AA5005-H24 aluminium strip; AA5052 where a harder web is specified" },
            { label: "Cell Sizes (clear opening)", value: "50×50 / 75×75 / 100×100 / 150×150 / 200×200 mm; other pitches to shop drawing [industry typical]" },
            { label: "Web Width (W)", value: "10 mm or 15 mm standard; 20 mm+ on request [industry typical]" },
            { label: "Section Depth (H)", value: "35 / 40 / 45 / 50 / 60 / 80 mm — depth governs stiffness and shadow line [industry typical]" },
            { label: "Sheet Thickness", value: "0.4–0.6 mm for standard grids; 0.35–0.8 mm available [industry typical]" },
            { label: "Section Length", value: "Grid members cut to module multiples, typically up to 2 000 mm per piece [industry typical]" },
            { label: "Free (Open) Area", value: "Calculated from geometry — e.g. a 100 mm cell with 15 mm webs leaves ≈72 % open; a 50 mm cell with 10 mm webs ≈64 % [derived]" },
            { label: "Suspension", value: "Adjustable hangers to the structure; perimeter angle at the finished level; hanger spacing set by the span and any imposed load" },
            { label: "Deflection Limit", value: "EN 13964 requires the ceiling to be declared for load class and tested; project specifications commonly cap deflection between two hangers at L/200 to L/500 [standard]" },
            { label: "Acoustic Performance", value: "An open grid is not an absorber by itself — sound passes through it. Absorption comes from acoustic mesh, fabric-wrapped infill or treated plenum above, and must be tested to EN ISO 354 for the exact build-up before any NRC or αw figure is quoted" },
            { label: "Fire Reaction", value: "Bare aluminium A1 (EN 13501-1). Where acoustic fleece or mesh is added, that material's class governs the assembly claim [standard]" },
            { label: "Corrosion Resistance", value: "Declared by class to EN 13964 (Tables 8–9); specify the class for the service environment [standard]" },
            { label: "Standard / Test Basis", value: "EN 13964 (suspended ceilings); ASTM E84 for North American flame-spread classification; ASTM C635 / E3090 for suspension-system load testing" },
        ],
        surfaceOptions: [
            { name: "Powder Coating", description: "Even matte or satin film on all four web faces; the workhorse finish for interiors.", thickness: "60–80 µm typical", warranty: "Standard offer — confirm at quotation", suitableFor: ["Offices", "Retail", "Airports", "Underground stations"] },
            { name: "PE Coil Coating", description: "Factory-applied on the strip before forming, so the coating is uniform on every cut edge.", thickness: "18–25 µm", warranty: "10 years (standard offer)", suitableFor: ["Large uniform areas", "Repeat module grids"] },
            { name: "PVDF (Fluorocarbon)", description: "Higher resistance to UV, pollution and colour fade where the ceiling sees daylight or harsh air.", thickness: "25–35 µm, 70 %+ PVDF resin", warranty: "15 years (standard offer)", suitableFor: ["Atriums with daylight", "Coastal and high-pollution sites", "Semi-external canopies"] },
            { name: "Wood-Grain Sublimation", description: "Timber effect transferred onto the webs; reads as a slatted timber grid from below.", thickness: "Coated film system", warranty: "Standard offer — confirm at quotation", suitableFor: ["Hotels", "Restaurant rows", "Lobby features"] },
        ],
        standardSizes: [
            { label: "Small Cell", value: "50×50 mm, W10, H35–50 mm — dense, high openness count" },
            { label: "Medium Cell", value: "100×100 mm, W10–15, H40–60 mm — the most specified size" },
            { label: "Large Cell", value: "150×150 / 200×200 mm, W15, H50–80 mm — bold, lightweight look" },
            { label: "Rectangular", value: "75×150 / 100×200 mm — directional grid, laid to the room axis" },
            { label: "Custom", value: "Any cell on shop drawing; deeper sections and heavier webs for long unbroken spans" },
        ],
        installationSteps: [
            { step: 1, title: "Set the Datum", description: "Mark the finished ceiling level on the perimeter with a laser or water line and fix the perimeter angle. The datum controls everything — an open grid shows every deviation." },
            { step: 2, title: "Fix the Hangers", description: "Anchor adjustable hangers to the slab or structure at the designed spacing, keeping them clear of services. Each hanger must land where the grid can carry it." },
            { step: 3, title: "Install the Main Carriers", description: "Hang and level the first layer of channels, squaring the first line to the main sight axis of the room. Check level along the full run, not just at the hanger." },
            { step: 4, title: "Slot the Cross Members", description: "Interlock the second layer into the main carriers at the cell pitch. The two layers lock at the same depth so the webs meet flush." },
            { step: 5, title: "Cut In at Perimeters", description: "Cut edge cells to the line and support the cut ends. Keep the cut edge coated — bare cut faces are the first place a ceiling looks cheap." },
            { step: 6, title: "Align and Commission", description: "Sight the grid from the entry point, adjust hanger nuts until the lines run true, then confirm that sections lift out cleanly for service access." },
        ],
        installationTips: [
            "Set out from the room's main sight line, not from the wall — walls are rarely square to the grid",
            "Keep the plenum above an open grid clean and painted: it is permanently visible, so ductwork, cable trays and slab finish all become part of the design",
            "Specify hanger spacing and section depth together for long spans; deflection shows visually on a grid before it fails anything",
            "Confirm sprinkler, detector and luminaire positions with the fire engineer — an open ceiling changes how those devices are located and accepted",
            "Any acoustic figure must come from a test of the actual build-up (grid plus infill plus plenum), not from the grid alone",
        ],
        applications: [
            { type: "Transit Concourses and Stations", whyUse: "High ceilings full of services; the grid hides nothing but organises it, and air, water and smoke move through rather than accumulate above.", recommendedProducts: ["100×100 mm, W15, H50 mm, powder coated"], keyBenefit: "Service access plus sprinkler and smoke compatibility" },
            { type: "Shopping Malls and Food Courts", whyUse: "Open plane absorbs the visual mess above while reading as a strong geometric ceiling; extraction and make-up air pass through.", recommendedProducts: ["150×150 mm, W15, H60 mm"], keyBenefit: "Design impact with real ventilation behaviour" },
            { type: "Office Lobbies and Corridors", whyUse: "Conceals the slab while keeping luminaires and diffusers in the sight line; integrates with linear lighting.", recommendedProducts: ["75×75 mm, W10, H40 mm, white"], keyBenefit: "Clean lines, easy reconfiguration" },
            { type: "Gyms and Leisure Halls", whyUse: "High air movement and impact resistance; nothing to trap humidity above the ceiling.", recommendedProducts: ["100×100 mm, W15, H50 mm, PVDF"], keyBenefit: "Airflow and durability in humid halls" },
            { type: "Exhibition Halls and Airports", whyUse: "Long unbroken areas where rigging points and re-routing happen every season.", recommendedProducts: ["200×200 mm, W15, H80 mm, deeper section"], keyBenefit: "Full demountable access to the plenum" },
        ],
        certifications: ["ISO 9001", "CE", "ASTM E84 Class A", "EN 13501-1 A1 (bare metal)"],
    },

    // ═══════════════════════════════════════════════════════
    // 11. ALUMINUM MESH CEILING（金属网吊顶：拉伸网 / 编织网）
    //     数值来源标注同 open-cell-ceiling：[标准] / [industry typical] / [derived]。
    //     不写未经 EN ISO 354 实测的吸声系数。
    // ═══════════════════════════════════════════════════════
    "aluminum-mesh-ceiling": {
        categorySlug: "aluminum-mesh-ceiling",
        categoryName: "Aluminum Mesh Ceiling",
        overview: "Aluminium mesh ceilings are suspended panels or rolls of open metal fabric — either expanded metal, cut and stretched from a single sheet so the diamond openings have no welds or joints, or woven and crimped wire mesh. The result is a ceiling that filters the plenum instead of hiding it: light, air and sprinkler discharge pass through, services above stay partly visible, and the surface reads as a soft metallic texture rather than a hard plane. Panel size, aperture, strand or wire diameter and the supporting edge detail are what control both the look and how flat it hangs.",
        keyFeatures: [
            "Expanded mesh is cut and stretched from one sheet — no joints, nothing can unravel",
            "High open area: light, air and sprinkler water pass straight through",
            "Softens and partially screens the services above without fully concealing them",
            "Very light for its coverage — mesh is one of the lowest kg/m² ceiling options [industry typical]",
            "Supplied as fixed or demountable panels, or as continuous rolls in a perimeter profile",
            "Non-combustible base metal; anodised and PVDF options for humid and coastal air",
        ],
        technicalSpecs: [
            { label: "Material", value: "All-aluminium construction: AA1100 / AA3003 for expanded and woven mesh, AA5052 where a harder strand or more spring-back is needed. No steel or stainless mesh is supplied — where a brighter or harder-looking mesh is specified, the answer is a brighter anodised finish on aluminium, not a different metal" },
            { label: "Mesh Type", value: "Expanded metal (slit and stretched, diamond or rectangular openings) or woven / crimped wire mesh — the two behave differently and are quoted separately" },
            { label: "Base Sheet Thickness (expanded)", value: "1.5–3.0 mm for architectural ceiling mesh; 0.3–1.0 mm foil mesh for feature and stretch applications [industry typical]" },
            { label: "Strand Width SW (expanded)", value: "10–30 mm commonly; the strand is the load-bearing rib of the mesh [industry typical]" },
            { label: "Aperture SWD × LWD (expanded)", value: "short way 25–100 mm × long way 60–200 mm — aperture sets openness and how much of the plenum reads through [industry typical]" },
            { label: "Wire Ø × Aperture (woven)", value: "wire 1.0–3.0 mm with apertures from about 10 mm upward; specified as mesh count, wire diameter and opening size [industry typical]" },
            { label: "Open Area", value: "Roughly 30–70 % for typical ceiling meshes — a geometric consequence of aperture and strand, not a measured performance figure [derived]" },
            { label: "Panel Sizes", value: "600×600 / 600×1200 / 1200×1200 mm into a carrier grid, or cut to size from sheet formats up to 1220×2440 mm and larger; width up to 3 m [industry typical]" },
            { label: "Support System", value: "Lay-in or clip-in on a carrier grid, bolted rigid frames for long spans, or a perimeter tension profile for continuous roll mesh" },
            { label: "Edge Detail", value: "Folded and stiffened frame edge on panel mesh; hemmed or clamped edge on roll mesh — the edge decides whether the sheet hangs flat" },
            { label: "Fire Reaction", value: "Bare aluminium classifies A1 to EN 13501-1; coated mesh is normally declared EN 13501-1 B-s1,d0, with ASTM E84 Class A for North American projects [standard]" },
            { label: "Acoustic Performance", value: "Mesh is acoustically transparent — it absorbs almost nothing on its own. Perforated mesh backed with acoustic tissue (commonly around 0.2 mm glass-fibre non-woven) or an absorber laid above is what produces a result; any NRC or αw must be tested to EN ISO 354 for that build-up" },
            { label: "Corrosion & Contact", value: "Aluminium does not rust, but where it contacts carbon steel in damp air, specify isolation — galvanic couples are a real failure mode in humid spaces [standard practice]" },
            { label: "Standard / Test Basis", value: "EN 13964 (suspended ceilings: dimensions, tolerances, declared load classes); EN 13501-1 (reaction to fire); EN ISO 354 / 11654 (sound absorption); ASTM E84" },
        ],
        surfaceOptions: [
            { name: "Powder Coating", description: "Colour on the mesh strands; most often white, grey or black to control how visible the plenum is.", thickness: "60–80 µm typical", warranty: "Standard offer — confirm at quotation", suitableFor: ["Retail", "Offices", "Lobbies"] },
            { name: "PVDF (Fluorocarbon)", description: "For daylight, coastal or polluted air, indoors or under canopies.", thickness: "25–35 µm, 70 %+ PVDF resin", warranty: "15 years (standard offer)", suitableFor: ["Semi-external canopies", "Coastal sites", "Atria with daylight"] },
            { name: "Anodised", description: "Integral oxide, metallic look, no film to chip; the natural choice for bare-mesh aesthetics.", thickness: "10–25 µm coating layer", warranty: "Standard offer — confirm at quotation", suitableFor: ["Feature ceilings", "Exhibition and retail"] },
            { name: "Bare / Mill Finish", description: "Uncoated aluminium, often under a clear protective film; used where the mesh is meant to read as metal.", thickness: "—", warranty: "Not a warranty system — handle to avoid marking", suitableFor: ["Industrial look", "Backlit features"] },
        ],
        standardSizes: [
            { label: "Carrier Grid Panels", value: "600×600 / 600×1200 / 1200×1200 mm, demountable" },
            { label: "Cut From Sheet", value: "Sheet formats up to 1220×2440 mm and larger; width up to 3 m" },
            { label: "Continuous Roll", value: "Roll mesh cut to length in a perimeter tension profile for unbroken runs" },
            { label: "Common Apertures", value: "SWD 55 / 70 mm with SW 15–22 mm for a readable diamond; finer mesh for a softer texture" },
            { label: "Custom", value: "Aperture, strand, panel geometry, edge and finish to shop drawing" },
        ],
        installationSteps: [
            { step: 1, title: "Set Level and Perimeter", description: "Mark the finished level and fix the perimeter profile or angle. Mesh shows sag more honestly than any other ceiling, so the datum has to be right." },
            { step: 2, title: "Hang the Support Grid", description: "Install carriers or suspension wires at the spacing the panel size demands, and check the grid is square to the room axis, not to the wall." },
            { step: 3, title: "Stiffen the Panels", description: "Fit folded or clamped edge frames to each panel before it goes up. An unframed mesh sheet will take the shape of whatever touched it." },
            { step: 4, title: "Place the Mesh", description: "Lay or clip panels into the grid working from the centre out, or feed roll mesh into the tension profile and clamp it under even load." },
            { step: 5, title: "Tension and True", description: "On roll mesh, tension evenly along the long edge and release any diagonal pull before the clamps close — residual tension is what causes visible oil-canning." },
            { step: 6, title: "Reveal and Inspect", description: "Step back to the main sight line and check the pattern reads continuously across joints; confirm panels lift cleanly for service access." },
        ],
        installationTips: [
            "Do not layer mesh directly over a regular grid of similar pitch — the two patterns beat against each other and produce visible moiré",
            "Specify strand direction: expanded mesh is stiffer along the long way of the opening, so rotate panels deliberately and consistently",
            "Keep a light gap above the mesh: backlit installations only work if the plenum finish and cable management are tidy enough to be seen",
            "Isolate aluminium mesh from carbon steel channels and clips in humid or coastal spaces to avoid galvanic attack",
            "In kitchens and food areas, plan a degreasing cycle — mesh strands collect grease and dust far faster than a closed panel does",
        ],
        applications: [
            { type: "Retail and Showrooms", whyUse: "Mesh filters the services and track lighting above without sealing them off, and it reads as texture rather than a hard ceiling.", recommendedProducts: ["Fine woven mesh, anodised, in 1200×1200 demountable panels"], keyBenefit: "Open look with full access to lighting changes" },
            { type: "Station Concourses and Airports", whyUse: "High ceilings with heavy services; the open area lets sprinkler water and smoke pass and keeps everything above reachable.", recommendedProducts: ["Expanded mesh SWD 55 mm, powder coated dark grey"], keyBenefit: "Fire-engineer-friendly openness with service access" },
            { type: "Office Lobbies and Cafeterias", whyUse: "Softens the acoustic glare of a hard, open lobby while keeping the volume reading as one space.", recommendedProducts: ["Perforated mesh with acoustic tissue backing"], keyBenefit: "Visual softness with a real absorption route" },
            { type: "Exhibition and Cultural Spaces", whyUse: "Backlit and draped mesh gives depth and lets rigging points stay usable between shows.", recommendedProducts: ["Roll mesh in a perimeter tension profile"], keyBenefit: "Continuous unbroken surface, re-tensionable" },
            { type: "Semi-External Canopies", whyUse: "Aluminium mesh tolerates weather, passes wind pressure and stays non-combustible at ground level.", recommendedProducts: ["PVDF-finished expanded mesh, framed panels"], keyBenefit: "Durability with a 15-year coating warranty (standard offer)" },
        ],
        certifications: ["ISO 9001", "CE", "ASTM E84 Class A", "EN 13501-1 A1 (bare metal)"],
    },

    // ═══════════════════════════════════════════════════════
    // 12. ALUMINUM HONEYCOMB CEILING（铝蜂窝板吊顶系统）
    //     与上面第 4 条 aluminum-honeycomb-core-panel（幕墙/墙面用蜂窝板）区分：
    //     本条是吊顶系统 —— 大板无缝、勾搭/暗架安装、面向室内大空间。
    //     数值同前两款用 [标准] / [industry typical] / [derived] 标注来源类型，
    //     不写未经实测的吸声/隔声数值。
    // ═══════════════════════════════════════════════════════
    "aluminum-honeycomb-ceiling": {
        categorySlug: "aluminum-honeycomb-ceiling",
        categoryName: "Aluminum Honeycomb Ceiling",
        overview: "Aluminium honeycomb ceiling panels are sandwich boards: two thin aluminium skins bonded to a hexagonal aluminium honeycomb core. The core works as thousands of tiny I-beams distributed across the panel, so a 15–25 mm board stays flatter than any single sheet of the same weight and can be made in lengths no tile system reaches — up to 6 m with no intermediate joint. The ceiling reads as one continuous, dead-flat plane, hung on concealed carriers, with hanger loads far below a solid panel of the same size.",
        keyFeatures: [
            "Continuous large boards — panels up to 6 m long, so long ceilings run joint-free",
            "Flatness a tile system cannot match: the core holds the skin flat between supports",
            "Very light for its stiffness — bending is carried by the sandwich, not the skin alone",
            "Dimensionally stable; wide boards hang without visible oil-canning or drumming",
            "Concealed hook-on or cassette suspension — no visible grid",
            "Perforated versions turn the core cells into an acoustic resonator with fleece backing",
        ],
        technicalSpecs: [
            { label: "Panel Build-Up", value: "Face sheet + aluminium honeycomb core + back sheet, bonded under heat and pressure; a typical ceiling build is 1.0 mm face + 13 mm core + 0.7 mm back = 15 mm total [industry typical]" },
            { label: "Face / Back Sheet", value: "AA3003 / AA5005 / AA1100 aluminium; face 0.8–1.0 mm with a back skin of the same or a slightly lighter gauge (0.5–0.7 mm) for standard ceiling boards — equal-gauge skins on both sides are common and are not a defect, and heavier faces are used for long spans [industry typical]" },
            { label: "Honeycomb Core", value: "AA3003 / AA5052 hexagonal core; cell side length 3 / 4 / 5 / 6 mm (≈1/8\"–1/4\") with foil 0.04–0.08 mm [industry typical]" },
            { label: "Total Thickness", value: "10 / 15 / 20 / 25 mm standard for suspended ceilings; other thicknesses to order [industry typical]" },
            { label: "Weight", value: "Roughly 3.5–7 kg/m² over the 10–25 mm range — a 15 mm board with 1.0 mm faces is about 6 kg/m², well under an equivalent solid panel [industry typical]" },
            { label: "Panel Size", value: "Folded-edge boards commonly up to 1 190 mm wide × 6 000 mm long; wider flats to special arrangement [industry typical]" },
            { label: "Flatness & Tolerances", value: "Face flatness to about ±0.2 mm and edge straightness within a few millimetres on a production board; the tolerance must be declared on the submittal, because flatness is the reason this product is chosen [industry typical]" },
            { label: "Edge Detail", value: "Four-side folded edge forming a cassette that hooks onto concealed carriers; open or sealed joints to the design" },
            { label: "Suspension", value: "Aluminium carriers with concealed hook-on clips, or an aluminium channel sub-frame on adjustable hangers; spacing set by board span and imposed load" },
            { label: "Fire Reaction", value: "Aluminium skins and core are non-combustible; the laminated board is normally declared A2-s1,d0 to EN 13501-1, with the adhesive system and any backing material forming part of the claim [standard]" },
            { label: "Acoustic Performance", value: "A solid honeycomb board reflects sound — it is a barrier, not an absorber. Perforated-face acoustic boards use the core cells as a resonator behind the perforated skin, but any NRC or αw figure must be tested to EN ISO 354 on the exact build-up before it is quoted" },
            { label: "Thermal Behaviour", value: "The sealed core cells restrict air movement inside the panel, giving a honeycomb board more thermal resistance than a single metal sheet — useful where a soffit sees sun [industry typical]" },
            { label: "Standard / Test Basis", value: "EN 13964 (suspended ceiling systems); EN 13501-1 (reaction to fire); EN ISO 354 / 11654 (sound absorption); ASTM E84; ASTM E3090/E3090M for suspension-system load testing" },
        ],
        surfaceOptions: [
            { name: "Powder Coating", description: "Even matte finish on the face skin; the default interior finish, single or two-colour.", thickness: "60–80 µm typical", warranty: "Standard offer — confirm at quotation", suitableFor: ["Airport terminals", "Malls", "Hotel lobbies"] },
            { name: "PVDF (Fluorocarbon)", description: "For canopies, semi-external soffits and daylight exposure where colour must hold.", thickness: "25–35 µm, 70 %+ PVDF resin", warranty: "15 years (standard offer)", suitableFor: ["Canopies", "Semi-external soffits", "Coastal sites"] },
            { name: "Wood-Grain Sublimation", description: "Timber effect on a dead-flat board — warm look with none of the movement of real timber.", thickness: "Coated film system", warranty: "Standard offer — confirm at quotation", suitableFor: ["Ballrooms", "Retail", "Feature ceilings"] },
            { name: "Anodised", description: "Integral oxide with a metallic read; no film to chip at the folded edge.", thickness: "10–25 µm coating layer", warranty: "Standard offer — confirm at quotation", suitableFor: ["Feature ceilings", "Exhibition halls"] },
        ],
        standardSizes: [
            { label: "Module Cassettes", value: "600×1200 / 600×2400 mm folded-edge boards on concealed carriers" },
            { label: "Wide Boards", value: "1 200×2 400 mm for larger modules" },
            { label: "Long Runs", value: "Up to ~1 190×6 000 mm — a full corridor or concourse in one board, no intermediate joint" },
            { label: "Large Flats", value: "Formats beyond 1 200 mm wide to special arrangement" },
            { label: "Custom", value: "Size, curvature, cut-outs and edge detail to shop drawing" },
        ],
        installationSteps: [
            { step: 1, title: "Set Datum and Perimeter", description: "Mark the finished level and fix the perimeter trim. A joint-free ceiling has no grid lines to hide deviations, so the datum and the perimeter carry the whole read of the surface." },
            { step: 2, title: "Install Carriers", description: "Fix concealed carriers or the channel sub-frame on adjustable hangers at the spacing the board span dictates, and level the system before any board goes up." },
            { step: 3, title: "Hang Boards Centre-Out", description: "Lift boards with suction cups and hook them onto the carriers working from the room centre outward, so accumulated tolerance exits at the perimeter, not mid-field." },
            { step: 4, title: "True the Joints", description: "Adjust hooks and hanger nuts until joints run dead straight along the main sight line; check flatness with a straight edge across board junctions, not just along them." },
            { step: 5, title: "Cut and Fit Services", description: "Set luminaires, diffusers and sprinklers into factory or site cut-outs, and re-seal every cut edge — an open honeycomb edge is the one place moisture reaches the core." },
            { step: 6, title: "Inspect and Hand Over", description: "Sight the full surface under raking light, confirm no board drums or springs when pressed at the hook, and verify boards lift individually for the plenum access the services need." },
        ],
        installationTips: [
            "Nothing hangs from the boards: luminaires, signage and projection equipment must be rigged to the structure independently of the ceiling",
            "Plan openings in the factory where possible; site cut-outs must use straight-edged tools and be re-sealed along the exposed core",
            "Carry large boards with suction lifters — pinching or twisting a cassette at the folded edge dents the skin in a way that shows under light",
            "For humid or semi-external soffits, specify PVDF and verify that every folded edge and joint is sealed",
            "Where acoustics matter, order the perforated version with fleece backing and require an EN ISO 354 test report for that exact assembly",
        ],
        applications: [
            { type: "Airport & Transit Terminals", whyUse: "Very long, uninterrupted ceiling runs at height — the joint-free board removes every line that would normally catch light and show tolerance build-up.", recommendedProducts: ["15 mm boards, powder coated, cassette suspension"], keyBenefit: "6 m joint-free boards with concealed fixing" },
            { type: "Hotel Lobbies & Ballrooms", whyUse: "A dead-flat continuous plane gives the calm, high-end backdrop that fixings and service penetrations would otherwise break up.", recommendedProducts: ["15–20 mm, wood-grain or matte powder finish"], keyBenefit: "Flatness and finish quality across wide spans" },
            { type: "Shopping Malls & Showrooms", whyUse: "Wide boards span over shops without a grid to fight the lighting design; demount access stays available behind every board.", recommendedProducts: ["10–15 mm boards, bright or dark powder finish"], keyBenefit: "Lighting-friendly with full plenum access" },
            { type: "Hospitals & Clean Spaces", whyUse: "A true flat plane does not collect dust on ledges and wipes down; no open grid or fine mesh to harbour it either.", recommendedProducts: ["15 mm, scrub-resistance powder finish"], keyBenefit: "Cleanable, joint-minimal surface" },
            { type: "Canopies & Semi-External Soffits", whyUse: "The sandwich insulates and stays dimensionally stable outdoors, and PVDF holds colour under sun and rain.", recommendedProducts: ["20 mm PVDF boards, sealed folded edges"], keyBenefit: "Weather-stable large soffit in one plane" },
        ],
        certifications: ["ISO 9001", "CE", "ASTM E84 Class A", "EN 13501-1 Class B-s1"],
    },
    "round-tube-baffle-ceiling": {
        categorySlug: "round-tube-baffle-ceiling",
        categoryName: "Round Tube Baffle Ceiling",
        overview: "A round tube ceiling is a run of near-circular aluminium tubes hung side by side at a regular pitch. Each tube is rolled from sheet with one longitudinal opening, and the two edges of that opening are folded — either inward into spring tabs, or upward into short mounting ears — so that they clip or bolt to a carrier bar running above the slit. The carrier therefore sits on top of the tubes rather than inside them, and it is the tubes themselves that hide it from the occupied side: the ceiling reads as a field of clean, soft-edged lines with nothing holding them visible. Every tube is independent: it can be lifted out and put back, and the pitch, diameter and length are all set by the design rather than by a module.",
        keyFeatures: [
            "Soft continuous line — a rolled tube catches light along a curve, so the run reads as gentle parallel stripes instead of hard edges",
            "Truly open system: services, sprinklers, ducts and cable tray sit above and stay visually dissolved, while the tubes still screen them from the normal sight line — including the carrier itself",
            "Every tube is independently demountable by hand — no tools, no cutting, no damaged neighbours when something in the plenum needs access",
            "Runs to 6 m without an intermediate joint, so long corridors and concourses keep one unbroken line",
            "Pitch, diameter and height are design variables, not catalogue constraints — the same tube can be spaced tight as a screen or wide as a rhythm",
            "Air, smoke and light pass through, which is why the system suits transit halls, storefront soffits and any space where a sealed ceiling would be a problem",
        ],
        technicalSpecs: [
            { label: "Material", value: "AA1100 / AA3003 / AA3005 / AA3105 rolled stock; AA6061 / AA6063 where an extruded profile tube is used. Aluminium throughout — no steel or stainless tubes are supplied [industry typical]" },
            { label: "Section Type", value: "Two types share the name: roll-formed open tube (sheet curled, one slit, folded tabs) or extruded profile tube (thicker wall, truer circle, integral mounting ears)" },
            { label: "Nominal Diameter", value: "Ø50 / 60 / 70 mm catalogue sizes; rolled range about Ø30–200 mm; oval and elliptical sections to order [industry typical]" },
            { label: "Sheet / Wall Gauge", value: "0.8–1.2 mm mainstream on rolled tubes, 0.5–0.7 mm on light stock; extruded walls are materially thicker [industry typical]" },
            { label: "Overall Height vs Diameter", value: "Taller than the nominal diameter — the mounting ears stand 7–9 mm proud, so a Ø50 tube finishes near 57–59 mm. Set out on overall height [industry typical]" },
            { label: "Tube Pitch", value: "No fixed module; 100 and 120 mm are most often quoted. Pitch sets the metal per m², the weight and the price, so specify it [industry typical]" },
            { label: "Tube Length", value: "1 000–6 000 mm; 6 m is the usual maximum without a joint. Ends butted with a deliberate 10 or 20 mm gap [industry typical]" },
            { label: "Carrier & Suspension", value: "The carrier runs above the tubes at the slit line and is hidden by the tubes themselves: folded tabs slot into it, or the ears are bolted to a C-channel or hat carrier" },
            { label: "Metal Per Square Metre", value: "≈ (π·D ÷ pitch) × gauge × 2 700. A Ø60 tube at 100 mm pitch and 0.8 mm is about 3.7 kg/m² — an open ceiling is not automatically light [derived]" },
            { label: "Straightness", value: "The governing tolerance: coil camber must be stretcher-levelled out, a limit declared on the submittal, and the run checked with a taut line rather than by eye" },
            { label: "Fire Reaction", value: "Bare or anodised aluminium is A1 to EN 13501-1; coated assemblies normally A2-s1,d0 on test of that build-up. ASTM E84 Class A (FSI 0–25)" },
            { label: "Acoustic Behaviour", value: "An open tube ceiling is a screen, not an absorber — sound passes through it. Perforated tube plus fleece is the only real route, and needs an EN ISO 354 test on that assembly" },
            { label: "Finish Route", value: "Powder, PVDF, wood-grain or stone transfer, anodised. Coating before forming leaves bare metal at the slit edges; coating after forming hides it" },
            { label: "Standard / Test Basis", value: "EN 13964 · EN 13501-1 · EN ISO 354 / EN ISO 11654 · ASTM E84 · ASTM E3090/E3090M (suspension load testing)" },
        ],
        surfaceOptions: [
            { name: "Powder Coating", description: "The default interior finish. Even colour on the curved face; matte or satin reads better than high gloss, because gloss turns every straight line into a running highlight.", thickness: "60–80 µm typical", warranty: "Standard offer — confirm at quotation", suitableFor: ["Transit halls", "Malls", "Offices", "Corridors"] },
            { name: "PVDF (Fluorocarbon)", description: "For canopies, storefront soffits and any outdoor or semi-exposed position where the colour has to survive sun and rain.", thickness: "25–35 µm, 70 %+ PVDF resin", warranty: "15 years (standard offer)", suitableFor: ["Outdoor soffits", "Canopies", "Coastal sites"] },
            { name: "Wood-Grain Transfer", description: "Timber look on a metal tube. Works particularly well here because the curved face gradates the grain naturally, which is harder to fake on a flat panel.", thickness: "Coated film system", warranty: "Standard offer — confirm at quotation", suitableFor: ["Hotels", "Restaurants", "Feature ceilings"] },
            { name: "Anodised", description: "Integral oxide with a genuine metallic read. Strongest choice where the round highlight is the design intent, and it has no film to break at the folded tab.", thickness: "10–25 µm coating layer", warranty: "Standard offer — confirm at quotation", suitableFor: ["Feature ceilings", "Lobbies", "Exhibition"] },
        ],
        standardSizes: [
            { label: "Standard Diameters", value: "50 / 60 / 70 mm, with the rolled range extendable from about 30 mm to 200 mm" },
            { label: "Standard Pitch", value: "100 mm or 120 mm is most often quoted; any other pitch is a design decision and must be drawn" },
            { label: "Lengths", value: "1 000–6 000 mm, cut to the run; 6 m is the usual maximum without a joint" },
            { label: "Gauges", value: "0.8 / 1.0 / 1.2 mm rolled, with lighter stock at 0.5–0.7 mm; extruded sections are materially thicker in the wall" },
            { label: "Custom", value: "Oval and elliptical sections, tapered or fanned layouts, perforated acoustic tubes, special colours and finishes" },
        ],
        installationSteps: [
            { step: 1, title: "Establish the Datum", description: "Mark the finished ceiling level on the wall all round and set the direction of the run from the main sight line — the entry point or the long axis of the room. On a linear system the direction decision matters more than the level." },
            { step: 2, title: "Hang the Main Carrier", description: "Fix hanger rods to the slab at the spacing the structure allows and suspend the main carrier level. Level the carrier before anything else goes near it; tubes will not correct a carrier that is out, they will broadcast it." },
            { step: 3, title: "Set the Cross Carriers", description: "Install the carrier bars across the tube direction at the designed centres, and confirm the pitch on the drawing before the first tube is cut — there is no standard module to fall back on, so a carrier drilled for 120 mm cannot take a 100 mm layout." },
            { step: 4, title: "Fix the Tubes In", description: "Either slot the inward-folded tabs into the bottom mouth of the carrier, or pass the fastener through the upward-projecting ears, working from one end of the room to the other. Each tube is independent, so a mistake lifts straight off — do not force a tube sideways along the carrier, it will mark the finish." },
            { step: 5, title: "Butt and Gap the Ends", description: "Join tube ends with the deliberate gap the design calls for (10 or 20 mm is typical) and keep that gap identical along the whole run. An inconsistent end gap is the most common visible defect on this product." },
            { step: 6, title: "Sight, Level and Fit Services", description: "Check straightness with a taut line along several runs, adjust hanger nuts, then cut in luminaires, diffusers and sprinkler collars. Step back and sight the ceiling from the entry — that is where a bow shows." },
        ],
        installationTips: [
            "Wear clean gloves throughout: finger grease on a curved tube is visible under raking light and each tube is a mirror-ish cylinder, so it shows twice as clearly as on a flat panel",
            "Store tubes flat and supported along their length, never leaning or stacked on the end — a bent tube cannot be straightened enough to disappear into a run",
            "Run the ceiling direction over the longest dimension of the room; joints along a long run are far more visible than joints across a short one",
            "Nothing hangs from the tubes: luminaires, signage and projectors must be independently rigged to the structure — a tube carries only itself",
            "Where the design intent is to hide the plenum, paint the slab and services above black or a dark tone; the gaps work as windows onto whatever colour is behind them",
        ],
        applications: [
            { type: "Metro Stations & Transit Concourses", whyUse: "Open construction lets smoke, air and sprinkler discharge pass unobstructed, while the tubes screen the services overhead and every tube lifts out for maintenance.", recommendedProducts: ["60 mm rolled tubes at 100 mm pitch, dark powder finish above and colour on the face"], keyBenefit: "Access without tools, no obstruction to ventilation or fire systems" },
            { type: "Shopping Malls & Storefront Soffits", whyUse: "A linear tube soffit reads as a designed ceiling edge rather than a bulkhead, and it hides the steel and ductwork behind it without sealing the space.", recommendedProducts: ["50 mm tubes, tight pitch, matte white or wood-grain"], keyBenefit: "Soft continuous line that hides services and survives impact" },
            { type: "Airport & Rail Terminals", whyUse: "Long 6 m runs keep the line unbroken across very wide halls, and the open system absorbs the height and services mess of a terminal plenum.", recommendedProducts: ["70 mm tubes, 6 m lengths, PVDF where the rooflight or apron side is exposed"], keyBenefit: "Joint-free long runs at height" },
            { type: "Offices, Lobbies & Restaurants", whyUse: "The curved face gives a warmer, less industrial linear look than a rectangular baffle, and acoustics can be added by perforating the tube.", recommendedProducts: ["Perforated 50–60 mm tubes with fleece lining, wood-grain or anodised"], keyBenefit: "Feature line with an optional acoustic route" },
            { type: "Outdoor Canopies & Building Entrances", whyUse: "An open ceiling does not trap wind or moisture and cannot oil-can the way a soffit panel does; with the right gauge and anti-wind clips it works as an entrance canopy.", recommendedProducts: ["Thicker gauge extruded tube on a bolted C-channel carrier, PVDF finish, anti-wind clips"], keyBenefit: "Weather-tolerant linear soffit with no wind-trapped plane" },
        ],
        certifications: ["ISO 9001", "CE", "ASTM E84 Class A", "EN 13501-1 Class B-s1"],
    },
    "teardrop-shape-baffle-ceiling": {
        categorySlug: "teardrop-shape-baffle-ceiling",
        categoryName: "Teardrop-Shape Baffle Ceiling",
        overview: "A teardrop — also sold as droplet or water-drop — baffle ceiling is a row of narrow vertical aluminium blades hung close together below the ceiling plane. Each blade is a flat vertical face whose top edge is rolled shut into a continuous rounded bulb, and it is that bulb which gives the section its teardrop outline in end view. The result reads as a dense, soft-valanced linear surface with the plenum above partly visible between the blades, and every blade hangs on its own, so the ceiling stays open to services and can be set out straight, radial or spiralled from the same part.",
        keyFeatures: [
            "Dense linear rhythm — narrow blades at tight centres read almost as a solid ribbed surface from a distance, but stay physically open",
            "The rolled droplet head gives a soft rounded top to every blade, so the ceiling catches light as a line of highlights rather than a row of hard edges",
            "Each blade hangs independently — lift one out for plenum access without disturbing its neighbours",
            "Shares the same hanger and carrier family as round tube, square tube, U-baffle and open cell ceilings, so one scheme can mix section shapes on one grid",
            "Radial, spiral and feature layouts are made from the same blade, which is why the system is used over atria and curved lobbies",
            "Wood-grain transfer on a narrow blade reads convincingly as timber slats, at metal durability and fire behaviour",
        ],
        technicalSpecs: [
            { label: "Material", value: "AA6063 / AA6063-T5 where the blade is extruded; AA1100 / AA3003 where it is roll-formed from sheet. Aluminium throughout — the trade also sells galvanised steel blades, and those are not this product [industry typical]" },
            { label: "Section Shape", value: "A flat vertical blade with its top edge rolled closed into a continuous rounded bulb; end view reads as a teardrop, not as a plate with a separate hanging ring [industry typical]" },
            { label: "Blade Height (Depth)", value: "100 / 150 / 200 mm is the mainstream drop below the ceiling plane; the wider trade range runs 30–300 mm [industry typical]" },
            { label: "Blade Width", value: "Droplet sections commonly 35 / 50 / 70 mm across the face; general baffle blades run 30–200 mm [industry typical]" },
            { label: "Wall Gauge", value: "0.6–1.5 mm, with 1.0 mm the most specified. Taller blades and longer unsupported lengths need the thicker end of that band [industry typical]" },
            { label: "Length", value: "Cut to the run; 6 000 mm is the usual practical maximum before a joint [industry typical]" },
            { label: "Blade Spacing", value: "There is no standard pitch — centres are set on the reflected ceiling plan and are fully adjustable. Ask for the setting-out drawing rather than a catalogue number; no supplier publishes a fixed spacing" },
            { label: "Suspension", value: "Threaded hanger rod to a main carrier, a spring or triangular carrier bar that the blades clip into, and edge hangers at the perimeter. Each blade is retained individually [industry typical]" },
            { label: "Openness", value: "An open linear system: whatever is above stays visible between the blades, so the slab, ducts and tray should be painted one dark tone or the finish will read as clutter" },
            { label: "Fire Reaction", value: "Bare or anodised aluminium is A1 to EN 13501-1; coated assemblies are normally A2-s1,d0 on test of that build-up, since the coating is the only combustible element. ASTM E84 Class A (FSI 0–25)" },
            { label: "Acoustic Behaviour", value: "A blade ceiling is a screen, not an absorber — sound passes between the blades and reflects off what is above. Perforated blade plus fleece is the only route to a figure, and it must be measured to EN ISO 354 on that assembly" },
            { label: "Curved and Radial Work", value: "Radial, spiral and arched ceilings are shown throughout the trade, but whether a given layout is achieved by fanning straight blades or by bent blades is a shop decision — confirm which one the drawing requires" },
            { label: "System Compatibility", value: "Runs on the same carrier and hanger family as round tube, square tube, U-baffle and open cell ceilings, so mixed-section schemes are normal [industry typical]" },
            { label: "Standard / Test Basis", value: "EN 13964 (factory-made suspended ceilings) · EN 13501-1 (reaction to fire) · EN ISO 354 / EN ISO 11654 (sound absorption) · ASTM E84 · ASTM E3090/E3090M (suspension load testing)" },
        ],
        surfaceOptions: [
            { name: "Powder Coating", description: "The standard interior finish. Matte or satin is strongly preferred on a blade, because a gloss finish turns every blade into a bright line and amplifies any deviation in the run.", thickness: "60–80 µm typical", warranty: "Standard offer — confirm at quotation", suitableFor: ["Lobbies", "Malls", "Offices", "Transit"] },
            { name: "Wood-Grain Transfer", description: "The reason this section is specified so often: a narrow blade with a timber film reads as a timber slat ceiling with none of timber's movement, fire behaviour or maintenance.", thickness: "Coated film system", warranty: "Standard offer — confirm at quotation", suitableFor: ["Hotels", "Restaurants", "Retail", "Feature ceilings"] },
            { name: "PVDF (Fluorocarbon)", description: "For canopies, entrance soffits and any semi-external position where colour has to survive sun and rain.", thickness: "25–35 µm, 70 %+ PVDF resin", warranty: "15 years (standard offer)", suitableFor: ["Canopies", "Entrance soffits", "Coastal sites"] },
            { name: "Anodised", description: "Integral oxide with a true metallic read; no film to break at the rolled head, which is where a coating is thinnest.", thickness: "10–25 µm coating layer", warranty: "Standard offer — confirm at quotation", suitableFor: ["Feature ceilings", "Exhibition", "Lobbies"] },
        ],
        standardSizes: [
            { label: "Common Sections", value: "35 × 100 / 50 × 150 / 70 × 200 mm (width × depth), blade to blade" },
            { label: "Depths", value: "100 / 150 / 200 mm standard; 30–300 mm to order" },
            { label: "Gauges", value: "0.6 / 0.8 / 1.0 / 1.2 / 1.5 mm" },
            { label: "Lengths", value: "Cut to the run, up to 6 000 mm" },
            { label: "Custom", value: "Perforated blades, tapered or fanned layouts, mixed-section schemes, special colours" },
        ],
        installationSteps: [
            { step: 1, title: "Set Datum and Direction", description: "Mark the finished level all round and decide the blade direction from the main sight line — usually along the long axis of the room, or square to the entry. On a linear ceiling the direction decision is more visible than the level." },
            { step: 2, title: "Hang the Main Carrier", description: "Fix adjustable hanger rods to the slab and suspend the main carrier level. Level it properly now: blades will not correct a carrier that is out of plane, they will repeat its error along every metre of the run." },
            { step: 3, title: "Install the Carrier Bar and Edge Trim", description: "Clip the spring or triangular carrier bar to the main carrier at the centres on the setting-out drawing, and fix the perimeter angle. Confirm the spacing against the drawing before the first blade goes in — there is no default pitch to fall back on." },
            { step: 4, title: "Hang the Blades", description: "Clip each blade into the carrier bar working along the run. Blades are independent, so a wrong one lifts straight back out; do not drag a blade along the carrier, which marks the finish." },
            { step: 5, title: "Sight the Face of the Run", description: "Look along the ceiling from the end of the run and from the entry, not down at it. That is where a wandering line, an uneven gap or a bowed blade shows. Adjust hanger nuts until the face is straight." },
            { step: 6, title: "Fit Services and Hand Over", description: "Set luminaires, diffusers and sprinklers into the plane between blades, keep cut edges re-sealed, then confirm blades lift out individually for the access the services team will need." },
        ],
        installationTips: [
            "Paint everything above the ceiling one dark colour before the blades go up — the gaps are windows, and bright services will read as clutter",
            "Wear clean gloves: a blade is a narrow vertical face at eye-level height in a corridor, so scuffs and fingerprints show for the life of the building",
            "Store blades flat and supported along their length, never leaning on the rolled head — a crushed head cannot be pressed back round",
            "Nothing hangs from the blades: luminaires, signage and projectors are rigged to the structure independently",
            "Where a radial or spiral layout is drawn, agree on the setting-out before manufacture, because the blade count and carrier drilling follow from it",
        ],
        applications: [
            { type: "Mall Atria and Feature Ceilings", whyUse: "Narrow blades at tight centres give a ribbed, warm surface that can fan radially across an atrium without changing part numbers.", recommendedProducts: ["50 × 150 mm blades, wood-grain transfer, radial setting-out"], keyBenefit: "Timber-slat look with metal fire behaviour" },
            { type: "Transit Concourses and Stations", whyUse: "The open build lets smoke, sprinkler discharge and air pass through, and every blade lifts for access to the services above.", recommendedProducts: ["70 × 200 mm blades at 100 mm centres, matte dark powder"], keyBenefit: "Unobstructed services with full plenum access" },
            { type: "Hotel Lobbies and Restaurants", whyUse: "A dense blade run reads as a designed ceiling surface rather than a grid, and the rounded head keeps the light soft along the whole length.", recommendedProducts: ["35 × 100 mm blades, tight pitch, anodised or matte powder"], keyBenefit: "Soft linear surface, no visible carrier" },
            { type: "Offices and Showrooms", whyUse: "It hides the slab while leaving the services where they are, so a fit-out can keep its ductwork and still look resolved.", recommendedProducts: ["50 × 150 mm blades, white or grey powder"], keyBenefit: "Screened services, cheap access, no sealed ceiling" },
            { type: "Entrance Canopies and Soffits", whyUse: "An open ceiling cannot trap wind pressure or condensation the way a sealed soffit panel does; with PVDF and a bolted carrier it works outdoors.", recommendedProducts: ["Thicker-gauge blades, PVDF finish, bolted carrier with anti-wind fixings"], keyBenefit: "Weather-tolerant linear soffit with no wind-loaded plane" },
        ],
        certifications: ["ISO 9001", "CE", "ASTM E84 Class A", "EN 13501-1 Class B-s1"],
    },

    // ═══════════════════════════════════════════════════════
    // Facade & Exterior Cladding（幕墙家族级条目）
    //     注意与上面各叶子条目的分工：本条目描述的是整个外挂家族的共同事实
    //     （板材、节点、龙骨、涂层、防火口径），而不是某一个产品的参数。
    //     只有一级分类直挂在 facade-exterior-cladding 下、没有叶子分类的产品会命中它
    //     （现在是 insulated-facade-panel）。产品专属参数一律走 enriched_specs 覆盖。
    //     数值来源标注：[calculated] = 按物理常数算术推出；[vendor-typical] = 行业典型值，
    //     不是本厂实测；[standard] = 标准条文要求。公司值只取附录 A。
    // ═══════════════════════════════════════════════════════
    "facade-exterior-cladding": {
        categorySlug: "facade-exterior-cladding",
        categoryName: "Facade & Exterior Cladding",
        overview:
            "The exterior cladding family shares one logic: an aluminium skin carries the weather, the UV and the colour; a subframe carries the wind load and absorbs the building's movement; and the joint between panels is a designed detail rather than a gap left by the fixer. What differs across the family is what sits between the skin and the subframe — nothing (solid veneer cassettes), a stiffening honeycomb core where flatness over a large module is the problem, a thermal core where the wall must insulate and reclad in one operation, or a formed rib where texture is the design intent. Panels are cut and formed to the project drawing, so the elevation, not a catalogue, sets the module size.",
        keyFeatures: [
            "Cut and formed to the setting-out drawing — facade work is drawn, not picked off a shelf of stock sizes",
            "Our standard sheet range 0.8–1.5 mm in 3003 / 5052; heavier facade gauges are produced to the specified drawing rather than held as stock",
            "Rear fixing provision — brackets, cleats and hanging ears — formed or welded with the panel and shown on the shop drawing",
            "Open or closed joint is a system decision taken before manufacture: it changes the build-up, the membrane line and the cost",
            "PVDF coating at the AAMA 2605 performance tier — 15-year standard-offer warranty",
            "Non-combustible metal surface; our declarations are ASTM E84 Class A and EN 13501-1 B-s1,d0 for the coated product",
            "Insulated build-ups are factory-bonded over a mineral wool or polyurethane core; the core ladder and its lambda are set per project, because they follow from the wall's thermal and fire targets",
            "A drained, back-ventilated cavity is the default exterior detail — the weather line sits behind the panels, not on them",
        ],
        technicalSpecs: [
            { label: "Material", value: "AA3003 / AA5005 aluminium; our standard sheet range 0.8–1.5 mm, heavier facade gauges to the specified drawing" },
            { label: "Panel Format", value: "Cut to the project drawing; 300 × 300 to 600 × 1200 mm is our standard working envelope, larger modules are a project decision" },
            { label: "Edge / Form", value: "Cassette folds, welded returns and square-corner mitres per the elevation; curved panels formed to the model" },
            { label: "Weight", value: "gauge (mm) × 2.7 kg/m² — 1.0 mm ≈ 2.7, 1.5 mm ≈ 4.05 kg/m² of skin [calculated at 2 700 kg/m³]; add core and rear layer for a sandwich" },
            { label: "Fire", value: "Aluminium is not a fuel. Our declarations are ASTM E84 Class A and EN 13501-1 B-s1,d0; a cored build-up is classified as an assembly, and an A2 declaration needs a test report for that exact construction — we do not quote a class we have not tested" },
            { label: "Thermal", value: "A U-value belongs to the assembled wall, not to a panel. Core resistance is R = d / λ using the λ published for the specified core [vendor-typical]; the cavity, brackets and cut edges are the facade engineer's part of the sum" },
            { label: "Thermal Movement", value: "2.4 × 10⁻⁵ per °C — allow roughly 3 mm per metre of span per 100 °C of surface swing [calculated]; the subframe and joint absorb it, the skin cannot" },
            { label: "Wind Load", value: "Engineered and tested per project against the design pressure and the actual module size — not a fixed product rating" },
            { label: "Dissimilar Metals", value: "Aluminium separated from carbon steel at every contact by gasket, coating or stainless fastener; a galvanised steel subframe belongs behind the insulation line" },
            { label: "Tolerance & Flatness", value: "Agreed on the shop drawing per gauge, format and joint, and verified on the first article before series production" },
            { label: "Acoustics", value: "A perforated skin over a core is an assembly, and any NRC or Rw figure belongs to a tested build-up including the cavity — not to the sheet" },
        ],
        surfaceOptions: [
            { name: "PVDF (Fluorocarbon)", description: "The exterior grade for facades and soffits. Two, three or four-coat systems at the AAMA 2605 resin tier — the choice that survives UV, coastal salt and industrial air without chalking.", thickness: "25–40 µm total film", warranty: "15-year standard offer", suitableFor: ["Exterior facades", "Coastal and high-salt sites", "Entrance soffits and canopies", "Landmark elevations"] },
            { name: "Powder Coating (Polyester)", description: "Electrostatic thermoset polyester, baked after forming, so folds, returns and welded corners are covered as well as the face. Wide RAL range and the usual interior choice.", thickness: "60–80 µm film", warranty: "Standard offer — confirm at quotation", suitableFor: ["Interior linings", "Covered elevations", "Column wraps and bulkheads", "Budget-conscious facades"] },
            { name: "Coil / Roller Coating (PE)", description: "Pre-finished aluminium coil, rolled and cut, so colour is perfectly even across a long run and the price is the lowest on the page. The coating stops where the sheet is cut or folded — legs and ends are bare metal.", thickness: "18–25 µm polyester", warranty: "10-year standard offer (PE tier)", suitableFor: ["Large uniform runs", "Soffits behind the joint line", "Interior feature planes", "Cost-managed cladding"] },
            { name: "Wood-Grain Transfer or Film", description: "Timber appearance on aluminium, sublimation-printed into the coating or bonded as a laminate film. The species names on every chart — oak, teak, walnut — are marketing labels, not a botanical grade, so approve a physical sample and check the film's exterior rating.", thickness: "Film or transfer system over base coat", warranty: "Standard offer — confirm at quotation", suitableFor: ["Hotels and restaurants", "Lobbies", "Warm-elevation facades", "Retrofits over cladding frames"] },
            { name: "Anodised, Brushed or PVD", description: "Integral oxide, optionally with a brushed grain or a PVD metallic tone. Genuine metal depth with no film to break at the fold, and the only finish that reads correctly under raking daylight on a flat plane.", thickness: "10–25 µm oxide layer", warranty: "Outside the coating warranty schedule; the oxide is UV-stable", suitableFor: ["Interior feature walls", "Low-rise elevations", "Lift lobbies and joinery", "Minimalist metallic design"] },
        ],
        standardSizes: [
            { label: "Standard Working Envelope", value: "300 × 300 mm to 600 × 1200 mm; anything larger is a project decision, not a catalogue step" },
            { label: "Facade Cassettes", value: "Cut and folded to the elevation — module size follows the setting-out drawing and the joint pattern" },
            { label: "Curved Panels", value: "Formed to the model; cold roll-forming is commonly held to a radius of about 5 × sheet thickness [vendor-typical], and double curvature is project-specific" },
            { label: "Perforated Skins", value: "Ø1.5–6 mm, open area 10–30% (our stated capability range), calculated against the acoustic target" },
            { label: "Insulated Build-Up", value: "Skin + thermal core + rear layer; core type and thickness are set per project — see the insulated facade panel product page" },
            { label: "Accessories", value: "Matching trims, reveals, shadow-line carriers, edge profiles and fixing brackets in the same finish" },
        ],
        installationSteps: [
            { step: 1, title: "Survey and Setting-Out", description: "Check the substrate against the drawing — existing structures never match the as-designed record. Set the finished facade line, the floor-line reveals and the joint pattern, and record where the brackets and cut panels will fall before anything is fabricated." },
            { step: 2, title: "Subframe / Batten Line", description: "Fix the aluminium or galvanised steel batten line to the substrate with the anchorage the structural engineer has specified for this wall and this loading. Level and plumb it properly: a cladding skin repeats every deviation instead of hiding it." },
            { step: 3, title: "Weather Barrier and Insulation", description: "Lap and tape the breather membrane over the line, then install the insulation layer — or receive it already bonded to the panel on an insulated build-up. The membrane, not the panel, is the weather line in an open-jointed system." },
            { step: 4, title: "Bracket Line and Adjustment", description: "Set the panel brackets or cleats to the drawing, with the travel needed to take the bracket line out of true and the movement allowance the span requires. Separate dissimilar metals at every contact." },
            { step: 5, title: "Panel Hanging", description: "Hang from the bottom up on the established datum, working outward from the main sight line. Check the joint width at every course rather than only at the end of a bay — cumulative error in a cladding run shows up as a visible taper at the parapet." },
            { step: 6, title: "Joint Closure and Protection", description: "Close the joint as specified: gasket, backer rod and sealant, or leave it deliberately open on a drained cavity. Treat site cuts as a drawing item and seal the exposed edge. Remove the coating protection only at handover." },
        ],
        installationTips: [
            "Decide the joint before manufacture, not on the scaffold — open and closed systems need different panel edges, different membrane details and different tolerances",
            "Photograph the bracket line, the membrane laps and the insulation continuity before they are covered; that record is the submittal evidence and the future maintenance map",
            "Keep bonded panels with a mineral core stored flat and dry — insulation that gets wet before installation does not return to the lambda it was quoted on",
            "Do not cut the cavity's drainage path at sills, reveals and the base of the run; a blocked weep line turns a rainscreen into a water tank",
            "Leave the coating protection in place until handover. A PVDF face scratched by a scaffold bracket on site is not a factory defect and will not be replaced as one",
        ],
        applications: [
            { type: "Commercial Facades and Podiums", whyUse: "Cassette-folded aluminium panels give a hard, weather-tight elevation with the colour held in the coating rather than applied to it, and the module can follow the grid the architecture was drawn on.", recommendedProducts: ["Flat aluminium veneer cassettes, PVDF 25–40 µm", "Fluted exterior cladding for texture"], keyBenefit: "Designed module with a 15-year coating tier" },
            { type: "Over-Cladding Retrofits", whyUse: "Where a wall needs a thermal upgrade and a new exterior finish in one operation, a factory-bonded insulated panel puts both on the scaffold in a single pass instead of two sequential trades.", recommendedProducts: ["Insulated aluminium facade panels, mineral wool or PU core", "Matching trims and reveals"], keyBenefit: "Insulation and cladding arrive as one unit" },
            { type: "Transit and Civic Linings", whyUse: "Stations, airports and public interiors need a surface that cleans, resists vandalism and answers a fire question — all-aluminium build-ups with a declared coating classification are the argument that gets metal specified overhead as well as on the wall.", recommendedProducts: ["Aluminium honeycomb facade panels", "Perforated skins over acoustic backing"], keyBenefit: "Cleanable, stiff, declared fire behaviour" },
            { type: "Entrance Soffits, Canopies and Plant Screens", whyUse: "The soffit is the most-exposed horizontal in the building — sun on the face, water behind it, and every deviation visible from below. Formed aluminium with the right coating tier and a drained cavity is the combination that lasts.", recommendedProducts: ["PVDF-finished panels, bolted anti-wind fixings", "Perforated panels for screened plant"], keyBenefit: "Weather-tolerant plane with wind and drainage detailed" },
        ],
        certifications: ["ISO 9001", "CE", "ASTM E84 Class A", "EN 13501-1 B-s1,d0"],
    },
};
