# ENV·ASPECTS TOOLKIT

A browser-based environmental management toolkit for EPCIC and engineering projects. Runs entirely in the browser — no server, no login, no cloud. All data stored in `localStorage`.

---

## Project management

### Multi-project workspace
- Create, rename and delete projects from the left sidebar
- Each project is fully self-contained: risks, opportunities, waste data, attendees, changelog and footprint
- Projects are grouped by **contract name** in the Portfolio Overview
- `projectId` field for document-control numbering (separate from the internal UUID)

### Project types and phases
- **Types:** Offshore O&G · Onshore Infrastructure · Industrial / Process
- **EPCIC phases** tracked per aspect: Engineering · Procurement · Construction · Installation · Commissioning · Operations & Maintenance · Decommissioning

### Data persistence
- All data stored in `localStorage` under a single JSON key
- **↓ Export project** — saves everything as a `.envproject` file (plain JSON, human-readable, version-control friendly)
- **↑ Import project** — loads a `.envproject` file back into the current slot; validates format before overwriting; preserves the slot's internal ID
- **📄 Export PDF report** — opens a print-ready A4 landscape HTML page in a new tab via Blob URL (works through popup blockers; falls back to downloading a `.html` file if the tab is still blocked)

---

## Dashboard

High-level project summary — not a data table.

### KPI strip (4 boxes)
| Box | Value |
|---|---|
| **All aspects** | Total risks + opportunities combined |
| **Significant** | Aspects where significance = Significant |
| **Action risks** | Aspects where status = Action |
| **Opportunities** | Total opportunity count |

### Summary panels
- **Environmental Budget card** — shown if a footprint has been pinned; displays Scope 3 Cat 1 combined total, NP/RP split, top-category bar chart, link to the Environmental Budget tab; dismissible
- **GHG savings strip** — total identified tCO₂e savings across all scored opportunities, broken down by Scope 1 / 2 / 3
- **Risk Profile by Category** — horizontal stacked bar per environmental category; each segment coloured by significance (red = Significant, amber = Medium, green = Low); total count on right
- **Top 5 Open Risks** — highest C×P scoring Action aspects; significance colour, ref, aspect text, area, status badge; click-to-edit
- **Top 3 Opportunities** — highest priority-score opportunities; quadrant label, ref, description, GHG saving; click-to-edit

---

## Screening

Structured guide-word screening to systematically identify risks and opportunities.

### Risk screening
- **68 guide-word items** across **7 environmental categories:**
  1. Emission to Air
  2. Discharge to Water & Marine Environment
  3. Waste, Materials & Chemicals
  4. Land, Soil & Contamination
  5. Ecology & Biodiversity
  6. Community, Heritage and Landscape
  7. Abnormal Condition and Emergency Response
- Each item has a sub-category label, a descriptive **hint** (e.g. "Integrated combustion plant, gas turbines, boilers, heaters"), and a pre-filled aspect text
- **Hint text always stays visible** even after the risk has been registered — the green dot + ref badge appears alongside it; nothing is hidden
- Category expand/collapse, text search, skip / undo-skip per item
- Progress bar: added / skipped / remaining per category and overall
- Clicking **+ Add** opens a pre-filled risk form; hint text maps to the *Activity* field

### Opportunity screening
- Scope-based prompts: Scope 1 (direct), Scope 2 (energy / system), Scope 3 (materials, transport, lifecycle, re-use)
- Each prompt pre-fills the opportunity form with type, description, and relevant GHG saving lines
- **Opportunity sub-descriptions always stay visible** after registration (same treatment as risk hints)
- NOₓ tax warning for NOₓ-related opportunities
- Skip / undo-skip, text search
- **COR suggestion panel** — local keyword scoring against the built-in COR library (fully offline, no API calls)

---

## Risks

Full risk register.

### Risk form fields
| Field | Notes |
|---|---|
| Phase | EPCIC phase dropdown |
| Area / sub-category | Free text |
| Activity (guide words) | Pre-filled from screening hint |
| Environmental aspect | Main aspect description |
| Condition | Normal / Abnormal / Emergency |
| Impact | Description of potential impact |
| Receptors | Affected receptors |
| Receptor sensitivity | High / Medium / Low |
| Scale | Local / Regional / National / International |
| Consequence (C) | Dropdown: **1 — Negligible** · 2 — Minor · 3 — Moderate · 4 — Major · **5 — Catastrophic** |
| Probability (P) | Dropdown: **1 — Very unlikely (0–1%)** · 2 — Unlikely · 3 — Possible · 4 — Likely · **5 — Very likely (50–100%)** |
| Duration | Temporary / Long-term / Permanent |
| Legal threshold exceeded? | Y/N |
| Stakeholder concern? | Y/N |
| Control measures | Free text |
| Legal reference | Free text |
| Owner | Free text |
| Status | **Action** / **Info** |

### Significance calculation
- **Significant** — C = 5; or C = 4 & P ≥ 4; or C = 3 & P = 5; or legal threshold / stakeholder concern = Y
- **Medium** — remaining combinations above Low
- **Low** — C = 1; C = 2 & P ≤ 2; C = 3 & P = 1

### Risk table
- Columns: Ref · Phase · Area · Activity · Aspect · C · P · Score · Significance · Status · Condition · Scale · Created · Modified
- Sortable by any column; text search; filter by significance: All / Significant / Medium / Low
- Row left-border coloured by environmental category
- Bulk select → bulk delete or bulk status change

### Risk Matrix (embedded in Risks tab)
- 5×5 Consequence × Probability grid
- Plain **number axes** (1–5) matching the opportunity matrix — no C/P prefix
- Cell colours: red (Significant) · amber (Medium) · green (Low); score in corner
- **Dots:** 14 px solid circles — red / amber / green for Action status, grey and faded for Info status; click-to-edit
- **Three legend panels below the grid:**
  - Zone key + dot colour guide (Significant / Medium / Low; Action / Info)
  - Consequence levels: 1 Negligible → 5 Catastrophic, each with full description
  - Probability levels: 1 Very unlikely (0–1%) → 5 Very likely (50–100%), each with description

---

## Opportunities

### Opportunity form fields
- Type / category (Scope 1 / 2 / 3 dropdown)
- Description, environmental benefit, business benefit, technical benefit
- Materiality (Inside / Outside / Both boundary)
- **Environmental Value (1–5):** dropdown — 1 Negligible · 2 Minor · 3 Moderate · **4 Significant** · **5 Major**
- **Business Value (1–5):** dropdown — 1 No benefit · 2 Low · 3 Moderate · **4 High** · **5 Strategic**
- **Feasibility (1–5):** dropdown — 1 Very difficult · 2 Difficult · 3 Moderate · **4 Achievable** · **5 Easy**
- All three scores default to **1** on new opportunities — forces deliberate evaluation
- Owner
- **Qualitative phases** — named milestones with date and note
- **GHG saving phases** — quantitative saving phases, each with a full table of saving lines:
  - Scope 1: CO₂ · NOₓ · CH₄ · nmVOC · Other chemicals · Refrigerants/GWP gases · Other
  - Scope 2: Reduction in energy consumption (kWh, EF 0.57 kgCO₂e/kWh)
  - Scope 3 Cat 1: 12 material reduction lines
  - Scope 3 Cat 4: Transportation (material, personnel, helicopter, vessels)

### Priority scoring
- **Score** = Environmental Value × Business Value × Feasibility (max 125)
- **Quadrant label** derived from Environmental Value and Feasibility (threshold ≥ 4):
  | Label | Condition | Colour |
  |---|---|---|
  | **Quick win** | High env value + high feasibility | Green |
  | **Pursue** | Low env value + high feasibility | Purple |
  | **Plan** | High env value + low feasibility | Blue |
  | **Deprioritize** | Low on both | Grey |
- Quadrant label shown in: opportunity form · opportunity table · dashboard top-3 · PDF report

### Opportunity table
- Columns: Ref · Type · Description · Score · Priority (quadrant label) · GHG saving · Materiality · Created · Modified
- No status column (status removed from opportunities)
- Sortable, bulk delete

### Opportunity Priority Matrix (embedded in Opportunities tab)
- 5×5 grid: Environmental Value (x-axis, 1–5) × Feasibility (y-axis, 1–5)
- "ENVIRONMENTAL VALUE →" label at the **top edge**; plain number axes — no prefix labels
- Quadrant colours: 🟣 Pursue (purple) · 🟢 Quick win (green) · 🔵 Plan (blue) · ⬜ Deprioritize (grey)
- **Dot size** encodes Business Value: small = 1–2, medium = 3, large = 4–5
- Threshold for "high" on each axis: ≥ 4 (giving a 2×3 / 3×2 balanced quadrant split)
- **Three legend panels below the grid:**
  - Quadrant guide + dot size key
  - Environmental Value scale (1 Negligible → 5 Major, described)
  - Feasibility scale (1 Very difficult → 5 Easy, described)

---

## Environmental Budget

Calculates Scope 3 Category 1 embodied carbon from MTO / MEL Excel files. Runs in a **Web Worker** — UI stays responsive.

### Workflow
1. **Upload** — drag or select `.xlsx` / `.xls`
2. **Column mapping** — auto-detects COR code, weight, description, material, MHC handling code columns with confidence scores; user can override
3. **Calculate** — worker processes all rows, looks up COR codes, applies NP/RP filtering, computes tCO₂e
4. **Results** — summary cards, row table (filterable / searchable), category breakdown

### COR lookup table
- **87 COR codes** covering all major NORSOK material disciplines
- Unknown codes flagged; user can remap via the override system

### COR override system
- Per-row reassignment to a different COR code
- Bulk remap: select multiple unknown-code rows and reassign in one action
- Full **undo/redo** (Ctrl/Cmd+Z / Ctrl+Shift+Z)
- Overrides persist in `project.footprintCorOverrides` across sessions

### Dashboard pin (Add to project)
- Saves a `footprintSummary` snapshot including: combined total, MTO/MEL split, NP/RP split, top-category breakdown, `mtoTotal`, `melTotal`
- Explicitly writes all current footprint state (`result`, `corOverrides`, `meta`, `fileName`) in one atomic `onChange` call — prevents stale-closure race conditions that previously caused intermittent save failures
- Shows descriptive toast feedback on success or failure

### Excel export (↓ Download Excel)
Produces a structured `.xlsx` with three sheets:
- **MTO** — COR Code · Original COR Code · Category · Weight Item Descr. · Material · Mod. Handl. Code · Gross Dry Weight (kg) · Emission Factor · Emission (tCO₂e); totals row
- **MEL** — same without Material column; Equipment Type Description instead
- **Summary** — project metadata + MTO / MEL / Combined totals; export date as proper Excel date cell; column widths pre-set

---

## Waste Handling

Pre-populated waste stream register matching the standard screening template format.

### Pre-defined waste fractions (20 standard rows across 10 categories)
Packaging (paper/cardboard, plastic, wood) · Cables · WEEE · Metals · Plastics (PVC) · Chemicals (waste oil, lubrication/grease, solvent/paint/glue, spray cans, acid, gas containers) · Material containing heavy metals (batteries) · Pipes and systems (TENORM) · Hydrocarbons · Insulation (brominated fire retardants, asbestos)

### Table structure (6 columns)
Waste Fraction · Product / Material · Construction / Installation · Start-up / Shut-down · Normal Operation · Waste Hierarchy / Reduction Measures

- Fraction name shown **bold on the first row of each category group**, with a double-border separator between groups
- All quantity and Measures cells are inline-editable; data persists in `project.wasteRows`
- **+ Add row** appends a fully custom row (both Fraction and Product editable)
- Standard rows cannot be deleted; custom rows can

### Waste Philosophy reference
16 reduction principles in a two-column reference panel below the table.

---

## Attendees

Workshop session log.

- Each **session** has a date picker, optional label (e.g. "Sustainability Screening #1"), and its own attendee table
- Columns: Name · Role / Title; rows added and removed individually
- Attendee count shown per session header; minimum 1 row maintained
- Sessions can be removed entirely
- Data persists in `project.attendeeSessions`

---

## Changes (Changelog)

Automatically-maintained audit trail.

- Every add / edit / delete of an aspect or opportunity writes an entry with timestamp, action type, detail text, and per-field before → after values
- Environmental budget pins are also logged
- **Date range filter** with This week / This month / This year shortcuts
- Action badge colours: teal (Added) · amber (Edited) · red (Deleted)
- Field-change pills show previous → current inline

---

## Settings

### Project details
Name · Project ID · Company · Contract · Type · Phase · Description

### Export & Import
| Button | Description |
|---|---|
| ↓ Export project | Downloads `.envproject` JSON — full project backup |
| ↑ Import project… | Loads `.envproject` file; validates before overwriting |
| 📄 Export PDF report | Opens print-ready HTML report via Blob URL (popup-blocker resistant; falls back to `.html` download if needed) |

### Danger zone
Permanently delete project (with confirmation).

---

## PDF Report

A4 landscape, full-colour (`print-color-adjust: exact`), opened via Blob URL.

### Structure
1. **Header** — project name, ID, company, contract, type, phase, report date
2. **KPI boxes** — All aspects · Significant · Action risks · Opportunities (4-box grid)
3. **Matrices** (side by side)
   - Environmental Risk Matrix (5×5, plain number axes, coloured dots)
   - Opportunity Priority Matrix (5×5, Environmental Value × Feasibility, dot size = Business Value)
4. **Environmental Budget** — MTO / MEL / Combined cards (shown only if pinned)
5. **Risk Register table** — Ref · Aspect · Area · Phase · Significance · Status (no score columns)
6. **Opportunity Register table** — Ref · Description · Type · Priority (quadrant) · GHG saving (no score column)
7. **Footer** — toolkit name, project name, date
8. **Appendix — Matrix Legends:**
   - *Risk Matrix:* Zone key · Consequence levels (1–5 with descriptions) · Probability levels (1–5 with ranges)
   - *Opportunity Matrix:* Quadrant guide · Environmental Value scale · Feasibility scale

### Printing
Click **🖨 Print / Save as PDF** in the top-right of the report window, then choose "Save as PDF" as the destination. All background colours print because `print-color-adjust: exact` is set on every element.

---

## Portfolio Overview

Cross-project view from the sidebar.

- Projects grouped by contract, then individually listed
- Per-project: total aspects, Significant / Medium / Low bar, total opportunities, GHG savings, Environmental Budget total (if pinned)
- Contract-level and portfolio totals

---

## Global UI

- **Light / dark mode** toggle; persists to `localStorage`
- **Zoom** — 5 levels (80–120%); persists across sessions
- **CSS variable token system** — all colours derive from a single theme object (`T`); dark mode swaps the same tokens
- Tabs: Dashboard · Screening · Risks · Opportunities · Environmental Budget · Waste Handling · Attendees · Changes · Settings

---

## Technology

| Layer | Choice |
|---|---|
| Framework | React 18 (Create React App) |
| Excel parsing | SheetJS (xlsx 0.20.3, CDN build) |
| Heavy calculation | Web Worker (`fpWorker.js`) |
| COR suggestions | Local keyword scoring (`localSuggestCOR`) — no network calls |
| Persistence | IndexedDB (with one-time `localStorage` migration) |
| Styling | Inline CSS with shared theme token object (`T`) |
| Build | react-scripts 5 |

Single `App.jsx` file (~6 900 lines) + `fpWorker.js` + standard CRA `index.js`. No external UI library. No router. No state-management library.

---

## Data model

```
project {
  id, name, projectId, company, contract, type, phase, description
  aspects[]          — risk register entries
  opportunities[]    — opportunity register entries
  changelog[]        — auto-written audit trail
  wasteRows[]        — waste handling table (standard + custom rows)
  attendeeSessions[] — workshop attendee sessions
  footprint          — raw CO₂ calculation result (from worker)
  footprintCorOverrides — user COR remaps
  footprintMeta      — sheet-to-column mappings from last upload
  footprintFile      — source file name
  footprintSummary   — pinned dashboard snapshot (combined, mtoTotal, melTotal, npTotal, rpTotal, catBreakdown, date)
}
```

**Aspect fields:** ref · phase · area · activity · aspect · condition · impact · receptors · recSensitivity · scale · severity (C 1–5) · probability (P 1–5) · legalThreshold · stakeholderConcern · control · legalRef · owner · status (Action / Info) · `_color` · `_screeningId`

**Opportunity fields:** ref · type · description · scope · envValue · bizValue · feasibility · owner · materiality · qualPhases[] · ghgPhases[] (full GHG saving line tables per snapshot)

---

## Regulatory references in guide words

NORSOK S-003 · NORSOK S-002 · Aktivitetsforskriften · Forurensningsloven · EU IED · MARPOL Annex I/V · OSPAR Convention · REACH · Biocidal Products Regulation · Natura 2000 / Habitats Directive · ISO 14001 · CSRD / ESRS E1–E5 · Norwegian NOₓ Tax · EU ETS
