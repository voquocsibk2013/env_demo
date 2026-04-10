import { useState, useEffect } from "react";


// ── Constants ─────────────────────────────────────────────────────────────────
const PHASES        = ["Concept / FEED","Construction","Drilling","Operations","Maintenance","Decommissioning","Commissioning"];
const CONDITIONS    = ["Normal","Abnormal","Emergency"];
const SENSITIVITIES = ["High","Medium","Low"];
const SCALES        = ["Global","Regional","Local"];
const DURATIONS     = ["Permanent (>10yr)","Long-term (1-10yr)","Temporary (<1yr)"];
const PROJ_TYPES    = ["Offshore O&G","Onshore Infrastructure","Industrial / Process"];
const STATUSES      = ["Open","In Progress","Closed"];
const OPP_TYPES     = ["Resource Efficiency","Circular Economy","Low-Carbon Technology","Nature-Based Solutions","Green Finance & Taxonomy","New Business / Market","Reputational / SLO","Climate Resilience","Regulatory Incentive","Biodiversity Net Gain"];
const OPP_STATUSES  = ["Open","In Progress","Closed"];
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
      { kw:"Modular / demountable design",  q:"Can structural elements, modules or equipment be designed for disassembly and reuse at end of project life?",               opp:"Circular economy - design for disassembly and reuse", type:"Circular Economy",           area:"Engineering design" },
      { kw:"Material efficiency at FEED",   q:"Can material volumes be reduced through optimised structural design, shared infrastructure, or prefabrication?",            opp:"Resource efficiency - material reduction at source", type:"Resource Efficiency",            area:"Engineering design" },
      { kw:"Renewable energy integration",  q:"Is there scope to integrate solar, wind or waste-heat recovery into the facility design at FEED stage?",                    opp:"Low-carbon technology - on-site renewable energy generation", type:"Low-Carbon Technology",   area:"Process design" },
      { kw:"Heat recovery / WHR",           q:"Are there process streams with significant waste heat that could be captured for power generation or heating?",             opp:"Resource efficiency - waste heat recovery", type:"Resource Efficiency",                     area:"Process design" },
    ]},
    { cat:"Nature & biodiversity by design", color:"green", items:[
      { kw:"Biodiversity net gain target",  q:"Can the facility deliver measurable BNG - green roofs, habitat corridors, artificial reefs?",                               opp:"Biodiversity net gain - habitat creation or enhancement", type:"Biodiversity Net Gain",       area:"Site design" },
      { kw:"Nature-based drainage",         q:"Can SuDS, wetlands or bioswales replace hard engineered drainage?",                                                         opp:"Nature-based solutions - SuDS and natural flood management", type:"Nature-Based Solutions",    area:"Drainage design" },
    ]},
    { cat:"Green finance & taxonomy", color:"purple", items:[
      { kw:"EU Taxonomy alignment at FEED", q:"Which activities in the design qualify as substantially contributing to climate mitigation under EU Taxonomy?",             opp:"Green Finance & Taxonomy - EU Taxonomy-aligned project elements", type:"Green Finance & Taxonomy",area:"Engineering design" },
      { kw:"Green bonds / SLL finance",     q:"Can project finance be structured as green bonds or sustainability-linked loans tied to environmental KPI targets?",        opp:"Green Finance & Taxonomy - green bond or sustainability-linked loan", type:"Green Finance & Taxonomy", area:"Project finance" },
    ]},
  ],
  P:[
    { cat:"Sustainable procurement", color:"teal", items:[
      { kw:"Low-carbon materials spec",     q:"Can the procurement spec require EPDs and low-embodied-carbon materials (recycled steel, low-carbon concrete)?",             opp:"Low-carbon technology - low-embodied-carbon materials procurement", type:"Low-Carbon Technology",area:"Procurement" },
      { kw:"Circular supplier requirements",q:"Can suppliers be required to take back packaging, surplus or end-of-life equipment?",                                       opp:"Circular economy - supplier take-back and packaging reduction", type:"Circular Economy",  area:"Procurement" },
    ]},
    { cat:"Supply chain emissions", color:"amber", items:[
      { kw:"Low-emission logistics",        q:"Can low-emission transport (rail, LNG vessels, electric HGVs) be specified in logistics contracts?",                        opp:"Low-carbon technology - low-emission transport in supply chain", type:"Low-Carbon Technology", area:"Logistics" },
      { kw:"Local sourcing",                q:"Can materials and services be sourced locally or regionally to reduce transport emissions and support local economy?",      opp:"Resource efficiency - local sourcing reduces transport GHG", type:"Resource Efficiency",     area:"Procurement" },
    ]},
  ],
  C:[
    { cat:"Waste minimisation & circular economy", color:"teal", items:[
      { kw:"On-site concrete recycling",    q:"Can demolished or surplus concrete be crushed and reused as recycled aggregate on-site?",                                    opp:"Circular economy - on-site concrete aggregate recycling", type:"Circular Economy",       area:"Demolition / civil works" },
      { kw:"Construction waste exchange",   q:"Can surplus materials (timber, steel offcuts, cabling) be offered to a materials exchange or social enterprise?",          opp:"Circular economy - materials exchange / reuse of surplus", type:"Circular Economy",      area:"Construction compound" },
    ]},
    { cat:"Ecology enhancement", color:"green", items:[
      { kw:"Habitat creation during construction",q:"Can topsoil be stored and reused, and habitat features be created as part of the construction scope?",               opp:"Biodiversity net gain - habitat creation during construction", type:"Biodiversity Net Gain",  area:"Site preparation" },
      { kw:"Invasive species eradication",  q:"Can clearance works provide an opportunity to permanently remove invasive plant species from the site?",                    opp:"Biodiversity net gain - invasive species eradication", type:"Biodiversity Net Gain",          area:"Site preparation" },
    ]},
    { cat:"Low-carbon construction", color:"amber", items:[
      { kw:"Stage V / zero-emission plant", q:"Can the construction plant fleet be specified as Stage V diesel or battery / hydrogen electric?",                           opp:"Low-carbon technology - zero-emission construction plant", type:"Low-Carbon Technology",      area:"Construction plant" },
      { kw:"Renewable site power",          q:"Can solar panels, battery storage or grid connections replace diesel generators for site power?",                           opp:"Low-carbon technology - renewable site power during construction", type:"Low-Carbon Technology",area:"Construction compound" },
    ]},
  ],
  I:[
    { cat:"Marine ecology enhancement", color:"teal", items:[
      { kw:"Artificial reef / habitat",     q:"Could jacket legs, scour protection or cable burial create habitat for fish, corals or invertebrates?",                     opp:"Biodiversity net gain - artificial reef / marine habitat creation", type:"Biodiversity Net Gain",area:"Structure installation" },
      { kw:"Marine protected area benefit", q:"Could exclusion zones create de facto MPAs, benefiting fish stocks and biodiversity?",                                      opp:"Nature-based solutions - de facto MPA / marine reserve benefit", type:"Nature-Based Solutions",area:"Marine operations" },
    ]},
    { cat:"Low-carbon vessel operations", color:"green", items:[
      { kw:"Shore power / hybrid vessels",  q:"Can installation vessels use shore power at port, hybrid propulsion or LNG / methanol fuel?",                               opp:"Low-carbon technology - low-emission installation vessels", type:"Low-Carbon Technology",     area:"Vessel operations" },
      { kw:"Voyage optimisation",           q:"Can route planning, weather routing and slow steaming minimise fuel consumption across the campaign?",                      opp:"Resource efficiency - fuel savings from voyage optimisation", type:"Resource Efficiency",   area:"Marine logistics" },
    ]},
    { cat:"Regulatory incentives", color:"purple", items:[
      { kw:"Norwegian O&G incentives",      q:"Are there Norwegian government or Enova grant schemes available for low-carbon offshore installation?",                     opp:"Regulatory incentive - Norwegian Enova / state grant for low-carbon ops", type:"Regulatory Incentive",area:"Project finance" },
    ]},
  ],
  C2:[
    { cat:"Chemical & water efficiency", color:"teal", items:[
      { kw:"Hydrotest water reuse",         q:"Can hydrotest water be reused across multiple systems or treated and re-injected?",                                          opp:"Resource efficiency - hydrotest water recycling", type:"Resource Efficiency",               area:"Commissioning - hydrotest" },
      { kw:"Chemical substitution",         q:"Can less hazardous alternatives replace standard commissioning chemicals?",                                                 opp:"Resource efficiency - hazardous chemical substitution", type:"Resource Efficiency",         area:"Chemical management" },
    ]},
    { cat:"Flaring minimisation", color:"amber", items:[
      { kw:"Gas capture during start-up",   q:"Can commissioning gas be captured for on-site power generation rather than flared?",                                        opp:"Low-carbon technology - gas capture instead of flaring", type:"Low-Carbon Technology",        area:"Commissioning - flaring" },
      { kw:"Cold commissioning priority",   q:"Can the commissioning sequence be optimised to maximise cold commissioning and minimise hot flaring volumes?",              opp:"Resource efficiency - reduced commissioning flare volumes", type:"Resource Efficiency",      area:"Commissioning sequence" },
    ]},
  ],
  OM:[
    { cat:"Operational efficiency & carbon", color:"teal", items:[
      { kw:"Electrification of offshore",   q:"Can gas turbines be replaced or supplemented by grid power or renewable energy to reduce operational emissions?",           opp:"Low-carbon technology - offshore electrification / power from shore", type:"Low-Carbon Technology",area:"Power systems" },
      { kw:"CCUS opportunity",              q:"Is there scope to capture and store CO2 from process operations, contributing to Norwegian CCS targets?",                  opp:"Low-carbon technology - carbon capture, utilisation and storage", type:"Low-Carbon Technology",area:"Process design" },
      { kw:"Methane monetisation",          q:"Can vented or flared methane be recovered and sold, generating revenue while reducing GHG emissions?",                      opp:"Resource efficiency - methane recovery and monetisation", type:"Resource Efficiency",       area:"Production operations" },
      { kw:"Produced water as a resource",  q:"Can treated produced water be beneficially reused for injection, dust suppression or other uses?",                         opp:"Circular economy - produced water beneficial reuse", type:"Circular Economy",            area:"Water treatment" },
    ]},
    { cat:"Sustainability reporting", color:"purple", items:[
      { kw:"CSRD / ESRS reporting",         q:"Can environmental KPI data be structured to directly support CSRD ESRS E1-E5 mandatory disclosures?",                        opp:"Reputational / SLO - CSRD / ESRS reporting-ready KPI framework", type:"Reputational / SLO",area:"Sustainability reporting" },
      { kw:"SBTi / net zero alignment",     q:"Can emission reduction measures be aligned with Science Based Targets (SBTi) to support net-zero commitments?",             opp:"Reputational / SLO - SBTi / net-zero target alignment", type:"Reputational / SLO",         area:"GHG management" },
    ]},
    { cat:"Climate resilience", color:"amber", items:[
      { kw:"Climate risk assessment",       q:"Has a TCFD-aligned physical climate risk assessment been carried out for 2050+ scenarios?",                                  opp:"Climate resilience - physical climate risk adaptation measures", type:"Climate Resilience", area:"Asset integrity" },
    ]},
  ],
  D:[
    { cat:"Materials recovery & circular economy", color:"teal", items:[
      { kw:"Steel recycling maximisation",  q:"Can all removed steel be sent to high-grade recycling (EAF steelmaking) rather than lower-grade recovery?",                 opp:"Circular economy - high-grade steel recycling from decommissioning", type:"Circular Economy",area:"Decommissioning" },
      { kw:"Equipment refurbishment / reuse",q:"Can equipment, instruments, valves or piping be refurbished and resold rather than scrapped?",                            opp:"Circular economy - equipment reuse and refurbishment", type:"Circular Economy",          area:"Decommissioning" },
      { kw:"Concrete aggregate recovery",   q:"Can demolition concrete be processed for recycled aggregate rather than going to landfill?",                                opp:"Circular economy - recycled aggregate from demolition concrete", type:"Circular Economy", area:"Demolition" },
    ]},
    { cat:"Habitat & legacy benefits", color:"green", items:[
      { kw:"Seabed recovery as positive legacy",q:"Can post-decommissioning seabed surveys document improved benthic communities as a net positive environmental legacy?", opp:"Biodiversity net gain - documented seabed recovery as project legacy", type:"Biodiversity Net Gain",area:"Offshore decommissioning" },
      { kw:"Land restoration to higher standard",q:"Can land reinstatement go beyond pre-disturbance baseline - creating wetlands, meadows or community green space?",  opp:"Biodiversity net gain - land restored to higher ecological standard", type:"Biodiversity Net Gain",area:"Site reinstatement" },
    ]},
    { cat:"Decommissioning finance", color:"purple", items:[
      { kw:"Green decommissioning certification",q:"Are there emerging certification schemes or green bond frameworks for responsible decommissioning?",                   opp:"Green Finance & Taxonomy - green decommissioning certification / finance", type:"Green Finance & Taxonomy",area:"Project finance" },
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
    "--amber":       "#856404",
    "--amber-bg":    "#FFFBE6",
    "--amber-bd":    "#FFD700",
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
    "--sb-bg":       "#EAE7DF",
    "--sb-bg2":      "#DEDBD3",
    "--sb-bd":       "#CBC7BF",
    "--sb-text":     "#1A1C1E",
    "--sb-muted":    "#4B5563",
    "--sb-faint":    "#9CA3AF",
    "--sb-sig":      "#FCEBEB",
    "--sb-sig-text": "#A32D2D",
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
    "--amber":       "#FFD700",
    "--amber-bg":    "#1A1800",
    "--amber-bd":    "#A08000",
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
    "--sb-text":     "#F8F8F8",
    "--sb-muted":    "#B0BAC8",
    "--sb-faint":    "#6B7A8D",
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
  mono:     "'Inter', system-ui, sans-serif",
  sans:     "'Inter', system-ui, sans-serif",
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
function calcGhgTotal(o) {
  if (o.calcType==="qualitative") return null;
  const t1 = (o.ghgLines||[]).reduce((s,l)=>s+(parseFloat(l.qty)||0)*(parseFloat(l.cf)||0),0);
  const t2 = (o.customGhgRows||[]).reduce((s,r)=>s+(parseFloat(r.qty)||0)*(parseFloat(r.cf)||0),0);
  const t  = t1+t2;
  return t > 0 ? t : null;
}

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
  control:"", legalRef:"", owner:"", status:"Open", _color:"",
  createdAt:"", updatedAt:""
});
// ── GHG saving calculation lines (based on Norwegian EPCIC calculation framework) ─
const GHG_LINES = [
  // Scope 1 — Direct emissions to air
  { id:"s1_co2",   scope:"Scope 1", group:"Direct emission to air",   type:"CO2",                           unit:"kg",  cfDefault:1,    cfFixed:true  },
  { id:"s1_nox",   scope:"Scope 1", group:"Direct emission to air",   type:"NOx",                           unit:"kg",  cfDefault:296,  cfFixed:true  },
  { id:"s1_ch4",   scope:"Scope 1", group:"Direct emission to air",   type:"CH4",                           unit:"kg",  cfDefault:28,   cfFixed:true  },
  { id:"s1_nmvoc", scope:"Scope 1", group:"Direct emission to air",   type:"nmVOC",                         unit:"kg",  cfDefault:"",   cfFixed:false },
  { id:"s1_chem",  scope:"Scope 1", group:"Direct emission to air",   type:"Other (e.g. chemicals)",        unit:"kg",  cfDefault:"",   cfFixed:false },
  { id:"s1_refr",  scope:"Scope 1", group:"Direct emission to air",   type:"Other (e.g. refrigerants)",     unit:"kWh", cfDefault:"",   cfFixed:false },
  { id:"s1_other", scope:"Scope 1", group:"Direct emission to air",   type:"Other",                         unit:"kg",  cfDefault:"",   cfFixed:false },
  // Scope 2 — Energy
  { id:"s2_elec",  scope:"Scope 2", group:"Reduction energy consumption", type:"Reduction in energy consumption", unit:"kWh", cfDefault:0.57, cfFixed:true },
  // Scope 3 Cat 1 — Material
  { id:"s3_steel_reuse",   scope:"Scope 3 Cat 1", group:"Reduction in material", type:"Reuse of material (Steel)",                 unit:"kg", cfDefault:2,   cfFixed:true  },
  { id:"s3_other_simp",    scope:"Scope 3 Cat 1", group:"Reduction in material", type:"Simplified design (other material)",         unit:"kg", cfDefault:1.5, cfFixed:true  },
  { id:"s3_other_reuse",   scope:"Scope 3 Cat 1", group:"Reduction in material", type:"Reuse of material (other material)",         unit:"kg", cfDefault:1.5, cfFixed:true  },
  { id:"s3_steel_simp",    scope:"Scope 3 Cat 1", group:"Reduction in material", type:"Simplified design (Steel)",                  unit:"kg", cfDefault:2,   cfFixed:true  },
  // Scope 3 Cat 4 — Transport
  { id:"s3t_mat",   scope:"Scope 3 Cat 4", group:"Transportation", type:"Material",                         unit:"kg",  cfDefault:"",  cfFixed:false },
  { id:"s3t_add",   scope:"Scope 3 Cat 4", group:"Transportation", type:"Added / modified systems needed",  unit:"",    cfDefault:"",  cfFixed:false },
];

const emptyOpp = () => ({
  type:"", aspectRef:"", materiality:"Both",
  description:"", envBenefit:"", bizBenefit:"",
  envValue:3, bizValue:3, feasibility:3,
  action:"", alignment:"", owner:"", status:"Open", _color:"",
  createdAt:"", updatedAt:"",
  calcType:"qualitative",
  ghgLines: GHG_LINES.map(l => ({ id:l.id, qty:"", cf:l.cfDefault, ref:"" })),
  customGhgRows: []
});
const newProject = () => {
  const ts = Date.now();
  return {
    id: ts.toString(),
    projectId: "PRJ-"+ts.toString().slice(-5),
    name:"", company:"", contract:"", type:"", phase:"",
    createdAt: new Date().toISOString(),
    aspects:[], opps:[], changelog:[]
  };
};

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
  const base = { ...emptyOpp(), ...opp };
  // Preserve saved lines (new uid-format); drop old id-format lines from previous version
  const [f, setF] = useState({ ...base, ghgLines: GHG_LINES.map(l => { const s=(base.ghgLines||[]).find(x=>x.id===l.id); return { id:l.id, qty:s?s.qty:"", cf:(s&&s.cf!=="")?s.cf:l.cfDefault, ref:s?s.ref||"":"" }; }) });
  const set = (k, v) => setF(p => ({ ...p, [k]:v }));

  const score = calcOppScore(f);
  const sc = score>=75?{bg:T.tealBg,c:T.tealDark}:score>=30?{bg:T.tealBg,c:T.teal}:{bg:T.slateBg,c:T.slate};

  return (
    <div style={{ maxWidth:860, margin:"0 auto", padding:"1.5rem" }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:"1.5rem",
                    paddingBottom:"1rem", borderBottom:"1px solid "+T.border }}>
        <Btn onClick={onCancel} variant="ghost">Back</Btn>
        <h2 style={{ margin:0, fontSize:16, fontWeight:600, fontFamily:T.sans }}>{opp.id?"Edit opportunity":"New opportunity"}</h2>
      </div>

      {/* ── Description ── */}
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

      {/* ── Priority score ── */}
      <Card style={{ marginBottom:"1rem", background:T.tealBg }} accent={T.teal}>
        <SectionLabel>Priority score = env value x business value x feasibility (max 125)</SectionLabel>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"10px 14px" }}>
          {[{k:"envValue",l:"Env value (1-5)"},{k:"bizValue",l:"Business value (1-5)"},{k:"feasibility",l:"Feasibility (1-5)"}].map(({ k, l }) => (
            <Fld key={k} label={l}><input type="number" min={1} max={5} value={f[k]} onChange={e=>set(k,Math.min(5,Math.max(1,+e.target.value||1)))} style={iw}/></Fld>
          ))}
        </div>
        <div style={{ marginTop:12, paddingTop:10, borderTop:"1px solid "+T.tealBd, display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontFamily:T.mono, fontSize:11, color:T.muted }}>Score:</span>
          <span style={{ fontFamily:T.mono, fontSize:20, fontWeight:500, padding:"2px 12px", borderRadius:5, background:sc.bg, color:sc.c }}>{score}</span>
          <span style={{ fontSize:12, color:T.muted }}>{score>=75?"High priority - act now":score>=30?"Medium priority":"Low priority"}</span>
        </div>
      </Card>

      {/* ── Savings estimate ── */}
      <Card style={{ marginBottom:"1rem" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1rem" }}>
          <SectionLabel style={{ margin:0 }}>Savings estimate</SectionLabel>
          <div style={{ display:"inline-flex", borderRadius:6, overflow:"hidden", border:"1px solid "+T.border }}>
            {["qualitative","quantitative"].map(v => (
              <button key={v} onClick={()=>set("calcType",v)}
                style={{ padding:"5px 14px", fontSize:11, fontWeight:500, cursor:"pointer",
                         fontFamily:T.sans, border:"none",
                         background: f.calcType===v ? T.teal : T.surface,
                         color: f.calcType===v ? "#fff" : T.muted,
                         borderRight: v==="qualitative" ? "1px solid "+T.border : "none" }}>
                {v.charAt(0).toUpperCase()+v.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Qualitative */}
        {f.calcType === "qualitative" && (
          <div style={{ background:T.slateBg, borderRadius:7, padding:"12px 14px", border:"1px solid "+T.border }}>
            <p style={{ margin:"0 0 8px", fontSize:12, fontWeight:500, color:T.muted }}>Qualitative savings description</p>
            <textarea value={f.ghgNote||""} onChange={e=>set("ghgNote",e.target.value)} rows={3}
              placeholder="Describe expected savings — e.g. estimated 15% reduction in diesel consumption during commissioning; zero flaring during start-up avoids approx. 200 t CO₂e"
              style={{ ...iw, resize:"vertical", fontSize:12 }}/>
          </div>
        )}

        {/* Quantitative: table with reference column */}
        {f.calcType === "quantitative" && (() => {
          const setLine = (id, field, val) => setF(p => ({
            ...p, ghgLines: p.ghgLines.map(l => l.id===id ? {...l,[field]:val} : l)
          }));
          // Merge saved data into the full GHG_LINES template
          const lines = GHG_LINES.map(l => {
            const saved = (f.ghgLines||[]).find(x=>x.id===l.id);
            return { ...l, qty:saved?saved.qty:"", cf:(saved&&saved.cf!=="")?saved.cf:l.cfDefault, ref:saved?saved.ref||"":"" };
          });
          const ghgTotal  = lines.reduce((s,l) => s+(parseFloat(l.qty)||0)*(parseFloat(l.cf)||0), 0)
                           + (f.customGhgRows||[]).reduce((s,r)=>s+(parseFloat(r.qty)||0)*(parseFloat(r.cf)||0),0);
          const ghgTonnes = ghgTotal/1000;
          const scopeColors = {
            "Scope 1":      {bg:T.redBg,    c:T.red,    bd:T.redBd},
            "Scope 2":      {bg:T.blueBg,   c:T.blue,   bd:T.blueBd},
            "Scope 3 Cat 1":{bg:T.tealBg,   c:T.teal,   bd:T.tealBd},
            "Scope 3 Cat 4":{bg:T.purpleBg, c:T.purple, bd:T.purpleBd},
          };
          const scopeGroups = GHG_LINES.reduce((acc,l) => {
            if(!acc[l.scope]) acc[l.scope]=[];
            acc[l.scope].push(l); return acc;
          }, {});
          const thS = { padding:"6px 10px", textAlign:"left", fontSize:9, fontWeight:600,
                        color:T.muted, borderBottom:"1px solid "+T.border,
                        letterSpacing:"0.07em", textTransform:"uppercase", whiteSpace:"nowrap" };
          const tdS = (extra) => ({ padding:"6px 8px", fontSize:12, borderBottom:"1px solid "+T.rowBd, ...(extra||{}) });
          return (
            <div>
              {/* Live total banner */}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                            background:ghgTotal>0?T.tealBg:T.slateBg,
                            border:"1px solid "+(ghgTotal>0?T.tealBd:T.border),
                            borderRadius:8, padding:"12px 16px", marginBottom:"1rem" }}>
                <div>
                  <p style={{ margin:"0 0 2px", fontSize:11, fontWeight:600, color:ghgTotal>0?T.teal:T.faint,
                               letterSpacing:"0.06em", textTransform:"uppercase" }}>Total GHG saving</p>
                  <p style={{ margin:0, fontSize:11, color:T.muted }}>Enter reduction quantities in the table below</p>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontFamily:T.mono, fontSize:22, fontWeight:700, color:ghgTotal>0?T.teal:T.faint, lineHeight:1 }}>
                    {ghgTonnes>=1 ? ghgTonnes.toLocaleString("nb-NO",{maximumFractionDigits:2})+" t CO₂e"
                                  : ghgTotal.toLocaleString("nb-NO",{maximumFractionDigits:1})+" kg CO₂e"}
                  </div>
                  {ghgTonnes>=1 && <div style={{ fontFamily:T.mono, fontSize:10, color:T.muted, marginTop:2 }}>
                    = {ghgTotal.toLocaleString("nb-NO",{maximumFractionDigits:0})} kg CO₂e
                  </div>}
                </div>
              </div>

              {/* Table */}
              <div style={{ overflowX:"auto", borderRadius:8, border:"1px solid "+T.border }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12, fontFamily:T.sans }}>
                  <thead>
                    <tr style={{ background:T.surface2 }}>
                      <th style={thS}>Scope</th>
                      <th style={thS}>Type</th>
                      <th style={{ ...thS, textAlign:"right" }}>Unit</th>
                      <th style={{ ...thS, textAlign:"right" }}>Reduction qty</th>
                      <th style={{ ...thS, textAlign:"right" }}>CF (kg CO₂e)</th>
                      <th style={{ ...thS, textAlign:"right" }}>Saving (kg CO₂e)</th>
                      <th style={thS}>Reference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(scopeGroups).map(([scope, slines]) => {
                      const sc2 = scopeColors[scope]||{bg:T.slateBg,c:T.slate,bd:T.slateBd};
                      const customForScope = (f.customGhgRows||[]).filter(r=>r.scope===scope);
                      const addCustomRow = () => setF(p=>({ ...p, customGhgRows:[
                        ...(p.customGhgRows||[]),
                        { uid:"c"+Date.now(), scope, type:"", unit:"kg", qty:"", cf:"", ref:"" }
                      ]}));
                      const delCustomRow = uid => setF(p=>({ ...p, customGhgRows:(p.customGhgRows||[]).filter(r=>r.uid!==uid) }));
                      const setCustomRow = (uid,k,v) => setF(p=>({ ...p, customGhgRows:(p.customGhgRows||[]).map(r=>r.uid===uid?{...r,[k]:v}:r) }));
                      const totalRows = slines.length + customForScope.length + 1; // +1 for add-row button row
                      return [
                        ...slines.map((l, li) => {
                          const line   = lines.find(x=>x.id===l.id);
                          const qty    = parseFloat(line.qty)||0;
                          const cf     = parseFloat(line.cf)||0;
                          const saving = qty && cf ? qty*cf : null;
                          return (
                            <tr key={l.id} style={{ borderBottom:"1px solid "+T.rowBd,
                                                     background:qty>0?sc2.bg+"55":undefined }}>
                              {li===0 && (
                                <td rowSpan={totalRows}
                                  style={{ ...tdS(), verticalAlign:"top", paddingTop:10,
                                           borderRight:"1px solid "+T.border, width:90 }}>
                                  <span style={{ fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:3,
                                                 background:sc2.bg, color:sc2.c, border:"1px solid "+sc2.bd,
                                                 display:"inline-block", whiteSpace:"nowrap" }}>{scope}</span>
                                </td>
                              )}
                              <td style={{ ...tdS(), fontWeight:500, color:T.text }}>{l.type}</td>
                              <td style={{ ...tdS({ textAlign:"right" }), fontFamily:T.mono, fontSize:10, color:T.faint }}>{l.unit}</td>
                              <td style={{ ...tdS({ textAlign:"right", padding:"4px 6px" }) }}>
                                <input type="number" min={0} value={line.qty}
                                  onChange={e=>setLine(l.id,"qty",e.target.value)} placeholder="0"
                                  style={{ width:86, textAlign:"right", padding:"4px 8px", fontFamily:T.mono,
                                           fontSize:12, border:"1px solid "+(qty>0?sc2.bd:T.border),
                                           borderRadius:5, background:qty>0?sc2.bg:T.surface, color:qty>0?sc2.c:T.text }}/>
                              </td>
                              <td style={{ ...tdS({ textAlign:"right", padding:"4px 6px" }) }}>
                                {l.cfFixed ? (
                                  <span style={{ fontFamily:T.mono, fontSize:12, color:T.muted }}>{l.cfDefault}</span>
                                ) : (
                                  <input type="number" min={0} value={line.cf}
                                    onChange={e=>setLine(l.id,"cf",e.target.value)} placeholder="CF"
                                    style={{ width:56, textAlign:"right", padding:"4px 6px", fontFamily:T.mono,
                                             fontSize:12, border:"1px solid "+T.amberBd,
                                             borderRadius:5, background:T.amberBg, color:T.amber }}/>
                                )}
                              </td>
                              <td style={{ ...tdS({ textAlign:"right" }), fontFamily:T.mono,
                                           fontWeight:saving?700:400, color:saving?T.teal:T.faint }}>
                                {saving!=null ? saving.toLocaleString("nb-NO",{maximumFractionDigits:1}) : "—"}
                              </td>
                              <td style={{ ...tdS({ padding:"4px 6px" }) }}>
                                <input value={line.ref} onChange={e=>setLine(l.id,"ref",e.target.value)}
                                  placeholder="Source / note"
                                  style={{ width:"100%", minWidth:100, padding:"3px 6px", fontSize:11,
                                           border:"1px solid "+T.border, borderRadius:4,
                                           background:"transparent", color:T.muted }}/>
                              </td>
                            </tr>
                          );
                        }),
                        ...customForScope.map(cr => {
                          const cqty = parseFloat(cr.qty)||0;
                          const ccf  = parseFloat(cr.cf)||0;
                          const csaving = cqty && ccf ? cqty*ccf : null;
                          return (
                            <tr key={cr.uid} style={{ borderBottom:"1px solid "+T.rowBd,
                                                       background:cqty>0?sc2.bg+"55":T.amberBg+"33" }}>
                              <td style={{ ...tdS({ padding:"4px 6px" }) }}>
                                <input value={cr.type} onChange={e=>setCustomRow(cr.uid,"type",e.target.value)}
                                  placeholder="Custom type description"
                                  style={{ width:"100%", padding:"3px 6px", fontSize:12,
                                           border:"1px solid "+T.amberBd, borderRadius:4,
                                           background:T.amberBg, color:T.amber }}/>
                              </td>
                              <td style={{ ...tdS({ padding:"4px 6px", textAlign:"right" }) }}>
                                <input value={cr.unit} onChange={e=>setCustomRow(cr.uid,"unit",e.target.value)}
                                  placeholder="kg"
                                  style={{ width:44, textAlign:"right", padding:"3px 5px", fontSize:11,
                                           border:"1px solid "+T.border, borderRadius:4,
                                           background:T.surface, color:T.muted }}/>
                              </td>
                              <td style={{ ...tdS({ textAlign:"right", padding:"4px 6px" }) }}>
                                <input type="number" min={0} value={cr.qty}
                                  onChange={e=>setCustomRow(cr.uid,"qty",e.target.value)} placeholder="0"
                                  style={{ width:86, textAlign:"right", padding:"4px 8px", fontFamily:T.mono,
                                           fontSize:12, border:"1px solid "+(cqty>0?sc2.bd:T.border),
                                           borderRadius:5, background:cqty>0?sc2.bg:T.surface, color:cqty>0?sc2.c:T.text }}/>
                              </td>
                              <td style={{ ...tdS({ textAlign:"right", padding:"4px 6px" }) }}>
                                <input type="number" min={0} value={cr.cf}
                                  onChange={e=>setCustomRow(cr.uid,"cf",e.target.value)} placeholder="CF"
                                  style={{ width:56, textAlign:"right", padding:"4px 6px", fontFamily:T.mono,
                                           fontSize:12, border:"1px solid "+T.amberBd,
                                           borderRadius:5, background:T.amberBg, color:T.amber }}/>
                              </td>
                              <td style={{ ...tdS({ textAlign:"right" }), fontFamily:T.mono,
                                           fontWeight:csaving?700:400, color:csaving?T.teal:T.faint }}>
                                {csaving!=null ? csaving.toLocaleString("nb-NO",{maximumFractionDigits:1}) : "—"}
                              </td>
                              <td style={{ ...tdS({ padding:"4px 6px" }) }}>
                                <div style={{ display:"flex", gap:4, alignItems:"center" }}>
                                  <input value={cr.ref} onChange={e=>setCustomRow(cr.uid,"ref",e.target.value)}
                                    placeholder="Source / note"
                                    style={{ flex:1, minWidth:80, padding:"3px 6px", fontSize:11,
                                             border:"1px solid "+T.border, borderRadius:4,
                                             background:"transparent", color:T.muted }}/>
                                  <button onClick={()=>delCustomRow(cr.uid)}
                                    style={{ fontSize:11, color:T.red, background:"transparent",
                                             border:"none", cursor:"pointer", padding:"0 2px", flexShrink:0 }}>✕</button>
                                </div>
                              </td>
                            </tr>
                          );
                        }),
                        <tr key={"add-"+scope}>
                          <td colSpan={6} style={{ padding:"4px 8px", borderBottom:"1px solid "+T.rowBd }}>
                            <button onClick={addCustomRow}
                              style={{ fontSize:11, color:sc2.c, background:"transparent",
                                       border:"none", cursor:"pointer", padding:"2px 4px",
                                       fontFamily:T.sans, fontWeight:500 }}>
                              + Add custom row
                            </button>
                          </td>
                        </tr>
                      ];
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={{ background:T.tealBg, borderTop:"2px solid "+T.tealBd }}>
                      <td colSpan={5} style={{ padding:"8px 10px", fontWeight:600, fontSize:12, color:T.teal }}>Total GHG saving</td>
                      <td style={{ padding:"8px 10px", textAlign:"right", fontFamily:T.mono, fontSize:14, fontWeight:700, color:T.teal }}>
                        {ghgTotal.toLocaleString("nb-NO",{maximumFractionDigits:1})}
                      </td>
                      <td style={{ padding:"8px 10px", fontSize:11, color:T.muted }}>
                        = {ghgTonnes.toLocaleString("nb-NO",{maximumFractionDigits:3})} t CO₂e
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <p style={{ fontSize:11, color:T.faint, margin:"0.5rem 0 0" }}>
                Fixed CFs: CO₂ = 1, NOₓ = 296, CH₄ = 28 · Energy = 0.57 kg CO₂e/kWh · Steel = 2, other material = 1.5 kg CO₂e/kg.
                Amber fields = enter your own CF. Rows with a quantity entered are highlighted.
              </p>
            </div>
          );
        })()}
      </Card>
      {/* ── Admin ── */}
      <Card style={{ marginBottom:"1.5rem" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px 14px" }}>
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
  const [screenSearch, setScreenSearch] = useState("");

  const isRisks   = mode === "risks";
  const toggleCat = k => setExpanded(p => ({ ...p, [k]:!p[k] }));

  const prefillRisk = (code, item, sectionColor) => {
    setRiskForm({ ...emptyAspect(), phase:PHASE_MAP[code]||"", area:item.area||"",
                  aspect:item.aspect||"", condition:COND_MAP[code]||"Normal", _color:sectionColor||"" });
    setView("form");
  };
  const prefillOpp = (code, item, sectionColor) => {
    setOppForm({ ...emptyOpp(), description:item.opp||"", type:item.type||"", _color:sectionColor||"" });
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
  const oppSc     = oppScore>=75?{bg:T.tealBg,c:T.tealDark}:oppScore>=30?{bg:T.tealBg,c:T.teal}:{bg:T.slateBg,c:T.slate};
  const rawGuide = isRisks ? (GW_RISK[activeStage]||[]) : (GW_OPP[activeStage]||[]);
  const guideData = screenSearch.trim() ? rawGuide.map(section => ({
    ...section,
    items: section.items.filter(item => {
      const q = screenSearch.toLowerCase();
      return (item.kw||"").toLowerCase().includes(q) ||
             (item.q||"").toLowerCase().includes(q) ||
             (item.aspect||item.opp||"").toLowerCase().includes(q);
    })
  })).filter(s => s.items.length > 0) : rawGuide;

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
                  {EPCIC_STAGES.find(s=>s.code===activeStage)?.label}
                </h3>
                <p style={{ fontSize:11, color:T.faint, margin:0 }}>Click a card to pre-fill the screening form</p>
              </div>
              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                <input
                  value={screenSearch}
                  onChange={e=>setScreenSearch(e.target.value)}
                  placeholder="Search guide words..."
                  style={{ width:190, padding:"5px 10px", fontSize:12,
                           border:"1px solid "+T.border, borderRadius:6,
                           background:T.surface, color:T.text, outline:"none" }}
                />
                <button onClick={() => setView("form")}
                  style={{ padding:"6px 14px", fontSize:12, borderRadius:6, border:"none",
                           background:isRisks?T.red:T.purple, color:"#fff", cursor:"pointer",
                           fontFamily:T.sans, fontWeight:500, whiteSpace:"nowrap" }}>
                  + Blank form
                </button>
              </div>
            </div>
            {guideData.length === 0 && (
              <div style={{ padding:"1.5rem", textAlign:"center", background:T.slateBg,
                            borderRadius:8, color:T.faint, fontSize:12 }}>No guide words for this stage yet.</div>
            )}
            {guideData.map(section => {
              const col = COLOR_MAP[section.color] || COLOR_MAP.gray;
              const key = (isRisks?"R":"O")+activeStage+section.cat;
              const open = screenSearch.trim() ? true : expanded[key] !== false;
              return (
                <div key={key} style={{ marginBottom:20 }}>
                  {/* Solid full-width header bar */}
                  <div onClick={() => toggleCat(key)}
                    style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                             padding:"11px 18px", background:col.head,
                             borderRadius:6, cursor:"pointer", userSelect:"none",
                             marginBottom: open ? 10 : 0 }}>
                    <span style={{ fontSize:13, fontWeight:700, color:"#fff",
                                   letterSpacing:"0.01em" }}>{section.cat}</span>
                    <span style={{ fontSize:13, color:"rgba(255,255,255,0.75)" }}>{open?"▾":"▸"}</span>
                  </div>
                  {/* Card grid — no outer border, each card has its own border */}
                  {open && (
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                      {section.items.map((item, i) => (
                        <button key={i}
                          onClick={() => isRisks ? prefillRisk(activeStage, item, section.color) : prefillOpp(activeStage, item, section.color)}
                          style={{ textAlign:"left", padding:"14px 16px",
                                   background:col.bg,
                                   border:"1.5px solid "+col.border,
                                   borderRadius:8,
                                   cursor:"pointer", fontFamily:T.sans,
                                   display:"flex", flexDirection:"column", gap:8,
                                   transition:"background 0.1s, border-color 0.1s" }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background=col.bg.replace(/[^#]$/,'')+"ee";
                            e.currentTarget.style.borderColor=col.head;
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background=col.bg;
                            e.currentTarget.style.borderColor=col.border;
                          }}>
                          <span style={{ fontSize:13, fontWeight:700, color:col.head,
                                         lineHeight:1.3 }}>{item.kw}</span>
                          <span style={{ fontSize:12, color:T.text, lineHeight:1.6,
                                         fontWeight:400 }}>{item.q}</span>
                          <span style={{ fontSize:11, color:T.muted, lineHeight:1.4 }}>
                            <strong style={{ fontWeight:600, color:T.text }}>
                              {isRisks?"Aspect":"Opportunity"}:
                            </strong>{" "}{isRisks ? item.aspect : item.opp}
                          </span>
                        </button>
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
              <SectionLabel>Priority score = env value x business value x feasibility (max 125)</SectionLabel>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"10px 14px" }}>
                {[{k:"envValue",l:"Env value (1-5)"},{k:"bizValue",l:"Business value (1-5)"},{k:"feasibility",l:"Feasibility (1-5)"}].map(({ k, l }) => (
                  <Fld key={k} label={l}><input type="number" min={1} max={5} value={oppForm[k]} onChange={e=>setOF(k,Math.min(5,Math.max(1,+e.target.value||1)))} style={iw}/></Fld>
                ))}
              </div>
              <div style={{ marginTop:12, paddingTop:10, borderTop:"1px solid "+T.tealBd, display:"flex", alignItems:"center", gap:12 }}>
                <span style={{ fontFamily:T.mono, fontSize:11, color:T.muted }}>Score:</span>
                <span style={{ fontFamily:T.mono, fontSize:20, fontWeight:500, padding:"2px 12px", borderRadius:5, background:oppSc.bg, color:oppSc.c }}>{oppScore}</span>
                <span style={{ fontSize:12, color:T.muted }}>{oppScore>=75?"High priority - act now":oppScore>=30?"Medium priority":"Low priority"}</span>
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
function ProjectView({ project, allProjects, onChange, onDelete, initialTab }) {
  const [tab, setTab]                     = useState(initialTab||"dashboard");
  const [editAspect, setEditAspect]       = useState(null);
  const [editOpp, setEditOpp]             = useState(null);
  const [aiOpen, setAiOpen]               = useState(false);
  const [dashFilter, setDashFilter]       = useState("all");
  const [aspFilter, setAspFilter]         = useState("All");
  const [aspSort,   setAspSort]           = useState({ col:null, dir:"asc" });
  const [aspSearch, setAspSearch]         = useState("");
  const [oppSort,   setOppSort]           = useState({ col:null, dir:"asc" });
  const [oppSearch, setOppSearch]         = useState("");
  const [selectedAsp, setSelectedAsp]     = useState(new Set());
  const [selectedOpp, setSelectedOpp]     = useState(new Set());
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
    const now = new Date().toISOString();
    const withTs = isEdit ? {...a, updatedAt:now}
                          : {...a, createdAt:now, updatedAt:now};
    const updated = isEdit ? aspects.map(x=>x.id===a.id?withTs:x)
                           : [...aspects,{...withTs,id:Date.now().toString(),ref:nextRef(aspects,"ASP")}];
    const ref = isEdit ? a.ref : nextRef(aspects,"ASP");
    onChange({ ...project, aspects:updated,
               changelog:logChange(isEdit?"Edited aspect":"Added aspect",
                 `${ref}: ${(withTs.aspect||"").slice(0,60)}`) });
    setEditAspect(null);
  };
  const saveOpp = o => {
    const isEdit = !!o.id;
    const now = new Date().toISOString();
    const withTs = isEdit ? {...o, updatedAt:now}
                          : {...o, createdAt:now, updatedAt:now};
    const updated = isEdit ? opps.map(x=>x.id===o.id?withTs:x)
                           : [...opps,{...withTs,id:Date.now().toString(),ref:nextRef(opps,"OPP")}];
    const ref = isEdit ? o.ref : nextRef(opps,"OPP");
    onChange({ ...project, opps:updated,
               changelog:logChange(isEdit?"Edited opportunity":"Added opportunity",
                 `${ref}: ${(withTs.description||"").slice(0,60)}`) });
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

  const bulkDeleteAspects = () => {
    const kept = aspects.filter(a=>!selectedAsp.has(a.id));
    const log  = logChange("Bulk deleted aspects", selectedAsp.size+" aspect(s) removed");
    onChange({ ...project, aspects:kept, changelog:[...(project.changelog||[]), log] });
    setSelectedAsp(new Set());
  };
  const bulkSetAspStatus = (status) => {
    const updated = aspects.map(a => selectedAsp.has(a.id) ? { ...a, status } : a);
    const log  = logChange("Bulk updated status", selectedAsp.size+" aspect(s) set to "+status);
    onChange({ ...project, aspects:updated, changelog:[...(project.changelog||[]), log] });
    setSelectedAsp(new Set());
  };
  const bulkDeleteOpps = () => {
    const kept = opps.filter(o=>!selectedOpp.has(o.id));
    const log  = logChange("Bulk deleted opportunities", selectedOpp.size+" opportunity(s) removed");
    onChange({ ...project, opps:kept, changelog:[...(project.changelog||[]), log] });
    setSelectedOpp(new Set());
  };
  const bulkSetOppStatus = (status) => {
    const updated = opps.map(o => selectedOpp.has(o.id) ? { ...o, status } : o);
    const log  = logChange("Bulk updated opp status", selectedOpp.size+" opportunity(s) set to "+status);
    onChange({ ...project, opps:updated, changelog:[...(project.changelog||[]), log] });
    setSelectedOpp(new Set());
  };
  const toggleSelAsp = (id) => setSelectedAsp(prev => { const s=new Set(prev); s.has(id)?s.delete(id):s.add(id); return s; });
  const toggleSelOpp = (id) => setSelectedOpp(prev => { const s=new Set(prev); s.has(id)?s.delete(id):s.add(id); return s; });
  const toggleAllAsp = (rows) => setSelectedAsp(prev => prev.size===rows.length ? new Set() : new Set(rows.map(a=>a.id)));
  const toggleAllOpp = (rows) => setSelectedOpp(prev => prev.size===rows.length ? new Set() : new Set(rows.map(o=>o.id)));

  const sigCount   = aspects.filter(a=>calcSig(a)==="SIGNIFICANT").length;
  const watchCount = aspects.filter(a=>calcSig(a)==="WATCH").length;
  const lowCount   = aspects.filter(a=>calcSig(a)==="Low").length;
  const highOpps   = opps.filter(o=>calcOppScore(o)>=75).length;
  const statusCounts = STATUSES.reduce((acc,s) => {
    acc[s] = aspects.filter(a=>a.status===s).length; return acc;
  }, {});
  const statusColors = { "Open":T.redBd, "In Progress":T.amberBd, "Closed":T.greenBd };
  const statusBg    = { "Open":T.redBg, "In Progress":T.amberBg, "Closed":T.greenBg };

  // Dashboard filter drives which aspects show
  const dashAspects = dashFilter==="all"     ? aspects
                    : dashFilter==="sig"     ? aspects.filter(a=>calcSig(a)==="SIGNIFICANT")
                    : dashFilter==="watch"   ? aspects.filter(a=>calcSig(a)==="WATCH")
                    : dashFilter==="low"     ? aspects.filter(a=>calcSig(a)==="Low")
                    : dashFilter==="opps"    ? aspects
                    : aspects;

  const filteredAspects = (() => {
    let r = aspFilter==="All" ? aspects : aspects.filter(a=>calcSig(a)===aspFilter);
    if (aspSearch) { const q=aspSearch.toLowerCase(); r=r.filter(a=>(a.aspect||"").toLowerCase().includes(q)||(a.area||"").toLowerCase().includes(q)||(a.phase||"").toLowerCase().includes(q)); }
    if (aspSort.col) r=[...r].sort((a,b)=>{ let va,vb;
      if(aspSort.col==="score"){va=calcScore(a)||0;vb=calcScore(b)||0;}
      else if(aspSort.col==="sig"){const o={"SIGNIFICANT":0,"WATCH":1,"Low":2};va=o[calcSig(a)]??3;vb=o[calcSig(b)]??3;}
      else{va=(a[aspSort.col]||"").toLowerCase();vb=(b[aspSort.col]||"").toLowerCase();}
      return aspSort.dir==="asc"?(va<vb?-1:va>vb?1:0):(va>vb?-1:va<vb?1:0); });
    return r;
  })();
  const sortedDashAspects = (() => {
    if (!aspSort.col) return dashAspects;
    return [...dashAspects].sort((a,b)=>{ let va,vb;
      if(aspSort.col==="score"){va=calcScore(a)||0;vb=calcScore(b)||0;}
      else if(aspSort.col==="sig"){const o={"SIGNIFICANT":0,"WATCH":1,"Low":2};va=o[calcSig(a)]??3;vb=o[calcSig(b)]??3;}
      else{va=(a[aspSort.col]||"").toLowerCase();vb=(b[aspSort.col]||"").toLowerCase();}
      return aspSort.dir==="asc"?(va<vb?-1:va>vb?1:0):(va>vb?-1:va<vb?1:0); });
  })();

  const filteredOpps = (() => {
    let r = opps;
    if (oppSearch) { const q=oppSearch.toLowerCase(); r=r.filter(o=>(o.description||"").toLowerCase().includes(q)||(o.type||"").toLowerCase().includes(q)); }
    if (oppSort.col) r=[...r].sort((a,b)=>{ let va,vb;
      if(oppSort.col==="score"){va=calcOppScore(a);vb=calcOppScore(b);}
      else{va=(a[oppSort.col]||"").toLowerCase();vb=(b[oppSort.col]||"").toLowerCase();}
      return oppSort.dir==="asc"?(va<vb?-1:va>vb?1:0):(va>vb?-1:va<vb?1:0); });
    return r;
  })();

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
  // Date display helper
  const fmtDate = iso => iso ? new Date(iso).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : "—";

  // Shared aspect table renderer
  const BulkBar = ({ count, onDelete, onStatusChange, statusOptions, accentColor, accentBg, accentBd }) => (
    <div style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 14px",
                  background:accentBg, border:"1px solid "+accentBd,
                  borderRadius:"8px 8px 0 0", borderBottom:"none" }}>
      <span style={{ fontSize:12, fontWeight:500, color:accentColor }}>{count} selected</span>
      <select onChange={e=>{ if(e.target.value){ onStatusChange(e.target.value); e.target.value=""; }}}
        style={{ fontSize:11, padding:"3px 8px", borderRadius:4, border:"1px solid "+accentBd,
                 background:"transparent", color:accentColor, cursor:"pointer" }}
        defaultValue="">
        <option value="" disabled>Set status...</option>
        {statusOptions.map(s=><option key={s} value={s}>{s}</option>)}
      </select>
      <button onClick={onDelete}
        style={{ fontSize:11, padding:"4px 10px", borderRadius:4, border:"1px solid "+T.redBd,
                 background:T.redBg, color:T.red, cursor:"pointer", fontFamily:T.sans, fontWeight:500 }}>
        Delete selected
      </button>
      <button onClick={()=> onStatusChange(null)}
        style={{ fontSize:11, padding:"4px 8px", borderRadius:4, border:"none",
                 background:"transparent", color:accentColor, cursor:"pointer", marginLeft:"auto" }}>
        Clear ✕
      </button>
    </div>
  );

  const STH = ({ col, label }) => {
    const active = aspSort.col === col;
    return (
      <th onClick={()=>setAspSort(p=>({col, dir:p.col===col&&p.dir==="asc"?"desc":"asc"}))}
        style={{ padding:"8px 12px", textAlign:"left", fontFamily:T.mono, fontWeight:500, fontSize:9,
                 color:active?T.teal:T.muted, borderBottom:"1px solid "+T.border, whiteSpace:"nowrap",
                 letterSpacing:"0.07em", textTransform:"uppercase", cursor:"pointer", userSelect:"none",
                 background:active?T.tealBg:undefined }}>
        <span style={{ display:"flex", alignItems:"center", gap:3 }}>
          {label}
          <span style={{ fontSize:10, opacity:active?1:0.35 }}>{active?(aspSort.dir==="asc"?"↑":"↓"):"↕"}</span>
        </span>
      </th>
    );
  };
  const PlainTH = ({ children }) => (
    <th style={{ padding:"8px 12px", textAlign:"left", fontFamily:T.mono, fontWeight:500, fontSize:9,
                 color:T.muted, borderBottom:"1px solid "+T.border, whiteSpace:"nowrap",
                 letterSpacing:"0.07em", textTransform:"uppercase" }}>{children}</th>
  );
  const AspectTable = ({ rows, onEdit, onDelete: onDel, selection, onToggle, onToggleAll }) => (
    <div style={{ overflowX:"auto", borderRadius:8, border:"1px solid "+T.border, background:T.surface }}>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12, fontFamily:T.sans }}>
        <thead><tr>
          <th style={{ padding:"8px 8px 8px 12px", borderBottom:"1px solid "+T.border, width:32 }}>
            <input type="checkbox"
              checked={rows.length>0 && rows.every(a=>selection&&selection.has(a.id))}
              onChange={()=>onToggleAll&&onToggleAll(rows)}
              style={{ cursor:"pointer", width:13, height:13 }}/>
          </th>
          <PlainTH>Ref</PlainTH>
          <STH col="phase" label="Phase"/>
          <STH col="aspect" label="Aspect"/>
          <PlainTH>Cond.</PlainTH>
          <STH col="impact" label="Impact / Receptor"/>
          <STH col="score" label="Score"/>
          <STH col="sig" label="Significance"/>
          <STH col="status" label="Status"/>
          <STH col="createdAt" label="Created"/>
          <STH col="updatedAt" label="Modified"/>
          <PlainTH></PlainTH>
        </tr></thead>
        <tbody>
          {rows.map((a) => {
            const score  = calcScore(a);
            const sig    = calcSig(a);
            const rc     = rowColor(a);
            const leftBd = rc ? "3px solid "+rc.head : "3px solid transparent";
            return (
              <tr key={a.id} style={{ borderBottom:"1px solid "+T.rowBd, borderLeft:leftBd,
                                 background: selection&&selection.has(a.id) ? T.tealBg : undefined }}>
                <td style={{ padding:"9px 8px 9px 12px" }}>
                  <input type="checkbox" checked={!!(selection&&selection.has(a.id))}
                    onChange={()=>onToggle&&onToggle(a.id)}
                    style={{ cursor:"pointer", width:13, height:13 }}/>
                </td>
                <td style={{ padding:"9px 12px" }}>
                  <span style={{ fontFamily:T.mono, fontSize:10, fontWeight:500, color:T.teal }}>{a.ref}</span>
                </td>
                <td style={{ padding:"9px 12px" }}>
                  <span style={{ fontFamily:T.mono, fontSize:9, padding:"2px 6px", borderRadius:3, background:T.slateBg, color:T.slate }}>{a.phase||"—"}</span>
                </td>
                <td style={{ padding:"9px 12px", maxWidth:180 }}>
                  <div style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                                fontWeight:500, color: rc ? rc.head : T.text }} title={a.aspect}>{a.aspect||"—"}</div>
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
                  <span style={{ fontFamily:T.mono, fontSize:10, color:T.faint }}>{fmtDate(a.createdAt)}</span>
                </td>
                <td style={{ padding:"9px 12px", whiteSpace:"nowrap" }}>
                  <span style={{ fontFamily:T.mono, fontSize:10, color:T.faint }}>{fmtDate(a.updatedAt||a.createdAt)}</span>
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
  const OSTH = ({ col, label }) => {
    const active = oppSort.col === col;
    return (
      <th onClick={()=>setOppSort(p=>({col, dir:p.col===col&&p.dir==="asc"?"desc":"asc"}))}
        style={{ padding:"8px 12px", textAlign:"left", fontFamily:T.mono, fontWeight:500, fontSize:9,
                 color:active?T.purple:T.muted, borderBottom:"1px solid "+T.border, whiteSpace:"nowrap",
                 letterSpacing:"0.07em", textTransform:"uppercase", cursor:"pointer", userSelect:"none",
                 background:active?T.purpleBg:undefined }}>
        <span style={{ display:"flex", alignItems:"center", gap:3 }}>
          {label}
          <span style={{ fontSize:10, opacity:active?1:0.35 }}>{active?(oppSort.dir==="asc"?"↑":"↓"):"↕"}</span>
        </span>
      </th>
    );
  };
  const OppTable = ({ rows, onEdit, onDelete: onDel, selection, onToggle, onToggleAll }) => (
    <div style={{ overflowX:"auto", borderRadius:8, border:"1px solid "+T.border, background:T.surface }}>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12, fontFamily:T.sans }}>
        <thead><tr>
          <th style={{ padding:"8px 8px 8px 12px", borderBottom:"1px solid "+T.border, width:32 }}>
            <input type="checkbox"
              checked={rows.length>0 && rows.every(o=>selection&&selection.has(o.id))}
              onChange={()=>onToggleAll&&onToggleAll(rows)}
              style={{ cursor:"pointer", width:13, height:13 }}/>
          </th>
          <th style={{ padding:"8px 12px", textAlign:"left", fontFamily:T.mono, fontWeight:500, fontSize:9, color:T.muted, borderBottom:"1px solid "+T.border, whiteSpace:"nowrap", letterSpacing:"0.07em", textTransform:"uppercase" }}>Ref</th>
          <OSTH col="type" label="Type"/>
          <OSTH col="description" label="Description"/>
          <th style={{ padding:"8px 12px", textAlign:"left", fontFamily:T.mono, fontWeight:500, fontSize:9, color:T.muted, borderBottom:"1px solid "+T.border, whiteSpace:"nowrap", letterSpacing:"0.07em", textTransform:"uppercase" }}>Linked</th>
          <OSTH col="score" label="Score"/>
          <th style={{ padding:"8px 12px", textAlign:"left", fontFamily:T.mono, fontWeight:500, fontSize:9, color:T.muted, borderBottom:"1px solid "+T.border, whiteSpace:"nowrap", letterSpacing:"0.07em", textTransform:"uppercase" }}>Priority</th>
          <th style={{ padding:"8px 12px", textAlign:"left", fontFamily:T.mono, fontWeight:500, fontSize:9, color:T.muted, borderBottom:"1px solid "+T.border, whiteSpace:"nowrap", letterSpacing:"0.07em", textTransform:"uppercase" }}>GHG saving</th>
          <th style={{ padding:"8px 12px", textAlign:"left", fontFamily:T.mono, fontWeight:500, fontSize:9, color:T.muted, borderBottom:"1px solid "+T.border, whiteSpace:"nowrap", letterSpacing:"0.07em", textTransform:"uppercase" }}>Materiality</th>
          <OSTH col="status" label="Status"/>
          <OSTH col="createdAt" label="Created"/>
          <OSTH col="updatedAt" label="Modified"/>
          <th style={{ padding:"8px 12px", textAlign:"left", fontFamily:T.mono, fontWeight:500, fontSize:9, color:T.muted, borderBottom:"1px solid "+T.border, whiteSpace:"nowrap", letterSpacing:"0.07em", textTransform:"uppercase" }}></th>
        </tr></thead>
        <tbody>
          {rows.map((o) => {
            const score  = calcOppScore(o);
            const sc     = score>=75?{bg:T.tealBg,c:T.tealDark,bd:T.tealBd}:score>=30?{bg:T.tealBg,c:T.teal,bd:T.tealBd}:{bg:T.purpleBg,c:T.purple,bd:T.purpleBd};
            const matC   = o.materiality&&o.materiality.startsWith("Inside")?{bg:T.tealBg,c:T.teal}:o.materiality&&o.materiality.startsWith("Outside")?{bg:T.blueBg,c:T.blue}:{bg:T.purpleBg,c:T.purple};
            const rc     = rowColor(o);
            const leftBd = rc ? "3px solid "+rc.head : "3px solid transparent";
            return (
              <tr key={o.id} style={{ borderBottom:"1px solid "+T.rowBd, borderLeft:leftBd,
                                 background: selection&&selection.has(o.id) ? T.purpleBg : undefined }}>
                <td style={{ padding:"9px 8px 9px 12px" }}>
                  <input type="checkbox" checked={!!(selection&&selection.has(o.id))}
                    onChange={()=>onToggle&&onToggle(o.id)}
                    style={{ cursor:"pointer", width:13, height:13 }}/>
                </td>
                <td style={{ padding:"9px 12px" }}><span style={{ fontFamily:T.mono, fontSize:10, fontWeight:500, color:T.purple }}>{o.ref}</span></td>
                <td style={{ padding:"9px 12px", maxWidth:130 }}>
                  {o.type?<span style={{ fontFamily:T.mono, fontSize:9, padding:"2px 7px", borderRadius:3, background:rc?rc.bg:T.purpleBg, color:rc?rc.head:T.purple, border:"1px solid "+(rc?rc.border:T.purpleBd), whiteSpace:"nowrap" }}>{o.type}</span>:<span style={{ color:T.faint }}>—</span>}
                </td>
                <td style={{ padding:"9px 12px", maxWidth:200 }}>
                  <div style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontWeight:500, color: rc ? rc.head : T.text }} title={o.description}>{o.description||"—"}</div>
                  {o.envBenefit && <div style={{ fontSize:11, color: rc ? rc.text : T.teal, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>Env: {o.envBenefit}</div>}
                </td>
                <td style={{ padding:"9px 12px" }}>{o.aspectRef?<span style={{ fontFamily:T.mono, fontSize:9, padding:"2px 6px", borderRadius:3, background:T.tealBg, color:T.teal }}>{o.aspectRef}</span>:<span style={{ color:T.faint }}>—</span>}</td>
                <td style={{ padding:"9px 12px", textAlign:"center" }}><span style={{ fontFamily:T.mono, fontWeight:500, fontSize:13, color:T.text }}>{score>0?score:"—"}</span></td>
                <td style={{ padding:"9px 12px" }}>{score>0?<span style={{ fontFamily:T.mono, fontSize:9, padding:"2px 7px", borderRadius:3, background:sc.bg, color:sc.c, border:"1px solid "+sc.bd }}>{score>=75?"High":score>=30?"Medium":"Low"}</span>:<span style={{ color:T.faint }}>—</span>}</td>
                <td style={{ padding:"9px 12px" }}>{(() => { const g=calcGhgTotal(o); return g ? <span style={{ fontFamily:T.mono, fontSize:10, fontWeight:600, color:T.teal }}>{g>=1000?(g/1000).toLocaleString("nb-NO",{maximumFractionDigits:2})+" t":g.toLocaleString("nb-NO",{maximumFractionDigits:0})+" kg"} CO₂e</span> : <span style={{ color:T.faint }}>—</span>; })()}</td>
                <td style={{ padding:"9px 12px" }}>{o.materiality?<span style={{ fontFamily:T.mono, fontSize:9, padding:"2px 6px", borderRadius:3, background:matC.bg, color:matC.c }}>{o.materiality.split(" (")[0]}</span>:<span style={{ color:T.faint }}>—</span>}</td>
                <td style={{ padding:"9px 12px" }}><span style={{ fontFamily:T.mono, fontSize:9, padding:"2px 6px", borderRadius:3, background:T.slateBg, color:T.slate }}>{o.status}</span></td>
                <td style={{ padding:"9px 12px", whiteSpace:"nowrap" }}>
                  <span style={{ fontFamily:T.mono, fontSize:10, color:T.faint }}>{fmtDate(o.createdAt)}</span>
                </td>
                <td style={{ padding:"9px 12px", whiteSpace:"nowrap" }}>
                  <span style={{ fontFamily:T.mono, fontSize:10, color:T.faint }}>{fmtDate(o.updatedAt||o.createdAt)}</span>
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

  const TABS = ["dashboard","screening","aspects","opportunities","matrix","changes","settings"];

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

          {/* Status progress bar */}
          {aspects.length > 0 && (
            <div style={{ marginBottom:"1.25rem" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                <span style={{ fontSize:11, fontWeight:500, color:T.muted }}>Aspect status</span>
                <span style={{ fontSize:11, color:T.faint }}>{aspects.length} total</span>
              </div>
              <div style={{ display:"flex", borderRadius:6, overflow:"hidden", height:10, background:T.border, gap:"1px" }}>
                {STATUSES.map(s => statusCounts[s] > 0 && (
                  <div key={s} title={s+": "+statusCounts[s]}
                    style={{ flex:statusCounts[s], background:statusColors[s], transition:"flex 0.3s", minWidth:2 }}/>
                ))}
              </div>
              <div style={{ display:"flex", gap:12, marginTop:7, flexWrap:"wrap" }}>
                {STATUSES.map(s => statusCounts[s] > 0 && (() => {
                  const sc = s==="Open"?{bg:T.redBg,c:T.red,bd:T.redBd}:s==="In Progress"?{bg:T.amberBg,c:T.amber,bd:T.amberBd}:{bg:T.greenBg,c:T.green,bd:T.greenBd};
                  return (
                    <span key={s} style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:11,
                                           padding:"2px 8px", borderRadius:4, fontWeight:500,
                                           background:sc.bg, color:sc.c, border:"1px solid "+sc.bd }}>
                      {s} <strong style={{ fontWeight:700 }}>{statusCounts[s]}</strong>
                    </span>
                  );
                })())}
              </div>
            </div>
          )}

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
                : <OppTable rows={opps} onEdit={setEditOpp} onDelete={deleteOpp} selection={selectedOpp} onToggle={toggleSelOpp} onToggleAll={toggleAllOpp}/>}
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
              <AspectTable rows={sortedDashAspects} onEdit={setEditAspect} onDelete={deleteAspect} selection={selectedAsp} onToggle={toggleSelAsp} onToggleAll={toggleAllAsp}/>
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
              <input value={aspSearch} onChange={e=>setAspSearch(e.target.value)}
              placeholder="Search aspects..." style={{ width:180, padding:"5px 10px", fontSize:12 }}/>
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
              {aspects.length===0?"No aspects yet. Use the Screening tab or add one manually.":"No aspects match filter: "+aspFilter+"."}
            </div>
          ) : (
            <div>
              {selectedAsp.size > 0 && (
                <BulkBar count={selectedAsp.size}
                  accentColor={T.teal} accentBg={T.tealBg} accentBd={T.tealBd}
                  statusOptions={STATUSES}
                  onDelete={bulkDeleteAspects}
                  onStatusChange={s => s ? bulkSetAspStatus(s) : setSelectedAsp(new Set())}/>
              )}
              <AspectTable rows={filteredAspects} onEdit={setEditAspect} onDelete={deleteAspect} selection={selectedAsp} onToggle={toggleSelAsp} onToggleAll={toggleAllAsp}/>
            </div>
          )}
        </div>
      )}

      {tab === "opportunities" && (
        <div>
          <div style={{ display:"flex", gap:8, marginBottom:"1rem", alignItems:"center", flexWrap:"wrap" }}>
            <Btn variant="primary" onClick={()=>setEditOpp(emptyOpp())}>+ Add opportunity</Btn>
            <input value={oppSearch} onChange={e=>setOppSearch(e.target.value)}
              placeholder="Search opportunities..." style={{ width:200, padding:"5px 10px", fontSize:12 }}/>
            <span style={{ marginLeft:"auto", fontFamily:T.mono, fontSize:10, color:T.faint }}>
              {filteredOpps.length} of {opps.length} opportunit{opps.length!==1?"ies":"y"}
            </span>
          </div>
          {opps.length === 0 ? (
            <div style={{ textAlign:"center", padding:"3rem", background:T.surface, borderRadius:8, border:"1px solid "+T.border, color:T.faint, fontSize:12 }}>
              <p style={{ margin:"0 0 8px", fontSize:13, color:T.muted }}>No opportunities tracked yet.</p>
              <p style={{ fontSize:12, margin:0 }}>ISO 14001:2015 Cl.6.1.2 requires identifying both risks and opportunities.</p>
            </div>
          ) : (
            <div>
              {selectedOpp.size > 0 && (
                <BulkBar count={selectedOpp.size}
                  accentColor={T.purple} accentBg={T.purpleBg} accentBd={T.purpleBd}
                  statusOptions={OPP_STATUSES}
                  onDelete={bulkDeleteOpps}
                  onStatusChange={s => s ? bulkSetOppStatus(s) : setSelectedOpp(new Set())}/>
              )}
              <OppTable rows={filteredOpps} onEdit={setEditOpp} onDelete={deleteOpp} selection={selectedOpp} onToggle={toggleSelOpp} onToggleAll={toggleAllOpp}/>
            </div>
          )}
        </div>
      )}


      {tab === "matrix" && (() => {
        // ─── Shared constants ──────────────────────────────────────────────────────
        const CELL = 80;       // px per grid cell
        const YLAB = 130;      // total width of Y-axis (rotated label + descriptors)
        const XLAB = 44;       // height of X-axis header row

        // ─── Shared sub-components ────────────────────────────────────────────────
        // Axis descriptor column (left side, shared layout)
        const YAxis = ({ title, labels }) => (
          <div style={{ display:"flex", alignItems:"flex-start", flexShrink:0 }}>
            {/* Rotated title */}
            <div style={{ width:20, marginTop:XLAB, height:CELL*5,
                           display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <span style={{ fontSize:10, fontWeight:700, color:T.muted, transform:"rotate(-90deg)",
                             whiteSpace:"nowrap", letterSpacing:"0.07em", textTransform:"uppercase" }}>
                {title}
              </span>
            </div>
            {/* Row labels */}
            <div style={{ width:YLAB-20, flexShrink:0, marginTop:XLAB }}>
              {[5,4,3,2,1].map(v => (
                <div key={v} style={{ height:CELL, display:"flex", alignItems:"center",
                                       justifyContent:"flex-end", paddingRight:10 }}>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:12, fontWeight:700, color:T.text }}>{v}</div>
                    {(labels[v]||"").split("|").map((ln,i) => (
                      <div key={i} style={{ fontSize:9, color:T.faint, lineHeight:1.35 }}>{ln}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

        // X-axis header row (column descriptors)
        const XAxis = ({ labels, footerLabel }) => (
          <>
            <div style={{ display:"flex", height:XLAB, alignItems:"flex-end", paddingBottom:6 }}>
              {[1,2,3,4,5].map(v => (
                <div key={v} style={{ width:CELL, flexShrink:0, textAlign:"center" }}>
                  <div style={{ fontSize:12, fontWeight:700, color:T.text }}>{v}</div>
                  <div style={{ fontSize:9, color:T.faint, lineHeight:1.35 }}>{labels[v]||""}</div>
                </div>
              ))}
            </div>
            <div style={{ paddingTop:6, fontSize:10, fontWeight:700, color:T.muted,
                           letterSpacing:"0.07em", textTransform:"uppercase" }}>
              {footerLabel}
            </div>
          </>
        );

        // Unified legend block — used by both matrices
        const LegendBlock = ({ groups }) => (
          <div style={{ marginTop:"1.25rem", padding:"12px 16px",
                         background:T.surface, border:"1px solid "+T.border,
                         borderRadius:8, display:"flex", gap:24, flexWrap:"wrap",
                         alignItems:"flex-start" }}>
            {groups.map((g, gi) => (
              <div key={gi} style={{ minWidth:0 }}>
                <p style={{ margin:"0 0 7px", fontSize:9, fontWeight:700, color:T.faint,
                             letterSpacing:"0.09em", textTransform:"uppercase" }}>{g.title}</p>
                <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                  {g.items.map((item, ii) => (
                    <span key={ii} style={{ display:"flex", alignItems:"center", gap:8,
                                            fontSize:11, color:T.text, whiteSpace:"nowrap" }}>
                      <span style={{ width:item.sw||14, height:item.sh||14, borderRadius:item.br||"50%",
                                     background:item.bg, border:item.bd||"none",
                                     flexShrink:0, display:"inline-block" }}/>
                      <span>{item.label}{item.sub && <span style={{ color:T.faint }}> — {item.sub}</span>}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
            <span style={{ marginLeft:"auto", fontSize:11, color:T.faint, alignSelf:"flex-end" }}>
              Click any dot to edit
            </span>
          </div>
        );

        // Shared section header
        const MatrixHeader = ({ title, subtitle, isFirst }) => (
          <div style={{ marginBottom:"1rem",
                         paddingTop: isFirst ? 0 : "1.75rem",
                         borderTop: isFirst ? "none" : "2px solid "+T.border }}>
            <h3 style={{ margin:"0 0 3px", fontSize:15, fontWeight:700, color:T.text }}>{title}</h3>
            <p style={{ margin:0, fontSize:12, color:T.muted }}>{subtitle}</p>
          </div>
        );

        // ─── Risk matrix data + rendering ─────────────────────────────────────────
        const CON_LABELS  = { 1:"Negligible", 2:"Minor", 3:"Moderate", 4:"Major", 5:"Catastrophic" };
        const PROB_LABELS = { 1:"Very unlikely|(< 1%)", 2:"Unlikely|(1–5%)", 3:"Possible|(5–25%)", 4:"Likely|(25–50%)", 5:"Very likely|(> 50%)" };

        const sigCell = (sv, pb) => {
          const r = sv*pb;
          if (r >= 13) return { bg:"#FFEBEE", bd:"#EF9A9A", zone:"SIGNIFICANT" };
          if (r >= 8)  return { bg:"#FFF8E1", bd:"#FFE082", zone:"WATCH"       };
          return             { bg:"#E8F5E9", bd:"#A5D6A7", zone:"Low"          };
        };
        const zoneTextC = { SIGNIFICANT:T.redBd, WATCH:T.amberBd, Low:T.greenBd };

        const riskGrid = {};
        aspects.forEach(a => {
          if (!a.severity || !a.probability) return;
          const sv = Math.min(5,Math.max(1,parseInt(a.severity)));
          const pb = Math.min(5,Math.max(1,parseInt(a.probability)));
          const k  = sv+","+pb;
          if (!riskGrid[k]) riskGrid[k] = [];
          riskGrid[k].push(a);
        });
        const unplotted = aspects.filter(a => !a.severity || !a.probability);

        // ─── Opportunity matrix data + rendering ──────────────────────────────────
        const OPP_ENV_LABELS  = { 1:"Negligible", 2:"Minor", 3:"Moderate", 4:"Significant", 5:"Major" };
        const OPP_FEAS_LABELS = { 1:"Very difficult", 2:"Difficult", 3:"Moderate", 4:"Achievable", 5:"Easy" };

        const oppQuadrant = (ev, feas) => {
          const hE = ev>=4, hF = feas>=4;
          if  (hE && hF)  return { bg:T.tealBg,   bd:T.tealBd,   label:"Pursue",       c:T.teal   };
          if  (hE && !hF) return { bg:T.blueBg,   bd:T.blueBd,   label:"Plan",          c:T.blue   };
          if  (!hE && hF) return { bg:T.purpleBg, bd:T.purpleBd, label:"Quick win",     c:T.purple };
          return                  { bg:T.slateBg,  bd:T.slateBd,  label:"Deprioritise",  c:T.slate  };
        };

        // Quadrant corner cell: top-right cell of each quadrant region
        const isQuadrantCorner = (ev, feas) =>
          (ev===5 && feas===5) || (ev===3 && feas===5) || (ev===5 && feas===3) || (ev===3 && feas===3);

        const oppGrid = {};
        opps.forEach(o => {
          const ev   = Math.min(5,Math.max(1,parseInt(o.envValue)||1));
          const feas = Math.min(5,Math.max(1,parseInt(o.feasibility)||1));
          const k    = ev+","+feas;
          if (!oppGrid[k]) oppGrid[k] = [];
          oppGrid[k].push(o);
        });

        return (
          <div>
            {/* ══ Risk matrix ══════════════════════════════════════════════════════════ */}
            <MatrixHeader isFirst title="Environmental risk matrix"
              subtitle="Consequence × Probability per NORSOK S-003 / ISO 14001 · R ≥ 13 = SIGNIFICANT · R 8–12 = WATCH · R ≤ 7 = Low"/>

            {aspects.length === 0
              ? <div style={{ textAlign:"center", padding:"3rem", background:T.surface,
                               borderRadius:8, border:"1px solid "+T.border, color:T.faint,
                               fontSize:12, marginBottom:"2rem" }}>
                  No aspects yet — use the Screening tab to get started.
                </div>
              : <>
                  <div style={{ display:"flex", alignItems:"flex-start", overflowX:"auto" }}>
                    <YAxis title="Probability of occurrence →" labels={PROB_LABELS}/>
                    <div>
                      <XAxis labels={CON_LABELS} footerLabel="Consequence / severity →"/>
                      {[5,4,3,2,1].map(pb => (
                        <div key={pb} style={{ display:"flex" }}>
                          {[1,2,3,4,5].map(sv => {
                            const c     = sigCell(sv,pb);
                            const items = riskGrid[sv+","+pb]||[];
                            return (
                              <div key={sv} style={{ width:CELL, height:CELL, flexShrink:0,
                                                     background:c.bg, border:"1px solid "+c.bd,
                                                     display:"flex", flexWrap:"wrap",
                                                     alignContent:"center", justifyContent:"center",
                                                     gap:4, padding:5, boxSizing:"border-box" }}>
                                {items.length===0 && (
                                  <span style={{ fontSize:10, fontWeight:700,
                                                 color:zoneTextC[c.zone], opacity:0.5 }}>{sv*pb}</span>
                                )}
                                {items.map((a,i) => {
                                  const sig = calcSig(a);
                                  const fill  = sig==="SIGNIFICANT"?T.redBg   :sig==="WATCH"?T.amberBg  :T.greenBg;
                                  const fillC = sig==="SIGNIFICANT"?T.red     :sig==="WATCH"?T.amber    :T.green;
                                  const fillBd= sig==="SIGNIFICANT"?T.redBd   :sig==="WATCH"?T.amberBd  :T.greenBd;
                                  const bdr   = a.status==="Closed"      ?"2px solid "+T.green
                                              : a.status==="In Progress" ?"2px dashed "+T.amber
                                              :                            "3px solid "+T.red;
                                  return (
                                    <div key={i}
                                      title={"["+a.status+"] "+(a.ref||"")+" — "+(a.aspect||"")+"\nConsequence: "+a.severity+" · Probability: "+a.probability+" · Score: "+sv*pb}
                                      onClick={()=>setEditAspect(a)}
                                      style={{ width:18, height:18, borderRadius:"50%",
                                               background:fill, border:bdr,
                                               cursor:"pointer", flexShrink:0,
                                               display:"flex", alignItems:"center", justifyContent:"center",
                                               fontSize:8, fontWeight:700, color:fillC }}>
                                      {items.length>1&&i===0?items.length:""}
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                  <LegendBlock groups={[
                    { title:"Cell colour — risk zone", items:[
                        { bg:"#FFEBEE", bd:"1px solid #EF9A9A", br:"3px", sw:14, sh:14, label:"SIGNIFICANT", sub:"R ≥ 13" },
                        { bg:"#FFF8E1", bd:"1px solid #FFE082", br:"3px", sw:14, sh:14, label:"WATCH",        sub:"R 8–12" },
                        { bg:"#E8F5E9", bd:"1px solid #A5D6A7", br:"3px", sw:14, sh:14, label:"Low",          sub:"R ≤ 7"  },
                    ]},
                    { title:"Dot fill — significance", items:[
                        { bg:T.redBg,   bd:"2px solid "+T.redBd,   label:"SIGNIFICANT" },
                        { bg:T.amberBg, bd:"2px solid "+T.amberBd, label:"WATCH"       },
                        { bg:T.greenBg, bd:"2px solid "+T.greenBd, label:"Low"         },
                    ]},
                    { title:"Dot border — management status", items:[
                        { bg:T.slateBg, bd:"3px solid "+T.red,          label:"Open"        },
                        { bg:T.slateBg, bd:"2px dashed "+T.amber,       label:"In Progress" },
                        { bg:T.slateBg, bd:"2px solid "+T.green,        label:"Closed"      },
                    ]},
                  ]}/>
                  {unplotted.length>0 && (
                    <p style={{ fontSize:11, color:T.faint, marginTop:"0.5rem" }}>
                      {unplotted.length} aspect{unplotted.length!==1?"s":""} not plotted — consequence or probability not set.
                    </p>
                  )}
                </>
            }

            {/* ══ Opportunity matrix ═══════════════════════════════════════════════════ */}
            <MatrixHeader title="Opportunity priority matrix"
              subtitle="Environmental benefit × Feasibility per ISO 14001:2015 Cl.6.1.2 · Dot size = business value · Quadrants guide prioritisation"/>

            {opps.length === 0
              ? <div style={{ textAlign:"center", padding:"3rem", background:T.surface,
                               borderRadius:8, border:"1px solid "+T.border, color:T.faint, fontSize:12 }}>
                  No opportunities yet.
                </div>
              : <>
                  <div style={{ display:"flex", alignItems:"flex-start", overflowX:"auto" }}>
                    <YAxis title="Implementation feasibility →" labels={OPP_FEAS_LABELS}/>
                    <div>
                      <XAxis labels={OPP_ENV_LABELS} footerLabel="Environmental benefit / magnitude →"/>
                      {[5,4,3,2,1].map(feas => (
                        <div key={feas} style={{ display:"flex" }}>
                          {[1,2,3,4,5].map(ev => {
                            const q     = oppQuadrant(ev,feas);
                            const items = oppGrid[ev+","+feas]||[];
                            const isCorner = isQuadrantCorner(ev,feas);
                            return (
                              <div key={ev} style={{ width:CELL, height:CELL, flexShrink:0,
                                                     background:q.bg, border:"1px solid "+q.bd,
                                                     display:"flex", flexWrap:"wrap",
                                                     alignContent:"center", justifyContent:"center",
                                                     gap:4, padding:5, boxSizing:"border-box",
                                                     position:"relative" }}>
                                {/* Quadrant label in top-right corner cell of each quadrant */}
                                {items.length===0 && isCorner && (
                                  <span style={{ fontSize:9, fontWeight:700, color:q.c,
                                                 opacity:0.55, textAlign:"center",
                                                 lineHeight:1.3, padding:2 }}>{q.label}</span>
                                )}
                                {items.map((o,i) => {
                                  const sz  = 10+(Math.min(5,Math.max(1,parseInt(o.bizValue)||1))-1)*2;
                                  const oC  = o.status==="Closed"      ?{bg:T.greenBg,bd:T.greenBd}
                                            : o.status==="In Progress" ?{bg:T.amberBg,bd:T.amberBd}
                                            :                            {bg:T.purpleBg,bd:T.purpleBd};
                                  return (
                                    <div key={i}
                                      title={(o.ref||"")+" — "+(o.description||"").slice(0,55)+"\nEnv benefit: "+o.envValue+" · Feasibility: "+o.feasibility+" · Business value: "+o.bizValue+" · "+o.status}
                                      onClick={()=>setEditOpp(o)}
                                      style={{ width:sz, height:sz, borderRadius:"50%",
                                               background:oC.bg, border:"2px solid "+oC.bd,
                                               cursor:"pointer", flexShrink:0 }}/>
                                  );
                                })}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                  <LegendBlock groups={[
                    { title:"Cell colour — priority quadrant", items:[
                        { bg:T.tealBg,   bd:"1px solid "+T.tealBd,   br:"3px", sw:14, sh:14, label:"Pursue",       sub:"High benefit + easy"        },
                        { bg:T.blueBg,   bd:"1px solid "+T.blueBd,   br:"3px", sw:14, sh:14, label:"Plan",          sub:"High benefit, harder"        },
                        { bg:T.purpleBg, bd:"1px solid "+T.purpleBd, br:"3px", sw:14, sh:14, label:"Quick win",     sub:"Easy, lower impact"          },
                        { bg:T.slateBg,  bd:"1px solid "+T.slateBd,  br:"3px", sw:14, sh:14, label:"Deprioritise",  sub:"Low benefit + hard"          },
                    ]},
                    { title:"Dot colour — status", items:[
                        { bg:T.purpleBg, bd:"2px solid "+T.purpleBd, label:"Open"        },
                        { bg:T.amberBg,  bd:"2px solid "+T.amberBd,  label:"In Progress" },
                        { bg:T.greenBg,  bd:"2px solid "+T.greenBd,  label:"Closed"      },
                    ]},
                    { title:"Dot size — business value", items:[
                        { bg:T.muted, bd:"none", sw:10, sh:10, label:"1 — Low"  },
                        { bg:T.muted, bd:"none", sw:14, sh:14, label:"3 — Medium" },
                        { bg:T.muted, bd:"none", sw:18, sh:18, label:"5 — High" },
                    ]},
                  ]}/>
                </>
            }
          </div>
        );
      })()}
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

      {tab === "settings" && (() => {
        // Collect existing contract names for datalist
        const existingContracts = [...new Set((allProjects||[]).map(p=>p.contract||"").filter(Boolean))];
        // Check if projectId is unique
        const idTaken = (allProjects||[]).some(p=>p.id!==project.id && p.projectId && p.projectId===(project.projectId||""));
        return (
        <div>
          <Card style={{ marginBottom:"1rem" }}>
            <SectionLabel>Project details</SectionLabel>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px 16px" }}>
              <Fld label="Project name"><input value={project.name||""} onChange={e=>onChange({...project,name:e.target.value})} placeholder="Project name" style={iw}/></Fld>
              <Fld label="Project ID">
                <div>
                  <input value={project.projectId||""} onChange={e=>onChange({...project,projectId:e.target.value})}
                    placeholder="e.g. PRJ-00123" style={{ ...iw, borderColor:idTaken?T.red:undefined }}/>
                  {idTaken && <p style={{ fontSize:11, color:T.red, margin:"3px 0 0" }}>ID already used by another project</p>}
                </div>
              </Fld>
              <Fld label="Company"><input value={project.company||""} onChange={e=>onChange({...project,company:e.target.value})} placeholder="Company" style={iw}/></Fld>
              <Fld label="Contract / portfolio">
                <input value={project.contract||""} onChange={e=>onChange({...project,contract:e.target.value})}
                  placeholder="Type or select existing" list="contract-datalist" style={iw}/>
                <datalist id="contract-datalist">
                  {existingContracts.map(c=><option key={c} value={c}/>)}
                </datalist>
              </Fld>
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
        );
      })()}
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

// ── Portfolio Overview ────────────────────────────────────────────────────────
function PortfolioView({ projects, onClose, onSelect }) {
  const [activeContract, setActiveContract] = useState("__all__");

  // Build contract list
  const contractMap = {};
  projects.forEach(p => {
    const key = (p.contract||"").trim() || "__none__";
    if (!contractMap[key]) contractMap[key] = [];
    contractMap[key].push(p);
  });
  const contractGroups = Object.entries(contractMap).sort(([a],[b]) =>
    a==="__none__" ? 1 : b==="__none__" ? -1 : a.localeCompare(b)
  );

  const visibleProjects = activeContract==="__all__" ? projects
    : projects.filter(p => (activeContract==="__none__" ? !(p.contract||"").trim() : (p.contract||"").trim()===activeContract));
  const visAspects = visibleProjects.flatMap(p=>p.aspects||[]);
  const visOpps    = visibleProjects.flatMap(p=>p.opps||[]);
  const visSig     = visAspects.filter(a=>calcSig(a)==="SIGNIFICANT").length;
  const visWatch   = visAspects.filter(a=>calcSig(a)==="WATCH").length;
  const visLow     = visAspects.filter(a=>calcSig(a)==="Low").length;
  const visHigh    = visOpps.filter(o=>calcOppScore(o)>=75).length;
  const openAsp    = visAspects.filter(a=>a.status==="Open").length;
  const inProgAsp  = visAspects.filter(a=>a.status==="In Progress").length;
  const closedAsp  = visAspects.filter(a=>a.status==="Closed").length;

  const MiniDonut = ({ segments, size=52, strokeW=9 }) => {
    const r = (size-strokeW)/2; const circ = 2*Math.PI*r;
    const total = segments.reduce((s,g)=>s+g.v,0)||1;
    let offset = 0;
    return (
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={strokeW}/>
        {segments.map((g,i) => {
          const len = (g.v/total)*circ;
          const el = <circle key={i} cx={size/2} cy={size/2} r={r} fill="none"
            stroke={g.c} strokeWidth={strokeW} strokeDasharray={len+" "+(circ-len)}
            strokeDashoffset={-offset} strokeLinecap="butt"/>;
          offset += len; return el;
        })}
      </svg>
    );
  };

  const ProjectCard = ({ p }) => {
    const asp   = p.aspects||[];
    const opp   = p.opps||[];
    const sig   = asp.filter(a=>calcSig(a)==="SIGNIFICANT").length;
    const watch = asp.filter(a=>calcSig(a)==="WATCH").length;
    const low   = asp.filter(a=>calcSig(a)==="Low").length;
    const openN = asp.filter(a=>a.status==="Open").length;
    const inProg= asp.filter(a=>a.status==="In Progress").length;
    const closed= asp.filter(a=>a.status==="Closed").length;
    const hi    = opp.filter(o=>calcOppScore(o)>=75).length;
    const tot   = asp.length;
    return (
      <div onClick={()=>{ onSelect(p.id); onClose(); }}
        style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:10,
                 padding:"14px 16px", cursor:"pointer", transition:"border-color 0.15s",
                 display:"grid", gridTemplateColumns:"1fr auto", gap:"12px 20px", alignItems:"start" }}
        onMouseEnter={e=>e.currentTarget.style.borderColor="var(--teal-bd)"}
        onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border)"}>
        {/* Left: text */}
        <div>
          <div style={{ display:"flex", alignItems:"baseline", gap:10, marginBottom:8, flexWrap:"wrap" }}>
            <span style={{ fontSize:14, fontWeight:600, color:"var(--text)" }}>{p.name||"Unnamed"}</span>
            {p.projectId && <span style={{ fontFamily:"var(--mono,monospace)", fontSize:10, color:"var(--faint)" }}>{p.projectId}</span>}
            {p.company && <span style={{ fontSize:12, color:"var(--muted)" }}>{p.company}</span>}
            <div style={{ display:"flex", gap:5, marginLeft:"auto" }}>
              {p.type  && <span style={{ fontSize:9, padding:"2px 7px", borderRadius:3, background:"var(--slate-bg)", color:"var(--slate)", border:"1px solid var(--slate-bd)" }}>{p.type}</span>}
              {p.phase && <span style={{ fontSize:9, padding:"2px 7px", borderRadius:3, background:"var(--blue-bg)", color:"var(--blue)", border:"1px solid var(--blue-bd)" }}>{p.phase}</span>}
            </div>
          </div>
          {/* Significance bar */}
          <div style={{ marginBottom:10 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
              <span style={{ fontSize:10, color:"var(--muted)", fontWeight:500 }}>Significance</span>
              <span style={{ fontSize:10, color:"var(--faint)" }}>{tot} aspect{tot!==1?"s":""}</span>
            </div>
            {tot>0 ? <div style={{ display:"flex", height:7, borderRadius:4, overflow:"hidden", gap:"1px" }}>
              {sig   > 0 && <div style={{ flex:sig,   background:"var(--red-bd)",   minWidth:4 }} title={"Significant: "+sig}/>}
              {watch > 0 && <div style={{ flex:watch, background:"var(--amber-bd)", minWidth:4 }} title={"Watch: "+watch}/>}
              {low   > 0 && <div style={{ flex:low,   background:"var(--green-bd)", minWidth:4 }} title={"Low: "+low}/>}
              {(asp.length-sig-watch-low) > 0 && <div style={{ flex:asp.length-sig-watch-low, background:"var(--border)", minWidth:2 }}/>}
            </div> : <div style={{ height:7, borderRadius:4, background:"var(--border)" }}/>}
            <div style={{ display:"flex", gap:8, marginTop:5 }}>
              {[{l:"Sig",v:sig,bg:"var(--red-bg)",c:"var(--red)",bd:"var(--red-bd)"},
                {l:"Watch",v:watch,bg:"var(--amber-bg)",c:"var(--amber)",bd:"var(--amber-bd)"},
                {l:"Low",v:low,bg:"var(--green-bg)",c:"var(--green)",bd:"var(--green-bd)"}].map(({l,v,bg,c,bd})=>(
                <span key={l} style={{ fontSize:10, display:"inline-flex", alignItems:"center", gap:3,
                                       padding:"1px 6px", borderRadius:3, background:bg, color:c, border:"1px solid "+bd }}>
                  {l} <strong style={{ fontWeight:700 }}>{v}</strong>
                </span>
              ))}
            </div>
          </div>
          {/* Opportunities row */}
          {opp.length > 0 && <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <span style={{ fontSize:10, color:"var(--muted)", fontWeight:500 }}>Opportunities:</span>
            <span style={{ fontSize:10, color:"var(--muted)" }}>Total <strong style={{ color:"var(--text)" }}>{opp.length}</strong></span>
            <span style={{ fontSize:10, color:"var(--muted)", display:"flex", alignItems:"center", gap:3 }}>
              <span style={{ width:7, height:7, borderRadius:"50%", background:"var(--teal)", display:"inline-block" }}/>
              High <strong style={{ color:"var(--text)" }}>{hi}</strong>
            </span>
          </div>}
        </div>
        {/* Right: status donut */}
        {tot > 0 && (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4, minWidth:60 }}>
            <div style={{ position:"relative" }}>
              <MiniDonut segments={[
                {v:openN,  c:"var(--red)"},
                {v:inProg, c:"var(--amber)"},
                {v:closed, c:"var(--green)"},
              ]}/>
              <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center",
                             justifyContent:"center", flexDirection:"column" }}>
                <span style={{ fontSize:11, fontWeight:700, color:"var(--text)", lineHeight:1 }}>{tot}</span>
              </div>
            </div>
            <span style={{ fontSize:9, color:"var(--faint)", textAlign:"center" }}>aspects</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding:"1.5rem 1.75rem", background:"var(--bg)", minHeight:"100%", fontFamily:"var(--sans, system-ui)" }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.25rem" }}>
        <div>
          <h1 style={{ margin:"0 0 3px", fontSize:18, fontWeight:700, color:"var(--text)" }}>Portfolio overview</h1>
          <p style={{ margin:0, fontSize:12, color:"var(--muted)" }}>{projects.length} project{projects.length!==1?"s":""} · {visAspects.length} aspects · {visOpps.length} opportunities</p>
        </div>
        <button onClick={onClose}
          style={{ padding:"6px 14px", borderRadius:6, border:"1px solid var(--border)", background:"transparent",
                   color:"var(--muted)", cursor:"pointer", fontSize:12 }}>
          Close
        </button>
      </div>

      {/* Contract filter tabs */}
      {contractGroups.length > 1 && (
        <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:"1.25rem",
                      borderBottom:"2px solid var(--border)", paddingBottom:0 }}>
          {[["__all__","All contracts"],...contractGroups.map(([k,ps])=>[k,k==="__none__"?"No contract":k])].map(([key,label])=>(
            <button key={key} onClick={()=>setActiveContract(key)}
              style={{ padding:"7px 14px", fontSize:12, fontWeight:500, cursor:"pointer",
                       border:"none", background:"transparent", fontFamily:"var(--sans,system-ui)",
                       borderBottom:"2px solid "+(activeContract===key?"var(--teal)":"transparent"),
                       marginBottom:"-2px", color:activeContract===key?"var(--teal)":"var(--muted)" }}>
              {label}
              {key!=="__all__" && <span style={{ marginLeft:6, fontSize:10, color:"var(--faint)" }}>
                ({(contractMap[key]||[]).length})
              </span>}
            </button>
          ))}
        </div>
      )}

      {/* Stat cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(110px,1fr))", gap:10, marginBottom:"1.5rem" }}>
        {[
          { label:"Projects",      val:visibleProjects.length, bg:"var(--surface)",   c:"var(--text)",   bd:"var(--border)"    },
          { label:"Total aspects", val:visAspects.length,      bg:"var(--surface)",   c:"var(--text)",   bd:"var(--border)"    },
          { label:"Significant",   val:visSig,                 bg:"var(--red-bg)",    c:"var(--red)",    bd:"var(--red-bd)"    },
          { label:"Watch",         val:visWatch,               bg:"var(--amber-bg)",  c:"var(--amber)",  bd:"var(--amber-bd)"  },
          { label:"Open",          val:openAsp,                bg:"var(--red-bg)",    c:"var(--red)",    bd:"var(--red-bd)"    },
          { label:"Opportunities", val:visOpps.length,         bg:"var(--purple-bg)", c:"var(--purple)", bd:"var(--purple-bd)" },
        ].map(({ label, val, bg, c, bd }) => (
          <div key={label} style={{ background:bg, borderRadius:8, padding:"10px 12px", border:"1px solid "+bd }}>
            <p style={{ fontSize:9, fontWeight:600, color:c, margin:"0 0 5px", letterSpacing:"0.08em", textTransform:"uppercase" }}>{label}</p>
            <p style={{ fontSize:20, fontWeight:700, margin:0, color:c, lineHeight:1 }}>{val}</p>
          </div>
        ))}
      </div>

      {/* Portfolio donut row */}
      {visAspects.length > 0 && (
        <div style={{ display:"flex", gap:20, flexWrap:"wrap", marginBottom:"1.5rem",
                      background:"var(--surface)", borderRadius:10, padding:"14px 20px",
                      border:"1px solid var(--border)", alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ position:"relative" }}>
              <svg width={72} height={72} style={{ transform:"rotate(-90deg)" }}>
                {(() => {
                  const r=26; const circ=2*Math.PI*r; const tot=visAspects.length||1;
                  const segs=[{v:visSig,c:"var(--red-bd)"},{v:visWatch,c:"var(--amber-bd)"},{v:visLow,c:"var(--green-bd)"}];
                  let off=0; return segs.map((g,i)=>{
                    const len=(g.v/tot)*circ;
                    const el=<circle key={i} cx={36} cy={36} r={r} fill="none" stroke={g.c} strokeWidth={12}
                      strokeDasharray={len+" "+(circ-len)} strokeDashoffset={-off}/>;
                    off+=len; return el;
                  });
                })()}
                <circle cx={36} cy={36} r={26} fill="none" stroke="var(--border)" strokeWidth={12} opacity={0.3}/>
              </svg>
              <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column",
                             alignItems:"center", justifyContent:"center" }}>
                <span style={{ fontSize:14, fontWeight:700, color:"var(--text)", lineHeight:1 }}>{visAspects.length}</span>
                <span style={{ fontSize:8, color:"var(--faint)" }}>aspects</span>
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
              {[{l:"Significant",v:visSig,c:"var(--red)"},{l:"Watch",v:visWatch,c:"var(--amber)"},{l:"Low",v:visLow,c:"var(--green)"}].map(({l,v,c})=>(
                <div key={l} style={{ display:"flex", alignItems:"center", gap:8, fontSize:12 }}>
                  <span style={{ width:8, height:8, borderRadius:"50%", background:c, display:"inline-block", flexShrink:0 }}/>
                  <span style={{ color:"var(--muted)", minWidth:70 }}>{l}</span>
                  <strong style={{ color:"var(--text)", minWidth:20, textAlign:"right" }}>{v}</strong>
                </div>
              ))}
            </div>
          </div>
          <div style={{ width:"1px", background:"var(--border)", alignSelf:"stretch", margin:"0 4px" }}/>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ position:"relative" }}>
              <svg width={72} height={72} style={{ transform:"rotate(-90deg)" }}>
                {(() => {
                  const r=26; const circ=2*Math.PI*r; const tot=visAspects.length||1;
                  const segs=[{v:openAsp,c:"var(--red-bd)"},{v:inProgAsp,c:"var(--amber-bd)"},{v:closedAsp,c:"var(--green-bd)"}];
                  let off=0; return segs.map((g,i)=>{
                    const len=(g.v/tot)*circ;
                    const el=<circle key={i} cx={36} cy={36} r={r} fill="none" stroke={g.c} strokeWidth={12}
                      strokeDasharray={len+" "+(circ-len)} strokeDashoffset={-off}/>;
                    off+=len; return el;
                  });
                })()}
                <circle cx={36} cy={36} r={26} fill="none" stroke="var(--border)" strokeWidth={12} opacity={0.3}/>
              </svg>
              <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column",
                             alignItems:"center", justifyContent:"center" }}>
                <span style={{ fontSize:14, fontWeight:700, color:"var(--text)", lineHeight:1 }}>{openAsp}</span>
                <span style={{ fontSize:8, color:"var(--faint)" }}>open</span>
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
              {[{l:"Open",v:openAsp,c:"var(--red)"},{l:"In Progress",v:inProgAsp,c:"var(--amber)"},{l:"Closed",v:closedAsp,c:"var(--green)"}].map(({l,v,c})=>(
                <div key={l} style={{ display:"flex", alignItems:"center", gap:8, fontSize:12 }}>
                  <span style={{ width:8, height:8, borderRadius:"50%", background:c, display:"inline-block", flexShrink:0 }}/>
                  <span style={{ color:"var(--muted)", minWidth:70 }}>{l}</span>
                  <strong style={{ color:"var(--text)", minWidth:20, textAlign:"right" }}>{v}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Project cards */}
      <h2 style={{ fontSize:13, fontWeight:600, margin:"0 0 0.6rem", color:"var(--muted)",
                   textTransform:"uppercase", letterSpacing:"0.06em" }}>
        {activeContract==="__all__" ? "All projects" : activeContract==="__none__" ? "No contract assigned" : activeContract}
        <span style={{ marginLeft:8, fontWeight:400, color:"var(--faint)" }}>({visibleProjects.length})</span>
      </h2>
      <div style={{ display:"grid", gap:8, marginBottom:"1.75rem" }}>
        {visibleProjects.map(p => <ProjectCard key={p.id} p={p}/>)}
      </div>

      {/* Cross-portfolio significant aspects */}
      {visSig > 0 && (
        <div>
          <h2 style={{ fontSize:13, fontWeight:600, margin:"0 0 0.6rem", color:"var(--muted)",
                       textTransform:"uppercase", letterSpacing:"0.06em" }}>
            Significant aspects ({visSig})
          </h2>
          <div style={{ background:"var(--surface)", borderRadius:8, border:"1px solid var(--border)", overflow:"hidden" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
              <thead>
                <tr style={{ background:"var(--surface2)" }}>
                  {["Contract","Project","ID","Ref","Aspect","Score","Phase","Status"].map(h => (
                    <th key={h} style={{ padding:"8px 12px", textAlign:"left", fontSize:9, fontWeight:600,
                                         color:"var(--muted)", borderBottom:"1px solid var(--border)",
                                         textTransform:"uppercase", letterSpacing:"0.07em", whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleProjects.flatMap(p =>
                  (p.aspects||[]).filter(a=>calcSig(a)==="SIGNIFICANT").map(a=>({...a,_proj:p}))
                ).map((a,i) => {
                  const score = calcScore(a);
                  return (
                    <tr key={i} style={{ borderBottom:"1px solid var(--row-bd)", borderLeft:"3px solid var(--red-bd)" }}>
                      <td style={{ padding:"8px 12px", fontSize:11, color:"var(--faint)" }}>{a._proj.contract||"—"}</td>
                      <td style={{ padding:"8px 12px", fontSize:11, color:"var(--muted)" }}>{a._proj.name||"Unnamed"}</td>
                      <td style={{ padding:"8px 12px" }}><span style={{ fontFamily:"monospace", fontSize:10, color:"var(--faint)" }}>{a._proj.projectId||"—"}</span></td>
                      <td style={{ padding:"8px 12px" }}><span style={{ fontSize:10, fontWeight:600, color:"var(--teal)" }}>{a.ref}</span></td>
                      <td style={{ padding:"8px 12px", fontWeight:500, color:"var(--text)", maxWidth:180 }}>
                        <div style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }} title={a.aspect}>{a.aspect||"—"}</div>
                      </td>
                      <td style={{ padding:"8px 12px", fontWeight:700, color:"var(--red)", whiteSpace:"nowrap" }}>{score!==null?score:"—"}</td>
                      <td style={{ padding:"8px 12px" }}><span style={{ fontSize:9, padding:"2px 5px", borderRadius:3, background:"var(--slate-bg)", color:"var(--slate)" }}>{a.phase||"—"}</span></td>
                      <td style={{ padding:"8px 12px" }}><span style={{ fontSize:9, padding:"2px 5px", borderRadius:3, background:"var(--red-bg)", color:"var(--red)" }}>{a.status||"Open"}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Sidebar({ projects, activeId, onSelect, onNew, isDark, onToggleTheme, zoom, onZoom, onDuplicate, onPortfolio, portfolioActive }) {
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
        <button onClick={onPortfolio}
          style={{ width:"100%", marginTop:8, padding:"6px 10px", borderRadius:5,
                   border:"1px solid "+(portfolioActive?"var(--teal-bd)":"var(--sb-bd)"),
                   background:portfolioActive?"var(--teal)":"transparent",
                   color:portfolioActive?"#fff":"var(--sb-muted)",
                   fontFamily:"var(--sans,system-ui)", fontSize:11, fontWeight:500,
                   cursor:"pointer", display:"flex", alignItems:"center", gap:6, justifyContent:"center" }}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/>
            <rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/>
          </svg>
          Portfolio overview
        </button>
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
            <div key={p.id} style={{ position:"relative", marginBottom:1 }}
              onMouseEnter={e=>{ const btn=e.currentTarget.querySelector(".dup-btn"); if(btn)btn.style.opacity="1"; }}
              onMouseLeave={e=>{ const btn=e.currentTarget.querySelector(".dup-btn"); if(btn)btn.style.opacity="0"; }}>
              <button onClick={()=>onSelect(p.id)}
                style={{ width:"100%", textAlign:"left", padding:"8px 10px", borderRadius:6,
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
              <button className="dup-btn" onClick={e=>{ e.stopPropagation(); onDuplicate(p.id); }}
                title="Duplicate project"
                style={{ position:"absolute", top:"50%", right:6, transform:"translateY(-50%)",
                         opacity:0, transition:"opacity 0.15s",
                         background:T.sbBg2, border:"1px solid "+T.sbBd, borderRadius:4,
                         padding:"3px 6px", cursor:"pointer", fontSize:11, color:T.sbMuted }}>
                ⧉
              </button>
            </div>
          );
        })}
      </div>
      <div style={{ padding:"8px", borderTop:"1px solid "+T.sbBd }}>
        <button onClick={onNew}
          style={{ width:"100%", padding:"7px", borderRadius:6, border:"1px dashed "+T.sbBd, marginBottom:6,
                   background:"transparent", color:T.sbFaint, fontFamily:T.mono, fontSize:11, cursor:"pointer" }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=T.teal;e.currentTarget.style.color=T.teal;}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--sb-bd)";e.currentTarget.style.color="var(--sb-faint)";}}>
          + New project
        </button>
        <div style={{ display:"flex", gap:4 }}>
          {[[0.88,"A−"],[1.0,"A"],[1.15,"A+"]].map(([val,label]) => (
            <button key={val} onClick={()=>onZoom(val)}
              style={{ flex:1, padding:"4px 0", fontSize:val===1.15?12:val===1.0?11:10,
                       fontFamily:T.mono, fontWeight:500, cursor:"pointer", borderRadius:4,
                       border:"1px solid "+(Math.abs(zoom-val)<0.01?T.teal:"var(--sb-bd)"),
                       background:Math.abs(zoom-val)<0.01?T.teal:"transparent",
                       color:Math.abs(zoom-val)<0.01?"#fff":"var(--sb-muted)" }}>
              {label}
            </button>
          ))}
        </div>
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
  const [zoom,    setZoom]    = useState(() => parseFloat(localStorage.getItem("env-zoom")||"1"));
  const [showPortfolio, setShowPortfolio] = useState(false);

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
    localStorage.setItem("env-zoom", String(zoom));
  }, [projects, activeId, loaded, isDark]);

  useEffect(() => { document.body.style.zoom = String(zoom); }, [zoom]);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    applyTheme(next?"dark":"light");
  };
  const handleZoom = v => { setZoom(v); localStorage.setItem("env-zoom", String(v)); };

  const [newProjectId, setNewProjectId] = useState(null);
  const createProject = () => {
    const p = newProject();
    setProjects(prev => [...prev, p]);
    setActiveId(p.id);
    setNewProjectId(p.id);
  };
  const updateProject = u => setProjects(prev => prev.map(p => p.id===u.id ? u : p));
  const duplicateProject = id => {
    const src = projects.find(p=>p.id===id);
    if (!src) return;
    const ts = Date.now();
    const newId = ts.toString();
    const copy = {
      ...src,
      id: newId,
      name: (src.name||"Unnamed")+" (copy)",
      createdAt: new Date().toISOString(),
      aspects: (src.aspects||[]).map((a,i) => ({ ...a, id:(ts+i+1).toString() })),
      opps:    (src.opps||[]).map((o,i)    => ({ ...o, id:(ts+100+i).toString() })),
      changelog: [],
    };
    setProjects(prev => {
      const idx = prev.findIndex(p=>p.id===id);
      const next = [...prev];
      next.splice(idx+1, 0, copy);
      return next;
    });
    setActiveId(newId);
  };
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
               isDark={isDark} onToggleTheme={toggleTheme} zoom={zoom} onZoom={handleZoom} onDuplicate={duplicateProject}
               onPortfolio={()=>setShowPortfolio(v=>!v)} portfolioActive={showPortfolio}/>
      <div style={{ flex:1, overflowX:"hidden", display:"flex", flexDirection:"column" }}>
        {showPortfolio ? (
          <div style={{ flex:1, overflow:"auto" }}>
            <PortfolioView projects={projects} onClose={()=>setShowPortfolio(false)} onSelect={setActiveId}/>
          </div>
        ) : !active ? (
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
              <ProjectView key={active.id} project={active} allProjects={projects} onChange={updateProject} onDelete={()=>deleteProject(active.id)} initialTab={active.id===newProjectId?"settings":undefined}/>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
