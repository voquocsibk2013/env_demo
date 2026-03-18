import { useState, useEffect } from "react";
import { GW_RISK, GW_OPP } from "./data/guideWords";
import { DOMAIN_COLORS } from "./utils/colorSystem";
import { ScreeningGuideCard } from "./components/ScreeningGuideCard";
import { AspectTable } from "./components/AspectTable";
import { OpportunityTable } from "./components/OpportunityTable";
import { RiskMatrix } from "./components/RiskMatrix";
import { OpportunityMatrix } from "./components/OpportunityMatrix";
import { ContractsDashboard } from "./components/ContractsDashboard";
import HistoryTab from "./components/HistoryTab";
import {
  initializeVersioning,
  addSnapshot,
  rollbackToSnapshot,
  getCurrentState,
  saveVersioningToStorage,
  loadVersioningFromStorage
} from "./utils/versioningSystem";
import { exportProjectToExcel, exportMultipleProjectsToExcel } from "./utils/exporters/excelExport";

// ── Constants ────────────────────────────────────────────────────────────────
const PHASES = ["Concept / FEED","Construction","Drilling","Operations","Maintenance","Decommissioning","Commissioning"];
const CONDITIONS = ["Normal","Abnormal","Emergency"];
const SENSITIVITIES = ["High","Medium","Low"];
const SCALES = ["Global","Regional","Local"];
const DURATIONS = ["Permanent (>10yr)","Long-term (1-10yr)","Temporary (<1yr)"];
const PROJ_TYPES = ["Offshore O&G","Onshore Infrastructure","Industrial / Process"];
const STATUSES = ["Open","In Progress","Controlled","Accepted","Closed"];
const OPP_TYPES = ["Resource Efficiency","Circular Economy","Low-Carbon Technology","Nature-Based Solutions","Green Finance & Taxonomy","New Business / Market","Reputational / SLO","Climate Resilience","Regulatory Incentive","Biodiversity Net Gain"];
const OPP_STATUSES = ["Open","In Progress","Implemented","Partially implemented","Deferred","Not feasible"];
const STORAGE_KEY = "env-toolkit-v4";

// ── EPCIC stages ─────────────────────────────────────────────────────────────
const EPCIC_STAGES = [
  { code:"E",  label:"Engineering",             sub:"FEED & detail design" },
  { code:"P",  label:"Procurement",             sub:"Materials, chemicals, logistics" },
  { code:"C",  label:"Construction",            sub:"Civil, structural, mechanical" },
  { code:"I",  label:"Installation",            sub:"Offshore & marine operations" },
  { code:"C2", label:"Commissioning",           sub:"Pre-comm, start-up, first fill" },
  { code:"OM", label:"Operations & Maintenance",sub:"Beyond EPCIC" },
  { code:"D",  label:"Decommissioning",         sub:"Removal & reinstatement" },
];

const PHASE_MAP = { E:"Concept / FEED", P:"Construction", C:"Construction", I:"Operations", C2:"Commissioning", OM:"Operations", D:"Decommissioning" };
const COND_MAP  = { E:"Normal", P:"Normal", C:"Normal", I:"Normal", C2:"Abnormal", OM:"Normal", D:"Normal" };


// ── Color map (using DOMAIN_COLORS from colorSystem.js) ──────────────────────
// Map domain colors to CSS color objects for UI rendering
const COLOR_MAP = Object.fromEntries(
  Object.entries(DOMAIN_COLORS).map(([key, color]) => [
    key,
    { bg: color.bg, border: color.border, text: color.text, head: color.hex }
  ])
);

// Legacy color names mapping to domain colors for backwards compatibility
const LEGACY_COLOR_MAP = {
  teal:  "water",
  purple: "chemicals",
  amber: "energy",
  red:   "regulatory",
  green: "biodiversity",
  blue:  "water",
  gray:  "air",
};

// ── Scoring ──────────────────────────────────────────────────────────────────
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
function calcOppScore(o) { return (o.envValue || 0) * (o.bizValue || 0) * (o.feasibility || 0); }

// ── Blank templates ──────────────────────────────────────────────────────────
const emptyAspect = () => ({
  phase:"", area:"", activity:"", aspect:"", condition:"Normal",
  impact:"", receptors:"", recSensitivity:"Medium", scale:"Local",
  severity:3, probability:3, duration:"Temporary (<1yr)",
  legalThreshold:"N", stakeholderConcern:"N",
  control:"", legalRef:"", owner:"", status:"Open",
  domainColor:"air", emoji:"💨"
});
const emptyOpp = () => ({
  type:"", aspectRef:"", materiality:"Both",
  description:"", envBenefit:"", bizBenefit:"",
  envValue:2, bizValue:2, feasibility:2,
  action:"", alignment:"", owner:"", status:"Open",
  domainColor:"air", emoji:"💨"
});
const newProject = () => ({
  id: Date.now().toString(),
  name:"", company:"", type:"", phase:"",
  createdAt: new Date().toISOString(),
  aspects:[], opps:[]
});

// ── Styles ───────────────────────────────────────────────────────────────────
const iw = { width:"100%", boxSizing:"border-box" };
const CL = {
  green:"#2e7d52",   gBg:"#e8f5e9",   gBd:"#a5d6a7",
  red:  "#c62828",   rBg:"#ffebee",   rBd:"#ef9a9a",
  amber:"#f57f17",   aBg:"#fff8e1",   aBd:"#ffe082",
  purple:"#6a1b9a",  pBg:"#ede7f6",   pBd:"#ce93d8",
  blue: "#1565c0",   blueBg:"#e3f2fd",blueBd:"#90caf9",
  slate:"#37474f",   sBg:"#f5f5f5",   sBd:"#cfd8dc",
};

function sigStyle(sig) {
  const c = sig==="SIGNIFICANT" ? {bg:CL.rBg,c:CL.red} : sig==="WATCH" ? {bg:CL.aBg,c:CL.amber} : {bg:CL.gBg,c:CL.green};
  return { fontSize:11, padding:"2px 8px", borderRadius:4, fontWeight:600, display:"inline-block", background:c.bg, color:c.c };
}
function condStyle(cd) {
  const c = cd==="Emergency" ? {bg:CL.rBg,c:CL.red} : cd==="Abnormal" ? {bg:CL.aBg,c:CL.amber} : {bg:CL.gBg,c:CL.green};
  return { fontSize:10, padding:"1px 6px", borderRadius:4, fontWeight:600, display:"inline-block", background:c.bg, color:c.c };
}

// ── Shared UI ────────────────────────────────────────────────────────────────
function Fld({ label, children, wide }) {
  return (
    <div style={wide ? { gridColumn:"span 2" } : {}}>
      <label style={{ fontSize:12, color:"#666", display:"block", marginBottom:4 }}>{label}</label>
      {children}
    </div>
  );
}
function Card({ children, style }) {
  return <div style={{ background:"#fff", borderRadius:10, border:"1px solid #e8e8e8", padding:"1.25rem", ...style }}>{children}</div>;
}
function Btn({ children, onClick, variant="default", size="md", disabled }) {
  const v = {
    default:{ background:"transparent", color:"#333", border:"1px solid #d0d0d0" },
    primary:{ background:CL.green, color:"#fff", border:"none" },
    purple: { background:CL.purple, color:"#fff", border:"none" },
    danger: { background:"transparent", color:CL.red, border:"1px solid "+CL.rBd },
  }[variant];
  const s = { sm:{ padding:"4px 10px", fontSize:12 }, md:{ padding:"7px 16px", fontSize:13 }, lg:{ padding:"9px 20px", fontSize:14 } }[size];
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ borderRadius:8, cursor:disabled?"not-allowed":"pointer", fontFamily:"inherit", fontWeight:500, opacity:disabled?0.5:1, ...v, ...s }}>
      {children}
    </button>
  );
}

// ── Aspect form ──────────────────────────────────────────────────────────────
function AspectForm({ aspect, onSave, onCancel }) {
  const [f, setF] = useState({ ...emptyAspect(), ...aspect });
  const set = (k, v) => setF(p => ({ ...p, [k]:v }));
  const score = calcScore(f);
  const sig = calcSig(f);
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:"1.25rem", paddingBottom:"1rem", borderBottom:"1px solid #eee" }}>
        <Btn onClick={onCancel}>&#8592; Back</Btn>
        <h2 style={{ margin:0, fontSize:17, fontWeight:600 }}>{aspect.id ? "Edit aspect" : "New aspect"}</h2>
        {aspect.ref && <span style={{ color:CL.green, fontWeight:600, fontSize:13 }}>{aspect.ref}</span>}
      </div>
      <Card style={{ marginBottom:"1rem" }}>
        <p style={{ fontSize:11, fontWeight:600, color:"#aaa", letterSpacing:"0.05em", margin:"0 0 12px", textTransform:"uppercase" }}>Activity details</p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px 14px" }}>
          <Fld label="Phase"><select value={f.phase} onChange={e=>set("phase",e.target.value)} style={iw}><option value="">Select</option>{PHASES.map(p=><option key={p}>{p}</option>)}</select></Fld>
          <Fld label="Activity area"><input value={f.area} onChange={e=>set("area",e.target.value)} placeholder="e.g. Earthworks" style={iw}/></Fld>
          <Fld label="Specific activity" wide><input value={f.activity} onChange={e=>set("activity",e.target.value)} placeholder="Specific activity giving rise to the aspect" style={iw}/></Fld>
          <Fld label="Environmental aspect" wide><input value={f.aspect} onChange={e=>set("aspect",e.target.value)} placeholder="e.g. Fugitive dust generation (PM10/PM2.5)" style={iw}/></Fld>
          <Fld label="Condition"><select value={f.condition} onChange={e=>set("condition",e.target.value)} style={iw}>{CONDITIONS.map(c=><option key={c}>{c}</option>)}</select></Fld>
          <Fld label="Receptors affected"><input value={f.receptors} onChange={e=>set("receptors",e.target.value)} placeholder="e.g. Air, Human health, Ecology" style={iw}/></Fld>
          <Fld label="Potential environmental impact" wide><textarea value={f.impact} onChange={e=>set("impact",e.target.value)} rows={3} style={{ ...iw, resize:"vertical" }}/></Fld>
        </div>
      </Card>
      <Card style={{ marginBottom:"1rem", background:"#fafffe", border:"1px solid "+CL.gBd }}>
        <p style={{ fontSize:11, fontWeight:600, color:"#aaa", letterSpacing:"0.05em", margin:"0 0 12px", textTransform:"uppercase" }}>Significance scoring</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"10px 14px", marginBottom:10 }}>
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
          <div style={{ marginTop:12, paddingTop:10, borderTop:"1px solid "+CL.gBd, display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
            <span style={{ fontSize:13, color:"#555" }}>Score: <strong style={{ fontSize:18 }}>{score}</strong></span>
            <span style={sigStyle(sig)}>{sig}</span>
            {f.legalThreshold==="Y" && <span style={{ fontSize:11, color:CL.amber, fontWeight:500 }}>Auto-flagged: legal threshold</span>}
            {f.stakeholderConcern==="Y" && <span style={{ fontSize:11, color:CL.amber, fontWeight:500 }}>Auto-flagged: stakeholder concern</span>}
          </div>
        )}
      </Card>
      <Card style={{ marginBottom:"1rem" }}>
        <p style={{ fontSize:11, fontWeight:600, color:"#aaa", letterSpacing:"0.05em", margin:"0 0 12px", textTransform:"uppercase" }}>Controls & management</p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px 14px" }}>
          <Fld label="Key control measure" wide><textarea value={f.control} onChange={e=>set("control",e.target.value)} rows={3} style={{ ...iw, resize:"vertical" }}/></Fld>
          <Fld label="Legal / regulatory reference" wide><input value={f.legalRef} onChange={e=>set("legalRef",e.target.value)} placeholder="e.g. Forurensningsloven s.7, OSPAR" style={iw}/></Fld>
          <Fld label="Owner"><input value={f.owner} onChange={e=>set("owner",e.target.value)} placeholder="Name or role" style={iw}/></Fld>
          <Fld label="Status"><select value={f.status} onChange={e=>set("status",e.target.value)} style={iw}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select></Fld>
        </div>
      </Card>
      <div style={{ display:"flex", justifyContent:"flex-end", gap:8 }}>
        <Btn onClick={onCancel}>Cancel</Btn>
        <Btn variant="primary" onClick={()=>onSave(f)}>{aspect.id ? "Save changes" : "Add to register"}</Btn>
      </div>
    </div>
  );
}

// ── Opp form ─────────────────────────────────────────────────────────────────
function OppForm({ opp, aspects, onSave, onCancel }) {
  const [f, setF] = useState({ ...emptyOpp(), ...opp });
  const set = (k, v) => setF(p => ({ ...p, [k]:v }));
  const score = calcOppScore(f);
  const sc = score>=18 ? {bg:"#e0f2f1",c:"#00695c"} : score>=9 ? {bg:CL.gBg,c:CL.green} : {bg:"#f5f5f5",c:"#999"};
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:"1.25rem", paddingBottom:"1rem", borderBottom:"1px solid #eee" }}>
        <Btn onClick={onCancel}>&#8592; Back</Btn>
        <h2 style={{ margin:0, fontSize:17, fontWeight:600 }}>{opp.id ? "Edit opportunity" : "New opportunity"}</h2>
      </div>
      <Card style={{ marginBottom:"1rem" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px 14px" }}>
          <Fld label="Opportunity type"><select value={f.type} onChange={e=>set("type",e.target.value)} style={iw}><option value="">Select type</option>{OPP_TYPES.map(t=><option key={t}>{t}</option>)}</select></Fld>
          <Fld label="Linked aspect (optional)"><select value={f.aspectRef} onChange={e=>set("aspectRef",e.target.value)} style={iw}><option value="">None</option>{aspects.map(a=><option key={a.id} value={a.ref}>{a.ref} -- {(a.aspect||"").slice(0,40)}</option>)}</select></Fld>
          <Fld label="Materiality (CSRD)" wide><select value={f.materiality} onChange={e=>set("materiality",e.target.value)} style={iw}><option>Inside-out (positive impact on environment)</option><option>Outside-in (financial / business benefit)</option><option>Both</option></select></Fld>
          <Fld label="Opportunity description" wide><textarea value={f.description} onChange={e=>set("description",e.target.value)} rows={3} style={{ ...iw, resize:"vertical" }}/></Fld>
          <Fld label="Environmental benefit"><textarea value={f.envBenefit} onChange={e=>set("envBenefit",e.target.value)} rows={2} style={{ ...iw, resize:"vertical" }}/></Fld>
          <Fld label="Business / strategic benefit"><textarea value={f.bizBenefit} onChange={e=>set("bizBenefit",e.target.value)} rows={2} style={{ ...iw, resize:"vertical" }}/></Fld>
        </div>
      </Card>
      <Card style={{ marginBottom:"1rem", background:"#f9f7ff", border:"1px solid "+CL.pBd }}>
        <p style={{ fontSize:11, fontWeight:600, color:"#aaa", letterSpacing:"0.05em", margin:"0 0 12px", textTransform:"uppercase" }}>Priority score = env value x business value x feasibility (max 27)</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"10px 14px" }}>
          {[{k:"envValue",l:"Env value (1-3)"},{k:"bizValue",l:"Business value (1-3)"},{k:"feasibility",l:"Feasibility (1-3)"}].map(({ k, l }) => (
            <Fld key={k} label={l}><input type="number" min={1} max={3} value={f[k]} onChange={e=>set(k,Math.min(3,Math.max(1,+e.target.value||1)))} style={iw}/></Fld>
          ))}
        </div>
        <div style={{ marginTop:12, paddingTop:10, borderTop:"1px solid "+CL.pBd, display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:13, color:"#555" }}>Score:</span>
          <span style={{ fontSize:20, fontWeight:700, padding:"2px 14px", borderRadius:6, background:sc.bg, color:sc.c }}>{score}</span>
          <span style={{ fontSize:12, color:"#666" }}>{score>=18 ? "High priority -- act now" : score>=9 ? "Medium priority" : "Low priority"}</span>
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
        <Btn variant="purple" onClick={()=>onSave(f)}>{opp.id ? "Save changes" : "Add opportunity"}</Btn>
      </div>
    </div>
  );
}

// ── AI Suggest ───────────────────────────────────────────────────────────────
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
    } catch { setError("Could not fetch suggestions -- check your connection and try again."); }
    setLoading(false);
  };
  return (
    <div style={{ background:CL.pBg, border:"1px solid "+CL.pBd, borderRadius:10, padding:"1rem", marginBottom:"1rem" }}>
      <p style={{ fontSize:13, fontWeight:600, color:CL.purple, margin:"0 0 4px" }}>AI aspect suggestion</p>
      <p style={{ fontSize:12, color:"#666", margin:"0 0 10px" }}>Describe a project activity or scenario, e.g. "diesel pile driving near a coral reef during spring spawning season"</p>
      <div style={{ display:"flex", gap:8, marginBottom:8 }}>
        <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&run()} placeholder="Describe the activity or scenario..." style={{ flex:1, boxSizing:"border-box" }}/>
        <Btn variant="purple" onClick={run} disabled={loading||!query.trim()}>{loading ? "Thinking..." : "Suggest"}</Btn>
      </div>
      {error && <p style={{ color:CL.red, fontSize:12, margin:"0 0 8px" }}>{error}</p>}
      {results.map((s, i) => {
        const sig = calcSig(s);
        return (
          <div key={i} style={{ background:"#fff", border:"1px solid #e0e0e0", borderRadius:8, padding:"10px 12px", marginBottom:6, display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:4, alignItems:"center" }}>
                <span style={{ fontWeight:600, fontSize:13 }}>{s.aspect}</span>
                <span style={condStyle(s.condition)}>{s.condition}</span>
                {sig && <span style={sigStyle(sig)}>{sig}</span>}
              </div>
              <p style={{ fontSize:12, color:"#777", margin:"0 0 2px" }}>{s.phase}{s.area ? " -- "+s.area : ""}</p>
              <p style={{ fontSize:12, color:"#555", margin:0 }}>{s.impact}</p>
              {s.legalRef && <p style={{ fontSize:11, color:"#888", margin:"4px 0 0" }}>{s.legalRef}</p>}
            </div>
            <Btn size="sm" variant="primary" onClick={()=>{ onAdd(s); setResults(p=>p.filter(x=>x!==s)); }}>Add</Btn>
          </div>
        );
      })}
    </div>
  );
}

// ── Screening tab ────────────────────────────────────────────────────────────
function ScreeningTab({ project, onAddAspect, onAddOpp }) {
  const [mode, setMode]               = useState("risks");  // "risks" | "opps"
  const [activeStage, setActiveStage] = useState("E");
  const [expanded, setExpanded]       = useState({});
  const [view, setView]               = useState("guide");  // "guide" | "form"
  const [riskForm, setRiskForm]       = useState(emptyAspect());
  const [oppForm, setOppForm]         = useState(emptyOpp());
  const [toast, setToast]             = useState("");

  const toggleCat = k => setExpanded(p => ({ ...p, [k]:!p[k] }));
  const isRisks = mode === "risks";

  const prefillRisk = (code, item) => {
    setRiskForm({ ...emptyAspect(), phase:PHASE_MAP[code]||"", area:item.area||"", aspect:item.aspect||"", condition:COND_MAP[code]||"Normal" });
    setView("form");
  };
  const prefillOpp = (code, item) => {
    setOppForm({ ...emptyOpp(), description:item.opp||"" });
    setView("form");
  };

  const setRF = (k, v) => setRiskForm(p => ({ ...p, [k]:v }));
  const setOF = (k, v) => setOppForm(p => ({ ...p, [k]:v }));

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  const saveRisk = () => {
    if (!riskForm.aspect.trim()) return;
    onAddAspect(riskForm);
    setRiskForm(emptyAspect());
    setView("guide");
    showToast("Aspect saved to register");
  };
  const saveOpp = () => {
    if (!oppForm.description.trim()) return;
    onAddOpp(oppForm);
    setOppForm(emptyOpp());
    setView("guide");
    showToast("Opportunity saved to register");
  };

  const riskScore = calcScore(riskForm);
  const riskSig   = calcSig(riskForm);
  const oppScore  = calcOppScore(oppForm);
  const oppSc     = oppScore>=18 ? {bg:"#e0f2f1",c:"#00695c"} : oppScore>=9 ? {bg:CL.gBg,c:CL.green} : {bg:"#f5f5f5",c:"#999"};
  const guideData = isRisks ? (GW_RISK[activeStage]||[]) : (GW_OPP[activeStage]||[]);

  return (
    <div style={{ display:"flex", height:"calc(100vh - 120px)", minHeight:500 }}>
      {/* Stage sidebar */}
      <div style={{ width:190, flexShrink:0, borderRight:"1px solid #e8e8e8", background:"#fafafa", overflowY:"auto", padding:"0.75rem 0.5rem" }}>
        <p style={{ fontSize:10, fontWeight:600, color:"#bbb", letterSpacing:"0.07em", textTransform:"uppercase", margin:"0 0.5rem 8px" }}>EPCIC Stage</p>
        {EPCIC_STAGES.map(s => (
          <button key={s.code} onClick={() => { setActiveStage(s.code); setView("guide"); }}
            style={{ width:"100%", textAlign:"left", padding:"8px 10px", borderRadius:8, marginBottom:2, cursor:"pointer", fontFamily:"inherit",
              border: activeStage===s.code ? "1.5px solid "+CL.gBd : "1px solid transparent",
              background: activeStage===s.code ? "#fff" : "transparent" }}>
            <div style={{ fontSize:12, fontWeight:activeStage===s.code?600:400, color:activeStage===s.code?"#1a1a1a":"#555" }}>{s.label}</div>
            <div style={{ fontSize:10, color:"#aaa", marginTop:1 }}>{s.sub}</div>
          </button>
        ))}
      </div>

      {/* Main content */}
      <div style={{ flex:1, overflowY:"auto", padding:"1.25rem" }}>

        {/* Risks / Opportunities toggle */}
        <div style={{ display:"inline-flex", borderRadius:8, overflow:"hidden", border:"1px solid #e0e0e0", marginBottom:"1.25rem" }}>
          <button onClick={() => { setMode("risks"); setView("guide"); }}
            style={{ padding:"8px 22px", fontSize:13, cursor:"pointer", fontFamily:"inherit", fontWeight:isRisks?600:400, border:"none",
              background:isRisks?"#ffebee":"#fff", color:isRisks?CL.red:"#777",
              borderRight:"1px solid #e0e0e0" }}>
            Risks &amp; aspects
          </button>
          <button onClick={() => { setMode("opps"); setView("guide"); }}
            style={{ padding:"8px 22px", fontSize:13, cursor:"pointer", fontFamily:"inherit", fontWeight:!isRisks?600:400, border:"none",
              background:!isRisks?"#ede7f6":"#fff", color:!isRisks?CL.purple:"#777" }}>
            Opportunities
          </button>
        </div>

        {/* Toast */}
        {toast && (
          <div style={{ padding:"8px 14px", background:isRisks?CL.gBg:CL.pBg, border:"1px solid "+(isRisks?CL.gBd:CL.pBd), borderRadius:8, marginBottom:"1rem", fontSize:13, color:isRisks?CL.green:CL.purple, fontWeight:500 }}>
            {toast}
          </div>
        )}

        {/* Guide view */}
        {view === "guide" && (
          <div>
            <div style={{ marginBottom:"1rem", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
              <div>
                <h3 style={{ fontSize:15, fontWeight:600, margin:"0 0 2px", color:isRisks?CL.red:CL.purple }}>
                  {EPCIC_STAGES.find(s=>s.code===activeStage)?.label} -- {isRisks ? "risk guide words" : "opportunity guide words"}
                </h3>
                <p style={{ fontSize:12, color:"#888", margin:0 }}>
                  {isRisks ? "Ask these questions to identify environmental aspects and risks" : "Ask these questions to identify positive environmental opportunities"}
                </p>
              </div>
              <button onClick={() => setView("form")}
                style={{ padding:"6px 14px", fontSize:12, borderRadius:7, border:"none", background:isRisks?CL.red:CL.purple, color:"#fff", cursor:"pointer", fontFamily:"inherit", fontWeight:500 }}>
                + Blank form
              </button>
            </div>

            {guideData.length === 0 && (
              <div style={{ padding:"2rem", textAlign:"center", background:"#f8f8f8", borderRadius:10, color:"#aaa", fontSize:13 }}>
                No guide words for this stage yet.
              </div>
            )}

            {guideData.map(section => {
              const col = COLOR_MAP[section.domainColor] || COLOR_MAP.gray;
              const key = (isRisks?"R":"O") + activeStage + section.cat;
              const open = expanded[key] !== false;
              return (
                <div key={key} style={{ marginBottom:8, borderRadius:10, border:"1px solid "+col.border, overflow:"hidden" }}>
                  <button onClick={() => toggleCat(key)}
                    style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px", background:col.bg, border:"none", cursor:"pointer", fontFamily:"inherit" }}>
                    <span style={{ fontSize:13, fontWeight:600, color:col.head }}>{section.cat}</span>
                    <span style={{ fontSize:12, color:col.head, opacity:0.6 }}>{open ? "v" : ">"}</span>
                  </button>
                  {open && (
                    <div style={{ background:"#fff" }}>
                      {section.items.map((item, i) => (
                        <ScreeningGuideCard
                          key={i}
                          item={item}
                          stage={activeStage}
                          isRisks={isRisks}
                          onSave={isRisks ? saveRisk : saveOpp}
                          PHASE_MAP={PHASE_MAP}
                          COND_MAP={COND_MAP}
                          CONDITIONS={CONDITIONS}
                          PHASES={PHASES}
                          STATUSES={STATUSES}
                          OPP_TYPES={OPP_TYPES}
                          OPP_STATUSES={OPP_STATUSES}
                          emptyAspect={emptyAspect}
                          emptyOpp={emptyOpp}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Risk form */}
        {view === "form" && isRisks && (
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:"1rem" }}>
              <button onClick={() => setView("guide")} style={{ padding:"5px 12px", fontSize:12, borderRadius:7, border:"1px solid #ddd", background:"transparent", cursor:"pointer", fontFamily:"inherit" }}>Back</button>
              <h3 style={{ margin:0, fontSize:15, fontWeight:600, color:CL.red }}>Risk screening -- {EPCIC_STAGES.find(s=>s.code===activeStage)?.label}</h3>
            </div>
            <Card style={{ marginBottom:"1rem", borderLeft:"3px solid "+CL.red }}>
              <p style={{ fontSize:11, fontWeight:600, color:"#aaa", letterSpacing:"0.05em", margin:"0 0 12px", textTransform:"uppercase" }}>Activity details</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px 14px" }}>
                <Fld label="Phase"><select value={riskForm.phase} onChange={e=>setRF("phase",e.target.value)} style={iw}><option value="">Select</option>{PHASES.map(p=><option key={p}>{p}</option>)}</select></Fld>
                <Fld label="Activity area"><input value={riskForm.area} onChange={e=>setRF("area",e.target.value)} placeholder="e.g. Earthworks, Marine operations" style={iw}/></Fld>
                <Fld label="Specific activity" wide><input value={riskForm.activity} onChange={e=>setRF("activity",e.target.value)} placeholder="Specific activity giving rise to the aspect" style={iw}/></Fld>
                <Fld label="Environmental aspect" wide><input value={riskForm.aspect} onChange={e=>setRF("aspect",e.target.value)} placeholder="e.g. Fugitive dust generation from excavation" style={iw}/></Fld>
                <Fld label="Condition"><select value={riskForm.condition} onChange={e=>setRF("condition",e.target.value)} style={iw}>{CONDITIONS.map(c=><option key={c}>{c}</option>)}</select></Fld>
                <Fld label="Receptors affected"><input value={riskForm.receptors} onChange={e=>setRF("receptors",e.target.value)} placeholder="e.g. Air, Human health, Ecology" style={iw}/></Fld>
                <Fld label="Potential environmental impact" wide><textarea value={riskForm.impact} onChange={e=>setRF("impact",e.target.value)} rows={3} style={{ ...iw, resize:"vertical" }}/></Fld>
              </div>
            </Card>
            <Card style={{ marginBottom:"1rem", background:"#fafffe", border:"1px solid "+CL.gBd }}>
              <p style={{ fontSize:11, fontWeight:600, color:"#aaa", letterSpacing:"0.05em", margin:"0 0 12px", textTransform:"uppercase" }}>Significance scoring</p>
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
                <div style={{ marginTop:12, paddingTop:10, borderTop:"1px solid "+CL.gBd, display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                  <span style={{ fontSize:13, color:"#555" }}>Score: <strong style={{ fontSize:18 }}>{riskScore}</strong></span>
                  <span style={sigStyle(riskSig)}>{riskSig}</span>
                  {riskForm.legalThreshold==="Y" && <span style={{ fontSize:11, color:CL.amber, fontWeight:500 }}>Auto-flagged: legal threshold</span>}
                  {riskForm.stakeholderConcern==="Y" && <span style={{ fontSize:11, color:CL.amber, fontWeight:500 }}>Auto-flagged: stakeholder concern</span>}
                </div>
              )}
            </Card>
            <Card style={{ marginBottom:"1rem" }}>
              <p style={{ fontSize:11, fontWeight:600, color:"#aaa", letterSpacing:"0.05em", margin:"0 0 12px", textTransform:"uppercase" }}>Controls & management</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px 14px" }}>
                <Fld label="Key control measure" wide><textarea value={riskForm.control} onChange={e=>setRF("control",e.target.value)} rows={3} style={{ ...iw, resize:"vertical" }}/></Fld>
                <Fld label="Legal / regulatory reference" wide><input value={riskForm.legalRef} onChange={e=>setRF("legalRef",e.target.value)} placeholder="e.g. Forurensningsloven s.7, OSPAR" style={iw}/></Fld>
                <Fld label="Owner"><input value={riskForm.owner} onChange={e=>setRF("owner",e.target.value)} placeholder="Name or role" style={iw}/></Fld>
                <Fld label="Status"><select value={riskForm.status} onChange={e=>setRF("status",e.target.value)} style={iw}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select></Fld>
              </div>
            </Card>
            <div style={{ display:"flex", justifyContent:"flex-end", gap:8 }}>
              <Btn onClick={() => { setRiskForm(emptyAspect()); }}>Clear</Btn>
              <button onClick={saveRisk} disabled={!riskForm.aspect.trim()}
                style={{ padding:"7px 16px", borderRadius:8, border:"none", background:CL.red, color:"#fff", cursor:riskForm.aspect.trim()?"pointer":"not-allowed", fontSize:13, fontFamily:"inherit", fontWeight:500, opacity:riskForm.aspect.trim()?1:0.5 }}>
                Save to aspects register
              </button>
            </div>
          </div>
        )}

        {/* Opportunity form */}
        {view === "form" && !isRisks && (
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:"1rem" }}>
              <button onClick={() => setView("guide")} style={{ padding:"5px 12px", fontSize:12, borderRadius:7, border:"1px solid #ddd", background:"transparent", cursor:"pointer", fontFamily:"inherit" }}>Back</button>
              <h3 style={{ margin:0, fontSize:15, fontWeight:600, color:CL.purple }}>Opportunity screening -- {EPCIC_STAGES.find(s=>s.code===activeStage)?.label}</h3>
            </div>
            <Card style={{ marginBottom:"1rem", borderLeft:"3px solid "+CL.purple }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px 14px" }}>
                <Fld label="Opportunity type"><select value={oppForm.type} onChange={e=>setOF("type",e.target.value)} style={iw}><option value="">Select type</option>{OPP_TYPES.map(t=><option key={t}>{t}</option>)}</select></Fld>
                <Fld label="Linked aspect (optional)"><input value={oppForm.aspectRef} onChange={e=>setOF("aspectRef",e.target.value)} placeholder="e.g. ASP-001" style={iw}/></Fld>
                <Fld label="Materiality (CSRD)" wide><select value={oppForm.materiality} onChange={e=>setOF("materiality",e.target.value)} style={iw}><option>Inside-out (positive impact on environment)</option><option>Outside-in (financial / business benefit)</option><option>Both</option></select></Fld>
                <Fld label="Opportunity description" wide><textarea value={oppForm.description} onChange={e=>setOF("description",e.target.value)} rows={3} placeholder="What positive outcome is possible?" style={{ ...iw, resize:"vertical" }}/></Fld>
                <Fld label="Environmental benefit"><textarea value={oppForm.envBenefit} onChange={e=>setOF("envBenefit",e.target.value)} rows={2} style={{ ...iw, resize:"vertical" }}/></Fld>
                <Fld label="Business / strategic benefit"><textarea value={oppForm.bizBenefit} onChange={e=>setOF("bizBenefit",e.target.value)} rows={2} style={{ ...iw, resize:"vertical" }}/></Fld>
              </div>
            </Card>
            <Card style={{ marginBottom:"1rem", background:"#f9f7ff", border:"1px solid "+CL.pBd }}>
              <p style={{ fontSize:11, fontWeight:600, color:"#aaa", letterSpacing:"0.05em", margin:"0 0 12px", textTransform:"uppercase" }}>Priority score = env value x business value x feasibility (max 27)</p>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"10px 14px" }}>
                {[{k:"envValue",l:"Env value (1-3)"},{k:"bizValue",l:"Business value (1-3)"},{k:"feasibility",l:"Feasibility (1-3)"}].map(({ k, l }) => (
                  <Fld key={k} label={l}><input type="number" min={1} max={3} value={oppForm[k]} onChange={e=>setOF(k,Math.min(3,Math.max(1,+e.target.value||1)))} style={iw}/></Fld>
                ))}
              </div>
              <div style={{ marginTop:12, paddingTop:10, borderTop:"1px solid "+CL.pBd, display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:13, color:"#555" }}>Score:</span>
                <span style={{ fontSize:20, fontWeight:700, padding:"2px 14px", borderRadius:6, background:oppSc.bg, color:oppSc.c }}>{oppScore}</span>
                <span style={{ fontSize:12, color:"#666" }}>{oppScore>=18 ? "High priority -- act now" : oppScore>=9 ? "Medium priority" : "Low priority"}</span>
              </div>
            </Card>
            <Card style={{ marginBottom:"1rem" }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px 14px" }}>
                <Fld label="Key action / implementation route" wide><textarea value={oppForm.action} onChange={e=>setOF("action",e.target.value)} rows={2} style={{ ...iw, resize:"vertical" }}/></Fld>
                <Fld label="ESRS / framework alignment"><input value={oppForm.alignment} onChange={e=>setOF("alignment",e.target.value)} placeholder="e.g. ESRS E1, EU Taxonomy, SBTi" style={iw}/></Fld>
                <Fld label="Owner"><input value={oppForm.owner} onChange={e=>setOF("owner",e.target.value)} placeholder="Name or role" style={iw}/></Fld>
                <Fld label="Status"><select value={oppForm.status} onChange={e=>setOF("status",e.target.value)} style={iw}>{OPP_STATUSES.map(s=><option key={s}>{s}</option>)}</select></Fld>
              </div>
            </Card>
            <div style={{ display:"flex", justifyContent:"flex-end", gap:8 }}>
              <Btn onClick={() => { setOppForm(emptyOpp()); }}>Clear</Btn>
              <button onClick={saveOpp} disabled={!oppForm.description.trim()}
                style={{ padding:"7px 16px", borderRadius:8, border:"none", background:CL.purple, color:"#fff", cursor:oppForm.description.trim()?"pointer":"not-allowed", fontSize:13, fontFamily:"inherit", fontWeight:500, opacity:oppForm.description.trim()?1:0.5 }}>
                Save to opportunities register
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Project view ─────────────────────────────────────────────────────────────
function ProjectView({ project, onChange, onDelete }) {
  const [tab, setTab]                   = useState("dashboard");
  const [editAspect, setEditAspect]     = useState(null);
  const [editOpp, setEditOpp]           = useState(null);
  const [aiOpen, setAiOpen]             = useState(false);
  const [sigFilter, setSigFilter]       = useState("All");
  const [confirmDelete, setConfirmDelete] = useState(false);

  // ── Versioning system ─────────────────────────────────────────────────────────
  const [versioning, setVersioning] = useState(() => {
    const stored = loadVersioningFromStorage(project.id);
    if (stored) return stored;

    const projectState = { aspects: project.aspects || [], opportunities: project.opps || [] };
    return initializeVersioning(projectState);
  });

  const lastAutoSaveRef = useState(() => Date.now())[0];

  const aspects = project.aspects || [];
  const opps    = project.opps    || [];
  const nextRef = (arr, pfx) => pfx + "-" + String(arr.length + 1).padStart(3, "0");

  const saveAspect = a => {
    const updated = a.id ? aspects.map(x => x.id===a.id ? a : x) : [...aspects, { ...a, id:Date.now().toString(), ref:nextRef(aspects,"ASP") }];
    const updatedProject = { ...project, aspects:updated };
    onChange(updatedProject);

    // Create snapshot with change description
    const description = a.id ? `Modified aspect: ${a.aspect}` : `Added aspect: ${a.aspect}`;
    const newVersioning = addSnapshot(
      versioning,
      { aspects: updated, opportunities: opps },
      'manual',
      description
    );
    setVersioning(newVersioning);
    saveVersioningToStorage(project.id, newVersioning);

    setEditAspect(null);
  };
  const saveOpp = o => {
    const updated = o.id ? opps.map(x => x.id===o.id ? o : x) : [...opps, { ...o, id:Date.now().toString(), ref:nextRef(opps,"OPP") }];
    const updatedProject = { ...project, opps:updated };
    onChange(updatedProject);

    // Create snapshot with change description
    const description = o.id ? `Modified opportunity: ${o.description}` : `Added opportunity: ${o.description}`;
    const newVersioning = addSnapshot(
      versioning,
      { aspects, opportunities: updated },
      'manual',
      description
    );
    setVersioning(newVersioning);
    saveVersioningToStorage(project.id, newVersioning);

    setEditOpp(null);
  };

  const sigCount   = aspects.filter(a => calcSig(a)==="SIGNIFICANT").length;
  const watchCount = aspects.filter(a => calcSig(a)==="WATCH").length;
  const highOpps   = opps.filter(o => calcOppScore(o)>=18).length;
  const filtered   = sigFilter==="All" ? aspects : aspects.filter(a => calcSig(a)===sigFilter);

  if (editAspect !== null) return <div style={{ padding:"1.5rem 1.25rem" }}><AspectForm aspect={editAspect} onSave={saveAspect} onCancel={() => setEditAspect(null)}/></div>;
  if (editOpp    !== null) return <div style={{ padding:"1.5rem 1.25rem" }}><OppForm opp={editOpp} aspects={aspects} onSave={saveOpp} onCancel={() => setEditOpp(null)}/></div>;

  const TABS = ["dashboard","screening","aspects","opportunities","matrices","history","settings"];

  return (
    <div style={{ padding:"1.25rem" }}>
      {/* Tab bar */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.25rem", flexWrap:"wrap", gap:8 }}>
        <nav style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding:"6px 14px", fontSize:13, borderRadius:8, cursor:"pointer", fontFamily:"inherit", fontWeight:tab===t?600:400,
                border: tab===t ? "2px solid "+CL.green : "1px solid #ddd",
                background: tab===t ? CL.gBg : "transparent",
                color: tab===t ? CL.green : "#555" }}>
              {t === "screening" ? "Screening" : t === "history" ? "📋 History" : t.charAt(0).toUpperCase()+t.slice(1)}
            </button>
          ))}
        </nav>
        <div style={{ display:"flex", gap:6, alignItems:"center" }}>
          <button
            onClick={() => {
              const description = prompt("Describe this version (optional):");
              const newVersioning = addSnapshot(
                versioning,
                { aspects, opportunities: opps },
                'manual',
                description || 'Manual checkpoint'
              );
              setVersioning(newVersioning);
              saveVersioningToStorage(project.id, newVersioning);
              alert("Version saved! You now have " + newVersioning.snapshots.length + " versions.");
            }}
            title="Save a manual version (Ctrl+S)"
            style={{ padding:"4px 12px", fontSize:12, borderRadius:6, cursor:"pointer", fontFamily:"inherit",
              background:"#d4a574", color:"white", border:"none", fontWeight:500 }}>
            💾 Save Version
          </button>
          <button
            onClick={async () => {
              try {
                await exportProjectToExcel(project, calcSig, calcScore, calcOppScore);
              } catch (error) {
                alert("Export failed: " + error.message);
              }
            }}
            title="Export project to Excel"
            style={{ padding:"4px 12px", fontSize:12, borderRadius:6, cursor:"pointer", fontFamily:"inherit",
              background:"#4CAF50", color:"white", border:"none", fontWeight:500 }}>
            📊 Export Excel
          </button>
          {project.type  && <span style={{ fontSize:11, padding:"2px 8px", borderRadius:4, background:CL.sBg,    color:CL.slate }}>{project.type}</span>}
          {project.phase && <span style={{ fontSize:11, padding:"2px 8px", borderRadius:4, background:CL.blueBg, color:CL.blue  }}>{project.phase}</span>}
          <span style={{ fontSize:10, padding:"2px 6px", borderRadius:4, background:"#f0f0f0", color:"#666" }}>
            {versioning.snapshots.length} version{versioning.snapshots.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Dashboard */}
      {tab === "dashboard" && (
        <div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:10, marginBottom:"1.5rem" }}>
            {[
              { l:"Total aspects",   v:aspects.length, bg:CL.sBg,    c:CL.slate,  bd:CL.sBd },
              { l:"Significant",     v:sigCount,        bg:CL.rBg,    c:CL.red,    bd:CL.rBd },
              { l:"Watch",           v:watchCount,      bg:CL.aBg,    c:CL.amber,  bd:CL.aBd },
              { l:"Opportunities",   v:opps.length,     bg:CL.pBg,    c:CL.purple, bd:CL.pBd },
              { l:"High priority",   v:highOpps,        bg:"#e0f2f1", c:"#00695c", bd:"#80cbc4" },
            ].map(({ l, v, bg, c, bd }) => (
              <div key={l} style={{ background:bg, borderRadius:8, padding:"1rem", border:"1px solid "+bd }}>
                <p style={{ fontSize:12, color:c, margin:"0 0 4px" }}>{l}</p>
                <p style={{ fontSize:28, fontWeight:700, margin:0, color:c }}>{v}</p>
              </div>
            ))}
          </div>
          {sigCount > 0 && (
            <div style={{ background:CL.rBg, border:"1px solid "+CL.rBd, borderLeft:"4px solid "+CL.red, borderRadius:"0 8px 8px 0", padding:"1rem", marginBottom:"1rem" }}>
              <p style={{ margin:"0 0 8px", fontWeight:600, fontSize:13, color:CL.red }}>Significant aspects requiring action ({sigCount})</p>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                {aspects.filter(a => calcSig(a)==="SIGNIFICANT").map(a => (
                  <button key={a.id} onClick={() => setEditAspect(a)}
                    style={{ fontSize:11, padding:"3px 10px", borderRadius:4, background:"#fff", color:CL.red, border:"1px solid "+CL.rBd, cursor:"pointer", fontFamily:"inherit" }}>
                    {a.ref} -- {(a.aspect||"").slice(0,45)}
                  </button>
                ))}
              </div>
            </div>
          )}
          {aspects.length === 0 && (
            <div style={{ textAlign:"center", padding:"2.5rem", background:"#f8f8f8", borderRadius:10, color:"#aaa" }}>
              <p style={{ margin:"0 0 6px", fontSize:14 }}>No aspects identified yet.</p>
              <p style={{ margin:"0 0 16px", fontSize:12 }}>Use the Screening tab to identify aspects with guide words, or add one manually.</p>
              <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
                <Btn variant="primary" onClick={() => setTab("screening")}>Open Screening</Btn>
                <Btn onClick={() => setEditAspect(emptyAspect())}>+ Manual entry</Btn>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Screening */}
      {tab === "screening" && (
        <div style={{ margin:"-1.25rem" }}>
          <ScreeningTab project={project} onAddAspect={saveAspect} onAddOpp={saveOpp}/>
        </div>
      )}

      {/* Aspects */}
      {tab === "aspects" && (
        <div>
          <div style={{ display:"flex", gap:8, marginBottom:"1rem", alignItems:"center", flexWrap:"wrap" }}>
            <Btn variant="primary" onClick={() => setEditAspect(emptyAspect())}>+ Add aspect</Btn>
            <button onClick={() => setAiOpen(v => !v)}
              style={{ padding:"7px 16px", fontSize:13, borderRadius:8, cursor:"pointer", fontFamily:"inherit", fontWeight:500,
                border:"1px solid "+CL.pBd, background:aiOpen?CL.pBg:"transparent", color:CL.purple }}>
              AI suggest
            </button>
            <div style={{ display:"flex", gap:4, marginLeft:"auto" }}>
              {["All","SIGNIFICANT","WATCH","Low"].map(f => (
                <button key={f} onClick={() => setSigFilter(f)}
                  style={{ padding:"4px 10px", fontSize:11, borderRadius:6, cursor:"pointer", fontFamily:"inherit",
                    fontWeight:sigFilter===f?600:400,
                    border: sigFilter===f ? "2px solid "+CL.green : "1px solid #ddd",
                    background: sigFilter===f ? CL.gBg : "transparent",
                    color: sigFilter===f ? CL.green : "#666" }}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          {aiOpen && <AIPanel project={project} onAdd={s => saveAspect({ ...emptyAspect(), ...s, stakeholderConcern:"N" })}/>}
          {filtered.length === 0 ? (
            <div style={{ textAlign:"center", padding:"3rem", background:"#f8f8f8", borderRadius:10, color:"#aaa" }}>
              {aspects.length === 0 ? "No aspects yet. Use the Screening tab or add one manually." : "No aspects match \""+sigFilter+"\"."}
            </div>
          ) : (
            <AspectTable
              aspects={filtered}
              onEdit={setEditAspect}
              onDelete={(id) => onChange({ ...project, aspects:aspects.filter(x => x.id!==id) })}
              calcScore={calcScore}
              calcSig={calcSig}
              condStyle={condStyle}
              STATUSES={STATUSES}
              Btn={Btn}
            />
          )}
        </div>
      )}

      {/* Opportunities */}
      {tab === "opportunities" && (
        <div>
          <div style={{ display:"flex", gap:8, marginBottom:"1rem", alignItems:"center" }}>
            <Btn variant="purple" onClick={() => setEditOpp(emptyOpp())}>+ Add opportunity</Btn>
            <span style={{ marginLeft:"auto", fontSize:12, color:"#888" }}>{opps.length} opportunit{opps.length!==1?"ies":"y"}</span>
          </div>
          {opps.length === 0 ? (
            <div style={{ textAlign:"center", padding:"3rem", background:"#f8f8f8", borderRadius:10, color:"#aaa" }}>
              <p style={{ margin:"0 0 8px" }}>No opportunities tracked yet.</p>
              <p style={{ fontSize:12, margin:0, maxWidth:400, marginInline:"auto" }}>ISO 14001:2015 Cl.6.1.2 requires identifying both risks and opportunities.</p>
            </div>
          ) : (
            <OpportunityTable
              opportunities={opps}
              onEdit={setEditOpp}
              onDelete={(id) => onChange({ ...project, opps:opps.filter(x => x.id!==id) })}
              calcOppScore={calcOppScore}
              OPP_STATUSES={OPP_STATUSES}
              Btn={Btn}
            />
          )}
        </div>
      )}

      {/* Matrices */}
      {tab === "matrices" && (
        <div style={{ display: "grid", gap: "2rem" }}>
          <RiskMatrix aspects={aspects} calcSig={calcSig} calcScore={calcScore} />
          <OpportunityMatrix opportunities={opps} calcOppScore={calcOppScore} />
        </div>
      )}

      {/* History */}
      {tab === "history" && (
        <HistoryTab
          versioningSystem={versioning}
          onRollback={(snapshotIndex) => {
            const newVersioning = rollbackToSnapshot(versioning, snapshotIndex);
            const snapshotState = newVersioning.snapshots[snapshotIndex].state;

            // Create a new snapshot for the rollback action
            const rollbackVersioning = addSnapshot(
              newVersioning,
              snapshotState,
              'manual',
              `Rolled back to version v${versioning.snapshots.length - snapshotIndex}`
            );

            // Restore the project state
            onChange({
              ...project,
              aspects: snapshotState.aspects || [],
              opps: snapshotState.opportunities || []
            });

            setVersioning(rollbackVersioning);
            saveVersioningToStorage(project.id, rollbackVersioning);
          }}
        />
      )}

      {/* Settings */}
      {tab === "settings" && (
        <div>
          <Card style={{ marginBottom:"1rem" }}>
            <p style={{ fontSize:14, fontWeight:600, margin:"0 0 1rem" }}>Project details</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px 16px" }}>
              {[{k:"name",l:"Project name"},{k:"company",l:"Company"}].map(({ k, l }) => (
                <div key={k}>
                  <label style={{ fontSize:12, color:"#666", display:"block", marginBottom:4 }}>{l}</label>
                  <input value={project[k]||""} onChange={e => onChange({ ...project, [k]:e.target.value })} placeholder={l} style={iw}/>
                </div>
              ))}
              <div>
                <label style={{ fontSize:12, color:"#666", display:"block", marginBottom:4 }}>Project type</label>
                <select value={project.type||""} onChange={e => onChange({ ...project, type:e.target.value })} style={iw}>
                  <option value="">Select type</option>{PROJ_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize:12, color:"#666", display:"block", marginBottom:4 }}>Current phase</label>
                <select value={project.phase||""} onChange={e => onChange({ ...project, phase:e.target.value })} style={iw}>
                  <option value="">Select phase</option>{PHASES.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>
          </Card>
          <div style={{ padding:"1.25rem", borderRadius:10, background:CL.rBg, border:"1px solid "+CL.rBd }}>
            <p style={{ fontWeight:600, fontSize:14, color:CL.red, margin:"0 0 6px" }}>Danger zone</p>
            <p style={{ fontSize:13, color:"#666", margin:"0 0 12px" }}>Deleting this project permanently removes all its aspects and opportunities. This cannot be undone.</p>
            {!confirmDelete
              ? <Btn variant="danger" onClick={() => setConfirmDelete(true)}>Delete project</Btn>
              : (
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontSize:13, fontWeight:600, color:CL.red }}>Are you sure?</span>
                  <Btn variant="danger" onClick={onDelete}>Yes, delete permanently</Btn>
                  <Btn onClick={() => setConfirmDelete(false)}>Cancel</Btn>
                </div>
              )
            }
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ projects, activeId, onSelect, onNew }) {
  const isPortfolioActive = activeId === "portfolio";
  return (
    <div style={{ width:220, flexShrink:0, background:"#f9f9f9", borderRight:"1px solid #e8e8e8", display:"flex", flexDirection:"column", minHeight:"100vh" }}>
      <div style={{ padding:"1.25rem 1rem 0.75rem", borderBottom:"1px solid #e8e8e8" }}>
        <p style={{ fontSize:13, fontWeight:700, color:"#1a1a1a", margin:0 }}>Env Aspects Toolkit</p>
      </div>
      <div style={{ padding:"0.75rem 0.5rem", flex:1, overflowY:"auto" }}>
        {/* Portfolio view button */}
        <button onClick={() => onSelect("portfolio")}
          style={{ width:"100%", textAlign:"left", padding:"9px 10px", borderRadius:8, marginBottom:8, cursor:"pointer", fontFamily:"inherit",
            border: isPortfolioActive ? "1.5px solid "+CL.gBd : "1px solid transparent",
            background: isPortfolioActive ? "#fff" : "transparent",
            boxShadow: isPortfolioActive ? "0 1px 3px rgba(0,0,0,0.07)" : undefined }}>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ fontSize:18 }}>📊</span>
            <span style={{ fontSize:13, fontWeight:isPortfolioActive?600:400, color:isPortfolioActive?"#1a1a1a":"#555" }}>Portfolio</span>
          </div>
          <p style={{ fontSize:11, color:"#aaa", margin:"2px 0 0" }}>All projects</p>
        </button>

        <p style={{ fontSize:10, fontWeight:600, color:"#bbb", letterSpacing:"0.07em", textTransform:"uppercase", margin:"0.75rem 0.5rem 6px" }}>Projects ({projects.length})</p>
        {projects.length === 0 && <p style={{ fontSize:12, color:"#ccc", padding:"0 0.5rem", fontStyle:"italic" }}>No projects yet</p>}
        {projects.map(p => {
          const sigC    = (p.aspects||[]).filter(a => calcSig(a)==="SIGNIFICANT").length;
          const isActive = p.id === activeId;
          return (
            <button key={p.id} onClick={() => onSelect(p.id)}
              style={{ width:"100%", textAlign:"left", padding:"9px 10px", borderRadius:8, marginBottom:2, cursor:"pointer", fontFamily:"inherit",
                border: isActive ? "1.5px solid "+CL.gBd : "1px solid transparent",
                background: isActive ? "#fff" : "transparent",
                boxShadow: isActive ? "0 1px 3px rgba(0,0,0,0.07)" : undefined }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:6 }}>
                <span style={{ fontSize:13, fontWeight:isActive?600:400, color:isActive?"#1a1a1a":"#555", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  {p.name || <span style={{ color:"#ccc", fontStyle:"italic" }}>Unnamed project</span>}
                </span>
                {sigC > 0 && <span style={{ fontSize:10, fontWeight:700, padding:"1px 5px", borderRadius:3, background:CL.rBg, color:CL.red, flexShrink:0 }}>{sigC}</span>}
              </div>
              <p style={{ fontSize:11, color:"#aaa", margin:"2px 0 0", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {p.type||"No type set"} -- {(p.aspects||[]).length} aspects
              </p>
            </button>
          );
        })}
      </div>
      <div style={{ padding:"0.75rem", borderTop:"1px solid #e8e8e8" }}>
        <button onClick={onNew} style={{ width:"100%", padding:"8px", borderRadius:8, border:"1px dashed "+CL.gBd, background:"transparent", color:CL.green, fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"inherit" }}>
          + New project
        </button>
      </div>
    </div>
  );
}

// ── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [projects, setProjects] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loaded,   setLoaded]   = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const d = JSON.parse(saved);
        if (d.projects && d.projects.length) {
          setProjects(d.projects);
          setActiveId(d.activeId || d.projects[0].id);
        }
      }
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ projects, activeId })); } catch {}
  }, [projects, activeId, loaded]);

  const createProject = () => {
    const p = newProject();
    setProjects(prev => [...prev, p]);
    setActiveId(p.id);
  };

  const updateProject = updated => setProjects(prev => prev.map(p => p.id===updated.id ? updated : p));
  const deleteProject = id => {
    const remaining = projects.filter(p => p.id !== id);
    setProjects(remaining);
    setActiveId(remaining.length > 0 ? remaining[remaining.length-1].id : null);
  };

  if (!loaded) return <div style={{ padding:"2rem", fontSize:14, color:"#888" }}>Loading...</div>;

  const active = activeId === "portfolio" ? null : projects.find(p => p.id === activeId) || null;
  const isPortfolioView = activeId === "portfolio";

  return (
    <div style={{ display:"flex", minHeight:"100vh", fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", color:"#1a1a1a", background:"#fff" }}>
      <Sidebar projects={projects} activeId={activeId} onSelect={setActiveId} onNew={createProject}/>
      <div style={{ flex:1, overflowX:"hidden" }}>
        {isPortfolioView ? (
          <div style={{ padding:"2rem" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:"1.5rem" }}>
              <div>
                <h1 style={{ fontSize:24, fontWeight:600, margin:"0 0 0.5rem" }}>📊 Portfolio Dashboard</h1>
                <p style={{ fontSize:13, color:"#666", margin:0 }}>Consolidated view of all {projects.length} project{projects.length !== 1 ? 's' : ''}</p>
              </div>
              <button
                onClick={async () => {
                  try {
                    await exportMultipleProjectsToExcel(projects, calcSig, calcScore, calcOppScore);
                  } catch (error) {
                    alert("Export failed: " + error.message);
                  }
                }}
                title="Export portfolio to Excel"
                style={{ padding:"8px 16px", fontSize:13, borderRadius:6, cursor:"pointer", fontFamily:"inherit",
                  background:"#4CAF50", color:"white", border:"none", fontWeight:500 }}>
                📊 Export Portfolio
              </button>
            </div>
            <ContractsDashboard
              allProjects={projects}
              calcSig={calcSig}
              calcScore={calcScore}
              calcOppScore={calcOppScore}
            />
          </div>
        ) : !active ? (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"100vh", gap:16, padding:"2rem" }}>
            <p style={{ fontSize:36, margin:0 }}>🌿</p>
            <p style={{ fontSize:16, fontWeight:500, color:"#555", margin:0 }}>No project selected</p>
            <p style={{ fontSize:13, color:"#aaa", margin:0, textAlign:"center" }}>Create a new project to get started.</p>
            <button onClick={createProject} style={{ padding:"9px 20px", borderRadius:8, border:"none", background:CL.green, color:"#fff", fontSize:14, fontWeight:500, cursor:"pointer", fontFamily:"inherit", marginTop:4 }}>
              + New project
            </button>
          </div>
        ) : (
          <div>
            <div style={{ padding:"1.25rem 1.25rem 0.75rem", borderBottom:"1px solid #eee", display:"flex", alignItems:"baseline", gap:10 }}>
              <h1 style={{ fontSize:18, fontWeight:600, margin:0 }}>
                {active.name || <span style={{ color:"#bbb", fontStyle:"italic" }}>Unnamed project</span>}
              </h1>
              {active.company && <span style={{ fontSize:13, color:"#888" }}>{active.company}</span>}
            </div>
            <ProjectView key={active.id} project={active} onChange={updateProject} onDelete={() => deleteProject(active.id)}/>
          </div>
        )}
      </div>
    </div>
  );
}
