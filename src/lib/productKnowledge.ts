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

export interface DownloadFile {
    name: string;
    format: string;
    url: string;
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
    cadFiles: DownloadFile[];
    bimFiles: DownloadFile[];
    specSheetUrl: string;
}

// ─── 产品知识库数据 ─────────────────────────────────────────

export const productKnowledge: Record<string, ProductKnowledge> = {

    // ═══════════════════════════════════════════════════════════
    // 1. Aluminum Veneer（铝单板）
    // ═══════════════════════════════════════════════════════════
    "aluminum-veneer": {
        categorySlug: "aluminum-veneer",
        categoryName: "Aluminum Veneer",
        overview: "Aluminum veneer is a premium building facade material crafted from high-quality aluminum alloy sheets (1100/3003 series). Through CNC cutting, folding, and welding, it can be formed into flat panels, curved surfaces, and complex geometric shapes. Finished with PVDF or powder coating, aluminum veneer delivers exceptional weather resistance, color stability, and a service life exceeding 25 years. It is the material of choice for high-end commercial, institutional, and landmark architecture worldwide.",
        keyFeatures: [
            "Custom shapes: flat, curved, folded, perforated, and parametric forms",
            "PVDF coating with 25+ year color warranty (AAMA 2605 compliant)",
            "Lightweight: 4.5–8.2 kg/m², reducing structural load vs. stone or GRC",
            "100% recyclable aluminum alloy — sustainable building material",
            "Fire-rated A2-s1,d0 (non-combustible per EN 13501-1)",
            "Factory pre-fabrication ensures consistent quality and fast installation",
            "Compatible with concealed fix and face-fix subframe systems"
        ],
        technicalSpecs: [
            { label: "Base Material", value: "AA1100 / AA3003 / AA5005 Aluminum Alloy" },
            { label: "Panel Thickness", value: "1.5mm / 2.0mm / 2.5mm / 3.0mm" },
            { label: "Standard Width", value: "1000mm / 1220mm / 1500mm (max 2000mm)" },
            { label: "Standard Length", value: "Up to 6000mm (custom cut to project size)" },
            { label: "Weight", value: "4.5 kg/m² (2.0mm) / 6.8 kg/m² (3.0mm)" },
            { label: "Tensile Strength", value: "≥ 130 MPa (AA3003-H24)" },
            { label: "Yield Strength", value: "≥ 115 MPa (AA3003-H24)" },
            { label: "Fire Rating", value: "A2-s1,d0 (EN 13501-1) / Class A (ASTM E84)" },
            { label: "Wind Load Resistance", value: "Up to 5.0 kPa (depending on fixing and span)" },
            { label: "Thermal Expansion", value: "2.4 × 10⁻⁵ /°C" },
            { label: "Sound Insulation", value: "25–30 dB (single panel); up to 42 dB with acoustic backing" },
            { label: "Flatness Tolerance", value: "≤ 1.5mm per 1000mm (per ASTM B209)" },
            { label: "Coating Adhesion", value: "Cross-cut test: Grade 0–1 (ISO 2409)" },
        ],
        surfaceOptions: [
            { name: "PVDF (Fluorocarbon) Coating", description: "2-coat, 3-coat, or 4-coat PVDF system based on Kynar 500® / Hylar 5000® resin. Superior UV, chemical, and salt-spray resistance.", thickness: "25–40 μm total film", warranty: "25-year color retention (AAMA 2605)", suitableFor: ["Exterior facades", "Coastal environments", "High-UV regions", "Landmark architecture"] },
            { name: "Powder Coating (Polyester)", description: "Electrostatic powder coating, thermoset polyester. Wide RAL color range with excellent mechanical durability.", thickness: "60–80 μm film", warranty: "10–15 year color retention (AAMA 2604)", suitableFor: ["Interior applications", "Covered exterior", "Budget-conscious projects", "Standard commercial facades"] },
            { name: "Anodized Finish", description: "Electrochemical anodizing creates a hard, integral oxide layer. Metallic appearance with natural aluminum luster.", thickness: "15–25 μm oxide layer (AA Class I/II)", warranty: "20+ year natural weathering resistance", suitableFor: ["Modern minimalist design", "Interior feature walls", "Low-maintenance applications"] },
        ],
        standardSizes: [
            { label: "Flat Panel (Standard)", value: "1220 × 2440mm / 1500 × 3000mm / 1500 × 4000mm" },
            { label: "Flat Panel (Large)", value: "2000 × 6000mm (custom, max)" },
            { label: "Curved Panel (Single Curve)", value: "Min radius 300mm, max arc 3000mm" },
            { label: "Curved Panel (Double Curve)", value: "Custom CNC formed, project-specific" },
            { label: "Perforated Panel", value: "Hole dia. 2–25mm, open area 5–60%" },
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
            { type: "Commercial Skyscrapers", whyUse: "Lightweight cladding reduces structural cost while enabling bold architectural expression.", recommendedProducts: ["3.0mm PVDF flat panels", "Curved panels for corners", "Perforated panels for ventilation zones"], keyBenefit: "30–40% lighter than stone, 25+ year lifespan" },
            { type: "Airport Terminals", whyUse: "Large-format panels minimize joints for clean aesthetics. Fire-rated A2 for public safety.", recommendedProducts: ["2.5mm PVDF metallic panels", "Curved panels for ceiling transitions"], keyBenefit: "Fast large-area installation, aviation fire safety" },
            { type: "Sports Stadiums", whyUse: "Custom curved and angular panels create dynamic facades.", recommendedProducts: ["3.0mm PVDF folded panels", "Parametric CNC-cut panels"], keyBenefit: "Design freedom, high wind load resistance" },
            { type: "Hospitals & Healthcare", whyUse: "Smooth, non-porous surface is easy to clean and maintain.", recommendedProducts: ["2.0mm powder-coated (interior)", "PVDF panels (exterior)"], keyBenefit: "Hygienic, low maintenance, fire-rated" },
        ],
        certifications: ["ISO 9001:2015", "CE Marking (EN 13830)", "SGS Test Report", "AAMA 2605", "ASTM E84 Class A"],
        cadFiles: [{ name: "Standard Fixing Detail", format: "DWG", url: "#" }, { name: "Concealed Bracket System", format: "DWG", url: "#" }],
        bimFiles: [{ name: "Aluminum Veneer Facade System", format: "RVT", url: "#" }],
        specSheetUrl: "#",
    },

    // ═══════════════════════════════════════════════════════════
    // 2. Aluminum Strip Panel（铝条扣板）
    // ═══════════════════════════════════════════════════════════
    "aluminum-strip-panel": {
        categorySlug: "aluminum-strip-panel",
        categoryName: "Aluminum Strip Panel",
        overview: "Aluminum strip panels are long, narrow panels designed for ceiling and soffit applications. Available in C-shape, G-shape, and S-shape profiles, they create clean linear aesthetics with concealed fixing systems. Ideal for large-span commercial interiors, corridors, and transit spaces.",
        keyFeatures: [
            "Continuous linear appearance with concealed clip fixing",
            "C-shape, G-shape, and S-shape profiles available",
            "Widths from 50mm to 300mm — mix widths for visual rhythm",
            "Perforated options for acoustic performance (NRC up to 0.75)",
            "Individual panels demountable for ceiling access",
            "Compatible with standard T-bar and concealed carrier systems"
        ],
        technicalSpecs: [
            { label: "Base Material", value: "AA3003 / AA5005 Aluminum Alloy" },
            { label: "Panel Thickness", value: "0.5mm / 0.6mm / 0.7mm / 0.8mm / 1.0mm" },
            { label: "Panel Width", value: "50 / 75 / 100 / 150 / 200 / 300mm" },
            { label: "Panel Length", value: "Up to 6000mm" },
            { label: "Weight", value: "1.5–3.0 kg/m²" },
            { label: "Profile Types", value: "C-shape / G-shape / S-shape" },
            { label: "Fire Rating", value: "A2-s1,d0 (EN 13501-1)" },
            { label: "Acoustic NRC", value: "0.55 (perforated) / 0.75 (perforated + mineral wool)" },
            { label: "Light Reflectance", value: "≥ 80% (white)" },
            { label: "Humidity Resistance", value: "Up to 95% RH" },
        ],
        surfaceOptions: [
            { name: "Powder Coating", description: "Standard polyester powder in RAL colors.", thickness: "60–80 μm", warranty: "10–15 year", suitableFor: ["Interior ceilings", "Corridors", "Retail"] },
            { name: "Roller Coating (PE/PVDF)", description: "Continuous coil coating for consistent color.", thickness: "18–25 μm (PE) / 25–40 μm (PVDF)", warranty: "15–25 year", suitableFor: ["Large commercial ceilings", "Transit stations"] },
            { name: "Wood Grain Transfer", description: "Realistic wood patterns on aluminum.", thickness: "Film transfer layer", warranty: "10 year", suitableFor: ["Hospitality", "Feature ceilings", "Restaurants"] },
        ],
        standardSizes: [
            { label: "C-85 (Narrow)", value: "85mm face × 0.5–0.6mm, closed joint" },
            { label: "C-135 (Medium)", value: "135mm face × 0.6–0.7mm" },
            { label: "C-185 (Wide)", value: "185mm face × 0.7–0.8mm" },
            { label: "G-200 (Gap Joint)", value: "200mm face × 0.7mm, 10–15mm gap" },
            { label: "Box Baffle", value: "50×100 / 50×150 / 100×200mm" },
        ],
        installationSteps: [
            { step: 1, title: "Carrier Installation", description: "Install carrier rails perpendicular to panel direction. Spacing: 800–1200mm." },
            { step: 2, title: "Level & Align", description: "Laser-level all carriers. Tolerance: ±1mm over entire area." },
            { step: 3, title: "Panel Clip-In", description: "Clip panels into carriers — push up and click, no tools required." },
            { step: 4, title: "Edge Trim", description: "Install perimeter L-angle or shadow-line trim at wall junctions." },
            { step: 5, title: "Services Integration", description: "Cut openings for fixtures and diffusers, support with additional clips." },
        ],
        installationTips: [
            "Install in one consistent direction — check arrow markings",
            "Plan expansion joints every 6–8m for long runs",
            "Perforated panels: install acoustic fleece backing above",
            "Do not walk on installed panels — use access hatches",
        ],
        applications: [
            { type: "Office Interiors", whyUse: "Linear panels create visual order with integrated acoustic control.", recommendedProducts: ["C-135 white RAL 9010", "Perforated above workstations"], keyBenefit: "NRC 0.75, clean linear aesthetic" },
            { type: "Airport & Metro Stations", whyUse: "Long-span panels for large areas, demountable for maintenance.", recommendedProducts: ["C-185 metallic silver", "PVDF roller-coated"], keyBenefit: "Fast installation, maintenance access" },
            { type: "Shopping Malls", whyUse: "Mixing widths creates visual rhythm and wayfinding cues.", recommendedProducts: ["Mixed widths 100+150+200mm", "Wood grain finish"], keyBenefit: "Design flexibility" },
        ],
        certifications: ["ISO 9001:2015", "CE Marking", "SGS Test Report", "ASTM E84 Class A"],
        cadFiles: [{ name: "C-Shape Section Detail", format: "DWG", url: "#" }],
        bimFiles: [{ name: "Strip Ceiling System", format: "RVT", url: "#" }],
        specSheetUrl: "#",
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
            { label: "Spacing", value: "50–300mm center-to-center" },
            { label: "Fire Rating", value: "A2-s1,d0" },
            { label: "Acoustic NRC", value: "0.40–0.65 (with infill)" },
        ],
        surfaceOptions: [
            { name: "Powder Coating", description: "Uniform matte/gloss across all surfaces.", thickness: "60–80 μm", warranty: "10–15 year", suitableFor: ["Lobbies", "Malls", "Exhibition halls"] },
            { name: "Wood Grain Transfer", description: "Timber appearance, zero maintenance.", thickness: "Film layer", warranty: "10 year", suitableFor: ["Hotels", "Restaurants", "Cultural venues"] },
            { name: "PVDF", description: "For semi-exposed soffit applications.", thickness: "25–40 μm", warranty: "20–25 year", suitableFor: ["Exterior soffits", "Canopies", "Stadiums"] },
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
        certifications: ["ISO 9001:2015", "CE Marking", "SGS", "ASTM E84 Class A"],
        cadFiles: [{ name: "U-Baffle Section", format: "DWG", url: "#" }],
        bimFiles: [{ name: "U-Baffle System", format: "RVT", url: "#" }],
        specSheetUrl: "#",
    },

    "aluminum-honeycomb-core-panel": {
        categorySlug: "aluminum-honeycomb-core-panel",
        categoryName: "Aluminum Honeycomb Core Panel",
        overview: "Ultra-lightweight, high-rigidity composite panels with two aluminum face sheets bonded to hexagonal honeycomb core. Originally aerospace technology, now used for large-format facades, interior partitions, and applications requiring maximum flatness over large spans.",
        keyFeatures: ["Ultra-light: 4.5–6.0 kg/m² (50–70% lighter than solid aluminum)", "Exceptional flatness: ≤0.5mm over 1500mm", "Large-format up to 2000×6000mm", "Fire-rated A2-s1,d0", "Acoustic STC 28–35", "Thermal insulation", "100% recyclable"],
        technicalSpecs: [
            { label: "Face Sheet", value: "AA3003/5005, 0.5–1.0mm" },
            { label: "Core", value: "AA3003 hexagonal honeycomb" },
            { label: "Cell Size", value: "6 / 10 / 15 / 20mm" },
            { label: "Total Thickness", value: "10 / 15 / 20 / 25 / 50mm" },
            { label: "Max Panel", value: "2000 × 6000mm" },
            { label: "Weight", value: "4.5–6.0 kg/m²" },
            { label: "Fire Rating", value: "A2-s1,d0" },
            { label: "Acoustic STC", value: "28–35 dB" },
        ],
        surfaceOptions: [
            { name: "PVDF (on face)", description: "Premium fluorocarbon for exterior.", thickness: "25–40 μm", warranty: "25 year", suitableFor: ["Exterior facades", "Curtain wall infill"] },
            { name: "Powder Coating", description: "For interior applications.", thickness: "60–80 μm", warranty: "10–15 year", suitableFor: ["Wall panels", "Elevator lobbies", "Partitions"] },
            { name: "Stone Veneer Composite", description: "Thin stone bonded to honeycomb.", thickness: "5–8mm stone + honeycomb", warranty: "Project-specific", suitableFor: ["Luxury interiors", "Elevator cabs"] },
        ],
        standardSizes: [
            { label: "Standard 10mm", value: "1250×2500mm (0.5+9+0.5)" },
            { label: "Standard 20mm", value: "1500×3000mm (1.0+18+1.0)" },
            { label: "Large 25mm", value: "2000×6000mm (1.0+23+1.0)" },
        ],
        installationSteps: [
            { step: 1, title: "Subframe", description: "Install aluminum subframe, 1200–1500mm spacing." },
            { step: 2, title: "Bracket Fixing", description: "Attach concealed brackets using structural adhesive + mechanical fasteners." },
            { step: 3, title: "Panel Hanging", description: "Hang on Z-clip system — no visible fixings." },
            { step: 4, title: "Joint Treatment", description: "Open or sealed joints per design." },
        ],
        installationTips: ["Never drill through entire panel", "Use adhesive + mechanical fixings for brackets", "Edge sealing critical for exterior", "Handle edges carefully"],
        applications: [
            { type: "High-Rise Curtain Wall", whyUse: "Ultra-light reduces dead load on mullions.", recommendedProducts: ["20mm PVDF face"], keyBenefit: "50–70% lighter than solid panel" },
            { type: "Interior Feature Walls", whyUse: "Maximum flatness for premium finishes.", recommendedProducts: ["10mm powder coated or stone veneer"], keyBenefit: "Ultra-flat, luxury materials" },
        ],
        certifications: ["ISO 9001:2015", "CE (EN 13830)", "SGS", "AAMA 2605", "ASTM E84 Class A"],
        cadFiles: [{ name: "Honeycomb Section", format: "DWG", url: "#" }],
        bimFiles: [{ name: "Honeycomb System", format: "RVT", url: "#" }],
        specSheetUrl: "#",
    },

    "aluminum-ceiling-tile": {
        categorySlug: "aluminum-ceiling-tile",
        categoryName: "Aluminum Ceiling Tile",
        overview: "Modular aluminum ceiling panels in standard grid sizes (600×600, 300×600mm) for lay-in or clip-in suspended ceiling systems. Combines aluminum durability with modular grid practicality — the standard for commercial offices, hospitals, and clean environments.",
        keyFeatures: ["Standard modular sizes", "Lay-in or clip-in options", "Perforated acoustic options", "100% moisture-proof", "Light reflectance ≥80%", "Individual tile removable", "Recyclable"],
        technicalSpecs: [
            { label: "Material", value: "AA3003 / AA5005" },
            { label: "Thickness", value: "0.5 / 0.6 / 0.7 / 0.8mm" },
            { label: "Sizes", value: "300×300 / 300×600 / 600×600 / 600×1200mm" },
            { label: "Edge Profile", value: "Lay-in / Tegular / Clip-in" },
            { label: "Weight", value: "1.5–2.8 kg/m²" },
            { label: "Fire Rating", value: "A2-s1,d0" },
            { label: "NRC", value: "0.50 (perforated) / 0.70 (+ acoustic pad)" },
            { label: "Humidity", value: "Up to 100% RH" },
        ],
        surfaceOptions: [
            { name: "Powder Coating", description: "Standard RAL colors.", thickness: "60–80 μm", warranty: "10–15 year", suitableFor: ["Offices", "Schools", "Hospitals"] },
            { name: "Roller Coating (PE)", description: "Cost-effective for large projects.", thickness: "18–25 μm", warranty: "10 year", suitableFor: ["Large-area ceilings", "Budget projects"] },
            { name: "Perforated + Fleece", description: "Factory perforated with acoustic backing.", thickness: "1.5–2.5mm holes, 10–20% open", warranty: "Same as base", suitableFor: ["Open-plan offices", "Classrooms"] },
        ],
        standardSizes: [
            { label: "300×300mm", value: "0.5–0.6mm, lay-in or clip-in" },
            { label: "600×600mm", value: "0.6–0.8mm, most common" },
            { label: "600×1200mm", value: "0.7–0.8mm, lay-in or tegular" },
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
        certifications: ["ISO 9001:2015", "CE", "SGS", "ASTM E84 Class A", "EN 13964"],
        cadFiles: [{ name: "Grid Detail", format: "DWG", url: "#" }],
        bimFiles: [{ name: "Ceiling Tile System", format: "RVT", url: "#" }],
        specSheetUrl: "#",
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
            { name: "Anodized", description: "Metallic finish, durable.", thickness: "10–25 μm", warranty: "20+ year", suitableFor: ["Facade fins", "Screens", "Structural framing"] },
            { name: "Powder Coating", description: "Full RAL range.", thickness: "60–100 μm", warranty: "10–15 year", suitableFor: ["Color-matched facades", "Interior features"] },
            { name: "PVDF", description: "Premium exterior.", thickness: "25–40 μm", warranty: "25 year", suitableFor: ["Sun louvers", "Coastal environments"] },
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
            { type: "Sun Louvers", whyUse: "Solar shading while maintaining views.", recommendedProducts: ["50×100 PVDF"], keyBenefit: "40% solar heat reduction" },
            { type: "Decorative Screens", whyUse: "Semi-transparent privacy.", recommendedProducts: ["25×25 anodized"], keyBenefit: "Privacy + ventilation" },
        ],
        certifications: ["ISO 9001:2015", "CE", "SGS", "ASTM B221"],
        cadFiles: [{ name: "Section Library", format: "DWG", url: "#" }],
        bimFiles: [{ name: "Square Tube Family", format: "RVT", url: "#" }],
        specSheetUrl: "#",
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
            { label: "Fire Rating", value: "A2-s1,d0" },
        ],
        surfaceOptions: [
            { name: "PVDF", description: "Premium exterior, metallic/pearlescent.", thickness: "25–40 μm", warranty: "25 year", suitableFor: ["Exterior facades", "Coastal areas"] },
            { name: "Powder Coating", description: "Standard interior.", thickness: "60–80 μm", warranty: "10–15 year", suitableFor: ["Feature walls", "Retail", "Hospitality"] },
            { name: "Anodized", description: "Natural metallic enhancing light play.", thickness: "15–25 μm", warranty: "20+ year", suitableFor: ["Minimalist facades", "Interior accents"] },
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
        certifications: ["ISO 9001:2015", "CE", "SGS", "ASTM E84", "AAMA 2605"],
        cadFiles: [{ name: "Profile Library", format: "DWG", url: "#" }],
        bimFiles: [{ name: "Fluted Panel System", format: "RVT", url: "#" }],
        specSheetUrl: "#",
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
            { name: "Anodized", description: "Hard anodized for max abrasion resistance.", thickness: "10–20 μm", warranty: "Lifetime", suitableFor: ["Commercial offices", "Hotels", "High-traffic areas"] },
            { name: "Powder Coating", description: "Color-matched to wall/floor.", thickness: "60–80 μm", warranty: "15 year", suitableFor: ["Color-coordinated interiors", "Healthcare"] },
            { name: "Wood Grain Transfer", description: "Timber appearance.", thickness: "Film layer", warranty: "10 year", suitableFor: ["Residential", "Hospitality"] },
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
            { step: 2, title: "Mounting Rail (Clip-On)", description: "Screw rail to wall at 300mm centers." },
            { step: 3, title: "Fix Skirting", description: "Adhesive or mechanical fix. Press firmly." },
            { step: 4, title: "Corner Joints", description: "Use pre-formed 90° and 135° corner pieces." },
        ],
        installationTips: ["Ensure floor is level before starting", "Seal joints in wet areas", "Use pre-formed corners for clean joints", "Cut with fine-tooth blade"],
        applications: [
            { type: "Commercial Offices", whyUse: "Durable, clean lines, cable management.", recommendedProducts: ["Recessed 60mm anodized silver"], keyBenefit: "Professional finish, cable routing" },
            { type: "Hospitals", whyUse: "Hygienic, cleanable, impact resistant.", recommendedProducts: ["Flat 70mm powder coated"], keyBenefit: "Infection control, durability" },
        ],
        certifications: ["ISO 9001:2015", "CE", "SGS", "ASTM B221"],
        cadFiles: [{ name: "Skirting Profiles", format: "DWG", url: "#" }],
        bimFiles: [{ name: "Skirting Family", format: "RVT", url: "#" }],
        specSheetUrl: "#",
    },
};

/**
 * 获取品类 slug 列表（用于遍历）
 */
export function getCategorySlugs(): string[] {
    return Object.keys(productKnowledge);
}

/**
 * 获取品类知识（安全取值，返回 undefined 如果品类不存在）
 */
export function getKnowledge(slug: string): ProductKnowledge | undefined {
    return productKnowledge[slug];
}
