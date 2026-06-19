/* ============================================================================
   Demo data — entirely fictional.
   Sample project names, values, and findings invented for this UI demo. No real
   client, company, or planset data. Findings reference public NEC / IEEE code
   concepts only. The live tool runs an AI + rules pipeline over real PDFs; here
   the results are static fixtures so the UI can be explored without a backend.
   ============================================================================ */

export type Status = 'Pass' | 'Fail' | 'Needs Review' | 'Deferred'

export interface Issue {
  id: string
  category: string
  item_key: string
  title: string
  status: Status
  severity: 'low' | 'medium' | 'high'
  page_number: number | null
  evidence: string
  confidence: number
}

export interface CatSummary {
  name: string
  total: number
  Pass: number
  Fail: number
  'Needs Review': number
  Deferred: number
}

export interface Run {
  id: string
  project_name: string
  run_name: string
  original_filename: string
  created_at: string
  version: number
  is_latest: boolean
  design_stage: string
  created_by: string
  page_count: number
  indexed_sheets: number
  pdf_sheets: number
  issues: Issue[]
}

export interface Stage {
  stage: string
  runs: Run[] // newest version first
}

export interface Project {
  id: string
  name: string
  stages: Stage[]
}

let _id = 0
type Sev = 'low' | 'medium' | 'high'
const mk = (
  category: string,
  item_key: string,
  title: string,
  status: Status,
  severity: Sev,
  page_number: number | null,
  evidence: string,
  confidence = 0.9,
): Issue => ({
  id: `iss-${++_id}`,
  category,
  item_key,
  title,
  status,
  severity,
  page_number,
  evidence,
  confidence,
})

// ── Flagship run: Maplewood Solar, 60% design set ───────────────────────────
const maplewood60_v2: Issue[] = [
  // Cover Sheet
  mk('Cover Sheet', 'ai_cover_project_name', 'Project name present', 'Pass', 'low', 1,
    "Cover title block reads 'Maplewood Solar' with a matching address on E-001.", 0.96),
  mk('Cover Sheet', 'ai_cover_owner_info', 'Owner name, address, phone', 'Pass', 'low', 1,
    'Owner block lists legal name, mailing address, and phone number.', 0.94),
  mk('Cover Sheet', 'ai_cover_epc_info', 'EPC name, address, phone', 'Pass', 'low', 1,
    'EPC contact block fully populated.', 0.93),
  mk('Cover Sheet', 'ai_cover_der_number', 'DER / interconnection number', 'Fail', 'medium', 1,
    'No DER or interconnection application number found on the cover sheet; required before the IFC submission.', 0.88),
  mk('Cover Sheet', 'cover_building_codes', 'Building codes referenced', 'Pass', 'low', 1,
    'Cover cites NEC 2020 and IBC 2021 as the basis of design.', 0.90),

  // Title Block
  mk('Title Block', 'ai_tb_sheet_number', 'Sheet number on every page', 'Pass', 'low', null,
    'All sampled pages carry a unique sheet number in the title block.', 0.92),
  mk('Title Block', 'ai_tb_sheet_title', 'Sheet title on every page', 'Pass', 'low', null,
    'Each sampled page has a descriptive sheet title.', 0.92),
  mk('Title Block', 'ai_tb_eor_stamp', 'Engineer-of-Record stamp', 'Needs Review', 'medium', 1,
    'EOR stamp is present but appears unsigned on the 60% set; confirm a wet/digital signature before IFC.', 0.70),
  mk('Title Block', 'title_revision_block', 'Revision block populated', 'Pass', 'low', null,
    'Revision block shows Rev 2 with date and description.', 0.90),

  // Drawing Index
  mk('Drawing Index', 'drawing_index_present', 'All indexed sheets present', 'Pass', 'low', 2,
    '37 of 38 indexed sheets were located in the PDF.', 0.90),
  mk('Drawing Index', 'drawing_index_missing', 'Sheet E-203 indexed but missing', 'Fail', 'high', 2,
    "E-203 'Equipment Pad Details' is listed in the drawing index but no matching page was found in the submitted PDF.", 0.90),

  // System Information (E-001)
  mk('System Information', 'calc_module_count', 'Module count = string size × string qty', 'Pass', 'high', 3,
    'Module count 24,500 = 28 modules/string × 875 strings. Consistent.', 0.95),
  mk('System Information', 'calc_total_dc', 'Total DC = module qty × STC watts', 'Pass', 'high', 3,
    '24,500 × 555 W = 13,597.5 kWdc; stated 13,600 kWdc (within the 2% binning tolerance).', 0.95),
  mk('System Information', 'calc_dc_ac_ratio', 'DC/AC ratio within 1.10–1.50', 'Needs Review', 'medium', 3,
    'DC/AC = 13,600 / 8,960 = 1.52, slightly above the typical 1.50 ceiling; confirm against inverter warranty and client BOD.', 0.80),
  mk('System Information', 'ai_sld_inverter_match', 'Inverter make/model matches datasheet', 'Pass', 'medium', 3,
    'System-info inverter make/model matches the SLD equipment box and submitted datasheet.', 0.90),

  // Grounding Diagram
  mk('Grounding Diagram', 'ai_gnd_deep_mbj', 'Main bonding jumper — NEC 250.102(C)(1)', 'Pass', 'medium', 18,
    'MBJ shown at the service disconnect and sized per the NEC 250.102(C)(1) table.', 0.90),
  mk('Grounding Diagram', 'ai_gnd_deep_gec', 'Grounding electrode conductor — NEC 250.66', 'Pass', 'medium', 18,
    'GEC routed to the ground ring, sized per NEC 250.66.', 0.90),
  mk('Grounding Diagram', 'ai_gnd_deep_egc', 'Equipment grounding conductor — NEC 250.122', 'Needs Review', 'medium', 18,
    'EGC is shown but the conductor size is not legible at this scale; verify against NEC 250.122 for the 400 A feeder OCPD.', 0.70),
  mk('Grounding Diagram', 'ai_gnd_deep_rods', 'Ground rod count & spacing', 'Pass', 'low', 19,
    'Ground-rod array meets the 6 ft minimum spacing.', 0.88),
  mk('Grounding Diagram', 'ai_gnd_deep_xfmr', 'Transformer secondary grounding', 'Pass', 'medium', 18,
    'Transformer secondary neutral bonded and grounded per detail 3/E-180.', 0.90),

  // AC Single Line Diagram
  mk('AC Single Line Diagram', 'ai_sld_six_disconnect', 'Service disconnect grouping (≤6) — NEC 230.71', 'Pass', 'high', 11,
    'Each MV switchboard groups 6 source disconnecting means, within the NEC 230.71 limit.', 0.90),
  mk('AC Single Line Diagram', 'ai_sld_ampacity', 'Conductor ampacity vs OCPD — NEC 310.16', 'Needs Review', 'high', 11,
    'Feeder shown as 500 kcmil Cu on a 400 A breaker; the 75°C ampacity per NEC 310.16 is 380 A — confirm the temperature column and any derating.', 0.72),
  mk('AC Single Line Diagram', 'ai_sld_ocpd', 'Inverter output OCPD ≥ 1.25× continuous', 'Pass', 'medium', 11,
    'Inverter output breaker is 1.25× the continuous output current.', 0.90),
  mk('AC Single Line Diagram', 'ai_sld_surge', 'Surge arrester MCOV — IEEE C62.22', 'Deferred', 'low', 11,
    'Surge-arrester MCOV detail is an IFC-stage requirement; deferred at 60%.', 0.80),

  // Three Line Diagram
  mk('Three Line Diagram', 'ai_3ld_ctvt', 'CT/VT arrangement & ratios', 'Needs Review', 'medium', 12,
    'CT ratio 600:5 is legible; the VT ratio is not shown on the 3-line — confirm metering accuracy class with the utility.', 0.70),
  mk('Three Line Diagram', 'ai_3ld_relay', 'Relay IEEE 1547 trip settings', 'Deferred', 'medium', 12,
    'Protective-relay trip schedule is typically finalized at IFC; deferred at 60%.', 0.80),
  mk('Three Line Diagram', 'three_xfmr_z', 'Transformer impedance (%Z) shown', 'Pass', 'low', 12,
    'Transformer %Z and X/R are annotated on the 3-line.', 0.85),

  // Electrical Sheet
  mk('Electrical Sheet', 'electrical_vdrop', 'Voltage drop summary within limits', 'Pass', 'medium', 14,
    'Voltage-drop table shows 1.2% DC, 0.8% AC, 0.4% MV — all within the 3% design limit.', 0.90),
  mk('Electrical Sheet', 'electrical_conduit_fill', 'Conduit fill ≤ 40% — NEC Ch. 9', 'Pass', 'low', 14,
    'Largest raceway computes to 37% fill for 3+ conductors.', 0.88),
  mk('Electrical Sheet', 'electrical_wire_schedule', 'Wire schedule ampacity vs FLA', 'Fail', 'high', 14,
    'AC collection feeder is listed at 350 kcmil for a 460 A continuous load; the required ampacity after 1.25× is 575 A — the feeder appears undersized.', 0.82),

  // Labels
  mk('Labels', 'ai_labels_pv', 'PV system labels — NEC 690.13 / 705.10', 'Pass', 'low', 20,
    'Required PV disconnect and point-of-interconnection labels are called out.', 0.88),
  mk('Labels', 'ai_labels_arcflash', 'Arc-flash warning label present', 'Needs Review', 'medium', 20,
    'Arc-flash label is referenced in the notes but the incident-energy value is blank; confirm from the arc-flash study.', 0.70),
]

// v1 of the same set: two items that were later fixed were worse (a Fail and a
// harder NR), so the version history shows the rerun resolved real issues.
const REGRESSED_IN_V1: Record<string, Status> = {
  ai_sld_ampacity: 'Fail', // 75°C column was wrong in v1, corrected in v2 -> NR
  ai_gnd_deep_egc: 'Fail', // EGC size omitted in v1, added (but still verify) in v2 -> NR
}
const maplewood60_v1: Issue[] = maplewood60_v2.map((i) => ({
  ...i,
  id: `${i.id}-v1`,
  status: REGRESSED_IN_V1[i.item_key] ?? i.status,
}))

// ── Second project: Cedar Ridge, 30% set (earlier stage → more Deferred) ────
_id = 0
const cedar30: Issue[] = [
  mk('Cover Sheet', 'ai_cover_project_name', 'Project name present', 'Pass', 'low', 1,
    "Cover reads 'Cedar Ridge PV' with site address.", 0.95),
  mk('Cover Sheet', 'ai_cover_der_number', 'DER / interconnection number', 'Deferred', 'low', 1,
    'Interconnection number not expected until 60%; deferred at 30%.', 0.8),
  mk('Cover Sheet', 'cover_building_codes', 'Building codes referenced', 'Pass', 'low', 1,
    'Cover cites NEC 2020 and IBC 2021.', 0.9),
  mk('Drawing Index', 'drawing_index_present', 'All indexed sheets present', 'Pass', 'low', 2,
    '18 of 18 indexed sheets located in the PDF.', 0.9),
  mk('System Information', 'calc_module_count', 'Module count = string size × string qty', 'Pass', 'high', 3,
    '15,120 = 21 × 720. Consistent.', 0.95),
  mk('System Information', 'calc_dc_ac_ratio', 'DC/AC ratio within 1.10–1.50', 'Pass', 'medium', 3,
    'DC/AC = 1.34, within range.', 0.9),
  mk('System Information', 'calc_total_ac', 'Total AC = inverter qty × kVA', 'Needs Review', 'medium', 3,
    'Stated 8,400 kVA vs computed 8,360 kVA; confirm inverter derate at site temperature.', 0.75),
  mk('Grounding Diagram', 'ai_gnd_deep_mbj', 'Main bonding jumper — NEC 250.102(C)(1)', 'Deferred', 'low', 9,
    'Grounding plan is a 60% deliverable; deferred at 30%.', 0.8),
  mk('AC Single Line Diagram', 'ai_sld_six_disconnect', 'Service disconnect grouping (≤6) — NEC 230.71', 'Pass', 'high', 7,
    'Single switchboard with 4 source disconnects.', 0.9),
  mk('AC Single Line Diagram', 'ai_sld_ampacity', 'Conductor ampacity vs OCPD — NEC 310.16', 'Needs Review', 'high', 7,
    'Preliminary feeder sizes shown; confirm at 60% once conductor schedule is issued.', 0.7),
  mk('Three Line Diagram', 'ai_3ld_relay', 'Relay IEEE 1547 trip settings', 'Deferred', 'medium', 8,
    'Relay schedule finalized at IFC; deferred at 30%.', 0.8),
  mk('Electrical Sheet', 'electrical_wire_schedule', 'Wire schedule ampacity vs FLA', 'Deferred', 'medium', 11,
    'Conductor schedule not yet issued at 30%; deferred.', 0.8),
]

const run = (
  id: string, project_name: string, run_name: string, file: string, created_at: string,
  version: number, is_latest: boolean, stage: string, by: string,
  pages: number, indexed: number, pdf: number, issues: Issue[],
): Run => ({
  id, project_name, run_name, original_filename: file, created_at, version, is_latest,
  design_stage: stage, created_by: by, page_count: pages,
  indexed_sheets: indexed, pdf_sheets: pdf, issues,
})

export const PROJECTS: Project[] = [
  {
    id: 'p-maplewood',
    name: 'Maplewood Solar — 13.6 MWdc',
    stages: [
      {
        stage: '60',
        runs: [
          run('run-mw60-v2', 'Maplewood Solar — 13.6 MWdc', 'IFP review (clean-up pass)',
            'Maplewood_60pct_IFP_Rev2.pdf', '2026-06-12T15:20:00Z', 2, true, '60', 'A. Rivera (PE)',
            38, 38, 37, maplewood60_v2),
          run('run-mw60-v1', 'Maplewood Solar — 13.6 MWdc', 'IFP review (first pass)',
            'Maplewood_60pct_IFP_Rev1.pdf', '2026-06-05T13:05:00Z', 1, false, '60', 'A. Rivera (PE)',
            38, 38, 37, maplewood60_v1),
        ],
      },
      {
        stage: '30',
        runs: [
          run('run-mw30', 'Maplewood Solar — 13.6 MWdc', 'Concept set QC',
            'Maplewood_30pct.pdf', '2026-05-14T17:40:00Z', 1, true, '30', 'J. Okafor',
            22, 22, 22, cedar30.slice(0, 8)),
        ],
      },
    ],
  },
  {
    id: 'p-cedar',
    name: 'Cedar Ridge PV — 11.2 MWdc',
    stages: [
      {
        stage: '30',
        runs: [
          run('run-cr30', 'Cedar Ridge PV — 11.2 MWdc', 'Schematic design QC',
            'CedarRidge_30pct.pdf', '2026-06-09T19:10:00Z', 1, true, '30', 'M. Chen',
            18, 18, 18, cedar30),
        ],
      },
    ],
  },
]

export const DEMO_USER = { name: 'Demo Reviewer', email: 'demo@example.com' }

/** Default run shown on load: the latest Maplewood 60% version. */
export const DEFAULT_RUN_ID = 'run-mw60-v2'

export function statusCounts(issues: Issue[]): Record<Status, number> {
  const c: Record<Status, number> = { Pass: 0, Fail: 0, 'Needs Review': 0, Deferred: 0 }
  for (const i of issues) c[i.status]++
  return c
}

export function categorySummaries(issues: Issue[]): CatSummary[] {
  const map = new Map<string, CatSummary>()
  for (const i of issues) {
    let s = map.get(i.category)
    if (!s) {
      s = { name: i.category, total: 0, Pass: 0, Fail: 0, 'Needs Review': 0, Deferred: 0 }
      map.set(i.category, s)
    }
    s.total++
    s[i.status]++
  }
  return [...map.values()]
}
