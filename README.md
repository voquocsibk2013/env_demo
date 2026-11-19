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
- **Environmental Budget card** — the project's itemised budget. Totals split by **MTO / MEL / Manual**, each with its own **NP and RP** total; category bars; one block per entry (badged MTO / MEL / Manual) with an editable line table — category, NP/RP, tCO₂e, note. Add / delete lines and entries (two-click confirm); every edit is written to the Changes log. Links to the Environmental Budget tab
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
- Category expand/collapse, skip / undo-skip per item. There is no search box and no blank form: every risk is added from a guide word
- Progress bar: added / skipped / remaining per category and overall
- Clicking the circle on a row opens the risk form with the guide word's aspect text; the row's sub-category fills the **Activity area** and its hint shows as the **Guide words**. The **description** (potential environmental impact) starts empty and is required, and all scoring starts unset. A new risk starts with neither **Action** nor **Info** chosen; Save needs one
- A registered row shows one reference chip per entry; clicking the row or a chip opens that entry's form, as the Risks register does. **Back**, **Cancel** or **Save** return to Screening as it was left: the same list and open categories, with that row in view. **+** adds another entry under the same guide word

### Opportunity screening
- Scope-based prompts: Scope 1 (direct), Scope 2 (energy / system), Scope 3 (materials, transport, lifecycle, re-use)
- Each prompt opens the opportunity form with its type and the relevant GHG saving lines; the **description** starts empty and is required, and all scoring starts unset
- **Guide words** — a small **i** after each row's label; hovering or focusing it shows that category's guide words from the "Sustainability opportunities" sheet of the screening template (S-TPL-022). Escape or a click elsewhere closes it; a click on the **i** keeps it open (touch screens). It opens above the row when there is more room there and stays inside the visible part of the list, scrolling if the list is short
- **Opportunity sub-descriptions always stay visible** after registration (same treatment as risk hints)
- NOₓ tax warning for NOₓ-related opportunities
- Skip / undo-skip. No search box and no blank form; a registered row opens its entries in the Opportunities form and, as for risks, closing the form returns to this list with the row in view. **+** adds another entry under the same category
- **AI suggestion panel** — sends a query to Claude Sonnet via the Anthropic API to generate aspect suggestions for a given scenario

#### Disciplines & phases view
A second view of the Opportunities list (**Checklist** / **Disciplines & phases** switch at its top): a read-only table of the same template sheet. For each of the 42 opportunity guide words in 12 categories it shows:

- **Disciplines involved** — Process · Mechanical · Piping layout · Structural · Electrical · Instrument controls · HVAC · Tech safety · PRE PRB
- **Phase of savings** — Project phase study / execution · Installation & commissioning · Operation & maintenance · End of life / decommissioning

An **x** is a mark in the template. Nothing in this view is stored with the project. The data lives in `OPP_GUIDE` in `src/App.jsx`; the template's spelling slips are corrected, its wording is otherwise unchanged.

---

## Risks

Full risk register. Aspects are added from the Screening tab; this tab edits, filters and deletes them.

### Risk form
The same form opens from Screening (a new risk) and from this register (an edit). Its sections run: **Activity details**, **Controls & management** (Action risks only), **Significance scoring**. All three carry the risk's red rail. Activity details and Controls & management are white. Significance scoring is tinted light red, as the opportunity form's priority card is tinted teal. Its score line is laid out like the opportunity score: a rule above it, then the risk score in a chip, then the result. The chip and the result take the colour of the significance; while the risk is not scored, they are grey. A Yes on a requirement with no C × P score shows SIGNIFICANT with the chip still at N/A. Otherwise colour marks meaning only, as in the Action / Info switch. In a narrow window the fields drop to fewer columns, down to one.

**Activity details**, laid out like the opportunity form:

| Field | Notes |
|---|---|
| Category | Read-only: the guide word's Screening category (e.g. "1. Emission to Air"), the same as the register's Category column, as a tag the width of its name (a long name wraps), tinted and edged in the category's Screening colour; its words use the colour's text shade, which contrasts more with the tint than the heading shade (darker in the light theme, lighter in the dark one) |
| Activity area | Free text; starts as the guide word's sub-category |
| Guide words | Read-only: the hint of the Screening row the risk was made from. A risk without a guide word shows its own activity text |
| Phase | Multi-select chips: Engineering · Procurement · Construction · Installation · Commissioning · Operations & Maintenance · Decommissioning |
| Description — potential environmental impact | **Required**; starts empty with a hint |
| Potential environmental impacts | Read-only list beside the description, per guide word (`RISK_IMPACTS` in `src/App.jsx`). Blank until the list is supplied |
| Status | **Action** / **Info** switch, in the last row. Neither is chosen on a new risk, or on a saved one without a status, and Save needs one. A status from before the switch (Open, Closed…) is kept as it is and shows as a third, chosen button until Action or Info is picked |
| Abnormal condition | Checkbox; when ticked, a type (unexpected findings, equipment breakdown, unplanned modification, scheduling change, other) and a description |

The environmental aspect text is set from the guide word when the risk is registered and shown in the register, dashboard and PDF. It is not edited in the form.

**Controls & management**, shown for an **Action** risk only. An **Info** risk hides it and keeps anything already entered:

| Field | Notes |
|---|---|
| Key control measure | Free text, **required** |
| Legal / regulatory references | A guide-word aspect shows the same citations, links and per-project notes as Screening → Legal references (notes can be edited here and are saved with the aspect). An aspect without a guide word keeps a single free-text box |
| Owner | Free text, **required** |

**Significance scoring**:

| Field | Notes |
|---|---|
| Consequence (C) | **1 — Negligible** · 2 — Minor · 3 — Moderate · 4 — Major · **5 — Catastrophic**. **Required** for an Action risk |
| Probability (P) | **1 — Very unlikely (0–1%)** · 2 — Unlikely · 3 — Possible · 4 — Likely · **5 — Very likely (50–100%)**. **Required** for an Action risk |
| Legal requirement | Y/N (stored as `legalThreshold`) |
| Client/stakeholder requirement | Y/N (stored as `stakeholderConcern`) |
| Reference | Free text (`legalRefExtra`), mainly for the requirement behind a Y. Shown when either requirement is Y, when it already holds text, and while it is being edited. Hand-typed references from records saved before this field existed move here |
| Receptor sensitivity | High / Medium / Low |
| Scale | Global / Regional / Local |
| Duration | Permanent (>10yr) / Long-term (1-10yr) / Temporary (<1yr) |

Every scoring field starts at **—**. Until both C and P are chosen the score reads **N/A** and the risk **Not scored**.

Save stays disabled until the description is filled in, and for an Action risk also C, P, the key control measure and the owner. The line beside Save lists what is still missing.

### Significance calculation
- **Significant** — C = 5; or C = 4 & P ≥ 4; or C = 3 & P = 5; or legal requirement / client/stakeholder requirement = Y
- **Medium** — remaining combinations above Low
- **Low** — C = 1; C = 2 & P ≤ 2; C = 3 & P = 1
- **Not scored** — C or P not set yet, and no legal or client/stakeholder requirement. Never counted as Low, and not plotted on the matrix

### Risk table
- Columns: Ref · Phase · Area · Activity · Aspect · C · P · Score · Significance · Status · Condition · Scale · Created · Modified
- Sortable by any column; filter by significance: All / Significant / Medium / Low / Not scored. No search box and no add button
- The **Not scored** filter lists every aspect still missing C or P, including one that a legal or client/stakeholder requirement already makes Significant (it shows under both filters)
- Row left-border coloured by environmental category
- Bulk select → bulk delete or bulk status change. Bulk **Action** leaves out any selected risk that lacks what an Action risk needs (description, C, P, key control measure, owner) and names it

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
- **Category** — read-only tag, as in the risk form: the opportunity's scope, named and coloured as its Screening header: **Scope 1 — Direct Emissions** (red), **Scope 2 — Indirect Emissions** (blue), **Scope 3 — Value Chain Emissions** (teal). It follows a scope type; for an older free type it comes from the Screening button the opportunity was made from, else it shows "—" (a colour alone is not used: opportunities from the earlier stage guide words carry their section's colour, not a scope's)
- Type (Scope 1 / 2 / 3 dropdown; read-only for a Scope 1 Screening button that brings its own GHG line). The list always shows the stored type: a type Screening wrote with an option's label (e.g. "Scope 3 — Waste evaluation") shows as that option, and an older free type (e.g. "Low-Carbon Technology") shows as itself. The stored text changes only when another type is picked
- Description, environmental benefit, business benefit, technical benefit
- **Materiality (CSRD)** — three buttons like the risk form's Action / Info switch: **Inside-out** (positive impact on environment, teal), **Outside-in** (financial / business benefit, blue), **Both** (purple; a new opportunity's choice), in the register's colours. The full option text is stored as before. A value saved outside the three (the demo's "Environmental") shows as a fourth, chosen button until another is picked
- **Environmental Value (1–5):** dropdown — 1 Negligible · 2 Minor · 3 Moderate · **4 Significant** · **5 Major**
- **Business Value (1–5):** dropdown — 1 No benefit · 2 Low · 3 Moderate · **4 High** · **5 Strategic**
- **Feasibility (1–5):** dropdown — 1 Very difficult · 2 Difficult · 3 Moderate · **4 Achievable** · **5 Easy**
- All three scores start unset (**—**). The score reads **N/A** until all three are chosen; the priority reads **Not scored** until Environmental Value and Feasibility are chosen (Business Value only feeds the score and the dot size), the same rule the matrix and the PDF use
- **Phase** — the same EPCIC phase chips as the risk form
- **Guide words** — the template's guide words for the opportunity's category, shown beside the description. The description is required and starts empty
- Owner
- The saving estimate is **quantitative only**. Qualitative phases can no longer be added or edited; notes saved by earlier versions stay visible, read-only
- **Savings estimate** — quantitative saving phases. A phase's table shows the rows for the opportunity's type (every row for a type without a scope). **+ Add row from the full table**, under the table, adds any other row, listed by scope, to the phase being edited, and **+ Add full table** beside it adds all the rest at once; an added row shows in its scope's group and carries into the next phase. Both disappear when every row is shown. An added row has an **×** to take it out again (a second click confirms), which clears its numbers. Custom rows can no longer be added; ones saved earlier show in their scope's group whenever that group is shown, and can be edited or removed there. Any row shown takes a value, also in a phase saved by an earlier version that holds only the rows that had numbers. Under the table, one line gives the fixed conversion factors. The full table:
  - Scope 1: CO₂ · NOₓ · CH₄ · nmVOC · Other (e.g. chemicals) · Other (e.g. refrigerants / GWP gases) · Other
  - Scope 2: Reduction in energy consumption (kWh, EF 0.57 kgCO₂e/kWh)
  - Scope 3 Cat 1: reuse of material and simplified design, each for steel and for other material
  - Scope 3 Cat 4: material · added / modified systems needed

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
- Columns: Ref · Phase · Type · Description · Score · Priority (quadrant label, or Not scored) · GHG saving · Materiality · Created · Modified
- No status column (status removed from opportunities)
- Sortable, bulk delete. No search box and no add button — opportunities are added from the Screening tab
- Opportunities without an environmental value or feasibility are not plotted on the matrix; a line under it says how many

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

### Add to dashboard
- **Additive** — appends itemised entries to `project.footprintEntries`; nothing already on the dashboard is overwritten. A calculation never touches the dashboard on its own
- The panel lists each source present in the workbook (**MTO**, **MEL**) with its lines, rows, tCO₂e and NP/RP; tick which to add and rename each entry. Rows with errors are left out and called out
- Each entry is one source × COR category × NP/RP lines, labelled with its source, file and date. Entries are snapshots of the result when added
- If an entry for the same source from the same file (or an earlier pre-entries summary) is already there, the panel warns it would be counted twice. Default is "add as a separate entry"; "replace" is an explicit choice behind a second confirm click and logs what was discarded
- After a reload the row detail is gone, so only per-source totals can be added (one "All categories" line each)
- Writes the tab's working state (`result`, `corOverrides`, `meta`, `fileName`) and the entries in one atomic `onChange`; the calculation-complete handler reads the latest project via a ref so dashboard edits made while it runs aren't overwritten
- Dashboard edits commit on blur/Enter (Escape reverts; numbers accept `12.5`, `12,5`, `1 234,5`; an unparseable number is kept and flagged, never silently dropped). Each edit is a Changes-log entry with before → after

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

- Every add / edit / delete of an aspect or opportunity writes an entry with timestamp, action type, detail text, and per-field before → after values. A risk edit logs, among others, its status, legal requirement, client/stakeholder requirement, reference, key control measure and owner
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
4. **Environmental Budget** — MTO / MEL / Manual / Combined cards (shown only if the dashboard has budget entries)
5. **Risk Register table** — Ref · Aspect · Area · Phase · Significance (or Not scored) · Status (no score columns)
6. **Opportunity Register table** — Ref · Phase · Type · Description · Priority (quadrant, or Not scored) · GHG saving · Materiality (no score column)

Unscored aspects and opportunities are listed in the tables but not plotted on the matrices.
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
- Per-project: total aspects, Significant / Medium / Low / Not scored bar (Not scored only when there are some), total opportunities, GHG savings, Environmental Budget total with its MTO / MEL split (if the project has budget entries)
- Contract-level and portfolio totals; the contract summary also counts aspects and opportunities that are not scored yet

---

## Global UI

- **Light / dark mode** toggle; persists to `localStorage`
- **Zoom** — 5 levels (80–120%); persists across sessions
- **CSS variable token system** — all colours derive from a single theme object (`T`); dark mode swaps the same tokens
- Tabs: Dashboard · Screening · Risks · Opportunities · Environmental Budget · Waste Handling · BAT · Attendees · Changes · Settings

---

## Technology

| Layer | Choice |
|---|---|
| Framework | React 18 (Create React App) |
| Excel parsing | SheetJS (xlsx 0.18.x) |
| Heavy calculation | Web Worker (`fpWorker.js`) |
| AI suggestions | Anthropic API (Claude Sonnet) — direct browser fetch |
| Persistence | `localStorage` (single JSON blob) |
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
  footprintEntries   — the itemised dashboard budget: [{ id, source: MTO|MEL|Manual, label, file, addedAt, lines: [{ id, category, mhc: NP|RP|"", tco2e, rows?, note? }] }]
  footprintSummary   — DERIVED from footprintEntries and rewritten on every change (combined, mtoTotal, melTotal, manualTotal, npTotal, rpTotal, per-source total/NP/RP, catBreakdown, date); read by the portfolio overview and PDF. Projects saved before entries existed show their old summary as editable "Earlier summary" entries
}
```

**Aspect fields:** ref · phase · area · activity · aspect · condition · impact · receptors · recSensitivity · scale · severity (C 1–5, 0 = not scored) · probability (P 1–5, 0 = not scored) · legalThreshold · stakeholderConcern · control · legalRef (for a guide-word aspect: the citation list as text, refreshed on save) · legalRefExtra (free-text other reference; an aspect saved before this field existed has any hand-typed references that are not the guide word's citations moved here when it is next opened) · owner · status (Action / Info; empty only before one is chosen) · `_color` · `_screeningId`

**Opportunity fields:** ref · type · phase · description · scope · envValue · bizValue · feasibility (each 1–5, 0 = not scored) · owner · materiality · qualPhases[] (read-only, from earlier versions) · ghgPhases[] (GHG saving lines per snapshot; a line added from the full table has `added: true`, a free line from earlier versions `custom: true`)

Several aspects or opportunities can share one `_screeningId` (one guide word can hold more than one entry). Per-project legal notes are in `project.legalRefNotes`, keyed `<guide-word id>#<citation index>`.

---

## Regulatory references in guide words

NORSOK S-003 · NORSOK S-002 · Aktivitetsforskriften · Forurensningsloven · EU IED · MARPOL Annex I/V · OSPAR Convention · REACH · Biocidal Products Regulation · Natura 2000 / Habitats Directive · ISO 14001 · CSRD / ESRS E1–E5 · Norwegian NOₓ Tax · EU ETS
