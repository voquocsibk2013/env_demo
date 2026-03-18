/**
 * Environmental Aspects Toolkit - Guide Words Data
 *
 * Updated data structure with:
 * - domainColor: environmental domain (replaces category color)
 * - emoji: visual identifier for domain
 * - regulations: relevant EU/Norwegian/international regulations
 */

export const GW_RISK = {
  E: [
    {
      cat: "Site selection & footprint",
      domainColor: "soil",
      emoji: "🏗️",
      items: [
        {
          kw: "Habitat sensitivity",
          q: "Are there designated protected areas (Natura 2000, RAMSAR, seabed habitats) within or adjacent to the project footprint?",
          aspect: "Land use change / habitat loss -- impact on protected species and ecosystems",
          area: "Site selection",
          domainColor: "biodiversity",
          emoji: "🌿",
          regulations: ["EU Habitats Directive (92/43/EEC)", "EU Birds Directive (2009/147/EC)", "RAMSAR Convention", "Norwegian Naturmangfoldsloven"]
        },
        {
          kw: "Drainage & hydrology",
          q: "How will the site layout affect natural drainage paths, catchments, or groundwater recharge zones?",
          aspect: "Alteration of surface water drainage -- changes to flood risk and water availability",
          area: "Site & drainage design",
          domainColor: "water",
          emoji: "💧",
          regulations: ["EU Water Framework Directive (2000/60/EC)", "Norwegian Vannforskriften", "EU Floods Directive (2007/60/EC)"]
        },
        {
          kw: "Floodplain encroachment",
          q: "Is any part of the facility sited within a 100-year or 200-year floodplain?",
          aspect: "Increased flood risk to third parties and assets",
          area: "Site selection",
          domainColor: "water",
          emoji: "💧",
          regulations: ["EU Floods Directive (2007/60/EC)", "Norwegian Vannforskriften", "Building Regulations (local)"]
        },
        {
          kw: "Cultural heritage",
          q: "Has a desk-based heritage assessment been completed? Are there known or probable buried assets within the development zone?",
          aspect: "Disturbance to buried archaeological remains -- loss of cultural heritage",
          area: "Site selection",
          domainColor: "air",
          emoji: "💨",
          regulations: ["European Convention on Archaeological Heritage (Valletta Convention)", "Norwegian Kulturminneloven"]
        },
        {
          kw: "Visual impact",
          q: "Will the installation be visible from a national park, scenic area, or sensitive receptor?",
          aspect: "Visual intrusion / landscape character change -- amenity impact on stakeholders",
          area: "Layout design",
          domainColor: "air",
          emoji: "💨",
          regulations: ["Norwegian Planning and Building Act (Plan- og bygningsloven)", "Landscape Character Assessment guidance"]
        }
      ]
    },
    {
      cat: "Material & process design",
      domainColor: "chemicals",
      emoji: "⚗️",
      items: [
        {
          kw: "Hazardous substances & CMR/PBT screening",
          q: "Have all chemicals in process design been screened against REACH Candidate List (SVHC) and CMR/PBT criteria? Are safer alternatives available?",
          aspect: "Introduction of Substances of Very High Concern (SVHC) to process — worker & environmental exposure risk",
          area: "Process design",
          domainColor: "chemicals",
          emoji: "⚗️",
          regulations: ["REACH Regulation (EC/1907/2006), Annex XIV", "Occupational Safety & Health Directive (89/391/EEC)", "Norwegian Forurensningsloven §9"]
        },
        {
          kw: "Energy efficiency",
          q: "What is the estimated energy intensity (kWh/tonne product)? Have low-energy alternatives been assessed at FEED?",
          aspect: "GHG emissions from facility energy use -- contribution to climate change",
          area: "Process design",
          domainColor: "energy",
          emoji: "⚡",
          regulations: ["EU Energy Efficiency Directive (2012/27/EU)", "Norwegian Klimaforliket", "EU ETS Directive (2003/87/EC)"]
        },
        {
          kw: "Fugitive emissions",
          q: "Which process streams have the highest fugitive VOC / methane potential? Is LDAR designed in from the start?",
          aspect: "Fugitive VOC / methane emissions to atmosphere -- air quality and climate impact",
          area: "Process design",
          domainColor: "air",
          emoji: "💨",
          regulations: ["EU Industrial Emissions Directive (2010/75/EU)", "UNECE Aarhus Convention", "Norwegian Forurensningsloven"]
        },
        {
          kw: "Produced water design",
          q: "What is the estimated produced water volume, composition and treatment route? Is zero liquid discharge achievable?",
          aspect: "Produced water discharge to sea / ground -- chemical and thermal pollution of water bodies",
          area: "Process design",
          domainColor: "water",
          emoji: "💧",
          regulations: ["OSPAR Decision 2001/1 (water column discharges)", "Norwegian Forurensningsloven", "Norwegian Offshore Regulations"]
        },
        {
          kw: "Noise at boundaries",
          q: "Have boundary noise limits (Forurensningsloven, NORSOK S-002) been mapped at FEED stage?",
          aspect: "Noise exceeding boundary / community limits -- community amenity and ecosystem disruption",
          area: "Engineering design",
          domainColor: "air",
          emoji: "💨",
          regulations: ["Norwegian Forurensningsloven §11-13", "EU Noise Directive (2002/49/EC)", "NORSOK S-002"]
        },
        {
          kw: "Waste hierarchy",
          q: "Has a waste minimisation assessment been carried out? Are waste streams designed for recyclability (EU WFD)?",
          aspect: "Waste generation -- construction and operational phase -- resource depletion",
          area: "Engineering design",
          domainColor: "waste",
          emoji: "♻️",
          regulations: ["EU Waste Framework Directive (2008/98/EC)", "Norwegian Avfallsforskriften", "EU Circular Economy Action Plan"]
        }
      ]
    },
    {
      cat: "Emissions & discharge design",
      domainColor: "air",
      emoji: "💨",
      items: [
        {
          kw: "Stack emissions",
          q: "What combustion stacks are included? Have dispersion modelling inputs been set against IED / Forurensningsloven limits?",
          aspect: "Air emissions -- NOx, SO2, PM, CO from combustion sources -- air quality and human health",
          area: "Engineering design",
          domainColor: "air",
          emoji: "💨",
          regulations: ["EU Industrial Emissions Directive (2010/75/EU)", "Norwegian Forurensningsloven §11", "EU Ambient Air Quality Directive (2008/50/EC)"]
        },
        {
          kw: "Thermal discharge",
          q: "If cooling water is used, what is the delta-T at discharge? Has a thermal plume model been run?",
          aspect: "Thermal pollution of receiving waterbody -- disruption to aquatic ecosystems",
          area: "Process design",
          domainColor: "water",
          emoji: "💧",
          regulations: ["EU Water Framework Directive (2000/60/EC)", "Norwegian Vannforskriften", "Environmental Quality Standards"]
        },
        {
          kw: "Stormwater quality",
          q: "What contaminants could be in stormwater runoff from process areas, laydown yards, or access roads?",
          aspect: "Contaminated stormwater runoff to watercourse / sea -- pollution of surface waters",
          area: "Drainage design",
          domainColor: "water",
          emoji: "💧",
          regulations: ["EU Water Framework Directive (2000/60/EC)", "Norwegian Vannforskriften", "Stormwater management standards"]
        }
      ]
    }
  ],
  P: [
    {
      cat: "Chemical & substance procurement",
      domainColor: "chemicals",
      emoji: "⚗️",
      items: [
        {
          kw: "REACH compliance",
          q: "Are all procured chemicals registered under REACH? Have SVHCs been screened out of the vendor list?",
          aspect: "Introduction of SVHC chemicals to site -- worker exposure and environmental contamination risk",
          area: "Procurement",
          domainColor: "chemicals",
          emoji: "⚗️",
          regulations: ["REACH Regulation (EC/1907/2006)", "CLP Regulation (EC/1272/2008)", "Norwegian Kjemikalieforskriften"]
        },
        {
          kw: "Biocide use",
          q: "Are biocides specified? Are they approved under EU BPR and OSPAR PLONOR lists?",
          aspect: "Biocide discharge -- toxicity to marine organisms and bioaccumulation",
          area: "Chemical procurement",
          domainColor: "chemicals",
          emoji: "⚗️",
          regulations: ["EU Biocidal Products Regulation (EU/528/2012)", "OSPAR PLONOR (Potentially Low Risk) list", "Norwegian Forurensningsloven"]
        },
        {
          kw: "Refrigerants & blowing agents",
          q: "What refrigerants are in HVAC / process equipment? Are high-GWP F-gases being used?",
          aspect: "Release of high-GWP refrigerants / F-gases -- ozone depletion and climate forcing",
          area: "Equipment procurement",
          domainColor: "energy",
          emoji: "⚡",
          regulations: ["EU Regulation (EU) 2024/573 (F-gases)", "Montreal Protocol", "Norwegian Ozonlag"]
        },
        {
          kw: "Asbestos-containing materials",
          q: "Has a blanket prohibition on ACM been specified in procurement documents? Is the supply chain verified?",
          aspect: "Asbestos introduction to site via procured goods -- worker and public health risk",
          area: "Procurement",
          domainColor: "chemicals",
          emoji: "⚗️",
          regulations: ["EU Asbestos Directive (1999/77/EC)", "Norwegian Arbeidsmiljøloven", "ILO Asbestos Convention"]
        },
        {
          kw: "Invasive species via equipment",
          q: "Could imported plant, aggregate or equipment introduce invasive species or aquatic organisms?",
          aspect: "Introduction of non-native / invasive species -- ecosystem disruption and biodiversity loss",
          area: "Procurement",
          domainColor: "biodiversity",
          emoji: "🌿",
          regulations: ["EU Regulation (EU) 2014/1143 (invasive species)", "RAMSAR Convention", "Norwegian Naturmangfoldsloven"]
        }
      ]
    },
    {
      cat: "Transport & logistics",
      domainColor: "air",
      emoji: "💨",
      items: [
        {
          kw: "Abnormal loads",
          q: "What abnormal loads are required? What route restrictions and community notifications are needed?",
          aspect: "Road traffic impacts -- noise, dust, community disruption and safety hazards",
          area: "Logistics",
          domainColor: "air",
          emoji: "💨",
          regulations: ["Norwegian Veitrafikkloven", "EU Noise Directive (2002/49/EC)", "Community engagement standards"]
        },
        {
          kw: "Marine transport emissions",
          q: "Are vessels / barges used for procurement? Are IMO Tier III engines / scrubbers specified?",
          aspect: "Vessel exhaust -- NOx, SOx, PM (MARPOL Annex VI) -- contribution to air pollution and climate change",
          area: "Marine logistics",
          domainColor: "air",
          emoji: "💨",
          regulations: ["MARPOL Annex VI (air pollution from ships)", "IMO 2030/2050 Strategy", "EU MRV Regulation (EC/2015/757)"]
        },
        {
          kw: "Port operations",
          q: "What environmental controls are specified at port laydown areas? Spill kits, waste reception, stormwater controls?",
          aspect: "Spills and waste from port / marshalling operations -- marine and terrestrial pollution",
          area: "Logistics",
          domainColor: "water",
          emoji: "💧",
          regulations: ["MARPOL Convention", "Port State Control Directives", "Norwegian Port Authority regulations"]
        }
      ]
    },
    {
      cat: "Packaging & material waste",
      domainColor: "waste",
      emoji: "♻️",
      items: [
        {
          kw: "Packaging waste volumes",
          q: "What is the estimated packaging volume from deliveries? Is a take-back or minimisation requirement in the contract?",
          aspect: "Waste -- packaging (plastics, timber, metal) -- resource depletion and landfill burden",
          area: "Procurement",
          domainColor: "waste",
          emoji: "♻️",
          regulations: ["EU Packaging and Packaging Waste Directive (94/62/EC)", "Norwegian Avfallsforskriften", "EU Single-Use Plastics Directive"]
        },
        {
          kw: "Offcuts & material surplus",
          q: "What is the estimated surplus / scrap from fabricated items? Is there a contract requirement for reuse or recycling?",
          aspect: "Solid waste -- fabrication offcuts and surplus -- resource depletion and waste generation",
          area: "Procurement",
          domainColor: "waste",
          emoji: "♻️",
          regulations: ["EU Waste Framework Directive (2008/98/EC)", "Norwegian Avfallsforskriften", "Circular Economy requirements"]
        }
      ]
    }
  ],
  C: [
    {
      cat: "Ground disturbance & earthworks",
      domainColor: "soil",
      emoji: "🏗️",
      items: [
        {
          kw: "Bulk excavation",
          q: "What volumes of cut/fill? Is there contaminated land risk? What is the waste classification route for excavated material?",
          aspect: "Excavation of contaminated / hazardous ground material -- soil and groundwater contamination risk",
          area: "Earthworks",
          domainColor: "soil",
          emoji: "🏗️",
          regulations: ["EU Environmental Liability Directive (2004/35/EC)", "Norwegian Forurensningsloven §8", "Waste Classification regulations"]
        },
        {
          kw: "Dust generation",
          q: "What are the nearest dust-sensitive receptors? What PM10 suppression measures and trigger action levels are proposed?",
          aspect: "Fugitive dust (PM10/PM2.5) -- nuisance & human health impact at nearby receptors",
          area: "Earthworks",
          domainColor: "air",
          emoji: "💨",
          regulations: ["EU Ambient Air Quality Directive (2008/50/EC)", "Norwegian Forurensningsloven", "IARC PM classifications"]
        },
        {
          kw: "Ground vibration",
          q: "Are there vibration-sensitive structures or receptors within 100m of piling / blasting operations?",
          aspect: "Ground-borne vibration -- structural damage / amenity and ecosystem disruption",
          area: "Piling / foundation works",
          domainColor: "soil",
          emoji: "🏗️",
          regulations: ["Norwegian Standard NS 8176 (vibration)", "Construction Best Practice guidance"]
        },
        {
          kw: "Soil erosion & sediment",
          q: "What is the rainfall erosivity and slope risk? Are silt fences, settlement ponds and topsoil bunds designed in?",
          aspect: "Sediment runoff to watercourse during earthworks -- water quality degradation and turbidity",
          area: "Earthworks",
          domainColor: "water",
          emoji: "💧",
          regulations: ["EU Water Framework Directive (2000/60/EC)", "Norwegian Vannforskriften", "Sediment control guidelines"]
        },
        {
          kw: "Dewatering",
          q: "What groundwater depths are anticipated? Where will dewatering discharge go? What are the SS / contaminant limits?",
          aspect: "Contaminated dewatering discharge to surface water -- pollution and turbidity impacts",
          area: "Earthworks / foundations",
          domainColor: "water",
          emoji: "💧",
          regulations: ["EU Water Framework Directive (2000/60/EC)", "Norwegian Vannforskriften §17", "Discharge consent standards"]
        }
      ]
    },
    {
      cat: "Ecology & habitat",
      domainColor: "biodiversity",
      emoji: "🌿",
      items: [
        {
          kw: "Vegetation clearance",
          q: "Pre-clearance habitat survey status? Are there nesting birds, protected plants, or invertebrate features requiring seasonal constraints?",
          aspect: "Loss or disturbance of protected / priority habitats -- biodiversity and species decline",
          area: "Site preparation",
          domainColor: "biodiversity",
          emoji: "🌿",
          regulations: ["EU Habitats Directive (92/43/EEC)", "EU Birds Directive (2009/147/EC)", "Norwegian Naturmangfoldsloven", "Wildlife and Countryside Act"]
        },
        {
          kw: "Invasive plant species",
          q: "Are Japanese knotweed, Himalayan balsam or other invasive species present? Is a management plan in place?",
          aspect: "Spread of invasive plant species via earthworks -- ecosystem disruption and biodiversity loss",
          area: "Site preparation",
          domainColor: "biodiversity",
          emoji: "🌿",
          regulations: ["EU Invasive Alien Species Regulation (EU/1143/2014)", "Norwegian Naturmangfoldsloven", "Environmental Biosecurity Act"]
        },
        {
          kw: "Ecological connectivity",
          q: "Will construction sever wildlife corridors (hedgerows, streams, woodland edges)? Are underpasses specified?",
          aspect: "Severance of wildlife corridors -- habitat fragmentation and population isolation",
          area: "Construction layout",
          domainColor: "biodiversity",
          emoji: "🌿",
          regulations: ["EU Habitats Directive (92/43/EEC)", "Norwegian Naturmangfoldsloven §26", "Ecological networks guidance"]
        }
      ]
    },
    {
      cat: "Water & drainage",
      domainColor: "water",
      emoji: "💧",
      items: [
        {
          kw: "Concrete washout",
          q: "Where will concrete washout occur? What containment prevents alkaline washout water (pH 11-13) entering watercourses?",
          aspect: "Alkaline concrete washwater discharge to watercourse -- water quality degradation and aquatic toxicity",
          area: "Concrete / civil works",
          domainColor: "water",
          emoji: "💧",
          regulations: ["EU Water Framework Directive (2000/60/EC)", "Norwegian Vannforskriften", "Water Quality Standards"]
        },
        {
          kw: "Fuel & chemical storage",
          q: "Are bunded storage areas designed to 110% capacity? What secondary containment and inspection regime is in place?",
          aspect: "Hydrocarbon / chemical spill from storage to ground/water -- soil and water contamination",
          area: "Construction compound",
          domainColor: "chemicals",
          emoji: "⚗️",
          regulations: ["EU Environmental Liability Directive (2004/35/EC)", "Norwegian Forurensningsloven §8", "Bunding regulations (110% capacity standard)"]
        },
        {
          kw: "Welfare facilities",
          q: "What is the sewage / grey water treatment route for construction welfare facilities? Is consent required?",
          aspect: "Untreated sewage discharge from construction welfare -- microbial and nutrient pollution",
          area: "Construction compound",
          domainColor: "water",
          emoji: "💧",
          regulations: ["EU Urban Wastewater Directive (1991/271/EEC)", "Norwegian Vannforskriften", "Environmental discharge consents"]
        }
      ]
    },
    {
      cat: "Air, noise & light",
      domainColor: "air",
      emoji: "💨",
      items: [
        {
          kw: "Construction noise",
          q: "Dominant noise sources (piling, generators, pumps)? Hours of operation and community notification protocols?",
          aspect: "Construction noise -- community amenity impact and ecosystem disruption",
          area: "Construction activities",
          domainColor: "air",
          emoji: "💨",
          regulations: ["EU Noise Directive (2002/49/EC)", "Norwegian Forurensningsloven §11", "Construction code of practice"]
        },
        {
          kw: "Diesel plant emissions",
          q: "Fleet composition (Stage V compliant?), operating hours and total NOx/PM load estimate?",
          aspect: "Diesel plant exhaust -- NOx, PM to air -- air quality and human health impact",
          area: "Construction plant",
          domainColor: "air",
          emoji: "💨",
          regulations: ["EU Non-Road Mobile Machinery Directive (2016/1628)", "Stage V Engine Regulations", "Norwegian Forurensningsloven"]
        },
        {
          kw: "Artificial light at night",
          q: "Are there light-sensitive receptors (bat roosts, seabirds, residential)? Is a lighting management plan in place?",
          aspect: "Light spill -- disturbance to ecology / community amenity impact",
          area: "Construction compound",
          domainColor: "biodiversity",
          emoji: "🌿",
          regulations: ["EU Habitats Directive (92/43/EEC)", "International Dark-Sky Association standards", "MIGBCO guidelines"]
        }
      ]
    }
  ],
  I: [
    {
      cat: "Marine operations",
      domainColor: "water",
      emoji: "💧",
      items: [
        {
          kw: "Anchor handling & moorings",
          q: "Will anchors be set over cable routes, protected seabed, or sensitive benthic habitats? Pre-lay survey status?",
          aspect: "Seabed disturbance from anchor handling / moorings -- habitat loss and species disruption",
          area: "Marine operations",
          domainColor: "water",
          emoji: "💧",
          regulations: ["OSPAR Convention (Annex I)", "EU Marine Strategy Framework Directive (2008/56/EC)", "IMO guidelines"]
        },
        {
          kw: "Heavy lift & crane vessels",
          q: "What are the DP / thruster wash footprints? Could propwash disturb sensitive seabed or resuspend contaminants?",
          aspect: "Turbidity plume from vessel thruster wash -- water quality and suspended sediment impacts",
          area: "Marine operations",
          domainColor: "water",
          emoji: "💧",
          regulations: ["EU Marine Strategy Framework Directive (2008/56/EC)", "OSPAR Convention", "IMO Environmental guidelines"]
        },
        {
          kw: "Subsea pipeline / cable lay",
          q: "Pre-lay surveys completed? UXO risk assessed? How is trench spoil managed?",
          aspect: "Seabed disturbance / habitat loss from trenching -- benthic ecosystem damage",
          area: "Pipeline / cable installation",
          domainColor: "soil",
          emoji: "🏗️",
          regulations: ["OSPAR Convention (Annex I)", "EU Environmental Impact Assessment Directive", "Cable Burial standards"]
        },
        {
          kw: "Jacket / structure install",
          q: "Is pile driving required? What are underwater noise levels (SEL, peak SPL) and marine mammal mitigation protocols?",
          aspect: "Underwater noise from piling -- marine mammal disturbance, injury and behavioural changes",
          area: "Foundation / jacket installation",
          domainColor: "biodiversity",
          emoji: "🌿",
          regulations: ["EU Marine Strategy Framework Directive (2008/56/EC)", "OSPAR Noise Guidelines", "Marine Mammal Mitigation Protocols"]
        }
      ]
    },
    {
      cat: "Marine ecology",
      domainColor: "biodiversity",
      emoji: "🌿",
      items: [
        {
          kw: "Marine mammal protection",
          q: "Is a Marine Mammal Mitigation Protocol (MMMP) in place? Are PAM operators required?",
          aspect: "Disturbance / injury to marine mammals -- behavioural disruption and population-level impacts",
          area: "All marine operations",
          domainColor: "biodiversity",
          emoji: "🌿",
          regulations: ["EU Habitats Directive (92/43/EEC)", "OSPAR Convention", "Marine Mammal Mitigation Best Practice"]
        },
        {
          kw: "Fish spawning & migration",
          q: "Are operations scheduled within known spawning or migration windows for cod, herring, or salmon?",
          aspect: "Disturbance to fish spawning / migration routes -- recruitment failure and population decline",
          area: "Marine operations scheduling",
          domainColor: "biodiversity",
          emoji: "🌿",
          regulations: ["EU Marine Strategy Framework Directive (2008/56/EC)", "OSPAR Convention", "Fisheries management regulations"]
        },
        {
          kw: "Coral & reef habitats",
          q: "Have cold-water coral or reef habitats been surveyed? Is a 500m exclusion zone in place?",
          aspect: "Physical damage to cold-water coral / reef habitats -- irreversible ecosystem damage",
          area: "Seabed operations",
          domainColor: "biodiversity",
          emoji: "🌿",
          regulations: ["OSPAR Coral Protection Guidance", "EU Habitats Directive (92/43/EEC)", "UNEP Coral Conservation"]
        },
        {
          kw: "Ballast water",
          q: "Are all vessels compliant with IMO BWM Convention (D-2 standard)? Are discharge records maintained?",
          aspect: "Introduction of invasive species via ballast water -- ecosystem disruption and biodiversity loss",
          area: "Vessel operations",
          domainColor: "biodiversity",
          emoji: "🌿",
          regulations: ["IMO Ballast Water Management Convention", "EU Ships' Ballast Water Regulations (2012/33/EU)", "Norwegian biosecurity standards"]
        }
      ]
    },
    {
      cat: "Vessel operations & discharges",
      domainColor: "air",
      emoji: "💨",
      items: [
        {
          kw: "Vessel fuel & lubricants",
          q: "Total fuel volume on vessels? Spill response plan for worst-case diesel spill in the operational area?",
          aspect: "Hydrocarbon spill from vessel -- marine pollution and toxicity to aquatic life",
          area: "Vessel operations",
          domainColor: "water",
          emoji: "💧",
          regulations: ["MARPOL Convention", "Oil Pollution Act (1990)", "Norwegian Marine Pollution Regulations"]
        },
        {
          kw: "Grey water & sewage at sea",
          q: "Are vessels MARPOL Annex IV compliant? What is the 12-nm limit compliance approach for grey water discharge?",
          aspect: "Sewage / grey water discharge at sea (MARPOL IV) -- microbial and nutrient pollution",
          area: "Vessel operations",
          domainColor: "water",
          emoji: "💧",
          regulations: ["MARPOL Annex IV (sewage)", "EU Ship-Source Pollution Directive", "Coastal state regulations"]
        },
        {
          kw: "Garbage & plastics at sea",
          q: "Is a Garbage Management Plan in place per MARPOL Annex V? How is plastic waste logged and landed?",
          aspect: "Waste / plastic discharge at sea (MARPOL V) -- marine litter and microplastics impacts",
          area: "Vessel operations",
          domainColor: "waste",
          emoji: "♻️",
          regulations: ["MARPOL Annex V (garbage)", "EU Plastics Strategy", "Port reception facility requirements"]
        },
        {
          kw: "Air emissions at sea",
          q: "Combined SOx/NOx profile of fleet? Is the field within a MARPOL Annex VI ECA (0.1% sulphur zone)?",
          aspect: "Vessel air emissions -- SOx, NOx, PM (MARPOL VI) -- air quality and climate impact",
          area: "Vessel operations",
          domainColor: "air",
          emoji: "💨",
          regulations: ["MARPOL Annex VI (air pollution)", "IMO 2030/2050 GHG Strategy", "ECA fuel sulphur limits"]
        }
      ]
    },
    {
      cat: "Emergency response",
      domainColor: "regulatory",
      emoji: "⚖️",
      items: [
        {
          kw: "Dropped objects at sea",
          q: "Dropped object risk envelope for lifting over seabed? Are subsea assets, pipelines or cables at risk?",
          aspect: "Dropped object -- subsea infrastructure damage / pollution and spill risk",
          area: "Lifting operations",
          domainColor: "soil",
          emoji: "🏗️",
          regulations: ["IMCA Dropped Objects Guidance", "Lifting Operations & Lifting Equipment Regulations", "Subsea engineering standards"]
        },
        {
          kw: "Standby vessel emissions",
          q: "On-standby fuel consumption of support vessels? Is slow steaming / hybrid propulsion specified?",
          aspect: "Continuous exhaust from standby vessel operations -- air quality and climate impact",
          area: "Vessel operations",
          domainColor: "energy",
          emoji: "⚡",
          regulations: ["MARPOL Annex VI", "IMO 2030/2050 Strategy", "Vessel efficiency regulations"]
        }
      ]
    }
  ],
  C2: [
    {
      cat: "First fill & chemical loading",
      domainColor: "chemicals",
      emoji: "⚗️",
      items: [
        {
          kw: "Hydrotest water",
          q: "Source of hydrotest water? Additives (corrosion inhibitors, biocides, O2 scavengers) used and disposal route?",
          aspect: "Discharge of hydrotest water with chemical additives -- water pollution and toxicity",
          area: "Commissioning -- hydrotest",
          domainColor: "water",
          emoji: "💧",
          regulations: ["EU Water Framework Directive (2000/60/EC)", "Norwegian Vannforskriften", "OPEP discharge consent standards"]
        },
        {
          kw: "Chemical first fill",
          q: "Full inventory for first fill (methanol, MEG, glycol, lube oils)? Volume and containment plan?",
          aspect: "Chemical spill / release during first fill -- environmental contamination and worker exposure risk",
          area: "Commissioning",
          domainColor: "chemicals",
          emoji: "⚗️",
          regulations: ["REACH Regulation (EC/1907/2006)", "Occupational Safety Directive", "Norwegian Forurensningsloven"]
        },
        {
          kw: "Preservation fluids",
          q: "Are nitrogen blankets, desiccants or VCI films used? What is the waste disposal route?",
          aspect: "Waste from preservation materials / packaging -- resource depletion and waste generation",
          area: "Pre-commissioning",
          domainColor: "waste",
          emoji: "♻️",
          regulations: ["EU Waste Framework Directive (2008/98/EC)", "Norwegian Avfallsforskriften", "Hazardous waste classification"]
        },
        {
          kw: "Catalyst loading",
          q: "Are catalysts loaded during commissioning? Are they classified as hazardous waste if recovered?",
          aspect: "Hazardous dust / spill from catalyst loading -- worker exposure and environmental contamination",
          area: "Commissioning",
          domainColor: "chemicals",
          emoji: "⚗️",
          regulations: ["Occupational Safety & Health Directive", "Hazardous Waste Regulations", "Norwegian Arbeidsmiljøloven"]
        }
      ]
    },
    {
      cat: "Venting, flaring & purging",
      domainColor: "energy",
      emoji: "⚡",
      items: [
        {
          kw: "Vent gas composition",
          q: "Composition of vent gas during nitrogen purging / initial pressurisation? Are VOCs, H2S or CO present?",
          aspect: "Fugitive / intentional VOC / H2S release to atmosphere -- air quality and human health impact",
          area: "Commissioning -- purging",
          domainColor: "air",
          emoji: "💨",
          regulations: ["EU Industrial Emissions Directive (2010/75/EU)", "Norwegian Forurensningsloven", "H2S dispersion modelling standards"]
        },
        {
          kw: "Flaring volumes",
          q: "Estimated gas volume to be flared during commissioning? Has a flaring consent been obtained?",
          aspect: "GHG emissions from commissioning flaring -- contribution to climate change",
          area: "Commissioning -- flaring",
          domainColor: "energy",
          emoji: "⚡",
          regulations: ["EU ETS Directive (2003/87/EC)", "Flaring consent procedures", "OGMP 2.0 reporting standards"]
        },
        {
          kw: "Noise during testing",
          q: "Are PSVs or blow-down systems tested? What are peak noise levels and distances to receptors?",
          aspect: "Impulse noise from PSV testing / blowdown -- community amenity and ecosystem disruption",
          area: "Commissioning -- functional testing",
          domainColor: "air",
          emoji: "💨",
          regulations: ["EU Noise Directive (2002/49/EC)", "Norwegian Forurensningsloven §11", "Noise limits for testing operations"]
        }
      ]
    },
    {
      cat: "Drainage & waste streams",
      domainColor: "water",
      emoji: "💧",
      items: [
        {
          kw: "Flush & drain sequences",
          q: "What fluids will be drained during flushing? Are they hazardous waste? What is the tanker / disposal route?",
          aspect: "Hazardous waste from flush and drain operations -- water and soil contamination risk",
          area: "Commissioning",
          domainColor: "waste",
          emoji: "♻️",
          regulations: ["EU Waste Framework Directive (2008/98/EC)", "Norwegian Avfallsforskriften", "Hazardous waste consignment rules"]
        },
        {
          kw: "Oily water from start-up",
          q: "Oily water volume during initial start-up before treatment systems are fully online?",
          aspect: "Oily water discharge before treatment systems commissioned -- marine pollution risk",
          area: "Start-up",
          domainColor: "water",
          emoji: "💧",
          regulations: ["OSPAR Decision 2001/1", "Norwegian Offshore Regulations", "OPEP discharge standards"]
        }
      ]
    }
  ],
  OM: [
    {
      cat: "Routine operations & emissions",
      domainColor: "water",
      emoji: "💧",
      items: [
        {
          kw: "Produced water",
          q: "Continuous produced water rate, OiW concentration and discharge point? OSPAR Decision 2001/1 / Forurensningsloven compliance?",
          aspect: "Produced water discharge -- hydrocarbons, chemicals, NORM -- chronic marine pollution",
          area: "Production operations",
          domainColor: "water",
          emoji: "💧",
          regulations: ["OSPAR Decision 2001/1", "Norwegian Offshore Regulations", "Environmental discharge authorisations"]
        },
        {
          kw: "Flare & vent management",
          q: "Routine flaring rate (OGMP 2.0 Level 4/5)? Is an LDAR programme in place for fugitive methane?",
          aspect: "Routine flaring and fugitive methane emissions -- climate change contribution",
          area: "Production operations",
          domainColor: "energy",
          emoji: "⚡",
          regulations: ["EU ETS Directive (2003/87/EC)", "OGMP 2.0 reporting standard", "Methane abatement strategies"]
        },
        {
          kw: "Cooling water discharge",
          q: "Cooling water flow rate, delta-T and biocide loading? What is the receiving water body designation?",
          aspect: "Thermal and biocide loading to receiving waterbody -- water quality and ecosystem impacts",
          area: "Utility systems",
          domainColor: "water",
          emoji: "💧",
          regulations: ["EU Water Framework Directive (2000/60/EC)", "Norwegian Vannforskriften", "Environmental Quality Standards"]
        },
        {
          kw: "Atmospheric emissions",
          q: "Point source emissions (turbines, generators, heaters)? Are they within consented limits?",
          aspect: "NOx, SOx, PM from combustion sources -- air quality and human health impact",
          area: "Production operations",
          domainColor: "air",
          emoji: "💨",
          regulations: ["EU Industrial Emissions Directive (2010/75/EU)", "Norwegian Forurensningsloven", "Emission limit values"]
        }
      ]
    },
    {
      cat: "Maintenance activities",
      domainColor: "chemicals",
      emoji: "⚗️",
      items: [
        {
          kw: "Tank cleaning",
          q: "Frequency and method for tank cleaning? Sludge classification and disposal route?",
          aspect: "Oily sludge waste from tank cleaning -- hazardous waste generation and disposal burden",
          area: "Maintenance",
          domainColor: "waste",
          emoji: "♻️",
          regulations: ["EU Waste Framework Directive (2008/98/EC)", "Norwegian Avfallsforskriften", "Sludge handling standards"]
        },
        {
          kw: "Chemical injection",
          q: "Full chemical injection matrix (scale inhibitors, corrosion inhibitors, demulsifiers, biocides)? OSPAR PLONOR listed?",
          aspect: "Chemical injection -- chronic low-level marine discharge -- water quality and toxicity impacts",
          area: "Chemical injection systems",
          domainColor: "chemicals",
          emoji: "⚗️",
          regulations: ["OSPAR PLONOR (Potentially Low Risk) list", "Norwegian Offshore Regulations", "Environmental discharge standards"]
        },
        {
          kw: "Painting & surface treatment",
          q: "Are VOC-containing paints used in maintenance? Annual solvent emissions vs. consented limits?",
          aspect: "VOC emissions from maintenance painting -- air quality and ozone formation impact",
          area: "Maintenance",
          domainColor: "air",
          emoji: "💨",
          regulations: ["EU Industrial Emissions Directive (2010/75/EU)", "EU Solvents Emissions Directive", "Norwegian Forurensningsloven"]
        },
        {
          kw: "Radioactive sources",
          q: "Radioactive sources in process equipment? Inspection, loss prevention and waste management protocol?",
          aspect: "Radioactive source loss / mismanagement -- environmental contamination and health risk",
          area: "Instrumentation maintenance",
          domainColor: "regulatory",
          emoji: "⚖️",
          regulations: ["EU Euratom Directive", "Norwegian Strålevernloven", "IAEA Radiation Safety Standards"]
        }
      ]
    },
    {
      cat: "Spill & emergency scenarios",
      domainColor: "regulatory",
      emoji: "⚖️",
      items: [
        {
          kw: "Oil spill response",
          q: "Worst-case spill volume? Is an OPEP / OSR plan current and exercised?",
          aspect: "Major hydrocarbon spill to sea / ground -- acute pollution event and ecosystem damage",
          area: "Emergency response",
          domainColor: "water",
          emoji: "💧",
          regulations: ["OPEC / Oil Pollution Emergency Plan", "Norwegian Environmental Liability Directive", "Spill response contingency planning"]
        },
        {
          kw: "Process upset",
          q: "Environmental consequence from loss of containment (LWC, blowout, riser leak)? Has QRA covered environmental receptors?",
          aspect: "Large-scale pollution from uncontrolled process release -- acute environmental emergency",
          area: "Process safety",
          domainColor: "regulatory",
          emoji: "⚖️",
          regulations: ["Seveso III Directive (2012/34/EU)", "OPEC framework", "Environmental liability assessments"]
        },
        {
          kw: "Groundwater protection",
          q: "Is there a groundwater monitoring programme (onshore)? What are the trigger levels for spill / leak response?",
          aspect: "Hydrocarbon contamination of groundwater -- chronic water quality degradation",
          area: "Facility integrity",
          domainColor: "water",
          emoji: "💧",
          regulations: ["EU Groundwater Directive (2006/118/EC)", "Norwegian Vannforskriften", "Monitoring and remediation standards"]
        }
      ]
    }
  ],
  D: [
    {
      cat: "Waste & hazardous material removal",
      domainColor: "waste",
      emoji: "♻️",
      items: [
        {
          kw: "Asbestos & legacy materials",
          q: "Has an asbestos register been completed? Is ACM removal scheduled before structural demolition? Licensed disposal route?",
          aspect: "Asbestos fibre release during decommissioning -- occupational and public health risk",
          area: "Decommissioning",
          domainColor: "chemicals",
          emoji: "⚗️",
          regulations: ["EU Asbestos Directive (1999/77/EC)", "Norwegian Arbeidsmiljøloven", "Asbestos Waste Disposal Regulations"]
        },
        {
          kw: "NORM",
          q: "NORM inventory in scale, sludge and equipment? Does it exceed the 1 Bq/g threshold requiring regulated disposal?",
          aspect: "NORM contamination of waste streams and site -- radioactive waste management and disposal",
          area: "Decommissioning",
          domainColor: "regulatory",
          emoji: "⚖️",
          regulations: ["EU Euratom Directive", "Norwegian Strålevernloven", "IAEA radioactive waste standards"]
        },
        {
          kw: "Subsea structure removal",
          q: "Jacket removal full or partial (OSPAR 98/3)? Seabed footprint of cut piles, mattresses and scour protection?",
          aspect: "Seabed disturbance and waste from structure removal -- benthic ecosystem disruption",
          area: "Offshore decommissioning",
          domainColor: "soil",
          emoji: "🏗️",
          regulations: ["OSPAR Decision 98/3", "EU Marine Strategy Framework Directive", "Decommissioning engineering standards"]
        },
        {
          kw: "Chemical flushing & pigging",
          q: "Chemicals remaining in pipelines / vessels? Flushing fluid composition, volume and disposal route?",
          aspect: "Hazardous flush waste from pipeline decommissioning -- waste generation and disposal burden",
          area: "Pipeline decommissioning",
          domainColor: "waste",
          emoji: "♻️",
          regulations: ["EU Waste Framework Directive (2008/98/EC)", "Norwegian Avfallsforskriften", "Hazardous waste classification"]
        }
      ]
    },
    {
      cat: "Site restoration",
      domainColor: "biodiversity",
      emoji: "🌿",
      items: [
        {
          kw: "Land contamination survey",
          q: "Has a Phase II site investigation been completed? What remediation standard is required?",
          aspect: "Residual land contamination -- soil and groundwater -- long-term human and environmental health risk",
          area: "Site remediation",
          domainColor: "soil",
          emoji: "🏗️",
          regulations: ["EU Environmental Liability Directive (2004/35/EC)", "Norwegian Forurensningsloven §8", "Contaminated land remediation standards"]
        },
        {
          kw: "Habitat reinstatement",
          q: "Post-decommissioning land use? Does it require ecological restoration to the pre-disturbance baseline or better?",
          aspect: "Failure to restore habitats to pre-disturbance condition -- biodiversity loss and ecosystem dysfunction",
          area: "Site reinstatement",
          domainColor: "biodiversity",
          emoji: "🌿",
          regulations: ["EU Habitats Directive (92/43/EEC)", "Norwegian Naturmangfoldsloven", "Habitat restoration standards"]
        },
        {
          kw: "Concrete demolition waste",
          q: "Volume of concrete from demolition? Can it be processed on-site for aggregate reuse (circular economy)?",
          aspect: "Demolition waste -- concrete, steel, mixed waste -- resource depletion and landfill burden",
          area: "Demolition",
          domainColor: "waste",
          emoji: "♻️",
          regulations: ["EU Waste Framework Directive (2008/98/EC)", "Norwegian Avfallsforskriften", "Construction waste targets"]
        }
      ]
    },
    {
      cat: "Emissions during decommissioning",
      domainColor: "energy",
      emoji: "⚡",
      items: [
        {
          kw: "Gas blowdown",
          q: "Gas held in system at cessation? Blowdown volume, composition and GHG equivalent?",
          aspect: "GHG release from system blowdown at cessation -- climate change contribution",
          area: "Decommissioning",
          domainColor: "energy",
          emoji: "⚡",
          regulations: ["EU ETS Directive (2003/87/EC)", "OGMP 2.0 reporting standard", "Carbon accounting standards"]
        },
        {
          kw: "Demolition dust",
          q: "Dust-generating demolition activities and nearest receptors? Is wet demolition or misting required?",
          aspect: "Dust from structure demolition -- PM10/PM2.5 -- air quality and human health impact",
          area: "Demolition",
          domainColor: "air",
          emoji: "💨",
          regulations: ["EU Ambient Air Quality Directive (2008/50/EC)", "Norwegian Forurensningsloven", "Demolition dust control standards"]
        },
        {
          kw: "Torch cutting / hot work",
          q: "Fume types from torch-cutting painted steelwork (lead, zinc, cadmium)? PPE and air monitoring required?",
          aspect: "Toxic fumes from hot work on coated structures -- occupational exposure and community air quality",
          area: "Demolition",
          domainColor: "chemicals",
          emoji: "⚗️",
          regulations: ["Occupational Safety & Health Directive (89/391/EEC)", "Norwegian Arbeidsmiljøloven", "Heavy metal exposure limits"]
        }
      ]
    }
  ]
};

export const GW_OPP = {
  E: [
    {
      cat: "Design for circularity",
      domainColor: "waste",
      emoji: "♻️",
      items: [
        {
          kw: "Modular / demountable design",
          q: "Can structural elements, modules or equipment be designed for disassembly and reuse at end of project life?",
          opp: "Circular economy -- design for disassembly and reuse at end-of-life",
          area: "Engineering design",
          domainColor: "waste",
          emoji: "♻️",
          regulations: ["EU Circular Economy Action Plan", "Norwegian Sirkulærøkonomistrategi"]
        },
        {
          kw: "Material efficiency at FEED",
          q: "Can material volumes be reduced through optimised structural design, shared infrastructure, or prefabrication?",
          opp: "Resource efficiency -- material reduction at source and optimised design",
          area: "Engineering design",
          domainColor: "waste",
          emoji: "♻️",
          regulations: ["EU Waste Framework Directive", "Norwegian Avfallsforskriften", "Lean design principles"]
        },
        {
          kw: "Renewable energy integration",
          q: "Is there scope to integrate solar, wind or waste-heat recovery into the facility design at FEED stage?",
          opp: "Low-carbon technology -- on-site renewable energy generation and carbon reduction",
          area: "Process design",
          domainColor: "energy",
          emoji: "⚡",
          regulations: ["EU Renewable Energy Directive (EU/2023/2001)", "Norwegian Energiloven", "Net-zero targets"]
        },
        {
          kw: "Heat recovery / WHR",
          q: "Are there process streams with significant waste heat that could be captured for power generation or heating?",
          opp: "Resource efficiency -- waste heat recovery and energy optimisation",
          area: "Process design",
          domainColor: "energy",
          emoji: "⚡",
          regulations: ["EU Energy Efficiency Directive", "Norwegian Energiforskriften"]
        }
      ]
    },
    {
      cat: "Nature & biodiversity by design",
      domainColor: "biodiversity",
      emoji: "🌿",
      items: [
        {
          kw: "Biodiversity net gain target",
          q: "Can the facility deliver measurable BNG -- green roofs, habitat corridors, artificial reefs?",
          opp: "Biodiversity net gain -- habitat creation or enhancement and species benefit",
          area: "Site design",
          domainColor: "biodiversity",
          emoji: "🌿",
          regulations: ["EU Habitats Directive", "Norwegian Naturmangfoldsloven", "CSRD ESRS E4 (Biodiversity)"]
        },
        {
          kw: "Nature-based drainage",
          q: "Can SuDS, wetlands or bioswales replace hard engineered drainage?",
          opp: "Nature-based solutions -- SuDS and natural flood management",
          area: "Drainage design",
          domainColor: "water",
          emoji: "💧",
          regulations: ["EU Water Framework Directive", "Norwegian Vannforskriften", "SuDS design standards"]
        },
        {
          kw: "TNFD / biodiversity disclosure",
          q: "Could biodiversity improvements be documented and reported under TNFD or EU CSRD ESRS E4?",
          opp: "Reputational / SLO -- biodiversity reporting and corporate disclosure",
          area: "Engineering design",
          domainColor: "stakeholder",
          emoji: "👥",
          regulations: ["TNFD Framework", "CSRD ESRS E4", "EU Biodiversity Strategy"]
        }
      ]
    },
    {
      cat: "Green finance & taxonomy",
      domainColor: "energy",
      emoji: "⚡",
      items: [
        {
          kw: "EU Taxonomy alignment at FEED",
          q: "Which activities in the design qualify as substantially contributing to climate mitigation under EU Taxonomy?",
          opp: "Green Finance & Taxonomy -- EU Taxonomy-aligned project elements",
          area: "Engineering design",
          domainColor: "energy",
          emoji: "⚡",
          regulations: ["EU Taxonomy Regulation (EU/2020/852)", "Delegated Acts", "Climate Delegated Act"]
        },
        {
          kw: "Green bonds / sustainability-linked finance",
          q: "Can project finance be structured as green bonds or SLLs linked to environmental KPI targets?",
          opp: "Green Finance & Taxonomy -- green bond or sustainability-linked loan",
          area: "Project finance",
          domainColor: "energy",
          emoji: "⚡",
          regulations: ["ICMA Green Bond Principles", "EU Taxonomy", "LSTA Sustainability-Linked Loan Principles"]
        }
      ]
    }
  ],
  P: [
    {
      cat: "Sustainable procurement",
      domainColor: "waste",
      emoji: "♻️",
      items: [
        {
          kw: "Low-carbon materials specification",
          q: "Can the procurement spec require EPDs and low-embodied-carbon materials (recycled steel, low-carbon concrete)?",
          opp: "Low-carbon technology -- low-embodied-carbon materials procurement",
          area: "Procurement",
          domainColor: "waste",
          emoji: "♻️",
          regulations: ["EU Environmental Product Declaration Regulation", "ISO 14025", "Carbon footprint standards"]
        },
        {
          kw: "Circular supplier requirements",
          q: "Can suppliers be required to take back packaging, surplus or end-of-life equipment?",
          opp: "Circular economy -- supplier take-back and packaging reduction",
          area: "Procurement",
          domainColor: "waste",
          emoji: "♻️",
          regulations: ["EU Circular Economy Action Plan", "Producer responsibility regulations"]
        }
      ]
    },
    {
      cat: "Supply chain emissions",
      domainColor: "air",
      emoji: "💨",
      items: [
        {
          kw: "Low-emission logistics",
          q: "Can low-emission transport (rail, LNG vessels, electric HGVs) be specified in logistics contracts?",
          opp: "Low-carbon technology -- low-emission transport in supply chain",
          area: "Logistics",
          domainColor: "energy",
          emoji: "⚡",
          regulations: ["EU Heavy-Duty Vehicle Emissions Regulation", "Zero-Emission Vehicle Directive", "CEFTA standards"]
        },
        {
          kw: "Local sourcing",
          q: "Can materials and services be sourced locally or regionally to reduce transport emissions and support local economy?",
          opp: "Resource efficiency -- local sourcing reduces transport GHG and supports community",
          area: "Procurement",
          domainColor: "waste",
          emoji: "♻️",
          regulations: ["EU Circular Economy principles", "Local procurement standards"]
        }
      ]
    }
  ],
  C: [
    {
      cat: "Waste minimisation & circular economy",
      domainColor: "waste",
      emoji: "♻️",
      items: [
        {
          kw: "On-site concrete recycling",
          q: "Can demolished or surplus concrete be crushed and reused as recycled aggregate on-site?",
          opp: "Circular economy -- on-site concrete aggregate recycling and waste reduction",
          area: "Demolition / civil works",
          domainColor: "waste",
          emoji: "♻️",
          regulations: ["EU Waste Framework Directive", "Norwegian Avfallsforskriften", "Construction waste targets"]
        },
        {
          kw: "Construction waste exchange",
          q: "Can surplus materials (timber, steel offcuts, cabling) be offered to a materials exchange or social enterprise?",
          opp: "Circular economy -- materials exchange / reuse of surplus and waste prevention",
          area: "Construction compound",
          domainColor: "waste",
          emoji: "♻️",
          regulations: ["EU Waste Framework Directive Hierarchy", "WRAP Waste and Resources Action Programme"]
        }
      ]
    },
    {
      cat: "Ecology enhancement",
      domainColor: "biodiversity",
      emoji: "🌿",
      items: [
        {
          kw: "Habitat creation during construction",
          q: "Can topsoil be stored and reused, and habitat features be created as part of the construction scope?",
          opp: "Biodiversity net gain -- habitat creation during construction and species benefit",
          area: "Site preparation",
          domainColor: "biodiversity",
          emoji: "🌿",
          regulations: ["EU Habitats Directive", "Norwegian Naturmangfoldsloven", "BNG standards"]
        },
        {
          kw: "Invasive species eradication",
          q: "Can clearance works provide an opportunity to permanently remove invasive plant species from the site?",
          opp: "Biodiversity net gain -- invasive species eradication and ecosystem restoration",
          area: "Site preparation",
          domainColor: "biodiversity",
          emoji: "🌿",
          regulations: ["EU Invasive Alien Species Regulation", "Norwegian Naturmangfoldsloven"]
        }
      ]
    },
    {
      cat: "Low-carbon construction",
      domainColor: "energy",
      emoji: "⚡",
      items: [
        {
          kw: "Stage V / zero-emission plant",
          q: "Can the construction plant fleet be specified as Stage V diesel or battery / hydrogen electric?",
          opp: "Low-carbon technology -- zero-emission construction plant and air quality improvement",
          area: "Construction plant",
          domainColor: "energy",
          emoji: "⚡",
          regulations: ["EU Non-Road Mobile Machinery Regulation", "Stage V engines", "Zero-emission standards"]
        },
        {
          kw: "Renewable site power",
          q: "Can solar panels, battery storage or grid connections replace diesel generators for site power?",
          opp: "Low-carbon technology -- renewable site power during construction and carbon reduction",
          area: "Construction compound",
          domainColor: "energy",
          emoji: "⚡",
          regulations: ["EU Renewable Energy Directive", "Grid connection standards"]
        }
      ]
    }
  ],
  I: [
    {
      cat: "Marine ecology enhancement",
      domainColor: "biodiversity",
      emoji: "🌿",
      items: [
        {
          kw: "Artificial reef / habitat",
          q: "Could jacket legs, scour protection or cable burial create habitat for fish, corals or invertebrates?",
          opp: "Biodiversity net gain -- artificial reef / marine habitat creation and species benefit",
          area: "Structure installation",
          domainColor: "biodiversity",
          emoji: "🌿",
          regulations: ["EU Marine Strategy Framework Directive", "OSPAR Convention", "Artificial reef guidelines"]
        },
        {
          kw: "Marine protected area benefit",
          q: "Could exclusion zones create de facto MPAs, benefiting fish stocks and biodiversity?",
          opp: "Nature-based solutions -- de facto MPA / marine reserve benefit to species",
          area: "Marine operations",
          domainColor: "biodiversity",
          emoji: "🌿",
          regulations: ["EU Habitats Directive", "OSPAR Convention", "MPA management guidance"]
        }
      ]
    },
    {
      cat: "Low-carbon vessel operations",
      domainColor: "energy",
      emoji: "⚡",
      items: [
        {
          kw: "Shore power / hybrid vessels",
          q: "Can installation vessels use shore power at port, hybrid propulsion or LNG / methanol fuel?",
          opp: "Low-carbon technology -- low-emission installation vessels and carbon reduction",
          area: "Vessel operations",
          domainColor: "energy",
          emoji: "⚡",
          regulations: ["IMO 2030/2050 GHG Strategy", "EU Alternative Fuels Directive", "LNG/methanol propulsion standards"]
        },
        {
          kw: "Voyage optimisation",
          q: "Can route planning, weather routing and slow steaming minimise fuel consumption across the campaign?",
          opp: "Resource efficiency -- fuel savings from voyage optimisation and GHG reduction",
          area: "Marine logistics",
          domainColor: "energy",
          emoji: "⚡",
          regulations: ["MARPOL Annex VI", "IMO Ship Energy Efficiency Regulations", "Fuel efficiency standards"]
        }
      ]
    },
    {
      cat: "Regulatory incentives",
      domainColor: "regulatory",
      emoji: "⚖️",
      items: [
        {
          kw: "Norwegian O&G environmental incentives",
          q: "Are there Norwegian government or Enova grant schemes available for low-carbon offshore installation?",
          opp: "Regulatory incentive -- Norwegian Enova / state grant for low-carbon operations",
          area: "Project finance",
          domainColor: "regulatory",
          emoji: "⚖️",
          regulations: ["Enova Scheme", "Norwegian Green Platform", "State climate funding"]
        }
      ]
    }
  ],
  C2: [
    {
      cat: "Chemical & water efficiency",
      domainColor: "water",
      emoji: "💧",
      items: [
        {
          kw: "Hydrotest water reuse",
          q: "Can hydrotest water be reused across multiple systems or treated and re-injected?",
          opp: "Resource efficiency -- hydrotest water recycling and water conservation",
          area: "Commissioning -- hydrotest",
          domainColor: "water",
          emoji: "💧",
          regulations: ["EU Water Framework Directive", "Water efficiency standards"]
        },
        {
          kw: "Chemical substitution",
          q: "Can less hazardous alternatives replace standard commissioning chemicals?",
          opp: "Resource efficiency -- hazardous chemical substitution and toxicity reduction",
          area: "Chemical management",
          domainColor: "chemicals",
          emoji: "⚗️",
          regulations: ["REACH Regulation", "Substitution principles", "Safer chemical guidelines"]
        }
      ]
    },
    {
      cat: "Flaring minimisation",
      domainColor: "energy",
      emoji: "⚡",
      items: [
        {
          kw: "Gas capture during start-up",
          q: "Can commissioning gas be captured for on-site power generation rather than flared?",
          opp: "Low-carbon technology -- gas capture instead of flaring and carbon reduction",
          area: "Commissioning -- flaring",
          domainColor: "energy",
          emoji: "⚡",
          regulations: ["EU ETS Directive", "OGMP 2.0 reporting", "Gas recovery standards"]
        },
        {
          kw: "Cold commissioning priority",
          q: "Can the commissioning sequence be optimised to maximise cold commissioning and minimise hot flaring volumes?",
          opp: "Resource efficiency -- reduced commissioning flare volumes and GHG reduction",
          area: "Commissioning sequence",
          domainColor: "energy",
          emoji: "⚡",
          regulations: ["Commissioning best practice", "Carbon accounting standards"]
        }
      ]
    }
  ],
  OM: [
    {
      cat: "Operational efficiency & carbon",
      domainColor: "energy",
      emoji: "⚡",
      items: [
        {
          kw: "Electrification of offshore",
          q: "Can gas turbines be replaced or supplemented by grid power or renewable energy to reduce operational emissions?",
          opp: "Low-carbon technology -- offshore electrification / power from shore and carbon reduction",
          area: "Power systems",
          domainColor: "energy",
          emoji: "⚡",
          regulations: ["EU Renewable Energy Directive", "Norwegian Climate Targets", "Net-zero strategies"]
        },
        {
          kw: "CCUS opportunity",
          q: "Is there scope to capture and store CO2 from process operations, contributing to Norwegian CCS targets?",
          opp: "Low-carbon technology -- carbon capture, utilisation and storage and climate action",
          area: "Process design",
          domainColor: "energy",
          emoji: "⚡",
          regulations: ["EU ETS Directive", "Norwegian CCUS Roadmap", "CCS storage standards"]
        },
        {
          kw: "Methane monetisation",
          q: "Can vented or flared methane be recovered and sold, generating revenue while reducing GHG emissions?",
          opp: "Resource efficiency -- methane recovery and monetisation and climate impact reduction",
          area: "Production operations",
          domainColor: "waste",
          emoji: "♻️",
          regulations: ["OGMP 2.0 Level 4/5", "Methane recovery standards"]
        },
        {
          kw: "Produced water as a resource",
          q: "Can treated produced water be beneficially reused for injection, dust suppression or other uses?",
          opp: "Circular economy -- produced water beneficial reuse and water conservation",
          area: "Water treatment",
          domainColor: "water",
          emoji: "💧",
          regulations: ["EU Water Framework Directive", "Circular economy principles"]
        }
      ]
    },
    {
      cat: "Sustainability reporting",
      domainColor: "stakeholder",
      emoji: "👥",
      items: [
        {
          kw: "CSRD / ESRS reporting",
          q: "Can environmental KPI data be structured to directly support CSRD ESRS E1-E5 mandatory disclosures?",
          opp: "Reputational / SLO -- CSRD / ESRS reporting-ready KPI framework and transparency",
          area: "Sustainability reporting",
          domainColor: "stakeholder",
          emoji: "👥",
          regulations: ["EU Corporate Sustainability Reporting Directive", "CSRD ESRS standards"]
        },
        {
          kw: "SBTi / net zero alignment",
          q: "Can emission reduction measures be aligned with Science Based Targets (SBTi) to support net-zero commitments?",
          opp: "Reputational / SLO -- SBTi / net-zero target alignment and climate credibility",
          area: "GHG management",
          domainColor: "energy",
          emoji: "⚡",
          regulations: ["SBTi Framework", "Net-zero commitments", "Climate change accountability"]
        }
      ]
    },
    {
      cat: "Climate resilience",
      domainColor: "energy",
      emoji: "⚡",
      items: [
        {
          kw: "Climate risk assessment",
          q: "Has a TCFD-aligned physical climate risk assessment been carried out for 2050+ scenarios?",
          opp: "Climate resilience -- physical climate risk adaptation measures and asset protection",
          area: "Asset integrity",
          domainColor: "regulatory",
          emoji: "⚖️",
          regulations: ["TCFD Framework", "Climate scenario analysis", "Physical climate risk assessment standards"]
        }
      ]
    }
  ],
  D: [
    {
      cat: "Materials recovery & circular economy",
      domainColor: "waste",
      emoji: "♻️",
      items: [
        {
          kw: "Steel recycling maximisation",
          q: "Can all removed steel be sent to high-grade recycling (EAF steelmaking) rather than lower-grade recovery?",
          opp: "Circular economy -- high-grade steel recycling from decommissioning and resource recovery",
          area: "Decommissioning",
          domainColor: "waste",
          emoji: "♻️",
          regulations: ["EU Waste Framework Directive", "Steel recycling standards", "Circular economy principles"]
        },
        {
          kw: "Equipment refurbishment / reuse",
          q: "Can equipment, instruments, valves or piping be refurbished and resold rather than scrapped?",
          opp: "Circular economy -- equipment reuse and refurbishment and waste prevention",
          area: "Decommissioning",
          domainColor: "waste",
          emoji: "♻️",
          regulations: ["EU Waste Framework Directive", "Product reuse standards"]
        },
        {
          kw: "Concrete aggregate recovery",
          q: "Can demolition concrete be processed for recycled aggregate rather than going to landfill?",
          opp: "Circular economy -- recycled aggregate from demolition concrete and resource recovery",
          area: "Demolition",
          domainColor: "waste",
          emoji: "♻️",
          regulations: ["EU Waste Framework Directive", "Construction waste targets"]
        }
      ]
    },
    {
      cat: "Habitat & legacy benefits",
      domainColor: "biodiversity",
      emoji: "🌿",
      items: [
        {
          kw: "Seabed recovery as positive legacy",
          q: "Can post-decommissioning seabed surveys document improved benthic communities as a net positive environmental legacy?",
          opp: "Biodiversity net gain -- documented seabed recovery as project legacy and environmental benefit",
          area: "Offshore decommissioning",
          domainColor: "biodiversity",
          emoji: "🌿",
          regulations: ["EU Marine Strategy Framework Directive", "OSPAR Convention", "Legacy assessment standards"]
        },
        {
          kw: "Land restoration to higher standard",
          q: "Can land reinstatement go beyond pre-disturbance baseline -- creating wetlands, meadows or community green space?",
          opp: "Biodiversity net gain -- land restored to higher ecological standard and community benefit",
          area: "Site reinstatement",
          domainColor: "biodiversity",
          emoji: "🌿",
          regulations: ["EU Habitats Directive", "Norwegian Naturmangfoldsloven", "BNG standards"]
        }
      ]
    },
    {
      cat: "Decommissioning finance",
      domainColor: "energy",
      emoji: "⚡",
      items: [
        {
          kw: "Green decommissioning certification",
          q: "Are there emerging certification schemes or green bond frameworks for responsible decommissioning?",
          opp: "Green Finance & Taxonomy -- green decommissioning certification / finance and sustainable finance",
          area: "Project finance",
          domainColor: "energy",
          emoji: "⚡",
          regulations: ["ICMA Green Bond Principles", "EU Taxonomy", "Emerging decommissioning standards"]
        }
      ]
    }
  ]
};
