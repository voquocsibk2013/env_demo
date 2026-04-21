/* eslint-disable */
// fpWorker.js — runs XLSX parsing and calculation off the main thread
// Receives:
//   { type: 'DETECT', buffer: ArrayBuffer, fileName: string }
//   { type: 'CALC',   buffer: ArrayBuffer, sheetMetas: [...] }
// Posts back:
//   { type: 'DETECT_DONE', sheetMetas: [...] }
//   { type: 'CALC_DONE',   result: {...} }
//   { type: 'PROGRESS',    pct: 0-100, label: string }
//   { type: 'ERROR',       message: string }

importScripts('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');

// ────── shared logic (duplicated from App.jsx — keep in sync) ──────────────
// ── COR Lookup ───────────────────────────────────────────────────────────────
const COR_LOOKUP = [
  {code:"BCA",cat:"Architect",desc:"Wall/Cladding",ef:13},{code:"BCB",cat:"Architect",desc:"Floor",ef:13},
  {code:"BCC",cat:"Architect",desc:"Roof",ef:13},{code:"BCD",cat:"Architect",desc:"Doors & windows",ef:13},
  {code:"BCE",cat:"Architect",desc:"Furniture & interior",ef:13},{code:"BCF",cat:"Architect",desc:"Signs",ef:13},
  {code:"BCG",cat:"Architect",desc:"Insulation",ef:13},{code:"BCH",cat:"Architect",desc:"Prefabricated modules",ef:13},
  {code:"BCZ",cat:"Architect",desc:"Other Architecture & Building Bulk",ef:13},
  {code:"BJA",cat:"Instrument",desc:"Instrument",ef:24},{code:"BJB",cat:"Instrument",desc:"Instrument valves",ef:7.2},
  {code:"BJCA",cat:"Instrument",desc:"Group 1 - Instrument Cables",ef:6.8},{code:"BJCB",cat:"Instrument",desc:"Group 2 - Instrument Cables",ef:6.8},
  {code:"BJCC",cat:"Instrument",desc:"Group 3 - Instrument Cables",ef:6.8},{code:"BJCD",cat:"Instrument",desc:"Group 4 - Instrument Cables",ef:6.8},
  {code:"BJCE",cat:"Instrument",desc:"Group 5 - Instrument Cables",ef:6.8},{code:"BJCF",cat:"Instrument",desc:"Group 6 - Instrument Cables",ef:6.8},
  {code:"BTCA",cat:"Instrument",desc:"Group 1 - Coaxial Cables",ef:6.8},{code:"BTCB",cat:"Instrument",desc:"Group 2 - CCTV Cables",ef:6.8},
  {code:"BTCC",cat:"Instrument",desc:"Group 3 - Optical Cables",ef:6.8},{code:"BTCD",cat:"Instrument",desc:"Group 4 - Comp. Data Cables",ef:6.8},
  {code:"BJD",cat:"Instrument",desc:"Instrument Junction boxes",ef:7.2},{code:"BTD",cat:"Instrument",desc:"Telecom Junction boxes",ef:7.2},
  {code:"BJTD",cat:"Instrument",desc:"Junction boxes",ef:7.2},{code:"Umbilicals",cat:"Instrument",desc:"Topside Umbilicals",ef:6.8},
  {code:"BJE",cat:"Instrument",desc:"Instrument tubes/Tubing",ef:7.2},{code:"BTA",cat:"Instrument",desc:"Telecom. Apparatus",ef:24},
  {code:"BJG",cat:"Instrument",desc:"Accessories",ef:7.2},{code:"BJZ",cat:"Instrument",desc:"Other instrument bulk",ef:7.2},
  {code:"BTZ",cat:"Instrument",desc:"Other telecom bulk",ef:7.2},{code:"BJTZ",cat:"Instrument",desc:"Other instrument/telecom bulk",ef:7.2},
  {code:"BEAA",cat:"Electro",desc:"Group 1 - Electric Cable",ef:6.8},{code:"BEAB",cat:"Electro",desc:"Group 2 - Electric Cable",ef:6.8},
  {code:"BEAC",cat:"Electro",desc:"Group 3 - Electric Cable",ef:6.8},{code:"BEAD",cat:"Electro",desc:"Group 4 - Electric Cable",ef:6.8},
  {code:"BEAE",cat:"Electro",desc:"Group 5 - Electric Cable",ef:6.8},{code:"BEAF",cat:"Electro",desc:"Group 6 - Heating cable",ef:6.8},
  {code:"BEAG",cat:"Electro",desc:"Group 7 - Heating cable",ef:6.8},{code:"BEB",cat:"Electro",desc:"Cable trays, conduit & suspension",ef:7.2},
  {code:"BEC",cat:"Electro",desc:"Lights",ef:18},{code:"BED",cat:"Electro",desc:"Junction boxes",ef:5.6},
  {code:"BEE",cat:"Electro",desc:"Accessories",ef:5.2},{code:"BEZ",cat:"Electro",desc:"Other electrical bulk",ef:5.2},
  {code:"BHB",cat:"HVAC",desc:"Inline items and dampers",ef:7.2},
  {code:"BMA_Struktur",cat:"Surface treatment",desc:"Structures",ef:6.6},{code:"BMA_Vegger",cat:"Surface treatment",desc:"Walls",ef:6.6},
  {code:"BMA_Tak",cat:"Surface treatment",desc:"Roof surfaces",ef:6.6},{code:"BMA_Dekksflater",cat:"Surface treatment",desc:"Deck surfaces",ef:6.6},
  {code:"BMA_Dorer",cat:"Surface treatment",desc:"Doors",ef:6.6},{code:"BMA_Ror_OD_4",cat:"Surface treatment",desc:"Pipes OD<4\"",ef:6.6},
  {code:"BMA_Ror_OD_4_OD_10",cat:"Surface treatment",desc:"Pipes 4\"<OD<10\"",ef:6.6},{code:"BMA_Ror_OD_10",cat:"Surface treatment",desc:"Pipes OD>10\"",ef:6.6},
  {code:"BMA_Utstyr",cat:"Surface treatment",desc:"Equipment",ef:6.6},{code:"BMA_Tanker_utvendig",cat:"Surface treatment",desc:"Outside tanks",ef:6.6},
  {code:"BMA_Tanker_invendig",cat:"Surface treatment",desc:"Inside tanks",ef:6.6},{code:"BMA_Kanaler",cat:"Surface treatment",desc:"Channels",ef:6.6},
  {code:"BMA_Isolerte_flater",cat:"Surface treatment",desc:"Isolated surfaces",ef:6.6},
  {code:"EJ",cat:"Instrument",desc:"Instrument",ef:24},{code:"EE",cat:"Electro",desc:"Electro",ef:34},
  {code:"EG",cat:"HVAC",desc:"HVAC",ef:7.2},{code:"ES",cat:"Safety",desc:"Safety",ef:7.2},
  {code:"EZ",cat:"Mechanical",desc:"In-line equipment",ef:7.2},{code:"EZR",cat:"Mechanical",desc:"Mechanical rotating",ef:7.2},
  {code:"BLA",cat:"Piping",desc:"Pipes, flanges & fittings",ef:3},{code:"BLB",cat:"Piping",desc:"Valves",ef:3},
  {code:"BLC",cat:"Piping",desc:"Supports",ef:3},{code:"BLD",cat:"Piping",desc:"Insulation (INS)",ef:3},
  {code:"BLZ",cat:"Piping",desc:"Other piping bulk",ef:3},{code:"BLD_Klasse_1",cat:"Insulation",desc:"Insulation class 1 - Heat conservation",ef:-1},
  {code:"BNAA",cat:"Structure",desc:"Primary Structures",ef:10},{code:"BNAB",cat:"Structure",desc:"Secondary Structures",ef:10},
  {code:"BNAC",cat:"Structure",desc:"Outfitting: Access platforms",ef:10},{code:"BNAD",cat:"Structure",desc:"Outfitting: Wall & Eq. support",ef:10},
  {code:"BNAE",cat:"Structure",desc:"Outfitting: Walkways",ef:10},{code:"BNAF",cat:"Structure",desc:"Outfitting: Monorails",ef:10},
  {code:"BNAG",cat:"Structure",desc:"Outfitting: Handrails",ef:10},{code:"BNAH",cat:"Structure",desc:"Outfitting: Sleeves",ef:10},
  {code:"BNAJ",cat:"Structure",desc:"Outfitting: Dropped object protection",ef:10},{code:"BNAK",cat:"Structure",desc:"Outfitting: Grating",ef:10},
  {code:"BNAL",cat:"Structure",desc:"Other Outfitting Structures",ef:10},{code:"BNC",cat:"Structure",desc:"Temporary installation aids",ef:10},
  {code:"BND",cat:"Structure",desc:"Grillage/seafastening/load out",ef:10},{code:"BNZ",cat:"Structure",desc:"Other structural bulk",ef:10},
  {code:"CS",cat:"Material",desc:"Carbon Steel",ef:10},{code:"SS",cat:"Material",desc:"Stainless Steel",ef:10},
  {code:"AL",cat:"Material",desc:"Aluminium",ef:10},{code:"GRP",cat:"Material",desc:"Glassfiber reinforced plastics",ef:10},
];
const COR_MAP = {};
COR_LOOKUP.forEach(r => { COR_MAP[r.code] = r; });

// ── Column-mapping schema ─────────────────────────────────────────────────────
// Each field lists aliases in descending priority. The engine tries:
//   1. exact normalised match
//   2. header contains alias OR alias contains header
//   3. shared word count >= 2
// If confidence is low the user is prompted to try AI mapping.
const FIELD_SCHEMAS = {
  MTO: {
    desc:   { label: "Item Description",    req: true,
              aliases: ["weight item descr","item description","description","item desc",
                        "tag description","component description","item name","descr",
                        "component","name","short description"] },
    mat:    { label: "Material",            req: false,
              aliases: ["material","material type","mat","material code","material grade",
                        "alloy","spec","specification","material spec"] },
    cor:    { label: "COR Code",            req: true,
              aliases: ["cost code cor","cor code","cor","costcode","cost code",
                        "commodity code","discipline code","material group","wbs code",
                        "account code","budget code","class code"] },
    mhc:    { label: "Handling Code",       req: true,
              aliases: ["mod. handl. code","module handling code","modular handling code",
                        "handling code","mhc","mod handling","modular handling",
                        "module code","handl code","mod handl","installation code"] },
    weight: { label: "Gross Dry Weight (kg)", req: true,
              aliases: ["gross dry weight (kg)","gross dry weight","gdw","dry weight (kg)",
                        "dry weight","gross weight (kg)","gross weight","weight (kg)",
                        "weight kg","net weight (kg)","net weight","wt (kg)","wt kg",
                        "weight","mass (kg)","mass","total weight","unit weight"] },
  },
  MEL: {
    desc:   { label: "Equipment Description", req: true,
              aliases: ["equipment type description","equipment type descr",
                        "equipment description","equip type desc","tag description",
                        "equipment name","description","equip desc","tag desc",
                        "name","item description","descr"] },
    cor:    { label: "COR Code",              req: true,
              aliases: ["cost code cor","cor code","cor","costcode","cost code",
                        "commodity code","discipline code","material group","wbs code",
                        "account code","class code"] },
    mhc:    { label: "Handling Code",         req: true,
              aliases: ["mod. handl. code","module handling code","modular handling code",
                        "handling code","mhc","mod handling","modular handling",
                        "module code","handl code","installation code"] },
    weight: { label: "Gross Dry Weight (kg)", req: true,
              aliases: ["gross dry weight (kg)","gross dry weight","gdw","dry weight (kg)",
                        "dry weight","gross weight (kg)","gross weight","weight (kg)",
                        "weight kg","net weight (kg)","net weight","wt (kg)","wt kg",
                        "weight","mass (kg)","mass","total weight"] },
  },
};

function normCol(s) {
  return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function bestColMatch(headers, aliases) {
  const nHeaders = headers.map(h => ({ orig: h, norm: normCol(h) }));
  const nAliases  = aliases.map(normCol);
  // 1. exact
  for (const { orig, norm } of nHeaders) {
    if (nAliases.includes(norm)) return orig;
  }
  // 2. substring
  for (const { orig, norm } of nHeaders) {
    for (const a of nAliases) {
      if (a.length > 2 && (norm.includes(a) || a.includes(norm))) return orig;
    }
  }
  // 3. word overlap >= 2 significant words
  for (const { orig, norm } of nHeaders) {
    const hw = new Set(norm.split(" ").filter(w => w.length > 2));
    for (const a of nAliases) {
      const aw = a.split(" ").filter(w => w.length > 2);
      if (aw.filter(w => hw.has(w)).length >= 2) return orig;
    }
  }
  return null;
}

function autoMapHeaders(headers, schemaType) {
  const schema  = FIELD_SCHEMAS[schemaType];
  const mapping = {};
  for (const [key, def] of Object.entries(schema)) {
    mapping[key] = bestColMatch(headers, def.aliases);
  }
  const reqFields   = Object.entries(schema).filter(([, d]) => d.req);
  const mappedReq   = reqFields.filter(([k]) => mapping[k]).length;
  const confidence  = reqFields.length > 0 ? mappedReq / reqFields.length : 0;
  return { mapping, confidence };
}

// Score a row on how likely it is to be a header row
function scoreHeaderRow(row) {
  const HEADER_KEYWORDS = [
    "description","descr","desc","name","type","item","tag","equip","component",
    "weight","wt","mass","kg","gdw","gross","dry",
    "code","cor","cost","commodity","class","account","wbs","group","discipline",
    "material","mat","alloy","spec",
    "handling","handl","mhc","module","mod","install",
    "qty","quantity","unit","no","number","ref","id",
  ];
  const cells = row.map(v => String(v == null ? "" : v).trim()).filter(Boolean);
  if (cells.length < 2) return 0;
  const textCells    = cells.filter(v => isNaN(Number(v)) || v.length > 8);
  const keywordHits  = cells.filter(v =>
    HEADER_KEYWORDS.some(kw => v.toLowerCase().includes(kw))
  ).length;
  return textCells.length * 1.5 + keywordHits * 4 + cells.length * 0.3;
}

function detectHeaderRow(rawRows) {
  // Scan first 25 rows, return index of most likely header row
  const scan = rawRows.slice(0, 25);
  let bestIdx = 0, bestScore = -1;
  scan.forEach((row, i) => {
    const score = scoreHeaderRow(row);
    if (score > bestScore) { bestScore = score; bestIdx = i; }
  });
  return bestIdx;
}

function parseSheetFromRow(rawRows, headerRowIdx) {
  // Given all rows and a chosen header row index, return { headers, sampleRows }
  const headerArr = (rawRows[headerRowIdx] || []).map(h => String(h == null ? "" : h).trim());
  // Deduplicate blank/repeated headers by appending index
  const headers = headerArr.map((h, i) => {
    if (!h) return "_col" + i;
    let name = h, count = 0;
    const base = h;
    while (headerArr.slice(0, i).includes(name)) { count++; name = base + "_" + count; }
    return name;
  }).filter(h => h !== "_col" + headerArr.indexOf(""));  // keep only non-empty originals

  // Re-derive headers preserving positions for all columns
  const finalHeaders = headerArr.map((h, i) => h || ("_col" + i));

  const sampleRows = rawRows.slice(headerRowIdx + 1, headerRowIdx + 9)
    .filter(row => row.some(v => v !== "" && v !== null && v !== undefined))
    .map(rowArr => {
      const obj = {};
      finalHeaders.forEach((h, i) => { obj[h] = rowArr[i]; });
      return obj;
    });
  return { headers: finalHeaders, sampleRows };
}

function detectSheets(wb) {
  const result = [];
  for (const name of wb.SheetNames) {
    const ws  = wb.Sheets[name];
    const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
    if (raw.length < 2) continue;

    const headerRowIdx = detectHeaderRow(raw);
    const { headers, sampleRows } = parseSheetFromRow(raw, headerRowIdx);
    const visibleHeaders = headers.filter(h => !h.startsWith("_col"));
    if (visibleHeaders.length < 2) continue;

    const mto = autoMapHeaders(visibleHeaders, "MTO");
    const mel = autoMapHeaders(visibleHeaders, "MEL");
    let type = "unknown", mapping = {}, confidence = 0;
    if (mto.confidence >= mel.confidence && mto.confidence > 0.4) {
      type = "MTO"; mapping = mto.mapping; confidence = mto.confidence;
    } else if (mel.confidence > 0.4) {
      type = "MEL"; mapping = mel.mapping; confidence = mel.confidence;
    } else if (mto.confidence > 0) {
      type = "MTO"; mapping = mto.mapping; confidence = mto.confidence;
    } else {
      type = "MTO"; mapping = mto.mapping; confidence = 0;  // show sheet anyway
    }

    // Store raw preview rows (first 20) so UI can let user pick header row
    const rawPreview = raw.slice(0, 20).map(row =>
      row.map(v => v === null || v === undefined ? "" : String(v))
    );

    result.push({ name, headers: visibleHeaders, sampleRows,
                  headerRowIdx, rawPreview,
                  type, mapping, confidence,
                  totalRows: Math.max(0, raw.length - 1 - headerRowIdx),
                  include: true });
  }
  return result;
}

async function aiMapSheet(sheetMeta) {
  const { name, headers, sampleRows } = sheetMeta;
  const corList = COR_LOOKUP.map(c => c.code + "(" + c.cat + ")").join(", ");
  const prompt =
    "Sheet name: \"" + name + "\"\n" +
    "Columns: " + JSON.stringify(headers) + "\n" +
    "Sample rows: " + JSON.stringify(sampleRows.slice(0, 3)) + "\n\n" +
    "Determine if this is MTO (Material Take-Off) or MEL (Equipment List). " +
    "Map columns to: desc (item/equip description), mat (material, MTO only), " +
    "cor (COR/cost code — values look like: " + corList.slice(0, 120) + "...), " +
    "mhc (module handling code), weight (gross dry weight in kg). " +
    "Return ONLY JSON: {\"type\":\"MTO\",\"mapping\":{\"desc\":\"ColName\",\"mat\":\"ColName\",\"cor\":\"ColName\",\"mhc\":\"ColName\",\"weight\":\"ColName\"}}. " +
    "Use null for not found. Use exact column names.";
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514", max_tokens: 400,
      system: "You are a data extraction expert. Return ONLY valid JSON, no markdown, no explanation.",
      messages: [{ role: "user", content: prompt }]
    })
  });
  const d   = await res.json();
  const txt = ((d.content && d.content[0] && d.content[0].text) || "")
    .replace(/```json|```/g, "").trim();
  return JSON.parse(txt);
}

// ── Calculation (works with any column mapping) ───────────────────────────────
function calcSheets(wb, sheetMetas) {
  const mtoRows = [], melRows = [];
  for (const sm of sheetMetas) {
    if (!sm.include || sm.type === "unknown") continue;
    const ws  = wb.Sheets[sm.name];
    const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
    if (raw.length < 2) continue;
    const hIdx = sm.headerRowIdx != null ? sm.headerRowIdx : detectHeaderRow(raw);
    const { headers } = parseSheetFromRow(raw, hIdx);
    raw.slice(hIdx + 1).forEach((rowArr, idx) => {
      const row = {};
      headers.forEach((h, j) => { row[h] = rowArr[j]; });
      const m = sm.mapping;
      const desc      = m.desc   ? String(row[m.desc]   || "") : "";
      const material  = m.mat    ? String(row[m.mat]    || "") : "";
      const cor       = m.cor    ? String(row[m.cor]    || "").trim() : "";
      const mhc       = m.mhc   ? String(row[m.mhc]    || "").trim() : "";
      const weightRaw = m.weight ? row[m.weight] : "";
      if (!desc || !desc.trim()) return; // skip rows with blank description
      // skip summary/total rows (bottom lines)
      const descL = desc.trim().toLowerCase();
      const SKIP_LABELS = ['total','subtotal','sub-total','grand total','bottom line','sum total','totalt','netto','brutto','net weight','gross weight total','sum'];
      if (SKIP_LABELS.some(p => descL === p || descL === p + ':' || descL === p + ' :') || descL.startsWith('bottom line') || (descL.startsWith('total ') && !descL.includes('valve') && !descL.includes('assembly'))) return;
      // Only calculate NP and RP handling codes — skip all others silently
      if (mhc !== "NP" && mhc !== "RP") return;
      const entry = { _sheet: sm.name, _row: idx + 2, _type: sm.type,
                      desc, material, cor, mhc, weightRaw };
      if (sm.type === "MTO") mtoRows.push(entry);
      else melRows.push(entry);
    });
  }

  function validateRows(rows) {
    const out = [], errs = [];
    for (const r of rows) {
      const rowErrs = [];
      if (!r.cor) {
        rowErrs.push({ col: "COR Code", val: r.cor, msg: "COR code is blank.", notFound: false });
      } else if (!COR_MAP[r.cor]) {
        rowErrs.push({ col: "COR Code", val: r.cor, msg: "COR code '" + r.cor + "' not in lookup.", notFound: true });
      }
      if (r.weightRaw === "" || r.weightRaw === null || r.weightRaw === undefined) {
        rowErrs.push({ col: "Weight", val: r.weightRaw, msg: "Weight is blank." });
      } else if (isNaN(Number(r.weightRaw))) {
        rowErrs.push({ col: "Weight", val: r.weightRaw, msg: "Weight '" + r.weightRaw + "' is not numeric." });
      }
      const corEntry = COR_MAP[r.cor];
      let emissionTco2e = null, emissionFactor = null, category = null, corDesc = null;
      if (!rowErrs.length && corEntry) {
        emissionFactor = corEntry.ef; category = corEntry.cat; corDesc = corEntry.desc;
        emissionTco2e = (Number(r.weightRaw) * emissionFactor) / 1000;
      }
      const row = { source: r._type, sheet: r._sheet, rowNum: r._row,
                    desc: r.desc, material: r.material, cor: r.cor, mhc: r.mhc,
                    weight: rowErrs.find(e => e.col === "Weight") ? null : Number(r.weightRaw),
                    category, corDesc, emissionFactor, emissionTco2e,
                    status: rowErrs.length ? "ERROR" : "VALID", errors: rowErrs };
      if (rowErrs.length) errs.push({ sheet: r._sheet, row: r._row, desc: r.desc, cor: r.cor, errs: rowErrs });
      out.push(row);
    }
    return { rows: out, errs };
  }

  const mto = validateRows(mtoRows);
  const mel = validateRows(melRows);
  const allRows   = [...mto.rows, ...mel.rows];
  const allErrors = [...mto.errs, ...mel.errs];
  const mtoTotal  = mto.rows.filter(r => r.status === "VALID").reduce((s, r) => s + (r.emissionTco2e || 0), 0);
  const melTotal  = mel.rows.filter(r => r.status === "VALID").reduce((s, r) => s + (r.emissionTco2e || 0), 0);
  const unknownCors = [...new Set(allErrors.flatMap(e => e.errs.filter(x => x.notFound).map(x => x.val)))].filter(Boolean);
  return {
    success: true,
    status: allErrors.length > 0 ? "completed_with_errors" : "success",
    mtoTotal, melTotal, combined: mtoTotal + melTotal,
    mtoRows: mto.rows, melRows: mel.rows, allRows,
    errors: allErrors, unknownCors,
    sheets: sheetMetas.filter(s => s.include),
  };
}

// ── Local COR suggestion (no API — pure keyword scoring) ──────────────────────
function localSuggestCOR(descTexts) {
  const text  = descTexts.filter(Boolean).join(" ").toLowerCase();
  const words = text.split(/[^a-z0-9]+/).filter(w => w.length > 2);
  // Domain keyword → likely COR codes (high-confidence boosts)
  const DOMAIN = [
    { kws:["valve","valv","kontrollventil"],             codes:["BJB","BLB","BHB"] },
    { kws:["pipe","piping","flange","fitting","rør"],    codes:["BLA"] },
    { kws:["cable","kabel","wiring"],                    codes:["BJCA","BEAA","BEAB"] },
    { kws:["struct","struktur","beam","column","stål"],  codes:["BNAA","BNAB"] },
    { kws:["platform","walkway","grating","handrail"],   codes:["BNAC","BNAE","BNAK","BNAG"] },
    { kws:["pump","kompressor","compressor","motor","turbo","compr"],codes:["EZR"] },
    { kws:["vessel","tank","exchanger","separator"],     codes:["EZ"] },
    { kws:["instrument","transmitter","sensor","gauge"], codes:["BJA"] },
    { kws:["junction","jbox","junction box"],            codes:["BJD","BED"] },
    { kws:["insulation","isolasjon"],                    codes:["BLD","BCG"] },
    { kws:["electric","elektro","light","lighting"],     codes:["BEAA","BEC"] },
    { kws:["cable tray","tray","conduit"],               codes:["BEB"] },
    { kws:["hvac","duct","damper","ventil"],             codes:["EG","BHB"] },
    { kws:["paint","coating","surface","maling"],        codes:["BMA_Struktur"] },
    { kws:["support","hanger","bracket"],                codes:["BLC"] },
    { kws:["steel","stainless","carbon"],                codes:["CS","SS"] },
    { kws:["telecom","tele","coax","optical","fibre"],   codes:["BTA","BTCA","BTCC"] },
    { kws:["safety","sikkerhet","fire","brann"],         codes:["ES"] },
    { kws:["scaffold","temporary","stillas"],            codes:["BNC"] },
  ];

  const scores = COR_LOOKUP.map(c => {
    const corText  = (c.code + " " + c.cat + " " + c.desc).toLowerCase();
    const corWords = corText.split(/[^a-z0-9]+/).filter(w => w.length > 2);
    let score = 0;
    // Word overlap
    words.forEach(w => {
      if (corWords.includes(w)) score += 4;
      else corWords.forEach(cw => {
        if (w.length > 3 && cw.length > 3 && (w.includes(cw) || cw.includes(w))) score += 1;
      });
    });
    // Domain keyword bonus
    DOMAIN.forEach(({ kws, codes }) => {
      if (codes.includes(c.code) && kws.some(kw => text.includes(kw))) score += 12;
    });
    return { code: c.code, category: c.cat, description: c.desc, ef: c.ef, score,
             reason: score > 0 ? "Keyword match against description and COR library" : "No strong match" };
  });

  return scores.sort((a, b) => b.score - a.score).slice(0, 3);
}

// ────── message handler ───────────────────────────────────────────────────────
self.onmessage = function(e) {
  const { type, buffer, sheetMetas, fileName } = e.data;
  try {
    if (type === 'DETECT') {
      self.postMessage({ type: 'PROGRESS', pct: 10, label: 'Reading workbook…' });
      const wb = XLSX.read(buffer, { type: 'array', dense: true });
      self.postMessage({ type: 'PROGRESS', pct: 40, label: 'Scanning sheets…' });
      const metas = detectSheets(wb);
      self.postMessage({ type: 'PROGRESS', pct: 90, label: 'Building preview…' });
      self.postMessage({ type: 'DETECT_DONE', sheetMetas: metas });

    } else if (type === 'CALC') {
      self.postMessage({ type: 'PROGRESS', pct: 10, label: 'Re-reading workbook…' });
      const wb = XLSX.read(buffer, { type: 'array', dense: true });
      self.postMessage({ type: 'PROGRESS', pct: 50, label: 'Calculating emissions…' });
      const result = calcSheets(wb, sheetMetas);
      self.postMessage({ type: 'PROGRESS', pct: 95, label: 'Done!' });
      self.postMessage({ type: 'CALC_DONE', result });
    }
  } catch (err) {
    self.postMessage({ type: 'ERROR', message: err.message });
  }
};
