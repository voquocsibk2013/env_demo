import { useState, useEffect } from "react";

// ── Constants ──────────────────────────────────────────────────────────────
const PHASES = ["Concept / FEED","Construction","Drilling","Operations","Maintenance","Decommissioning"];
const CONDITIONS = ["Normal","Abnormal","Emergency"];
const SENSITIVITIES = ["High","Medium","Low"];
const SCALES = ["Global","Regional","Local"];
const DURATIONS = ["Permanent (>10yr)","Long-term (1–10yr)","Temporary (<1yr)"];
const PROJ_TYPES = ["Offshore O&G","Onshore Infrastructure","Industrial / Process"];
const STATUSES = ["Open","In Progress","Controlled","Accepted","Closed"];
const OPP_TYPES = [
  "Resource Efficiency","Circular Economy","Low-Carbon Technology",
  "Nature-Based Solutions","Green Finance & Taxonomy","New Business / Market",
  "Reputational / SLO","Climate Resilience","Regulatory Incentive","Biodiversity Net Gain"
];
const OPP_STATUSES = ["Open","In Progress","Implemented","Partially implemented","Deferred","Not feasible"];
const STORAGE_KEY = "env-toolkit-v1";

// ── Scoring helpers ────────────────────────────────────────────────────────
function calcScore({ severity, probability, recSensitivity, scale, duration }) {
  if (!severity || !probability) return null;
  let s = severity * probability;
  if (recSensitivity === "High") s += 5;
  else if (recSensitivity === "Medium") s += 2;
  if (scale === "Global") s += 4;
  else if (scale === "Regional") s += 2;
  if (duration?.startsWith("Permanent")) s += 3;
  else if (duration?.startsWith("Long-term")) s += 1;
  return s;
}

function calcSig(a) {
  const score = calcScore(a);
  if (score === null) return null;
  if (a.legalThreshold === "Y" || a.stakeholderConcern === "Y" || score >= 12) return "SIGNIFICANT";
  if (score >= 8) return "WATCH";
  return "Low";
}

function calcOppScore(o) {
  return (o.envValue || 0) * (o.bizValue || 0) * (o.feasibility || 0);
}

// ── Blank templates ────────────────────────────────────────────────────────
const emptyAspect = () => ({
  phase: "", area: "", activity: "", aspect: "", condition: "Normal",
  impact: "", receptors: "", recSensitivity: "Medium", scale: "Local",
  severity: 3, probability: 3, duration: "Temporary (<1yr)",
  legalThreshold: "N", stakeholderConcern: "N",
  control: "", legalRef: "", owner: "", status: "Open"
});

const emptyOpp = () => ({
  type: "", aspectRef: "", materiality: "Both",
  description: "", envBenefit: "", bizBenefit: "",
  envValue: 2, bizValue: 2, feasibility: 2,
  action: "", alignment: "", owner: "", status: "Open"
});

// ── Styles ─────────────────────────────────────────────────────────────────
const iw = { width: "100%", boxSizing: "border-box" };

const colors = {
  green:  { bg: "#e8f5e9", text: "#1b5e20", strong: "#2e7d52", border: "#a5d6a7" },
  amber:  { bg: "#fff8e1", text: "#e65100", strong: "#f57f17", border: "#ffe082" },
  red:    { bg: "#ffebee", text: "#b71c1c", strong: "#c62828", border: "#ef9a9a" },
  purple: { bg: "#ede7f6", text: "#4527a0", strong: "#6a1b9a", border: "#ce93d8" },
  blue:   { bg: "#e3f2fd", text: "#0d47a1", strong: "#1565c0", border: "#90caf9" },
  teal:   { bg: "#e0f2f1", text: "#004d40", strong: "#00695c", border: "#80cbc4" },
};

function sigStyle(sig, sm) {
  const c = sig === "SIGNIFICANT" ? colors.red : sig === "WATCH" ? colors.amber : colors.green;
  return {
    fontSize: sm ? 10 : 11, padding: sm ? "1px 6px" : "2px 8px",
    borderRadius: 4, fontWeight: 600, display: "inline-block",
    background: c.bg, color: c.text
  };
}

function condStyle(c) {
  const col = c === "Emergency" ? colors.red : c === "Abnormal" ? colors.amber : colors.green;
  return { fontSize: 10, padding: "1px 6px", borderRadius: 4, fontWeight: 600,
           display: "inline-block", background: col.bg, color: col.text };
}

// ── Shared components ──────────────────────────────────────────────────────
function Fld({ label, children, wide, cols }) {
  return (
    <div style={wide ? { gridColumn: "span 2" } : cols ? { gridColumn: `span ${cols}` } : {}}>
      <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Card({ children, style }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 10, border: "1px solid #e8e8e8",
      padding: "1.25rem", ...style
    }}>{children}</div>
  );
}

function Btn({ children, onClick, variant = "default", size = "md", disabled }) {
  const variants = {
    default: { background: "transparent", color: "#333", border: "1px solid #d0d0d0" },
    primary: { background: colors.green.strong, color: "#fff", border: "none" },
    purple:  { background: colors.purple.strong, color: "#fff", border: "none" },
    danger:  { background: "transparent", color: colors.red.text, border: `1px solid ${colors.red.border}` },
    ghost:   { background: "transparent", color: "#555", border: "none" },
  };
  const sizes = {
    sm: { padding: "4px 10px", fontSize: 12 },
    md: { padding: "7px 16px", fontSize: 13 },
    lg: { padding: "9px 20px", fontSize: 14 },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        borderRadius: 8, cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "inherit", fontWeight: 500, opacity: disabled ? 0.5 : 1,
        transition: "opacity 0.15s",
        ...variants[variant], ...sizes[size]
      }}
    >{children}</button>
  );
}

// ── Aspect form ────────────────────────────────────────────────────────────
function AspectForm({ aspect, onSave, onCancel }) {
  const [f, setF] = useState({ ...emptyAspect(), ...aspect });
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const score = calcScore(f);
  const sig = calcSig(f);

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.25rem", paddingBottom: "1rem", borderBottom: "1px solid #eee" }}>
        <Btn onClick={onCancel}>← Back</Btn>
        <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>
          {aspect.id ? "Edit aspect" : "New aspect"}
        </h2>
        {aspect.ref && <span style={{ color: colors.green.strong, fontWeight: 600, fontSize: 13 }}>{aspect.ref}</span>}
      </div>

      <Card style={{ marginBottom: "1rem" }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: "#888", letterSpacing: "0.05em", margin: "0 0 14px", textTransform: "uppercase" }}>Activity details</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 16px" }}>
          <Fld label="Phase">
            <select value={f.phase} onChange={e => set("phase", e.target.value)} style={iw}>
              <option value="">Select phase</option>
              {PHASES.map(p => <option key={p}>{p}</option>)}
            </select>
          </Fld>
          <Fld label="Activity area">
            <input value={f.area} onChange={e => set("area", e.target.value)} placeholder="e.g. Earthworks" style={iw} />
          </Fld>
          <Fld label="Specific activity / aspect source" wide>
            <input value={f.activity} onChange={e => set("activity", e.target.value)} placeholder="e.g. Bulk excavation, cut and fill" style={iw} />
          </Fld>
          <Fld label="Environmental aspect" wide>
            <input value={f.aspect} onChange={e => set("aspect", e.target.value)} placeholder="e.g. Fugitive dust generation (PM10/PM2.5)" style={iw} />
          </Fld>
          <Fld label="Operating condition">
            <select value={f.condition} onChange={e => set("condition", e.target.value)} style={iw}>
              {CONDITIONS.map(c => <option key={c}>{c}</option>)}
            </select>
          </Fld>
          <Fld label="Receptor(s) affected">
            <input value={f.receptors} onChange={e => set("receptors", e.target.value)} placeholder="e.g. Air · Human health" style={iw} />
          </Fld>
          <Fld label="Potential environmental impact" wide>
            <textarea value={f.impact} onChange={e => set("impact", e.target.value)} rows={3} placeholder="Describe the potential impact on the receptor(s)..." style={{ ...iw, resize: "vertical" }} />
          </Fld>
        </div>
      </Card>

      <Card style={{ marginBottom: "1rem", background: "#fafffe", border: `1px solid ${colors.green.border}` }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: "#888", letterSpacing: "0.05em", margin: "0 0 14px", textTransform: "uppercase" }}>
          Significance scoring — (Severity × Probability) + receptor bonus + scale bonus + duration bonus
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px 14px", marginBottom: 12 }}>
          <Fld label="Receptor sensitivity">
            <select value={f.recSensitivity} onChange={e => set("recSensitivity", e.target.value)} style={iw}>
              {SENSITIVITIES.map(s => <option key={s}>{s}</option>)}
            </select>
          </Fld>
          <Fld label="Scale">
            <select value={f.scale} onChange={e => set("scale", e.target.value)} style={iw}>
              {SCALES.map(s => <option key={s}>{s}</option>)}
            </select>
          </Fld>
          <Fld label="Duration">
            <select value={f.duration} onChange={e => set("duration", e.target.value)} style={iw}>
              {DURATIONS.map(d => <option key={d}>{d}</option>)}
            </select>
          </Fld>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px 14px" }}>
          <Fld label="Severity (1–5)">
            <input type="number" min={1} max={5} value={f.severity} onChange={e => set("severity", Math.min(5, Math.max(1, +e.target.value || 1)))} style={iw} />
          </Fld>
          <Fld label="Probability (1–5)">
            <input type="number" min={1} max={5} value={f.probability} onChange={e => set("probability", Math.min(5, Math.max(1, +e.target.value || 1)))} style={iw} />
          </Fld>
          <Fld label="Legal threshold">
            <select value={f.legalThreshold} onChange={e => set("legalThreshold", e.target.value)} style={iw}>
              <option>N</option><option>Y</option>
            </select>
          </Fld>
          <Fld label="Stakeholder concern">
            <select value={f.stakeholderConcern} onChange={e => set("stakeholderConcern", e.target.value)} style={iw}>
              <option>N</option><option>Y</option>
            </select>
          </Fld>
        </div>
        {score !== null && (
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid #d0ede5", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, color: "#555" }}>Score: <strong style={{ fontSize: 18 }}>{score}</strong></span>
            <span style={sigStyle(sig)}>{sig}</span>
            {f.legalThreshold === "Y" && <span style={{ fontSize: 11, color: colors.amber.text, fontWeight: 500 }}>Auto-flagged: legal threshold</span>}
            {f.stakeholderConcern === "Y" && <span style={{ fontSize: 11, color: colors.amber.text, fontWeight: 500 }}>Auto-flagged: stakeholder concern</span>}
          </div>
        )}
      </Card>

      <Card style={{ marginBottom: "1.5rem" }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: "#888", letterSpacing: "0.05em", margin: "0 0 14px", textTransform: "uppercase" }}>Controls & management</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 16px" }}>
          <Fld label="Key control measure / mitigation" wide>
            <textarea value={f.control} onChange={e => set("control", e.target.value)} rows={3} placeholder="Primary control measures, monitoring and mitigation..." style={{ ...iw, resize: "vertical" }} />
          </Fld>
          <Fld label="Legal / regulatory reference" wide>
            <input value={f.legalRef} onChange={e => set("legalRef", e.target.value)} placeholder="e.g. Forurensningsloven §7 · OSPAR · WFD Art.4" style={iw} />
          </Fld>
          <Fld label="Owner / responsible">
            <input value={f.owner} onChange={e => set("owner", e.target.value)} placeholder="Name or role" style={iw} />
          </Fld>
          <Fld label="Status">
            <select value={f.status} onChange={e => set("status", e.target.value)} style={iw}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </Fld>
        </div>
      </Card>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <Btn onClick={onCancel}>Cancel</Btn>
        <Btn variant="primary" onClick={() => onSave(f)}>
          {aspect.id ? "Save changes" : "Add to register"}
        </Btn>
      </div>
    </div>
  );
}

// ── Opportunity form ───────────────────────────────────────────────────────
function OppForm({ opp, aspects, onSave, onCancel }) {
  const [f, setF] = useState({ ...emptyOpp(), ...opp });
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const score = calcOppScore(f);
  const sc = score >= 18 ? colors.teal : score >= 9 ? colors.green : score > 0 ? { bg: "#e8f5e9", text: "#555" } : { bg: "#f5f5f5", text: "#999" };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.25rem", paddingBottom: "1rem", borderBottom: "1px solid #eee" }}>
        <Btn onClick={onCancel}>← Back</Btn>
        <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>
          {opp.id ? "Edit opportunity" : "New opportunity"}
        </h2>
      </div>

      <Card style={{ marginBottom: "1rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 16px" }}>
          <Fld label="Opportunity type">
            <select value={f.type} onChange={e => set("type", e.target.value)} style={iw}>
              <option value="">Select type</option>
              {OPP_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </Fld>
          <Fld label="Linked aspect (optional)">
            <select value={f.aspectRef} onChange={e => set("aspectRef", e.target.value)} style={iw}>
              <option value="">None</option>
              {aspects.map(a => <option key={a.id} value={a.ref}>{a.ref} — {(a.aspect || "").slice(0, 40)}</option>)}
            </select>
          </Fld>
          <Fld label="Materiality (CSRD double materiality)" wide>
            <select value={f.materiality} onChange={e => set("materiality", e.target.value)} style={iw}>
              <option>Inside-out (positive impact on environment)</option>
              <option>Outside-in (financial / business benefit)</option>
              <option>Both</option>
            </select>
          </Fld>
          <Fld label="Opportunity description" wide>
            <textarea value={f.description} onChange={e => set("description", e.target.value)} rows={3} placeholder="What positive outcome is possible?" style={{ ...iw, resize: "vertical" }} />
          </Fld>
          <Fld label="Environmental benefit">
            <textarea value={f.envBenefit} onChange={e => set("envBenefit", e.target.value)} rows={2} placeholder="Positive impact on the environment..." style={{ ...iw, resize: "vertical" }} />
          </Fld>
          <Fld label="Business / strategic benefit">
            <textarea value={f.bizBenefit} onChange={e => set("bizBenefit", e.target.value)} rows={2} placeholder="Financial or strategic value to the business..." style={{ ...iw, resize: "vertical" }} />
          </Fld>
        </div>
      </Card>

      <Card style={{ marginBottom: "1rem", background: "#f9f7ff", border: `1px solid ${colors.purple.border}` }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: "#888", letterSpacing: "0.05em", margin: "0 0 14px", textTransform: "uppercase" }}>
          Priority score = environmental value × business value × feasibility (max 27)
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px 14px" }}>
          {[{ k: "envValue", l: "Environmental value (1–3)" }, { k: "bizValue", l: "Business value (1–3)" }, { k: "feasibility", l: "Feasibility (1–3)" }].map(({ k, l }) => (
            <Fld key={k} label={l}>
              <input type="number" min={1} max={3} value={f[k]} onChange={e => set(k, Math.min(3, Math.max(1, +e.target.value || 1)))} style={iw} />
            </Fld>
          ))}
        </div>
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${colors.purple.border}`, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 13, color: "#555" }}>Priority score:</span>
          <span style={{ fontSize: 20, fontWeight: 700, padding: "2px 14px", borderRadius: 6, background: sc.bg, color: sc.text }}>{score}</span>
          <span style={{ fontSize: 12, color: "#666" }}>
            {score >= 18 ? "High priority — act now" : score >= 9 ? "Medium priority" : "Low priority"}
          </span>
        </div>
      </Card>

      <Card style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 16px" }}>
          <Fld label="Key action / implementation route" wide>
            <textarea value={f.action} onChange={e => set("action", e.target.value)} rows={2} placeholder="How will you realise this opportunity?" style={{ ...iw, resize: "vertical" }} />
          </Fld>
          <Fld label="ESRS / framework alignment">
            <input value={f.alignment} onChange={e => set("alignment", e.target.value)} placeholder="e.g. ESRS E1 · EU Taxonomy · SBTi" style={iw} />
          </Fld>
          <Fld label="Owner">
            <input value={f.owner} onChange={e => set("owner", e.target.value)} placeholder="Name or role" style={iw} />
          </Fld>
          <Fld label="Status">
            <select value={f.status} onChange={e => set("status", e.target.value)} style={iw}>
              {OPP_STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </Fld>
        </div>
      </Card>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <Btn onClick={onCancel}>Cancel</Btn>
        <Btn variant="purple" onClick={() => onSave(f)}>
          {opp.id ? "Save changes" : "Add opportunity"}
        </Btn>
      </div>
    </div>
  );
}

// ── AI Suggest Panel ───────────────────────────────────────────────────────
function AIPanel({ project, onAdd }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  const fetch_ = async () => {
    if (!query.trim()) return;
    setLoading(true); setError(""); setResults([]);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1200,
          system: `You are an expert environmental consultant for Norwegian engineering projects (offshore O&G, onshore infrastructure, industrial/process). Return ONLY a valid JSON array — no markdown, no explanation, no preamble. Each object must have exactly these keys: phase (one of: ${PHASES.join(", ")}), area (activity area, max 60 chars), activity (specific activity, max 80 chars), aspect (the environmental aspect, max 80 chars), condition (Normal or Abnormal or Emergency), impact (potential environmental impact, max 120 chars), receptors (affected receptors, max 80 chars), recSensitivity (High or Medium or Low), scale (Global or Regional or Local), severity (integer 1-5), probability (integer 1-5), duration (one of: ${DURATIONS.join(", ")}), legalThreshold (Y or N), control (key control measure, max 120 chars), legalRef (relevant Norwegian/EU/international law, max 80 chars). Return 4–6 aspects covering Normal, Abnormal and Emergency conditions where relevant, applying Norwegian regulatory context (Forurensningsloven, Naturmangfoldloven, OSPAR, NORSOK) where applicable.`,
          messages: [{ role: "user", content: `Project type: ${project.type || "not specified"}. Phase: ${project.phase || "not specified"}. Scenario: ${query}` }]
        })
      });
      const d = await res.json();
      const text = (d.content?.[0]?.text || "").trim();
      const parsed = JSON.parse(text);
      setResults(Array.isArray(parsed) ? parsed : []);
    } catch {
      setError("Could not fetch suggestions — check your internet connection and try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{ background: colors.purple.bg, border: `1px solid ${colors.purple.border}`, borderRadius: 10, padding: "1rem", marginBottom: "1rem" }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: colors.purple.text, margin: "0 0 4px" }}>
        AI aspect suggestion
      </p>
      <p style={{ fontSize: 12, color: "#666", margin: "0 0 10px" }}>
        Describe a project activity or scenario — e.g. "diesel pile driving near a known coral reef during spring spawning season"
      </p>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && fetch_()}
          placeholder="Describe the activity or scenario..."
          style={{ flex: 1, boxSizing: "border-box" }}
        />
        <Btn variant="purple" onClick={fetch_} disabled={loading || !query.trim()}>
          {loading ? "Thinking..." : "Suggest →"}
        </Btn>
      </div>
      {error && <p style={{ color: colors.red.text, fontSize: 12, margin: "0 0 8px" }}>{error}</p>}
      {results.map((s, i) => {
        const sig = calcSig(s);
        return (
          <div key={i} style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 8, padding: "10px 12px", marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 4, alignItems: "center" }}>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{s.aspect}</span>
                <span style={condStyle(s.condition)}>{s.condition}</span>
                {sig && <span style={sigStyle(sig, true)}>{sig}</span>}
              </div>
              <p style={{ fontSize: 12, color: "#777", margin: "0 0 2px" }}>{s.phase}{s.area ? ` · ${s.area}` : ""}</p>
              <p style={{ fontSize: 12, color: "#555", margin: 0 }}>{s.impact}</p>
              {s.legalRef && <p style={{ fontSize: 11, color: "#888", margin: "4px 0 0" }}>{s.legalRef}</p>}
            </div>
            <Btn size="sm" variant="primary" onClick={() => { onAdd(s); setResults(p => p.filter(x => x !== s)); }}>
              Add
            </Btn>
          </div>
        );
      })}
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [project, setProject] = useState({ name: "", company: "", type: "", phase: "" });
  const [aspects, setAspects] = useState([]);
  const [opps, setOpps] = useState([]);
  const [editAspect, setEditAspect] = useState(null);
  const [editOpp, setEditOpp] = useState(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [sigFilter, setSigFilter] = useState("All");

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const d = JSON.parse(saved);
        if (d.project) setProject(d.project);
        if (d.aspects) setAspects(d.aspects);
        if (d.opps) setOpps(d.opps);
      }
    } catch {}
  }, []);

  // Save to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ project, aspects, opps }));
    } catch {}
  }, [project, aspects, opps]);

  const nextRef = (arr, pfx) => `${pfx}-${String(arr.length + 1).padStart(3, "0")}`;

  const saveAspect = (a) => {
    if (a.id) setAspects(p => p.map(x => x.id === a.id ? a : x));
    else setAspects(p => [...p, { ...a, id: Date.now().toString(), ref: nextRef(p, "ASP") }]);
    setEditAspect(null);
  };

  const saveOpp = (o) => {
    if (o.id) setOpps(p => p.map(x => x.id === o.id ? o : x));
    else setOpps(p => [...p, { ...o, id: Date.now().toString(), ref: nextRef(p, "OPP") }]);
    setEditOpp(null);
  };

  const sigCount = aspects.filter(a => calcSig(a) === "SIGNIFICANT").length;
  const watchCount = aspects.filter(a => calcSig(a) === "WATCH").length;
  const highOpps = opps.filter(o => calcOppScore(o) >= 18).length;
  const filtered = sigFilter === "All" ? aspects : aspects.filter(a => calcSig(a) === sigFilter);

  // Full-screen forms
  if (editAspect !== null) return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "1.5rem 1.25rem" }}>
      <AspectForm aspect={editAspect} onSave={saveAspect} onCancel={() => setEditAspect(null)} />
    </div>
  );
  if (editOpp !== null) return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "1.5rem 1.25rem" }}>
      <OppForm opp={editOpp} aspects={aspects} onSave={saveOpp} onCancel={() => setEditOpp(null)} />
    </div>
  );

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "1.5rem 1.25rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "1rem", marginBottom: "1.25rem", borderBottom: "1px solid #eee", flexWrap: "wrap", gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Environmental Aspects Toolkit</h1>
          <p style={{ fontSize: 12, color: "#888", margin: "2px 0 0" }}>
            {project.name || "No project set"}{project.company ? ` · ${project.company}` : ""}{project.type ? ` · ${project.type}` : ""}
          </p>
        </div>
        <nav style={{ display: "flex", gap: 4 }}>
          {["dashboard", "aspects", "opportunities"].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "7px 16px", fontSize: 13, borderRadius: 8, cursor: "pointer",
                fontFamily: "inherit", fontWeight: tab === t ? 600 : 400,
                border: tab === t ? `2px solid ${colors.green.strong}` : "1px solid #ddd",
                background: tab === t ? colors.green.bg : "transparent",
                color: tab === t ? colors.green.strong : "#444"
              }}
            >{t.charAt(0).toUpperCase() + t.slice(1)}</button>
          ))}
        </nav>
      </div>

      {/* DASHBOARD */}
      {tab === "dashboard" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: "1.5rem" }}>
            {[
              { label: "Total aspects", value: aspects.length },
              { label: "Significant", value: sigCount, c: colors.red },
              { label: "Watch", value: watchCount, c: colors.amber },
              { label: "Opportunities", value: opps.length, c: colors.purple },
              { label: "High priority opps", value: highOpps, c: colors.teal },
            ].map(({ label, value, c }) => (
              <div key={label} style={{ background: c ? c.bg : "#f5f5f5", borderRadius: 8, padding: "1rem", border: `1px solid ${c ? c.border : "#e0e0e0"}` }}>
                <p style={{ fontSize: 12, color: c ? c.text : "#666", margin: "0 0 4px" }}>{label}</p>
                <p style={{ fontSize: 28, fontWeight: 700, margin: 0, color: c ? c.strong : "#222" }}>{value}</p>
              </div>
            ))}
          </div>

          <Card style={{ marginBottom: "1rem" }}>
            <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 1rem" }}>Project details</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 16px" }}>
              {[{ k: "name", l: "Project name" }, { k: "company", l: "Company" }].map(({ k, l }) => (
                <div key={k}>
                  <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>{l}</label>
                  <input value={project[k]} onChange={e => setProject(p => ({ ...p, [k]: e.target.value }))} placeholder={l} style={iw} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Project type</label>
                <select value={project.type} onChange={e => setProject(p => ({ ...p, type: e.target.value }))} style={iw}>
                  <option value="">Select type</option>
                  {PROJ_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Current phase</label>
                <select value={project.phase} onChange={e => setProject(p => ({ ...p, phase: e.target.value }))} style={iw}>
                  <option value="">Select phase</option>
                  {PHASES.map(ph => <option key={ph}>{ph}</option>)}
                </select>
              </div>
            </div>
          </Card>

          {sigCount > 0 && (
            <div style={{ background: colors.red.bg, border: `1px solid ${colors.red.border}`, borderLeft: `4px solid ${colors.red.strong}`, borderRadius: "0 8px 8px 0", padding: "1rem", marginBottom: "1rem" }}>
              <p style={{ margin: "0 0 8px", fontWeight: 600, fontSize: 13, color: colors.red.text }}>Significant aspects requiring action ({sigCount})</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {aspects.filter(a => calcSig(a) === "SIGNIFICANT").map(a => (
                  <button key={a.id} onClick={() => { setEditAspect(a); }}
                    style={{ fontSize: 11, padding: "3px 10px", borderRadius: 4, background: "#fff", color: colors.red.text, border: `1px solid ${colors.red.border}`, cursor: "pointer", fontFamily: "inherit" }}>
                    {a.ref} — {(a.aspect || "").slice(0, 45)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {aspects.length === 0 && (
            <div style={{ textAlign: "center", padding: "2.5rem", background: "#f8f8f8", borderRadius: 10, color: "#888" }}>
              <p style={{ margin: "0 0 12px", fontSize: 14 }}>No aspects identified yet.</p>
              <Btn variant="primary" onClick={() => setTab("aspects")}>Go to Aspects →</Btn>
            </div>
          )}
        </div>
      )}

      {/* ASPECTS */}
      {tab === "aspects" && (
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: "1rem", alignItems: "center", flexWrap: "wrap" }}>
            <Btn variant="primary" onClick={() => setEditAspect(emptyAspect())}>+ Add aspect</Btn>
            <Btn
              variant={aiOpen ? "purple" : "default"}
              onClick={() => setAiOpen(v => !v)}
              style={{ border: `1px solid ${colors.purple.border}`, color: colors.purple.strong }}
            >✦ AI suggest</Btn>
            <div style={{ display: "flex", gap: 4, marginLeft: "auto", flexWrap: "wrap" }}>
              {["All", "SIGNIFICANT", "WATCH", "Low"].map(f => (
                <button key={f} onClick={() => setSigFilter(f)}
                  style={{
                    padding: "4px 10px", fontSize: 11, borderRadius: 6, cursor: "pointer", fontFamily: "inherit",
                    border: sigFilter === f ? `2px solid ${colors.green.strong}` : "1px solid #ddd",
                    background: sigFilter === f ? colors.green.bg : "transparent",
                    color: sigFilter === f ? colors.green.strong : "#666", fontWeight: sigFilter === f ? 600 : 400
                  }}>{f}</button>
              ))}
            </div>
          </div>

          {aiOpen && (
            <AIPanel
              project={project}
              onAdd={s => saveAspect({ ...emptyAspect(), ...s, stakeholderConcern: "N" })}
            />
          )}

          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", background: "#f8f8f8", borderRadius: 10, color: "#888" }}>
              {aspects.length === 0
                ? "No aspects yet. Add one manually or use AI suggest above."
                : `No aspects match the "${sigFilter}" filter.`}
            </div>
          ) : (
            <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid #e8e8e8" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#f5f5f5" }}>
                    {["Ref", "Phase", "Aspect", "Cond.", "Impact / Receptor", "Score", "Significance", "Status", ""].map(h => (
                      <th key={h} style={{ padding: "9px 10px", textAlign: "left", fontWeight: 600, fontSize: 11, color: "#777", borderBottom: "1px solid #e0e0e0", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a, i) => {
                    const score = calcScore(a);
                    const sig = calcSig(a);
                    return (
                      <tr key={a.id} style={{ borderBottom: "1px solid #f0f0f0", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                        <td style={{ padding: "9px 10px", fontWeight: 600, color: colors.green.strong, whiteSpace: "nowrap", fontSize: 12 }}>{a.ref}</td>
                        <td style={{ padding: "9px 10px", whiteSpace: "nowrap" }}>
                          <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 3, background: "#f0f0f0", color: "#555" }}>{a.phase || "—"}</span>
                        </td>
                        <td style={{ padding: "9px 10px", maxWidth: 180 }}>
                          <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 500 }} title={a.aspect}>{a.aspect || "—"}</div>
                          {a.area && <div style={{ fontSize: 11, color: "#888" }}>{a.area}</div>}
                        </td>
                        <td style={{ padding: "9px 10px" }}>
                          {a.condition && <span style={condStyle(a.condition)}>{a.condition}</span>}
                        </td>
                        <td style={{ padding: "9px 10px", maxWidth: 200 }}>
                          <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 12 }} title={a.impact}>{a.impact || "—"}</div>
                          {a.receptors && <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 11, color: "#888" }}>{a.receptors}</div>}
                        </td>
                        <td style={{ padding: "9px 10px", textAlign: "center", fontWeight: 700, fontSize: 14 }}>
                          {score ?? <span style={{ color: "#ccc" }}>—</span>}
                        </td>
                        <td style={{ padding: "9px 10px" }}>
                          {sig ? <span style={sigStyle(sig)}>{sig}</span> : <span style={{ color: "#ccc" }}>—</span>}
                        </td>
                        <td style={{ padding: "9px 10px" }}>
                          <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 3, background: "#f0f0f0", color: "#555" }}>{a.status}</span>
                        </td>
                        <td style={{ padding: "9px 10px", whiteSpace: "nowrap" }}>
                          <Btn size="sm" onClick={() => setEditAspect(a)}>Edit</Btn>
                          {" "}
                          <Btn size="sm" variant="danger" onClick={() => setAspects(p => p.filter(x => x.id !== a.id))}>×</Btn>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* OPPORTUNITIES */}
      {tab === "opportunities" && (
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: "1rem", alignItems: "center" }}>
            <Btn variant="purple" onClick={() => setEditOpp(emptyOpp())}>+ Add opportunity</Btn>
            <span style={{ marginLeft: "auto", fontSize: 12, color: "#888" }}>
              {opps.length} opportunit{opps.length !== 1 ? "ies" : "y"}
            </span>
          </div>

          {opps.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", background: "#f8f8f8", borderRadius: 10, color: "#888" }}>
              <p style={{ margin: "0 0 8px" }}>No opportunities tracked yet.</p>
              <p style={{ fontSize: 12, margin: 0, maxWidth: 400, marginInline: "auto" }}>
                ISO 14001:2015 Cl.6.1.2 requires identifying both risks and opportunities. Add one here for each significant aspect that has positive potential.
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {opps.map((o) => {
                const score = calcOppScore(o);
                const sc = score >= 18 ? colors.teal : score >= 9 ? colors.green : colors.purple;
                const matColor = o.materiality?.startsWith("Inside") ? colors.green : o.materiality?.startsWith("Outside") ? colors.blue : colors.purple;
                return (
                  <Card key={o.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6, alignItems: "center" }}>
                          <span style={{ fontWeight: 700, fontSize: 12, color: colors.purple.strong }}>{o.ref}</span>
                          {o.type && <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: colors.purple.bg, color: colors.purple.text, fontWeight: 600 }}>{o.type}</span>}
                          {o.aspectRef && <span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 4, background: colors.green.bg, color: colors.green.text }}>{o.aspectRef}</span>}
                          {score > 0 && <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, fontWeight: 600, background: sc.bg, color: sc.text }}>Score {score}</span>}
                          {o.materiality && <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: matColor.bg, color: matColor.text }}>{o.materiality.split(" (")[0]}</span>}
                        </div>
                        <p style={{ fontSize: 14, margin: "0 0 6px", fontWeight: 500 }}>{o.description || "(No description)"}</p>
                        {o.envBenefit && <p style={{ fontSize: 12, color: colors.green.text, margin: "0 0 2px" }}>Env: {o.envBenefit}</p>}
                        {o.bizBenefit && <p style={{ fontSize: 12, color: colors.blue.text, margin: "0 0 2px" }}>Business: {o.bizBenefit}</p>}
                        {o.action && <p style={{ fontSize: 12, color: "#777", margin: "4px 0 0" }}>Action: {o.action}</p>}
                      </div>
                      <div style={{ display: "flex", gap: 6, flexShrink: 0, alignItems: "flex-start", flexDirection: "column" }}>
                        <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 3, background: "#f0f0f0", color: "#555" }}>{o.status}</span>
                        <div style={{ display: "flex", gap: 4 }}>
                          <Btn size="sm" onClick={() => setEditOpp(o)}>Edit</Btn>
                          <Btn size="sm" variant="danger" onClick={() => setOpps(p => p.filter(x => x.id !== o.id))}>×</Btn>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
