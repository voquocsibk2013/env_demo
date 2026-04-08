import { useState, useEffect } from "react";


// ── Constants ─────────────────────────────────────────────────────────────────
const PHASES        = ["Concept / FEED","Construction","Drilling","Operations","Maintenance","Decommissioning","Commissioning"];
const CONDITIONS    = ["Normal","Abnormal","Emergency"];
const SENSITIVITIES = ["High","Medium","Low"];
const SCALES        = ["Global","Regional","Local"];
const DURATIONS     = ["Permanent (>10yr)","Long-term (1-10yr)","Temporary (<1yr)"];
const PROJ_TYPES    = ["Offshore O&G","Onshore Infrastructure","Industrial / Process"];
const STATUSES      = ["Open","In Progress","Controlled","Accepted","Closed"];
const OPP_TYPES     = ["Resource Efficiency","Circular Economy","Low-Carbon Technology","Nature-Based Solutions","Green Finance & Taxonomy","New Business / Market","Reputational / SLO","Climate Resilience","Regulatory Incentive","Biodiversity Net Gain"];
const OPP_STATUSES  = ["Open","In Progress","Implemented","Partially implemented","Deferred","Not feasible"];
const STORAGE_KEY   = "env-toolkit-v4";

// ── EPCIC stages ──────────────────────────────────────────────────────────────
const EPCIC_STAGES = [
  { code:"E",  label:"Engineering",              sub:"FEED & detail design" },
  { code:"P",  label:"Procurement",              sub:"Materials, chemicals, logistics" },
  { code:"C",  label:"Construction",             sub:"Civil, structural, mechanical" },
  { code:"I",  label:"Installation",             sub:"Offshore & marine operations" },
  { code:"C2", label:"Commissioning",            sub:"Pre-comm, start-up, first fill" },
  { code:"OM", label:"Operations & Maintenance", sub:"Beyond EPCIC" },
  { code:"D",  label:"Decommissioning",          sub:"Removal & reinstatement" },
];
const PHASE_MAP = { E:"Concept / FEED", P:"Construction", C:"Construction", I:"Operations", C2:"Commissioning", OM:"Operations", D:"Decommissioning" };
const COND_MAP  = { E:"Normal", P:"Normal", C:"Normal", I:"Normal", C2:"Abnormal", OM:"Normal", D:"Normal" };

// ── Guide words — Risks ───────────────────────────────────────────────────────
const GW_RISK = {
  E:[
    { cat:"Site selection & footprint", color:"teal", items:[
      { kw:"Habitat sensitivity",          q:"Are there designated areas (Natura 2000, RAMSAR, seabed habitats) within or adjacent to the project footprint?",               aspect:"Land use change / habitat loss",                          area:"Site selection" },
      { kw:"Drainage & hydrology",         q:"How will the site layout affect natural drainage paths, catchments, or groundwater recharge zones?",                          aspect:"Alteration of surface water drainage",                    area:"Site & drainage design" },
      { kw:"Floodplain encroachment",      q:"Is any part of the facility sited within a 100-year or 200-year floodplain?",                                                  aspect:"Increased flood risk to third parties",                   area:"Site selection" },
      { kw:"Cultural heritage",            q:"Has a desk-based heritage assessment been completed? Are there known or probable buried assets within the development zone?", aspect:"Disturbance to buried archaeological remains",            area:"Site selection" },
      { kw:"Visual impact",                q:"Will the installation be visible from a national park, scenic area, or sensitive receptor?",                                  aspect:"Visual intrusion / landscape character change",           area:"Layout design" },
    ]},
    { cat:"Material & process design", color:"purple", items:[
      { kw:"Hazardous substance inventory",q:"What chemical inventory is required? Are there substitution opportunities for CMR or PBT substances?",                         aspect:"Use of hazardous chemicals - spill / release risk",        area:"Process design" },
      { kw:"Energy efficiency",            q:"What is the estimated energy intensity (kWh/tonne product)? Have low-energy alternatives been assessed at FEED?",             aspect:"GHG emissions from facility energy use",                  area:"Process design" },
      { kw:"Fugitive emissions",           q:"Which process streams have the highest fugitive VOC / methane potential? Is LDAR designed in from the start?",                aspect:"Fugitive VOC / methane emissions to atmosphere",          area:"Process design" },
      { kw:"Produced water design",        q:"What is the estimated produced water volume, composition and treatment route? Is zero liquid discharge achievable?",          aspect:"Produced water discharge to sea / ground",                area:"Process design" },
      { kw:"Noise at boundaries",          q:"Have boundary noise limits (Forurensningsloven, NORSOK S-002) been mapped at FEED stage?",                                    aspect:"Noise exceeding boundary / community limits",             area:"Engineering design" },
      { kw:"Waste hierarchy",              q:"Has a waste minimisation assessment been carried out? Are waste streams designed for recyclability (EU WFD)?",                aspect:"Waste generation - construction and operational",         area:"Engineering design" },
    ]},
    { cat:"Emissions & discharge design", color:"amber", items:[
      { kw:"Stack emissions",              q:"What combustion stacks are included? Have dispersion modelling inputs been set against IED / Forurensningsloven limits?",     aspect:"Air emissions - NOx, SO2, PM, CO from combustion",        area:"Engineering design" },
      { kw:"Thermal discharge",            q:"If cooling water is used, what is the delta-T at discharge? Has a thermal plume model been run?",                             aspect:"Thermal pollution of receiving waterbody",                area:"Process design" },
      { kw:"Stormwater quality",           q:"What contaminants could be in stormwater runoff from process areas, laydown yards, or access roads?",                        aspect:"Contaminated stormwater runoff to watercourse / sea",     area:"Drainage design" },
    ]},
  ],
  P:[
    { cat:"Chemical & substance procurement", color:"red", items:[
      { kw:"REACH compliance",              q:"Are all procured chemicals registered under REACH? Have SVHCs been screened out of the vendor list?",                        aspect:"Introduction of SVHC chemicals to site",                  area:"Procurement" },
      { kw:"Biocide use",                   q:"Are biocides specified? Are they approved under EU BPR and OSPAR PLONOR lists?",                                             aspect:"Biocide discharge - toxicity to marine organisms",         area:"Chemical procurement" },
      { kw:"Refrigerants & blowing agents", q:"What refrigerants are in HVAC / process equipment? Are high-GWP F-gases being used?",                                       aspect:"Release of high-GWP refrigerants / F-gases",              area:"Equipment procurement" },
      { kw:"Asbestos-containing materials", q:"Has a blanket prohibition on ACM been specified in procurement documents? Is the supply chain verified?",                   aspect:"Asbestos introduction to site via procured goods",         area:"Procurement" },
      { kw:"Invasive species via equipment",q:"Could imported plant, aggregate or equipment introduce invasive species or aquatic organisms?",                             aspect:"Introduction of non-native / invasive species",           area:"Procurement" },
    ]},
    { cat:"Transport & logistics", color:"teal", items:[
      { kw:"Abnormal loads",                q:"What abnormal loads are required? What route restrictions and community notifications are needed?",                          aspect:"Road traffic impacts - noise, dust, community disruption", area:"Logistics" },
      { kw:"Marine transport emissions",    q:"Are vessels / barges used for procurement? Are IMO Tier III engines / scrubbers specified?",                                aspect:"Vessel exhaust - NOx, SOx, PM (MARPOL Annex VI)",         area:"Marine logistics" },
      { kw:"Port operations",               q:"What environmental controls are specified at port laydown areas? Spill kits, waste reception, stormwater controls?",        aspect:"Spills and waste from port / marshalling operations",     area:"Logistics" },
    ]},
    { cat:"Packaging & material waste", color:"gray", items:[
      { kw:"Packaging waste volumes",       q:"What is the estimated packaging volume from deliveries? Is a take-back or minimisation requirement in the contract?",        aspect:"Waste - packaging (plastics, timber, metal)",              area:"Procurement" },
      { kw:"Offcuts & material surplus",    q:"What is the estimated surplus / scrap from fabricated items? Is there a contract requirement for reuse or recycling?",      aspect:"Solid waste - fabrication offcuts and surplus",            area:"Procurement" },
    ]},
  ],
  C:[
    { cat:"Ground disturbance & earthworks", color:"amber", items:[
      { kw:"Bulk excavation",               q:"What volumes of cut/fill? Is there contaminated land risk? What is the waste classification route for excavated material?",  aspect:"Excavation of contaminated / hazardous ground material",  area:"Earthworks" },
      { kw:"Dust generation",               q:"What are the nearest dust-sensitive receptors? What PM10 suppression measures and trigger action levels are proposed?",      aspect:"Fugitive dust (PM10/PM2.5) - nuisance & human health",    area:"Earthworks" },
      { kw:"Ground vibration",              q:"Are there vibration-sensitive structures or receptors within 100m of piling / blasting operations?",                        aspect:"Ground-borne vibration - structural damage / amenity",    area:"Piling / foundation works" },
      { kw:"Soil erosion & sediment",       q:"What is the rainfall erosivity and slope risk? Are silt fences, settlement ponds and topsoil bunds designed in?",           aspect:"Sediment runoff to watercourse during earthworks",        area:"Earthworks" },
      { kw:"Dewatering",                    q:"What groundwater depths are anticipated? Where will dewatering discharge go? What are the SS / contaminant limits?",         aspect:"Contaminated dewatering discharge to surface water",      area:"Earthworks / foundations" },
    ]},
    { cat:"Ecology & habitat", color:"green", items:[
      { kw:"Vegetation clearance",          q:"Pre-clearance habitat survey status? Nesting birds, protected plants, or invertebrate features requiring seasonal constraints?", aspect:"Loss or disturbance of protected / priority habitats", area:"Site preparation" },
      { kw:"Invasive plant species",        q:"Are Japanese knotweed, Himalayan balsam or other invasive species present? Is a management plan in place?",                 aspect:"Spread of invasive plant species via earthworks",         area:"Site preparation" },
      { kw:"Ecological connectivity",       q:"Will construction sever wildlife corridors (hedgerows, streams, woodland edges)? Are underpasses specified?",                aspect:"Severance of wildlife corridors",                         area:"Construction layout" },
    ]},
    { cat:"Water & drainage", color:"blue", items:[
      { kw:"Concrete washout",              q:"Where will concrete washout occur? What containment prevents alkaline washout water (pH 11-13) entering watercourses?",      aspect:"Alkaline concrete washwater discharge to watercourse",    area:"Concrete / civil works" },
      { kw:"Fuel & chemical storage",       q:"Are bunded storage areas designed to 110% capacity? What secondary containment and inspection regime is in place?",         aspect:"Hydrocarbon / chemical spill from storage to ground/water",area:"Construction compound" },
      { kw:"Welfare facilities",            q:"What is the sewage / grey water treatment route for construction welfare facilities? Is consent required?",                 aspect:"Untreated sewage discharge from construction welfare",    area:"Construction compound" },
    ]},
    { cat:"Air, noise & light", color:"gray", items:[
      { kw:"Construction noise",            q:"Dominant noise sources (piling, generators, pumps)? Hours of operation and community notification protocols?",               aspect:"Construction noise - community amenity impact",           area:"Construction activities" },
      { kw:"Diesel plant emissions",        q:"Fleet composition (Stage V compliant?), operating hours and total NOx/PM load estimate?",                                   aspect:"Diesel plant exhaust - NOx, PM to air",                   area:"Construction plant" },
      { kw:"Artificial light at night",     q:"Are there light-sensitive receptors (bat roosts, seabirds, residential)? Is a lighting management plan in place?",          aspect:"Light spill - disturbance to ecology / community",        area:"Construction compound" },
    ]},
  ],
  I:[
    { cat:"Marine operations", color:"blue", items:[
      { kw:"Anchor handling & moorings",    q:"Will anchors be set over cable routes, protected seabed, or sensitive benthic habitats? Pre-lay survey status?",            aspect:"Seabed disturbance from anchor handling / moorings",      area:"Marine operations" },
      { kw:"Heavy lift & crane vessels",    q:"What are the DP / thruster wash footprints? Could propwash disturb sensitive seabed or resuspend contaminants?",           aspect:"Turbidity plume from vessel thruster wash",               area:"Marine operations" },
      { kw:"Subsea pipeline / cable lay",   q:"Pre-lay surveys completed? UXO risk assessed? How is trench spoil managed?",                                                aspect:"Seabed disturbance / habitat loss from trenching",        area:"Pipeline / cable installation" },
      { kw:"Jacket / structure install",    q:"Is pile driving required? What are underwater noise levels (SEL, peak SPL) and marine mammal mitigation protocols?",       aspect:"Underwater noise from piling - marine mammal disturbance", area:"Foundation / jacket installation" },
    ]},
    { cat:"Marine ecology", color:"teal", items:[
      { kw:"Marine mammal protection",      q:"Is a Marine Mammal Mitigation Protocol (MMMP) in place? Are PAM operators required?",                                       aspect:"Disturbance / injury to marine mammals",                  area:"All marine operations" },
      { kw:"Fish spawning & migration",     q:"Are operations scheduled within known spawning or migration windows for cod, herring, or salmon?",                          aspect:"Disturbance to fish spawning / migration routes",         area:"Marine operations scheduling" },
      { kw:"Coral & reef habitats",         q:"Have cold-water coral or reef habitats been surveyed? Is a 500m exclusion zone in place?",                                  aspect:"Physical damage to cold-water coral / reef habitats",     area:"Seabed operations" },
      { kw:"Ballast water",                 q:"Are all vessels compliant with IMO BWM Convention (D-2 standard)? Are discharge records maintained?",                      aspect:"Introduction of invasive species via ballast water",      area:"Vessel operations" },
    ]},
    { cat:"Vessel operations & discharges", color:"amber", items:[
      { kw:"Vessel fuel & lubricants",      q:"Total fuel volume on vessels? Spill response plan for worst-case diesel spill in the operational area?",                    aspect:"Hydrocarbon spill from vessel - marine pollution",         area:"Vessel operations" },
      { kw:"Grey water & sewage at sea",    q:"Are vessels MARPOL Annex IV compliant? What is the 12-nm limit compliance approach for grey water discharge?",             aspect:"Sewage / grey water discharge at sea (MARPOL IV)",        area:"Vessel operations" },
      { kw:"Garbage & plastics at sea",     q:"Is a Garbage Management Plan in place per MARPOL Annex V? How is plastic waste logged and landed?",                        aspect:"Waste / plastic discharge at sea (MARPOL V)",             area:"Vessel operations" },
      { kw:"Air emissions at sea",          q:"Combined SOx/NOx profile of fleet? Is the field within a MARPOL Annex VI ECA (0.1% sulphur zone)?",                        aspect:"Vessel air emissions - SOx, NOx, PM (MARPOL VI)",         area:"Vessel operations" },
    ]},
    { cat:"Emergency response", color:"red", items:[
      { kw:"Dropped objects at sea",        q:"Dropped object risk envelope for lifting over seabed? Are subsea assets, pipelines or cables at risk?",                     aspect:"Dropped object - subsea infrastructure / pollution",      area:"Lifting operations" },
      { kw:"Standby vessel emissions",      q:"On-standby fuel consumption of support vessels? Is slow steaming / hybrid propulsion specified?",                           aspect:"Continuous exhaust from standby vessel operations",       area:"Vessel operations" },
    ]},
  ],
  C2:[
    { cat:"First fill & chemical loading", color:"red", items:[
      { kw:"Hydrotest water",               q:"Source of hydrotest water? Additives (corrosion inhibitors, biocides, O2 scavengers) used and disposal route?",             aspect:"Discharge of hydrotest water with chemical additives",    area:"Commissioning - hydrotest" },
      { kw:"Chemical first fill",           q:"Full inventory for first fill (methanol, MEG, glycol, lube oils)? Volume and containment plan?",                            aspect:"Chemical spill / release during first fill",              area:"Commissioning" },
      { kw:"Preservation fluids",           q:"Are nitrogen blankets, desiccants or VCI films used? What is the waste disposal route?",                                    aspect:"Waste from preservation materials / packaging",           area:"Pre-commissioning" },
      { kw:"Catalyst loading",              q:"Are catalysts loaded during commissioning? Are they classified as hazardous waste if recovered?",                           aspect:"Hazardous dust / spill from catalyst loading",            area:"Commissioning" },
    ]},
    { cat:"Venting, flaring & purging", color:"amber", items:[
      { kw:"Vent gas composition",          q:"Composition of vent gas during nitrogen purging / initial pressurisation? Are VOCs, H2S or CO present?",                   aspect:"Fugitive / intentional VOC / H2S release to atmosphere",  area:"Commissioning - purging" },
      { kw:"Flaring volumes",               q:"Estimated gas volume to be flared during commissioning? Has a flaring consent been obtained?",                              aspect:"GHG emissions from commissioning flaring",                area:"Commissioning - flaring" },
      { kw:"Noise during testing",          q:"Are PSVs or blow-down systems tested? What are peak noise levels and distances to receptors?",                              aspect:"Impulse noise from PSV testing / blowdown",               area:"Commissioning - functional testing" },
    ]},
    { cat:"Drainage & waste streams", color:"blue", items:[
      { kw:"Flush & drain sequences",       q:"What fluids will be drained during flushing? Are they hazardous waste? What is the tanker / disposal route?",               aspect:"Hazardous waste from flush and drain operations",         area:"Commissioning" },
      { kw:"Oily water from start-up",      q:"Oily water volume during initial start-up before treatment systems are fully online?",                                      aspect:"Oily water discharge before treatment systems commissioned",area:"Start-up" },
    ]},
  ],
  OM:[
    { cat:"Routine operations & emissions", color:"teal", items:[
      { kw:"Produced water",                q:"Continuous produced water rate, OiW concentration and discharge point? OSPAR Decision 2001/1 / Forurensningsloven compliance?", aspect:"Produced water discharge - hydrocarbons, chemicals, NORM", area:"Production operations" },
      { kw:"Flare & vent management",       q:"Routine flaring rate (OGMP 2.0 Level 4/5)? Is an LDAR programme in place for fugitive methane?",                            aspect:"Routine flaring and fugitive methane emissions",          area:"Production operations" },
      { kw:"Cooling water discharge",       q:"Cooling water flow rate, delta-T and biocide loading? What is the receiving water body designation?",                       aspect:"Thermal and biocide loading to receiving waterbody",      area:"Utility systems" },
      { kw:"Atmospheric emissions",         q:"Point source emissions (turbines, generators, heaters)? Are they within consented limits?",                                 aspect:"NOx, SOx, PM from combustion sources",                    area:"Production operations" },
    ]},
    { cat:"Maintenance activities", color:"purple", items:[
      { kw:"Tank cleaning",                 q:"Frequency and method for tank cleaning? Sludge classification and disposal route?",                                          aspect:"Oily sludge waste from tank cleaning",                    area:"Maintenance" },
      { kw:"Chemical injection",            q:"Full chemical injection matrix (scale inhibitors, corrosion inhibitors, demulsifiers, biocides)? OSPAR PLONOR listed?",    aspect:"Chemical injection - chronic low-level marine discharge",  area:"Chemical injection systems" },
      { kw:"Painting & surface treatment",  q:"Are VOC-containing paints used in maintenance? Annual solvent emissions vs. consented limits?",                             aspect:"VOC emissions from maintenance painting",                 area:"Maintenance" },
      { kw:"Radioactive sources",           q:"Radioactive sources in process equipment? Inspection, loss prevention and waste management protocol?",                      aspect:"Radioactive source loss / mismanagement",                 area:"Instrumentation maintenance" },
    ]},
    { cat:"Spill & emergency scenarios", color:"red", items:[
      { kw:"Oil spill response",            q:"Worst-case spill volume? Is an OPEP / OSR plan current and exercised?",                                                     aspect:"Major hydrocarbon spill to sea / ground",                 area:"Emergency response" },
      { kw:"Process upset",                 q:"Environmental consequence from loss of containment (LWC, blowout, riser leak)? Has QRA covered environmental receptors?",  aspect:"Large-scale pollution from uncontrolled process release",  area:"Process safety" },
      { kw:"Groundwater protection",        q:"Is there a groundwater monitoring programme (onshore)? What are the trigger levels for spill / leak response?",            aspect:"Hydrocarbon contamination of groundwater",                area:"Facility integrity" },
    ]},
  ],
  D:[
    { cat:"Waste & hazardous material removal", color:"gray", items:[
      { kw:"Asbestos & legacy materials",   q:"Has an asbestos register been completed? Is ACM removal scheduled before structural demolition? Licensed disposal route?",  aspect:"Asbestos fibre release during decommissioning",           area:"Decommissioning" },
      { kw:"NORM",                          q:"NORM inventory in scale, sludge and equipment? Does it exceed the 1 Bq/g threshold requiring regulated disposal?",         aspect:"NORM contamination of waste streams and site",            area:"Decommissioning" },
      { kw:"Subsea structure removal",      q:"Jacket removal full or partial (OSPAR 98/3)? Seabed footprint of cut piles, mattresses and scour protection?",             aspect:"Seabed disturbance and waste from structure removal",     area:"Offshore decommissioning" },
      { kw:"Chemical flushing & pigging",   q:"Chemicals remaining in pipelines / vessels? Flushing fluid composition, volume and disposal route?",                       aspect:"Hazardous flush waste from pipeline decommissioning",     area:"Pipeline decommissioning" },
    ]},
    { cat:"Site restoration", color:"green", items:[
      { kw:"Land contamination survey",     q:"Has a Phase II site investigation been completed? What remediation standard is required?",                                   aspect:"Residual land contamination - soil and groundwater",      area:"Site remediation" },
      { kw:"Habitat reinstatement",         q:"Post-decommissioning land use? Does it require ecological restoration to the pre-disturbance baseline or better?",         aspect:"Failure to restore habitats to pre-disturbance condition",area:"Site reinstatement" },
      { kw:"Concrete demolition waste",     q:"Volume of concrete from demolition? Can it be processed on-site for aggregate reuse (circular economy)?",                  aspect:"Demolition waste - concrete, steel, mixed waste",         area:"Demolition" },
    ]},
    { cat:"Emissions during decommissioning", color:"amber", items:[
      { kw:"Gas blowdown",                  q:"Gas held in system at cessation? Blowdown volume, composition and GHG equivalent?",                                         aspect:"GHG release from system blowdown at cessation",           area:"Decommissioning" },
      { kw:"Demolition dust",               q:"Dust-generating demolition activities and nearest receptors? Is wet demolition or misting required?",                       aspect:"Dust from structure demolition - PM10/PM2.5",             area:"Demolition" },
      { kw:"Torch cutting / hot work",      q:"Fume types from torch-cutting painted steelwork (lead, zinc, cadmium)? PPE and air monitoring required?",                  aspect:"Toxic fumes from hot work on coated structures",          area:"Demolition" },
    ]},
  ],
};

// ── Guide words — Opportunities ───────────────────────────────────────────────
const GW_OPP = {
  E:[
    { cat:"Design for circularity", color:"teal", items:[
      { kw:"Modular / demountable design",  q:"Can structural elements, modules or equipment be designed for disassembly and reuse at end of project life?",               opp:"Circular economy - design for disassembly and reuse",           area:"Engineering design" },
      { kw:"Material efficiency at FEED",   q:"Can material volumes be reduced through optimised structural design, shared infrastructure, or prefabrication?",            opp:"Resource efficiency - material reduction at source",            area:"Engineering design" },
      { kw:"Renewable energy integration",  q:"Is there scope to integrate solar, wind or waste-heat recovery into the facility design at FEED stage?",                    opp:"Low-carbon technology - on-site renewable energy generation",   area:"Process design" },
      { kw:"Heat recovery / WHR",           q:"Are there process streams with significant waste heat that could be captured for power generation or heating?",             opp:"Resource efficiency - waste heat recovery",                     area:"Process design" },
    ]},
    { cat:"Nature & biodiversity by design", color:"green", items:[
      { kw:"Biodiversity net gain target",  q:"Can the facility deliver measurable BNG - green roofs, habitat corridors, artificial reefs?",                               opp:"Biodiversity net gain - habitat creation or enhancement",       area:"Site design" },
      { kw:"Nature-based drainage",         q:"Can SuDS, wetlands or bioswales replace hard engineered drainage?",                                                         opp:"Nature-based solutions - SuDS and natural flood management",    area:"Drainage design" },
    ]},
    { cat:"Green finance & taxonomy", color:"purple", items:[
      { kw:"EU Taxonomy alignment at FEED", q:"Which activities in the design qualify as substantially contributing to climate mitigation under EU Taxonomy?",             opp:"Green Finance & Taxonomy - EU Taxonomy-aligned project elements",area:"Engineering design" },
      { kw:"Green bonds / SLL finance",     q:"Can project finance be structured as green bonds or sustainability-linked loans tied to environmental KPI targets?",        opp:"Green Finance & Taxonomy - green bond or sustainability-linked loan", area:"Project finance" },
    ]},
  ],
  P:[
    { cat:"Sustainable procurement", color:"teal", items:[
      { kw:"Low-carbon materials spec",     q:"Can the procurement spec require EPDs and low-embodied-carbon materials (recycled steel, low-carbon concrete)?",             opp:"Low-carbon technology - low-embodied-carbon materials procurement",area:"Procurement" },
      { kw:"Circular supplier requirements",q:"Can suppliers be required to take back packaging, surplus or end-of-life equipment?",                                       opp:"Circular economy - supplier take-back and packaging reduction",  area:"Procurement" },
    ]},
    { cat:"Supply chain emissions", color:"amber", items:[
      { kw:"Low-emission logistics",        q:"Can low-emission transport (rail, LNG vessels, electric HGVs) be specified in logistics contracts?",                        opp:"Low-carbon technology - low-emission transport in supply chain", area:"Logistics" },
      { kw:"Local sourcing",                q:"Can materials and services be sourced locally or regionally to reduce transport emissions and support local economy?",      opp:"Resource efficiency - local sourcing reduces transport GHG",     area:"Procurement" },
    ]},
  ],
  C:[
    { cat:"Waste minimisation & circular economy", color:"teal", items:[
      { kw:"On-site concrete recycling",    q:"Can demolished or surplus concrete be crushed and reused as recycled aggregate on-site?",                                    opp:"Circular economy - on-site concrete aggregate recycling",       area:"Demolition / civil works" },
      { kw:"Construction waste exchange",   q:"Can surplus materials (timber, steel offcuts, cabling) be offered to a materials exchange or social enterprise?",          opp:"Circular economy - materials exchange / reuse of surplus",      area:"Construction compound" },
    ]},
    { cat:"Ecology enhancement", color:"green", items:[
      { kw:"Habitat creation during construction",q:"Can topsoil be stored and reused, and habitat features be created as part of the construction scope?",               opp:"Biodiversity net gain - habitat creation during construction",  area:"Site preparation" },
      { kw:"Invasive species eradication",  q:"Can clearance works provide an opportunity to permanently remove invasive plant species from the site?",                    opp:"Biodiversity net gain - invasive species eradication",          area:"Site preparation" },
    ]},
    { cat:"Low-carbon construction", color:"amber", items:[
      { kw:"Stage V / zero-emission plant", q:"Can the construction plant fleet be specified as Stage V diesel or battery / hydrogen electric?",                           opp:"Low-carbon technology - zero-emission construction plant",      area:"Construction plant" },
      { kw:"Renewable site power",          q:"Can solar panels, battery storage or grid connections replace diesel generators for site power?",                           opp:"Low-carbon technology - renewable site power during construction",area:"Construction compound" },
    ]},
  ],
  I:[
    { cat:"Marine ecology enhancement", color:"teal", items:[
      { kw:"Artificial reef / habitat",     q:"Could jacket legs, scour protection or cable burial create habitat for fish, corals or invertebrates?",                     opp:"Biodiversity net gain - artificial reef / marine habitat creation",area:"Structure installation" },
      { kw:"Marine protected area benefit", q:"Could exclusion zones create de facto MPAs, benefiting fish stocks and biodiversity?",                                      opp:"Nature-based solutions - de facto MPA / marine reserve benefit",area:"Marine operations" },
    ]},
    { cat:"Low-carbon vessel operations", color:"green", items:[
      { kw:"Shore power / hybrid vessels",  q:"Can installation vessels use shore power at port, hybrid propulsion or LNG / methanol fuel?",                               opp:"Low-carbon technology - low-emission installation vessels",     area:"Vessel operations" },
      { kw:"Voyage optimisation",           q:"Can route planning, weather routing and slow steaming minimise fuel consumption across the campaign?",                      opp:"Resource efficiency - fuel savings from voyage optimisation",   area:"Marine logistics" },
    ]},
    { cat:"Regulatory incentives", color:"purple", items:[
      { kw:"Norwegian O&G incentives",      q:"Are there Norwegian government or Enova grant schemes available for low-carbon offshore installation?",                     opp:"Regulatory incentive - Norwegian Enova / state grant for low-carbon ops",area:"Project finance" },
    ]},
  ],
  C2:[
    { cat:"Chemical & water efficiency", color:"teal", items:[
      { kw:"Hydrotest water reuse",         q:"Can hydrotest water be reused across multiple systems or treated and re-injected?",                                          opp:"Resource efficiency - hydrotest water recycling",               area:"Commissioning - hydrotest" },
      { kw:"Chemical substitution",         q:"Can less hazardous alternatives replace standard commissioning chemicals?",                                                 opp:"Resource efficiency - hazardous chemical substitution",         area:"Chemical management" },
    ]},
    { cat:"Flaring minimisation", color:"amber", items:[
      { kw:"Gas capture during start-up",   q:"Can commissioning gas be captured for on-site power generation rather than flared?",                                        opp:"Low-carbon technology - gas capture instead of flaring",        area:"Commissioning - flaring" },
      { kw:"Cold commissioning priority",   q:"Can the commissioning sequence be optimised to maximise cold commissioning and minimise hot flaring volumes?",              opp:"Resource efficiency - reduced commissioning flare volumes",      area:"Commissioning sequence" },
    ]},
  ],
  OM:[
    { cat:"Operational efficiency & carbon", color:"teal", items:[
      { kw:"Electrification of offshore",   q:"Can gas turbines be replaced or supplemented by grid power or renewable energy to reduce operational emissions?",           opp:"Low-carbon technology - offshore electrification / power from shore",area:"Power systems" },
      { kw:"CCUS opportunity",              q:"Is there scope to capture and store CO2 from process operations, contributing to Norwegian CCS targets?",                  opp:"Low-carbon technology - carbon capture, utilisation and storage",area:"Process design" },
      { kw:"Methane monetisation",          q:"Can vented or flared methane be recovered and sold, generating revenue while reducing GHG emissions?",                      opp:"Resource efficiency - methane recovery and monetisation",       area:"Production operations" },
      { kw:"Produced water as a resource",  q:"Can treated produced water be beneficially reused for injection, dust suppression or other uses?",                         opp:"Circular economy - produced water beneficial reuse",            area:"Water treatment" },
    ]},
    { cat:"Sustainability reporting", color:"purple", items:[
      { kw:"CSRD / ESRS reporting",         q:"Can environmental KPI data be structured to directly support CSRD ESRS E1-E5 mandatory disclosures?",                        opp:"Reputational / SLO - CSRD / ESRS reporting-ready KPI framework",area:"Sustainability reporting" },
      { kw:"SBTi / net zero alignment",     q:"Can emission reduction measures be aligned with Science Based Targets (SBTi) to support net-zero commitments?",             opp:"Reputational / SLO - SBTi / net-zero target alignment",         area:"GHG management" },
    ]},
    { cat:"Climate resilience", color:"amber", items:[
      { kw:"Climate risk assessment",       q:"Has a TCFD-aligned physical climate risk assessment been carried out for 2050+ scenarios?",                                  opp:"Climate resilience - physical climate risk adaptation measures", area:"Asset integrity" },
    ]},
  ],
  D:[
    { cat:"Materials recovery & circular economy", color:"teal", items:[
      { kw:"Steel recycling maximisation",  q:"Can all removed steel be sent to high-grade recycling (EAF steelmaking) rather than lower-grade recovery?",                 opp:"Circular economy - high-grade steel recycling from decommissioning",area:"Decommissioning" },
      { kw:"Equipment refurbishment / reuse",q:"Can equipment, instruments, valves or piping be refurbished and resold rather than scrapped?",                            opp:"Circular economy - equipment reuse and refurbishment",          area:"Decommissioning" },
      { kw:"Concrete aggregate recovery",   q:"Can demolition concrete be processed for recycled aggregate rather than going to landfill?",                                opp:"Circular economy - recycled aggregate from demolition concrete", area:"Demolition" },
    ]},
    { cat:"Habitat & legacy benefits", color:"green", items:[
      { kw:"Seabed recovery as positive legacy",q:"Can post-decommissioning seabed surveys document improved benthic communities as a net positive environmental legacy?", opp:"Biodiversity net gain - documented seabed recovery as project legacy",area:"Offshore decommissioning" },
      { kw:"Land restoration to higher standard",q:"Can land reinstatement go beyond pre-disturbance baseline - creating wetlands, meadows or community green space?",  opp:"Biodiversity net gain - land restored to higher ecological standard",area:"Site reinstatement" },
    ]},
    { cat:"Decommissioning finance", color:"purple", items:[
      { kw:"Green decommissioning certification",q:"Are there emerging certification schemes or green bond frameworks for responsible decommissioning?",                   opp:"Green Finance & Taxonomy - green decommissioning certification / finance",area:"Project finance" },
    ]},
  ],
};

// ── Color map for guide word categories ──────────────────────────────────────
const COLOR_MAP = {
  teal:   { bg:"var(--cat-teal-bg)",   border:"var(--cat-teal-bd)",   text:"var(--cat-teal-tx)",   head:"var(--cat-teal-hd)" },
  purple: { bg:"var(--cat-purple-bg)", border:"var(--cat-purple-bd)", text:"var(--cat-purple-tx)", head:"var(--cat-purple-hd)" },
  amber:  { bg:"var(--cat-amber-bg)",  border:"var(--cat-amber-bd)",  text:"var(--cat-amber-tx)",  head:"var(--cat-amber-hd)" },
  red:    { bg:"var(--cat-red-bg)",    border:"var(--cat-red-bd)",    text:"var(--cat-red-tx)",    head:"var(--cat-red-hd)" },
  green:  { bg:"var(--cat-green-bg)",  border:"var(--cat-green-bd)",  text:"var(--cat-green-tx)",  head:"var(--cat-green-hd)" },
  blue:   { bg:"var(--cat-blue-bg)",   border:"var(--cat-blue-bd)",   text:"var(--cat-blue-tx)",   head:"var(--cat-blue-hd)" },
  gray:   { bg:"var(--cat-gray-bg)",   border:"var(--cat-gray-bd)",   text:"var(--cat-gray-tx)",   head:"var(--cat-gray-hd)" },
};

// ── Theme definitions ─────────────────────────────────────────────────────────
const THEMES = {
  light: {
    "--bg":          "#F5F3EE",
    "--surface":     "#FFFFFF",
    "--surface2":    "#FAFAF8",
    "--text":        "#1A1C1E",
    "--muted":       "#6B7280",
    "--faint":       "#9CA3AF",
    "--border":      "#DDD9D0",
    "--row-bd":      "#F0EDE6",
    "--teal":        "#0F6E56",
    "--teal-bg":     "#E1F5EE",
    "--teal-bd":     "#9FE1CB",
    "--teal-dk":     "#085041",
    "--teal-hi":     "#1D9E75",
    "--red":         "#A32D2D",
    "--red-bg":      "#FCEBEB",
    "--red-bd":      "#F09595",
    "--amber":       "#633806",
    "--amber-bg":    "#FAEEDA",
    "--amber-bd":    "#EF9F27",
    "--green":       "#27500A",
    "--green-bg":    "#EAF3DE",
    "--green-bd":    "#97C459",
    "--purple":      "#3C3489",
    "--purple-bg":   "#EEEDFE",
    "--purple-bd":   "#AFA9EC",
    "--blue":        "#0C447C",
    "--blue-bg":     "#E6F1FB",
    "--blue-bd":     "#85B7EB",
    "--slate":       "#455A64",
    "--slate-bg":    "#ECEFF1",
    "--slate-bd":    "#B0BEC5",
    "--sb-bg":       "#1C2127",
    "--sb-bg2":      "#242B33",
    "--sb-bd":       "#2E3740",
    "--sb-text":     "#D1C9BE",
    "--sb-muted":    "#6B7280",
    "--sb-faint":    "#374151",
    "--sb-sig":      "#501313",
    "--sb-sig-text": "#F09595",
    "--cat-teal-bg": "#E0F2F1", "--cat-teal-bd": "#80CBC4", "--cat-teal-tx": "#004D40", "--cat-teal-hd": "#00695C",
    "--cat-purple-bg":"#EDE7F6","--cat-purple-bd":"#CE93D8","--cat-purple-tx":"#4527A0","--cat-purple-hd":"#6A1B9A",
    "--cat-amber-bg": "#FFF8E1","--cat-amber-bd": "#FFE082","--cat-amber-tx": "#E65100","--cat-amber-hd": "#F57F17",
    "--cat-red-bg":   "#FFEBEE","--cat-red-bd":   "#EF9A9A","--cat-red-tx":   "#B71C1C","--cat-red-hd":   "#C62828",
    "--cat-green-bg": "#E8F5E9","--cat-green-bd": "#A5D6A7","--cat-green-tx": "#1B5E20","--cat-green-hd": "#2E7D52",
    "--cat-blue-bg":  "#E3F2FD","--cat-blue-bd":  "#90CAF9","--cat-blue-tx":  "#0D47A1","--cat-blue-hd":  "#1565C0",
    "--cat-gray-bg":  "#ECEFF1","--cat-gray-bd":  "#CFD8DC","--cat-gray-tx":  "#37474F","--cat-gray-hd":  "#455A64",
  },
  dark: {
    "--bg":          "#0F1117",
    "--surface":     "#1A1D26",
    "--surface2":    "#151821",
    "--text":        "#E2DFD8",
    "--muted":       "#7C8190",
    "--faint":       "#4A4E5A",
    "--border":      "#252830",
    "--row-bd":      "#1E2028",
    "--teal":        "#1D9E75",
    "--teal-bg":     "#081E16",
    "--teal-bd":     "#0F6E56",
    "--teal-dk":     "#5DCAA5",
    "--teal-hi":     "#5DCAA5",
    "--red":         "#E24B4A",
    "--red-bg":      "#1A0808",
    "--red-bd":      "#7B2020",
    "--amber":       "#EF9F27",
    "--amber-bg":    "#1A1006",
    "--amber-bd":    "#7A4F0A",
    "--green":       "#97C459",
    "--green-bg":    "#0A1505",
    "--green-bd":    "#3B6D11",
    "--purple":      "#AFA9EC",
    "--purple-bg":   "#10101F",
    "--purple-bd":   "#534AB7",
    "--blue":        "#85B7EB",
    "--blue-bg":     "#070F1A",
    "--blue-bd":     "#1565C0",
    "--slate":       "#8B8F9A",
    "--slate-bg":    "#1A1D26",
    "--slate-bd":    "#252830",
    "--sb-bg":       "#0D1117",
    "--sb-bg2":      "#141820",
    "--sb-bd":       "#1E222C",
    "--sb-text":     "#C8C2B8",
    "--sb-muted":    "#4A5568",
    "--sb-faint":    "#2D3748",
    "--sb-sig":      "#3D0808",
    "--sb-sig-text": "#E24B4A",
    "--cat-teal-bg": "#081E16", "--cat-teal-bd": "#0F6E56", "--cat-teal-tx": "#5DCAA5", "--cat-teal-hd": "#1D9E75",
    "--cat-purple-bg":"#10101F","--cat-purple-bd":"#534AB7","--cat-purple-tx":"#AFA9EC","--cat-purple-hd":"#7F77DD",
    "--cat-amber-bg": "#1A1006","--cat-amber-bd": "#7A4F0A","--cat-amber-tx": "#FAC775","--cat-amber-hd": "#EF9F27",
    "--cat-red-bg":   "#1A0808","--cat-red-bd":   "#7B2020","--cat-red-tx":   "#F09595","--cat-red-hd":   "#E24B4A",
    "--cat-green-bg": "#0A1505","--cat-green-bd": "#3B6D11","--cat-green-tx": "#C0DD97","--cat-green-hd": "#639922",
    "--cat-blue-bg":  "#070F1A","--cat-blue-bd":  "#1565C0","--cat-blue-tx":  "#85B7EB","--cat-blue-hd":  "#378ADD",
    "--cat-gray-bg":  "#1A1D26","--cat-gray-bd":  "#252830","--cat-gray-tx":  "#8B8F9A","--cat-gray-hd":  "#5F5E5A",
  },
};

function applyTheme(name) {
  const vars = THEMES[name] || THEMES.light;
  const root = document.documentElement;
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
}

// ── Design tokens (CSS var references) ───────────────────────────────────────
const T = {
  bg:       "var(--bg)",
  surface:  "var(--surface)",
  surface2: "var(--surface2)",
  text:     "var(--text)",
  muted:    "var(--muted)",
  faint:    "var(--faint)",
  border:   "var(--border)",
  rowBd:    "var(--row-bd)",
  teal:     "var(--teal)",
  tealBg:   "var(--teal-bg)",
  tealBd:   "var(--teal-bd)",
  tealDark: "var(--teal-dk)",
  tealHi:   "var(--teal-hi)",
  red:      "var(--red)",
  redBg:    "var(--red-bg)",
  redBd:    "var(--red-bd)",
  amber:    "var(--amber)",
  amberBg:  "var(--amber-bg)",
  amberBd:  "var(--amber-bd)",
  green:    "var(--green)",
  greenBg:  "var(--green-bg)",
  greenBd:  "var(--green-bd)",
  purple:   "var(--purple)",
  purpleBg: "var(--purple-bg)",
  purpleBd: "var(--purple-bd)",
  blue:     "var(--blue)",
  blueBg:   "var(--blue-bg)",
  blueBd:   "var(--blue-bd)",
  slate:    "var(--slate)",
  slateBg:  "var(--slate-bg)",
  slateBd:  "var(--slate-bd)",
  sbBg:     "var(--sb-bg)",
  sbBg2:    "var(--sb-bg2)",
  sbBd:     "var(--sb-bd)",
  sbText:   "var(--sb-text)",
  sbMuted:  "var(--sb-muted)",
  sbFaint:  "var(--sb-faint)",
  sbSig:    "var(--sb-sig)",
  sbSigTx:  "var(--sb-sig-text)",
  mono:     "'IBM Plex Mono', 'Courier New', monospace",
  sans:     "'IBM Plex Sans', system-ui, sans-serif",
};


// ── Scoring ───────────────────────────────────────────────────────────────────
function calcScore({ severity, probability, recSensitivity, scale, duration }) {
  if (!severity || !probability) return null;
  let s = severity * probability;
  if (recSensitivity === "High") s += 5; else if (recSensitivity === "Medium") s += 2;
  if (scale === "Global") s += 4; else if (scale === "Regional") s += 2;
  if (duration && duration.startsWith("Permanent")) s += 3;
  else if (duration && duration.startsWith("Long-term")) s += 1;
  return s;
}
function calcSig(a) {
  const score = calcScore(a);
  if (score === null) return null;
  if (a.legalThreshold === "Y" || a.stakeholderConcern === "Y" || score >= 12) return "SIGNIFICANT";
  if (score >= 8) return "WATCH";
  return "Low";
}
function calcOppScore(o) { return (o.envValue||0)*(o.bizValue||0)*(o.feasibility||0); }

function inferOppType(oppText) {
  if (!oppText) return "";
  const lower = oppText.toLowerCase();
  return OPP_TYPES.find(t => lower.startsWith(t.toLowerCase())) || "";
}

// ── Templates ─────────────────────────────────────────────────────────────────
const emptyAspect = () => ({
  phase:"", area:"", activity:"", aspect:"", condition:"Normal",
  impact:"", receptors:"", recSensitivity:"Medium", scale:"Local",
  severity:3, probability:3, duration:"Temporary (<1yr)",
  legalThreshold:"N", stakeholderConcern:"N",
  control:"", legalRef:"", owner:"", status:"Open", _color:""
});
const emptyOpp = () => ({
  type:"", aspectRef:"", materiality:"Both",
  description:"", envBenefit:"", bizBenefit:"",
  envValue:2, bizValue:2, feasibility:2,
  action:"", alignment:"", owner:"", status:"Open", _color:""
});
const newProject = () => ({
  id: Date.now().toString(),
  name:"", company:"", type:"", phase:"",
  createdAt: new Date().toISOString(),
  aspects:[], opps:[], changelog:[]
});

// ── Shared styles ─────────────────────────────────────────────────────────────
const iw = { width:"100%", boxSizing:"border-box" };

function sigStyle(sig) {
  const c = sig==="SIGNIFICANT" ? {bg:T.redBg,   c:T.red,   bd:T.redBd}
           : sig==="WATCH"      ? {bg:T.amberBg, c:T.amber, bd:T.amberBd}
           :                      {bg:T.greenBg, c:T.green, bd:T.greenBd};
  return { fontFamily:T.mono, fontSize:10, fontWeight:500, padding:"2px 7px", borderRadius:3,
           display:"inline-block", background:c.bg, color:c.c, border:"1px solid "+c.bd, letterSpacing:"0.03em" };
}
function condStyle(cd) {
  const c = cd==="Emergency" ? {bg:T.redBg,   c:T.red}
           : cd==="Abnormal" ? {bg:T.amberBg, c:T.amber}
           :                    {bg:T.greenBg, c:T.green};
  return { fontFamily:T.mono, fontSize:9, fontWeight:500, padding:"2px 6px", borderRadius:3,
           display:"inline-block", background:c.bg, color:c.c, letterSpacing:"0.05em", textTransform:"uppercase" };
}

function Fld({ label, children, wide }) {
  return (
    <div style={wide ? {gridColumn:"span 2"} : {}}>
      <label style={{ fontFamily:T.mono, fontSize:10, color:T.muted, display:"block", marginBottom:5,
                      letterSpacing:"0.05em", textTransform:"uppercase" }}>{label}</label>
      {children}
    </div>
  );
}
function Card({ children, style, accent }) {
  return (
    <div style={{ background:T.surface, borderRadius:8, border:"1px solid "+T.border,
                  borderLeft: accent ? "3px solid "+accent : undefined, padding:"1.25rem", ...style }}>
      {children}
    </div>
  );
}
function SectionLabel({ children }) {
  return <p style={{ fontFamily:T.mono, fontSize:9, fontWeight:500, color:T.faint,
                     letterSpacing:"0.1em", textTransform:"uppercase", margin:"0 0 12px" }}>{children}</p>;
}
function Btn({ children, onClick, variant="default", size="md", disabled }) {
  const v = {
    default:{ background:T.surface,  color:T.text,   border:"1px solid "+T.border },
    primary:{ background:T.teal,     color:"#fff",   border:"none" },
    purple: { background:T.purple,   color:"#fff",   border:"none" },
    danger: { background:"transparent", color:T.red, border:"1px solid "+T.redBd },
    ghost:  { background:"transparent", color:T.muted, border:"none" },
  }[variant] || {};
  const s = { sm:{padding:"4px 10px",fontSize:11}, md:{padding:"7px 14px",fontSize:12}, lg:{padding:"9px 18px",fontSize:13} }[size];
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ borderRadius:6, cursor:disabled?"not-allowed":"pointer", fontFamily:T.sans,
               fontWeight:500, opacity:disabled?0.45:1, ...v, ...s }}>
      {children}
    </button>
  );
}

// ── Theme toggle button ───────────────────────────────────────────────────────
function ThemeToggle({ isDark, onToggle }) {
  return (
    <button onClick={onToggle} title={isDark?"Switch to light theme":"Switch to dark theme"}
      style={{ background:"transparent", border:"1px solid var(--sb-bd)", borderRadius:5,
               cursor:"pointer", padding:"5px 8px", display:"flex", alignItems:"center", gap:6,
               color:"var(--sb-muted)", fontFamily:T.mono, fontSize:9 }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        {isDark
          ? <><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></>
          : <><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></>}
      </svg>
      {isDark?"Light":"Dark"}
    </button>
  );
}

// ── Aspect form ───────────────────────────────────────────────────────────────
function AspectForm({ aspect, onSave, onCancel }) {
  const [f, setF] = useState({ ...emptyAspect(), ...aspect });
  const set = (k, v) => setF(p => ({ ...p, [k]:v }));
  const score = calcScore(f);
  const sig   = calcSig(f);
  return (
    <div style={{ maxWidth:800, margin:"0 auto", padding:"1.5rem" }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:"1.5rem",
                    paddingBottom:"1rem", borderBottom:"1px solid "+T.border }}>
        <Btn onClick={onCancel} variant="ghost">Back</Btn>
        <h2 style={{ margin:0, fontSize:16, fontWeight:600, fontFamily:T.sans, color:T.text }}>
          {aspect.id ? "Edit aspect" : "New aspect"}
        </h2>
        {aspect.ref && <span style={{ fontFamily:T.mono, fontSize:11, color:T.teal, fontWeight:500 }}>{aspect.ref}</span>}
      </div>
      <Card style={{ marginBottom:"1rem" }}>
        <SectionLabel>Activity details</SectionLabel>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px 16px" }}>
          <Fld label="Phase"><select value={f.phase} onChange={e=>set("phase",e.target.value)} style={iw}><option value="">Select</option>{PHASES.map(p=><option key={p}>{p}</option>)}</select></Fld>
          <Fld label="Activity area"><input value={f.area} onChange={e=>set("area",e.target.value)} placeholder="e.g. Earthworks" style={iw}/></Fld>
          <Fld label="Specific activity" wide><input value={f.activity} onChange={e=>set("activity",e.target.value)} placeholder="Specific activity giving rise to the aspect" style={iw}/></Fld>
          <Fld label="Environmental aspect" wide><input value={f.aspect} onChange={e=>set("aspect",e.target.value)} placeholder="e.g. Fugitive dust generation (PM10/PM2.5)" style={iw}/></Fld>
          <Fld label="Condition"><select value={f.condition} onChange={e=>set("condition",e.target.value)} style={iw}>{CONDITIONS.map(c=><option key={c}>{c}</option>)}</select></Fld>
          <Fld label="Receptors affected"><input value={f.receptors} onChange={e=>set("receptors",e.target.value)} placeholder="e.g. Air, Human health, Ecology" style={iw}/></Fld>
          <Fld label="Potential environmental impact" wide><textarea value={f.impact} onChange={e=>set("impact",e.target.value)} rows={3} style={{ ...iw, resize:"vertical" }}/></Fld>
        </div>
      </Card>
      <Card style={{ marginBottom:"1rem", background:T.tealBg }} accent={T.teal}>
        <SectionLabel>Significance scoring</SectionLabel>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"10px 14px", marginBottom:12 }}>
          <Fld label="Receptor sensitivity"><select value={f.recSensitivity} onChange={e=>set("recSensitivity",e.target.value)} style={iw}>{SENSITIVITIES.map(s=><option key={s}>{s}</option>)}</select></Fld>
          <Fld label="Scale"><select value={f.scale} onChange={e=>set("scale",e.target.value)} style={iw}>{SCALES.map(s=><option key={s}>{s}</option>)}</select></Fld>
          <Fld label="Duration"><select value={f.duration} onChange={e=>set("duration",e.target.value)} style={iw}>{DURATIONS.map(d=><option key={d}>{d}</option>)}</select></Fld>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"10px 14px" }}>
          <Fld label="Severity (1-5)"><input type="number" min={1} max={5} value={f.severity} onChange={e=>set("severity",Math.min(5,Math.max(1,+e.target.value||1)))} style={iw}/></Fld>
          <Fld label="Probability (1-5)"><input type="number" min={1} max={5} value={f.probability} onChange={e=>set("probability",Math.min(5,Math.max(1,+e.target.value||1)))} style={iw}/></Fld>
          <Fld label="Legal threshold"><select value={f.legalThreshold} onChange={e=>set("legalThreshold",e.target.value)} style={iw}><option>N</option><option>Y</option></select></Fld>
          <Fld label="Stakeholder concern"><select value={f.stakeholderConcern} onChange={e=>set("stakeholderConcern",e.target.value)} style={iw}><option>N</option><option>Y</option></select></Fld>
        </div>
        {score !== null && (
          <div style={{ marginTop:14, paddingTop:12, borderTop:"1px solid "+T.tealBd,
                        display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
            <span style={{ fontFamily:T.mono, fontSize:11, color:T.muted }}>
              Score: <strong style={{ fontSize:20, color:T.text }}>{score}</strong>
            </span>
            <span style={sigStyle(sig)}>{sig}</span>
            {f.legalThreshold==="Y" && <span style={{ fontFamily:T.mono, fontSize:10, color:T.amber }}>Auto-flagged: legal threshold</span>}
            {f.stakeholderConcern==="Y" && <span style={{ fontFamily:T.mono, fontSize:10, color:T.amber }}>Auto-flagged: stakeholder concern</span>}
          </div>
        )}
      </Card>
      <Card style={{ marginBottom:"1.5rem" }}>
        <SectionLabel>Controls & management</SectionLabel>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px 14px" }}>
          <Fld label="Key control measure" wide><textarea value={f.control} onChange={e=>set("control",e.target.value)} rows={3} style={{ ...iw, resize:"vertical" }}/></Fld>
          <Fld label="Legal / regulatory reference" wide><input value={f.legalRef} onChange={e=>set("legalRef",e.target.value)} placeholder="e.g. Forurensningsloven s.7, OSPAR" style={iw}/></Fld>
          <Fld label="Owner"><input value={f.owner} onChange={e=>set("owner",e.target.value)} placeholder="Name or role" style={iw}/></Fld>
          <Fld label="Status"><select value={f.status} onChange={e=>set("status",e.target.value)} style={iw}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select></Fld>
        </div>
      </Card>
      <div style={{ display:"flex", justifyContent:"flex-end", gap:8 }}>
        <Btn onClick={onCancel}>Cancel</Btn>
        <Btn variant="primary" onClick={()=>onSave(f)}>{aspect.id?"Save changes":"Add to register"}</Btn>
      </div>
    </div>
  );
}

// ── Opp form ──────────────────────────────────────────────────────────────────
function OppForm({ opp, aspects, onSave, onCancel }) {
  const [f, setF] = useState({ ...emptyOpp(), ...opp });
  const set = (k, v) => setF(p => ({ ...p, [k]:v }));
  const score = calcOppScore(f);
  const sc = score>=18?{bg:"var(--teal-bg)",c:"var(--teal-dk)"}:score>=9?{bg:T.tealBg,c:T.teal}:{bg:T.slateBg,c:T.slate};
  return (
    <div style={{ maxWidth:800, margin:"0 auto", padding:"1.5rem" }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:"1.5rem",
                    paddingBottom:"1rem", borderBottom:"1px solid "+T.border }}>
        <Btn onClick={onCancel} variant="ghost">Back</Btn>
        <h2 style={{ margin:0, fontSize:16, fontWeight:600, fontFamily:T.sans }}>{opp.id?"Edit opportunity":"New opportunity"}</h2>
      </div>
      <Card style={{ marginBottom:"1rem" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px 14px" }}>
          <Fld label="Opportunity type"><select value={f.type} onChange={e=>set("type",e.target.value)} style={iw}><option value="">Select type</option>{OPP_TYPES.map(t=><option key={t}>{t}</option>)}</select></Fld>
          <Fld label="Linked aspect (optional)"><select value={f.aspectRef} onChange={e=>set("aspectRef",e.target.value)} style={iw}><option value="">None</option>{aspects.map(a=><option key={a.id} value={a.ref}>{a.ref} - {(a.aspect||"").slice(0,40)}</option>)}</select></Fld>
          <Fld label="Materiality (CSRD)" wide><select value={f.materiality} onChange={e=>set("materiality",e.target.value)} style={iw}><option>Inside-out (positive impact on environment)</option><option>Outside-in (financial / business benefit)</option><option>Both</option></select></Fld>
          <Fld label="Opportunity description" wide><textarea value={f.description} onChange={e=>set("description",e.target.value)} rows={3} style={{ ...iw, resize:"vertical" }}/></Fld>
          <Fld label="Environmental benefit"><textarea value={f.envBenefit} onChange={e=>set("envBenefit",e.target.value)} rows={2} style={{ ...iw, resize:"vertical" }}/></Fld>
          <Fld label="Business / strategic benefit"><textarea value={f.bizBenefit} onChange={e=>set("bizBenefit",e.target.value)} rows={2} style={{ ...iw, resize:"vertical" }}/></Fld>
        </div>
      </Card>
      <Card style={{ marginBottom:"1rem", background:T.tealBg }} accent={T.teal}>
        <SectionLabel>Priority score = env value x business value x feasibility (max 27)</SectionLabel>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"10px 14px" }}>
          {[{k:"envValue",l:"Env value (1-3)"},{k:"bizValue",l:"Business value (1-3)"},{k:"feasibility",l:"Feasibility (1-3)"}].map(({ k, l }) => (
            <Fld key={k} label={l}><input type="number" min={1} max={3} value={f[k]} onChange={e=>set(k,Math.min(3,Math.max(1,+e.target.value||1)))} style={iw}/></Fld>
          ))}
        </div>
        <div style={{ marginTop:12, paddingTop:10, borderTop:"1px solid "+T.tealBd, display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontFamily:T.mono, fontSize:11, color:T.muted }}>Score:</span>
          <span style={{ fontFamily:T.mono, fontSize:20, fontWeight:500, padding:"2px 12px", borderRadius:5, background:sc.bg, color:sc.c }}>{score}</span>
          <span style={{ fontSize:12, color:T.muted }}>{score>=18?"High priority - act now":score>=9?"Medium priority":"Low priority"}</span>
        </div>
      </Card>
      <Card style={{ marginBottom:"1.5rem" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px 14px" }}>
          <Fld label="Key action" wide><textarea value={f.action} onChange={e=>set("action",e.target.value)} rows={2} style={{ ...iw, resize:"vertical" }}/></Fld>
          <Fld label="ESRS / framework alignment"><input value={f.alignment} onChange={e=>set("alignment",e.target.value)} placeholder="e.g. ESRS E1, EU Taxonomy, SBTi" style={iw}/></Fld>
          <Fld label="Owner"><input value={f.owner} onChange={e=>set("owner",e.target.value)} placeholder="Name or role" style={iw}/></Fld>
          <Fld label="Status"><select value={f.status} onChange={e=>set("status",e.target.value)} style={iw}>{OPP_STATUSES.map(s=><option key={s}>{s}</option>)}</select></Fld>
        </div>
      </Card>
      <div style={{ display:"flex", justifyContent:"flex-end", gap:8 }}>
        <Btn onClick={onCancel}>Cancel</Btn>
        <Btn variant="primary" onClick={()=>onSave(f)}>{opp.id?"Save changes":"Add opportunity"}</Btn>
      </div>
    </div>
  );
}

// ── AI Suggest ────────────────────────────────────────────────────────────────
function AIPanel({ project, onAdd }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const run = async () => {
    if (!query.trim()) return;
    setLoading(true); setError(""); setResults([]);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:1200,
          system:`You are an expert environmental consultant for Norwegian engineering projects. Return ONLY a valid JSON array. Each object: phase (one of: ${PHASES.join(", ")}), area (max 60 chars), activity (max 80 chars), aspect (max 80 chars), condition (Normal|Abnormal|Emergency), impact (max 120 chars), receptors (max 80 chars), recSensitivity (High|Medium|Low), scale (Global|Regional|Local), severity (int 1-5), probability (int 1-5), duration (one of: ${DURATIONS.join(", ")}), legalThreshold (Y|N), control (max 120 chars), legalRef (max 80 chars). Return 4-6 aspects.`,
          messages:[{ role:"user", content:`Project type: ${project.type||"not specified"}. Phase: ${project.phase||"not specified"}. Scenario: ${query}` }]
        })
      });
      const d = await res.json();
      const parsed = JSON.parse((d.content?.[0]?.text || "").trim());
      setResults(Array.isArray(parsed) ? parsed : []);
    } catch { setError("Could not fetch suggestions - check your connection."); }
    setLoading(false);
  };
  return (
    <div style={{ background:T.purpleBg, border:"1px solid "+T.purpleBd, borderRadius:8, padding:"1rem", marginBottom:"1rem" }}>
      <p style={{ fontFamily:T.mono, fontSize:11, fontWeight:500, color:T.purple, margin:"0 0 4px", letterSpacing:"0.03em" }}>AI aspect suggestion</p>
      <p style={{ fontSize:12, color:T.muted, margin:"0 0 10px" }}>Describe a project activity or scenario, e.g. "diesel pile driving near a coral reef during spring spawning season"</p>
      <div style={{ display:"flex", gap:8, marginBottom:8 }}>
        <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&run()} placeholder="Describe the activity or scenario..." style={{ flex:1 }}/>
        <Btn variant="purple" onClick={run} disabled={loading||!query.trim()}>{loading?"Thinking...":"Suggest"}</Btn>
      </div>
      {error && <p style={{ color:T.red, fontSize:12, margin:"0 0 8px" }}>{error}</p>}
      {results.map((s, i) => {
        const sig = calcSig(s);
        return (
          <div key={i} style={{ background:T.surface, border:"1px solid "+T.border, borderRadius:6, padding:"10px 12px", marginBottom:6, display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:4, alignItems:"center" }}>
                <span style={{ fontWeight:500, fontSize:13, fontFamily:T.sans }}>{s.aspect}</span>
                <span style={condStyle(s.condition)}>{s.condition}</span>
                {sig && <span style={sigStyle(sig)}>{sig}</span>}
              </div>
              <p style={{ fontFamily:T.mono, fontSize:10, color:T.muted, margin:"0 0 2px" }}>{s.phase}{s.area?" / "+s.area:""}</p>
              <p style={{ fontSize:12, color:T.muted, margin:0 }}>{s.impact}</p>
            </div>
            <Btn size="sm" variant="primary" onClick={()=>{ onAdd(s); setResults(p=>p.filter(x=>x!==s)); }}>Add</Btn>
          </div>
        );
      })}
    </div>
  );
}

// ── Shared table ─────────────────────────────────────────────────────────────
const TH = ({ children }) => (
  <th style={{ padding:"8px 12px", textAlign:"left", fontFamily:"'IBM Plex Mono',monospace",
               fontWeight:500, fontSize:9, color:"var(--muted)", borderBottom:"1px solid var(--border)",
               whiteSpace:"nowrap", letterSpacing:"0.07em", textTransform:"uppercase",
               background:"var(--surface2)" }}>
    {children}
  </th>
);

// ── Screening tab ─────────────────────────────────────────────────────────────
function ScreeningTab({ project, onAddAspect, onAddOpp }) {
  const [mode, setMode]               = useState("risks");
  const [activeStage, setActiveStage] = useState("E");
  const [expanded, setExpanded]       = useState({});
  const [view, setView]               = useState("guide");
  const [riskForm, setRiskForm]       = useState(emptyAspect());
  const [oppForm, setOppForm]         = useState(emptyOpp());
  const [toast, setToast]             = useState("");

  const isRisks   = mode === "risks";
  const toggleCat = k => setExpanded(p => ({ ...p, [k]:!p[k] }));

  const prefillRisk = (code, item, sectionColor) => {
    setRiskForm({ ...emptyAspect(), phase:PHASE_MAP[code]||"", area:item.area||"",
                  aspect:item.aspect||"", condition:COND_MAP[code]||"Normal", _color:sectionColor||"" });
    setView("form");
  };
  const prefillOpp = (code, item, sectionColor) => {
    const inferredType = inferOppType(item.opp||"");
    setOppForm({ ...emptyOpp(), description:item.opp||"", type:inferredType, _color:sectionColor||"" });
    setView("form");
  };

  const setRF = (k, v) => setRiskForm(p => ({ ...p, [k]:v }));
  const setOF = (k, v) => setOppForm(p => ({ ...p, [k]:v }));

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(""), 2500); };
  const saveRisk  = () => {
    if (!riskForm.aspect.trim()) return;
    onAddAspect(riskForm); setRiskForm(emptyAspect()); setView("guide");
    showToast("Aspect saved to register");
  };
  const saveOpp = () => {
    if (!oppForm.description.trim()) return;
    onAddOpp(oppForm); setOppForm(emptyOpp()); setView("guide");
    showToast("Opportunity saved to register");
  };

  const riskScore = calcScore(riskForm);
  const riskSig   = calcSig(riskForm);
  const oppScore  = calcOppScore(oppForm);
  const oppSc     = oppScore>=18?{bg:T.tealBg,c:T.tealDark}:oppScore>=9?{bg:T.tealBg,c:T.teal}:{bg:T.slateBg,c:T.slate};
  const guideData = isRisks ? (GW_RISK[activeStage]||[]) : (GW_OPP[activeStage]||[]);

  return (
    <div style={{ display:"flex", height:"calc(100vh - 110px)", minHeight:500, margin:"-1.25rem" }}>
      <div style={{ width:185, flexShrink:0, borderRight:"1px solid "+T.border, background:T.surface2,
                    overflowY:"auto", padding:"0.75rem 0.5rem" }}>
        <p style={{ fontFamily:T.mono, fontSize:9, fontWeight:500, color:T.faint, letterSpacing:"0.1em",
                    textTransform:"uppercase", margin:"0 0.5rem 8px" }}>EPCIC Stage</p>
        {EPCIC_STAGES.map(s => (
          <button key={s.code} onClick={() => { setActiveStage(s.code); setView("guide"); }}
            style={{ width:"100%", textAlign:"left", padding:"8px 10px", borderRadius:6, marginBottom:2,
                     cursor:"pointer", fontFamily:T.sans, background:"transparent",
                     border: activeStage===s.code ? "1px solid "+T.tealBd : "1px solid transparent",
                     backgroundColor: activeStage===s.code ? T.tealBg : "transparent" }}>
            <div style={{ fontSize:12, fontWeight:activeStage===s.code?600:400,
                          color:activeStage===s.code?T.teal:T.text }}>{s.label}</div>
            <div style={{ fontFamily:T.mono, fontSize:9, color:T.faint, marginTop:2 }}>{s.sub}</div>
          </button>
        ))}
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"1.25rem" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:"1.25rem", flexWrap:"wrap" }}>
          <div style={{ display:"inline-flex", borderRadius:6, overflow:"hidden", border:"1px solid "+T.border }}>
            <button onClick={() => { setMode("risks"); setView("guide"); }}
              style={{ padding:"7px 20px", fontSize:12, cursor:"pointer", fontFamily:T.sans,
                       fontWeight:isRisks?600:400, border:"none",
                       background:isRisks?T.redBg:T.surface, color:isRisks?T.red:T.muted,
                       borderRight:"1px solid "+T.border }}>
              Risks &amp; aspects
            </button>
            <button onClick={() => { setMode("opps"); setView("guide"); }}
              style={{ padding:"7px 20px", fontSize:12, cursor:"pointer", fontFamily:T.sans,
                       fontWeight:!isRisks?600:400, border:"none",
                       background:!isRisks?T.purpleBg:T.surface, color:!isRisks?T.purple:T.muted }}>
              Opportunities
            </button>
          </div>
          {toast && (
            <span style={{ fontFamily:T.mono, fontSize:11, color:T.teal, background:T.tealBg,
                           border:"1px solid "+T.tealBd, padding:"4px 10px", borderRadius:4 }}>
              {toast}
            </span>
          )}
        </div>

        {view === "guide" && (
          <div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                          marginBottom:"1rem", flexWrap:"wrap", gap:8 }}>
              <div>
                <h3 style={{ fontSize:14, fontWeight:600, margin:"0 0 2px",
                             color:isRisks?T.red:T.purple, fontFamily:T.sans }}>
                  {EPCIC_STAGES.find(s=>s.code===activeStage)?.label} — {isRisks?"risk guide words":"opportunity guide words"}
                </h3>
                <p style={{ fontSize:12, color:T.muted, margin:0 }}>
                  {isRisks?"Ask these questions to identify environmental aspects and risks":"Ask these questions to identify positive environmental opportunities"}
                </p>
              </div>
              <button onClick={() => setView("form")}
                style={{ padding:"6px 13px", fontSize:12, borderRadius:6, border:"none",
                         background:isRisks?T.red:T.purple, color:"#fff", cursor:"pointer",
                         fontFamily:T.sans, fontWeight:500 }}>
                + Blank form
              </button>
            </div>
            {guideData.length === 0 && (
              <div style={{ padding:"2rem", textAlign:"center", background:T.slateBg,
                            borderRadius:8, color:T.faint, fontSize:12 }}>No guide words for this stage yet.</div>
            )}
            {guideData.map(section => {
              const col = COLOR_MAP[section.color] || COLOR_MAP.gray;
              const key = (isRisks?"R":"O")+activeStage+section.cat;
              const open = expanded[key] !== false;
              return (
                <div key={key} style={{ marginBottom:8, borderRadius:8, border:"1px solid "+col.border, overflow:"hidden" }}>
                  <button onClick={() => toggleCat(key)}
                    style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between",
                             padding:"9px 14px", background:col.bg, border:"none", cursor:"pointer", fontFamily:T.sans }}>
                    <span style={{ fontSize:12, fontWeight:600, color:col.head }}>{section.cat}</span>
                    <span style={{ fontFamily:T.mono, fontSize:10, color:col.head, opacity:0.5 }}>{open?"v":">"}</span>
                  </button>
                  {open && (
                    <div style={{ background:T.surface }}>
                      {section.items.map((item, i) => (
                        <div key={i} style={{ padding:"10px 14px", borderTop:"1px solid "+col.border,
                                             display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12 }}>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontFamily:T.mono, fontSize:11, fontWeight:500, color:col.head,
                                         marginBottom:4, letterSpacing:"0.02em" }}>{item.kw}</div>
                            <p style={{ fontSize:12, color:T.muted, margin:"0 0 5px", lineHeight:1.55 }}>{item.q}</p>
                            <span style={{ fontFamily:T.mono, fontSize:10, padding:"1px 7px", borderRadius:3,
                                          background:col.bg, color:col.text }}>
                              {isRisks?"Aspect: "+item.aspect:"Opportunity: "+item.opp}
                            </span>
                          </div>
                          <button onClick={() => isRisks ? prefillRisk(activeStage, item, section.color) : prefillOpp(activeStage, item, section.color)}
                            style={{ padding:"5px 11px", fontSize:11, borderRadius:5, border:"none",
                                     background:col.head, color:"#fff", cursor:"pointer", fontFamily:T.sans,
                                     fontWeight:500, whiteSpace:"nowrap", flexShrink:0 }}>
                            Use
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {view === "form" && isRisks && (
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:"1rem" }}>
              <button onClick={() => setView("guide")} style={{ padding:"5px 11px", fontSize:11, borderRadius:5,
                border:"1px solid "+T.border, background:"transparent", cursor:"pointer",
                fontFamily:T.sans, color:T.muted }}>Back</button>
              <h3 style={{ margin:0, fontSize:14, fontWeight:600, color:T.red, fontFamily:T.sans }}>
                Risk screening — {EPCIC_STAGES.find(s=>s.code===activeStage)?.label}
              </h3>
            </div>
            <Card style={{ marginBottom:"1rem" }} accent={T.red}>
              <SectionLabel>Activity details</SectionLabel>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px 14px" }}>
                <Fld label="Phase"><select value={riskForm.phase} onChange={e=>setRF("phase",e.target.value)} style={iw}><option value="">Select</option>{PHASES.map(p=><option key={p}>{p}</option>)}</select></Fld>
                <Fld label="Activity area"><input value={riskForm.area} onChange={e=>setRF("area",e.target.value)} placeholder="e.g. Earthworks" style={iw}/></Fld>
                <Fld label="Specific activity" wide><input value={riskForm.activity} onChange={e=>setRF("activity",e.target.value)} style={iw}/></Fld>
                <Fld label="Environmental aspect" wide><input value={riskForm.aspect} onChange={e=>setRF("aspect",e.target.value)} placeholder="e.g. Fugitive dust from excavation" style={iw}/></Fld>
                <Fld label="Condition"><select value={riskForm.condition} onChange={e=>setRF("condition",e.target.value)} style={iw}>{CONDITIONS.map(c=><option key={c}>{c}</option>)}</select></Fld>
                <Fld label="Receptors affected"><input value={riskForm.receptors} onChange={e=>setRF("receptors",e.target.value)} placeholder="e.g. Air, Human health" style={iw}/></Fld>
                <Fld label="Potential environmental impact" wide><textarea value={riskForm.impact} onChange={e=>setRF("impact",e.target.value)} rows={3} style={{ ...iw, resize:"vertical" }}/></Fld>
              </div>
            </Card>
            <Card style={{ marginBottom:"1rem", background:T.tealBg }} accent={T.teal}>
              <SectionLabel>Significance scoring</SectionLabel>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"10px 14px", marginBottom:10 }}>
                <Fld label="Receptor sensitivity"><select value={riskForm.recSensitivity} onChange={e=>setRF("recSensitivity",e.target.value)} style={iw}>{SENSITIVITIES.map(s=><option key={s}>{s}</option>)}</select></Fld>
                <Fld label="Scale"><select value={riskForm.scale} onChange={e=>setRF("scale",e.target.value)} style={iw}>{SCALES.map(s=><option key={s}>{s}</option>)}</select></Fld>
                <Fld label="Duration"><select value={riskForm.duration} onChange={e=>setRF("duration",e.target.value)} style={iw}>{DURATIONS.map(d=><option key={d}>{d}</option>)}</select></Fld>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"10px 14px" }}>
                <Fld label="Severity (1-5)"><input type="number" min={1} max={5} value={riskForm.severity} onChange={e=>setRF("severity",Math.min(5,Math.max(1,+e.target.value||1)))} style={iw}/></Fld>
                <Fld label="Probability (1-5)"><input type="number" min={1} max={5} value={riskForm.probability} onChange={e=>setRF("probability",Math.min(5,Math.max(1,+e.target.value||1)))} style={iw}/></Fld>
                <Fld label="Legal threshold"><select value={riskForm.legalThreshold} onChange={e=>setRF("legalThreshold",e.target.value)} style={iw}><option>N</option><option>Y</option></select></Fld>
                <Fld label="Stakeholder concern"><select value={riskForm.stakeholderConcern} onChange={e=>setRF("stakeholderConcern",e.target.value)} style={iw}><option>N</option><option>Y</option></select></Fld>
              </div>
              {riskScore !== null && (
                <div style={{ marginTop:12, paddingTop:10, borderTop:"1px solid "+T.tealBd,
                              display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                  <span style={{ fontFamily:T.mono, fontSize:11, color:T.muted }}>
                    Score: <strong style={{ fontSize:20, color:T.text }}>{riskScore}</strong>
                  </span>
                  <span style={sigStyle(riskSig)}>{riskSig}</span>
                  {riskForm.legalThreshold==="Y" && <span style={{ fontFamily:T.mono, fontSize:10, color:T.amber }}>Auto-flagged: legal threshold</span>}
                  {riskForm.stakeholderConcern==="Y" && <span style={{ fontFamily:T.mono, fontSize:10, color:T.amber }}>Auto-flagged: stakeholder concern</span>}
                </div>
              )}
            </Card>
            <Card style={{ marginBottom:"1rem" }}>
              <SectionLabel>Controls & management</SectionLabel>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px 14px" }}>
                <Fld label="Key control measure" wide><textarea value={riskForm.control} onChange={e=>setRF("control",e.target.value)} rows={3} style={{ ...iw, resize:"vertical" }}/></Fld>
                <Fld label="Legal / regulatory reference" wide><input value={riskForm.legalRef} onChange={e=>setRF("legalRef",e.target.value)} placeholder="e.g. Forurensningsloven s.7" style={iw}/></Fld>
                <Fld label="Owner"><input value={riskForm.owner} onChange={e=>setRF("owner",e.target.value)} placeholder="Name or role" style={iw}/></Fld>
                <Fld label="Status"><select value={riskForm.status} onChange={e=>setRF("status",e.target.value)} style={iw}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select></Fld>
              </div>
            </Card>
            <div style={{ display:"flex", justifyContent:"flex-end", gap:8 }}>
              <Btn onClick={() => setRiskForm(emptyAspect())}>Clear</Btn>
              <button onClick={saveRisk} disabled={!riskForm.aspect.trim()}
                style={{ padding:"7px 14px", borderRadius:6, border:"none", background:T.red, color:"#fff",
                         cursor:riskForm.aspect.trim()?"pointer":"not-allowed", fontSize:12,
                         fontFamily:T.sans, fontWeight:500, opacity:riskForm.aspect.trim()?1:0.45 }}>
                Save to aspects register
              </button>
            </div>
          </div>
        )}

        {view === "form" && !isRisks && (
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:"1rem" }}>
              <button onClick={() => setView("guide")} style={{ padding:"5px 11px", fontSize:11, borderRadius:5,
                border:"1px solid "+T.border, background:"transparent", cursor:"pointer",
                fontFamily:T.sans, color:T.muted }}>Back</button>
              <h3 style={{ margin:0, fontSize:14, fontWeight:600, color:T.purple, fontFamily:T.sans }}>
                Opportunity screening — {EPCIC_STAGES.find(s=>s.code===activeStage)?.label}
              </h3>
            </div>
            <Card style={{ marginBottom:"1rem" }} accent={T.purple}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px 14px" }}>
                <Fld label="Opportunity type"><select value={oppForm.type} onChange={e=>setOF("type",e.target.value)} style={iw}><option value="">Select type</option>{OPP_TYPES.map(t=><option key={t}>{t}</option>)}</select></Fld>
                <Fld label="Linked aspect (optional)"><input value={oppForm.aspectRef} onChange={e=>setOF("aspectRef",e.target.value)} placeholder="e.g. ASP-001" style={iw}/></Fld>
                <Fld label="Materiality (CSRD)" wide><select value={oppForm.materiality} onChange={e=>setOF("materiality",e.target.value)} style={iw}><option>Inside-out (positive impact on environment)</option><option>Outside-in (financial / business benefit)</option><option>Both</option></select></Fld>
                <Fld label="Opportunity description" wide><textarea value={oppForm.description} onChange={e=>setOF("description",e.target.value)} rows={3} style={{ ...iw, resize:"vertical" }}/></Fld>
                <Fld label="Environmental benefit"><textarea value={oppForm.envBenefit} onChange={e=>setOF("envBenefit",e.target.value)} rows={2} style={{ ...iw, resize:"vertical" }}/></Fld>
                <Fld label="Business / strategic benefit"><textarea value={oppForm.bizBenefit} onChange={e=>setOF("bizBenefit",e.target.value)} rows={2} style={{ ...iw, resize:"vertical" }}/></Fld>
              </div>
            </Card>
            <Card style={{ marginBottom:"1rem", background:T.tealBg }} accent={T.teal}>
              <SectionLabel>Priority score = env value x business value x feasibility (max 27)</SectionLabel>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"10px 14px" }}>
                {[{k:"envValue",l:"Env value (1-3)"},{k:"bizValue",l:"Business value (1-3)"},{k:"feasibility",l:"Feasibility (1-3)"}].map(({ k, l }) => (
                  <Fld key={k} label={l}><input type="number" min={1} max={3} value={oppForm[k]} onChange={e=>setOF(k,Math.min(3,Math.max(1,+e.target.value||1)))} style={iw}/></Fld>
                ))}
              </div>
              <div style={{ marginTop:12, paddingTop:10, borderTop:"1px solid "+T.tealBd, display:"flex", alignItems:"center", gap:12 }}>
                <span style={{ fontFamily:T.mono, fontSize:11, color:T.muted }}>Score:</span>
                <span style={{ fontFamily:T.mono, fontSize:20, fontWeight:500, padding:"2px 12px", borderRadius:5, background:oppSc.bg, color:oppSc.c }}>{oppScore}</span>
                <span style={{ fontSize:12, color:T.muted }}>{oppScore>=18?"High priority - act now":oppScore>=9?"Medium priority":"Low priority"}</span>
              </div>
            </Card>
            <Card style={{ marginBottom:"1rem" }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px 14px" }}>
                <Fld label="Key action / implementation route" wide><textarea value={oppForm.action} onChange={e=>setOF("action",e.target.value)} rows={2} style={{ ...iw, resize:"vertical" }}/></Fld>
                <Fld label="ESRS / framework alignment"><input value={oppForm.alignment} onChange={e=>setOF("alignment",e.target.value)} placeholder="e.g. ESRS E1, EU Taxonomy" style={iw}/></Fld>
                <Fld label="Owner"><input value={oppForm.owner} onChange={e=>setOF("owner",e.target.value)} placeholder="Name or role" style={iw}/></Fld>
                <Fld label="Status"><select value={oppForm.status} onChange={e=>setOF("status",e.target.value)} style={iw}>{OPP_STATUSES.map(s=><option key={s}>{s}</option>)}</select></Fld>
              </div>
            </Card>
            <div style={{ display:"flex", justifyContent:"flex-end", gap:8 }}>
              <Btn onClick={() => setOppForm(emptyOpp())}>Clear</Btn>
              <button onClick={saveOpp} disabled={!oppForm.description.trim()}
                style={{ padding:"7px 14px", borderRadius:6, border:"none", background:T.purple, color:"#fff",
                         cursor:oppForm.description.trim()?"pointer":"not-allowed", fontSize:12,
                         fontFamily:T.sans, fontWeight:500, opacity:oppForm.description.trim()?1:0.45 }}>
                Save to opportunities register
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Project view ──────────────────────────────────────────────────────────────
function ProjectView({ project, onChange, onDelete }) {
  const [tab, setTab]                     = useState("dashboard");
  const [editAspect, setEditAspect]       = useState(null);
  const [editOpp, setEditOpp]             = useState(null);
  const [aiOpen, setAiOpen]               = useState(false);
  const [dashFilter, setDashFilter]       = useState("all");
  const [aspFilter, setAspFilter]         = useState("All");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const aspects = project.aspects || [];
  const opps    = project.opps    || [];
  const changelog = project.changelog || [];
  const nextRef = (arr, pfx) => pfx+"-"+String(arr.length+1).padStart(3,"0");

  const logChange = (action, detail) => {
    const entry = { id:Date.now().toString(), ts:new Date().toISOString(), action, detail };
    return [...(project.changelog||[]), entry];
  };

  const saveAspect = a => {
    const isEdit = !!a.id;
    const updated = isEdit ? aspects.map(x=>x.id===a.id?a:x)
                           : [...aspects,{...a,id:Date.now().toString(),ref:nextRef(aspects,"ASP")}];
    const ref = isEdit ? a.ref : nextRef(aspects,"ASP");
    onChange({ ...project, aspects:updated,
               changelog:logChange(isEdit?"Edited aspect":"Added aspect",
                 `${ref}: ${(a.aspect||"").slice(0,60)}`) });
    setEditAspect(null);
  };
  const saveOpp = o => {
    const isEdit = !!o.id;
    const updated = isEdit ? opps.map(x=>x.id===o.id?o:x)
                           : [...opps,{...o,id:Date.now().toString(),ref:nextRef(opps,"OPP")}];
    const ref = isEdit ? o.ref : nextRef(opps,"OPP");
    onChange({ ...project, opps:updated,
               changelog:logChange(isEdit?"Edited opportunity":"Added opportunity",
                 `${ref}: ${(o.description||"").slice(0,60)}`) });
    setEditOpp(null);
  };
  const deleteAspect = (a) => {
    onChange({ ...project, aspects:aspects.filter(x=>x.id!==a.id),
               changelog:logChange("Deleted aspect", `${a.ref}: ${(a.aspect||"").slice(0,60)}`) });
  };
  const deleteOpp = (o) => {
    onChange({ ...project, opps:opps.filter(x=>x.id!==o.id),
               changelog:logChange("Deleted opportunity", `${o.ref}: ${(o.description||"").slice(0,60)}`) });
  };

  const sigCount   = aspects.filter(a=>calcSig(a)==="SIGNIFICANT").length;
  const watchCount = aspects.filter(a=>calcSig(a)==="WATCH").length;
  const lowCount   = aspects.filter(a=>calcSig(a)==="Low").length;
  const highOpps   = opps.filter(o=>calcOppScore(o)>=18).length;

  // Dashboard filter drives which aspects show
  const dashAspects = dashFilter==="all"     ? aspects
                    : dashFilter==="sig"     ? aspects.filter(a=>calcSig(a)==="SIGNIFICANT")
                    : dashFilter==="watch"   ? aspects.filter(a=>calcSig(a)==="WATCH")
                    : dashFilter==="low"     ? aspects.filter(a=>calcSig(a)==="Low")
                    : dashFilter==="opps"    ? aspects
                    : aspects;

  const filteredAspects = aspFilter==="All" ? aspects : aspects.filter(a=>calcSig(a)===aspFilter);

  if (editAspect !== null) return (
    <div style={{ background:T.bg, minHeight:"100%" }}>
      <AspectForm aspect={editAspect} onSave={saveAspect} onCancel={()=>setEditAspect(null)}/>
    </div>
  );
  if (editOpp !== null) return (
    <div style={{ background:T.bg, minHeight:"100%" }}>
      <OppForm opp={editOpp} aspects={aspects} onSave={saveOpp} onCancel={()=>setEditOpp(null)}/>
    </div>
  );

  const StatCard = ({ label, value, bg, color, border, filterId }) => {
    const active = dashFilter === filterId;
    return (
      <div onClick={() => { setDashFilter(dashFilter===filterId?"all":filterId); if(filterId!=="opps") setTab("dashboard"); }}
        style={{ background:bg||T.surface, borderRadius:7, padding:"12px 14px",
                 border: active ? "2px solid "+color : "1px solid "+(border||T.border),
                 cursor:"pointer", transition:"all 0.15s",
                 boxShadow: active ? "0 0 0 1px "+(color||T.teal) : "none" }}>
        <p style={{ fontFamily:T.mono, fontSize:9, color:color||T.muted, margin:"0 0 6px",
                    letterSpacing:"0.08em", textTransform:"uppercase" }}>{label}</p>
        <p style={{ fontFamily:T.mono, fontSize:22, fontWeight:500, margin:0,
                    color:color||T.text, lineHeight:1 }}>{value}</p>
      </div>
    );
  };

  // Colour helper for rows
  const rowColor = (item) => item._color ? (COLOR_MAP[item._color]||COLOR_MAP.gray) : null;

  // Shared aspect table renderer
  const AspectTable = ({ rows, onEdit, onDelete: onDel }) => (
    <div style={{ overflowX:"auto", borderRadius:8, border:"1px solid "+T.border, background:T.surface }}>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12, fontFamily:T.sans }}>
        <thead><tr>{["Ref","Phase","Aspect","Cond.","Impact / Receptor","Score","Significance","Status",""].map(h=><TH key={h}>{h}</TH>)}</tr></thead>
        <tbody>
          {rows.map((a) => {
            const score  = calcScore(a);
            const sig    = calcSig(a);
            const rc     = rowColor(a);
            const leftBd = rc ? "3px solid "+rc.head : "3px solid transparent";
            return (
              <tr key={a.id} style={{ borderBottom:"1px solid "+T.rowBd, borderLeft:leftBd }}>
                <td style={{ padding:"9px 12px" }}>
                  <span style={{ fontFamily:T.mono, fontSize:10, fontWeight:500, color:T.teal }}>{a.ref}</span>
                </td>
                <td style={{ padding:"9px 12px" }}>
                  <span style={{ fontFamily:T.mono, fontSize:9, padding:"2px 6px", borderRadius:3, background:T.slateBg, color:T.slate }}>{a.phase||"—"}</span>
                </td>
                <td style={{ padding:"9px 12px", maxWidth:180 }}>
                  <div style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                                fontWeight:500, color: rc ? rc.head : T.text }} title={a.aspect}>
                    {a.aspect||"—"}
                  </div>
                  {a.area && <div style={{ fontFamily:T.mono, fontSize:10, color: rc ? rc.text : T.faint }}>{a.area}</div>}
                </td>
                <td style={{ padding:"9px 12px" }}>{a.condition && <span style={condStyle(a.condition)}>{a.condition}</span>}</td>
                <td style={{ padding:"9px 12px", maxWidth:200 }}>
                  <div style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", color:T.muted }} title={a.impact}>{a.impact||"—"}</div>
                  {a.receptors && <div style={{ fontFamily:T.mono, fontSize:10, color:T.faint, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{a.receptors}</div>}
                </td>
                <td style={{ padding:"9px 12px", textAlign:"center" }}>
                  <span style={{ fontFamily:T.mono, fontWeight:500, fontSize:13, color:T.text }}>{score!==null?score:"—"}</span>
                </td>
                <td style={{ padding:"9px 12px" }}>{sig?<span style={sigStyle(sig)}>{sig}</span>:<span style={{ color:T.faint }}>—</span>}</td>
                <td style={{ padding:"9px 12px" }}>
                  <span style={{ fontFamily:T.mono, fontSize:9, padding:"2px 6px", borderRadius:3, background:T.slateBg, color:T.slate }}>{a.status}</span>
                </td>
                <td style={{ padding:"9px 12px", whiteSpace:"nowrap" }}>
                  <Btn size="sm" onClick={()=>onEdit(a)}>Edit</Btn>{" "}
                  <Btn size="sm" variant="danger" onClick={()=>onDel(a)}>x</Btn>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  // Shared opp table renderer
  const OppTable = ({ rows, onEdit, onDelete: onDel }) => (
    <div style={{ overflowX:"auto", borderRadius:8, border:"1px solid "+T.border, background:T.surface }}>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12, fontFamily:T.sans }}>
        <thead><tr>{["Ref","Type","Description","Linked aspect","Score","Priority","Materiality","Status",""].map(h=><TH key={h}>{h}</TH>)}</tr></thead>
        <tbody>
          {rows.map((o) => {
            const score  = calcOppScore(o);
            const sc     = score>=18?{bg:T.tealBg,c:T.tealDark,bd:T.tealBd}:score>=9?{bg:T.tealBg,c:T.teal,bd:T.tealBd}:{bg:T.purpleBg,c:T.purple,bd:T.purpleBd};
            const matC   = o.materiality&&o.materiality.startsWith("Inside")?{bg:T.tealBg,c:T.teal}:o.materiality&&o.materiality.startsWith("Outside")?{bg:T.blueBg,c:T.blue}:{bg:T.purpleBg,c:T.purple};
            const rc     = rowColor(o);
            const leftBd = rc ? "3px solid "+rc.head : "3px solid transparent";
            return (
              <tr key={o.id} style={{ borderBottom:"1px solid "+T.rowBd, borderLeft:leftBd }}>
                <td style={{ padding:"9px 12px" }}>
                  <span style={{ fontFamily:T.mono, fontSize:10, fontWeight:500, color:T.purple }}>{o.ref}</span>
                </td>
                <td style={{ padding:"9px 12px", maxWidth:130 }}>
                  {o.type
                    ? <span style={{ fontFamily:T.mono, fontSize:9, padding:"2px 7px", borderRadius:3,
                                     background:rc?rc.bg:T.purpleBg, color:rc?rc.head:T.purple,
                                     border:"1px solid "+(rc?rc.border:T.purpleBd), whiteSpace:"nowrap" }}>{o.type}</span>
                    : <span style={{ color:T.faint }}>—</span>}
                </td>
                <td style={{ padding:"9px 12px", maxWidth:200 }}>
                  <div style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                                fontWeight:500, color: rc ? rc.head : T.text }} title={o.description}>
                    {o.description||"—"}
                  </div>
                  {o.envBenefit && <div style={{ fontSize:11, color: rc ? rc.text : T.teal, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>Env: {o.envBenefit}</div>}
                </td>
                <td style={{ padding:"9px 12px" }}>
                  {o.aspectRef?<span style={{ fontFamily:T.mono, fontSize:9, padding:"2px 6px", borderRadius:3, background:T.tealBg, color:T.teal }}>{o.aspectRef}</span>:<span style={{ color:T.faint }}>—</span>}
                </td>
                <td style={{ padding:"9px 12px", textAlign:"center" }}>
                  <span style={{ fontFamily:T.mono, fontWeight:500, fontSize:13, color:T.text }}>{score>0?score:"—"}</span>
                </td>
                <td style={{ padding:"9px 12px" }}>
                  {score>0?<span style={{ fontFamily:T.mono, fontSize:9, padding:"2px 7px", borderRadius:3, background:sc.bg, color:sc.c, border:"1px solid "+sc.bd }}>{score>=18?"High":score>=9?"Medium":"Low"}</span>:<span style={{ color:T.faint }}>—</span>}
                </td>
                <td style={{ padding:"9px 12px" }}>
                  {o.materiality?<span style={{ fontFamily:T.mono, fontSize:9, padding:"2px 6px", borderRadius:3, background:matC.bg, color:matC.c }}>{o.materiality.split(" (")[0]}</span>:<span style={{ color:T.faint }}>—</span>}
                </td>
                <td style={{ padding:"9px 12px" }}>
                  <span style={{ fontFamily:T.mono, fontSize:9, padding:"2px 6px", borderRadius:3, background:T.slateBg, color:T.slate }}>{o.status}</span>
                </td>
                <td style={{ padding:"9px 12px", whiteSpace:"nowrap" }}>
                  <Btn size="sm" onClick={()=>onEdit(o)}>Edit</Btn>{" "}
                  <Btn size="sm" variant="danger" onClick={()=>onDel(o)}>x</Btn>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const TABS = ["dashboard","screening","aspects","opportunities","changes","settings"];

  return (
    <div style={{ padding:"1.25rem", background:T.bg, minHeight:"100%" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                    marginBottom:"1.25rem", flexWrap:"wrap", gap:8 }}>
        <div style={{ display:"flex", gap:0, borderBottom:"2px solid "+T.border }}>
          {TABS.map(t => (
            <button key={t} onClick={()=>setTab(t)}
              style={{ padding:"8px 14px", fontSize:12, cursor:"pointer", fontFamily:T.sans,
                       fontWeight:500, background:"transparent", border:"none",
                       borderBottom: tab===t ? "2px solid "+T.teal : "2px solid transparent",
                       marginBottom:"-2px", color: tab===t ? T.teal : T.muted }}>
              {t.charAt(0).toUpperCase()+t.slice(1)}
            </button>
          ))}
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {project.type  && <span style={{ fontFamily:T.mono, fontSize:9, padding:"3px 8px", borderRadius:3, background:T.slateBg, color:T.slate, border:"1px solid "+T.slateBd, letterSpacing:"0.05em" }}>{project.type}</span>}
          {project.phase && <span style={{ fontFamily:T.mono, fontSize:9, padding:"3px 8px", borderRadius:3, background:T.blueBg,  color:T.blue,  border:"1px solid "+T.blueBd,  letterSpacing:"0.05em" }}>{project.phase}</span>}
        </div>
      </div>

      {tab === "dashboard" && (
        <div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(110px,1fr))", gap:8, marginBottom:"1.25rem" }}>
            <StatCard label="All aspects"   value={aspects.length} filterId="all"   color={T.text}   border={T.border}   bg={T.surface}/>
            <StatCard label="Significant"   value={sigCount}       filterId="sig"   color={T.red}    border={T.redBd}    bg={T.redBg}/>
            <StatCard label="Watch"         value={watchCount}     filterId="watch" color={T.amber}  border={T.amberBd}  bg={T.amberBg}/>
            <StatCard label="Low"           value={lowCount}       filterId="low"   color={T.green}  border={T.greenBd}  bg={T.greenBg}/>
            <StatCard label="Opportunities" value={opps.length}    filterId="opps"  color={T.purple} border={T.purpleBd} bg={T.purpleBg}/>
          </div>

          {dashFilter !== "all" && dashFilter !== "opps" && (
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:"1rem" }}>
              <span style={{ fontFamily:T.mono, fontSize:10, color:T.muted }}>
                Showing: <strong style={{ color:T.text }}>{dashFilter==="sig"?"Significant":dashFilter==="watch"?"Watch":"Low"}</strong> ({dashAspects.length})
              </span>
              <button onClick={()=>setDashFilter("all")} style={{ fontFamily:T.mono, fontSize:10, background:"transparent", border:"none", color:T.teal, cursor:"pointer", padding:0 }}>
                Clear filter x
              </button>
            </div>
          )}

          {dashFilter === "opps" && (
            <div style={{ marginBottom:"1rem" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:"0.75rem" }}>
                <span style={{ fontFamily:T.mono, fontSize:10, color:T.muted }}>Showing: <strong style={{ color:T.text }}>Opportunities</strong> ({opps.length})</span>
                <button onClick={()=>setDashFilter("all")} style={{ fontFamily:T.mono, fontSize:10, background:"transparent", border:"none", color:T.teal, cursor:"pointer", padding:0 }}>Clear filter x</button>
              </div>
              {opps.length===0
                ? <div style={{ textAlign:"center", padding:"2rem", background:T.surface, borderRadius:8, border:"1px solid "+T.border, color:T.faint, fontSize:12 }}>No opportunities yet.</div>
                : <OppTable rows={opps} onEdit={setEditOpp} onDelete={deleteOpp}/>}
            </div>
          )}

          {dashFilter !== "opps" && (
            dashAspects.length === 0 ? (
              <div style={{ textAlign:"center", padding:"2.5rem", background:T.surface, borderRadius:8, border:"1px solid "+T.border, color:T.faint }}>
                {dashFilter==="all"
                  ? <><p style={{ margin:"0 0 6px", fontSize:14, color:T.muted }}>No aspects identified yet.</p>
                      <p style={{ margin:"0 0 16px", fontSize:12 }}>Use the Screening tab to get started.</p>
                      <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
                        <Btn variant="primary" onClick={()=>setTab("screening")}>Open Screening</Btn>
                        <Btn onClick={()=>setEditAspect(emptyAspect())}>+ Manual entry</Btn>
                      </div></>
                  : <p style={{ margin:0, fontSize:13, color:T.muted }}>No {dashFilter==="sig"?"significant":dashFilter==="watch"?"watch":dashFilter} aspects.</p>}
              </div>
            ) : (
              <AspectTable rows={dashAspects} onEdit={setEditAspect} onDelete={deleteAspect}/>
            )
          )}
        </div>
      )}

      {tab === "screening" && (
        <ScreeningTab project={project} onAddAspect={saveAspect} onAddOpp={saveOpp}/>
      )}

      {tab === "aspects" && (
        <div>
          <div style={{ display:"flex", gap:8, marginBottom:"1rem", alignItems:"center", flexWrap:"wrap" }}>
            <Btn variant="primary" onClick={()=>setEditAspect(emptyAspect())}>+ Add aspect</Btn>
            <button onClick={()=>setAiOpen(v=>!v)}
              style={{ padding:"7px 13px", fontSize:12, borderRadius:6, cursor:"pointer", fontFamily:T.sans,
                       fontWeight:500, border:"1px solid "+T.purpleBd,
                       background:aiOpen?T.purpleBg:"transparent", color:T.purple }}>
              AI suggest
            </button>
            <div style={{ display:"flex", gap:3, marginLeft:"auto" }}>
              {["All","SIGNIFICANT","WATCH","Low"].map(f => (
                <button key={f} onClick={()=>setAspFilter(f)}
                  style={{ fontFamily:T.mono, padding:"4px 9px", fontSize:10, borderRadius:4, cursor:"pointer",
                           fontWeight:aspFilter===f?500:400, letterSpacing:"0.03em",
                           border: aspFilter===f ? "1px solid "+T.teal : "1px solid "+T.border,
                           background: aspFilter===f ? T.tealBg : "transparent",
                           color: aspFilter===f ? T.teal : T.muted }}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          {aiOpen && <AIPanel project={project} onAdd={s=>saveAspect({...emptyAspect(),...s,stakeholderConcern:"N"})}/>}
          {filteredAspects.length === 0 ? (
            <div style={{ textAlign:"center", padding:"3rem", background:T.surface, borderRadius:8, border:"1px solid "+T.border, color:T.faint, fontSize:12 }}>
              {aspects.length===0?"No aspects yet. Use the Screening tab or add one manually.":"No aspects match ""+aspFilter+""."}
            </div>
          ) : (
            <AspectTable rows={filteredAspects} onEdit={setEditAspect} onDelete={deleteAspect}/>
          )}
        </div>
      )}

      {tab === "opportunities" && (
        <div>
          <div style={{ display:"flex", gap:8, marginBottom:"1rem", alignItems:"center" }}>
            <Btn variant="primary" onClick={()=>setEditOpp(emptyOpp())}>+ Add opportunity</Btn>
            <span style={{ marginLeft:"auto", fontFamily:T.mono, fontSize:10, color:T.faint }}>
              {opps.length} opportunit{opps.length!==1?"ies":"y"}
            </span>
          </div>
          {opps.length === 0 ? (
            <div style={{ textAlign:"center", padding:"3rem", background:T.surface, borderRadius:8, border:"1px solid "+T.border, color:T.faint, fontSize:12 }}>
              <p style={{ margin:"0 0 8px", fontSize:13, color:T.muted }}>No opportunities tracked yet.</p>
              <p style={{ fontSize:12, margin:0 }}>ISO 14001:2015 Cl.6.1.2 requires identifying both risks and opportunities.</p>
            </div>
          ) : (
            <OppTable rows={opps} onEdit={setEditOpp} onDelete={deleteOpp}/>
          )}
        </div>
      )}

      {tab === "changes" && (
        <div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1rem" }}>
            <div>
              <h3 style={{ margin:"0 0 2px", fontSize:14, fontWeight:600, fontFamily:T.sans }}>Change log</h3>
              <p style={{ margin:0, fontSize:12, color:T.muted }}>{changelog.length} recorded change{changelog.length!==1?"s":""}</p>
            </div>
          </div>
          {changelog.length === 0 ? (
            <div style={{ textAlign:"center", padding:"3rem", background:T.surface, borderRadius:8, border:"1px solid "+T.border, color:T.faint, fontSize:12 }}>
              No changes recorded yet. Changes are logged automatically when you add, edit, or delete aspects and opportunities.
            </div>
          ) : (
            <div style={{ background:T.surface, borderRadius:8, border:"1px solid "+T.border, overflow:"hidden" }}>
              {[...changelog].reverse().map((entry, i) => {
                const isAdd    = entry.action.startsWith("Added");
                const isEdit   = entry.action.startsWith("Edited");
                const isDel    = entry.action.startsWith("Deleted");
                const dot      = isAdd ? T.teal : isEdit ? T.amber : T.red;
                const ts       = new Date(entry.ts);
                const dateStr  = ts.toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" });
                const timeStr  = ts.toLocaleTimeString("en-GB", { hour:"2-digit", minute:"2-digit" });
                return (
                  <div key={entry.id} style={{ display:"flex", gap:12, padding:"12px 16px",
                                               borderBottom: i < changelog.length-1 ? "1px solid "+T.rowBd : "none",
                                               alignItems:"flex-start" }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:dot, marginTop:5, flexShrink:0 }}/>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:2 }}>
                        <span style={{ fontFamily:T.mono, fontSize:10, fontWeight:500,
                                       color: isAdd?T.teal:isEdit?T.amber:T.red,
                                       background: isAdd?T.tealBg:isEdit?T.amberBg:T.redBg,
                                       padding:"1px 6px", borderRadius:3 }}>
                          {entry.action}
                        </span>
                      </div>
                      <p style={{ margin:0, fontSize:12, color:T.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {entry.detail}
                      </p>
                    </div>
                    <div style={{ flexShrink:0, textAlign:"right" }}>
                      <p style={{ fontFamily:T.mono, fontSize:9, color:T.faint, margin:0 }}>{dateStr}</p>
                      <p style={{ fontFamily:T.mono, fontSize:9, color:T.faint, margin:0 }}>{timeStr}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === "settings" && (
        <div>
          <Card style={{ marginBottom:"1rem" }}>
            <SectionLabel>Project details</SectionLabel>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px 16px" }}>
              {[{k:"name",l:"Project name"},{k:"company",l:"Company"}].map(({ k, l }) => (
                <div key={k}>
                  <Fld label={l}><input value={project[k]||""} onChange={e=>onChange({...project,[k]:e.target.value})} placeholder={l} style={iw}/></Fld>
                </div>
              ))}
              <Fld label="Project type">
                <select value={project.type||""} onChange={e=>onChange({...project,type:e.target.value})} style={iw}>
                  <option value="">Select type</option>{PROJ_TYPES.map(t=><option key={t}>{t}</option>)}
                </select>
              </Fld>
              <Fld label="Current phase">
                <select value={project.phase||""} onChange={e=>onChange({...project,phase:e.target.value})} style={iw}>
                  <option value="">Select phase</option>{PHASES.map(p=><option key={p}>{p}</option>)}
                </select>
              </Fld>
            </div>
          </Card>
          <div style={{ padding:"1.25rem", borderRadius:8, background:T.redBg, border:"1px solid "+T.redBd }}>
            <p style={{ fontFamily:T.mono, fontSize:10, fontWeight:500, color:T.red, margin:"0 0 6px", letterSpacing:"0.05em", textTransform:"uppercase" }}>Danger zone</p>
            <p style={{ fontSize:12, color:T.muted, margin:"0 0 12px" }}>Deleting this project permanently removes all its aspects and opportunities. This cannot be undone.</p>
            {!confirmDelete
              ? <Btn variant="danger" onClick={()=>setConfirmDelete(true)}>Delete project</Btn>
              : (
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontFamily:T.mono, fontSize:11, color:T.red }}>Are you sure?</span>
                  <Btn variant="danger" onClick={onDelete}>Yes, delete permanently</Btn>
                  <Btn onClick={()=>setConfirmDelete(false)}>Cancel</Btn>
                </div>
              )
            }
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ projects, activeId, onSelect, onNew, isDark, onToggleTheme }) {
  return (
    <div style={{ width:215, flexShrink:0, background:T.sbBg, display:"flex", flexDirection:"column", minHeight:"100vh" }}>
      <div style={{ padding:"16px 16px 12px", borderBottom:"1px solid "+T.sbBd }}>
        <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:10 }}>
          <div style={{ width:26, height:26, background:T.teal, borderRadius:5, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="5.5" stroke="white" strokeWidth="1.5"/>
              <path d="M7 4v3.5l2 1.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div style={{ flex:1 }}>
            <p style={{ fontFamily:T.mono, fontSize:11, fontWeight:500, color:T.sbText, margin:0, letterSpacing:"0.05em" }}>ENV·ASPECTS</p>
            <p style={{ fontFamily:T.mono, fontSize:9, color:T.sbFaint, margin:0, letterSpacing:"0.07em" }}>TOOLKIT</p>
          </div>
          <ThemeToggle isDark={isDark} onToggle={onToggleTheme}/>
        </div>
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"10px 8px" }}>
        <p style={{ fontFamily:T.mono, fontSize:9, fontWeight:500, color:T.sbFaint, letterSpacing:"0.1em", textTransform:"uppercase", margin:"0 8px 8px" }}>
          Projects ({projects.length})
        </p>
        {projects.length === 0 && <p style={{ fontFamily:T.mono, fontSize:10, color:T.sbFaint, padding:"0 8px", fontStyle:"italic" }}>No projects yet</p>}
        {projects.map(p => {
          const sigC    = (p.aspects||[]).filter(a=>calcSig(a)==="SIGNIFICANT").length;
          const isActive = p.id === activeId;
          return (
            <button key={p.id} onClick={()=>onSelect(p.id)}
              style={{ width:"100%", textAlign:"left", padding:"8px 10px", borderRadius:6, marginBottom:1,
                       cursor:"pointer", fontFamily:T.sans, border:"1px solid transparent",
                       background: isActive ? T.sbBg2 : "transparent",
                       borderColor: isActive ? T.sbBd : "transparent" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:6 }}>
                <span style={{ fontSize:12, fontWeight:isActive?600:400, color:isActive?T.sbText:T.sbMuted,
                               overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  {p.name || <span style={{ color:T.sbFaint, fontStyle:"italic" }}>Unnamed project</span>}
                </span>
                {sigC>0 && <span style={{ fontFamily:T.mono, fontSize:9, fontWeight:500, padding:"1px 5px",
                                          borderRadius:3, background:T.sbSig, color:T.sbSigTx, flexShrink:0 }}>{sigC}</span>}
              </div>
              <p style={{ fontFamily:T.mono, fontSize:9, color:T.sbFaint, margin:"2px 0 0",
                          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {p.type||"No type"} · {(p.aspects||[]).length} aspects
              </p>
            </button>
          );
        })}
      </div>
      <div style={{ padding:"8px", borderTop:"1px solid "+T.sbBd }}>
        <button onClick={onNew}
          style={{ width:"100%", padding:"8px", borderRadius:6, border:"1px dashed "+T.sbBd,
                   background:"transparent", color:T.sbFaint, fontFamily:T.mono, fontSize:11, cursor:"pointer" }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=T.teal;e.currentTarget.style.color=T.teal;}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--sb-bd)";e.currentTarget.style.color="var(--sb-faint)";}}>
          + New project
        </button>
      </div>
    </div>
  );
}

// ── Root App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [projects, setProjects] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loaded,   setLoaded]   = useState(false);
  const [isDark,   setIsDark]   = useState(false);

  useEffect(() => {
    applyTheme("light");
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const d = JSON.parse(saved);
        if (d.projects && d.projects.length) {
          setProjects(d.projects);
          setActiveId(d.activeId || d.projects[0].id);
        }
        if (d.theme === "dark") { setIsDark(true); applyTheme("dark"); }
      }
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ projects, activeId, theme: isDark?"dark":"light" })); } catch {}
  }, [projects, activeId, loaded, isDark]);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    applyTheme(next?"dark":"light");
  };

  const createProject = () => {
    const p = newProject();
    setProjects(prev => [...prev, p]);
    setActiveId(p.id);
  };
  const updateProject = u => setProjects(prev => prev.map(p => p.id===u.id ? u : p));
  const deleteProject = id => {
    const remaining = projects.filter(p => p.id !== id);
    setProjects(remaining);
    setActiveId(remaining.length>0 ? remaining[remaining.length-1].id : null);
  };

  if (!loaded) return (
    <div style={{ padding:"2rem", fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:"var(--muted)", background:"var(--bg)", minHeight:"100vh" }}>
      Loading...
    </div>
  );

  const active = projects.find(p => p.id === activeId) || null;

  return (
    <div style={{ display:"flex", minHeight:"100vh", fontFamily:T.sans, color:T.text, background:T.bg }}>
      <Sidebar projects={projects} activeId={activeId} onSelect={setActiveId} onNew={createProject}
               isDark={isDark} onToggleTheme={toggleTheme}/>
      <div style={{ flex:1, overflowX:"hidden", display:"flex", flexDirection:"column" }}>
        {!active ? (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                        flex:1, gap:14, padding:"2rem" }}>
            <div style={{ width:48, height:48, background:T.teal, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <circle cx="11" cy="11" r="9" stroke="white" strokeWidth="1.8"/>
                <path d="M11 7v4.5l2.5 2" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <p style={{ fontSize:16, fontWeight:600, color:T.text, margin:0 }}>No project selected</p>
            <p style={{ fontSize:13, color:T.muted, margin:0, textAlign:"center" }}>Create a new project to get started.</p>
            <button onClick={createProject}
              style={{ padding:"9px 20px", borderRadius:7, border:"none", background:T.teal, color:"#fff",
                       fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:T.sans, marginTop:4 }}>
              + New project
            </button>
          </div>
        ) : (
          <div style={{ flex:1, display:"flex", flexDirection:"column" }}>
            <div style={{ padding:"14px 20px 0", background:T.surface, borderBottom:"1px solid "+T.border }}>
              <div style={{ display:"flex", alignItems:"baseline", gap:10, marginBottom:0 }}>
                <h1 style={{ fontSize:17, fontWeight:600, margin:0, fontFamily:T.sans, color:T.text }}>
                  {active.name || <span style={{ color:T.faint, fontStyle:"italic" }}>Unnamed project</span>}
                </h1>
                {active.company && <span style={{ fontSize:12, color:T.muted }}>{active.company}</span>}
              </div>
            </div>
            <div style={{ flex:1, overflow:"auto" }}>
              <ProjectView key={active.id} project={active} onChange={updateProject} onDelete={()=>deleteProject(active.id)}/>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
