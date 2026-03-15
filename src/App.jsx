import { useState, useEffect } from "react";

// ── Constants ──────────────────────────────────────────────────────────────
const PHASES = ["Concept / FEED","Construction","Drilling","Operations","Maintenance","Decommissioning","Commissioning"];
const CONDITIONS = ["Normal","Abnormal","Emergency"];
const SENSITIVITIES = ["High","Medium","Low"];
const SCALES = ["Global","Regional","Local"];
const DURATIONS = ["Permanent (>10yr)","Long-term (1–10yr)","Temporary (<1yr)"];
const PROJ_TYPES = ["Offshore O&G","Onshore Infrastructure","Industrial / Process"];
const STATUSES = ["Open","In Progress","Controlled","Accepted","Closed"];
const OPP_TYPES = ["Resource Efficiency","Circular Economy","Low-Carbon Technology","Nature-Based Solutions","Green Finance & Taxonomy","New Business / Market","Reputational / SLO","Climate Resilience","Regulatory Incentive","Biodiversity Net Gain"];
const OPP_STATUSES = ["Open","In Progress","Implemented","Partially implemented","Deferred","Not feasible"];
const STORAGE_KEY = "env-toolkit-v3";

// ── EPCIC Guide Word Library ───────────────────────────────────────────────
const EPCIC_STAGES = [
  { code:"E",  label:"Engineering",          sub:"FEED & detail design" },
  { code:"P",  label:"Procurement",          sub:"Materials, chemicals, logistics" },
  { code:"C",  label:"Construction",         sub:"Civil, structural, mechanical" },
  { code:"I",  label:"Installation",         sub:"Offshore & marine operations" },
  { code:"C2", label:"Commissioning",        sub:"Pre-comm, start-up, first fill" },
  { code:"OM", label:"Operations & Maintenance", sub:"Beyond EPCIC — bonus" },
  { code:"D",  label:"Decommissioning",      sub:"Removal & reinstatement — bonus" },
];

const PHASE_MAP = { E:"Concept / FEED", P:"Construction", C:"Construction", I:"Operations", C2:"Commissioning", OM:"Operations", D:"Decommissioning" };
const COND_MAP  = { E:"Normal", P:"Normal", C:"Normal", I:"Normal", C2:"Abnormal", OM:"Normal", D:"Normal" };

const GW = {
  E: [
    { cat:"Site selection & footprint", color:"teal", items:[
      { kw:"Habitat sensitivity", q:"Are there designated areas (Natura 2000, RAMSAR, seabed habitats) within or adjacent to the project footprint?", aspect:"Land use change / habitat loss", area:"Site selection" },
      { kw:"Drainage & hydrology", q:"How will the site layout affect natural drainage paths, catchments, or groundwater recharge zones?", aspect:"Alteration of surface water drainage", area:"Site & drainage design" },
      { kw:"Floodplain encroachment", q:"Is any part of the facility sited within a 100-year or 200-year floodplain?", aspect:"Increased flood risk to third parties", area:"Site selection" },
      { kw:"Cultural heritage & archaeology", q:"Has a desk-based heritage assessment been completed? Are there known or probable buried assets within the development zone?", aspect:"Disturbance to buried archaeological remains", area:"Site selection" },
      { kw:"Visual impact & skyline", q:"Will the installation be visible from a national park, scenic area, or sensitive receptor? What is the assessment methodology?", aspect:"Visual intrusion / landscape character change", area:"Layout design" },
    ]},
    { cat:"Material & process design", color:"purple", items:[
      { kw:"Hazardous substance inventory", q:"What chemical inventory is required for the process? Are there substitution opportunities for CMR or PBT substances?", aspect:"Use of hazardous chemicals — spill / release risk", area:"Process design" },
      { kw:"Energy efficiency", q:"What is the estimated energy intensity (kWh/tonne product)? Have low-energy alternatives been assessed at FEED stage?", aspect:"Greenhouse gas emissions from facility energy use", area:"Process design" },
      { kw:"Fugitive emissions", q:"Which process streams have the highest fugitive VOC / methane potential? Is LDAR designed in from the start?", aspect:"Fugitive VOC / methane emissions to atmosphere", area:"Process design" },
      { kw:"Produced water design", q:"What is the estimated produced water volume, composition and treatment route? Is zero liquid discharge achievable?", aspect:"Produced water discharge to sea / ground", area:"Process design" },
      { kw:"Noise at boundaries", q:"What are the dominant noise sources in the design? Have boundary noise limits (Forurensningsloven, NORSOK S-002) been mapped at FEED?", aspect:"Noise exceeding boundary / community limits", area:"Engineering design" },
      { kw:"Waste hierarchy", q:"Has a waste minimisation assessment been carried out? Are waste streams designed for recyclability (EU WFD hierarchy)?", aspect:"Waste generation — construction and operational", area:"Engineering design" },
    ]},
    { cat:"Emissions & discharge design", color:"amber", items:[
      { kw:"Stack emissions", q:"What combustion and process stacks are included? Have dispersion modelling inputs been established against IED / Forurensningsloven limits?", aspect:"Air emissions — NOx, SO₂, PM, CO from combustion", area:"Engineering design" },
      { kw:"Thermal discharge", q:"If cooling water is used, what is the ΔT at the point of discharge and has a thermal plume model been run?", aspect:"Thermal pollution of receiving waterbody", area:"Process design" },
      { kw:"Stormwater quality", q:"What contaminants could be present in stormwater runoff from process areas, laydown yards, or access roads?", aspect:"Contaminated stormwater runoff to watercourse / sea", area:"Drainage design" },
    ]},
  ],
  P: [
    { cat:"Chemical & substance procurement", color:"red", items:[
      { kw:"REACH compliance", q:"Are all procured chemicals registered under REACH? Have substances of very high concern (SVHC) been screened out of the vendor list?", aspect:"Introduction of SVHC chemicals to site", area:"Procurement" },
      { kw:"Biocide use", q:"Are biocides (antifouling, hydrotesting biocides, MIC control) specified? Are they approved under EU BPR and OSPAR PLONOR lists?", aspect:"Biocide discharge — toxicity to marine organisms", area:"Chemical procurement" },
      { kw:"Refrigerants & blowing agents", q:"What refrigerants and insulation blowing agents are specified in HVAC and process equipment? Are high-GWP F-gases being used?", aspect:"Release of high-GWP refrigerants / F-gases", area:"Equipment procurement" },
      { kw:"Asbestos-containing materials", q:"Has a blanket prohibition on ACM been specified in procurement documents? Is the supply chain verified?", aspect:"Asbestos introduction to site via procured goods", area:"Procurement" },
      { kw:"Invasive species via equipment", q:"Could imported plant, aggregate or equipment introduce invasive plant species or aquatic organisms to the site?", aspect:"Introduction of non-native / invasive species", area:"Procurement" },
    ]},
    { cat:"Transport & logistics", color:"teal", items:[
      { kw:"Abnormal loads", q:"What abnormal loads are required? What route restrictions, community impact and sensitive receptor notifications are needed?", aspect:"Road traffic impacts — noise, dust, community disruption", area:"Logistics" },
      { kw:"Marine transport emissions", q:"Are vessels, barges or supply boats used for procurement logistics? Are IMO Tier III engines / scrubbers specified?", aspect:"Vessel exhaust emissions — NOx, SOx, PM (MARPOL Annex VI)", area:"Marine logistics" },
      { kw:"Port operations", q:"What environmental controls are specified at port laydown areas? Are spill kits, waste reception and stormwater controls required?", aspect:"Spills and waste from port / marshalling yard operations", area:"Logistics" },
      { kw:"Cold chain & refrigerated transport", q:"Are any temperature-controlled chemicals or biological agents required? What is the refrigerant specification and leak monitoring plan?", aspect:"Refrigerant leakage during transport", area:"Logistics" },
    ]},
    { cat:"Packaging & material waste", color:"gray", items:[
      { kw:"Packaging waste volumes", q:"What is the estimated packaging volume from procurement deliveries? Is a take-back or minimisation requirement in the contract?", aspect:"Waste generation — packaging (plastics, timber, metal)", area:"Procurement" },
      { kw:"Offcuts & material surplus", q:"What is the estimated surplus / scrap from fabricated items? Is there a contract requirement for reuse or recycling?", aspect:"Solid waste — fabrication offcuts and surplus material", area:"Procurement" },
    ]},
  ],
  C: [
    { cat:"Ground disturbance & earthworks", color:"amber", items:[
      { kw:"Bulk excavation", q:"What volumes of cut/fill are anticipated? Is there a contaminated land risk and what is the waste classification route for excavated material?", aspect:"Excavation of contaminated / hazardous ground material", area:"Earthworks" },
      { kw:"Dust generation", q:"What are the nearest dust-sensitive receptors? What suppression measures and trigger action levels (TALs) for PM10 are proposed?", aspect:"Fugitive dust (PM10/PM2.5) — nuisance & human health", area:"Earthworks" },
      { kw:"Ground vibration", q:"Are there vibration-sensitive structures, utilities or receptors within 100m of piling/blasting operations?", aspect:"Ground-borne vibration — structural damage / amenity", area:"Piling / foundation works" },
      { kw:"Soil erosion & sediment", q:"What is the rainfall erosivity and slope risk at the site? Are silt fences, settlement ponds and topsoil bunds designed in?", aspect:"Sediment runoff to watercourse during earthworks", area:"Earthworks" },
      { kw:"Dewatering", q:"What groundwater depths are anticipated? Where will dewatering discharge go and what are the suspended solids / contaminant limits?", aspect:"Contaminated dewatering discharge to surface water", area:"Earthworks / foundations" },
    ]},
    { cat:"Ecology & habitat", color:"green", items:[
      { kw:"Vegetation clearance", q:"What is the pre-clearance habitat survey status? Are there nesting birds, protected plants, or invertebrate features that require seasonal constraints?", aspect:"Loss or disturbance of protected / priority habitats", area:"Site preparation" },
      { kw:"Invasive plant species", q:"Are Japanese knotweed, Himalayan balsam or other invasive species present on or adjacent to the site? Is a management plan in place?", aspect:"Spread of invasive plant species via earthworks", area:"Site preparation / earthworks" },
      { kw:"Ecological connectivity", q:"Will construction sever wildlife corridors (hedgerows, streams, woodland edges)? Are underpasses or translocation zones specified?", aspect:"Severance of wildlife corridors", area:"Construction layout" },
    ]},
    { cat:"Water & drainage", color:"blue", items:[
      { kw:"Concrete washout", q:"Where will concrete washout take place? What containment prevents alkaline washout water (pH 11–13) entering drains or watercourses?", aspect:"Alkaline concrete washwater discharge to watercourse", area:"Concrete / civil works" },
      { kw:"Fuel & chemical storage", q:"Are bunded storage areas designed to 110% capacity? What secondary containment covers drains, berms and inspection regimes?", aspect:"Hydrocarbon / chemical spill from storage to ground / water", area:"Construction compound" },
      { kw:"Welfare facilities", q:"What is the sewage / grey water treatment route for construction camp welfare facilities? Is consent required?", aspect:"Untreated sewage discharge from construction welfare", area:"Construction compound" },
    ]},
    { cat:"Air, noise & light", color:"gray", items:[
      { kw:"Construction noise", q:"What are the dominant noise sources (piling, generators, concrete pumps)? What are hours of operation and community notification protocols?", aspect:"Construction noise — community amenity impact", area:"Construction activities" },
      { kw:"Diesel plant emissions", q:"What is the fleet composition (Stage V compliant?), operating hours and total NOx/PM load estimation?", aspect:"Diesel plant exhaust — NOx, PM to air", area:"Construction plant" },
      { kw:"Artificial light at night", q:"Are there light-sensitive receptors (bat roosts, seabird colonies, residential)? Is a lighting management plan in place?", aspect:"Light spill — disturbance to ecology / community", area:"Construction compound" },
      { kw:"Bonfire / burning", q:"Is any vegetation or waste burning proposed? What is the regulatory position and are there alternative disposal routes?", aspect:"Smoke / air pollution from on-site burning", area:"Waste management" },
    ]},
  ],
  I: [
    { cat:"Marine operations", color:"blue", items:[
      { kw:"Anchor handling & moorings", q:"Will anchors drag or be set over cable routes, protected seabed, or sensitive benthic habitats? What is the pre-lay survey status?", aspect:"Seabed disturbance from anchor handling / moorings", area:"Marine operations" },
      { kw:"Heavy lift & crane vessels", q:"What are the DP and thruster wash footprints of installation vessels? Could propwash disturb sensitive seabed or resuspend contaminants?", aspect:"Turbidity plume from vessel thruster wash", area:"Marine operations" },
      { kw:"Subsea pipeline / cable lay", q:"What pre-lay surveys have been completed? Are there unexploded ordnance (UXO) risks? How is trench spoil managed?", aspect:"Seabed disturbance / habitat loss from trenching", area:"Pipeline / cable installation" },
      { kw:"Jacket / structure installation", q:"Is pile driving into the seabed required? What are the underwater noise levels (SEL, peak SPL) and marine mammal mitigation protocols?", aspect:"Underwater noise from piling — marine mammal disturbance", area:"Foundation / jacket installation" },
    ]},
    { cat:"Marine ecology", color:"teal", items:[
      { kw:"Marine mammal protection", q:"Is an EIA and Marine Mammal Mitigation Protocol (MMMP) in place? Are PAM operators required?", aspect:"Disturbance / injury to marine mammals from noise / vessel", area:"All marine operations" },
      { kw:"Fish spawning & migration", q:"Are operations scheduled within known spawning or migration windows for commercially important species (cod, herring, salmon)?", aspect:"Disturbance to fish spawning / migration routes", area:"Marine operations scheduling" },
      { kw:"Coral & reef habitats", q:"Have cold-water coral or reef habitats been surveyed? Is a 500m exclusion zone or equivalent protection measure in place?", aspect:"Physical damage to cold-water coral / reef habitats", area:"Seabed operations" },
      { kw:"Invasive species ballast water", q:"Are all vessels compliant with IMO BWM Convention (D-2 standard)? Are treated ballast water discharge records maintained?", aspect:"Introduction of invasive species via ballast water discharge", area:"Vessel operations" },
    ]},
    { cat:"Vessel operations & discharges", color:"amber", items:[
      { kw:"Vessel fuel & lubricants", q:"What is the total fuel volume on mobilised vessels? What is the spill response plan for a worst-case diesel spill in the operational area?", aspect:"Hydrocarbon spill from vessel — marine pollution", area:"Vessel operations" },
      { kw:"Grey water & sewage at sea", q:"Are vessels compliant with MARPOL Annex IV? What is the 12-nm limit compliance approach for grey water discharge?", aspect:"Sewage / grey water discharge at sea (MARPOL IV)", area:"Vessel operations" },
      { kw:"Garbage & plastics at sea", q:"Is a Garbage Management Plan in place for all vessels per MARPOL Annex V? How is plastic waste logged and landed?", aspect:"Waste / plastic discharge at sea (MARPOL Annex V)", area:"Vessel operations" },
      { kw:"Antifouling coatings", q:"What antifouling specification is on installation vessels and structures? Are TBT and copper-based biocides within OSPAR limits?", aspect:"Biocide leaching from antifouling coatings", area:"Vessel / structure hull" },
      { kw:"Air emissions at sea", q:"What is the combined SOx/NOx emissions profile of the vessel fleet? Is the field within an MARPOL Annex VI ECA (Sulphur 0.1% zone)?", aspect:"Vessel air emissions — SOx, NOx, PM (MARPOL Annex VI)", area:"Vessel operations" },
    ]},
    { cat:"Emergency response", color:"red", items:[
      { kw:"Dropped objects at sea", q:"What is the dropped object risk envelope for lifting operations above the seabed? Are there subsea assets, pipelines or cables at risk?", aspect:"Dropped object — subsea infrastructure damage / pollution", area:"Lifting operations" },
      { kw:"Standby vessel emissions", q:"What is the on-standby fuel consumption of support vessels? Is slow steaming / hybrid propulsion specified to reduce idle emissions?", aspect:"Continuous vessel exhaust from standby operations", area:"Vessel operations" },
    ]},
  ],
  C2: [
    { cat:"First fill & chemical loading", color:"red", items:[
      { kw:"Hydrotest water", q:"What is the source of hydrotest water? What chemical additives (corrosion inhibitors, biocides, O2 scavengers) are used and what is the disposal route?", aspect:"Discharge of hydrotest water with chemical additives", area:"Commissioning — hydrotest" },
      { kw:"Chemical first fill", q:"What is the full chemical inventory for first fill (methanol, MEG, glycol, lube oils, corrosion inhibitors)? What is the volume and containment plan?", aspect:"Chemical spill / release during first fill operations", area:"Commissioning" },
      { kw:"Preservation fluids", q:"Are nitrogen blankets, desiccants or VCI films used during pre-commissioning? What is the waste disposal route?", aspect:"Waste from preservation materials / packaging", area:"Pre-commissioning" },
      { kw:"Catalyst loading", q:"Are catalysts (hydrotreating, reforming) loaded during commissioning? Are they classified as hazardous waste if recovered?", aspect:"Hazardous dust / spill from catalyst loading", area:"Commissioning" },
    ]},
    { cat:"Venting, flaring & purging", color:"amber", items:[
      { kw:"Vent gas composition", q:"What is the composition of vent gas during nitrogen purging and initial pressurisation? Are VOCs, H₂S or CO present?", aspect:"Fugitive / intentional VOC / H₂S release to atmosphere", area:"Commissioning — purging & testing" },
      { kw:"Flaring volumes", q:"What is the estimated total volume of gas to be flared during commissioning (cold flare, hot commissioning)? Has a flaring consent been obtained?", aspect:"GHG emissions from commissioning flaring", area:"Commissioning — flaring" },
      { kw:"Noise during testing", q:"Are relief valves, pressure safety valves or blow-down systems tested? What are the peak noise levels and receptor distances?", aspect:"Impulse noise from PSV testing / blowdown", area:"Commissioning — functional testing" },
    ]},
    { cat:"Drainage & waste streams", color:"blue", items:[
      { kw:"Flush & drain sequences", q:"What fluids will be drained during equipment flushing? Are they classified as hazardous waste and what is the tanker/disposal route?", aspect:"Hazardous waste generation from flush and drain operations", area:"Commissioning" },
      { kw:"Oily water from start-up", q:"What is the oily water volume during initial production start-up before treatment systems are fully online?", aspect:"Oily water discharge before treatment systems commissioned", area:"Start-up" },
      { kw:"Packaging & protective materials", q:"How will protective coatings, desiccants, nitrogen cylinders and mechanical protection materials be disposed of post-commissioning?", aspect:"Waste from commissioning packaging and protective systems", area:"Pre-commissioning / commissioning" },
    ]},
  ],
  OM: [
    { cat:"Routine operations & emissions", color:"teal", items:[
      { kw:"Produced water", q:"What is the continuous produced water rate, oil-in-water concentration and discharge point? Does it comply with OSPAR Decision 2001/1 / Forurensningsloven?", aspect:"Produced water discharge — hydrocarbons, chemicals, NORM", area:"Production operations" },
      { kw:"Flare & vent management", q:"What is the routine flaring rate (OGMP 2.0 Level 4/5 measurement)? Is an LDAR programme in place to minimise fugitive methane?", aspect:"Routine flaring and fugitive methane emissions", area:"Production operations" },
      { kw:"Cooling water discharge", q:"What is the cooling water flow rate, ΔT and biocide loading? What is the receiving water body designation?", aspect:"Thermal and biocide loading to receiving waterbody", area:"Utility systems" },
      { kw:"Atmospheric emissions", q:"What are the point source emissions (combustion turbines, diesel generators, process heaters)? Are they within consented limits?", aspect:"NOx, SOx, PM from combustion sources", area:"Production operations" },
    ]},
    { cat:"Maintenance activities", color:"purple", items:[
      { kw:"Tank cleaning", q:"What is the frequency and method for storage tank cleaning? What is the sludge classification and disposal route?", aspect:"Oily sludge waste from tank cleaning", area:"Maintenance" },
      { kw:"Chemical injection", q:"What is the full chemical injection matrix (scale inhibitors, corrosion inhibitors, demulsifiers, biocides)? Are they OSPAR PLONOR listed?", aspect:"Chemical injection — chronic low-level marine discharge", area:"Chemical injection systems" },
      { kw:"Painting & surface treatment", q:"Are VOC-containing paints or coatings used in maintenance? What are the annual solvent emissions and are they within consented limits?", aspect:"VOC emissions from maintenance painting", area:"Maintenance" },
      { kw:"Radioactive sources", q:"Are there radioactive sources (gauges, detectors) in process equipment? What is the inspection, loss prevention and waste management protocol?", aspect:"Radioactive source loss / mismanagement", area:"Instrumentation maintenance" },
    ]},
    { cat:"Spill & emergency scenarios", color:"red", items:[
      { kw:"Oil spill response", q:"What is the worst-case spill volume from the facility? Is an Oil Pollution Emergency Plan (OPEP) / OSR plan current and exercised?", aspect:"Major hydrocarbon spill to sea / ground", area:"Emergency response" },
      { kw:"Process upset", q:"What environmental consequence could result from a loss of containment (LWC, blowout, riser leak)? Has a QRA covered environmental receptors?", aspect:"Large-scale pollution from uncontrolled process release", area:"Process safety" },
      { kw:"Groundwater protection (onshore)", q:"Is there a groundwater monitoring programme? What are the trigger levels for spill / leak response?", aspect:"Hydrocarbon contamination of groundwater", area:"Facility integrity" },
    ]},
  ],
  D: [
    { cat:"Waste & hazardous material removal", color:"gray", items:[
      { kw:"Asbestos & legacy materials", q:"Has an asbestos register been completed? Is ACM removal scheduled before any structural demolition? What is the licensed disposal route?", aspect:"Asbestos fibre release during decommissioning", area:"Decommissioning" },
      { kw:"NORM", q:"What is the NORM inventory in scale, sludge and equipment? Does it exceed the 1 Bq/g threshold requiring regulated disposal?", aspect:"NORM contamination of waste streams and site", area:"Decommissioning" },
      { kw:"Subsea structure removal", q:"Is jacket removal full or partial (OSPAR 98/3)? What is the seabed footprint of cut piles, mattresses and scour protection?", aspect:"Seabed disturbance and waste from structure removal", area:"Offshore decommissioning" },
      { kw:"Chemical flushing & pigging", q:"What chemicals remain in pipelines and vessels? What is the flushing fluid composition, volume and disposal route?", aspect:"Hazardous flush waste from pipeline decommissioning", area:"Pipeline decommissioning" },
    ]},
    { cat:"Site restoration", color:"green", items:[
      { kw:"Land contamination survey", q:"Has a Phase II site investigation been completed? What remediation standard is required — residential, commercial or industrial?", aspect:"Residual land contamination — soil and groundwater", area:"Site remediation" },
      { kw:"Habitat reinstatement", q:"What is the post-decommissioning land use? Does it require ecological restoration to the pre-disturbance baseline or better?", aspect:"Failure to restore habitats to pre-disturbance condition", area:"Site reinstatement" },
      { kw:"Concrete demolition waste", q:"What volume of concrete arises from demolition? Can it be processed on-site for aggregate reuse (circular economy)?", aspect:"Demolition waste — concrete, steel, mixed waste", area:"Demolition" },
      { kw:"Seabed monitoring", q:"What post-removal seabed survey is required? What indicators confirm recovery of benthic communities?", aspect:"Residual seabed impact post-structure removal", area:"Offshore decommissioning" },
    ]},
    { cat:"Emissions during decommissioning", color:"amber", items:[
      { kw:"Gas blowdown", q:"How much gas is held in system at cessation? What is the blowdown volume, composition and GHG equivalent?", aspect:"GHG release from system blowdown at cessation", area:"Decommissioning" },
      { kw:"Demolition dust", q:"What are the dust-generating demolition activities and nearest receptors? Is wet demolition or misting required?", aspect:"Dust from structure demolition — PM10/PM2.5", area:"Demolition" },
      { kw:"Torch cutting / hot work", q:"What fume types arise from torch-cutting painted steelwork (lead, zinc, cadmium fumes)? What PPE and air monitoring is required?", aspect:"Toxic fumes from hot work on coated structures", area:"Demolition" },
    ]},
  ],
};

const COLOR_MAP = {
  teal:   { bg:"#e0f2f1", border:"#80cbc4", text:"#004d40", head:"#00695c" },
  purple: { bg:"#ede7f6", border:"#ce93d8", text:"#4527a0", head:"#6a1b9a" },
  amber:  { bg:"#fff8e1", border:"#ffe082", text:"#e65100", head:"#f57f17" },
  red:    { bg:"#ffebee", border:"#ef9a9a", text:"#b71c1c", head:"#c62828" },
  green:  { bg:"#e8f5e9", border:"#a5d6a7", text:"#1b5e20", head:"#2e7d52" },
  blue:   { bg:"#e3f2fd", border:"#90caf9", text:"#0d47a1", head:"#1565c0" },
  gray:   { bg:"#f5f5f5", border:"#cfd8dc", text:"#37474f", head:"#455a64" },
};

// ── Scoring ────────────────────────────────────────────────────────────────
function calcScore({ severity, probability, recSensitivity, scale, duration }) {
  if (!severity || !probability) return null;
  let s = severity * probability;
  if (recSensitivity === "High") s += 5; else if (recSensitivity === "Medium") s += 2;
  if (scale === "Global") s += 4; else if (scale === "Regional") s += 2;
  if (duration?.startsWith("Permanent")) s += 3; else if (duration?.startsWith("Long-term")) s += 1;
  return s;
}
function calcSig(a) {
  const score = calcScore(a); if (score === null) return null;
  if (a.legalThreshold === "Y" || a.stakeholderConcern === "Y" || score >= 12) return "SIGNIFICANT";
  if (score >= 8) return "WATCH"; return "Low";
}
function calcOppScore(o) { return (o.envValue||0)*(o.bizValue||0)*(o.feasibility||0); }

// ── Blank templates ────────────────────────────────────────────────────────
const emptyAspect = () => ({ phase:"", area:"", activity:"", aspect:"", condition:"Normal", impact:"", receptors:"", recSensitivity:"Medium", scale:"Local", severity:3, probability:3, duration:"Temporary (<1yr)", legalThreshold:"N", stakeholderConcern:"N", control:"", legalRef:"", owner:"", status:"Open" });
const emptyOpp    = () => ({ type:"", aspectRef:"", materiality:"Both", description:"", envBenefit:"", bizBenefit:"", envValue:2, bizValue:2, feasibility:2, action:"", alignment:"", owner:"", status:"Open" });
const newProject  = () => ({ id:Date.now().toString(), name:"", company:"", type:"", phase:"", createdAt:new Date().toISOString(), aspects:[], opps:[] });

// ── Styles ─────────────────────────────────────────────────────────────────
const iw = { width:"100%", boxSizing:"border-box" };
const CL = {
  green:  "#2e7d52", gBg:"#e8f5e9", gBd:"#a5d6a7",
  red:    "#c62828", rBg:"#ffebee", rBd:"#ef9a9a",
  amber:  "#f57f17", aBg:"#fff8e1", aBd:"#ffe082",
  purple: "#6a1b9a", pBg:"#ede7f6", pBd:"#ce93d8",
  blue:   "#1565c0", blueBg:"#e3f2fd", blueBd:"#90caf9",
  slate:  "#37474f", sBg:"#f5f5f5",  sBd:"#cfd8dc",
};

function sigStyle(sig) {
  const c = sig==="SIGNIFICANT"?{bg:CL.rBg,c:CL.red}:sig==="WATCH"?{bg:CL.aBg,c:CL.amber}:{bg:CL.gBg,c:CL.green};
  return { fontSize:11, padding:"2px 8px", borderRadius:4, fontWeight:600, display:"inline-block", background:c.bg, color:c.c };
}
function condStyle(c) {
  const col = c==="Emergency"?{bg:CL.rBg,c:CL.red}:c==="Abnormal"?{bg:CL.aBg,c:CL.amber}:{bg:CL.gBg,c:CL.green};
  return { fontSize:10, padding:"1px 6px", borderRadius:4, fontWeight:600, display:"inline-block", background:col.bg, color:col.c };
}

// ── Shared UI ──────────────────────────────────────────────────────────────
function Fld({ label, children, wide }) {
  return (
    <div style={wide?{gridColumn:"span 2"}:{}}>
      <label style={{fontSize:12,color:"#666",display:"block",marginBottom:4}}>{label}</label>
      {children}
    </div>
  );
}
function Card({ children, style }) {
  return <div style={{background:"#fff",borderRadius:10,border:"1px solid #e8e8e8",padding:"1.25rem",...style}}>{children}</div>;
}
function Btn({ children, onClick, variant="default", size="md", disabled }) {
  const v = {
    default:{background:"transparent",color:"#333",border:"1px solid #d0d0d0"},
    primary:{background:CL.green,color:"#fff",border:"none"},
    purple: {background:CL.purple,color:"#fff",border:"none"},
    danger: {background:"transparent",color:CL.red,border:`1px solid ${CL.rBd}`},
  }[variant];
  const s = {sm:{padding:"4px 10px",fontSize:12},md:{padding:"7px 16px",fontSize:13},lg:{padding:"9px 20px",fontSize:14}}[size];
  return <button onClick={onClick} disabled={disabled} style={{borderRadius:8,cursor:disabled?"not-allowed":"pointer",fontFamily:"inherit",fontWeight:500,opacity:disabled?0.5:1,...v,...s}}>{children}</button>;
}

// ── Aspect form ────────────────────────────────────────────────────────────
function AspectForm({ aspect, onSave, onCancel, compact=false }) {
  const [f,setF] = useState({...emptyAspect(),...aspect});
  const set = (k,v) => setF(p=>({...p,[k]:v}));
  const score = calcScore(f); const sig = calcSig(f);
  return (
    <div>
      {!compact && (
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:"1.25rem",paddingBottom:"1rem",borderBottom:"1px solid #eee"}}>
          <Btn onClick={onCancel}>← Back</Btn>
          <h2 style={{margin:0,fontSize:17,fontWeight:600}}>{aspect.id?"Edit aspect":"New aspect"}</h2>
          {aspect.ref && <span style={{color:CL.green,fontWeight:600,fontSize:13}}>{aspect.ref}</span>}
        </div>
      )}
      <Card style={{marginBottom:"1rem"}}>
        <p style={{fontSize:11,fontWeight:600,color:"#aaa",letterSpacing:"0.05em",margin:"0 0 12px",textTransform:"uppercase"}}>Activity details</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px 14px"}}>
          <Fld label="Phase"><select value={f.phase} onChange={e=>set("phase",e.target.value)} style={iw}><option value="">Select</option>{PHASES.map(p=><option key={p}>{p}</option>)}</select></Fld>
          <Fld label="Activity area"><input value={f.area} onChange={e=>set("area",e.target.value)} placeholder="e.g. Earthworks" style={iw}/></Fld>
          <Fld label="Specific activity" wide><input value={f.activity} onChange={e=>set("activity",e.target.value)} placeholder="Specific activity giving rise to the aspect" style={iw}/></Fld>
          <Fld label="Environmental aspect" wide><input value={f.aspect} onChange={e=>set("aspect",e.target.value)} placeholder="e.g. Fugitive dust generation (PM10/PM2.5)" style={iw}/></Fld>
          <Fld label="Condition"><select value={f.condition} onChange={e=>set("condition",e.target.value)} style={iw}>{CONDITIONS.map(c=><option key={c}>{c}</option>)}</select></Fld>
          <Fld label="Receptors affected"><input value={f.receptors} onChange={e=>set("receptors",e.target.value)} placeholder="e.g. Air · Human health · Ecology" style={iw}/></Fld>
          <Fld label="Potential environmental impact" wide><textarea value={f.impact} onChange={e=>set("impact",e.target.value)} rows={3} style={{...iw,resize:"vertical"}}/></Fld>
        </div>
      </Card>
      <Card style={{marginBottom:"1rem",background:"#fafffe",border:`1px solid ${CL.gBd}`}}>
        <p style={{fontSize:11,fontWeight:600,color:"#aaa",letterSpacing:"0.05em",margin:"0 0 12px",textTransform:"uppercase"}}>Significance scoring</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"10px 14px",marginBottom:10}}>
          <Fld label="Receptor sensitivity"><select value={f.recSensitivity} onChange={e=>set("recSensitivity",e.target.value)} style={iw}>{SENSITIVITIES.map(s=><option key={s}>{s}</option>)}</select></Fld>
          <Fld label="Scale"><select value={f.scale} onChange={e=>set("scale",e.target.value)} style={iw}>{SCALES.map(s=><option key={s}>{s}</option>)}</select></Fld>
          <Fld label="Duration"><select value={f.duration} onChange={e=>set("duration",e.target.value)} style={iw}>{DURATIONS.map(d=><option key={d}>{d}</option>)}</select></Fld>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"10px 14px"}}>
          <Fld label="Severity (1–5)"><input type="number" min={1} max={5} value={f.severity} onChange={e=>set("severity",Math.min(5,Math.max(1,+e.target.value||1)))} style={iw}/></Fld>
          <Fld label="Probability (1–5)"><input type="number" min={1} max={5} value={f.probability} onChange={e=>set("probability",Math.min(5,Math.max(1,+e.target.value||1)))} style={iw}/></Fld>
          <Fld label="Legal threshold"><select value={f.legalThreshold} onChange={e=>set("legalThreshold",e.target.value)} style={iw}><option>N</option><option>Y</option></select></Fld>
          <Fld label="Stakeholder concern"><select value={f.stakeholderConcern} onChange={e=>set("stakeholderConcern",e.target.value)} style={iw}><option>N</option><option>Y</option></select></Fld>
        </div>
        {score!==null && (
          <div style={{marginTop:12,paddingTop:10,borderTop:`1px solid ${CL.gBd}`,display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
            <span style={{fontSize:13,color:"#555"}}>Score: <strong style={{fontSize:18}}>{score}</strong></span>
            <span style={sigStyle(sig)}>{sig}</span>
            {f.legalThreshold==="Y" && <span style={{fontSize:11,color:CL.amber,fontWeight:500}}>Auto-flagged: legal threshold</span>}
            {f.stakeholderConcern==="Y" && <span style={{fontSize:11,color:CL.amber,fontWeight:500}}>Auto-flagged: stakeholder concern</span>}
          </div>
        )}
      </Card>
      <Card style={{marginBottom:"1rem"}}>
        <p style={{fontSize:11,fontWeight:600,color:"#aaa",letterSpacing:"0.05em",margin:"0 0 12px",textTransform:"uppercase"}}>Controls & management</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px 14px"}}>
          <Fld label="Key control measure" wide><textarea value={f.control} onChange={e=>set("control",e.target.value)} rows={3} style={{...iw,resize:"vertical"}}/></Fld>
          <Fld label="Legal / regulatory reference" wide><input value={f.legalRef} onChange={e=>set("legalRef",e.target.value)} placeholder="e.g. Forurensningsloven §7 · OSPAR" style={iw}/></Fld>
          <Fld label="Owner"><input value={f.owner} onChange={e=>set("owner",e.target.value)} placeholder="Name or role" style={iw}/></Fld>
          <Fld label="Status"><select value={f.status} onChange={e=>set("status",e.target.value)} style={iw}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select></Fld>
        </div>
      </Card>
      <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:"0.5rem"}}>
        <Btn onClick={onCancel}>Cancel</Btn>
        <Btn variant="primary" onClick={()=>onSave(f)}>{aspect.id?"Save changes":"Add to register"}</Btn>
      </div>
    </div>
  );
}

// ── Opp form ───────────────────────────────────────────────────────────────
function OppForm({ opp, aspects, onSave, onCancel }) {
  const [f,setF] = useState({...emptyOpp(),...opp});
  const set = (k,v) => setF(p=>({...p,[k]:v}));
  const score = calcOppScore(f);
  const sc = score>=18?{bg:"#e0f2f1",c:"#00695c"}:score>=9?{bg:CL.gBg,c:CL.green}:{bg:"#f5f5f5",c:"#999"};
  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:"1.25rem",paddingBottom:"1rem",borderBottom:"1px solid #eee"}}>
        <Btn onClick={onCancel}>← Back</Btn>
        <h2 style={{margin:0,fontSize:17,fontWeight:600}}>{opp.id?"Edit opportunity":"New opportunity"}</h2>
      </div>
      <Card style={{marginBottom:"1rem"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px 14px"}}>
          <Fld label="Opportunity type"><select value={f.type} onChange={e=>set("type",e.target.value)} style={iw}><option value="">Select type</option>{OPP_TYPES.map(t=><option key={t}>{t}</option>)}</select></Fld>
          <Fld label="Linked aspect (optional)"><select value={f.aspectRef} onChange={e=>set("aspectRef",e.target.value)} style={iw}><option value="">None</option>{aspects.map(a=><option key={a.id} value={a.ref}>{a.ref} — {(a.aspect||"").slice(0,40)}</option>)}</select></Fld>
          <Fld label="Materiality (CSRD)" wide><select value={f.materiality} onChange={e=>set("materiality",e.target.value)} style={iw}><option>Inside-out (positive impact on environment)</option><option>Outside-in (financial / business benefit)</option><option>Both</option></select></Fld>
          <Fld label="Opportunity description" wide><textarea value={f.description} onChange={e=>set("description",e.target.value)} rows={3} style={{...iw,resize:"vertical"}}/></Fld>
          <Fld label="Environmental benefit"><textarea value={f.envBenefit} onChange={e=>set("envBenefit",e.target.value)} rows={2} style={{...iw,resize:"vertical"}}/></Fld>
          <Fld label="Business / strategic benefit"><textarea value={f.bizBenefit} onChange={e=>set("bizBenefit",e.target.value)} rows={2} style={{...iw,resize:"vertical"}}/></Fld>
        </div>
      </Card>
      <Card style={{marginBottom:"1rem",background:"#f9f7ff",border:`1px solid ${CL.pBd}`}}>
        <p style={{fontSize:11,fontWeight:600,color:"#aaa",letterSpacing:"0.05em",margin:"0 0 12px",textTransform:"uppercase"}}>Priority score = env value × business value × feasibility (max 27)</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"10px 14px"}}>
          {[{k:"envValue",l:"Environmental value (1–3)"},{k:"bizValue",l:"Business value (1–3)"},{k:"feasibility",l:"Feasibility (1–3)"}].map(({k,l})=>(
            <Fld key={k} label={l}><input type="number" min={1} max={3} value={f[k]} onChange={e=>set(k,Math.min(3,Math.max(1,+e.target.value||1)))} style={iw}/></Fld>
          ))}
        </div>
        <div style={{marginTop:12,paddingTop:10,borderTop:`1px solid ${CL.pBd}`,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:13,color:"#555"}}>Score:</span>
          <span style={{fontSize:20,fontWeight:700,padding:"2px 14px",borderRadius:6,...sc}}>{score}</span>
          <span style={{fontSize:12,color:"#666"}}>{score>=18?"High priority — act now":score>=9?"Medium priority":"Low priority"}</span>
        </div>
      </Card>
      <Card style={{marginBottom:"1.5rem"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px 14px"}}>
          <Fld label="Key action" wide><textarea value={f.action} onChange={e=>set("action",e.target.value)} rows={2} style={{...iw,resize:"vertical"}}/></Fld>
          <Fld label="ESRS / framework alignment"><input value={f.alignment} onChange={e=>set("alignment",e.target.value)} placeholder="e.g. ESRS E1 · EU Taxonomy · SBTi" style={iw}/></Fld>
          <Fld label="Owner"><input value={f.owner} onChange={e=>set("owner",e.target.value)} placeholder="Name or role" style={iw}/></Fld>
          <Fld label="Status"><select value={f.status} onChange={e=>set("status",e.target.value)} style={iw}>{OPP_STATUSES.map(s=><option key={s}>{s}</option>)}</select></Fld>
        </div>
      </Card>
      <div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
        <Btn onClick={onCancel}>Cancel</Btn>
        <Btn variant="purple" onClick={()=>onSave(f)}>{opp.id?"Save changes":"Add opportunity"}</Btn>
      </div>
    </div>
  );
}

// ── AI Suggest ─────────────────────────────────────────────────────────────
function AIPanel({ project, onAdd }) {
  const [query,setQuery] = useState(""); const [loading,setLoading] = useState(false);
  const [results,setResults] = useState([]); const [error,setError] = useState("");
  const run = async () => {
    if (!query.trim()) return;
    setLoading(true); setError(""); setResults([]);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1200,system:`You are an expert environmental consultant for Norwegian engineering projects. Return ONLY a valid JSON array. Each object: phase (one of: ${PHASES.join(", ")}), area (max 60 chars), activity (max 80 chars), aspect (max 80 chars), condition (Normal|Abnormal|Emergency), impact (max 120 chars), receptors (max 80 chars), recSensitivity (High|Medium|Low), scale (Global|Regional|Local), severity (int 1-5), probability (int 1-5), duration (one of: ${DURATIONS.join(", ")}), legalThreshold (Y|N), control (max 120 chars), legalRef (max 80 chars). Return 4–6 aspects.`,messages:[{role:"user",content:`Project type: ${project.type||"not specified"}. Phase: ${project.phase||"not specified"}. Scenario: ${query}`}]})});
      const d = await res.json();
      const parsed = JSON.parse((d.content?.[0]?.text||"").trim());
      setResults(Array.isArray(parsed)?parsed:[]);
    } catch { setError("Could not fetch suggestions — check your connection and try again."); }
    setLoading(false);
  };
  return (
    <div style={{background:CL.pBg,border:`1px solid ${CL.pBd}`,borderRadius:10,padding:"1rem",marginBottom:"1rem"}}>
      <p style={{fontSize:13,fontWeight:600,color:CL.purple,margin:"0 0 4px"}}>AI aspect suggestion</p>
      <p style={{fontSize:12,color:"#666",margin:"0 0 10px"}}>Describe a project activity or scenario, e.g. "diesel pile driving near a coral reef during spring spawning season"</p>
      <div style={{display:"flex",gap:8,marginBottom:8}}>
        <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&run()} placeholder="Describe the activity or scenario..." style={{flex:1,boxSizing:"border-box"}}/>
        <Btn variant="purple" onClick={run} disabled={loading||!query.trim()}>{loading?"Thinking...":"Suggest →"}</Btn>
      </div>
      {error && <p style={{color:CL.red,fontSize:12,margin:"0 0 8px"}}>{error}</p>}
      {results.map((s,i)=>{
        const sig = calcSig(s);
        return (
          <div key={i} style={{background:"#fff",border:"1px solid #e0e0e0",borderRadius:8,padding:"10px 12px",marginBottom:6,display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:4,alignItems:"center"}}>
                <span style={{fontWeight:600,fontSize:13}}>{s.aspect}</span>
                <span style={condStyle(s.condition)}>{s.condition}</span>
                {sig && <span style={sigStyle(sig)}>{sig}</span>}
              </div>
              <p style={{fontSize:12,color:"#777",margin:"0 0 2px"}}>{s.phase}{s.area?` · ${s.area}`:""}</p>
              <p style={{fontSize:12,color:"#555",margin:0}}>{s.impact}</p>
              {s.legalRef && <p style={{fontSize:11,color:"#888",margin:"4px 0 0"}}>{s.legalRef}</p>}
            </div>
            <Btn size="sm" variant="primary" onClick={()=>{onAdd(s);setResults(p=>p.filter(x=>x!==s));}}>Add</Btn>
          </div>
        );
      })}
    </div>
  );
}

// ── Screening Tab ────────────────────────────────────────────────────
function ScreeningTab({ project, onAddAspect }) {
  const [activeStage, setActiveStage] = useState("E");
  const [expanded, setExpanded]       = useState({});
  const [form, setForm]               = useState(emptyAspect());
  const [screenMode, setScreenMode]   = useState("guide"); // "guide" | "form"
  const [saved, setSaved]             = useState(false);

  const toggleCat = (key) => setExpanded(p=>({...p,[key]:!p[key]}));

  const prefill = (stageCode, item) => {
    setForm({...emptyAspect(), phase:PHASE_MAP[stageCode]||"", area:item.area||"", aspect:item.aspect||"", condition:COND_MAP[stageCode]||"Normal"});
    setSaved(false);
    setScreenMode("form");
  };

  const setF = (k,v) => setForm(p=>({...p,[k]:v}));

  const saveToRegister = () => {
    if (!form.aspect.trim()) return;
    onAddAspect(form);
    setForm(emptyAspect());
    setSaved(true);
    setScreenMode("guide");
    setTimeout(()=>setSaved(false), 2500);
  };

  const score = calcScore(form); const sig = calcSig(form);
  const stageData = GW[activeStage]||[];

  return (
    <div style={{display:"flex",height:"calc(100vh - 120px)",minHeight:500}}>
      {/* Stage sidebar */}
      <div style={{width:190,flexShrink:0,borderRight:"1px solid #e8e8e8",background:"#fafafa",overflowY:"auto",padding:"0.75rem 0.5rem"}}>
        <p style={{fontSize:10,fontWeight:600,color:"#bbb",letterSpacing:"0.07em",textTransform:"uppercase",margin:"0 0.5rem 8px"}}>EPCIC Stage</p>
        {EPCIC_STAGES.map(s=>(
          <button key={s.code} onClick={()=>{setActiveStage(s.code);setScreenMode("guide");}} style={{width:"100%",textAlign:"left",padding:"8px 10px",borderRadius:8,marginBottom:2,border:activeStage===s.code?`1.5px solid ${CL.gBd}`:"1px solid transparent",cursor:"pointer",fontFamily:"inherit",background:activeStage===s.code?"#fff":"transparent"}}>
            <div style={{fontSize:12,fontWeight:activeStage===s.code?600:400,color:activeStage===s.code?"#1a1a1a":"#555"}}>{s.label}</div>
            <div style={{fontSize:10,color:"#aaa",marginTop:1}}>{s.sub}</div>
          </button>
        ))}
      </div>

      {/* Main area */}
      <div style={{flex:1,overflowY:"auto",padding:"1.25rem"}}>
        {saved && (
          <div style={{padding:"8px 14px",background:CL.gBg,border:`1px solid ${CL.gBd}`,borderRadius:8,marginBottom:"1rem",fontSize:13,color:CL.green,fontWeight:500}}>
            Aspect saved to register ✓
          </div>
        )}

        {screenMode === "guide" && (
          <>
            <div style={{marginBottom:"1rem",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
              <div>
                <h3 style={{fontSize:15,fontWeight:600,margin:"0 0 2px"}}>{EPCIC_STAGES.find(s=>s.code===activeStage)?.label} — guide words</h3>
                <p style={{fontSize:12,color:"#888",margin:0}}>Click "→ Use" on any prompt to pre-fill the screening form</p>
              </div>
              <Btn variant="primary" size="sm" onClick={()=>{setForm(emptyAspect());setScreenMode("form");}}>+ Blank form</Btn>
            </div>
            {stageData.map((section)=>{
              const col = COLOR_MAP[section.color]||COLOR_MAP.gray;
              const key = activeStage+section.cat;
              const open = expanded[key]!==false;
              return (
                <div key={key} style={{marginBottom:8,borderRadius:10,border:`1px solid ${col.border}`,overflow:"hidden"}}>
                  <button onClick={()=>toggleCat(key)} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",background:col.bg,border:"none",cursor:"pointer",fontFamily:"inherit"}}>
                    <span style={{fontSize:13,fontWeight:600,color:col.head}}>{section.cat}</span>
                    <span style={{fontSize:12,color:col.head,opacity:0.6}}>{open?"▲":"▼"}</span>
                  </button>
                  {open && (
                    <div style={{background:"#fff"}}>
                      {section.items.map((item,i)=>(
                        <div key={i} style={{padding:"10px 14px",borderTop:`1px solid ${col.border}`,display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12}}>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:12,fontWeight:600,color:col.head,marginBottom:4}}>{item.kw}</div>
                            <p style={{fontSize:12,color:"#555",margin:"0 0 5px",lineHeight:1.5}}>{item.q}</p>
                            <span style={{fontSize:11,padding:"1px 7px",borderRadius:3,background:col.bg,color:col.text,fontStyle:"italic"}}>Likely aspect: {item.aspect}</span>
                          </div>
                          <button onClick={()=>prefill(activeStage,item)} style={{padding:"5px 12px",fontSize:12,borderRadius:7,border:"none",background:col.head,color:"#fff",cursor:"pointer",fontFamily:"inherit",fontWeight:500,whiteSpace:"nowrap",flexShrink:0}}>→ Use</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}

        {screenMode === "form" && (
          <>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:"1rem"}}>
              <button onClick={()=>setScreenMode("guide")} style={{padding:"5px 12px",fontSize:12,borderRadius:7,border:"1px solid #ddd",background:"transparent",cursor:"pointer",fontFamily:"inherit"}}>← Back to guide words</button>
              <h3 style={{margin:0,fontSize:15,fontWeight:600}}>Screening form — {EPCIC_STAGES.find(s=>s.code===activeStage)?.label}</h3>
            </div>
            <Card style={{marginBottom:"1rem"}}>
              <p style={{fontSize:11,fontWeight:600,color:"#aaa",letterSpacing:"0.05em",margin:"0 0 12px",textTransform:"uppercase"}}>Activity details</p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px 14px"}}>
                <Fld label="Phase"><select value={form.phase} onChange={e=>setF("phase",e.target.value)} style={iw}><option value="">Select</option>{PHASES.map(p=><option key={p}>{p}</option>)}</select></Fld>
                <Fld label="Activity area"><input value={form.area} onChange={e=>setF("area",e.target.value)} placeholder="e.g. Earthworks, Marine operations" style={iw}/></Fld>
                <Fld label="Specific activity" wide><input value={form.activity} onChange={e=>setF("activity",e.target.value)} placeholder="Specific activity giving rise to the aspect" style={iw}/></Fld>
                <Fld label="Environmental aspect" wide><input value={form.aspect} onChange={e=>setF("aspect",e.target.value)} placeholder="e.g. Fugitive dust generation from excavation" style={iw}/></Fld>
                <Fld label="Condition"><select value={form.condition} onChange={e=>setF("condition",e.target.value)} style={iw}>{CONDITIONS.map(c=><option key={c}>{c}</option>)}</select></Fld>
                <Fld label="Receptors affected"><input value={form.receptors} onChange={e=>setF("receptors",e.target.value)} placeholder="e.g. Air · Human health · Ecology" style={iw}/></Fld>
                <Fld label="Potential environmental impact" wide><textarea value={form.impact} onChange={e=>setF("impact",e.target.value)} rows={3} style={{...iw,resize:"vertical"}}/></Fld>
              </div>
            </Card>
            <Card style={{marginBottom:"1rem",background:"#fafffe",border:`1px solid ${CL.gBd}`}}>
              <p style={{fontSize:11,fontWeight:600,color:"#aaa",letterSpacing:"0.05em",margin:"0 0 12px",textTransform:"uppercase"}}>Significance scoring</p>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"10px 14px",marginBottom:10}}>
                <Fld label="Receptor sensitivity"><select value={form.recSensitivity} onChange={e=>setF("recSensitivity",e.target.value)} style={iw}>{SENSITIVITIES.map(s=><option key={s}>{s}</option>)}</select></Fld>
                <Fld label="Scale"><select value={form.scale} onChange={e=>setF("scale",e.target.value)} style={iw}>{SCALES.map(s=><option key={s}>{s}</option>)}</select></Fld>
                <Fld label="Duration"><select value={form.duration} onChange={e=>setF("duration",e.target.value)} style={iw}>{DURATIONS.map(d=><option key={d}>{d}</option>)}</select></Fld>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"10px 14px"}}>
                <Fld label="Severity (1–5)"><input type="number" min={1} max={5} value={form.severity} onChange={e=>setF("severity",Math.min(5,Math.max(1,+e.target.value||1)))} style={iw}/></Fld>
                <Fld label="Probability (1–5)"><input type="number" min={1} max={5} value={form.probability} onChange={e=>setF("probability",Math.min(5,Math.max(1,+e.target.value||1)))} style={iw}/></Fld>
                <Fld label="Legal threshold"><select value={form.legalThreshold} onChange={e=>setF("legalThreshold",e.target.value)} style={iw}><option>N</option><option>Y</option></select></Fld>
                <Fld label="Stakeholder concern"><select value={form.stakeholderConcern} onChange={e=>setF("stakeholderConcern",e.target.value)} style={iw}><option>N</option><option>Y</option></select></Fld>
              </div>
              {score!==null && (
                <div style={{marginTop:12,paddingTop:10,borderTop:`1px solid ${CL.gBd}`,display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                  <span style={{fontSize:13,color:"#555"}}>Score: <strong style={{fontSize:18}}>{score}</strong></span>
                  <span style={sigStyle(sig)}>{sig}</span>
                  {form.legalThreshold==="Y" && <span style={{fontSize:11,color:CL.amber,fontWeight:500}}>Auto-flagged: legal threshold</span>}
                  {form.stakeholderConcern==="Y" && <span style={{fontSize:11,color:CL.amber,fontWeight:500}}>Auto-flagged: stakeholder concern</span>}
                </div>
              )}
            </Card>
            <Card style={{marginBottom:"1rem"}}>
              <p style={{fontSize:11,fontWeight:600,color:"#aaa",letterSpacing:"0.05em",margin:"0 0 12px",textTransform:"uppercase"}}>Controls & management</p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px 14px"}}>
                <Fld label="Key control measure" wide><textarea value={form.control} onChange={e=>setF("control",e.target.value)} rows={3} style={{...iw,resize:"vertical"}}/></Fld>
                <Fld label="Legal / regulatory reference" wide><input value={form.legalRef} onChange={e=>setF("legalRef",e.target.value)} placeholder="e.g. Forurensningsloven §7 · OSPAR" style={iw}/></Fld>
                <Fld label="Owner"><input value={form.owner} onChange={e=>setF("owner",e.target.value)} placeholder="Name or role" style={iw}/></Fld>
                <Fld label="Status"><select value={form.status} onChange={e=>setF("status",e.target.value)} style={iw}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select></Fld>
              </div>
            </Card>
            <div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
              <Btn onClick={()=>{setForm(emptyAspect());setSaved(false);}}>Clear</Btn>
              <button onClick={saveToRegister} disabled={!form.aspect.trim()} style={{padding:"7px 16px",borderRadius:8,border:"none",background:CL.green,color:"#fff",cursor:form.aspect.trim()?"pointer":"not-allowed",fontSize:13,fontFamily:"inherit",fontWeight:500,opacity:form.aspect.trim()?1:0.5}}>
                Save to aspects register →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Project View ───────────────────────────────────────────────────────────
function ProjectView({ project, onChange, onDelete }) {
  const [tab,setTab]               = useState("dashboard");
  const [editAspect,setEditAspect] = useState(null);
  const [editOpp,setEditOpp]       = useState(null);
  const [aiOpen,setAiOpen]         = useState(false);
  const [sigFilter,setSigFilter]   = useState("All");
  const [confirmDelete,setConfirmDelete] = useState(false);

  const aspects = project.aspects||[];
  const opps    = project.opps||[];
  const nextRef = (arr,pfx) => `${pfx}-${String(arr.length+1).padStart(3,"0")}`;

  const saveAspect = (a) => {
    const updated = a.id ? aspects.map(x=>x.id===a.id?a:x) : [...aspects,{...a,id:Date.now().toString(),ref:nextRef(aspects,"ASP")}];
    onChange({...project,aspects:updated}); setEditAspect(null);
  };
  const saveOpp = (o) => {
    const updated = o.id ? opps.map(x=>x.id===o.id?o:x) : [...opps,{...o,id:Date.now().toString(),ref:nextRef(opps,"OPP")}];
    onChange({...project,opps:updated}); setEditOpp(null);
  };

  const sigCount   = aspects.filter(a=>calcSig(a)==="SIGNIFICANT").length;
  const watchCount = aspects.filter(a=>calcSig(a)==="WATCH").length;
  const highOpps   = opps.filter(o=>calcOppScore(o)>=18).length;
  const filtered   = sigFilter==="All" ? aspects : aspects.filter(a=>calcSig(a)===sigFilter);

  if (editAspect!==null) return <div style={{padding:"1.5rem 1.25rem"}}><AspectForm aspect={editAspect} onSave={saveAspect} onCancel={()=>setEditAspect(null)}/></div>;
  if (editOpp!==null) return <div style={{padding:"1.5rem 1.25rem"}}><OppForm opp={editOpp} aspects={aspects} onSave={saveOpp} onCancel={()=>setEditOpp(null)}/></div>;

  const TABS = ["dashboard","screening","aspects","opportunities","settings"];

  return (
    <div style={{padding:"1.25rem"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1.25rem",flexWrap:"wrap",gap:8}}>
        <nav style={{display:"flex",gap:4,flexWrap:"wrap"}}>
          {TABS.map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{padding:"6px 14px",fontSize:13,borderRadius:8,cursor:"pointer",fontFamily:"inherit",fontWeight:tab===t?600:400,border:tab===t?`2px solid ${CL.green}`:"1px solid #ddd",background:tab===t?CL.gBg:"transparent",color:tab===t?CL.green:"#555"}}>
              {t==="screening"?"Screening":t.charAt(0).toUpperCase()+t.slice(1)}
            </button>
          ))}
        </nav>
        <div style={{display:"flex",gap:6}}>
          {project.type  && <span style={{fontSize:11,padding:"2px 8px",borderRadius:4,background:CL.sBg, color:CL.slate}}>{project.type}</span>}
          {project.phase && <span style={{fontSize:11,padding:"2px 8px",borderRadius:4,background:CL.blueBg,color:CL.blue}}>{project.phase}</span>}
        </div>
      </div>

      {/* DASHBOARD */}
      {tab==="dashboard" && (
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10,marginBottom:"1.5rem"}}>
            {[{l:"Total aspects",v:aspects.length,bg:CL.sBg,c:CL.slate,bd:CL.sBd},{l:"Significant",v:sigCount,bg:CL.rBg,c:CL.red,bd:CL.rBd},{l:"Watch",v:watchCount,bg:CL.aBg,c:CL.amber,bd:CL.aBd},{l:"Opportunities",v:opps.length,bg:CL.pBg,c:CL.purple,bd:CL.pBd},{l:"High priority",v:highOpps,bg:"#e0f2f1",c:"#00695c",bd:"#80cbc4"}].map(({l,v,bg,c,bd})=>(
              <div key={l} style={{background:bg,borderRadius:8,padding:"1rem",border:`1px solid ${bd}`}}>
                <p style={{fontSize:12,color:c,margin:"0 0 4px"}}>{l}</p>
                <p style={{fontSize:28,fontWeight:700,margin:0,color:c}}>{v}</p>
              </div>
            ))}
          </div>
          {sigCount>0 && (
            <div style={{background:CL.rBg,border:`1px solid ${CL.rBd}`,borderLeft:`4px solid ${CL.red}`,borderRadius:"0 8px 8px 0",padding:"1rem",marginBottom:"1rem"}}>
              <p style={{margin:"0 0 8px",fontWeight:600,fontSize:13,color:CL.red}}>Significant aspects requiring action ({sigCount})</p>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {aspects.filter(a=>calcSig(a)==="SIGNIFICANT").map(a=>(
                  <button key={a.id} onClick={()=>setEditAspect(a)} style={{fontSize:11,padding:"3px 10px",borderRadius:4,background:"#fff",color:CL.red,border:`1px solid ${CL.rBd}`,cursor:"pointer",fontFamily:"inherit"}}>{a.ref} — {(a.aspect||"").slice(0,45)}</button>
                ))}
              </div>
            </div>
          )}
          {aspects.length===0 && (
            <div style={{textAlign:"center",padding:"2.5rem",background:"#f8f8f8",borderRadius:10,color:"#aaa"}}>
              <p style={{margin:"0 0 6px",fontSize:14}}>No aspects identified yet.</p>
              <p style={{margin:"0 0 16px",fontSize:12}}>Use the Screening tab to identify aspects with guide words, or add one manually.</p>
              <div style={{display:"flex",gap:8,justifyContent:"center"}}>
                <Btn variant="primary" onClick={()=>setTab("screening")}>Open Screening</Btn>
                <Btn onClick={()=>setEditAspect(emptyAspect())}>+ Manual entry</Btn>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Screening */}
      {tab==="screening" && (
        <div style={{margin:"-1.25rem"}}>
          <ScreeningTab project={project} onAddAspect={(a)=>{saveAspect(a);}}/>
        </div>
      )}

      {/* ASPECTS */}
      {tab==="aspects" && (
        <div>
          <div style={{display:"flex",gap:8,marginBottom:"1rem",alignItems:"center",flexWrap:"wrap"}}>
            <Btn variant="primary" onClick={()=>setEditAspect(emptyAspect())}>+ Add aspect</Btn>
            <button onClick={()=>setAiOpen(v=>!v)} style={{padding:"7px 16px",fontSize:13,borderRadius:8,cursor:"pointer",fontFamily:"inherit",fontWeight:500,border:`1px solid ${CL.pBd}`,background:aiOpen?CL.pBg:"transparent",color:CL.purple}}>✦ AI suggest</button>
            <div style={{display:"flex",gap:4,marginLeft:"auto"}}>
              {["All","SIGNIFICANT","WATCH","Low"].map(f=>(
                <button key={f} onClick={()=>setSigFilter(f)} style={{padding:"4px 10px",fontSize:11,borderRadius:6,cursor:"pointer",fontFamily:"inherit",fontWeight:sigFilter===f?600:400,border:sigFilter===f?`2px solid ${CL.green}`:"1px solid #ddd",background:sigFilter===f?CL.gBg:"transparent",color:sigFilter===f?CL.green:"#666"}}>{f}</button>
              ))}
            </div>
          </div>
          {aiOpen && <AIPanel project={project} onAdd={s=>saveAspect({...emptyAspect(),...s,stakeholderConcern:"N"})}/>}
          {filtered.length===0
            ? <div style={{textAlign:"center",padding:"3rem",background:"#f8f8f8",borderRadius:10,color:"#aaa"}}>{aspects.length===0?"No aspects yet — use the Screening tab or add one manually.":`No aspects match "${sigFilter}".`}</div>
            : (
              <div style={{overflowX:"auto",borderRadius:10,border:"1px solid #e8e8e8"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                  <thead><tr style={{background:"#f5f5f5"}}>{["Ref","Phase","Aspect","Cond.","Impact / Receptor","Score","Significance","Status",""].map(h=><th key={h} style={{padding:"9px 10px",textAlign:"left",fontWeight:600,fontSize:11,color:"#777",borderBottom:"1px solid #e0e0e0",whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
                  <tbody>
                    {filtered.map((a,i)=>{
                      const score=calcScore(a); const sig=calcSig(a);
                      return (
                        <tr key={a.id} style={{borderBottom:"1px solid #f0f0f0",background:i%2===0?"#fff":"#fafafa"}}>
                          <td style={{padding:"9px 10px",fontWeight:600,color:CL.green,fontSize:12,whiteSpace:"nowrap"}}>{a.ref}</td>
                          <td style={{padding:"9px 10px"}}><span style={{fontSize:10,padding:"2px 6px",borderRadius:3,background:"#f0f0f0",color:"#555"}}>{a.phase||"—"}</span></td>
                          <td style={{padding:"9px 10px",maxWidth:180}}><div style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontWeight:500}} title={a.aspect}>{a.aspect||"—"}</div>{a.area&&<div style={{fontSize:11,color:"#888"}}>{a.area}</div>}</td>
                          <td style={{padding:"9px 10px"}}>{a.condition&&<span style={condStyle(a.condition)}>{a.condition}</span>}</td>
                          <td style={{padding:"9px 10px",maxWidth:200}}><div style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontSize:12}} title={a.impact}>{a.impact||"—"}</div>{a.receptors&&<div style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontSize:11,color:"#888"}}>{a.receptors}</div>}</td>
                          <td style={{padding:"9px 10px",textAlign:"center",fontWeight:700,fontSize:14}}>{score??<span style={{color:"#ccc"}}>—</span>}</td>
                          <td style={{padding:"9px 10px"}}>{sig?<span style={sigStyle(sig)}>{sig}</span>:<span style={{color:"#ccc"}}>—</span>}</td>
                          <td style={{padding:"9px 10px"}}><span style={{fontSize:10,padding:"2px 6px",borderRadius:3,background:"#f0f0f0",color:"#555"}}>{a.status}</span></td>
                          <td style={{padding:"9px 10px",whiteSpace:"nowrap"}}><Btn size="sm" onClick={()=>setEditAspect(a)}>Edit</Btn>{" "}<Btn size="sm" variant="danger" onClick={()=>onChange({...project,aspects:aspects.filter(x=>x.id!==a.id)})}>×</Btn></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          }
        </div>
      )}

      {/* OPPORTUNITIES */}
      {tab==="opportunities" && (
        <div>
          <div style={{display:"flex",gap:8,marginBottom:"1rem",alignItems:"center"}}>
            <Btn variant="purple" onClick={()=>setEditOpp(emptyOpp())}>+ Add opportunity</Btn>
            <span style={{marginLeft:"auto",fontSize:12,color:"#888"}}>{opps.length} opportunit{opps.length!==1?"ies":"y"}</span>
          </div>
          {opps.length===0
            ? <div style={{textAlign:"center",padding:"3rem",background:"#f8f8f8",borderRadius:10,color:"#aaa"}}><p style={{margin:"0 0 8px"}}>No opportunities tracked yet.</p><p style={{fontSize:12,margin:0,maxWidth:400,marginInline:"auto"}}>ISO 14001:2015 Cl.6.1.2 requires identifying both risks and opportunities — add one for each significant aspect with positive potential.</p></div>
            : (
              <div style={{display:"grid",gap:8}}>
                {opps.map((o)=>{
                  const score=calcOppScore(o);
                  const sc=score>=18?{bg:"#e0f2f1",c:"#00695c"}:score>=9?{bg:CL.gBg,c:CL.green}:{bg:CL.pBg,c:CL.purple};
                  const matC=o.materiality?.startsWith("Inside")?{bg:CL.gBg,c:CL.green}:o.materiality?.startsWith("Outside")?{bg:CL.blueBg,c:CL.blue}:{bg:CL.pBg,c:CL.purple};
                  return (
                    <Card key={o.id}>
                      <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"flex-start"}}>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:6,alignItems:"center"}}>
                            <span style={{fontWeight:700,fontSize:12,color:CL.purple}}>{o.ref}</span>
                            {o.type&&<span style={{fontSize:11,padding:"2px 8px",borderRadius:4,background:CL.pBg,color:CL.purple,fontWeight:600}}>{o.type}</span>}
                            {o.aspectRef&&<span style={{fontSize:11,padding:"2px 6px",borderRadius:4,background:CL.gBg,color:CL.green}}>{o.aspectRef}</span>}
                            {score>0&&<span style={{fontSize:11,padding:"2px 8px",borderRadius:4,fontWeight:600,...sc}}>Score {score}</span>}
                            {o.materiality&&<span style={{fontSize:10,padding:"2px 6px",borderRadius:4,...matC}}>{o.materiality.split(" (")[0]}</span>}
                          </div>
                          <p style={{fontSize:14,margin:"0 0 6px",fontWeight:500}}>{o.description||"(No description)"}</p>
                          {o.envBenefit&&<p style={{fontSize:12,color:CL.green,margin:"0 0 2px"}}>Env: {o.envBenefit}</p>}
                          {o.bizBenefit&&<p style={{fontSize:12,color:CL.blue,margin:"0 0 2px"}}>Business: {o.bizBenefit}</p>}
                          {o.action&&<p style={{fontSize:12,color:"#777",margin:"4px 0 0"}}>Action: {o.action}</p>}
                        </div>
                        <div style={{display:"flex",gap:4,flexShrink:0,flexDirection:"column",alignItems:"flex-end"}}>
                          <span style={{fontSize:10,padding:"2px 6px",borderRadius:3,background:"#f0f0f0",color:"#555"}}>{o.status}</span>
                          <div style={{display:"flex",gap:4}}><Btn size="sm" onClick={()=>setEditOpp(o)}>Edit</Btn><Btn size="sm" variant="danger" onClick={()=>onChange({...project,opps:opps.filter(x=>x.id!==o.id)})}>×</Btn></div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )
          }
        </div>
      )}

      {/* SETTINGS */}
      {tab==="settings" && (
        <div>
          <Card style={{marginBottom:"1rem"}}>
            <p style={{fontSize:14,fontWeight:600,margin:"0 0 1rem"}}>Project details</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px 16px"}}>
              {[{k:"name",l:"Project name"},{k:"company",l:"Company"}].map(({k,l})=>(
                <div key={k}><label style={{fontSize:12,color:"#666",display:"block",marginBottom:4}}>{l}</label><input value={project[k]||""} onChange={e=>onChange({...project,[k]:e.target.value})} placeholder={l} style={iw}/></div>
              ))}
              <div><label style={{fontSize:12,color:"#666",display:"block",marginBottom:4}}>Project type</label><select value={project.type||""} onChange={e=>onChange({...project,type:e.target.value})} style={iw}><option value="">Select type</option>{PROJ_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
              <div><label style={{fontSize:12,color:"#666",display:"block",marginBottom:4}}>Current phase</label><select value={project.phase||""} onChange={e=>onChange({...project,phase:e.target.value})} style={iw}><option value="">Select phase</option>{PHASES.map(p=><option key={p}>{p}</option>)}</select></div>
            </div>
          </Card>
          <div style={{padding:"1.25rem",borderRadius:10,background:CL.rBg,border:`1px solid ${CL.rBd}`}}>
            <p style={{fontWeight:600,fontSize:14,color:CL.red,margin:"0 0 6px"}}>Danger zone</p>
            <p style={{fontSize:13,color:"#666",margin:"0 0 12px"}}>Deleting this project permanently removes all its aspects and opportunities. This cannot be undone.</p>
            {!confirmDelete
              ? <Btn variant="danger" onClick={()=>setConfirmDelete(true)}>Delete project</Btn>
              : <div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:13,fontWeight:600,color:CL.red}}>Are you sure?</span><Btn variant="danger" onClick={onDelete}>Yes, delete permanently</Btn><Btn onClick={()=>setConfirmDelete(false)}>Cancel</Btn></div>
            }
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────────
function Sidebar({ projects, activeId, onSelect, onNew }) {
  return (
    <div style={{width:220,flexShrink:0,background:"#f9f9f9",borderRight:"1px solid #e8e8e8",display:"flex",flexDirection:"column",minHeight:"100vh"}}>
      <div style={{padding:"1.25rem 1rem 0.75rem",borderBottom:"1px solid #e8e8e8"}}>
        <p style={{fontSize:13,fontWeight:700,color:"#1a1a1a",margin:"0 0 2px"}}>Env Aspects Toolkit</p>
        <p style={{fontSize:11,color:"#aaa",margin:0}}>EPCIC · Norwegian engineering</p>
      </div>
      <div style={{padding:"0.75rem 0.5rem",flex:1,overflowY:"auto"}}>
        <p style={{fontSize:10,fontWeight:600,color:"#bbb",letterSpacing:"0.07em",textTransform:"uppercase",margin:"0 0.5rem 6px"}}>Projects ({projects.length})</p>
        {projects.length===0 && <p style={{fontSize:12,color:"#ccc",padding:"0 0.5rem",fontStyle:"italic"}}>No projects yet</p>}
        {projects.map(p=>{
          const sigC=(p.aspects||[]).filter(a=>calcSig(a)==="SIGNIFICANT").length;
          const isActive=p.id===activeId;
          return (
            <button key={p.id} onClick={()=>onSelect(p.id)} style={{width:"100%",textAlign:"left",padding:"9px 10px",borderRadius:8,marginBottom:2,border:isActive?`1.5px solid ${CL.gBd}`:"1px solid transparent",cursor:"pointer",fontFamily:"inherit",background:isActive?"#fff":"transparent",boxShadow:isActive?"0 1px 3px rgba(0,0,0,0.07)":undefined}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:6}}>
                <span style={{fontSize:13,fontWeight:isActive?600:400,color:isActive?"#1a1a1a":"#555",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                  {p.name||<span style={{color:"#ccc",fontStyle:"italic"}}>Unnamed project</span>}
                </span>
                {sigC>0 && <span style={{fontSize:10,fontWeight:700,padding:"1px 5px",borderRadius:3,background:CL.rBg,color:CL.red,flexShrink:0}}>{sigC}</span>}
              </div>
              <p style={{fontSize:11,color:"#aaa",margin:"2px 0 0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                {p.type||"No type set"} · {(p.aspects||[]).length} aspects
              </p>
            </button>
          );
        })}
      </div>
      <div style={{padding:"0.75rem",borderTop:"1px solid #e8e8e8"}}>
        <button onClick={onNew} style={{width:"100%",padding:"8px",borderRadius:8,border:`1px dashed ${CL.gBd}`,background:"transparent",color:CL.green,fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>+ New project</button>
      </div>
    </div>
  );
}

// ── Root App ───────────────────────────────────────────────────────────────
export default function App() {
  const [projects,setProjects] = useState([]);
  const [activeId,setActiveId] = useState(null);
  const [loaded,setLoaded]     = useState(false);

  useEffect(()=>{
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const d = JSON.parse(saved);
        if (d.projects?.length) { setProjects(d.projects); setActiveId(d.activeId||d.projects[0].id); }
      }
    } catch {}
    setLoaded(true);
  },[]);

  useEffect(()=>{
    if (!loaded) return;
    try { localStorage.setItem(STORAGE_KEY,JSON.stringify({projects,activeId})); } catch {}
  },[projects,activeId,loaded]);

  const createProject = () => {
    const p = newProject();
    setProjects(prev=>[...prev,p]);
    setActiveId(p.id);
  };

  const updateProject = (updated) => setProjects(prev=>prev.map(p=>p.id===updated.id?updated:p));
  const deleteProject = (id) => {
    const remaining = projects.filter(p=>p.id!==id);
    setProjects(remaining);
    setActiveId(remaining.length>0?remaining[remaining.length-1].id:null);
  };

  if (!loaded) return <div style={{padding:"2rem",fontSize:14,color:"#888"}}>Loading...</div>;

  const active = projects.find(p=>p.id===activeId)||null;

  return (
    <div style={{display:"flex",minHeight:"100vh",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",color:"#1a1a1a",background:"#fff"}}>
      <Sidebar projects={projects} activeId={activeId} onSelect={setActiveId} onNew={createProject}/>
      <div style={{flex:1,overflowX:"hidden"}}>
        {!active ? (
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100vh",gap:16,padding:"2rem"}}>
            <p style={{fontSize:36,margin:0}}>🌿</p>
            <p style={{fontSize:16,fontWeight:500,color:"#555",margin:0}}>No project selected</p>
            <p style={{fontSize:13,color:"#aaa",margin:0,textAlign:"center"}}>Create a new project to get started.</p>
            <button onClick={createProject} style={{padding:"9px 20px",borderRadius:8,border:"none",background:CL.green,color:"#fff",fontSize:14,fontWeight:500,cursor:"pointer",fontFamily:"inherit",marginTop:4}}>+ New project</button>
          </div>
        ) : (
          <div>
            <div style={{padding:"1.25rem 1.25rem 0.75rem",borderBottom:"1px solid #eee",display:"flex",alignItems:"baseline",gap:10}}>
              <h1 style={{fontSize:18,fontWeight:600,margin:0}}>{active.name||<span style={{color:"#bbb",fontStyle:"italic"}}>Unnamed project</span>}</h1>
              {active.company && <span style={{fontSize:13,color:"#888"}}>{active.company}</span>}
            </div>
            <ProjectView key={active.id} project={active} onChange={updateProject} onDelete={()=>deleteProject(active.id)}/>
          </div>
        )}
      </div>
    </div>
  );
}
