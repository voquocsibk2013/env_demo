import React, { useState, useEffect } from "react";


// ── Constants ─────────────────────────────────────────────────────────────────
const PHASES        = ["Engineering","Procurement","Construction","Installation","Commissioning","Operations & Maintenance","Decommissioning"];
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

// ── Opportunity scope categories for screening ────────────────────────────────
const OPP_SCOPE1_BUTTONS = [
  { id:"co2",   label:"CO₂",  sub:"Carbon dioxide",          ghgId:"s1_co2",   noxWarn:false },
  { id:"nox",   label:"NOₓ",  sub:"Nitrogen oxides",         ghgId:"s1_nox",   noxWarn:true  },
  { id:"ch4",   label:"CH₄",  sub:"Methane",                 ghgId:"s1_ch4",   noxWarn:false },
  { id:"nmvoc", label:"nmVOC",sub:"Fugitive / process VOCs", ghgId:"s1_nmvoc", noxWarn:false },
  { id:"refrig",label:"GWP gases", sub:"Refrigerants / SF₆", ghgId:"s1_refr",  noxWarn:false },
  { id:"other1",label:"Other", sub:"Other direct emission",  ghgId:"s1_other", noxWarn:false },
];
const OPP_SCOPE2_BUTTONS = [
  { id:"s2_sys",    label:"System / component optimisation",
    sub:"Improve efficiency and reduce energy consumption",
    desc:"Opportunity to reduce indirect GHG emissions through system or component-level optimisation to improve energy efficiency." },
  { id:"s2_layout", label:"Layout, design or location optimisation",
    sub:"Improve operational efficiency and reduce material or maintenance",
    desc:"Opportunity to reduce indirect emissions through design and layout choices that minimise energy demand over the operational lifecycle." },
  { id:"s2_alt",    label:"Alternative resources",
    sub:"Reduce utilities requirements",
    desc:"Opportunity to substitute conventional energy sources with lower-carbon alternatives, reducing Scope 2 indirect emissions." },
];
const OPP_SCOPE3_BUTTONS = [
  { id:"s3_mat",     label:"Material",              sub:"Weight reductions or alternatives",
    desc:"Opportunity to reduce Scope 3 Cat 1 emissions through material selection, weight reduction or substitution with lower-embodied-carbon alternatives." },
  { id:"s3_chem",    label:"Chemicals",             sub:"Substitution or reduction of hazardous / high-impact chemicals",
    desc:"Opportunity to reduce upstream Scope 3 emissions through chemical substitution, dose optimisation or process chemistry changes." },
  { id:"s3_lca",     label:"Lifecycle",             sub:"Whole-life impact reduction",
    desc:"Opportunity to reduce total lifecycle GHG footprint through design decisions that improve end-of-life outcomes." },
  { id:"s3_reuse",   label:"Re-use",                sub:"Equipment, component or material re-use",
    desc:"Opportunity to reduce Scope 3 Cat 1 emissions by reusing existing equipment, modules or materials rather than procuring new." },
  { id:"s3_recycle", label:"Re-cycle",              sub:"Closed-loop material recovery",
    desc:"Opportunity to reduce Scope 3 Cat 5/12 emissions through recycling of materials at end of project life." },
  { id:"s3_waste",   label:"Waste evaluation",      sub:"Waste stream characterisation and minimisation",
    desc:"Opportunity to reduce emissions from waste streams through better characterisation, segregation and diversion from landfill." },
  { id:"s3_trans",   label:"Transport",             sub:"Logistics and supply chain optimisation",
    desc:"Opportunity to reduce Scope 3 Cat 4 transport emissions through route, mode or logistics optimisation." },
  { id:"s3_remote",  label:"Remote technology /\nAutomated solutions", sub:"Reduce physical mobilisation and travel",
    desc:"Opportunity to reduce Scope 3 Cat 6 / Cat 9 emissions through remote monitoring, digital twins or automated inspection replacing physical presence." },
];


// ── Environmental risk categories (from aspects reference library) ──────────
const RISK_CATEGORIES = [
  {
    cat: '1. Ecology & Biodiversity',
    color: 'green',
    items: [
      { id:'eco_01', sub: 'Protected habitat & designations', hint: 'Siting, ground clearance, cable/pipeline routing', aspect: 'Loss of or disturbance to Natura 2000, RAMSAR, or nationally protected habitat' },
      { id:'eco_02', sub: 'Protected species — terrestrial', hint: 'Vegetation removal, excavation in known habitat', aspect: 'Disturbance or harm to red-listed or Annex IV species (bats, reptiles, insects)' },
      { id:'eco_03', sub: 'Vegetation clearance', hint: 'Land clearing, access track construction, cable trenching', aspect: 'Habitat loss; harm to nesting birds or protected plant species' },
      { id:'eco_04', sub: 'Invasive species', hint: 'Earthworks, material import, equipment mobilisation', aspect: 'Introduction or spread of invasive plant or animal species' },
      { id:'eco_05', sub: 'Ecological connectivity', hint: 'Linear construction, fencing, culverting', aspect: 'Severance of wildlife corridors (hedgerows, riparian margins, migration routes)' },
      { id:'eco_06', sub: 'Marine mammal protection', hint: 'Seismic surveys, piling, vessel operations, sonar', aspect: 'Acoustic disturbance, injury, or displacement of cetaceans and seals' },
      { id:'eco_07', sub: 'Fish spawning & migration', hint: 'Seabed disturbance, dewatering outfall, cofferdam', aspect: 'Disruption to salmon, herring, or other protected fish migration or spawning' },
      { id:'eco_08', sub: 'Seabed habitats', hint: 'Anchoring, trenching, structure installation, decommissioning', aspect: 'Physical damage to cold-water coral, maerl beds, biogenic reef, or priority seabed habitat' },
      { id:'eco_09', sub: 'Bird collision & displacement', hint: 'Wind turbines, flare stacks, tall structures, marine platforms, construction lighting', aspect: 'Collision mortality or displacement of migratory or breeding birds' },
      { id:'eco_10', sub: 'Light pollution & ecology', hint: 'Floodlighting, flare lighting, platform lighting', aspect: 'Disruption to nocturnal species (bats, insects, seabirds) behaviour and movement' },
      { id:'eco_11', sub: 'Peat & carbon-rich soil disturbance', hint: 'Onshore trenching, grading, borrow pits in peatland', aspect: 'Release of stored carbon; peat subsidence; loss of protected bog habitat' },
      { id:'eco_12', sub: 'Phase 1 Habitat Survey *(desk study + walkover)*', hint: 'Any onshore project with potential ecological sensitivity; EIA scoping; planning application', aspect: 'Failure to identify habitats or designated sites before design — consent delay, stop-work, or inadequate mitigation design' },
      { id:'eco_13', sub: 'Phase 2 Ecological Survey *(NVC, protected species, extended walkover)*', hint: 'Triggered by Phase 1 findings; applies within seasonal survey windows (bat, reptile, bird nesting)', aspect: 'Incomplete species data leading to consent refusal, planning conditions, or missed mitigation opportunities; seasonal window missed delaying project' },
      { id:'eco_14', sub: 'Noise boundary limits', hint: 'Compressors, turbines, processing plant, generators', aspect: 'Noise at community boundary exceeding regulatory or planning limits' },
      { id:'eco_15', sub: 'Construction noise', hint: 'Piling, demolition, heavy plant, blasting', aspect: 'Community noise disturbance during construction works' },
      { id:'eco_16', sub: 'Noise during commissioning', hint: 'Pressure testing, relief valve lift, venting, flaring', aspect: 'High-impulse or sustained noise during start-up and testing activities' },
      { id:'eco_17', sub: 'Ground vibration', hint: 'Piling, blasting, heavy compaction, road traffic from heavy plant', aspect: 'Structural damage to third-party property; nuisance vibration' },
      { id:'eco_18', sub: 'Underwater noise — pile driving', hint: 'Offshore monopile installation, jacket installation, subsea piling', aspect: 'Acoustic injury or disturbance to fish and marine mammals' },
      { id:'eco_19', sub: 'Artificial light at night', hint: 'Floodlighting, flare stacks, platform lighting, construction lighting', aspect: 'Disruption to nocturnal wildlife (bats, insects, seabirds); community visual intrusion' },
      { id:'eco_20', sub: 'Noise baseline survey', hint: 'Projects near sensitive receptors (residential, schools); Forurensningsloven §11 permit trigger; construction noise impact prediction', aspect: 'Permit conditions set without pre-project background; complaint risk; inadequate noise limits in contract or planning consent' },
    ],
  },
  {
    cat: '2. Discharge to Water & Marine Environment',
    color: 'blue',
    items: [
      { id:'wat_01', sub: 'Ballast water (vessels)', hint: 'Vessel operations, installation support vessels', aspect: 'Introduction of non-indigenous species via ballast water exchange' },
      { id:'wat_02', sub: 'Vessel fuel & lubricants', hint: 'Marine support operations, installation vessels', aspect: 'Accidental oil discharge from vessel machinery or fuel transfer' },
      { id:'wat_03', sub: 'Grey water & sewage (vessels)', hint: 'Crew vessels, installation vessels, FPSOs', aspect: 'Sewage discharge within 12 nm or in special areas' },
      { id:'wat_04', sub: 'Cooling water thermal discharge', hint: 'Power plant cooling, electrolyser cooling, process cooling', aspect: 'Elevated temperature affecting dissolved oxygen and species behaviour in receiving water' },
      { id:'wat_05', sub: 'Produced water', hint: 'Oil & gas production operations', aspect: 'Discharge of produced water with hydrocarbons, scale inhibitors, NORM' },
      { id:'wat_06', sub: 'Process wastewater design', hint: 'Chemical injection, utility systems, drains', aspect: 'Design of wastewater streams — volume, composition, treatment route' },
      { id:'wat_07', sub: 'Seabed sediment disturbance', hint: 'Dredging, trenching, anchor dragging, jetting, structure installation', aspect: 'Sediment plume; burial of benthic communities; contaminant resuspension' },
      { id:'wat_08', sub: 'Water quality baseline', hint: 'Onshore watercourse crossings; discharge permitting under Forurensningsloven §11; offshore produced water permitting', aspect: 'Permit refused or inappropriate conditions set without baseline evidence; inability to demonstrate no deterioration under WFD Art. 4' },
      { id:'wat_09', sub: 'Marine baseline survey *(benthic, ROV, seabed characterisation)*', hint: 'Offshore installation, pipeline or cable routing, anchor deployment, dredging', aspect: 'Unable to demonstrate pre-installation seabed condition; permit refused; unexpected sensitive habitat (cold-water coral, maerl) triggering stop-work' },
      { id:'wat_10', sub: 'Geophysical / UXO survey', hint: 'Offshore seabed operations; pipeline or cable route survey; anchor pattern; jack-up preloading; construction in former conflict areas', aspect: 'Unknown seabed obstacles, contamination, UXO, or unstable ground; dropped object risk; unexpected habitat disturbance; jack-up punch-through' },
    ],
  },
  {
    cat: '3. Emission to Air',
    color: 'red',
    items: [
      { id:'air_01', sub: 'Stack / vent emissions', hint: 'Combustion plant, gas turbines, boilers, heaters', aspect: 'NOₓ, SO₂, CO, PM₁₀ exceeding permit or regulatory limits' },
      { id:'air_02', sub: 'Diesel plant emissions', hint: 'Generators, construction plant, crane engines', aspect: 'NOₓ, PM from diesel combustion; contributes to NOₓ tax liability' },
      { id:'air_03', sub: 'Flaring volumes & composition', hint: 'Commissioning purge, emergency relief, production upsets', aspect: 'Combustion products; unburnt hydrocarbons; black smoke; GHG; NOₓ and CO₂ tax liability' },
      { id:'air_04', sub: 'NOₓ emissions & NOₓ tax', hint: 'Gas turbines, engines, flaring, process heaters — offshore and nearshore', aspect: 'NOₓ emissions subject to Norwegian NOₓ tax (kr/kg NOₓ); obligation to join NOₓ Fund or pay full rate' },
      { id:'air_05', sub: 'CO₂ emissions & CO₂ tax / ETS', hint: 'All combustion, flaring, venting, process releases from offshore installations', aspect: 'CO₂ emissions subject to Norwegian CO₂ tax and Norwegian ETS (kvotesystemet)' },
      { id:'air_06', sub: 'GHG / CO₂ reporting', hint: 'All combustion, venting, flaring, process releases — all active phases', aspect: 'GHG emissions contributing to national inventory, carbon reporting, and regulatory/fiscal obligations' },
      { id:'air_07', sub: 'Fugitive VOC & hydrocarbon emissions', hint: 'Flanges, valve stems, loading operations, tank venting', aspect: 'Atmospheric VOC / methane release; contribution to GHG inventory' },
      { id:'air_08', sub: 'Dust generation', hint: 'Bulk excavation, demolition, dry material handling, demolition', aspect: 'Nuisance dust or PM₁₀ affecting receptors; contaminated dust if hazmat present' },
      { id:'air_09', sub: 'Marine vessel air emissions', hint: 'Supply vessels, installation vessels, PSVs', aspect: 'SOₓ, NOₓ, PM, black carbon — ECA compliance' },
      { id:'air_10', sub: 'Atmospheric dispersion modelling', hint: 'Stack design, siting near sensitive receptors', aspect: 'Air quality impact on community or ecological receptors' },
      { id:'air_11', sub: 'Odour', hint: 'Wastewater treatment, waste handling, produced water, solvents, construction waste', aspect: 'Odour nuisance affecting community receptors' },
      { id:'air_11', sub: 'Energy consumption', hint: 'Process design, utilities, lighting, HVAC, compression systems', aspect: 'Excessive energy consumption; GHG emissions; regulatory or contractual energy targets' },
      { id:'air_12', sub: 'Paint & surface treatment VOCs', hint: 'Maintenance painting, blasting, coating operations', aspect: 'VOC emissions from solvents; contaminated blast grit; paint waste' },
      { id:'air_13', sub: 'Air quality baseline monitoring', hint: 'Facilities near sensitive receptors (residential, schools, hospitals); emission permit applications under Forurensningsloven §11; EIA', aspect: 'Permit refused or inappropriate emission limit set without pre-project background data; inability to attribute project contribution' },
    ],
  },
  {
    cat: '4. Waste, Materials & Chemicals',
    color: 'amber',
    items: [
      { id:'wst_01', sub: 'Hazardous substance inventory & REACH', hint: 'Chemical specification, procurement, materials selection', aspect: 'Failure to register or control SVHCs; non-compliant use of restricted substances' },
      { id:'wst_02', sub: 'Waste hierarchy — materials selection', hint: 'Design decisions, material specification', aspect: 'Generation of excess or non-recyclable waste due to poor design choices' },
      { id:'wst_03', sub: 'Hazardous waste', hint: 'Excavated contaminated soil, chemical containers, insulation, first-fill residues', aspect: 'Improper storage, transport, or disposal of hazardous waste categories' },
      { id:'wst_04', sub: 'Packaging waste', hint: 'Procurement of equipment, materials, consumables', aspect: 'Non-recyclable or excessive packaging waste volumes' },
      { id:'wst_05', sub: 'Refrigerants & blowing agents (F-gas)', hint: 'HVAC design, insulation foam specification, fire suppression systems', aspect: 'Use of high-GWP HFCs; F-gas leakage and loss' },
      { id:'wst_06', sub: 'Asbestos', hint: 'Legacy equipment, pipe lagging, insulation removal in older facilities', aspect: 'Asbestos fibre release during maintenance or demolition' },
      { id:'wst_06', sub: 'NORM — naturally occurring radioactive material', hint: 'Produced water scaling, pigging returns, sand production, deposition in vessels', aspect: 'Accumulation and disposal of NORM-contaminated scale, sludge, pigging waste' },
      { id:'wst_07', sub: 'Radioactive measurement sources', hint: 'Density gauges, level gauges, nuclear logging tools', aspect: 'Loss, damage, or disposal of sealed radioactive sources' },
      { id:'wst_08', sub: 'Heavy metals in systems', hint: 'Legacy coating systems (lead paint), alloy materials, anti-corrosion anodes', aspect: 'Release of lead, cadmium, mercury, or chromium during maintenance or decommissioning' },
      { id:'wst_09', sub: 'Chemical flushing & pigging', hint: 'Commissioning clean-up, pipeline maintenance, change of service', aspect: 'Generation of chemically contaminated flush water requiring treatment and disposal' },
      { id:'wst_10', sub: 'Tank cleaning', hint: 'Tank inspection, change of service, decommissioning', aspect: 'Oily sludge or chemical residue requiring hazardous waste disposal' },
      { id:'wst_11', sub: 'Subsea structure removal', hint: 'Decommissioning of pipelines, umbilicals, templates, jackets', aspect: 'Contaminated materials, marine litter, seabed disturbance' },
    ],
  },
  {
    cat: '5. Land, Soil & Contamination',
    color: 'brown',
    items: [
      { id:'land_01', sub: 'Bulk excavation', hint: 'Site preparation, foundation works, cable trenching', aspect: 'Loss of topsoil; disturbance of contaminated ground; peat or organic soil release' },
      { id:'land_02', sub: 'Topsoil management', hint: 'Stripping, stockpiling, and reinstatement of topsoil', aspect: 'Loss of topsoil quality; failure to reinstate appropriate substrate for habitat recovery' },
      { id:'land_03', sub: 'Soil erosion & sediment control', hint: 'Graded surfaces, unpaved haul roads, stockpiles, borrow pits', aspect: 'Sediment runoff to watercourse; loss of topsoil from disturbed areas' },
      { id:'land_04', sub: 'Land contamination survey', hint: 'Previous industrial use, infilled land, leaking USTs', aspect: 'Contamination of soil or groundwater; worker and receptor exposure' },
      { id:'land_05', sub: 'Floodplain encroachment', hint: 'Facility siting, bund design, drainage routing', aspect: 'Increased flood risk to third parties; loss of flood storage volume' },
      { id:'land_06', sub: 'Habitat reinstatement', hint: 'Post-construction restoration, decommissioning, site clearance', aspect: 'Failure to reinstate disturbed ground to pre-existing or agreed habitat quality' },
      { id:'land_07', sub: 'Concrete demolition waste', hint: 'Structure removal, decommissioning of onshore facilities', aspect: 'Alkaline debris; potential contamination; high volume for disposal or recycling' },
      { id:'land_08', sub: 'Ground disturbance near infrastructure', hint: 'Pipeline crossings, road crossings, utility corridors', aspect: 'Damage to existing buried services; unplanned releases from third-party infrastructure' },
    ],
  },
  {
    cat: '6. Community, Heritage and Lanscape',
    color: 'purple',
    items: [
      { id:'com_01', sub: 'Buried archaeological remains', hint: 'Ground breaking, piling, trenching in uncharted areas', aspect: 'Disturbance or destruction of legally protected archaeological remains' },
      { id:'com_02', sub: 'Historic buildings & structures', hint: 'Demolition, modification, or visual impact on listed buildings', aspect: 'Harm to protected or listed built heritage' },
      { id:'com_03', sub: 'Seabed cultural heritage', hint: 'Subsea pipeline, cable, or anchor installation', aspect: 'Disturbance of protected wrecks or seabed archaeological sites' },
      { id:'com_04', sub: 'Chance find procedure', hint: 'Any ground breaking activity', aspect: 'Unanticipated discovery of artefacts, structures, or human remains' },
      { id:'com_05', sub: 'Cultural landscape', hint: 'Design of installations in areas with designated cultural landscape value', aspect: 'Change to the character of a culturally significant landscape' },
      { id:'com_06', sub: 'Archaeological Desk-Based Assessment (DBA)', hint: 'Any ground disturbance onshore; seabed operations; planning application in areas of potential archaeological sensitivity', aspect: 'Failure to identify designated sites or SMR-recorded finds before works; stop-work if remains discovered; planning consent refused or conditions set without adequate baseline' },
      { id:'com_07', sub: 'Visual landscape impact', hint: 'Siting of above-ground structures, masts, flare stacks, wind turbines', aspect: 'Visual intrusion on protected landscape or sensitive scenic views' },
      { id:'com_08', sub: 'Lighting & sky glow', hint: 'Site floodlighting, platform lighting, flare', aspect: 'Community visual intrusion; sky glow in rural, wilderness, or protected settings' },
      { id:'com_09', sub: 'Cumulative visual impact', hint: 'Multiple wind turbines, platforms, or industrial structures in same viewshed', aspect: 'Combined visual impact greater than sum of individual structures' },
      { id:'com_10', sub: 'Community stakeholder engagement', hint: 'All phases with potential community impact', aspect: 'Inadequate engagement; community complaints; loss of social licence' },
      { id:'com_11', sub: 'Air quality & human health', hint: 'Emissions near residential areas, schools, hospitals', aspect: 'Exceedance of air quality standards affecting community health' },
      { id:'com_12', sub: 'Noise & community disturbance', hint: 'Plant operations, construction, traffic', aspect: 'Breach of community noise limits; sleep disturbance; complaint trigger' },
      { id:'com_13', sub: 'Emergency preparedness & community safety', hint: 'Hazardous operations near populated areas', aspect: 'Inadequate emergency planning for community receptors' },
      { id:'com_14', sub: 'Traffic & access disruption', hint: 'Heavy haulage routes, port access, offshore logistics, abnormal loads', aspect: 'Road damage, traffic congestion, community access restriction' },
      { id:'com_15', sub: 'Employment & local economy', hint: 'Project workforce planning, supply chain decisions', aspect: 'Missed opportunity for local content; social licence risk' },
      { id:'com_16', sub: 'Indigenous peoples — Sámi', hint: 'Projects in Sámi traditional lands (Finnmark/Troms/Nordland)', aspect: 'Impact on Sámi reindeer herding, cultural heritage, and traditional land use' },
      { id:'com_17', sub: 'Socioeconomic baseline', hint: 'Major projects near communities; EIA requirement; IFC PS1 projects; projects affecting employment, livelihoods, or access', aspect: 'Inadequate characterisation of baseline; EIA non-compliant; social licence risk; inability to detect and attribute project-induced socioeconomic change' },
    ],
  },
  {
    cat: '7. Abnormal Condition and Emergency Response',
    color: 'darkred',
    items: [
      { id:'emg_01', sub: 'Oil spill response plan', hint: 'All offshore and coastal hydrocarbon operations', aspect: 'Inadequate preparedness for accidental oil release; environmental damage' },
      { id:'emg_02', sub: 'Chemical spill & containment', hint: 'Chemical storage, dosing systems, loading and offloading', aspect: 'Release of hazardous chemicals to soil, water, or marine environment' },
      { id:'emg_03', sub: 'Spill protection — secondary containment', hint: 'Storage tanks, chemical bunds, drip trays, offshore deck drainage', aspect: 'Inadequate bunding or containment allowing release to ground or water' },
      { id:'emg_04', sub: 'Dropped objects — marine', hint: 'Offshore lifting, crane operations, deck work, personnel transfer', aspect: 'Loss of equipment or materials to seabed; marine debris' },
      { id:'emg_05', sub: 'Emergency venting & blowdown', hint: 'Process upsets, ESD activation, commissioning activities', aspect: 'Uncontrolled gas or hydrocarbon release to atmosphere or sea; CO₂ and NOₓ tax liability on vented/flared volumes' },
    ],
  },
];

// ── Color map for guide word categories ──────────────────────────────────────
const COLOR_MAP = {
  teal:   { bg:"var(--cat-teal-bg)",   border:"var(--cat-teal-bd)",   text:"var(--cat-teal-tx)",   head:"var(--cat-teal-hd)" },
  purple: { bg:"var(--cat-purple-bg)", border:"var(--cat-purple-bd)", text:"var(--cat-purple-tx)", head:"var(--cat-purple-hd)" },
  amber:  { bg:"var(--cat-amber-bg)",  border:"var(--cat-amber-bd)",  text:"var(--cat-amber-tx)",  head:"var(--cat-amber-hd)" },
  red:    { bg:"var(--cat-red-bg)",    border:"var(--cat-red-bd)",    text:"var(--cat-red-tx)",    head:"var(--cat-red-hd)" },
  green:  { bg:"var(--cat-green-bg)",  border:"var(--cat-green-bd)",  text:"var(--cat-green-tx)",  head:"var(--cat-green-hd)" },
  blue:   { bg:"var(--cat-blue-bg)",   border:"var(--cat-blue-bd)",   text:"var(--cat-blue-tx)",   head:"var(--cat-blue-hd)" },
  gray:    { bg:"var(--cat-gray-bg)",    border:"var(--cat-gray-bd)",    text:"var(--cat-gray-tx)",    head:"var(--cat-gray-hd)"    },
  brown:   { bg:"var(--cat-brown-bg)",   border:"var(--cat-brown-bd)",   text:"var(--cat-brown-tx)",   head:"var(--cat-brown-hd)"   },
  darkred: { bg:"var(--cat-darkred-bg)", border:"var(--cat-darkred-bd)", text:"var(--cat-darkred-tx)", head:"var(--cat-darkred-hd)" },
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
    "--cat-brown-bg":"#EFEBE9","--cat-brown-bd":"#BCAAA4","--cat-brown-tx":"#3E2723","--cat-brown-hd":"#5D4037",
    "--cat-darkred-bg":"#FCE4EC","--cat-darkred-bd":"#F48FB1","--cat-darkred-tx":"#880E4F","--cat-darkred-hd":"#AD1457",
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
    "--cat-brown-bg":"#1A1108","--cat-brown-bd":"#6D4025","--cat-brown-tx":"#DDB07A","--cat-brown-hd":"#A0622E",
    "--cat-darkred-bg":"#1A0612","--cat-darkred-bd":"#7B1248","--cat-darkred-tx":"#F4A0C8","--cat-darkred-hd":"#C2185B",
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
function snapKg(phase) {
  // Works for both GhgPhase and legacy GhgSnapshot
  if (!phase) return {identified:0, actual:0};
  const lines = phase.lines||[];
  const reduction = l => parseFloat(l.reduction||l.qty||0);
  return {
    identified: lines.filter(l=>l.savingType!=="actual").reduce((s,l)=>s+reduction(l)*(parseFloat(l.cf)||0),0),
    actual:     lines.filter(l=>l.savingType==="actual" ).reduce((s,l)=>s+reduction(l)*(parseFloat(l.cf)||0),0),
  };
}
function calcGhgTotal(o) {
  // Biggest identified saving across all ghgPhases = canonical reportable value
  const phases = o.ghgPhases||o.ghgSnapshots||[]; // support both formats
  if (phases.length===0) return null;
  const maxId = Math.max(...phases.map(p=>snapKg(p).identified));
  return maxId>0 ? maxId : null;
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
  { id:"s1_refr",  scope:"Scope 1", group:"Direct emission to air",   type:"Other (e.g. refrigerants / GWP gases)", unit:"kg",  cfDefault:"",   cfFixed:false },
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
  type:"", materiality:"Both",
  description:"", envBenefit:"", bizBenefit:"", techBenefit:"",
  envValue:3, bizValue:3, feasibility:3,
  owner:"", status:"Open", _color:"",
  createdAt:"", updatedAt:"",
  // Savings — two separate tracks with independent phases
  qualPhases: [],   // [{id, label, date, note}]
  ghgPhases:  [],   // [{id, label, date, note, lines:[]}]
  // lines shape: {id, custom, scope, type, unit, reduction, baseline, cf, ref, savingType}
  // custom:false = standard GHG_LINES row; custom:true = user-added row
});

// ── GhgPhase factory ──────────────────────────────────────────────────────────
const emptyGhgPhase = (label, fromPhase) => ({
  id: "ghgp_"+Date.now(),
  label: label||"Phase 1",
  date: new Date().toISOString(),
  note: "",
  lines: fromPhase
    ? JSON.parse(JSON.stringify(fromPhase.lines))
    : GHG_LINES.map(l=>({
        id:l.id, custom:false, scope:l.scope, type:l.type, unit:l.unit,
        reduction:"", baseline:"", cf:l.cfDefault, ref:"", savingType:"identified"
      }))
});

// ── Migration: any saved format → current format ──────────────────────────────
const migrateOpp = (base) => {
  // Already migrated
  if ((base.ghgPhases||[]).length > 0 || (base.qualPhases||[]).length > 0)
    return { ghgPhases: base.ghgPhases||[], qualPhases: base.qualPhases||[] };

  // From ghgSnapshots[] format (v2→v3)
  if ((base.ghgSnapshots||[]).length > 0) {
    const ghgPhases = base.ghgSnapshots.map(snap => ({
      id: snap.id||("ghgp_"+Date.now()),
      label: snap.label||"Phase",
      date: snap.date||new Date().toISOString(),
      note: snap.note||"",
      lines: [
        // standard lines: rename qty→reduction, drop custom:false implied
        ...(snap.lines||[]).map(l=>({
          id:l.id, custom:false, scope:l.scope||"", type:l.type||"",
          unit:l.unit||"", reduction:l.qty||l.reduction||"",
          baseline:l.baseline||"", cf:l.cf||"", ref:l.ref||"",
          savingType:l.savingType||"identified"
        })),
        // custom rows: merge in with custom:true
        ...(snap.customRows||[]).map(r=>({
          id:r.uid||("c_"+Date.now()), custom:true,
          scope:r.scope||"", type:r.type||"", unit:r.unit||"kg",
          reduction:r.qty||r.reduction||"", baseline:r.baseline||"",
          cf:r.cf||"", ref:r.ref||"", savingType:r.savingType||"identified"
        }))
      ]
    }));
    return { ghgPhases, qualPhases: base.qualPhases||[] };
  }

  // From raw ghgLines[] format (v1)
  const oldLines = base.ghgLines||[];
  const oldCustom = base.customGhgRows||[];
  const hasData = oldLines.some(l=>parseFloat(l.qty||l.reduction)>0) || oldCustom.length>0;
  const hasNote = !!(base.ghgNote||"").trim();
  if (!hasData && !hasNote) return { ghgPhases:[], qualPhases:[] };
  return {
    ghgPhases: [{
      id:"ghgp_migrated", label:"Initial data",
      date: base.createdAt||new Date().toISOString(),
      note: base.ghgNote||"",
      lines: [
        ...GHG_LINES.map(l=>{
          const s = oldLines.find(x=>x.id===l.id);
          return { id:l.id, custom:false, scope:l.scope, type:l.type, unit:l.unit,
                   reduction:s?s.qty||s.reduction||"":"", baseline:s?s.baseline||"":"",
                   cf:(s&&s.cf!=="")?s.cf:l.cfDefault, ref:s?s.ref||"":"",
                   savingType:s&&s.savingType!=="superseded"?s.savingType:"identified" };
        }),
        ...oldCustom.map(r=>({
          id:r.uid||("c_"+Date.now()), custom:true,
          scope:r.scope||"", type:r.type||"", unit:r.unit||"kg",
          reduction:r.qty||r.reduction||"", baseline:r.baseline||"",
          cf:r.cf||"", ref:r.ref||"",
          savingType:(r.savingType||"").replace("superseded","identified")||"identified"
        }))
      ]
    }],
    qualPhases: []
  };
};

const newProject = () => {
  const ts = Date.now();
  return {
    id: ts.toString(),
    projectId: "PRJ-"+ts.toString().slice(-5),
    name:"", company:"", contract:"", type:"", phase:"",
    createdAt: new Date().toISOString(),
    aspects:[], opportunities:[], changelog:[]
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
    <div style={{ padding:"1.25rem" }}>
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

// ── Shared opp helpers ───────────────────────────────────────────────────────

// Determine which GHG lines are relevant based on type / prefillGhgIds
function relevantLines(type, prefillIds) {
  if (prefillIds && prefillIds.length > 0) {
    return GHG_LINES.filter(l => prefillIds.includes(l.id));
  }
  if ((type||"").startsWith("Scope 1")) return GHG_LINES.filter(l=>l.scope==="Scope 1");
  if ((type||"").startsWith("Scope 2")) return GHG_LINES.filter(l=>l.scope==="Scope 2");
  if ((type||"").startsWith("Scope 3")) return GHG_LINES.filter(l=>l.scope==="Scope 3 Cat 1"||l.scope==="Scope 3 Cat 4");
  return GHG_LINES; // all
}

// ── GHG snapshot table (hoisted to module level to prevent input focus loss) ──
function GhgSnapTable({ snap, si, editable, visibleScopes, mergedLines, scopeGroups,
                        customForScope, SCOPE_COLORS, thS, tdS, fmt, snapKgFn,
                        onSetLine, onSetCustomRow, onAddCustomRow, onDelCustomRow }) {
  const t = snapKgFn(snap);  // {identified, actual}
  return (
    <div style={{overflowX:"auto",borderRadius:7,border:"1px solid "+T.border}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,fontFamily:T.sans}}>
        <thead>
          <tr style={{background:T.surface2}}>
            {visibleScopes.length>1&&<th style={thS}>Scope</th>}
            {["Emission / reduction type","Unit","Baseline qty","Reduction qty","CF","Saving (kg CO₂e)","Type","Reference"].map(h=>(
              <th key={h} style={{...thS,textAlign:["Baseline qty","Reduction qty","CF","Saving (kg CO₂e)"].includes(h)?"right":"left"}}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visibleScopes.flatMap(scope=>{
            const sc2=SCOPE_COLORS[scope]||{bg:T.slateBg,c:T.slate,bd:T.slateBd};
            const slines=scopeGroups[scope]||[];
            const crows=(customForScope||[]).filter(r=>r.scope===scope);
            const totalRows=slines.length+crows.length+1;
            return [
              ...slines.map((l,li)=>{
                const qty=parseFloat(l.reduction||l.qty)||0,cf=parseFloat(l.cf)||0;
                const sav=qty&&cf?qty*cf:null;
                return(
                  <tr key={l.id} style={{borderBottom:"1px solid "+T.rowBd,background:qty>0?sc2.bg+"44":undefined}}>
                    {visibleScopes.length>1&&li===0&&<td rowSpan={totalRows}
                      style={{padding:"5px 7px",verticalAlign:"top",paddingTop:8,borderBottom:"1px solid "+T.rowBd,
                              borderRight:"1px solid "+T.border,width:82}}>
                      <span style={{fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:3,
                        background:sc2.bg,color:sc2.c,border:"1px solid "+sc2.bd,display:"inline-block",whiteSpace:"nowrap"}}>{scope}</span>
                    </td>}
                    <td style={{padding:"5px 7px",fontSize:12,borderBottom:"1px solid "+T.rowBd,color:T.text,fontWeight:500}}>{l.type}</td>
                    <td style={{padding:"5px 7px",fontSize:12,borderBottom:"1px solid "+T.rowBd,textAlign:"right",fontFamily:T.mono,fontSize:10,color:T.faint}}>{l.unit}</td>
                    <td style={{padding:"3px 6px",fontSize:12,borderBottom:"1px solid "+T.rowBd,textAlign:"right"}}>
                      {editable?<input type="number" min={0} value={l.baseline} onChange={e=>onSetLine(si,l.id,"baseline",e.target.value)}
                        placeholder="—" style={{width:70,textAlign:"right",padding:"3px 6px",fontFamily:T.mono,fontSize:11,
                          border:"1px solid "+T.border,borderRadius:4,background:T.surface,color:T.muted}}/>
                        :<span style={{fontFamily:T.mono,fontSize:11,color:T.muted}}>{l.baseline||"—"}</span>}
                    </td>
                    <td style={{padding:"3px 6px",fontSize:12,borderBottom:"1px solid "+T.rowBd,textAlign:"right"}}>
                      {editable?<input type="number" min={0} value={l.reduction||l.qty||""} onChange={e=>onSetLine(si,l.id,"reduction",e.target.value)}
                        placeholder="0" style={{width:80,textAlign:"right",padding:"3px 7px",fontFamily:T.mono,fontSize:12,
                          border:"1px solid "+(qty>0?sc2.bd:T.border),borderRadius:4,
                          background:qty>0?sc2.bg:T.surface,color:qty>0?sc2.c:T.text}}/>
                        :<span style={{fontFamily:T.mono,fontSize:12,fontWeight:qty>0?600:400,color:qty>0?sc2.c:T.faint}}>{l.reduction||l.qty||"—"}</span>}
                    </td>
                    <td style={{padding:"3px 6px",fontSize:12,borderBottom:"1px solid "+T.rowBd,textAlign:"right"}}>
                      {l.cfFixed?<span style={{fontFamily:T.mono,fontSize:11,color:T.muted}}>{l.cfDefault}</span>
                        :editable?<input type="number" min={0} value={l.cf} onChange={e=>onSetLine(si,l.id,"cf",e.target.value)}
                          placeholder="CF" style={{width:52,textAlign:"right",padding:"3px 5px",fontFamily:T.mono,fontSize:11,
                            border:"1px solid "+T.amberBd,borderRadius:4,background:T.amberBg,color:T.amber}}/>
                          :<span style={{fontFamily:T.mono,fontSize:11,color:l.cf?T.muted:T.faint}}>{l.cf||"—"}</span>}
                    </td>
                    <td style={{padding:"5px 7px",fontSize:12,borderBottom:"1px solid "+T.rowBd,textAlign:"right",fontFamily:T.mono,fontWeight:sav?700:400,color:sav?T.teal:T.faint}}>
                      {sav!=null?sav.toLocaleString("nb-NO",{maximumFractionDigits:1}):"—"}
                    </td>
                    <td style={{padding:"2px 5px",fontSize:12,borderBottom:"1px solid "+T.rowBd}}>
                      {editable?<select value={l.savingType} onChange={e=>onSetLine(si,l.id,"savingType",e.target.value)}
                        style={{fontSize:10,padding:"2px 5px",borderRadius:3,cursor:"pointer",width:"100%",fontWeight:500,
                          border:"1px solid "+(l.savingType==="actual"?T.tealBd:T.blueBd),
                          background:l.savingType==="actual"?T.tealBg:T.blueBg,
                          color:l.savingType==="actual"?T.teal:T.blue}}>
                        <option value="identified">Identified</option>
                        <option value="actual">Actual</option>
                      </select>:<span style={{fontSize:10,padding:"2px 6px",borderRadius:3,fontWeight:500,
                        background:l.savingType==="actual"?T.tealBg:T.blueBg,
                        color:l.savingType==="actual"?T.teal:T.blue}}>{l.savingType}</span>}
                    </td>
                    <td style={{padding:"3px 5px",fontSize:12,borderBottom:"1px solid "+T.rowBd}}>
                      {editable?<input value={l.ref} onChange={e=>onSetLine(si,l.id,"ref",e.target.value)}
                        placeholder="Source" style={{width:"100%",minWidth:80,padding:"2px 5px",fontSize:10,
                          border:"1px solid "+T.border,borderRadius:3,background:"transparent",color:T.muted}}/>
                        :<span style={{fontSize:10,color:T.faint}}>{l.ref||"—"}</span>}
                    </td>
                  </tr>
                );
              }),
              ...crows.map(cr=>{
                const cqty=parseFloat(cr.reduction||cr.qty)||0,ccf=parseFloat(cr.cf)||0,csav=cqty&&ccf?cqty*ccf:null;
                const sc2c=SCOPE_COLORS[cr.scope]||{bg:T.slateBg,c:T.slate,bd:T.slateBd};
                return(
                  <tr key={cr.uid} style={{borderBottom:"1px solid "+T.rowBd,background:T.amberBg+"22"}}>
                    {visibleScopes.length>1&&<td style={{padding:"5px 7px",borderBottom:"1px solid "+T.rowBd}}/>}
                    <td style={{padding:"3px 5px",borderBottom:"1px solid "+T.rowBd}}>
                      {editable?<input value={cr.type} onChange={e=>onSetCustomRow(si,cr.id||cr.uid,"type",e.target.value)}
                        placeholder="Custom type" style={{width:"100%",padding:"2px 5px",fontSize:11,
                          border:"1px solid "+T.amberBd,borderRadius:3,background:T.amberBg,color:T.amber}}/>
                        :<span style={{fontSize:11,color:T.amber}}>{cr.type||"—"}</span>}
                    </td>
                    <td style={{padding:"3px 5px",borderBottom:"1px solid "+T.rowBd,textAlign:"right"}}>
                      {editable?<input value={cr.unit} onChange={e=>onSetCustomRow(si,cr.id||cr.uid,"unit",e.target.value)}
                        placeholder="kg" style={{width:40,textAlign:"right",padding:"2px 4px",fontSize:10,
                          border:"1px solid "+T.border,borderRadius:3,background:T.surface,color:T.muted}}/>
                        :<span style={{fontFamily:T.mono,fontSize:10,color:T.faint}}>{cr.unit||"—"}</span>}
                    </td>
                    <td style={{padding:"3px 5px",borderBottom:"1px solid "+T.rowBd,textAlign:"right"}}>
                      {editable?<input type="number" min={0} value={cr.baseline||""} onChange={e=>onSetCustomRow(si,cr.id||cr.uid,"baseline",e.target.value)}
                        placeholder="—" style={{width:70,textAlign:"right",padding:"3px 6px",fontFamily:T.mono,fontSize:11,
                          border:"1px solid "+T.border,borderRadius:4,background:T.surface,color:T.muted}}/>
                        :<span style={{fontFamily:T.mono,fontSize:11,color:T.muted}}>{cr.baseline||"—"}</span>}
                    </td>
                    <td style={{padding:"3px 5px",borderBottom:"1px solid "+T.rowBd,textAlign:"right"}}>
                      {editable?<input type="number" min={0} value={cr.reduction||cr.qty||""} onChange={e=>onSetCustomRow(si,cr.id||cr.uid,"reduction",e.target.value)}
                        placeholder="0" style={{width:80,textAlign:"right",padding:"3px 7px",fontFamily:T.mono,fontSize:12,
                          border:"1px solid "+(cqty>0?sc2c.bd:T.border),borderRadius:4,
                          background:cqty>0?sc2c.bg:T.surface,color:cqty>0?sc2c.c:T.text}}/>
                        :<span style={{fontFamily:T.mono,fontSize:12,color:cqty>0?sc2c.c:T.faint}}>{cr.reduction||cr.qty||"—"}</span>}
                    </td>
                    <td style={{padding:"3px 5px",borderBottom:"1px solid "+T.rowBd,textAlign:"right"}}>
                      {editable?<input type="number" min={0} value={cr.cf} onChange={e=>onSetCustomRow(si,cr.id||cr.uid,"cf",e.target.value)}
                        placeholder="CF" style={{width:52,textAlign:"right",padding:"3px 5px",fontFamily:T.mono,fontSize:11,
                          border:"1px solid "+T.amberBd,borderRadius:4,background:T.amberBg,color:T.amber}}/>
                        :<span style={{fontFamily:T.mono,fontSize:11,color:T.amber}}>{cr.cf||"—"}</span>}
                    </td>
                    <td style={{padding:"5px 7px",borderBottom:"1px solid "+T.rowBd,textAlign:"right",fontFamily:T.mono,fontWeight:csav?700:400,color:csav?T.teal:T.faint}}>
                      {csav!=null?csav.toLocaleString("nb-NO",{maximumFractionDigits:1}):"—"}
                    </td>
                    <td style={{padding:"2px 5px",borderBottom:"1px solid "+T.rowBd}}>
                      {editable?<select value={cr.savingType||"identified"} onChange={e=>onSetCustomRow(si,cr.id||cr.uid,"savingType",e.target.value)}
                        style={{fontSize:10,padding:"2px 5px",borderRadius:3,cursor:"pointer",width:"100%",fontWeight:500,
                          border:"1px solid "+((cr.savingType||"identified")==="actual"?T.tealBd:T.blueBd),
                          background:(cr.savingType||"identified")==="actual"?T.tealBg:T.blueBg,
                          color:(cr.savingType||"identified")==="actual"?T.teal:T.blue}}>
                        <option value="identified">Identified</option>
                        <option value="actual">Actual</option>
                      </select>:<span style={{fontSize:10,color:(cr.savingType||"identified")==="actual"?T.teal:T.blue}}>{cr.savingType||"identified"}</span>}
                    </td>
                    <td style={{padding:"3px 5px",borderBottom:"1px solid "+T.rowBd}}>
                      {editable?<div style={{display:"flex",gap:3,alignItems:"center"}}>
                        <input value={cr.ref||""} onChange={e=>onSetCustomRow(si,cr.uid,"ref",e.target.value)}
                          placeholder="Source" style={{flex:1,minWidth:60,padding:"2px 5px",fontSize:10,
                            border:"1px solid "+T.border,borderRadius:3,background:"transparent",color:T.muted}}/>
                        <button onClick={()=>onDelCustomRow(si,cr.uid)}
                          style={{fontSize:11,color:T.red,background:"transparent",border:"none",cursor:"pointer",padding:"0 2px"}}>✕</button>
                      </div>:<span style={{fontSize:10,color:T.faint}}>{cr.ref||"—"}</span>}
                    </td>
                  </tr>
                );
              }),
              <tr key={"add_"+scope+"_"+si}>
                <td colSpan={9} style={{padding:"3px 7px",borderBottom:"1px solid "+T.rowBd}}>
                  {editable&&<button onClick={()=>onAddCustomRow(si,scope)}  /* adds to lines with custom:true */
                    style={{fontSize:11,color:(SCOPE_COLORS[scope]||{c:T.slate}).c,background:"transparent",
                      border:"none",cursor:"pointer",padding:"2px 4px",fontFamily:T.sans,fontWeight:500}}>
                    + Add custom row
                  </button>}
                </td>
              </tr>
            ];
          })}
        </tbody>
        <tfoot>
          {t.actual>0&&<tr style={{background:T.tealBg,borderTop:"2px solid "+T.tealBd}}>
            <td colSpan={visibleScopes.length>1?7:6} style={{padding:"7px 9px",fontWeight:600,fontSize:12,color:T.teal}}>Actual saving</td>
            <td style={{padding:"7px 9px",textAlign:"right",fontFamily:T.mono,fontSize:13,fontWeight:700,color:T.teal}}>{fmt(t.actual)}</td>
            <td colSpan={2} style={{padding:"7px 9px",fontSize:10,color:T.muted}}>{t.actual>=1000?"= "+t.actual.toLocaleString("nb-NO",{maximumFractionDigits:0})+" kg":""}</td>
          </tr>}
          {t.identified>0&&<tr style={{background:T.blueBg,borderTop:t.actual>0?"none":"2px solid "+T.blueBd}}>
            <td colSpan={visibleScopes.length>1?7:6} style={{padding:"7px 9px",fontWeight:600,fontSize:12,color:T.blue}}>Identified saving</td>
            <td style={{padding:"7px 9px",textAlign:"right",fontFamily:T.mono,fontSize:13,fontWeight:700,color:T.blue}}>{fmt(t.identified)}</td>
            <td colSpan={2} style={{padding:"7px 9px",fontSize:10,color:T.muted}}>{t.identified>=1000?"= "+t.identified.toLocaleString("nb-NO",{maximumFractionDigits:0})+" kg":""}</td>
          </tr>}
        </tfoot>
      </table>
    </div>
  );
}

// ── Qualitative phases section (top-level so useState is valid) ───────────────
function QualPhasesSection({ qualPhases, qualNote, showQuantitative, onSetPhases, onSetNote }) {
  const qp = qualPhases||[];
  const [activeQIdx, setActiveQIdx] = useState(()=>Math.max(0,qp.length-1));
  const safeQIdx = Math.min(activeQIdx, Math.max(0,qp.length-1));
  const isQLatest = (qi) => qi === qp.length-1;

  const addQualPhase = () => {
    const n = qp.length+1;
    const next = [...qp, {id:"qp_"+Date.now(), label:"Phase "+n, date:new Date().toISOString(), note:""}];
    onSetPhases(next);
    setActiveQIdx(n-1);
  };
  // Allow deleting any phase — even Phase 1 (clears back to empty list)
  const delQualPhase = () => {
    const phase = qp[qp.length-1];
    if (!window.confirm("Delete phase \"" + (phase?.label||"this phase") + "\"? This cannot be undone.")) return;
    const next = qp.slice(0,-1);
    onSetPhases(next);
    setActiveQIdx(Math.max(0, next.length-1));
  };
  const setQualPhase = (qi,k,v) => onSetPhases(qp.map((p,i)=>i===qi?{...p,[k]:v}:p));
  const activeQP = qp.length>0 ? (qp[safeQIdx]||null) : null;

  return (
    <div style={{marginBottom:showQuantitative?"1rem":0}}>
      {/* Phase pill row — matches quantitative */}
      <div style={{display:"flex",gap:4,alignItems:"center",marginBottom:"0.75rem",flexWrap:"wrap"}}>
        {qp.map((qph,qi)=>{
          const active=qi===safeQIdx;
          const latest=isQLatest(qi);
          return(
            <div key={qph.id} style={{display:"flex",alignItems:"center",
              borderRadius:20,border:"1px solid "+(active?T.slate:T.border),
              overflow:"hidden",background:active?T.slate:"transparent"}}>
              <button onClick={()=>setActiveQIdx(qi)}
                style={{padding:"4px 10px",fontSize:11,fontWeight:500,cursor:"pointer",
                       fontFamily:T.sans,background:"transparent",border:"none",
                       color:active?"#fff":T.muted}}>
                {qph.label}
                {qph.note&&<span style={{marginLeft:4,fontSize:9,opacity:0.6}}>●</span>}
              </button>
              {latest&&(
                <button onClick={delQualPhase} title="Delete this phase"
                  style={{padding:"4px 7px 4px 3px",fontSize:11,cursor:"pointer",
                         fontFamily:T.sans,background:"transparent",border:"none",
                         color:active?"rgba(255,255,255,0.7)":T.faint,lineHeight:1}}
                  onMouseEnter={e=>e.currentTarget.style.color=active?"#fff":T.red}
                  onMouseLeave={e=>e.currentTarget.style.color=active?"rgba(255,255,255,0.7)":T.faint}>
                  ✕
                </button>
              )}
            </div>
          );
        })}
        <button onClick={addQualPhase}
          style={{padding:"4px 10px",borderRadius:20,fontSize:11,cursor:"pointer",
                 fontFamily:T.sans,background:"transparent",color:T.slate,
                 border:"1px solid "+T.slateBd}}>
          + Add phase
        </button>
      </div>

      {/* Active phase — same layout as quantitative: header bar + note body */}
      {activeQP ? (
        <div style={{borderRadius:7,border:"1px solid "+(isQLatest(safeQIdx)?T.slateBd:T.border),overflow:"hidden"}}>
          {/* Header bar: editable label (latest only) + date */}
          <div style={{display:"flex",alignItems:"center",gap:8,padding:"7px 12px",
            background:isQLatest(safeQIdx)?T.slateBg:T.surface2}}>
            {isQLatest(safeQIdx)
              ?<input value={activeQP.label} onChange={e=>setQualPhase(safeQIdx,"label",e.target.value)}
                  style={{flex:1,padding:"3px 8px",fontSize:13,fontWeight:700,color:T.slate,
                    border:"1px solid "+T.slateBd,borderRadius:5,background:"transparent"}}/>
              :<span style={{fontSize:13,fontWeight:600,color:T.muted,flex:1}}>{activeQP.label}</span>}
            <span style={{fontFamily:T.mono,fontSize:10,color:T.faint}}>
              {new Date(activeQP.date).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}
            </span>
            {!isQLatest(safeQIdx)&&<span style={{fontSize:10,color:T.faint,fontStyle:"italic"}}>read-only</span>}
          </div>
          {/* Note body */}
          <div style={{padding:"10px 12px",background:T.surface}}>
            {isQLatest(safeQIdx)
              ?<textarea value={activeQP.note||""} onChange={e=>setQualPhase(safeQIdx,"note",e.target.value)} rows={3}
                  placeholder="Describe expected savings for this phase — approach, methodology, estimated reduction range"
                  style={{width:"100%",boxSizing:"border-box",resize:"vertical",fontSize:12}}/>
              :<p style={{margin:0,fontSize:12,color:T.text,lineHeight:1.7}}>
                 {activeQP.note||<span style={{color:T.faint,fontStyle:"italic"}}>No note recorded</span>}
               </p>}
          </div>
        </div>
      ) : (
        <p style={{fontSize:11,color:T.faint,margin:0,fontStyle:"italic"}}>
          No phases — click "+ Add phase" to start.
        </p>
      )}
    </div>
  );
}

// ── Shared OppFormBody — used identically from OppForm and ScreeningTab ───────
function OppFormBody({ f, setF, onSave, onCancel, saveLabel, isScreening }) {
  const set = (k,v) => setF(p=>({...p,[k]:v}));
  const [activeSnapIdx, setActiveSnapIdx] = useState(
    () => Math.max(0,(f.ghgPhases||[]).length-1)
  );

  const score = calcOppScore(f);
  const prioLabel = score>=75?"High priority":score>=30?"Medium priority":"Low priority";
  const sc = score>=75?{bg:T.tealBg,c:T.tealDark}:score>=30?{bg:T.tealBg,c:T.teal}:{bg:T.slateBg,c:T.slate};

  // Keep activeSnapIdx in bounds
  const snaps = f.ghgPhases||[];
  const safeIdx = Math.min(activeSnapIdx, snaps.length-1);
  const activeSnap = snaps[safeIdx]||null;
  // Only the latest (last) phase is editable and deletable.
  // Deleting the latest makes the previous one the new latest.
  const isLatest = (si) => si === snaps.length-1;
  const isActive = isLatest; // alias — only latest is editable

  // Snapshot updater targeting a specific index
  const updateSnap = (si, updater) => setF(p=>{
    const s=[...(p.ghgPhases||[])];
    s[si]=updater(s[si]); return {...p,ghgPhases:s};
  });
  const setSnapField = (si,k,v) => updateSnap(si,s=>({...s,[k]:v}));
  const setLine      = (si,id,k,v) => updateSnap(si,s=>({...s,lines:(s.lines||[]).map(l=>l.id===id?{...l,[k]:v}:l)}));
  const addCustomRow = (si,scope) => updateSnap(si,s=>({...s,lines:[...(s.lines||[]),
    {id:"c_"+Date.now(),custom:true,scope,type:"",unit:"kg",reduction:"",baseline:"",cf:"",ref:"",savingType:"identified"}]}));
  const delCustomRow = (si,id) => updateSnap(si,s=>({...s,lines:(s.lines||[]).filter(l=>l.id!==id)}));
  const setCustomRow = (si,id,k,v) => updateSnap(si,s=>({...s,lines:(s.lines||[]).map(l=>l.id===id?{...l,[k]:v}:l)}));

  const addPhaseSnapshot = () => {
    const prev = snaps[snaps.length-1]||null;
    const n = snaps.length+1;
    setF(p=>({...p,ghgPhases:[...p.ghgPhases,emptyGhgPhase("Phase "+n,prev)]}));
    setActiveSnapIdx(n-1); // jump to new latest
  };
  const deleteLatestPhase = () => {
    if (snaps.length === 0) return;
    const phase = snaps[snaps.length-1];
    if (!window.confirm("Delete phase \"" + (phase?.label||"this phase") + "\"? This cannot be undone.")) return;
    setF(p=>({...p,ghgPhases:p.ghgPhases.slice(0,-1)}));
    setActiveSnapIdx(Math.max(0, snaps.length-2));
  };

  // showQuantitative derived from ghgPhases.length > 0
  const hasQuantitative = snaps.length > 0;
  const toggleQuantitative = () => {
    if (hasQuantitative) {
      // collapse = just switch view; data preserved
      setF(p=>({...p,ghgPhases:p.ghgPhases})); // noop — toggle handled by UI
    } else {
      setF(p=>({...p,ghgPhases:[emptyGhgPhase("Phase 1",null)]}));
      setActiveSnapIdx(0);
    }
  };

  const snapTotal = snapKg; // delegate to module-level snapKg
  const fmt = v => v>=1000?(v/1000).toLocaleString("nb-NO",{maximumFractionDigits:2})+" t CO₂e":v.toLocaleString("nb-NO",{maximumFractionDigits:1})+" kg CO₂e";

  const SCOPE_COLORS = {
    "Scope 1":{bg:T.redBg,c:T.red,bd:T.redBd},
    "Scope 2":{bg:T.blueBg,c:T.blue,bd:T.blueBd},
    "Scope 3 Cat 1":{bg:T.tealBg,c:T.teal,bd:T.tealBd},
    "Scope 3 Cat 4":{bg:T.purpleBg,c:T.purple,bd:T.purpleBd},
  };
  const thS={padding:"5px 8px",textAlign:"left",fontSize:9,fontWeight:600,color:T.muted,
             borderBottom:"1px solid "+T.border,letterSpacing:"0.07em",textTransform:"uppercase",whiteSpace:"nowrap"};
  const tdS=(ex)=>({padding:"5px 7px",fontSize:12,borderBottom:"1px solid "+T.rowBd,...(ex||{})});

  // GhgSnapTable is a top-level component to prevent remounting on keystroke
  // All callbacks passed as props to maintain stable identity


  // SnapDiff: only show actual change; identified is never shown as negative
  // If actual increased, show +; if actual is new (was 0), show as first value
  // Biggest identified across all phases is the canonical figure — never show minus
  const SnapDiff = ({prev,curr}) => {
    const pT=snapKg(prev),cT=snapKg(curr);
    // For identified: only show increase (biggest number wins, never decrease)
    const dI=cT.identified-pT.identified;
    const dA=cT.actual-pT.actual;
    const hasChange=dA!==0||(dI>0); // only show positive identified change
    if(!hasChange&&dA===0) return <span style={{fontSize:11,color:T.faint}}>Values carried forward.</span>;
    return(<span style={{fontSize:11}}>
      {dI>0&&<span style={{color:T.teal,marginRight:8}}>Identified +{fmt(dI)}</span>}
      {dA>0&&<span style={{color:T.teal,marginRight:8}}>Actual +{fmt(dA)}</span>}
      {dA<0&&<span style={{color:T.amber}}>Actual {fmt(dA)} vs prev</span>}
    </span>);
  };

  return (
    <div>
      {/* ── Description ── */}
      <Card style={{marginBottom:"1rem"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px 14px"}}>
          <Fld label="Opportunity type">
            {f.prefillGhgIds&&f.prefillGhgIds.length>0 ? (
              <div style={{padding:"6px 10px",borderRadius:5,background:T.surface2,
                           border:"1px solid "+T.border,fontSize:12,color:T.text,fontWeight:500}}>
                {f.type||"—"}
              </div>
            ) : (
              <select value={f.type} onChange={e=>set("type",e.target.value)} style={iw}>
                <option value="">Select type</option>
                <optgroup label="Scope 1 — Direct Emissions">
                  <option value="Scope 1 — CO₂">CO₂ reduction</option>
                  <option value="Scope 1 — NOₓ">NOₓ reduction</option>
                  <option value="Scope 1 — CH₄">CH₄ / methane reduction</option>
                  <option value="Scope 1 — GWP gases">GWP gases / refrigerants reduction</option>
                  <option value="Scope 1 — Other">Other direct emission reduction</option>
                </optgroup>
                <optgroup label="Scope 2 — Indirect Emissions">
                  <option value="Scope 2 — System optimisation">System / component optimisation</option>
                  <option value="Scope 2 — Design optimisation">Layout, design or location optimisation</option>
                  <option value="Scope 2 — Alternative resources">Alternative resources</option>
                </optgroup>
                <optgroup label="Scope 3 — Value Chain">
                  <option value="Scope 3 — Material">Material</option>
                  <option value="Scope 3 — Chemicals">Chemicals</option>
                  <option value="Scope 3 — Lifecycle">Lifecycle</option>
                  <option value="Scope 3 — Re-use">Re-use</option>
                  <option value="Scope 3 — Re-cycle">Re-cycle</option>
                  <option value="Scope 3 — Waste">Waste evaluation</option>
                  <option value="Scope 3 — Transport">Transport</option>
                  <option value="Scope 3 — Remote technology">Remote technology / Automated solutions</option>
                </optgroup>
              </select>
            )}
          </Fld>
          <Fld label="Materiality (CSRD)">
            <select value={f.materiality} onChange={e=>set("materiality",e.target.value)} style={iw}>
              <option>Inside-out (positive impact on environment)</option>
              <option>Outside-in (financial / business benefit)</option>
              <option>Both</option>
            </select>
          </Fld>
          <Fld label="Opportunity description" wide>
            <textarea value={f.description} onChange={e=>set("description",e.target.value)} rows={3}
              style={{...iw,resize:"vertical"}}/>
          </Fld>
        </div>
      </Card>

      {/* ── NOx warning — shown when type is NOx ── */}
      {(f.type||"").includes("NOₓ") && (
        <div style={{marginBottom:"1rem",background:T.amberBg,border:"1px solid "+T.amberBd,borderRadius:8,padding:"12px 16px"}}>
          <p style={{margin:"0 0 8px",fontSize:12,fontWeight:700,color:T.amber,display:"flex",alignItems:"center",gap:8}}>
            <span>⚠</span> NOₓ is a regulated air pollutant — handle separately from GHG accounting
          </p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px 16px"}}>
            <div>
              <p style={{margin:"0 0 3px",fontSize:11,fontWeight:600,color:T.text}}>NOₓ tax (Norway)</p>
              <p style={{margin:0,fontSize:11,color:T.muted,lineHeight:1.55}}>
                NOₓ emissions are subject to the Norwegian NOₓ tax (NOₓ-avgift) under the NOₓ Fund agreement.
                Reductions represent a direct cost saving and should be quantified separately from CO₂e reductions.
              </p>
            </div>
            <div>
              <p style={{margin:"0 0 3px",fontSize:11,fontWeight:600,color:T.text}}>CO₂e conversion</p>
              <p style={{margin:0,fontSize:11,color:T.muted,lineHeight:1.55}}>
                A CO₂e factor (typically 296 kg CO₂e / kg NOₓ via GWP) can be applied for internal GHG accounting,
                but NOₓ reductions must not be aggregated with Scope 1 CO₂e in external or regulatory disclosure
                without an explicit methodology note.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Priority scoring — 3 dimensions ── */}
      <Card style={{marginBottom:"1rem",background:T.tealBg}} accent={T.teal}>
        <SectionLabel>Priority score = env value × business value × technical feasibility (max 125)</SectionLabel>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"12px 14px"}}>
          {[{k:"envValue",l:"Environmental value (1–5)",bk:"envBenefit",bl:"Environmental benefit"},
            {k:"bizValue",l:"Business value (1–5)",bk:"bizBenefit",bl:"Business / strategic benefit"},
            {k:"feasibility",l:"Technical feasibility (1–5)",bk:"techBenefit",bl:"Technical feasibility notes"}
          ].map(({k,l,bk,bl})=>(
            <div key={k}>
              <Fld label={l}>
                <input type="number" min={1} max={5} value={f[k]}
                  onChange={e=>set(k,Math.min(5,Math.max(1,+e.target.value||1)))} style={iw}/>
              </Fld>
              <div style={{marginTop:6}}>
                <p style={{margin:"0 0 3px",fontSize:10,fontWeight:600,color:T.faint,
                           letterSpacing:"0.07em",textTransform:"uppercase"}}>{bl}</p>
                <textarea value={f[bk]||""} onChange={e=>set(bk,e.target.value)} rows={2}
                  style={{...iw,resize:"vertical",fontSize:12}}/>
              </div>
            </div>
          ))}
        </div>
        <div style={{marginTop:12,paddingTop:10,borderTop:"1px solid "+T.tealBd,
                     display:"flex",alignItems:"center",gap:12}}>
          <span style={{fontFamily:T.mono,fontSize:11,color:T.muted}}>Score:</span>
          <span style={{fontFamily:T.mono,fontSize:20,fontWeight:500,padding:"2px 12px",
                        borderRadius:5,background:sc.bg,color:sc.c}}>{score}</span>
          <span style={{fontSize:12,fontWeight:600,color:sc.c}}>{prioLabel}</span>
        </div>
      </Card>

      {/* ── Savings estimate — two independent toggles ── */}
      <Card style={{marginBottom:"1rem"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1rem"}}>
          <SectionLabel style={{margin:0}}>Savings estimate</SectionLabel>
          <div style={{display:"flex",gap:6}}>
            <button onClick={()=>{
                const qp=f.qualPhases||[];
                if(qp.length===0){
                  setF(p=>({...p,qualPhases:[{id:"qp_"+Date.now(),label:"Phase 1",date:new Date().toISOString(),note:""}]}));
                } else {
                  setF(p=>({...p,qualPhases:[]})); // hide = clear phases (confirmed by user)
                }
              }}
              style={{padding:"5px 14px",fontSize:11,fontWeight:500,cursor:"pointer",
                     fontFamily:T.sans,borderRadius:6,
                     background:(f.qualPhases||[]).length>0?T.slate:"transparent",
                     color:(f.qualPhases||[]).length>0?"#fff":T.muted,
                     border:"1px solid "+((f.qualPhases||[]).length>0?T.slate:T.border)}}>
              Qualitative {(f.qualPhases||[]).length>0?"▾":"▸"}
            </button>
            <button onClick={()=>{
                if(hasQuantitative){
                  if(window.confirm("Remove all quantitative phases? Data will be lost."))
                    setF(p=>({...p,ghgPhases:[]}));
                } else {
                  setF(p=>({...p,ghgPhases:[emptyGhgPhase("Phase 1",null)]}));
                  setActiveSnapIdx(0);
                }
              }}
              style={{padding:"5px 14px",fontSize:11,fontWeight:500,cursor:"pointer",
                     fontFamily:T.sans,borderRadius:6,
                     background:hasQuantitative?T.teal:"transparent",
                     color:hasQuantitative?"#fff":T.muted,
                     border:"1px solid "+(hasQuantitative?T.teal:T.border)}}>
              Quantitative {hasQuantitative?"▾":"▸"}
            </button>
          </div>
        </div>

        {/* Qualitative — own phase list, rendered via top-level component (hooks rule) */}
        {(f.qualPhases||[]).length > 0 && (
          <QualPhasesSection
            qualPhases={f.qualPhases||[]}
            qualNote={f.qualNote||""}
            showQuantitative={hasQuantitative}
            onSetPhases={v=>set("qualPhases",v)}
            onSetNote={v=>set("qualNote",v)}
          />
        )}

        {/* Quantitative — phase tabs + table */}
        {hasQuantitative && snaps.length > 0 && (
          <div>
            {/* Phase pill tabs */}
            <div style={{display:"flex",gap:4,alignItems:"center",marginBottom:"0.75rem",flexWrap:"wrap"}}>
              {snaps.map((snap,si)=>{
                const t=snapTotal(snap);
                const hasData=t.identified>0||t.actual>0;
                const active=si===safeIdx;
                const latest=isLatest(si);
                return(
                  <div key={snap.id} style={{display:"flex",alignItems:"center",gap:0,
                    borderRadius:20,border:"1px solid "+(active?T.teal:T.border),
                    overflow:"hidden",background:active?T.teal:"transparent"}}>
                    <button onClick={()=>setActiveSnapIdx(si)}
                      style={{padding:"4px 10px",fontSize:11,fontWeight:500,cursor:"pointer",
                             fontFamily:T.sans,background:"transparent",border:"none",
                             color:active?"#fff":T.muted}}>
                      {snap.label}
                      {hasData&&<span style={{marginLeft:5,fontSize:10,opacity:0.75}}>
                        {t.identified>0?fmt(t.identified):fmt(t.actual)}
                      </span>}
                    </button>
                    {latest&&(
                      <button onClick={deleteLatestPhase}
                        title="Delete this phase"
                        style={{padding:"4px 7px 4px 3px",fontSize:11,cursor:"pointer",
                               fontFamily:T.sans,background:"transparent",border:"none",
                               color:active?"rgba(255,255,255,0.7)":T.faint,lineHeight:1}}
                        onMouseEnter={e=>e.currentTarget.style.color=active?"#fff":T.red}
                        onMouseLeave={e=>e.currentTarget.style.color=active?"rgba(255,255,255,0.7)":T.faint}>
                        ✕
                      </button>
                    )}
                  </div>
                );
              })}
              <button onClick={addPhaseSnapshot}
                style={{padding:"4px 10px",borderRadius:20,fontSize:11,cursor:"pointer",
                       fontFamily:T.sans,background:"transparent",color:T.teal,
                       border:"1px solid "+T.tealBd}}>
                + Add phase
              </button>
            </div>
            {/* Show diff if not first phase */}
            {safeIdx > 0 && activeSnap && (
              <div style={{padding:"5px 10px",borderRadius:5,background:T.slateBg,
                           border:"1px solid "+T.border,marginBottom:"0.5rem",fontSize:11}}>
                <span style={{color:T.faint,marginRight:6}}>vs {snaps[safeIdx-1].label}:</span>
                <SnapDiff prev={snaps[safeIdx-1]} curr={activeSnap}/>
              </div>
            )}
            {/* Table header: snapshot label + date, editable if active */}
            {activeSnap && (
              <div style={{marginBottom:4,display:"flex",alignItems:"center",gap:10}}>
                {isLatest(safeIdx)
                  ? <input value={activeSnap.label} onChange={e=>setSnapField(safeIdx,"label",e.target.value)}
                      style={{padding:"3px 8px",fontSize:13,fontWeight:700,color:T.teal,
                        border:"1px solid "+T.tealBd,borderRadius:5,background:"transparent"}}/>
                  : <span style={{fontSize:13,fontWeight:600,color:T.muted}}>{activeSnap.label}</span>}
                <span style={{fontFamily:T.mono,fontSize:10,color:T.faint}}>
                  {new Date(activeSnap.date).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}
                </span>
                {!isActive(safeIdx)&&<span style={{fontSize:10,color:T.faint,fontStyle:"italic"}}>read-only</span>}
              </div>
            )}
            {activeSnap && (() => {
              const prefillIds=f.prefillGhgIds||[];
              const visibleLines=relevantLines(f.type,prefillIds);
              const visibleScopes=[...new Set(visibleLines.map(l=>l.scope))];
              const stdLines=(activeSnap.lines||[]).filter(l=>!l.custom);
              const mergedLines=visibleLines.map(l=>{
                const s=stdLines.find(x=>x.id===l.id);
                return{...l,
                  reduction:s?s.reduction||s.qty||"":"",
                  baseline:s?s.baseline||"":"",
                  cf:(s&&s.cf!=="")?s.cf:l.cfDefault,
                  ref:s?s.ref||"":"",
                  savingType:s?s.savingType:"identified"};
              });
              const scopeGroups=visibleScopes.reduce((acc,sc)=>{acc[sc]=mergedLines.filter(l=>l.scope===sc);return acc;},{});
              const SCOPE_COLORS={"Scope 1":{bg:T.redBg,c:T.red,bd:T.redBd},"Scope 2":{bg:T.blueBg,c:T.blue,bd:T.blueBd},"Scope 3 Cat 1":{bg:T.tealBg,c:T.teal,bd:T.tealBd},"Scope 3 Cat 4":{bg:T.purpleBg,c:T.purple,bd:T.purpleBd}};
              const thS2={padding:"5px 8px",textAlign:"left",fontSize:9,fontWeight:600,color:T.muted,borderBottom:"1px solid "+T.border,letterSpacing:"0.07em",textTransform:"uppercase",whiteSpace:"nowrap"};
              const tdS2=(ex)=>({padding:"5px 7px",fontSize:12,borderBottom:"1px solid "+T.rowBd,...(ex||{})});
              return <GhgSnapTable
                snap={activeSnap} si={safeIdx} editable={isActive(safeIdx)}
                visibleScopes={visibleScopes} mergedLines={mergedLines}
                scopeGroups={scopeGroups}
                customForScope={(activeSnap.lines||[]).filter(l=>l.custom && visibleScopes.some(sc=>l.scope===sc||!l.scope))}
                SCOPE_COLORS={SCOPE_COLORS} thS={thS2} tdS={tdS2} fmt={fmt}
                snapKgFn={snapKg}
                onSetLine={setLine} onSetCustomRow={setCustomRow}
                onAddCustomRow={addCustomRow} onDelCustomRow={delCustomRow}/>;
            })()}
            <p style={{fontSize:11,color:T.faint,margin:"0.5rem 0 0"}}>
              Phase snapshots preserve all historical data. Identified savings are never deleted when actual values are added.
              Fixed CFs: CO₂=1, NOₓ=296, CH₄=28 · Energy=0.57 kg CO₂e/kWh · Steel=2, material=1.5 kg CO₂e/kg.
            </p>
          </div>
        )}
      </Card>

      {/* ── Actions ── */}
      <div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
        <Btn onClick={onCancel}>Cancel</Btn>
        <Btn variant="primary" onClick={()=>onSave(f)} disabled={!f.description.trim()}>
          {saveLabel||"Save"}
        </Btn>
      </div>
    </div>
  );
}

// ── Opp form ──────────────────────────────────────────────────────────────────
function OppForm({ opp, onSave, onCancel }) {
  const base = { ...emptyOpp(), ...opp };
  const migrated = migrateOpp(base);
  const [f, setF] = useState({
    ...base,
    ghgPhases:   migrated.ghgPhases,
    qualPhases:  migrated.qualPhases,
    // showQualitative / showQuantitative derived from phase arrays — not persisted
  });
  // Transient screening hint — not stored on opp record
  const [prefillGhgIds] = useState(base.prefillGhgIds||[]);
  return (
    <div style={{padding:"1.25rem"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:"1.5rem",
                   paddingBottom:"1rem",borderBottom:"1px solid "+T.border}}>
        <Btn onClick={onCancel} variant="ghost">Back</Btn>
        <h2 style={{margin:0,fontSize:16,fontWeight:600}}>{opp.id?"Edit opportunity":"New opportunity"}</h2>
        {opp.ref&&<span style={{fontFamily:T.mono,fontSize:11,color:T.purple,fontWeight:500}}>{opp.ref}</span>}
      </div>
      <OppFormBody f={f} setF={setF} onSave={onSave} onCancel={onCancel}
        saveLabel={opp.id?"Save changes":"Add opportunity"}/>
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
  const [expanded, setExpanded]       = useState({});
  const [view, setView]               = useState("guide");
  const [riskForm, setRiskForm]       = useState(emptyAspect());
  const [oppForm, setOppForm]         = useState(emptyOpp());
  const [toast, setToast]             = useState("");
  const [screenSearch, setScreenSearch] = useState("");
  const [noxWarn, setNoxWarn]         = useState(false);
  // Session-only skip state — tracks which items were consciously passed over
  const [skipped, setSkipped]         = useState({});
  const toggleSkip = id => setSkipped(p=>({...p,[id]:!p[id]}));
  // Track which items have been added this session (by item id → aspect ref)
  const addedItems = {};
  (project.aspects||[]).forEach(a=>{ if(a._screeningId) addedItems[a._screeningId]=a.ref; });

  const isRisks = mode === "risks";
  const toggleCat = k => setExpanded(p => ({ ...p, [k]:!p[k] }));
  const setRF = (k, v) => setRiskForm(p => ({ ...p, [k]:v }));
  const setOF = (k, v) => setOppForm(p => ({ ...p, [k]:v }));
  const showToast = msg => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  // prefillRisk now inlined in button onClick — kept for legacy compatibility
  const prefillRisk = (code, item, sectionColor) => {
    setRiskForm({ ...emptyAspect(), area:item.area||item.sub||"",
                  aspect:item.aspect||"", _color:sectionColor||"" });
    setView("form");
  };

  // Prefill for risk guide words (unchanged)
  const riskScore = calcScore(riskForm);
  const riskSig   = calcSig(riskForm);
  const saveRisk  = () => {
    if (!riskForm.aspect.trim()) return;
    onAddAspect(riskForm); setRiskForm(emptyAspect()); setView("guide");
    showToast("Aspect saved to register");
  };

  // New prefill for scope-based opp buttons
  const prefillOppScope = (type, ghgIds, description, color, warn) => {
    const newOpp = {
      ...emptyOpp(),
      type, description, _color:color||"",
      ghgPhases: ghgIds&&ghgIds.length>0 ? [emptyGhgPhase("Phase 1", null)] : [],
    };
    newOpp.prefillGhgIds = ghgIds||[];
    // _screeningId persisted so checklist can detect this opp was added from screening
    newOpp._screeningId = ghgIds&&ghgIds.length>0 ? ghgIds[0]
      : OPP_SCOPE2_BUTTONS.find(b=>type.includes(b.label.split(",")[0]))?.id
        || OPP_SCOPE3_BUTTONS.find(b=>type.includes(b.label.replace("\n"," ").split("/")[0].trim()))?.id
        || null;
    setOppForm(newOpp);
    setNoxWarn(!!warn);
    setView("form");
  };

  const saveOpp = () => {
    if (!oppForm.description.trim()) return;
    onAddOpp(oppForm); setOppForm(emptyOpp()); setView("guide"); setNoxWarn(false);
    showToast("Opportunity saved to register");
  };

  const oppScore = calcOppScore(oppForm);
  const prioLabel = oppScore>=75?"High priority":oppScore>=30?"Medium priority":"Low priority";
  const oppSc = oppScore>=75?{bg:T.tealBg,c:T.tealDark}:oppScore>=30?{bg:T.tealBg,c:T.teal}:{bg:T.slateBg,c:T.slate};

  // Risk guide data now uses RISK_CATEGORIES constant — filteredRiskGuide removed

  // Scope button style
  const ScopeBtn = ({ label, sub, color, onClick }) => (
    <button onClick={onClick}
      style={{ textAlign:"left", padding:"9px 12px", borderRadius:6,
               border:"1.5px solid "+(color.border||T.border), background:color.bg,
               cursor:"pointer", fontFamily:T.sans, display:"flex", flexDirection:"column", gap:3,
               transition:"filter 0.1s", width:"100%" }}
      onMouseEnter={e=>e.currentTarget.style.filter="brightness(0.95)"}
      onMouseLeave={e=>e.currentTarget.style.filter="none"}>
      <span style={{ fontSize:12, fontWeight:700, color:color.head, lineHeight:1.3 }}>{label}</span>
      {sub && <span style={{ fontSize:11, color:T.muted, lineHeight:1.4 }}>{sub}</span>}
    </button>
  );

  return (
    <div style={{ height:"calc(100vh - 110px)", minHeight:500, margin:"-1.25rem", display:"flex", flexDirection:"column" }}>
      {/* ── Top bar ── */}
      <div style={{ padding:"0.6rem 1rem 0.5rem", background:T.surface, borderBottom:"1px solid "+T.border,
                    display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
        <div style={{ display:"inline-flex", borderRadius:6, overflow:"hidden", border:"1px solid "+T.border }}>
          <button onClick={() => { setMode("risks"); setView("guide"); setScreenSearch(""); }}
            style={{ padding:"7px 20px", fontSize:12, cursor:"pointer", fontFamily:T.sans,
                     fontWeight:isRisks?600:400, border:"none",
                     background:isRisks?T.redBg:T.surface, color:isRisks?T.red:T.muted,
                     borderRight:"1px solid "+T.border }}>
            Risks &amp; aspects
          </button>
          <button onClick={() => { setMode("opps"); setView("guide"); setScreenSearch(""); }}
            style={{ padding:"7px 20px", fontSize:12, cursor:"pointer", fontFamily:T.sans,
                     fontWeight:!isRisks?600:400, border:"none",
                     background:!isRisks?T.purpleBg:T.surface, color:!isRisks?T.purple:T.muted }}>
            Opportunities
          </button>
        </div>
        {view === "guide" && (
          <input value={screenSearch} onChange={e=>setScreenSearch(e.target.value)}
            placeholder={isRisks?"Search guide words...":"Search opportunity categories..."}
            style={{ width:200, padding:"5px 10px", fontSize:12, border:"1px solid "+T.border,
                     borderRadius:6, background:T.surface, color:T.text, outline:"none" }}/>
        )}
        {toast && (
          <span style={{ fontFamily:T.mono, fontSize:11, color:T.teal, background:T.tealBg,
                         border:"1px solid "+T.tealBd, padding:"4px 10px", borderRadius:4 }}>
            {toast}
          </span>
        )}
        {view === "guide" && (
          <button onClick={() => setView("form")}
            style={{ marginLeft:"auto", padding:"6px 14px", fontSize:12, borderRadius:6, border:"none",
                     background:isRisks?T.red:T.purple, color:"#fff", cursor:"pointer",
                     fontFamily:T.sans, fontWeight:500, whiteSpace:"nowrap" }}>
            + Blank form
          </button>
        )}
        {view === "form" && (
          <button onClick={() => { setView("guide"); setNoxWarn(false); }}
            style={{ marginLeft:"auto", padding:"5px 12px", fontSize:12, borderRadius:6,
                     border:"1px solid "+T.border, background:"transparent", color:T.muted, cursor:"pointer" }}>
            ← Back to guide
          </button>
        )}
      </div>

      {/* ── Content ── */}
      <div style={{ flex:1, overflowY:"auto", padding:"0.9rem 1rem" }}>

        {/* ══ RISKS GUIDE — checklist layout ═══════════════════════════════════ */}
        {view === "guide" && isRisks && (() => {
          const q = screenSearch.trim().toLowerCase();
          const filtered = RISK_CATEGORIES.map(cat=>({
            ...cat,
            items: q ? cat.items.filter(it=>
              it.sub.toLowerCase().includes(q)||
              it.hint.toLowerCase().includes(q)||
              it.aspect.toLowerCase().includes(q)
            ) : cat.items
          })).filter(cat=>cat.items.length>0);

          const totalAll = RISK_CATEGORIES.reduce((s,c)=>s+c.items.length,0);
          const addedAll = RISK_CATEGORIES.reduce((s,c)=>s+c.items.filter(it=>addedItems[it.id]).length,0);
          const skippedAll = RISK_CATEGORIES.reduce((s,c)=>s+c.items.filter(it=>skipped[it.id]).length,0);
          const pct = totalAll>0?Math.round((addedAll+skippedAll)/totalAll*100):0;

          return (
            <div>
              {/* Overall progress */}
              <div style={{ marginBottom:"1rem" }}>
                <div style={{ height:4, background:T.border, borderRadius:2, overflow:"hidden", marginBottom:5 }}>
                  <div style={{ height:4, width:pct+"%", background:T.teal, borderRadius:2, transition:"width 0.3s" }}/>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  <span style={{ fontSize:11, color:T.faint }}>{addedAll+skippedAll} of {totalAll} aspects addressed</span>
                  {skippedAll>0&&<span style={{ fontSize:11, color:T.faint }}>{skippedAll} skipped</span>}
                </div>
              </div>

              {filtered.length===0&&<div style={{ textAlign:"center", padding:"2rem", background:T.slateBg, borderRadius:8, color:T.faint, fontSize:12 }}>No aspects match your search.</div>}

              {filtered.map(cat=>{
                const col=COLOR_MAP[cat.color]||COLOR_MAP.gray;
                const key="risk_cat_"+cat.cat;
                const open=q?true:expanded[key]!==false;
                const addedCt=cat.items.filter(it=>addedItems[it.id]).length;
                const skippedCt=cat.items.filter(it=>skipped[it.id]).length;
                const addressed=addedCt+skippedCt;
                return(
                  <div key={cat.cat} style={{ marginBottom:6 }}>
                    {/* Category header */}
                    <div onClick={()=>toggleCat(key)}
                      style={{ display:"flex", alignItems:"center", gap:10,
                               padding:"8px 14px", background:col.bg,
                               border:"1px solid "+col.border,
                               borderLeft:"3px solid "+col.head,
                               borderRadius:6, cursor:"pointer", userSelect:"none",
                               marginBottom:open?2:0 }}>
                      <span style={{ fontSize:13, fontWeight:600, color:col.head, flex:1 }}>{cat.cat}</span>
                      <span style={{ fontSize:11, padding:"2px 8px", borderRadius:10,
                                     background:addressed===cat.items.length?T.greenBg:addressed>0?T.tealBg:T.slateBg,
                                     color:addressed===cat.items.length?T.green:addressed>0?T.teal:T.faint,
                                     border:"1px solid "+(addressed===cat.items.length?T.greenBd:addressed>0?T.tealBd:T.border) }}>
                        {addressed}/{cat.items.length}
                      </span>
                      <span style={{ fontSize:11, color:T.faint }}>{open?"▾":"▸"}</span>
                    </div>

                    {/* Item list */}
                    {open&&(
                      <div style={{ borderLeft:"3px solid "+col.border, marginLeft:6, paddingLeft:4 }}>
                        {cat.items.map((item,i)=>{
                          const isAdded=!!addedItems[item.id];
                          const isSkipped=!!skipped[item.id];
                          return(
                            <div key={i} style={{ display:"flex", alignItems:"center", gap:8,
                                                   padding:"6px 10px", borderRadius:5,
                                                   background:isAdded||isSkipped?"transparent":undefined,
                                                   opacity:isAdded?0.6:1,
                                                   borderBottom:"1px solid "+T.rowBd }}>
                              {/* Status dot */}
                              <div style={{ width:12, height:12, borderRadius:"50%", flexShrink:0,
                                             background:isAdded?T.green:isSkipped?T.border:T.surface,
                                             border:"1.5px solid "+(isAdded?T.greenBd:isSkipped?T.muted:T.muted) }}/>
                              {/* Text */}
                              <div style={{ flex:1, minWidth:0 }}>
                                <span style={{ fontSize:12, fontWeight:500, color:T.text,
                                               textDecoration:isSkipped?"line-through":undefined,
                                               marginRight:8 }}>{item.sub}</span>
                                {!isAdded&&!isSkipped&&<span style={{ fontSize:11, color:T.faint }}>{item.hint}</span>}
                              </div>
                              {/* Reference badge or actions */}
                              {isAdded&&addedItems[item.id]&&(
                                <span style={{ fontFamily:T.mono, fontSize:10, padding:"1px 6px",
                                               borderRadius:3, background:T.tealBg, color:T.teal,
                                               border:"1px solid "+T.tealBd, flexShrink:0 }}>
                                  {addedItems[item.id]}
                                </span>
                              )}
                              {!isAdded&&(
                                <>
                                  <button onClick={()=>toggleSkip(item.id)}
                                    style={{ fontSize:11, padding:"2px 8px", borderRadius:12,
                                             border:"1px solid "+T.border, background:"transparent",
                                             color:isSkipped?T.muted:T.faint, cursor:"pointer",
                                             flexShrink:0, fontFamily:T.sans }}>
                                    {isSkipped?"undo":"skip"}
                                  </button>
                                  {!isSkipped&&<button
                                    onClick={()=>{
                                      setRiskForm({...emptyAspect(), aspect:item.aspect, area:item.sub,
                                                   _color:cat.color, _screeningId:item.id});
                                      setView("form");
                                    }}
                                    style={{ fontSize:11, padding:"3px 10px", borderRadius:12,
                                             border:"1px solid "+col.head, background:col.bg,
                                             color:col.head, cursor:"pointer", flexShrink:0,
                                             fontFamily:T.sans, fontWeight:500, whiteSpace:"nowrap" }}>
                                    + Add
                                  </button>}
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })()}

                {/* ══ OPPORTUNITIES GUIDE — Scope-based with search ══════════════════════ */}
        {view === "guide" && !isRisks && (() => {
          const q = screenSearch.trim().toLowerCase();
          const matchBtn = b => !q ||
            (b.label||"").toLowerCase().includes(q) ||
            (b.sub||"").toLowerCase().includes(q) ||
            (b.desc||"").toLowerCase().includes(q);

          const ALL_OPP_BTNS = [
            ...OPP_SCOPE1_BUTTONS.map(b=>({...b,scopeKey:"opp_scope1",scopeColor:"red"})),
            ...OPP_SCOPE2_BUTTONS.map(b=>({...b,scopeKey:"opp_scope2",scopeColor:"blue"})),
            ...OPP_SCOPE3_BUTTONS.map(b=>({...b,scopeKey:"opp_scope3",scopeColor:"teal"})),
          ];
          const totalOpp=ALL_OPP_BTNS.length;
          const addedOpp=ALL_OPP_BTNS.filter(b=>(project.opportunities||project.opps||[]).some(o=>o._screeningId===b.id)).length;
          const skippedOpp=ALL_OPP_BTNS.filter(b=>skipped["opp_"+b.id]).length;
          const pctOpp=totalOpp>0?Math.round((addedOpp+skippedOpp)/totalOpp*100):0;

          const renderScopeChecklist = (skey, col, title, scopeSub, btns, mkOnClick) => {
            const filtered2=btns.filter(matchBtn);
            if(q&&filtered2.length===0) return null;
            const open=(q&&filtered2.length>0)?true:expanded[skey]!==false;
            const addedCt=filtered2.filter(b=>(project.opportunities||project.opps||[]).some(o=>o._screeningId===b.id)).length;
            const skippedCt=filtered2.filter(b=>skipped["opp_"+b.id]).length;
            const addr=addedCt+skippedCt;
            return(
              <div key={skey} style={{marginBottom:6}}>
                <div onClick={()=>toggleCat(skey)}
                  style={{display:"flex",alignItems:"center",gap:10,
                    padding:"8px 14px",background:col.bg,
                    border:"1px solid "+col.border,
                    borderLeft:"3px solid "+col.head,
                    borderRadius:6,cursor:"pointer",userSelect:"none",
                    marginBottom:open?2:0}}>
                  <div style={{flex:1,minWidth:0}}>
                    <span style={{fontSize:13,fontWeight:600,color:col.head}}>{title}</span>
                    <span style={{fontSize:11,color:T.faint,marginLeft:10}}>{scopeSub}</span>
                  </div>
                  <span style={{fontSize:11,padding:"2px 8px",borderRadius:10,flexShrink:0,
                    background:addr===filtered2.length&&filtered2.length>0?T.greenBg:addr>0?T.tealBg:T.slateBg,
                    color:addr===filtered2.length&&filtered2.length>0?T.green:addr>0?T.teal:T.faint,
                    border:"1px solid "+(addr===filtered2.length&&filtered2.length>0?T.greenBd:addr>0?T.tealBd:T.border)}}>
                    {addr}/{filtered2.length}
                  </span>
                  <span style={{fontSize:11,color:T.faint}}>{open?"▾":"▸"}</span>
                </div>
                {open&&(
                  <div style={{borderLeft:"3px solid "+col.border,marginLeft:6,paddingLeft:4}}>
                    {filtered2.map((btn,i)=>{
                      const isAdded=(project.opportunities||project.opps||[]).some(o=>o._screeningId===btn.id);
                      const isSkipped=!!skipped["opp_"+btn.id];
                      const addedOpp2=(project.opportunities||project.opps||[]).find(o=>o._screeningId===btn.id);
                      return(
                        <div key={btn.id} style={{display:"flex",alignItems:"center",gap:8,
                          padding:"6px 10px",borderRadius:5,
                          opacity:isAdded?0.6:1,
                          borderBottom:"1px solid "+T.rowBd}}>
                          <div style={{width:12,height:12,borderRadius:"50%",flexShrink:0,
                            background:isAdded?T.green:isSkipped?T.border:T.surface,
                            border:"1.5px solid "+(isAdded?T.greenBd:isSkipped?T.muted:T.muted)}}/>
                          <div style={{flex:1,minWidth:0}}>
                            <span style={{fontSize:12,fontWeight:500,color:T.text,
                              textDecoration:isSkipped?"line-through":undefined,marginRight:8}}>
                              {btn.label.replace("\n"," ")}
                            </span>
                            {!isAdded&&!isSkipped&&<span style={{fontSize:11,color:T.faint}}>{btn.sub}</span>}
                          </div>
                          {isAdded&&addedOpp2&&(
                            <span style={{fontFamily:T.mono,fontSize:10,padding:"1px 6px",
                              borderRadius:3,background:T.purpleBg,color:T.purple,
                              border:"1px solid "+T.purpleBd,flexShrink:0}}>
                              {addedOpp2.ref}
                            </span>
                          )}
                          {!isAdded&&(
                            <>
                              <button onClick={()=>setSkipped(p=>({...p,["opp_"+btn.id]:!p["opp_"+btn.id]}))}
                                style={{fontSize:11,padding:"2px 8px",borderRadius:12,
                                  border:"1px solid "+T.border,background:"transparent",
                                  color:isSkipped?T.muted:T.faint,cursor:"pointer",
                                  flexShrink:0,fontFamily:T.sans}}>
                                {isSkipped?"undo":"skip"}
                              </button>
                              {!isSkipped&&<button onClick={mkOnClick(btn)}
                                style={{fontSize:11,padding:"3px 10px",borderRadius:12,
                                  border:"1px solid "+col.head,background:col.bg,
                                  color:col.head,cursor:"pointer",flexShrink:0,
                                  fontFamily:T.sans,fontWeight:500,whiteSpace:"nowrap"}}>
                                + Add
                              </button>}
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          };

          if(q&&!OPP_SCOPE1_BUTTONS.some(matchBtn)&&!OPP_SCOPE2_BUTTONS.some(matchBtn)&&!OPP_SCOPE3_BUTTONS.some(matchBtn))
            return <div style={{textAlign:"center",padding:"2rem",background:T.slateBg,borderRadius:8,color:T.faint,fontSize:12}}>No opportunities match your search.</div>;

          return(
            <div>
              {/* Overall progress */}
              <div style={{marginBottom:"1rem"}}>
                <div style={{height:4,background:T.border,borderRadius:2,overflow:"hidden",marginBottom:5}}>
                  <div style={{height:4,width:pctOpp+"%",background:T.purple,borderRadius:2,transition:"width 0.3s"}}/>
                </div>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <span style={{fontSize:11,color:T.faint}}>{addedOpp+skippedOpp} of {totalOpp} opportunities addressed</span>
                  {skippedOpp>0&&<span style={{fontSize:11,color:T.faint}}>{skippedOpp} skipped</span>}
                </div>
              </div>
              {renderScopeChecklist("opp_scope1",COLOR_MAP.red,"Scope 1 — Direct Emissions","Emissions directly from project operations",OPP_SCOPE1_BUTTONS,
                btn=>()=>prefillOppScope("Scope 1 — "+btn.label,btn.ghgId?[btn.ghgId]:[],"Reduction of "+btn.label+" direct emissions","red",btn.noxWarn))}
              {renderScopeChecklist("opp_scope2",COLOR_MAP.blue,"Scope 2 — Indirect Emissions","Energy consumption and purchased utilities",OPP_SCOPE2_BUTTONS,
                btn=>()=>prefillOppScope("Scope 2 — "+btn.label,[],btn.desc,"blue",false))}
              {renderScopeChecklist("opp_scope3",COLOR_MAP.teal,"Scope 3 — Value Chain Emissions","Upstream and downstream indirect emissions",OPP_SCOPE3_BUTTONS,
                btn=>()=>prefillOppScope("Scope 3 — "+btn.label.replace("\n"," "),[],btn.desc,"teal",false))}
            </div>
          );
        })()}

        {/* ══ RISK FORM ════════════════════════════════════════════════════════════ */}
        {view === "form" && isRisks && (
          <div>
            <h3 style={{ margin:"0 0 1rem", fontSize:14, fontWeight:600, color:T.red }}>
              Risk screening
            </h3>
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
                  {riskForm.legalThreshold==="Y"&&<span style={{ fontFamily:T.mono, fontSize:10, color:T.amber }}>Auto-flagged: legal threshold</span>}
                  {riskForm.stakeholderConcern==="Y"&&<span style={{ fontFamily:T.mono, fontSize:10, color:T.amber }}>Auto-flagged: stakeholder concern</span>}
                </div>
              )}
            </Card>
            <Card style={{ marginBottom:"1rem" }}>
              <SectionLabel>Controls &amp; management</SectionLabel>
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

        {/* ══ OPPORTUNITY FORM ═════════════════════════════════════════════════════ */}
        {view === "form" && !isRisks && (
          <div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1rem" }}>
              <h3 style={{ margin:0, fontSize:14, fontWeight:600, color:T.purple }}>Opportunity screening</h3>
  
            </div>
            <OppFormBody f={oppForm} setF={setOppForm} onSave={saveOpp}
              onCancel={()=>{setView("guide");setNoxWarn(false);}}
              saveLabel="Save to opportunities register"/>
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
  const [clFrom, setClFrom] = useState(() => {
    const d=new Date(); d.setDate(d.getDate()-d.getDay()); d.setHours(0,0,0,0);
    return d.toISOString().slice(0,10);
  });
  const [clTo, setClTo] = useState(() => {
    const d=new Date(); d.setDate(d.getDate()+(6-d.getDay())); d.setHours(23,59,59,999);
    return d.toISOString().slice(0,10);
  });

  const aspects = project.aspects || [];
  const opps    = project.opportunities || project.opps || [];
  const changelog = project.changelog || [];
  const nextRef = (arr, pfx) => pfx+"-"+String(arr.length+1).padStart(3,"0");

  const logChange = (action, detail, fields) => {
    const entry = { id:Date.now().toString(), ts:new Date().toISOString(), action, detail, fields:fields||[] };
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
    const aspFields = isEdit ? (() => {
      const prev = aspects.find(x=>x.id===a.id)||{};
      const f = [];
      const d = (k,pv,nv,fmt) => { if(pv!==nv) f.push({k,from:(fmt?fmt(pv):pv)||"—",to:(fmt?fmt(nv):nv)||"—"}); };
      d("Aspect",    prev.aspect,    withTs.aspect,    v=>v&&v.slice(0,60));
      d("Phase",     prev.phase,     withTs.phase);
      d("Area",      prev.area,      withTs.area,      v=>v&&v.slice(0,40));
      d("Activity",  prev.activity,  withTs.activity,  v=>v&&v.slice(0,40));
      d("Impact",    prev.impact,    withTs.impact,    v=>v&&v.slice(0,60));
      d("Condition", prev.condition, withTs.condition);
      if(prev.severity!==withTs.severity||prev.probability!==withTs.probability)
        f.push({k:"Score",from:`C${prev.severity||"?"}×P${prev.probability||"?"}`,to:`C${withTs.severity}×P${withTs.probability}`});
      d("Status",          prev.status,         withTs.status);
      d("Legal threshold", prev.legalThreshold, withTs.legalThreshold);
      d("Control",  prev.control,  withTs.control,  v=>v&&v.slice(0,50));
      d("Owner",    prev.owner,    withTs.owner);
      return f;
    })() : [
      {k:"Aspect",    v:(withTs.aspect||"").slice(0,80)},
      {k:"Phase",     v:withTs.phase},
      {k:"Area",      v:withTs.area},
      {k:"Condition", v:withTs.condition},
      {k:"Score",     v:`C${withTs.severity}×P${withTs.probability}`},
    ];
    onChange({ ...project, aspects:updated,
               changelog:logChange(isEdit?"Edited aspect":"Added aspect",
                 `${ref} — ${(withTs.aspect||"").slice(0,60)}`, aspFields) });
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
    const oppFields = isEdit ? (() => {
      const prev = opps.find(x=>x.id===o.id)||{};
      const f = [];
      const d = (k,pv,nv,fmt) => { if(pv!==nv) f.push({k,from:(fmt?fmt(pv):pv)||"—",to:(fmt?fmt(nv):nv)||"—"}); };
      d("Type",        prev.type,        withTs.type,        v=>v&&v.slice(0,50));
      d("Description", prev.description, withTs.description, v=>v&&v.slice(0,60));
      d("Materiality", prev.materiality, withTs.materiality);
      if(prev.envValue!==withTs.envValue||prev.bizValue!==withTs.bizValue||prev.feasibility!==withTs.feasibility)
        f.push({k:"Score",from:`${calcOppScore(prev)}`,to:`${calcOppScore(withTs)}`});
      d("Status", prev.status, withTs.status);
      d("Owner",  prev.owner,  withTs.owner);
      const pGhg=(prev.ghgPhases||[]).length, nGhg=(withTs.ghgPhases||[]).length;
      if(pGhg!==nGhg) f.push({k:"GHG phases",from:String(pGhg),to:String(nGhg)});
      const pQual=(prev.qualPhases||[]).length, nQual=(withTs.qualPhases||[]).length;
      if(pQual!==nQual) f.push({k:"Qual phases",from:String(pQual),to:String(nQual)});
      // GHG saving change
      const pSav=calcGhgTotal(prev), nSav=calcGhgTotal(withTs);
      if(pSav!==nSav) f.push({k:"GHG saving",
        from:pSav?(pSav>=1000?(pSav/1000).toFixed(1)+"t":pSav.toFixed(0)+"kg")+" CO₂e":"—",
        to:  nSav?(nSav>=1000?(nSav/1000).toFixed(1)+"t":nSav.toFixed(0)+"kg")+" CO₂e":"—"});
      return f;
    })() : [
      {k:"Type",        v:(withTs.type||"").slice(0,60)},
      {k:"Description", v:(withTs.description||"").slice(0,80)},
      {k:"Score",       v:`Env${withTs.envValue}×Biz${withTs.bizValue}×Feas${withTs.feasibility}=${calcOppScore(withTs)}`},
    ];
    onChange({ ...project, opportunities:updated,
               changelog:logChange(isEdit?"Edited opportunity":"Added opportunity",
                 `${ref} — ${(withTs.type||withTs.description||"").slice(0,60)}`, oppFields) });
    setEditOpp(null);
  };
  const deleteAspect = (a) => {
    onChange({ ...project, aspects:aspects.filter(x=>x.id!==a.id),
               changelog:logChange("Deleted aspect", `${a.ref} — ${(a.aspect||"").slice(0,60)}`,[{k:"Phase",v:a.phase},{k:"Area",v:a.area},{k:"Significance",v:calcSig(a)||"—"}]) });
  };
  const deleteOpp = (o) => {
    onChange({ ...project, opportunities:opps.filter(x=>x.id!==o.id),
               changelog:logChange("Deleted opportunity", `${o.ref} — ${(o.type||o.description||"").slice(0,60)}`,[{k:"Score",v:String(calcOppScore(o))}]) });
  };

  const bulkDeleteAspects = () => {
    const kept = aspects.filter(a=>!selectedAsp.has(a.id));
    const log  = logChange("Bulk deleted aspects", selectedAsp.size+" aspect(s) removed",[{k:"Refs",v:aspects.filter(a=>selectedAsp.has(a.id)).map(a=>a.ref).join(", ")}]);
    onChange({ ...project, aspects:kept, changelog:[...(project.changelog||[]), log] });
    setSelectedAsp(new Set());
  };
  const bulkSetAspStatus = (status) => {
    const updated = aspects.map(a => selectedAsp.has(a.id) ? { ...a, status } : a);
    const log  = logChange("Bulk updated status", `${selectedAsp.size} aspect(s) → ${status}`,[{k:"Refs",v:aspects.filter(a=>selectedAsp.has(a.id)).map(a=>a.ref).join(", ")}]);
    onChange({ ...project, aspects:updated, changelog:[...(project.changelog||[]), log] });
    setSelectedAsp(new Set());
  };
  const bulkDeleteOpps = () => {
    const kept = opps.filter(o=>!selectedOpp.has(o.id));
    const log  = logChange("Bulk deleted opportunities", selectedOpp.size+" opportunity(s) removed",[{k:"Refs",v:opps.filter(o=>selectedOpp.has(o.id)).map(o=>o.ref).join(", ")}]);
    onChange({ ...project, opps:kept, changelog:[...(project.changelog||[]), log] });
    setSelectedOpp(new Set());
  };
  const bulkSetOppStatus = (status) => {
    const updated = opps.map(o => selectedOpp.has(o.id) ? { ...o, status } : o);
    const log  = logChange("Bulk updated opp status", `${selectedOpp.size} opportunity(s) → ${status}`,[{k:"Refs",v:opps.filter(o=>selectedOpp.has(o.id)).map(o=>o.ref).join(", ")}]);
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
  const totalGhgSaving = opps.reduce((s,o)=>{ const g=calcGhgTotal(o); return s+(g||0); }, 0);
  const fmtGhg = kg => kg>=1000?(kg/1000).toLocaleString("nb-NO",{maximumFractionDigits:1})+" t CO₂e":kg>0?kg.toLocaleString("nb-NO",{maximumFractionDigits:0})+" kg CO₂e":"—";
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
      else if(oppSort.col==="ghgSaving"){va=calcGhgTotal(a)||0;vb=calcGhgTotal(b)||0;}
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
      <OppForm opp={editOpp} onSave={saveOpp} onCancel={()=>setEditOpp(null)}/>
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
          <OSTH col="score" label="Score"/>
          <th style={{ padding:"8px 12px", textAlign:"left", fontFamily:T.mono, fontWeight:500, fontSize:9, color:T.muted, borderBottom:"1px solid "+T.border, whiteSpace:"nowrap", letterSpacing:"0.07em", textTransform:"uppercase" }}>Priority</th>
          <OSTH col="ghgSaving" label="GHG saving"/>
          <th style={{ padding:"8px 12px", textAlign:"left", fontFamily:T.mono, fontWeight:500, fontSize:9, color:T.muted, borderBottom:"1px solid "+T.border, whiteSpace:"nowrap", letterSpacing:"0.07em", textTransform:"uppercase" }}>Materiality</th>
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

                <td style={{ padding:"9px 12px", textAlign:"center" }}><span style={{ fontFamily:T.mono, fontWeight:500, fontSize:13, color:T.text }}>{score>0?score:"—"}</span></td>
                <td style={{ padding:"9px 12px" }}>{score>0?<span style={{ fontFamily:T.mono, fontSize:9, padding:"2px 7px", borderRadius:3, background:sc.bg, color:sc.c, border:"1px solid "+sc.bd }}>{score>=75?"High":score>=30?"Medium":"Low"}</span>:<span style={{ color:T.faint }}>—</span>}</td>
                <td style={{ padding:"9px 12px" }}>{(() => { const g=calcGhgTotal(o); return g ? <span style={{ fontFamily:T.mono, fontSize:10, fontWeight:600, color:T.teal }}>{g>=1000?(g/1000).toLocaleString("nb-NO",{maximumFractionDigits:2})+" t":g.toLocaleString("nb-NO",{maximumFractionDigits:0})+" kg"} CO₂e</span> : <span style={{ color:T.faint }}>—</span>; })()}</td>
                <td style={{ padding:"9px 12px" }}>{o.materiality?<span style={{ fontFamily:T.mono, fontSize:9, padding:"2px 6px", borderRadius:3, background:matC.bg, color:matC.c }}>{o.materiality.split(" (")[0]}</span>:<span style={{ color:T.faint }}>—</span>}</td>

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
            <StatCard label="All aspects"   value={aspects.length}  filterId="all"   color={T.text}   border={T.border}   bg={T.surface}/>
            <StatCard label="Significant"   value={sigCount}        filterId="sig"   color={T.red}    border={T.redBd}    bg={T.redBg}/>
            <StatCard label="Watch"         value={watchCount}      filterId="watch" color={T.amber}  border={T.amberBd}  bg={T.amberBg}/>
            <StatCard label="Opportunities" value={opps.length}     filterId="opps"  color={T.purple} border={T.purpleBd} bg={T.purpleBg}/>
            <StatCard label="High priority" value={highOpps}        filterId="opps"  color={T.teal}   border={T.tealBd}   bg={T.tealBg}/>
          </div>

          {/* GHG saving strip */}
          {opps.length > 0 && totalGhgSaving > 0 && (
            <div style={{ display:"flex", alignItems:"center", gap:16, padding:"10px 16px", marginBottom:"1rem",
                           background:T.tealBg, border:"1px solid "+T.tealBd, borderRadius:7 }}>
              <span style={{ fontSize:11, color:T.teal, fontWeight:500 }}>Identified GHG savings (all opportunities)</span>
              <span style={{ fontFamily:T.mono, fontSize:16, fontWeight:500, color:T.tealDark }}>{fmtGhg(totalGhgSaving)}</span>
              <span style={{ fontSize:11, color:T.teal, marginLeft:"auto" }}>{opps.filter(o=>calcGhgTotal(o)).length} of {opps.length} opp{opps.length!==1?"s":""} quantified</span>
            </div>
          )}

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
                                  const oC  = {bg:T.tealBg,bd:T.tealBd};
                                  return (
                                    <div key={i}
                                      title={(o.ref||"")+" — "+(o.description||"").slice(0,55)+"\nEnv benefit: "+o.envValue+" · Feasibility: "+o.feasibility+" · Business value: "+o.bizValue}
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
                    { title:"Dot size — business value", items:[
                        { bg:T.tealBg, bd:"2px solid "+T.tealBd, sw:10, sh:10, label:"1 — Low"  },
                        { bg:T.tealBg, bd:"2px solid "+T.tealBd, sw:14, sh:14, label:"3 — Medium" },
                        { bg:T.tealBg, bd:"2px solid "+T.tealBd, sw:18, sh:18, label:"5 — High" },
                    ]},
                  ]}/>
                </>
            }
          </div>
        );
      })()}
      {tab === "changes" && (()=>{
        const now = new Date();
        const weekStart = new Date(now); weekStart.setDate(now.getDate()-now.getDay()); weekStart.setHours(0,0,0,0);
        const weekEnd   = new Date(weekStart); weekEnd.setDate(weekStart.getDate()+6);
        const fromMs = new Date(clFrom).getTime();
        const toMs   = new Date(clTo+"T23:59:59").getTime();
        const filtered = [...changelog].reverse().filter(e=>{
          const t = new Date(e.ts).getTime();
          return t>=fromMs && t<=toMs;
        });
        return(
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:"1rem", flexWrap:"wrap" }}>
            <div>
              <h3 style={{ margin:"0 0 2px", fontSize:14, fontWeight:600, fontFamily:T.sans }}>Change log</h3>
              <p style={{ margin:0, fontSize:12, color:T.muted }}>{filtered.length} change{filtered.length!==1?"s":""} in range · {changelog.length} total</p>
            </div>
            <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
              <span style={{ fontSize:11, color:T.muted }}>From</span>
              <input type="date" value={clFrom} onChange={e=>setClFrom(e.target.value)}
                style={{ padding:"4px 8px", fontSize:12, borderRadius:5, border:"1px solid "+T.border, background:T.surface, color:T.text, fontFamily:T.sans }}/>
              <span style={{ fontSize:11, color:T.muted }}>to</span>
              <input type="date" value={clTo} onChange={e=>setClTo(e.target.value)}
                style={{ padding:"4px 8px", fontSize:12, borderRadius:5, border:"1px solid "+T.border, background:T.surface, color:T.text, fontFamily:T.sans }}/>
              <button onClick={()=>{setClFrom(weekStart.toISOString().slice(0,10));setClTo(weekEnd.toISOString().slice(0,10)+"".slice(0,10));const wd=new Date(now);wd.setDate(now.getDate()+(6-now.getDay()));setClTo(wd.toISOString().slice(0,10));}}
                style={{ fontSize:11, padding:"4px 10px", borderRadius:5, border:"1px solid "+T.tealBd, background:T.tealBg, color:T.teal, cursor:"pointer", fontFamily:T.sans }}>
                This week
              </button>
              <button onClick={()=>{const m=new Date(now); m.setDate(1); setClFrom(m.toISOString().slice(0,10)); const me=new Date(now.getFullYear(),now.getMonth()+1,0); setClTo(me.toISOString().slice(0,10));}}
                style={{ fontSize:11, padding:"4px 10px", borderRadius:5, border:"1px solid "+T.border, background:"transparent", color:T.muted, cursor:"pointer", fontFamily:T.sans }}>
                This month
              </button>
              <button onClick={()=>{const y=now.getFullYear(); setClFrom(y+"-01-01"); setClTo(y+"-12-31");}}
                style={{ fontSize:11, padding:"4px 10px", borderRadius:5, border:"1px solid "+T.border, background:"transparent", color:T.muted, cursor:"pointer", fontFamily:T.sans }}>
                This year
              </button>
            </div>
          </div>
          {filtered.length === 0 ? (
            <div style={{ textAlign:"center", padding:"3rem", background:T.surface, borderRadius:8, border:"1px solid "+T.border, color:T.faint, fontSize:12 }}>
              No changes in this date range.{changelog.length>0?" Adjust the date range to see older entries.":""}
            </div>
          ) : (
            <div style={{ background:T.surface, borderRadius:8, border:"1px solid "+T.border, overflow:"hidden" }}>
              {filtered.map((entry, i) => {
                const isAdd    = entry.action.startsWith("Added");
                const isEdit   = entry.action.startsWith("Edited");
                const isDel    = entry.action.startsWith("Deleted");
                const dot      = isAdd ? T.teal : isEdit ? T.amber : T.red;
                const ts       = new Date(entry.ts);
                const dateStr  = ts.toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" });
                const timeStr  = ts.toLocaleTimeString("en-GB", { hour:"2-digit", minute:"2-digit" });
                return (
                  <div key={entry.id} style={{ display:"flex", gap:12, padding:"10px 16px",
                                               borderBottom: i < filtered.length-1 ? "1px solid "+T.rowBd : "none",
                                               alignItems:"flex-start" }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:dot, marginTop:6, flexShrink:0 }}/>
                    <div style={{ flex:1, minWidth:0 }}>
                      {/* Action badge + detail on same line */}
                      <div style={{ display:"flex", alignItems:"baseline", gap:8, marginBottom:4, flexWrap:"wrap" }}>
                        <span style={{ fontFamily:T.mono, fontSize:10, fontWeight:500,
                                       color: isAdd?T.teal:isDel?T.red:T.amber,
                                       background: isAdd?T.tealBg:isDel?T.redBg:T.amberBg,
                                       padding:"1px 6px", borderRadius:3, flexShrink:0 }}>
                          {entry.action}
                        </span>
                        <span style={{ fontSize:12, color:T.text, fontWeight:500 }}>
                          {entry.detail}
                        </span>
                      </div>
                      {/* Field pills — supports both v (new value) and from/to */}
                      {(entry.fields||[]).length>0&&(
                        <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                          {(entry.fields||[]).filter(f=>f.v||f.to).map((f,fi)=>(
                            <span key={fi} style={{ fontSize:11, padding:"2px 8px", borderRadius:10,
                                                    background:T.surface2, border:"1px solid "+T.border,
                                                    color:T.muted, display:"flex", alignItems:"center", gap:4 }}>
                              <span style={{ color:T.faint, fontSize:10 }}>{f.k}</span>
                              {f.from!==undefined
                                ? <><span style={{ color:T.muted, textDecoration:"line-through", fontSize:10 }}>{f.from}</span>
                                    <span style={{ color:T.faint, fontSize:9 }}>→</span>
                                    <span style={{ color:T.text }}>{f.to}</span></>
                                : <span style={{ color:T.text }}>{f.v}</span>}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{ flexShrink:0, textAlign:"right" }}>
                      <p style={{ fontFamily:T.mono, fontSize:9, color:T.faint, margin:0 }}>{dateStr}</p>
                      <p style={{ fontFamily:T.mono, fontSize:9, color:T.faint, margin:"1px 0 0" }}>{timeStr}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        );
      })()}

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
  const fmtKg = kg => kg>=1000?(kg/1000).toFixed(1)+" t CO2e":kg>0?Math.round(kg)+" kg CO2e":"--";
  const fmtSc = v => v>=1000?(v/1000).toFixed(1)+"t":Math.round(v)+"kg";

  const contractMap = {};
  projects.forEach(p => {
    const key = (p.contract||"").trim() || "__none__";
    if (!contractMap[key]) contractMap[key] = [];
    contractMap[key].push(p);
  });
  const contractGroups = Object.entries(contractMap).sort(([a],[b]) =>
    a==="__none__" ? 1 : b==="__none__" ? -1 : a.localeCompare(b)
  );
  const allAspects = projects.flatMap(p=>p.aspects||[]);
  const allOpps    = projects.flatMap(p=>p.opportunities||p.opps||[]);
  const totalGhg   = allOpps.reduce((s,o)=>{const g=calcGhgTotal(o);return s+(g||0);},0);

  const MiniDonut = ({ segments, size=52, strokeW=9 }) => {
    const r=(size-strokeW)/2; const circ=2*Math.PI*r;
    const total=segments.reduce((s,g)=>s+g.v,0)||1;
    let offset=0;
    return (
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={strokeW}/>
        {segments.map((g,i)=>{
          const len=(g.v/total)*circ;
          const el=<circle key={i} cx={size/2} cy={size/2} r={r} fill="none"
            stroke={g.c} strokeWidth={strokeW} strokeDasharray={len+" "+(circ-len)}
            strokeDashoffset={-offset} strokeLinecap="butt"/>;
          offset+=len; return el;
        })}
      </svg>
    );
  };

  const ProjectCard = ({ p }) => {
    const asp=p.aspects||[]; const opp=p.opportunities||p.opps||[];
    const sig=asp.filter(a=>calcSig(a)==="SIGNIFICANT").length;
    const watch=asp.filter(a=>calcSig(a)==="WATCH").length;
    const low=asp.filter(a=>calcSig(a)==="Low").length;
    const openN=asp.filter(a=>a.status==="Open").length;
    const inProg=asp.filter(a=>a.status==="In Progress").length;
    const closed=asp.filter(a=>a.status==="Closed").length;
    const hi=opp.filter(o=>calcOppScore(o)>=75).length;
    const tot=asp.length;
    return (
      <div onClick={()=>{onSelect(p.id);onClose();}}
        style={{ background:"var(--surface)",border:"1px solid var(--border)",borderRadius:10,
                 padding:"14px 16px",cursor:"pointer",transition:"border-color 0.15s",
                 display:"grid",gridTemplateColumns:"1fr auto",gap:"12px 20px",alignItems:"start" }}
        onMouseEnter={e=>e.currentTarget.style.borderColor="var(--teal-bd)"}
        onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border)"}>
        <div>
          <div style={{ display:"flex",alignItems:"baseline",gap:10,marginBottom:8,flexWrap:"wrap" }}>
            <span style={{ fontSize:14,fontWeight:600,color:"var(--text)" }}>{p.name||"Unnamed"}</span>
            {p.projectId&&<span style={{ fontFamily:"var(--mono,monospace)",fontSize:10,color:"var(--faint)" }}>{p.projectId}</span>}
            {p.company&&<span style={{ fontSize:12,color:"var(--muted)" }}>{p.company}</span>}
            <div style={{ display:"flex",gap:5,marginLeft:"auto" }}>
              {p.type&&<span style={{ fontSize:9,padding:"2px 7px",borderRadius:3,background:"var(--slate-bg)",color:"var(--slate)",border:"1px solid var(--slate-bd)" }}>{p.type}</span>}
              {p.phase&&<span style={{ fontSize:9,padding:"2px 7px",borderRadius:3,background:"var(--blue-bg)",color:"var(--blue)",border:"1px solid var(--blue-bd)" }}>{p.phase}</span>}
            </div>
          </div>
          <div style={{ marginBottom:10 }}>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}>
              <span style={{ fontSize:10,color:"var(--muted)",fontWeight:500 }}>Significance</span>
              <span style={{ fontSize:10,color:"var(--faint)" }}>{tot} aspect{tot!==1?"s":""}</span>
            </div>
            {tot>0?<div style={{ display:"flex",height:7,borderRadius:4,overflow:"hidden",gap:"1px" }}>
              {sig>0&&<div style={{ flex:sig,background:"var(--red-bd)",minWidth:4 }} title={"Significant: "+sig}/>}
              {watch>0&&<div style={{ flex:watch,background:"var(--amber-bd)",minWidth:4 }} title={"Watch: "+watch}/>}
              {low>0&&<div style={{ flex:low,background:"var(--green-bd)",minWidth:4 }} title={"Low: "+low}/>}
            </div>:<div style={{ height:7,borderRadius:4,background:"var(--border)" }}/>}
            <div style={{ display:"flex",gap:8,marginTop:5 }}>
              {[{l:"Sig",v:sig,bg:"var(--red-bg)",c:"var(--red)",bd:"var(--red-bd)"},
                {l:"Watch",v:watch,bg:"var(--amber-bg)",c:"var(--amber)",bd:"var(--amber-bd)"},
                {l:"Low",v:low,bg:"var(--green-bg)",c:"var(--green)",bd:"var(--green-bd)"}].map(({l,v,bg,c,bd})=>(
                <span key={l} style={{ fontSize:10,display:"inline-flex",alignItems:"center",gap:3,
                                       padding:"1px 6px",borderRadius:3,background:bg,color:c,border:"1px solid "+bd }}>
                  {l} <strong style={{ fontWeight:700 }}>{v}</strong>
                </span>
              ))}
            </div>
          </div>
          {opp.length>0&&<div style={{ display:"flex",gap:8,alignItems:"center" }}>
            <span style={{ fontSize:10,color:"var(--muted)",fontWeight:500 }}>Opportunities:</span>
            <span style={{ fontSize:10,color:"var(--muted)" }}>Total <strong style={{ color:"var(--text)" }}>{opp.length}</strong></span>
            <span style={{ fontSize:10,color:"var(--muted)",display:"flex",alignItems:"center",gap:3 }}>
              <span style={{ width:7,height:7,borderRadius:"50%",background:"var(--teal)",display:"inline-block" }}/>
              High <strong style={{ color:"var(--text)" }}>{hi}</strong>
            </span>
          </div>}
        </div>
        {tot>0&&(
          <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:4,minWidth:60 }}>
            <div style={{ position:"relative" }}>
              <MiniDonut segments={[{v:openN,c:"var(--red)"},{v:inProg,c:"var(--amber)"},{v:closed,c:"var(--green)"}]}/>
              <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column" }}>
                <span style={{ fontSize:11,fontWeight:700,color:"var(--text)",lineHeight:1 }}>{tot}</span>
              </div>
            </div>
            <span style={{ fontSize:9,color:"var(--faint)",textAlign:"center" }}>aspects</span>
          </div>
        )}
      </div>
    );
  };

  const ContractSection = ({ contractKey, ps }) => {
    const asp=ps.flatMap(p=>p.aspects||[]);
    const opp=ps.flatMap(p=>p.opportunities||p.opps||[]);
    const sig=asp.filter(a=>calcSig(a)==="SIGNIFICANT").length;
    const watch=asp.filter(a=>calcSig(a)==="WATCH").length;
    const low=asp.filter(a=>calcSig(a)==="Low").length;
    const openN=asp.filter(a=>a.status==="Open").length;
    const inP=asp.filter(a=>a.status==="In Progress").length;
    const cls=asp.filter(a=>a.status==="Closed").length;
    const hiOpp=opp.filter(o=>calcOppScore(o)>=75).length;
    const medOpp=opp.filter(o=>{const s=calcOppScore(o);return s>=30&&s<75;}).length;
    const ghg=opp.reduce((s,o)=>{const g=calcGhgTotal(o);return s+(g||0);},0);
    const sc=calcPortfolioScopeSavings(opp);
    return (
      <div style={{ marginBottom:"2rem" }}>
        <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:"0.75rem",
                       paddingBottom:8,borderBottom:"2px solid var(--border)" }}>
          <h2 style={{ margin:0,fontSize:14,fontWeight:600,color:"var(--text)" }}>
            {contractKey==="__none__"?"No contract assigned":contractKey}
          </h2>
          <span style={{ fontSize:11,color:"var(--faint)" }}>{ps.length} project{ps.length!==1?"s":""}</span>
          <span style={{ fontSize:11,color:"var(--faint)" }}>&middot;</span>
          <span style={{ fontSize:11,color:"var(--faint)" }}>{asp.length} aspect{asp.length!==1?"s":""}</span>
          <span style={{ fontSize:11,color:"var(--faint)" }}>&middot;</span>
          <span style={{ fontSize:11,color:"var(--faint)" }}>{opp.length} opportunit{opp.length!==1?"ies":"y"}</span>
          {ghg>0&&<span style={{ marginLeft:"auto",fontFamily:"var(--mono)",fontSize:12,fontWeight:500,color:"var(--teal-dk)" }}>{fmtKg(ghg)}</span>}
        </div>

        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px 16px",marginBottom:"1rem" }}>
          {/* Aspects bar */}
          <div style={{ background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,padding:"12px 14px" }}>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
              <span style={{ fontSize:11,fontWeight:500,color:"var(--muted)" }}>Aspects — significance</span>
              <span style={{ fontSize:10,color:"var(--faint)" }}>{asp.length} total</span>
            </div>
            {asp.length>0?<>
              <div style={{ display:"flex",height:8,borderRadius:4,overflow:"hidden",gap:"1px",marginBottom:6 }}>
                {sig>0&&<div style={{ flex:sig,background:"var(--red-bd)",minWidth:4 }}/>}
                {watch>0&&<div style={{ flex:watch,background:"var(--amber-bd)",minWidth:4 }}/>}
                {low>0&&<div style={{ flex:low,background:"var(--green-bd)",minWidth:4 }}/>}
                {asp.length-sig-watch-low>0&&<div style={{ flex:asp.length-sig-watch-low,background:"var(--border)",minWidth:2 }}/>}
              </div>
              <div style={{ display:"flex",gap:6,flexWrap:"wrap",marginBottom:6 }}>
                {[{l:"Significant",v:sig,bg:"var(--red-bg)",c:"var(--red)",bd:"var(--red-bd)"},
                  {l:"Watch",v:watch,bg:"var(--amber-bg)",c:"var(--amber)",bd:"var(--amber-bd)"},
                  {l:"Low",v:low,bg:"var(--green-bg)",c:"var(--green)",bd:"var(--green-bd)"}].filter(x=>x.v>0).map(({l,v,bg,c,bd})=>(
                  <span key={l} style={{ fontSize:10,padding:"1px 6px",borderRadius:3,background:bg,color:c,border:"1px solid "+bd }}>
                    {l} <strong>{v}</strong>
                  </span>
                ))}
              </div>
              <div style={{ display:"flex",height:6,borderRadius:3,overflow:"hidden",gap:"1px",marginBottom:5 }}>
                {openN>0&&<div style={{ flex:openN,background:"var(--red-bd)",minWidth:3 }}/>}
                {inP>0&&<div style={{ flex:inP,background:"var(--amber-bd)",minWidth:3 }}/>}
                {cls>0&&<div style={{ flex:cls,background:"var(--green-bd)",minWidth:3 }}/>}
              </div>
              <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                {[{l:"Open",v:openN,c:"var(--red)"},{l:"In progress",v:inP,c:"var(--amber)"},{l:"Closed",v:cls,c:"var(--green)"}].filter(x=>x.v>0).map(({l,v,c})=>(
                  <span key={l} style={{ fontSize:10,color:"var(--muted)",display:"flex",alignItems:"center",gap:4 }}>
                    <span style={{ width:7,height:7,borderRadius:"50%",background:c,display:"inline-block" }}/>{l} <strong style={{ color:"var(--text)" }}>{v}</strong>
                  </span>
                ))}
              </div>
            </>:<span style={{ fontSize:11,color:"var(--faint)",fontStyle:"italic" }}>No aspects yet</span>}
          </div>

          {/* Opportunities bar */}
          <div style={{ background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,padding:"12px 14px" }}>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
              <span style={{ fontSize:11,fontWeight:500,color:"var(--muted)" }}>Opportunities — priority</span>
              <span style={{ fontSize:10,color:"var(--faint)" }}>{opp.length} total</span>
            </div>
            {opp.length>0?<>
              <div style={{ display:"flex",height:8,borderRadius:4,overflow:"hidden",gap:"1px",marginBottom:6 }}>
                {hiOpp>0&&<div style={{ flex:hiOpp,background:"var(--teal-bd)",minWidth:4 }}/>}
                {medOpp>0&&<div style={{ flex:medOpp,background:"var(--amber-bd)",minWidth:4 }}/>}
                {opp.length-hiOpp-medOpp>0&&<div style={{ flex:opp.length-hiOpp-medOpp,background:"var(--border)",minWidth:3 }}/>}
              </div>
              <div style={{ display:"flex",gap:6,flexWrap:"wrap",marginBottom:6 }}>
                {[{l:"High",v:hiOpp,bg:"var(--teal-bg)",c:"var(--teal)",bd:"var(--teal-bd)"},
                  {l:"Medium",v:medOpp,bg:"var(--amber-bg)",c:"var(--amber)",bd:"var(--amber-bd)"},
                  {l:"Low/None",v:opp.length-hiOpp-medOpp,bg:"var(--slate-bg)",c:"var(--slate)",bd:"var(--border)"}].filter(x=>x.v>0).map(({l,v,bg,c,bd})=>(
                  <span key={l} style={{ fontSize:10,padding:"1px 6px",borderRadius:3,background:bg,color:c,border:"1px solid "+bd }}>
                    {l} <strong>{v}</strong>
                  </span>
                ))}
              </div>
              {(sc.s1+sc.s2+sc.s3)>0&&(
                <div style={{ display:"flex",gap:10,flexWrap:"wrap" }}>
                  {[{l:"S1",v:sc.s1,c:"var(--red)"},{l:"S2",v:sc.s2,c:"var(--blue)"},{l:"S3",v:sc.s3,c:"var(--teal)"}].filter(x=>x.v>0).map(({l,v,c})=>(
                    <span key={l} style={{ fontSize:11,color:c,fontFamily:"var(--mono)" }}>
                      {l}: <strong>{fmtSc(v)}</strong>
                    </span>
                  ))}
                </div>
              )}
            </>:<span style={{ fontSize:11,color:"var(--faint)",fontStyle:"italic" }}>No opportunities yet</span>}
          </div>
        </div>

        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:10 }}>
          {ps.map(p=><ProjectCard key={p.id} p={p}/>)}
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding:"1.5rem 1.75rem",background:"var(--bg)",minHeight:"100%",fontFamily:"var(--sans,system-ui)" }}>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1.25rem" }}>
        <div>
          <h1 style={{ margin:"0 0 3px",fontSize:18,fontWeight:700,color:"var(--text)" }}>Portfolio overview</h1>
          <p style={{ margin:0,fontSize:12,color:"var(--muted)" }}>
            {projects.length} project{projects.length!==1?"s":""} &middot; {allAspects.length} aspects &middot; {allOpps.length} opportunities
            {totalGhg>0&&<span style={{ marginLeft:12,color:"var(--teal-dk)",fontFamily:"var(--mono)",fontWeight:500 }}>{fmtKg(totalGhg)}</span>}
          </p>
        </div>
        <button onClick={onClose} style={{ padding:"6px 14px",borderRadius:6,border:"1px solid var(--border)",background:"transparent",color:"var(--muted)",cursor:"pointer",fontSize:12 }}>Close</button>
      </div>

      {contractGroups.map(([key,ps])=>(
        <ContractSection key={key} contractKey={key} ps={ps}/>
      ))}

      {allAspects.filter(a=>calcSig(a)==="SIGNIFICANT").length>0&&(
        <div style={{ marginTop:"0.5rem" }}>
          <h2 style={{ fontSize:13,fontWeight:600,margin:"0 0 0.6rem",color:"var(--muted)",textTransform:"uppercase",letterSpacing:"0.06em" }}>
            Significant aspects ({allAspects.filter(a=>calcSig(a)==="SIGNIFICANT").length})
          </h2>
          <div style={{ background:"var(--surface)",borderRadius:8,border:"1px solid var(--border)",overflow:"hidden" }}>
            <table style={{ width:"100%",borderCollapse:"collapse",fontSize:12 }}>
              <thead><tr style={{ background:"var(--surface2)" }}>
                {["Contract","Project","ID","Ref","Aspect","Score","Phase","Status"].map(h=>(
                  <th key={h} style={{ padding:"8px 12px",textAlign:"left",fontSize:9,fontWeight:600,color:"var(--muted)",borderBottom:"1px solid var(--border)",textTransform:"uppercase",letterSpacing:"0.07em",whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {projects.flatMap(p=>(p.aspects||[]).filter(a=>calcSig(a)==="SIGNIFICANT").map(a=>({...a,_proj:p}))).map((a,i)=>{
                  const score=calcScore(a);
                  return(
                    <tr key={i} style={{ borderBottom:"1px solid var(--row-bd)",borderLeft:"3px solid var(--red-bd)" }}>
                      <td style={{ padding:"8px 12px",fontSize:11,color:"var(--faint)" }}>{a._proj.contract||"--"}</td>
                      <td style={{ padding:"8px 12px",fontSize:11,color:"var(--muted)" }}>{a._proj.name||"Unnamed"}</td>
                      <td style={{ padding:"8px 12px" }}><span style={{ fontFamily:"monospace",fontSize:10,color:"var(--faint)" }}>{a._proj.projectId||"--"}</span></td>
                      <td style={{ padding:"8px 12px" }}><span style={{ fontSize:10,fontWeight:600,color:"var(--teal)" }}>{a.ref}</span></td>
                      <td style={{ padding:"8px 12px",fontWeight:500,color:"var(--text)",maxWidth:180 }}><div style={{ overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }} title={a.aspect}>{a.aspect||"--"}</div></td>
                      <td style={{ padding:"8px 12px",fontWeight:700,color:"var(--red)",whiteSpace:"nowrap" }}>{score!==null?score:"--"}</td>
                      <td style={{ padding:"8px 12px" }}><span style={{ fontSize:9,padding:"2px 5px",borderRadius:3,background:"var(--slate-bg)",color:"var(--slate)" }}>{a.phase||"--"}</span></td>
                      <td style={{ padding:"8px 12px" }}><span style={{ fontSize:9,padding:"2px 5px",borderRadius:3,background:"var(--red-bg)",color:"var(--red)" }}>{a.status||"Open"}</span></td>
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
