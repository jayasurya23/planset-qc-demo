import { useMemo, useState } from 'react'
import {
  PROJECTS, DEMO_USER, DEFAULT_RUN_ID,
  statusCounts, categorySummaries,
  type Run, type Issue, type Status, type Project,
} from './demoData'
import { SNIPPETS, SheetSvg } from './sheets'

const STAGE_LABEL: Record<string, string> = {
  '30': '30%', '60': '60%', '90': '90%', IFC: 'IFC', AsBuilt: 'As-Built',
}
const badgeClass: Record<Status, string> = {
  Pass: 'badge-pass', Fail: 'badge-fail', 'Needs Review': 'badge-review', Deferred: 'badge-deferred',
}
const cardClass: Record<Status, string> = {
  Pass: 'card-pass', Fail: 'card-fail', 'Needs Review': 'card-review', Deferred: 'card-deferred',
}
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })

// Flatten all runs for quick lookup by id.
const ALL_RUNS: Record<string, Run> = {}
for (const p of PROJECTS) for (const s of p.stages) for (const r of s.runs) ALL_RUNS[r.id] = r

type StatusFilter = 'All' | Status

function Pills({ counts }: { counts: Record<Status, number> }) {
  return (
    <div className="run-item-pills">
      {counts.Pass > 0 && <span className="pill pill-p">{counts.Pass}</span>}
      {counts.Fail > 0 && <span className="pill pill-f">{counts.Fail}</span>}
      {counts['Needs Review'] > 0 && <span className="pill pill-r">{counts['Needs Review']}</span>}
    </div>
  )
}

function Sidebar({
  selectedRunId, onSelect,
}: { selectedRunId: string; onSelect: (id: string) => void }) {
  const [openProjects, setOpenProjects] = useState<Record<string, boolean>>(
    Object.fromEntries(PROJECTS.map((p) => [p.id, true])),
  )
  const [openVersions, setOpenVersions] = useState<Record<string, boolean>>({})

  const renderProject = (p: Project) => {
    const runCount = p.stages.reduce((n, s) => n + s.runs.length, 0)
    const open = openProjects[p.id]
    return (
      <div className="proj-group" key={p.id}>
        <button className="proj-head" onClick={() => setOpenProjects((s) => ({ ...s, [p.id]: !open }))}>
          <span className="proj-caret">{open ? '▼' : '▶'}</span>
          <span className="proj-name">{p.name}</span>
          <span className="proj-count">{runCount}</span>
        </button>
        {open && p.stages.map((stage) => {
          const latest = stage.runs[0]
          const counts = statusCounts(latest.issues)
          const verKey = `${p.id}-${stage.stage}`
          const showVers = openVersions[verKey]
          return (
            <div className="stage-group" key={verKey}>
              <div className="stage-group-head">
                <span className={`stage-badge stage-badge-dark stage-${stage.stage}`}>
                  {STAGE_LABEL[stage.stage] ?? stage.stage} set
                </span>
              </div>
              <div className="lineage">
                <button
                  className={`run-item ${selectedRunId === latest.id ? 'active' : ''}`}
                  onClick={() => onSelect(latest.id)}
                >
                  <div className="run-item-name">{latest.run_name}</div>
                  <div className="run-item-date">{fmtDate(latest.created_at)}</div>
                  <div className="run-item-meta">{latest.original_filename}</div>
                  <Pills counts={counts} />
                  <span className="run-item-eng">{latest.created_by}</span>
                </button>
                {stage.runs.length > 1 && (
                  <>
                    <button
                      className="ver-toggle"
                      onClick={() => setOpenVersions((s) => ({ ...s, [verKey]: !showVers }))}
                    >
                      {showVers ? '▾' : '▸'} {stage.runs.length} versions
                    </button>
                    {showVers && (
                      <div className="ver-list">
                        {stage.runs.map((v) => (
                          <button
                            key={v.id}
                            className={`ver-item ${selectedRunId === v.id ? 'active' : ''}`}
                            onClick={() => onSelect(v.id)}
                          >
                            <span className="ver-num">v{v.version}</span>
                            <span className="ver-date">{fmtDate(v.created_at)}</span>
                            {v.is_latest && <span className="ver-tag">latest</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <aside className="side">
      <div className="side-head">
        <div className="brand">
          <div className="brand-mark">PQ</div>
          <div className="brand-text">
            <span className="brand-sub">Interactive Demo</span>
            <span className="brand-name">Planset QC</span>
          </div>
        </div>
      </div>
      <div className="upload-form">
        <div className="planset-drop planset-drop-filled">
          <div className="planset-drop-row">
            <span className="planset-drop-icon">📄</span>
            <span className="planset-drop-text">Drop a planset PDF (disabled in demo)</span>
          </div>
        </div>
      </div>
      <div className="run-list">
        <div className="run-list-head">
          <span className="run-list-title">Projects</span>
          <span className="run-list-count">{PROJECTS.length}</span>
        </div>
        {PROJECTS.map(renderProject)}
      </div>
    </aside>
  )
}

function Profile() {
  const [open, setOpen] = useState(false)
  const initials = DEMO_USER.name.split(' ').map((w) => w[0]).join('').slice(0, 2)
  return (
    <div className="profile-widget">
      <button className="profile-btn" onClick={() => setOpen((o) => !o)}>
        <span className="profile-avatar">{initials}</span>
        <span className="profile-name">{DEMO_USER.name}</span>
        <span className="profile-caret">▾</span>
      </button>
      {open && (
        <>
          <div className="profile-backdrop" onClick={() => setOpen(false)} />
          <div className="profile-menu">
            <div className="profile-menu-head">
              <span className="profile-avatar profile-avatar-lg">{initials}</span>
              <div className="profile-menu-id">
                <div className="profile-menu-name">{DEMO_USER.name}</div>
                <div className="profile-menu-email">{DEMO_USER.email}</div>
              </div>
            </div>
            <div className="profile-menu-item" style={{ cursor: 'default', color: 'var(--text3)' }}>
              Demo mode, no sign-in required
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function ScoreCards({ run, active, onPick }: {
  run: Run; active: StatusFilter; onPick: (s: StatusFilter) => void
}) {
  const c = statusCounts(run.issues)
  const card = (key: StatusFilter, val: number, lab: string, cls: string) => (
    <div
      className={`sc ${cls}`}
      style={active === key ? { borderColor: 'var(--blue)' } : undefined}
      onClick={() => onPick(active === key ? 'All' : key)}
    >
      <div className="sc-val">{val}</div>
      <div className="sc-lab">{lab}</div>
    </div>
  )
  return (
    <div className="scores">
      {card('Pass', c.Pass, 'Pass', 'sc-pass')}
      {card('Fail', c.Fail, 'Fail', 'sc-fail')}
      {card('Needs Review', c['Needs Review'], 'Needs Review', 'sc-review')}
      {card('Deferred', c.Deferred, 'Deferred', 'sc-deferred')}
      <div className="sc sc-total"><div className="sc-val">{run.indexed_sheets}</div><div className="sc-lab">Sheets indexed</div></div>
      <div className="sc sc-actual"><div className="sc-val">{run.pdf_sheets}</div><div className="sc-lab">Sheets in PDF</div></div>
    </div>
  )
}

function IssueCard({ issue, onOpen }: { issue: Issue; onOpen: (i: Issue) => void }) {
  const [showFull, setShowFull] = useState(false)
  const isAI = issue.item_key.startsWith('ai_')
  const snip = SNIPPETS[issue.item_key]
  return (
    <div className={`card ${cardClass[issue.status]}`}>
      <div className="card-row">
        <span className={`badge ${badgeClass[issue.status]}`}>{issue.status}</span>
        <span className={`sev sev-${issue.severity}`}>{issue.severity.toUpperCase()}</span>
        <div className="card-body" onClick={() => onOpen(issue)} style={{ cursor: 'pointer' }}>
          <div className="card-title">
            {isAI && <span className="ai">AI</span>}
            {issue.title}
          </div>
          <div className="card-sub">{issue.category}</div>
        </div>
        <span className="card-conf">{Math.round(issue.confidence * 100)}% conf.</span>
        {issue.page_number != null && <span className="pg" onClick={() => onOpen(issue)}>p{issue.page_number}</span>}
      </div>
      {snip && (
        <button className="card-thumb" onClick={() => onOpen(issue)} title="Clipped from the drawing. Click for the full page + bounding box">
          <SheetSvg sheet={snip.sheet} bbox={snip.bbox} mode="thumb"
            style={{ display: 'block', width: '100%', height: 150, background: '#fff' }} />
        </button>
      )}
      {issue.evidence && (
        <div className="card-evidence" onClick={() => setShowFull((s) => !s)}>
          <span className="card-evidence-label">Evidence</span>
          <span className={`card-evidence-text ${showFull ? 'card-evidence-full' : ''}`}
            style={showFull ? undefined : { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {issue.evidence}
          </span>
        </div>
      )}
    </div>
  )
}

function DetailModal({ issue, onClose }: { issue: Issue; onClose: () => void }) {
  const snip = SNIPPETS[issue.item_key]
  return (
    <div className="overlay" onClick={onClose}>
      <div className="detail" onClick={(e) => e.stopPropagation()}>
        <div className="detail-head">
          <div>
            <div className="detail-crumb">{issue.category}{issue.page_number != null ? ` · page ${issue.page_number}` : ''}</div>
            <div className="detail-title">{issue.title}</div>
            <div className="detail-tags">
              <span className={`badge ${badgeClass[issue.status]}`}>{issue.status}</span>
              <span className={`sev sev-${issue.severity}`}>{issue.severity.toUpperCase()}</span>
              <span className="badge badge-neutral">{Math.round(issue.confidence * 100)}% confidence</span>
            </div>
          </div>
          <button className="detail-close" onClick={onClose}>×</button>
        </div>
        {snip ? (
          <div className="detail-img-wrap detail-img-fit">
            <SheetSvg sheet={snip.sheet} bbox={snip.bbox} mode="full"
              style={{ display: 'block', width: '100%', maxHeight: '60vh', background: '#fff', borderTop: '1px solid var(--bg)', borderBottom: '1px solid var(--bg)' }} />
            <div className="detail-zoom-hint">bounding box · {snip.caption}</div>
          </div>
        ) : (
          <div className="detail-desc">
            This finding has no located drawing region (e.g., a whole-sheet or document-level
            check), so there is no snippet to clip.
          </div>
        )}
        <div className="detail-evidence">
          <strong>Evidence</strong>
          <p>{issue.evidence}</p>
        </div>
        {snip && (
          <div className="detail-desc">
            The highlighted rectangle is the finding's <strong>bounding box</strong> on the page; the
            card thumbnail is that region <strong>clipped</strong> from the sheet. (Synthetic sample
            drawing, no real planset data.)
          </div>
        )}
        <div className="detail-foot">
          <button className="btn-cancel" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [selectedRunId, setSelectedRunId] = useState(DEFAULT_RUN_ID)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All')
  const [catFilter, setCatFilter] = useState<string>('All')
  const [openIssue, setOpenIssue] = useState<Issue | null>(null)

  const run = ALL_RUNS[selectedRunId]
  const cats = useMemo(() => categorySummaries(run.issues), [run])

  const visible = useMemo(() => {
    const sevRank = { high: 0, medium: 1, low: 2 } as const
    const statusRank: Record<Status, number> = { Fail: 0, 'Needs Review': 1, Deferred: 2, Pass: 3 }
    return run.issues
      .filter((i) => statusFilter === 'All' || i.status === statusFilter)
      .filter((i) => catFilter === 'All' || i.category === catFilter)
      .sort((a, b) => statusRank[a.status] - statusRank[b.status] || sevRank[a.severity] - sevRank[b.severity])
  }, [run, statusFilter, catFilter])

  const filterBtn = (key: StatusFilter, label: string, cls: string, val: number) => (
    <button
      className={`fb ${cls} ${statusFilter === key ? 'fb-on' : ''}`}
      onClick={() => setStatusFilter(key)}
    >
      {label} <strong>{val}</strong>
    </button>
  )
  const c = statusCounts(run.issues)

  return (
    <div className="app">
      <Sidebar selectedRunId={selectedRunId} onSelect={(id) => { setSelectedRunId(id); setStatusFilter('All'); setCatFilter('All') }} />
      <Profile />

      <main className="content">
        <div style={{
          background: 'var(--purple-bg)', color: 'var(--purple-fg)', border: '1px solid var(--purple)',
          borderRadius: 'var(--r)', padding: '8px 14px', fontSize: 13, fontWeight: 600,
        }}>
          Interactive demo · sample data only. Not affiliated with any company or real project.
          The live tool runs an AI + rules pipeline over uploaded PDFs.
        </div>

        <div className="hdr">
          <div>
            <div className="hdr-title-row">
              <span className="hdr-title">{run.project_name}</span>
              <span className="hdr-version">v{run.version}</span>
              <span className={`stage-badge stage-badge-light stage-${run.design_stage}`}>
                {STAGE_LABEL[run.design_stage] ?? run.design_stage} set
              </span>
              {!run.is_latest && <span className="hdr-superseded">superseded</span>}
            </div>
            <div className="hdr-meta">
              {run.run_name} · {run.original_filename} · {fmtDate(run.created_at)} · {run.page_count} pages · {run.created_by}
            </div>
            <div className="gem">
              <span className="gem-dot" />
              <span className="gem-text">AI vision + rules engine + cross-sheet consistency</span>
              <span className="gem-sep">●</span>
              <span className="gem-text">{run.issues.length} checks</span>
            </div>
          </div>
          <div className="hdr-right">
            <button className="hdr-btn">Export</button>
            <button className="hdr-btn hdr-btn-accent">Re-analyze</button>
          </div>
        </div>

        <ScoreCards run={run} active={statusFilter} onPick={setStatusFilter} />

        <div className="workspace">
          <nav className="cat-nav">
            <button className={`cat-item ${catFilter === 'All' ? 'cat-active' : ''}`} onClick={() => setCatFilter('All')}>
              <span className="cat-icon cat-icon-all">All</span>
              <div className="cat-info"><span className="cat-label">All categories</span></div>
              <span className="cat-count">{run.issues.length}</span>
            </button>
            {cats.map((cat) => {
              const pct = Math.round((cat.Pass / cat.total) * 100)
              return (
                <button
                  key={cat.name}
                  className={`cat-item ${catFilter === cat.name ? 'cat-active' : ''}`}
                  onClick={() => setCatFilter(cat.name)}
                >
                  <span className="cat-icon cat-icon-review">{cat.total}</span>
                  <div className="cat-info">
                    <span className="cat-label">{cat.name}</span>
                    <div className="cat-bar"><div className="cat-bar-fill" style={{ width: `${pct}%` }} /></div>
                  </div>
                  <div className="cat-nums">
                    {cat.Fail > 0 && <span className="cn-f">{cat.Fail}</span>}
                    {cat['Needs Review'] > 0 && <span className="cn-r">{cat['Needs Review']}</span>}
                  </div>
                </button>
              )
            })}
          </nav>

          <section className="issue-panel">
            <div className="toolbar">
              <div className="toolbar-filters">
                {filterBtn('All', 'All', 'fb-all', run.issues.length)}
                {filterBtn('Pass', 'Pass', 'fb-pass', c.Pass)}
                {filterBtn('Fail', 'Fail', 'fb-fail', c.Fail)}
                {filterBtn('Needs Review', 'Needs Review', 'fb-review', c['Needs Review'])}
                {filterBtn('Deferred', 'Deferred', 'fb-deferred', c.Deferred)}
              </div>
            </div>
            <div className="issue-list">
              {visible.map((i) => <IssueCard key={i.id} issue={i} onOpen={setOpenIssue} />)}
              {visible.length === 0 && <div className="dim" style={{ padding: 24 }}>No findings match this filter.</div>}
            </div>
          </section>
        </div>
      </main>

      {openIssue && <DetailModal issue={openIssue} onClose={() => setOpenIssue(null)} />}
    </div>
  )
}
