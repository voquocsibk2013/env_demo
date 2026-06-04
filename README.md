# ENV·ASPECTS TOOLKIT

A browser-based environmental management toolkit for EPCIC and engineering projects. Built in React, runs entirely in the browser, stores all data locally in `localStorage`. No server, no login, no cloud.

---

## Project management

### Multi-project workspace
- Create, rename and delete projects from the left sidebar
- Each project is fully self-contained: risks, opportunities, waste data, attendees, changelog and footprint all live inside the project object
- Projects are grouped by contract name in the **Portfolio Overview**
- A `projectId` field (distinct from the internal UUID) can be set for document-control purposes

### Project types and phases
- Types: Offshore O&G · Onshore Infrastructure · Industrial / Process
- EPCIC phases tracked per aspect: Engineering, Procurement, Construction, Installation, Commissioning, Operations & Maintenance, Decommissioning

### Data persistence
- All data lives in `localStorage` under a single key
- **Export project** (`.envproject` JSON file) — full portable backup of one project
- **Import project** — loads a `.envproject` file back into the current project slot; validates the format before overwriting
- Browser `localStorage` is the single source of truth; no sync, no server

---

## Dashboard

High-level project overview, not a data table. Shows:

- **KPI strip** — 6 stat cards: Total aspects · Significant · Medium · Low · Opportunities · Open (Action) risks
- **Environmental Budget card** — if a footprint has been pinned, shows Scope 3 Cat 1 combined total, NP/RP split, top-category bar chart, and a direct link to the Environmental Budget tab; dismissible
- **GHG savings strip** — total identified tCO₂e savings across all scored opportunities, broken down by Scope 1 / 2 / 3
- **Risk Profile by Category** — horizontal stacked bar per environmental category (7 categories); each bar segment coloured by significance (red = Significant, amber = Medium, green = Low); total count on the right
- **Top 5 Open Risks** — highest C×P scoring open aspects, with significance colour, ref, aspect text, area and status badge; click-to-edit
- **Top 3 Opportunities** — highest priority-score open opportunities, with quadrant label, ref, description, GHG saving; click-to-edit

---

## Screening

Structured guide-word screening to systematically identify risks and opportunities.

### Risk screening
- **71 guide-word items** across 7 environmental categories:
  1. Emission to Air
  2. Discharge to Water & Marine Environment
  3. Waste, Materials & Chemicals
  4. Land, Soil & Contamination
  5. Ecology & Biodiversity
  6. Community, Heritage and Landscape
  7. Abnormal Condition and Emergency Response
- Each item has: a sub-category label, a descriptive hint (e.g. "Integrated combustion plant, gas turbines, boilers, heaters"), and a pre-filled aspect text
- Category expand/collapse, text search, skip/undo-skip per item
- Progress bar: added / skipped / remaining per category and overall
- Clicking **+ Add** opens a pre-filled risk form; hint text is mapped to the *Activity* field so it is never lost
- Items already added are marked with their ref number

### Opportunity screening
- Scope-based prompts: Scope 1 (Direct emissions), Scope 2 (Energy / system optimisation), Scope 3 (Material, chemicals, lifecycle, re-use, transport, remote technology)
- Each prompt pre-fills the opportunity form with type, description and relevant GHG saving lines
- NOₓ tax warning for NOₓ-related opportunities (Norwegian regulation)
- Skip / undo-skip, added count, text search
- AI suggestion panel: sends a query to Claude Sonnet via the Anthropic API to generate aspect suggestions for a given scenario

---

## Risks (Registered Risks)

Full risk register with inline editing and bulk operations.

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
| Consequence (C) | 1–5 |
| Probability (P) | 1–5; both default to 1 on new aspects |
| Duration | Temporary / Long-term / Permanent |
| Legal threshold exceeded? | Y/N flag |
| Stakeholder concern? | Y/N flag |
| Control measures | Free text |
| Legal reference | Free text |
| Owner | Free text |
| Status | **Action** / **Info** |

### Significance calculation
- **Significant** — C = 5, or C = 4 & P ≥ 4, or C = 3 & P = 5, or legal threshold / stakeholder concern flag = Y
- **Medium** — remaining combinations above Low
- **Low** — C = 1; C = 2 & P ≤ 2; C = 3 & P = 1
- Overridden to Significant if legal threshold or stakeholder concern is flagged

### Risk table
- Columns: Ref · Phase · Area · Activity · Aspect · C · P · Score · Significance · Status · Condition · Scale · Created · Modified
- Sortable by any column; text search across all fields
- Filter by significance: All / Significant / Medium / Low
- Row left-border coloured by environmental category
- Bulk select → bulk delete or bulk status change

### Risk Matrix (embedded in Risks tab)
- 5×5 Consequence × Probability grid
- Cell colours: red (Significant), yellow (Medium), green (Low); score shown in corner
- Dots: 14 px solid circle — red / amber / green for open risks, grey for Info status; click-to-edit
- Multiple risks in same cell show as overlapping dots
- Three legend panels below: Zone key + dot guide · Consequence levels (C1 Negligible → C5 Catastrophic, with descriptions) · Probability levels (P1 Very unlikely 0–1% → P5 Very likely 50–100%, with descriptions)

---

## Opportunities (Registered Opportunities)

### Opportunity form fields
- Type / category (Scope 1 / 2 / 3 dropdown)
- Description, environmental benefit, business benefit, technical benefit
- Materiality (Inside/Outside/Both boundary)
- **Environmental Value** (1–5), **Business Value** (1–5), **Feasibility** (1–5) — all default to 1
- Owner
- **Qualitative phases** — named milestones with date and free-text note
- **GHG saving phases** — quantitative saving phases, each containing a full table of saving lines:
  - Scope 1: CO₂ · NOₓ · CH₄ · nmVOC · Other chemicals · Refrigerants/GWP gases · Other
  - Scope 2: Reduction in energy consumption (kWh, EF 0.57 kgCO₂e/kWh)
  - Scope 3 Cat 1: 12 material reduction lines (steel, concrete, aluminium, copper, stainless, HDPE, PVC, insulation, paint/coating, general)
  - Scope 3 Cat 4: Transportation (material, personnel, helicopter, vessels)
  - Each line: saving quantity · baseline · custom emission factor · reference note · saving type (identified / quantified)

### Priority scoring
- **Priority score** = Environmental Value × Business Value × Feasibility (max 125)
- Quadrant label derived from Environmental Value and Feasibility (threshold ≥ 4):
  - **Quick win** — high env value + high feasibility (act now)
  - **Pursue** — low env value + high feasibility (easy capture)
  - **Plan** — high env value + low feasibility (plan resources)
  - **Deprioritize** — low on both axes

### Opportunity table
- Columns: Ref · Type · Description · Score · Priority (quadrant label) · GHG saving · Materiality · Created · Modified
- Sortable, bulk delete

### Opportunity Priority Matrix (embedded in Opportunities tab)
- 5×5 grid: Environmental Value (x, 1–5) × Feasibility (y, 1–5)
- Quadrant colours: purple (Pursue) · green (Quick win) · grey (Deprioritize) · blue (Plan)
- Dot size encodes Business Value (small = 1–2, medium = 3, large = 4–5)
- Three legend panels below: Quadrant guide + dot size key · Environmental Value scale (1 Negligible → 5 Major, described) · Feasibility scale (1 Very difficult → 5 Easy, described)
- "ENVIRONMENTAL VALUE →" label at top edge of matrix; number-only axes

---

## Environmental Budget

Calculates Scope 3 Category 1 (purchased goods and services) embodied carbon from MTO and MEL Excel files. Runs in a **Web Worker** — the UI stays responsive during large file processing.

### Workflow
1. **Upload** — drag or select an `.xlsx` / `.xls` file
2. **Column mapping** — auto-detects column roles (COR code, weight, description, material, MHC handling code) with confidence scores; user can override any mapping
3. **Calculate** — worker processes all rows, looks up each COR code in the built-in table, applies NP/RP handling-code filtering, computes `emission (tCO₂e) = weight × emission factor`
4. **Results** — summary cards (MTO total, MEL total, combined), filterable/searchable row table, category breakdown chart

### COR lookup table
- **87 COR codes** built-in covering all major NORSOK material disciplines: Structure · Piping · Mechanical · Electrical · Instrument · HVAC · Safety · Insulation · Surface treatment · Architect · Electro
- Each entry: code · category · description · emission factor (kgCO₂e/kg)
- Unknown codes are flagged; user can remap them via the override system

### COR override system
- Per-row overrides: reassign any row to a different COR code
- Bulk remap: select multiple rows with the same unknown COR and reassign in one action
- Full undo/redo history (Ctrl/Cmd+Z / Ctrl/Cmd+Shift+Z)
- Overrides persist in `project.footprintCorOverrides` so they survive page refresh

### Dashboard pin
- **📌 Add to project** saves a `footprintSummary` snapshot to the project dashboard; includes combined total, MTO/MEL split, NP/RP split, and top-category breakdown
- The save is fully self-contained (includes `footprint`, `corOverrides`, `meta` and `fileName`) to prevent stale-closure race conditions

### Export
- **↓ Download Excel** — produces a structured `.xlsx` with three sheets:
  - **MTO** — COR Code · Original COR Code · Category · Weight Item Descr. · Material · Mod. Handl. Code · Gross Dry Weight (kg) · Emission Factor · Emission (tCO₂e); totals row
  - **MEL** — same without Material column; Equipment Type Description instead
  - **Summary** — project metadata + MTO / MEL / Combined totals; export date as proper Excel date cell

---

## Waste Handling

Pre-populated waste stream register matching the standard environmental screening template format.

### Pre-defined waste fractions (20 standard rows)
Packaging (paper/cardboard, plastic, wood) · Cables · WEEE · Metals · Plastics (PVC) · Chemicals (waste oil, lubrication/grease, solvent/paint/glue, spray cans, acid, gas containers) · Material containing heavy metals (batteries) · Pipes and systems (TENORM) · Hydrocarbons · Insulation (brominated fire retardants, asbestos)

### Table structure
- Columns: Waste Fraction · Product / Material · Construction / Installation · Start-up / Shut-down · Normal Operation · Reduction Measures
- Fraction column shows category name only on the first row of each group (grouped by double top-border)
- All quantity and Measures cells are inline-editable
- **+ Add row** appends a fully custom row (fraction and product both editable)
- Custom rows can be removed; standard rows cannot

### Waste Philosophy reference
16 reduction principles shown in a two-column reference panel below the table (from the Norwegian environmental management framework).

---

## Attendees

Workshop session log for recording participants at environmental assessments.

- **Sessions** — each session has a date picker, an optional label (e.g. "Sustainability Screening #1"), and its own attendee table
- **Attendee table** — Name and Role/Title columns; rows can be added and removed
- Minimum 1 row per session maintained; sessions can be removed entirely
- Attendee count shown per session header
- Data persists in `project.attendeeSessions`

---

## Changes (Changelog)

Automatically-maintained audit trail of all changes to the project.

- Every add/edit/delete of an aspect or opportunity writes a changelog entry with timestamp, action type, detail text, and per-field before/after values
- Environmental budget pins are also logged
- **Date range filter** with This week / This month / This year quick buttons
- Entries displayed with coloured action badges: teal (Added) · amber (Edited) · red (Deleted)
- Field-change pills show `previous → current` values inline

---

## Settings

Per-project configuration and data management.

### Project details
- Name, Project ID (document control number), Company, Contract number, Type, Phase, Description

### Export & Import
- **↓ Export project** — saves everything as a `.envproject` JSON file (human-readable, version-control friendly)
- **↑ Import project…** — loads a `.envproject` file; validates format; replaces current project data while keeping the slot ID
- **📄 Export PDF report** — opens a print-ready A4 landscape HTML report in a new browser tab with: project header, KPI strip, Environmental Budget summary (if pinned), full Risk Register table, full Opportunity Register table. "Print / Save as PDF" button in top corner

### Danger zone
- Permanently delete project (irreversible, with confirmation)

---

## Global UI

### Theme
- Light and dark mode toggle; preference saved to `localStorage`
- CSS variable–based token system; all colours derive from a single theme object (`T`)

### Zoom
- 5-level zoom control (80% → 120%); persists across sessions

### Portfolio Overview
- Cross-project view accessible from the sidebar
- Projects grouped by contract, then listed individually
- Per-project: total aspects, Significant/Medium/Low breakdown (coloured bar), total opportunities, High/Medium priority count, GHG savings, Environmental Budget total (if pinned)
- Contract-level and portfolio-level totals

---

## Technology

| Layer | Choice |
|---|---|
| Framework | React 18 (Create React App) |
| Excel parsing | SheetJS (xlsx 0.18.x) |
| Heavy calculation | Web Worker (`fpWorker.js`) |
| AI suggestions | Anthropic API (Claude Sonnet) — direct browser fetch |
| Persistence | `localStorage` (single JSON blob) |
| Styling | Inline CSS with a shared theme token object |
| Build | react-scripts 5 |

No external UI library. No router. No state management library. The entire app is a single `App.jsx` file (~6 800 lines) plus `fpWorker.js` and a standard CRA `index.js`.

---

## Data model (summary)

```
project {
  id, name, projectId, company, contract, type, phase, description
  aspects[]         — risk register entries
  opportunities[]   — opportunity register entries
  changelog[]       — auto-written audit entries
  wasteRows[]       — waste handling table data
  attendeeSessions[]— workshop attendee sessions
  footprint         — raw CO₂ calculation result (from worker)
  footprintCorOverrides — user COR remaps
  footprintMeta     — sheet column mappings
  footprintFile     — source file name
  footprintSummary  — pinned dashboard snapshot
}
```

Each `aspect` carries: ref, phase, area, activity, aspect text, condition, impact, receptors, severity (C), probability (P), legalThreshold, stakeholderConcern, control, legalRef, owner, status (Action/Info), colour tag, screening ID.

Each `opportunity` carries: ref, type, description, env/biz/feasibility scores, owner, materiality, qualPhases[], ghgPhases[] (with full GHG saving line tables).

---

## Regulatory references embedded in the guide words

NORSOK S-003 · NORSOK S-002 · Aktivitetsforskriften · Forurensningsloven · EU IED · MARPOL Annex I/V · OSPAR Convention · REACH · Biocidal Products Regulation · Natura 2000 / Habitats Directive · ISO 14001 · CSRD / ESRS E1–E5 · Norwegian NOₓ Tax · EU ETS
