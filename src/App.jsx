import { useState, useEffect } from "react";

const PHASES = ["Concept / FEED","Construction","Drilling","Operations","Maintenance","Decommissioning"];
const CONDITIONS = ["Normal","Abnormal","Emergency"];
const SENSITIVITIES = ["High","Medium","Low"];
const SCALES = ["Global","Regional","Local"];
const DURATIONS = ["Permanent (>10yr)","Long-term (1–10yr)","Temporary (<1yr)"];
const PROJ_TYPES = ["Offshore O&G","Onshore Infrastructure","Industrial / Process"];
const STATUSES = ["Open","In Progress","Controlled","Accepted","Closed"];
const OPP_TYPES = ["Resource Efficiency","Circular Economy","Low-Carbon Technology","Nature-Based Solutions","Green Finance & Taxonomy","New Business / Market","Reputational / SLO","Climate Resilience","Regulatory Incentive","Biodiversity Net Gain"];
const OPP_STATUSES = ["Open","In Progress","Implemented","Partially implemented","Deferred","Not feasible"];
const STORAGE_KEY = "env-toolkit-v2";

function calcScore({ severity, probability, recSensitivity, scale, duration }) {
  if (!severity || !probability) return null;
  let s = severity * probability;
  if (recSensitivity === "High") s += 5; else if (recSensitivity === "Medium") s += 2;
  if (scale === "Global") s += 4; else if (scale === "Regional") s += 2;
  if (duration?.startsWith("Permanent")) s += 3; else if (duration?.startsWith("Long-term")) s += 1;
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

const emptyAspect = () => ({ phase:"", area:"", activity:"", aspect:"", condition:"Normal", impact:"", receptors:"", recSensitivity:"Medium", scale:"Local", severity:3, probability:3, duration:"Temporary (<1yr)", legalThreshold:"N", stakeholderConcern:"N", control:"", legalRef:"", owner:"", status:"Open" });
const emptyOpp = () => ({ type:"", aspectRef:"", materiality:"Both", description:"", envBenefit:"", bizBenefit:"", envValue:2, bizValue:2, feasibility:2, action:"", alignment:"", owner:"", status:"Open" });
const newProject = () => ({ id:Date.now().toString(), name:"", company:"", type:"", phase:"", createdAt:new Date().toISOString(), aspects:[], opps:[] });

const iw = { width:"100%", boxSizing:"border-box" };
const CL = {
  green:  { bg:"#e8f5e9", text:"#1b5e20", strong:"#2e7d52", border:"#a5d6a7" },
  amber:  { bg:"#fff8e1", text:"#e65100", strong:"#f57f17", border:"#ffe082" },
  red:    { bg:"#ffebee", text:"#b71c1c", strong:"#c62828", border:"#ef9a9a" },
  purple: { bg:"#ede7f6", text:"#4527a0", strong:"#6a1b9a", border:"#ce93d8" },
  blue:   { bg:"#e3f2fd", text:"#0d47a1", strong:"#1565c0", border:"#90caf9" },
  teal:   { bg:"#e0f2f1", text:"#004d40", strong:"#00695c", border:"#80cbc4" },
  slate:  { bg:"#f5f5f5", text:"#444",    strong:"#37474f", border:"#cfd8dc" },
};

const sigStyle = (sig) => {
  const col = sig==="SIGNIFICANT"?CL.red:sig==="WATCH"?CL.amber:CL.green;
  return { fontSize:11, padding:"2px 8px", borderRadius:4, fontWeight:600, display:"inline-block", background:col.bg, color:col.text };
};
const condStyle = (c) => {
  const col = c==="Emergency"?CL.red:c==="Abnormal"?CL.amber:CL.green;
  return { fontSize:10, padding:"1px 6px", borderRadius:4, fontWeight:600, display:"inline-block", background:col.bg, color:col.text };
};

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
  const v = { default:{background:"transparent",color:"#333",border:"1px solid #d0d0d0"}, primary:{background:CL.green.strong,color:"#fff",border:"none"}, purple:{background:CL.purple.strong,color:"#fff",border:"none"}, danger:{background:"transparent",color:CL.red.text,border:`1px solid ${CL.red.border}`} }[variant];
  const s = { sm:{padding:"4px 10px",fontSize:12}, md:{padding:"7px 16px",fontSize:13}, lg:{padding:"9px 20px",fontSize:14} }[size];
  return <button onClick={onClick} disabled={disabled} style={{borderRadius:8,cursor:disabled?"not-allowed":"pointer",fontFamily:"inherit",fontWeight:500,opacity:disabled?0.5:1,...v,...s}}>{children}</button>;
}

function AspectForm({ aspect, onSave, onCancel }) {
  const [f,setF] = useState({...emptyAspect(),...aspect});
  const set = (k,v) => setF(p=>({...p,[k]:v}));
  const score = calcScore(f); const sig = calcSig(f);
  return (
    <div style={{maxWidth:800,margin:"0 auto"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:"1.25rem",paddingBottom:"1rem",borderBottom:"1px solid #eee"}}>
        <Btn onClick={onCancel}>← Back</Btn>
        <h2 style={{margin:0,fontSize:17,fontWeight:600}}>{aspect.id?"Edit aspect":"New aspect"}</h2>
        {aspect.ref&&<span style={{color:CL.green.strong,fontWeight:600,fontSize:13}}>{aspect.ref}</span>}
      </div>
      <Card style={{marginBottom:"1rem"}}>
        <p style={{fontSize:11,fontWeight:600,color:"#888",letterSpacing:"0.05em",margin:"0 0 14px",textTransform:"uppercase"}}>Activity details</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px 16px"}}>
          <Fld label="Phase"><select value={f.phase} onChange={e=>set("phase",e.target.value)} style={iw}><option value="">Select phase</option>{PHASES.map(p=><option key={p}>{p}</option>)}</select></Fld>
          <Fld label="Activity area"><input value={f.area} onChange={e=>set("area",e.target.value)} placeholder="e.g. Earthworks" style={iw}/></Fld>
          <Fld label="Specific activity / aspect source" wide><input value={f.activity} onChange={e=>set("activity",e.target.value)} placeholder="e.g. Bulk excavation, cut and fill" style={iw}/></Fld>
          <Fld label="Environmental aspect" wide><input value={f.aspect} onChange={e=>set("aspect",e.target.value)} placeholder="e.g. Fugitive dust generation (PM10/PM2.5)" style={iw}/></Fld>
          <Fld label="Operating condition"><select value={f.condition} onChange={e=>set("condition",e.target.value)} style={iw}>{CONDITIONS.map(c=><option key={c}>{c}</option>)}</select></Fld>
          <Fld label="Receptor(s) affected"><input value={f.receptors} onChange={e=>set("receptors",e.target.value)} placeholder="e.g. Air · Human health" style={iw}/></Fld>
          <Fld label="Potential environmental impact" wide><textarea value={f.impact} onChange={e=>set("impact",e.target.value)} rows={3} style={{...iw,resize:"vertical"}}/></Fld>
        </div>
      </Card>
      <Card style={{marginBottom:"1rem",background:"#fafffe",border:`1px solid ${CL.green.border}`}}>
        <p style={{fontSize:11,fontWeight:600,color:"#888",letterSpacing:"0.05em",margin:"0 0 14px",textTransform:"uppercase"}}>Significance scoring — (Severity × Probability) + receptor + scale + duration bonuses</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"10px 14px",marginBottom:12}}>
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
        {score!==null&&(
          <div style={{marginTop:14,paddingTop:12,borderTop:`1px solid ${CL.green.border}`,display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
            <span style={{fontSize:13,color:"#555"}}>Score: <strong style={{fontSize:18}}>{score}</strong></span>
            <span style={sigStyle(sig)}>{sig}</span>
            {f.legalThreshold==="Y"&&<span style={{fontSize:11,color:CL.amber.text,fontWeight:500}}>Auto-flagged: legal threshold</span>}
            {f.stakeholderConcern==="Y"&&<span style={{fontSize:11,color:CL.amber.text,fontWeight:500}}>Auto-flagged: stakeholder concern</span>}
          </div>
        )}
      </Card>
      <Card style={{marginBottom:"1.5rem"}}>
        <p style={{fontSize:11,fontWeight:600,color:"#888",letterSpacing:"0.05em",margin:"0 0 14px",textTransform:"uppercase"}}>Controls & management</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px 16px"}}>
          <Fld label="Key control measure / mitigation" wide><textarea value={f.control} onChange={e=>set("control",e.target.value)} rows={3} style={{...iw,resize:"vertical"}}/></Fld>
          <Fld label="Legal / regulatory reference" wide><input value={f.legalRef} onChange={e=>set("legalRef",e.target.value)} placeholder="e.g. Forurensningsloven §7 · OSPAR" style={iw}/></Fld>
          <Fld label="Owner"><input value={f.owner} onChange={e=>set("owner",e.target.value)} placeholder="Name or role" style={iw}/></Fld>
          <Fld label="Status"><select value={f.status} onChange={e=>set("status",e.target.value)} style={iw}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select></Fld>
        </div>
      </Card>
      <div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
        <Btn onClick={onCancel}>Cancel</Btn>
        <Btn variant="primary" onClick={()=>onSave(f)}>{aspect.id?"Save changes":"Add to register"}</Btn>
      </div>
    </div>
  );
}

function OppForm({ opp, aspects, onSave, onCancel }) {
  const [f,setF] = useState({...emptyOpp(),...opp});
  const set = (k,v) => setF(p=>({...p,[k]:v}));
  const score = calcOppScore(f);
  const sc = score>=18?CL.teal:score>=9?CL.green:{bg:"#f5f5f5",text:"#999"};
  return (
    <div style={{maxWidth:800,margin:"0 auto"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:"1.25rem",paddingBottom:"1rem",borderBottom:"1px solid #eee"}}>
        <Btn onClick={onCancel}>← Back</Btn>
        <h2 style={{margin:0,fontSize:17,fontWeight:600}}>{opp.id?"Edit opportunity":"New opportunity"}</h2>
      </div>
      <Card style={{marginBottom:"1rem"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px 16px"}}>
          <Fld label="Opportunity type"><select value={f.type} onChange={e=>set("type",e.target.value)} style={iw}><option value="">Select type</option>{OPP_TYPES.map(t=><option key={t}>{t}</option>)}</select></Fld>
          <Fld label="Linked aspect (optional)"><select value={f.aspectRef} onChange={e=>set("aspectRef",e.target.value)} style={iw}><option value="">None</option>{aspects.map(a=><option key={a.id} value={a.ref}>{a.ref} — {(a.aspect||"").slice(0,40)}</option>)}</select></Fld>
          <Fld label="Materiality (CSRD double materiality)" wide><select value={f.materiality} onChange={e=>set("materiality",e.target.value)} style={iw}><option>Inside-out (positive impact on environment)</option><option>Outside-in (financial / business benefit)</option><option>Both</option></select></Fld>
          <Fld label="Opportunity description" wide><textarea value={f.description} onChange={e=>set("description",e.target.value)} rows={3} style={{...iw,resize:"vertical"}}/></Fld>
          <Fld label="Environmental benefit"><textarea value={f.envBenefit} onChange={e=>set("envBenefit",e.target.value)} rows={2} style={{...iw,resize:"vertical"}}/></Fld>
          <Fld label="Business / strategic benefit"><textarea value={f.bizBenefit} onChange={e=>set("bizBenefit",e.target.value)} rows={2} style={{...iw,resize:"vertical"}}/></Fld>
        </div>
      </Card>
      <Card style={{marginBottom:"1rem",background:"#f9f7ff",border:`1px solid ${CL.purple.border}`}}>
        <p style={{fontSize:11,fontWeight:600,color:"#888",letterSpacing:"0.05em",margin:"0 0 14px",textTransform:"uppercase"}}>Priority score = env value × business value × feasibility (max 27)</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"10px 14px"}}>
          {[{k:"envValue",l:"Environmental value (1–3)"},{k:"bizValue",l:"Business value (1–3)"},{k:"feasibility",l:"Feasibility (1–3)"}].map(({k,l})=>(
            <Fld key={k} label={l}><input type="number" min={1} max={3} value={f[k]} onChange={e=>set(k,Math.min(3,Math.max(1,+e.target.value||1)))} style={iw}/></Fld>
          ))}
        </div>
        <div style={{marginTop:14,paddingTop:12,borderTop:`1px solid ${CL.purple.border}`,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:13,color:"#555"}}>Score:</span>
          <span style={{fontSize:20,fontWeight:700,padding:"2px 14px",borderRadius:6,background:sc.bg,color:sc.text}}>{score}</span>
          <span style={{fontSize:12,color:"#666"}}>{score>=18?"High priority — act now":score>=9?"Medium priority":"Low priority"}</span>
        </div>
      </Card>
      <Card style={{marginBottom:"1.5rem"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px 16px"}}>
          <Fld label="Key action / implementation route" wide><textarea value={f.action} onChange={e=>set("action",e.target.value)} rows={2} style={{...iw,resize:"vertical"}}/></Fld>
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

function AIPanel({ project, onAdd }) {
  const [query,setQuery] = useState("");
  const [loading,setLoading] = useState(false);
  const [results,setResults] = useState([]);
  const [error,setError] = useState("");
  const run = async () => {
    if (!query.trim()) return;
    setLoading(true); setError(""); setResults([]);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1200,system:`You are an expert environmental consultant for Norwegian engineering projects. Return ONLY a valid JSON array — no markdown, no explanation. Each object: phase (one of: ${PHASES.join(", ")}), area (max 60 chars), activity (max 80 chars), aspect (max 80 chars), condition (Normal|Abnormal|Emergency), impact (max 120 chars), receptors (max 80 chars), recSensitivity (High|Medium|Low), scale (Global|Regional|Local), severity (int 1-5), probability (int 1-5), duration (one of: ${DURATIONS.join(", ")}), legalThreshold (Y|N), control (max 120 chars), legalRef (max 80 chars). Return 4–6 aspects covering Normal, Abnormal and Emergency conditions applying Norwegian law (Forurensningsloven, Naturmangfoldloven, OSPAR, NORSOK).`,messages:[{role:"user",content:`Project type: ${project.type||"not specified"}. Phase: ${project.phase||"not specified"}. Scenario: ${query}`}]})});
      const d = await res.json();
      const parsed = JSON.parse((d.content?.[0]?.text||"").trim());
      setResults(Array.isArray(parsed)?parsed:[]);
    } catch { setError("Could not fetch suggestions — check your connection and try again."); }
    setLoading(false);
  };
  return (
    <div style={{background:CL.purple.bg,border:`1px solid ${CL.purple.border}`,borderRadius:10,padding:"1rem",marginBottom:"1rem"}}>
      <p style={{fontSize:13,fontWeight:600,color:CL.purple.text,margin:"0 0 4px"}}>AI aspect suggestion</p>
      <p style={{fontSize:12,color:"#666",margin:"0 0 10px"}}>Describe a project activity or scenario, e.g. "diesel pile driving near a coral reef during spring spawning season"</p>
      <div style={{display:"flex",gap:8,marginBottom:8}}>
        <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&run()} placeholder="Describe the activity or scenario..." style={{flex:1,boxSizing:"border-box"}}/>
        <Btn variant="purple" onClick={run} disabled={loading||!query.trim()}>{loading?"Thinking...":"Suggest →"}</Btn>
      </div>
      {error&&<p style={{color:CL.red.text,fontSize:12,margin:"0 0 8px"}}>{error}</p>}
      {results.map((s,i)=>{
        const sig=calcSig(s);
        return (
          <div key={i} style={{background:"#fff",border:"1px solid #e0e0e0",borderRadius:8,padding:"10px 12px",marginBottom:6,display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:4,alignItems:"center"}}>
                <span style={{fontWeight:600,fontSize:13}}>{s.aspect}</span>
                <span style={condStyle(s.condition)}>{s.condition}</span>
                {sig&&<span style={sigStyle(sig)}>{sig}</span>}
              </div>
              <p style={{fontSize:12,color:"#777",margin:"0 0 2px"}}>{s.phase}{s.area?` · ${s.area}`:""}</p>
              <p style={{fontSize:12,color:"#555",margin:0}}>{s.impact}</p>
              {s.legalRef&&<p style={{fontSize:11,color:"#888",margin:"4px 0 0"}}>{s.legalRef}</p>}
            </div>
            <Btn size="sm" variant="primary" onClick={()=>{onAdd(s);setResults(p=>p.filter(x=>x!==s));}}>Add</Btn>
          </div>
        );
      })}
    </div>
  );
}

function ProjectView({ project, onChange, onDelete }) {
  const [tab,setTab] = useState("dashboard");
  const [editAspect,setEditAspect] = useState(null);
  const [editOpp,setEditOpp] = useState(null);
  const [aiOpen,setAiOpen] = useState(false);
  const [sigFilter,setSigFilter] = useState("All");
  const [confirmDelete,setConfirmDelete] = useState(false);

  const aspects = project.aspects||[];
  const opps = project.opps||[];
  const nextRef = (arr,pfx) => `${pfx}-${String(arr.length+1).padStart(3,"0")}`;

  const saveAspect = (a) => {
    const updated = a.id ? aspects.map(x=>x.id===a.id?a:x) : [...aspects,{...a,id:Date.now().toString(),ref:nextRef(aspects,"ASP")}];
    onChange({...project,aspects:updated});
    setEditAspect(null);
  };
  const saveOpp = (o) => {
    const updated = o.id ? opps.map(x=>x.id===o.id?o:x) : [...opps,{...o,id:Date.now().toString(),ref:nextRef(opps,"OPP")}];
    onChange({...project,opps:updated});
    setEditOpp(null);
  };

  const sigCount = aspects.filter(a=>calcSig(a)==="SIGNIFICANT").length;
  const watchCount = aspects.filter(a=>calcSig(a)==="WATCH").length;
  const highOpps = opps.filter(o=>calcOppScore(o)>=18).length;
  const filtered = sigFilter==="All" ? aspects : aspects.filter(a=>calcSig(a)===sigFilter);

  if (editAspect!==null) return <div style={{padding:"1.5rem 1.25rem"}}><AspectForm aspect={editAspect} onSave={saveAspect} onCancel={()=>setEditAspect(null)}/></div>;
  if (editOpp!==null) return <div style={{padding:"1.5rem 1.25rem"}}><OppForm opp={editOpp} aspects={aspects} onSave={saveOpp} onCancel={()=>setEditOpp(null)}/></div>;

  return (
    <div style={{padding:"1.25rem"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1.25rem",flexWrap:"wrap",gap:8}}>
        <nav style={{display:"flex",gap:4}}>
          {["dashboard","aspects","opportunities","settings"].map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{padding:"6px 14px",fontSize:13,borderRadius:8,cursor:"pointer",fontFamily:"inherit",fontWeight:tab===t?600:400,border:tab===t?`2px solid ${CL.green.strong}`:"1px solid #ddd",background:tab===t?CL.green.bg:"transparent",color:tab===t?CL.green.strong:"#555"}}>
              {t.charAt(0).toUpperCase()+t.slice(1)}
            </button>
          ))}
        </nav>
        <div style={{display:"flex",gap:6}}>
          {project.type&&<span style={{fontSize:11,padding:"2px 8px",borderRadius:4,background:CL.slate.bg,color:CL.slate.text}}>{project.type}</span>}
          {project.phase&&<span style={{fontSize:11,padding:"2px 8px",borderRadius:4,background:CL.blue.bg,color:CL.blue.text}}>{project.phase}</span>}
        </div>
      </div>

      {tab==="dashboard"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10,marginBottom:"1.5rem"}}>
            {[{l:"Total aspects",v:aspects.length,col:CL.slate},{l:"Significant",v:sigCount,col:CL.red},{l:"Watch",v:watchCount,col:CL.amber},{l:"Opportunities",v:opps.length,col:CL.purple},{l:"High priority",v:highOpps,col:CL.teal}].map(({l,v,col})=>(
              <div key={l} style={{background:col.bg,borderRadius:8,padding:"1rem",border:`1px solid ${col.border}`}}>
                <p style={{fontSize:12,color:col.text,margin:"0 0 4px"}}>{l}</p>
                <p style={{fontSize:28,fontWeight:700,margin:0,color:col.strong}}>{v}</p>
              </div>
            ))}
          </div>
          {sigCount>0&&(
            <div style={{background:CL.red.bg,border:`1px solid ${CL.red.border}`,borderLeft:`4px solid ${CL.red.strong}`,borderRadius:"0 8px 8px 0",padding:"1rem",marginBottom:"1rem"}}>
              <p style={{margin:"0 0 8px",fontWeight:600,fontSize:13,color:CL.red.text}}>Significant aspects requiring action ({sigCount})</p>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {aspects.filter(a=>calcSig(a)==="SIGNIFICANT").map(a=>(
                  <button key={a.id} onClick={()=>setEditAspect(a)} style={{fontSize:11,padding:"3px 10px",borderRadius:4,background:"#fff",color:CL.red.text,border:`1px solid ${CL.red.border}`,cursor:"pointer",fontFamily:"inherit"}}>{a.ref} — {(a.aspect||"").slice(0,45)}</button>
                ))}
              </div>
            </div>
          )}
          {aspects.length===0&&<div style={{textAlign:"center",padding:"2.5rem",background:"#f8f8f8",borderRadius:10,color:"#888"}}><p style={{margin:"0 0 12px",fontSize:14}}>No aspects identified yet.</p><Btn variant="primary" onClick={()=>setTab("aspects")}>Go to Aspects →</Btn></div>}
        </div>
      )}

      {tab==="aspects"&&(
        <div>
          <div style={{display:"flex",gap:8,marginBottom:"1rem",alignItems:"center",flexWrap:"wrap"}}>
            <Btn variant="primary" onClick={()=>setEditAspect(emptyAspect())}>+ Add aspect</Btn>
            <button onClick={()=>setAiOpen(v=>!v)} style={{padding:"7px 16px",fontSize:13,borderRadius:8,cursor:"pointer",fontFamily:"inherit",fontWeight:500,border:`1px solid ${CL.purple.border}`,background:aiOpen?CL.purple.bg:"transparent",color:CL.purple.strong}}>✦ AI suggest</button>
            <div style={{display:"flex",gap:4,marginLeft:"auto"}}>
              {["All","SIGNIFICANT","WATCH","Low"].map(f=>(
                <button key={f} onClick={()=>setSigFilter(f)} style={{padding:"4px 10px",fontSize:11,borderRadius:6,cursor:"pointer",fontFamily:"inherit",fontWeight:sigFilter===f?600:400,border:sigFilter===f?`2px solid ${CL.green.strong}`:"1px solid #ddd",background:sigFilter===f?CL.green.bg:"transparent",color:sigFilter===f?CL.green.strong:"#666"}}>{f}</button>
              ))}
            </div>
          </div>
          {aiOpen&&<AIPanel project={project} onAdd={s=>saveAspect({...emptyAspect(),...s,stakeholderConcern:"N"})}/>}
          {filtered.length===0
            ?<div style={{textAlign:"center",padding:"3rem",background:"#f8f8f8",borderRadius:10,color:"#888"}}>{aspects.length===0?"No aspects yet. Add one manually or use AI suggest above.":`No aspects match the "${sigFilter}" filter.`}</div>
            :(
              <div style={{overflowX:"auto",borderRadius:10,border:"1px solid #e8e8e8"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                  <thead><tr style={{background:"#f5f5f5"}}>{["Ref","Phase","Aspect","Cond.","Impact / Receptor","Score","Significance","Status",""].map(h=><th key={h} style={{padding:"9px 10px",textAlign:"left",fontWeight:600,fontSize:11,color:"#777",borderBottom:"1px solid #e0e0e0",whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
                  <tbody>
                    {filtered.map((a,i)=>{
                      const score=calcScore(a); const sig=calcSig(a);
                      return (
                        <tr key={a.id} style={{borderBottom:"1px solid #f0f0f0",background:i%2===0?"#fff":"#fafafa"}}>
                          <td style={{padding:"9px 10px",fontWeight:600,color:CL.green.strong,whiteSpace:"nowrap",fontSize:12}}>{a.ref}</td>
                          <td style={{padding:"9px 10px",whiteSpace:"nowrap"}}><span style={{fontSize:10,padding:"2px 6px",borderRadius:3,background:"#f0f0f0",color:"#555"}}>{a.phase||"—"}</span></td>
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

      {tab==="opportunities"&&(
        <div>
          <div style={{display:"flex",gap:8,marginBottom:"1rem",alignItems:"center"}}>
            <Btn variant="purple" onClick={()=>setEditOpp(emptyOpp())}>+ Add opportunity</Btn>
            <span style={{marginLeft:"auto",fontSize:12,color:"#888"}}>{opps.length} opportunit{opps.length!==1?"ies":"y"}</span>
          </div>
          {opps.length===0
            ?<div style={{textAlign:"center",padding:"3rem",background:"#f8f8f8",borderRadius:10,color:"#888"}}><p style={{margin:"0 0 8px"}}>No opportunities tracked yet.</p><p style={{fontSize:12,margin:0,maxWidth:400,marginInline:"auto"}}>ISO 14001:2015 Cl.6.1.2 requires identifying both risks and opportunities — add one for each significant aspect with positive potential.</p></div>
            :(
              <div style={{display:"grid",gap:8}}>
                {opps.map((o)=>{
                  const score=calcOppScore(o);
                  const sc=score>=18?CL.teal:score>=9?CL.green:CL.purple;
                  const matC=o.materiality?.startsWith("Inside")?CL.green:o.materiality?.startsWith("Outside")?CL.blue:CL.purple;
                  return (
                    <Card key={o.id}>
                      <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"flex-start"}}>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:6,alignItems:"center"}}>
                            <span style={{fontWeight:700,fontSize:12,color:CL.purple.strong}}>{o.ref}</span>
                            {o.type&&<span style={{fontSize:11,padding:"2px 8px",borderRadius:4,background:CL.purple.bg,color:CL.purple.text,fontWeight:600}}>{o.type}</span>}
                            {o.aspectRef&&<span style={{fontSize:11,padding:"2px 6px",borderRadius:4,background:CL.green.bg,color:CL.green.text}}>{o.aspectRef}</span>}
                            {score>0&&<span style={{fontSize:11,padding:"2px 8px",borderRadius:4,fontWeight:600,background:sc.bg,color:sc.text}}>Score {score}</span>}
                            {o.materiality&&<span style={{fontSize:10,padding:"2px 6px",borderRadius:4,background:matC.bg,color:matC.text}}>{o.materiality.split(" (")[0]}</span>}
                          </div>
                          <p style={{fontSize:14,margin:"0 0 6px",fontWeight:500}}>{o.description||"(No description)"}</p>
                          {o.envBenefit&&<p style={{fontSize:12,color:CL.green.text,margin:"0 0 2px"}}>Env: {o.envBenefit}</p>}
                          {o.bizBenefit&&<p style={{fontSize:12,color:CL.blue.text,margin:"0 0 2px"}}>Business: {o.bizBenefit}</p>}
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

      {tab==="settings"&&(
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
          <div style={{padding:"1.25rem",borderRadius:10,background:CL.red.bg,border:`1px solid ${CL.red.border}`}}>
            <p style={{fontWeight:600,fontSize:14,color:CL.red.text,margin:"0 0 6px"}}>Danger zone</p>
            <p style={{fontSize:13,color:"#666",margin:"0 0 12px"}}>Deleting this project permanently removes all its aspects and opportunities. This cannot be undone.</p>
            {!confirmDelete
              ?<Btn variant="danger" onClick={()=>setConfirmDelete(true)}>Delete project</Btn>
              :<div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:13,fontWeight:600,color:CL.red.text}}>Are you sure?</span><Btn variant="danger" onClick={onDelete}>Yes, delete permanently</Btn><Btn onClick={()=>setConfirmDelete(false)}>Cancel</Btn></div>
            }
          </div>
        </div>
      )}
    </div>
  );
}

function Sidebar({ projects, activeId, onSelect, onNew }) {
  return (
    <div style={{width:220,flexShrink:0,background:"#f9f9f9",borderRight:"1px solid #e8e8e8",display:"flex",flexDirection:"column",minHeight:"100vh"}}>
      <div style={{padding:"1.25rem 1rem 0.75rem",borderBottom:"1px solid #e8e8e8"}}>
        <p style={{fontSize:13,fontWeight:700,color:"#1a1a1a",margin:"0 0 2px"}}>Env Aspects Toolkit</p>
        <p style={{fontSize:11,color:"#aaa",margin:0}}>Norwegian engineering</p>
      </div>
      <div style={{padding:"0.75rem 0.5rem",flex:1,overflowY:"auto"}}>
        <p style={{fontSize:10,fontWeight:600,color:"#bbb",letterSpacing:"0.07em",textTransform:"uppercase",margin:"0 0.5rem 6px"}}>Projects ({projects.length})</p>
        {projects.length===0&&<p style={{fontSize:12,color:"#ccc",padding:"0 0.5rem",fontStyle:"italic"}}>No projects yet</p>}
        {projects.map(p=>{
          const sigC=(p.aspects||[]).filter(a=>calcSig(a)==="SIGNIFICANT").length;
          const isActive=p.id===activeId;
          return (
            <button key={p.id} onClick={()=>onSelect(p.id)} style={{width:"100%",textAlign:"left",padding:"9px 10px",borderRadius:8,marginBottom:2,border:isActive?`1.5px solid ${CL.green.border}`:"1px solid transparent",cursor:"pointer",fontFamily:"inherit",background:isActive?"#fff":"transparent",boxShadow:isActive?"0 1px 3px rgba(0,0,0,0.07)":undefined}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:6}}>
                <span style={{fontSize:13,fontWeight:isActive?600:400,color:isActive?"#1a1a1a":"#555",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                  {p.name||<span style={{color:"#ccc",fontStyle:"italic"}}>Unnamed project</span>}
                </span>
                {sigC>0&&<span style={{fontSize:10,fontWeight:700,padding:"1px 5px",borderRadius:3,background:CL.red.bg,color:CL.red.text,flexShrink:0}}>{sigC}</span>}
              </div>
              <p style={{fontSize:11,color:"#aaa",margin:"2px 0 0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                {p.type||"No type set"} · {(p.aspects||[]).length} aspects
              </p>
            </button>
          );
        })}
      </div>
      <div style={{padding:"0.75rem",borderTop:"1px solid #e8e8e8"}}>
        <button onClick={onNew} style={{width:"100%",padding:"8px",borderRadius:8,border:`1px dashed ${CL.green.border}`,background:"transparent",color:CL.green.strong,fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>
          + New project
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [projects,setProjects] = useState([]);
  const [activeId,setActiveId] = useState(null);
  const [loaded,setLoaded] = useState(false);

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
        {!active?(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100vh",color:"#aaa",gap:16,padding:"2rem"}}>
            <p style={{fontSize:36,margin:0}}>🌿</p>
            <p style={{fontSize:16,fontWeight:500,color:"#555",margin:0}}>No project selected</p>
            <p style={{fontSize:13,color:"#aaa",margin:0,textAlign:"center"}}>Select a project from the sidebar, or create a new one to get started.</p>
            <button onClick={createProject} style={{padding:"9px 20px",borderRadius:8,border:"none",background:CL.green.strong,color:"#fff",fontSize:14,fontWeight:500,cursor:"pointer",fontFamily:"inherit",marginTop:4}}>+ New project</button>
          </div>
        ):(
          <div>
            <div style={{padding:"1.25rem 1.25rem 0.75rem",borderBottom:"1px solid #eee",display:"flex",alignItems:"baseline",gap:10}}>
              <h1 style={{fontSize:18,fontWeight:600,margin:0}}>{active.name||<span style={{color:"#bbb",fontStyle:"italic"}}>Unnamed project</span>}</h1>
              {active.company&&<span style={{fontSize:13,color:"#888"}}>{active.company}</span>}
            </div>
            <ProjectView key={active.id} project={active} onChange={updateProject} onDelete={()=>deleteProject(active.id)}/>
          </div>
        )}
      </div>
    </div>
  );
}
