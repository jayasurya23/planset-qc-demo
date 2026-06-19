/* ============================================================================
   Synthetic planset sheets: vector mock drawings used to demonstrate the
   tool's "clip a snippet" and "bounding-box overlay" features WITHOUT any real
   (confidential) client planset imagery.

   Each finding that has a located region maps (by item_key) to a sheet + a
   bounding box in the sheet's 1000×680 coordinate space. The same drawing is
   rendered two ways:
     • thumbnail  → SVG viewBox is set to the bbox  ⇒ a cropped "snippet"
     • full page  → viewBox is the whole sheet + a highlighted bbox rectangle
   ============================================================================ */
import type { CSSProperties } from 'react'

export type SheetId = 'sld' | 'gnd' | 'sched' | 'cover'
export interface BBox { x0: number; y0: number; x1: number; y1: number }

const W = 1000
const H = 680

// ── tiny drawing helpers ────────────────────────────────────────────────────
const STROKE = '#475467'
const FONT = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'
type TOpt = { fs?: number; b?: boolean; c?: string; a?: 'start' | 'middle' | 'end' }
const T = (x: number, y: number, s: string, o: TOpt = {}) => (
  <text x={x} y={y} fontSize={o.fs ?? 12} fontWeight={o.b ? 700 : 400} fill={o.c ?? STROKE}
    textAnchor={o.a ?? 'start'} fontFamily={FONT}>{s}</text>
)
const Box = (x: number, y: number, w: number, h: number, fill = '#fafbfc') => (
  <rect x={x} y={y} width={w} height={h} rx={3} fill={fill} stroke={STROKE} strokeWidth={1.3} />
)
const Line = (x1: number, y1: number, x2: number, y2: number) => (
  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={STROKE} strokeWidth={1.3} />
)

function Frame({ title, no }: { title: string; no: string }) {
  return (
    <g>
      <rect x={6} y={6} width={W - 12} height={H - 12} fill="#ffffff" stroke="#c9ced6" strokeWidth={2} />
      <rect x={6} y={6} width={W - 12} height={H - 12} fill="none" stroke="#e4e7ec" strokeWidth={6} opacity={0.4} />
      {/* title block, bottom-right */}
      <rect x={W - 286} y={H - 78} width={278} height={70} fill="#fafbfc" stroke="#c9ced6" />
      <line x1={W - 286} y1={H - 52} x2={W - 8} y2={H - 52} stroke="#e4e7ec" />
      {T(W - 278, H - 60, title, { b: true, fs: 12 })}
      {T(W - 278, H - 36, 'DEMO PLANSET / SAMPLE DATA', { fs: 10, c: '#98a2b3' })}
      {T(W - 278, H - 18, no, { b: true, fs: 14, c: '#1d2939' })}
    </g>
  )
}

// ── Sheet: AC Single Line Diagram ───────────────────────────────────────────
function SldSheet() {
  return (
    <g>
      <Frame title="AC SINGLE LINE DIAGRAM" no="E-300" />
      {/* utility → meter → transformer → switchboard */}
      {T(500, 40, 'UTILITY  34.5 kV', { b: true, a: 'middle' })}
      <circle cx={500} cy={64} r={14} fill="none" stroke={STROKE} strokeWidth={1.3} />
      {Line(500, 78, 500, 104)}
      {/* CT / VT metering */}
      <circle cx={452} cy={116} r={11} fill="none" stroke={STROKE} strokeWidth={1.3} />
      <circle cx={452} cy={138} r={11} fill="none" stroke={STROKE} strokeWidth={1.3} />
      {T(420, 162, 'CT 600:5 / VT', { fs: 11 })}
      {Line(500, 104, 500, 150)}
      {/* transformer (two circles) */}
      <circle cx={500} cy={162} r={16} fill="none" stroke={STROKE} strokeWidth={1.3} />
      <circle cx={500} cy={184} r={16} fill="none" stroke={STROKE} strokeWidth={1.3} />
      {T(540, 170, 'XFMR 34.5kV / 800V', { fs: 11 })}
      {T(540, 188, '%Z = 5.75   X/R = 7', { fs: 11, c: '#98a2b3' })}
      {Line(500, 200, 500, 232)}
      {/* feeder conductor callout */}
      {T(540, 224, '500 kcmil Cu · 400A', { fs: 11, c: '#b42318', b: true })}
      {/* MV switchboard bus */}
      {Line(170, 250, 830, 250)}
      {T(176, 242, 'MV SWITCHBOARD  800V', { fs: 11, b: true })}
      {/* six disconnect drops */}
      {[230, 290, 350, 410, 470, 530].map((x) => (
        <g key={x}>{Line(x, 250, x, 274)}<rect x={x - 7} y={274} width={14} height={16} fill="#fff" stroke={STROKE} /></g>
      ))}
      {T(300, 316, '6 SOURCE DISCONNECTS (NEC 230.71)', { fs: 10, c: '#027a48' })}
      {/* surge arrester */}
      {Line(770, 250, 770, 286)}
      <path d="M763 286 l7 14 l7 -14 z" fill="none" stroke={STROKE} strokeWidth={1.3} />
      {T(720, 320, 'SURGE ARR. MCOV', { fs: 10 })}
      {/* inverters row */}
      {[250, 430, 610].map((x, i) => (
        <g key={x}>
          {Line(x, 250, x, 360)}
          <rect x={x - 6} y={356} width={12} height={14} fill="#fff" stroke={STROKE} />
          {Box(x - 46, 372, 92, 46)}
          {T(x, 392, 'INVERTER', { a: 'middle', fs: 11, b: true })}
          {T(x, 408, '275 kW', { a: 'middle', fs: 10, c: '#98a2b3' })}
          {i === 0 && T(x - 70, 348, 'OCPD ≥1.25×', { fs: 9, c: '#475467' })}
        </g>
      ))}
    </g>
  )
}

// ── Sheet: Grounding Diagram ────────────────────────────────────────────────
function GndSheet() {
  const rod = (x: number) => (
    <g key={x}>{Line(x, 470, x, 520)}<path d={`M${x - 8} 520 h16 M${x - 5} 528 h10 M${x - 2} 536 h4`} stroke={STROKE} strokeWidth={1.3} /></g>
  )
  return (
    <g>
      <Frame title="GROUNDING DIAGRAM" no="E-120" />
      {/* service equipment + MBJ */}
      {Box(120, 90, 150, 80)}
      {T(132, 116, 'SERVICE', { b: true })}
      {T(132, 136, 'DISCONNECT', { fs: 11, c: '#98a2b3' })}
      {Line(195, 170, 195, 210)}
      {T(206, 196, 'MBJ #2 AWG Cu  (NEC 250.102)', { fs: 11, b: true })}
      {/* neutral-ground bus */}
      {Line(120, 210, 760, 210)}
      {T(124, 202, 'GROUNDING ELECTRODE SYSTEM', { fs: 10, c: '#98a2b3' })}
      {/* GEC down to ground ring */}
      {Line(300, 210, 300, 300)}
      {T(312, 270, 'GEC 2/0 Cu  (NEC 250.66)', { fs: 11, b: true })}
      {/* transformer secondary ground */}
      {Box(560, 90, 150, 80)}
      {T(572, 116, 'XFMR', { b: true })}
      {T(572, 136, 'SECONDARY', { fs: 11, c: '#98a2b3' })}
      {Line(635, 170, 635, 210)}
      {T(648, 196, 'XO BONDED + GROUNDED', { fs: 10 })}
      {/* EGC to equipment pad */}
      {Box(120, 360, 150, 70)}
      {T(132, 392, 'EQUIPMENT PAD', { fs: 11, b: true })}
      {Line(195, 360, 195, 300)}
      {Line(195, 300, 300, 300)}
      {T(206, 348, 'EGC (NEC 250.122)', { fs: 11, b: true, c: '#b42318' })}
      {/* ground ring + rods */}
      {Line(180, 460, 720, 460)}
      {T(184, 452, 'GROUND RING, BARE 2/0 Cu', { fs: 10, c: '#98a2b3' })}
      {[260, 380, 500, 620].map(rod)}
      {T(300, 560, 'GROUND RODS @ 6 ft MIN. SPACING', { fs: 10, c: '#027a48' })}
    </g>
  )
}

// ── Sheet: Schedules / System Info table ────────────────────────────────────
function SchedSheet() {
  const rows = [
    ['TAG', 'DESCRIPTION', 'SIZE', 'OCPD', 'RESULT'],
    ['F-1', 'AC collection feeder', '350 kcmil', '460A cont.', 'UNDERSIZED'],
    ['F-2', 'Inverter output', '4/0 Cu', '350A', 'OK'],
    ['F-3', 'MV riser', '1/0 15kV', 'n/a', 'OK'],
  ]
  const y0 = 120
  const rh = 34
  const cols = [40, 130, 470, 640, 800, 960]
  return (
    <g>
      <Frame title="CONDUCTOR & SYSTEM SCHEDULES" no="E-500" />
      {/* conductor schedule table */}
      {T(40, 104, 'CONDUCTOR SCHEDULE', { b: true })}
      {rows.map((r, ri) => (
        <g key={ri}>
          <rect x={cols[0]} y={y0 + ri * rh} width={cols[5] - cols[0]} height={rh}
            fill={ri === 0 ? '#f0f1f4' : ri === 1 ? '#fef3f2' : '#fff'} stroke="#d0d5dd" />
          {r.map((c, ci) => (
            <g key={ci}>{T(cols[ci] + 8, y0 + ri * rh + 22, c,
              { fs: 11, b: ri === 0, c: ri === 1 && ci === 4 ? '#b42318' : STROKE })}</g>
          ))}
        </g>
      ))}
      {/* system info block */}
      {T(40, 330, 'SYSTEM INFORMATION (E-001)', { b: true })}
      {[
        ['Module qty', '24,500'], ['Total DC', '13,600 kWdc'],
        ['Total AC', '8,960 kVA'], ['DC/AC ratio', '1.52'],
      ].map(([k, v], i) => (
        <g key={k}>
          <rect x={40} y={348 + i * 30} width={420} height={30} fill={i % 2 ? '#fafbfc' : '#fff'} stroke="#e4e7ec" />
          {T(52, 368 + i * 30, k, { fs: 11 })}
          {T(300, 368 + i * 30, v, { fs: 11, b: true, c: i === 3 ? '#93370d' : STROKE })}
        </g>
      ))}
      {/* voltage drop + conduit fill summary */}
      {T(520, 330, 'VOLTAGE DROP / FILL SUMMARY', { b: true })}
      {[
        ['VD: DC string', '1.2 %'], ['VD: AC collection', '0.8 %'],
        ['VD: MV', '0.4 %'], ['Max conduit fill', '37 %'],
      ].map(([k, v], i) => (
        <g key={k}>
          <rect x={520} y={348 + i * 30} width={440} height={30} fill={i % 2 ? '#fafbfc' : '#fff'} stroke="#e4e7ec" />
          {T(532, 368 + i * 30, k, { fs: 11 })}
          {T(840, 368 + i * 30, v, { fs: 11, b: true, c: '#027a48' })}
        </g>
      ))}
    </g>
  )
}

// ── Sheet: Cover / Title Block + Drawing Index ──────────────────────────────
function CoverSheet() {
  const idx = ['E-001 System Information', 'E-120 Grounding', 'E-203 Equipment Pad Details', 'E-300 AC Single Line']
  return (
    <g>
      <Frame title="COVER SHEET" no="E-000" />
      {T(40, 70, 'MAPLEWOOD SOLAR (13.6 MWdc)', { b: true, fs: 18, c: '#1d2939' })}
      {/* project info block */}
      {Box(40, 96, 440, 220, '#fff')}
      {[
        ['PROJECT:', 'Maplewood Solar'], ['OWNER:', 'Maplewood Renewables LLC'],
        ['EPC:', 'Sample EPC Co.'], ['DER #:', '________________'],
        ['CODES:', 'NEC 2020 · IBC 2021'],
      ].map(([k, v], i) => (
        <g key={k}>
          {T(56, 132 + i * 36, k, { fs: 12, b: true })}
          {T(190, 132 + i * 36, v, { fs: 12, c: k === 'DER #:' ? '#b42318' : STROKE })}
        </g>
      ))}
      {/* EOR stamp */}
      <circle cx={620} cy={180} r={62} fill="#fff" stroke={STROKE} strokeWidth={1.5} strokeDasharray="3 3" />
      {T(620, 168, 'ENGINEER', { a: 'middle', fs: 11, b: true })}
      {T(620, 186, 'OF RECORD', { a: 'middle', fs: 11 })}
      {T(620, 204, '(unsigned)', { a: 'middle', fs: 10, c: '#b42318' })}
      {/* drawing index */}
      {T(40, 360, 'DRAWING INDEX', { b: true })}
      {idx.map((s, i) => (
        <g key={s}>
          <rect x={40} y={376 + i * 30} width={520} height={30}
            fill={i === 2 ? '#fef3f2' : i % 2 ? '#fafbfc' : '#fff'} stroke="#e4e7ec" />
          {T(52, 396 + i * 30, s, { fs: 11, c: i === 2 ? '#b42318' : STROKE })}
          {i === 2 && T(470, 396 + i * 30, 'MISSING', { fs: 10, b: true, c: '#b42318' })}
        </g>
      ))}
    </g>
  )
}

const SHEETS: Record<SheetId, () => JSX.Element> = {
  sld: SldSheet, gnd: GndSheet, sched: SchedSheet, cover: CoverSheet,
}

// ── item_key → located region (sheet + bbox + caption) ──────────────────────
export const SNIPPETS: Record<string, { sheet: SheetId; bbox: BBox; caption: string }> = {
  // SLD
  ai_sld_six_disconnect: { sheet: 'sld', bbox: { x0: 190, y0: 232, x1: 560, y1: 326 }, caption: 'MV switchboard, 6 source disconnects' },
  ai_sld_ampacity: { sheet: 'sld', bbox: { x0: 470, y0: 206, x1: 720, y1: 250 }, caption: 'Transformer feeder conductor callout' },
  ai_sld_ocpd: { sheet: 'sld', bbox: { x0: 180, y0: 336, x1: 320, y1: 420 }, caption: 'Inverter output OCPD' },
  ai_sld_surge: { sheet: 'sld', bbox: { x0: 712, y0: 240, x1: 840, y1: 330 }, caption: 'Surge arrester' },
  ai_3ld_ctvt: { sheet: 'sld', bbox: { x0: 410, y0: 100, x1: 560, y1: 172 }, caption: 'CT / VT metering' },
  three_xfmr_z: { sheet: 'sld', bbox: { x0: 470, y0: 144, x1: 700, y1: 200 }, caption: 'Transformer %Z / X-R' },
  // Grounding
  ai_gnd_deep_mbj: { sheet: 'gnd', bbox: { x0: 188, y0: 176, x1: 540, y1: 216 }, caption: 'Main bonding jumper' },
  ai_gnd_deep_gec: { sheet: 'gnd', bbox: { x0: 290, y0: 230, x1: 560, y1: 310 }, caption: 'Grounding electrode conductor' },
  ai_gnd_deep_egc: { sheet: 'gnd', bbox: { x0: 110, y0: 300, x1: 360, y1: 430 }, caption: 'Equipment grounding conductor' },
  ai_gnd_deep_rods: { sheet: 'gnd', bbox: { x0: 180, y0: 444, x1: 720, y1: 570 }, caption: 'Ground rod array' },
  ai_gnd_deep_xfmr: { sheet: 'gnd', bbox: { x0: 558, y0: 160, x1: 860, y1: 216 }, caption: 'Transformer secondary grounding' },
  // Schedules / system info
  electrical_wire_schedule: { sheet: 'sched', bbox: { x0: 38, y0: 152, x1: 962, y1: 188 }, caption: 'Conductor schedule, F-1 (undersized)' },
  calc_dc_ac_ratio: { sheet: 'sched', bbox: { x0: 38, y0: 436, x1: 462, y1: 470 }, caption: 'System info: DC/AC ratio' },
  calc_module_count: { sheet: 'sched', bbox: { x0: 38, y0: 346, x1: 462, y1: 380 }, caption: 'System info: module quantity' },
  electrical_vdrop: { sheet: 'sched', bbox: { x0: 518, y0: 346, x1: 962, y1: 470 }, caption: 'Voltage-drop summary' },
  // Cover / index
  ai_cover_der_number: { sheet: 'cover', bbox: { x0: 48, y0: 228, x1: 480, y1: 262 }, caption: 'DER / interconnection number field' },
  ai_tb_eor_stamp: { sheet: 'cover', bbox: { x0: 552, y0: 112, x1: 690, y1: 250 }, caption: 'Engineer-of-Record stamp' },
  drawing_index_missing: { sheet: 'cover', bbox: { x0: 38, y0: 432, x1: 562, y1: 468 }, caption: 'Drawing index: E-203 missing' },
}

const pad = (b: BBox, p: number): BBox => ({ x0: b.x0 - p, y0: b.y0 - p, x1: b.x1 + p, y1: b.y1 + p })

export function SheetSvg({ sheet, bbox, mode, style }: {
  sheet: SheetId; bbox?: BBox; mode: 'thumb' | 'full'; style?: CSSProperties
}) {
  const Content = SHEETS[sheet]
  if (mode === 'thumb' && bbox) {
    const b = pad(bbox, 14)
    return (
      <svg viewBox={`${b.x0} ${b.y0} ${b.x1 - b.x0} ${b.y1 - b.y0}`}
        preserveAspectRatio="xMidYMid slice" style={style} role="img" aria-label="snippet">
        <Content />
      </svg>
    )
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={style} role="img" aria-label="page preview">
      <Content />
      {bbox && (
        <g>
          <rect x={bbox.x0} y={bbox.y0} width={bbox.x1 - bbox.x0} height={bbox.y1 - bbox.y0}
            fill="rgba(79,70,229,0.12)" stroke="#4f46e5" strokeWidth={2.5} rx={2} />
          {[[bbox.x0, bbox.y0], [bbox.x1, bbox.y0], [bbox.x0, bbox.y1], [bbox.x1, bbox.y1]].map(([cx, cy], i) => (
            <rect key={i} x={cx - 4} y={cy - 4} width={8} height={8} fill="#4f46e5" />
          ))}
        </g>
      )}
    </svg>
  )
}
