import { useEffect, useMemo, useRef, useState } from "react";
import DOMPurify from "dompurify";
import {
  Activity, ArrowDownToLine, ArrowRight, BookOpen, Check, CheckCircle2, ChevronDown, ChevronRight,
  CircleHelp, Clock3, FileCheck2, FileSearch, Filter, History, Inbox, LayoutDashboard, LockKeyhole,
  Menu, MessageSquareText, PanelLeftClose, PanelLeftOpen, Search, ShieldCheck, TriangleAlert, X,
} from "lucide-react";
import questionRows from "../data/questions.json";
import reportRows from "../data/reports.json";
import taxonomy from "../data/taxonomy.json";
import resultRows from "../results.json";
import bonus from "../bonus_findings.json";
import { calculatePriority } from "./lib/investigation";
import {
  actionEligibility, currentFieldValue, EMPTY_STATE, filterAudit, filterReviewCases, groupReviewCases, inlineDifference,
  loadLocalState, persistLocalState, proposedValue, resetLocalState,
} from "./lib/review";
import type { AuditEntry, InvestigationResult, LocalDecision, PersistedState, Question, Report } from "./lib/types";

const questions = questionRows as Question[];
const reports = reportRows as Report[];
const results = resultRows as InvestigationResult[];
const repairs = taxonomy.repairs as Record<string, { fields: string[]; auto: boolean; label: string }>;
const verdictNames: Record<InvestigationResult["verdict"], string> = {
  defect: "Content defect", no_error: "No content error", display_issue: "Display issue", app_issue: "App issue",
  language_mode: "Language request", already_fixed: "Already fixed", not_actionable: "Not actionable",
};
const routeNames = { auto_apply: "Safe fix candidate", faculty_review: "Faculty review required", no_change: "No content change" };
const sections = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "queue", label: "Review Queue", icon: Inbox },
  { id: "proactive", label: "Proactive Findings", icon: FileSearch },
  { id: "staged", label: "Approved / Staged Changes", icon: FileCheck2 },
  { id: "audit", label: "Audit History", icon: History },
] as const;
type View = typeof sections[number]["id"];
type ModalAction = "stage" | "approve" | "review" | "reject" | "reset" | "edit" | null;
type RecordTab = "question" | "solution" | "answer" | "images";
const baseCases = groupReviewCases(questions, reports, results, calculatePriority);
const cleanHtml = (html = "") => DOMPurify.sanitize(html, { USE_PROFILES: { html: true, mathMl: true }, FORBID_TAGS: ["script", "iframe", "object", "embed"], FORBID_ATTR: ["onerror", "onclick", "onload"] });
const answerText = (answer: unknown) => Array.isArray(answer) ? JSON.stringify(answer) : String(answer ?? "—");
const findingCategoryNames: Record<string, string> = {
  answer_form: "Answer format", stem_data: "Missing value", answer_key: "Answer key", solution_fix: "Solution correction",
  exam_reference: "Exam attribution", spelling: "Spelling", syllabus: "Syllabus concern", diagram: "Diagram issue",
  markup_leak: "Formatting markup", wrong_chapter: "Chapter mismatch", option_repair: "Option correction",
  type_mismatch: "Type mismatch", identical_options: "Duplicate options", solution_missing: "Missing solution",
  wrong_question: "Question mismatch", unsound: "No valid answer",
};
const findingCategoryLabel = (key: string) => findingCategoryNames[key] ?? key.replaceAll("_", " ");
const questionSummary = (html?: string) => {
  if (!html) return "";
  const plain = new DOMParser().parseFromString(cleanHtml(html), "text/html").body.textContent?.replace(/\s+/g, " ").trim() ?? "";
  return plain.length > 108 ? `${plain.slice(0, 105).trimEnd()}…` : plain;
};
const timeLabel = (date: string) => date ? new Date(date).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "Time unavailable";
const timeAgo = (date: string) => {
  const elapsed = Date.now() - new Date(date).getTime();
  if (!Number.isFinite(elapsed)) return "Time unavailable";
  const hours = Math.max(0, Math.round(elapsed / 3_600_000));
  return hours < 1 ? "Less than an hour ago" : hours < 24 ? `${hours}h ago` : `${Math.floor(hours / 24)}d ago`;
};
const initialCaseId = baseCases.find((item) => item.reports.some((report) => report.reportId === "R001"))?.questionId ?? baseCases[0]?.questionId ?? "";
const initialFilters = { verdict: "", repair: "", route: "", subject: "", chapter: "", priority: "", status: "", source: "" };

function App() {
  const [view, setView] = useState<View>("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [saved, setSaved] = useState<PersistedState>(() => loadLocalState(localStorage));
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(initialFilters);
  const [selectedId, setSelectedId] = useState(initialCaseId);
  const [recordTab, setRecordTab] = useState<RecordTab>("question");
  const [mobileDetail, setMobileDetail] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast] = useState("");
  const [storageWarning, setStorageWarning] = useState(false);
  const [modalAction, setModalAction] = useState<ModalAction>(null);
  const [editTarget, setEditTarget] = useState<"proposal" | "reply">("proposal");
  const [editText, setEditText] = useState("");
  const [auditFilters, setAuditFilters] = useState({ action: "", date: "", questionId: "", reportId: "" });
  const [expandedAudit, setExpandedAudit] = useState<string[]>([]);
  const [stagedFilter, setStagedFilter] = useState("all");
  const searchRef = useRef<HTMLInputElement>(null);

  const visibleCases = useMemo(() => filterReviewCases(baseCases, filters, saved.decisions, search), [filters, saved.decisions, search]);
  const currentCase = visibleCases.find((item) => item.questionId === selectedId) ?? visibleCases[0];
  const question = currentCase?.question;
  const proposal = currentCase?.proposal;
  const source = question?.[question.questionType];
  const decision = currentCase ? saved.decisions[currentCase.questionId] : undefined;
  const beforeValue = proposal && question && proposal.edit ? currentFieldValue(question, proposal.edit.field) : undefined;
  const proposed = proposal && question ? proposedValue(proposal, question) : undefined;
  const afterValue = decision?.editedValue !== undefined ? decision.editedValue : proposed;
  const stageCheck = proposal && question ? actionEligibility({ result: proposal, question, repairs, mode: "stage", editedValue: decision?.editedValue }) : { ok: false, reasons: ["No correction proposal is available."], before: undefined, after: undefined };
  const approveCheck = proposal && question ? actionEligibility({ result: proposal, question, repairs, mode: "approve", editedValue: decision?.editedValue }) : { ok: false, reasons: ["No correction proposal is available."], before: undefined, after: undefined };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (view !== "queue") setView("queue");
        window.setTimeout(() => searchRef.current?.focus(), 0);
      }
      if (event.key === "Escape") {
        if (modalAction) setModalAction(null);
        else if (search) { setSearch(""); searchRef.current?.blur(); }
        else if (mobileDetail) setMobileDetail(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view, modalAction, search, mobileDetail]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3400);
  };
  const commitState = (next: PersistedState) => {
    setSaved(next);
    const stored = persistLocalState(localStorage, next);
    setStorageWarning(!stored);
    if (!stored) showToast("The browser could not save this change. Export the audit before leaving.");
  };
  const selectView = (next: View) => { setView(next); setMobileDetail(false); setMobileMenuOpen(false); };
  const updateFilter = (key: keyof typeof initialFilters, value: string) => setFilters((current) => ({ ...current, [key]: value }));
  const clearFilters = () => { setFilters(initialFilters); setSearch(""); };

  const recordAction = (action: Exclude<ModalAction, "reset" | "edit" | null>) => {
    if (!currentCase || !proposal || !question) return;
    if (action === "stage" && !stageCheck.ok) { showToast(stageCheck.reasons[0] ?? "Staging is blocked by a safety check."); return; }
    if (action === "approve" && !approveCheck.ok) { showToast(approveCheck.reasons[0] ?? "Approval is blocked by a safety check."); return; }
    const prev = saved.decisions[currentCase.questionId];
    const status: LocalDecision["status"] = action === "stage" ? "staged" : action === "approve" ? "approved" : action === "reject" ? "rejected" : "reviewed";
    const nextValue = action === "stage" || action === "approve" ? afterValue : undefined;
    const item: AuditEntry = {
      id: crypto.randomUUID(), reportIds: currentCase.reports.map((report) => report.reportId), questionId: currentCase.questionId,
      action: action === "stage" ? "staged" : action === "review" ? "reviewed" : action === "approve" ? "approved" : action === "reject" ? "rejected" : "edited",
      actor: "Faculty reviewer", at: new Date().toISOString(),
      note: action === "stage" ? "Correction staged locally after the safety checks passed." : action === "approve" ? "Faculty approved the correction for local staging." : action === "reject" ? "Report or correction rejected locally; source data is unchanged." : "Case marked reviewed locally; no production change was made.",
      previousStatus: prev?.status ?? null, newStatus: status, previousProposal: prev?.editedValue ?? proposed,
      newProposal: nextValue, reason: action === "review" ? "Human review recorded in the browser-local demo." : undefined,
      field: proposal.edit?.field ?? null, before: beforeValue, after: action === "stage" || action === "approve" ? nextValue : beforeValue,
    };
    commitState({ ...saved, decisions: { ...saved.decisions, [currentCase.questionId]: { status, ...(nextValue !== undefined ? { editedValue: nextValue } : {}) } }, audit: [item, ...saved.audit] });
    setModalAction(null);
    showToast(status === "staged" ? "Correction staged in this browser" : status === "approved" ? "Faculty approval recorded locally" : status === "rejected" ? "Case rejected and audited" : "Review recorded locally");
  };

  const openAction = (action: Exclude<ModalAction, "reset" | "edit" | null>) => {
    if (action === "stage" && !stageCheck.ok) { showToast(stageCheck.reasons[0] ?? "Staging is blocked by a safety check."); return; }
    if (action === "approve" && !approveCheck.ok) { showToast(approveCheck.reasons[0] ?? "Approval is blocked by a safety check."); return; }
    setModalAction(action);
  };

  const openEditor = (target: "proposal" | "reply") => {
    if (!currentCase || !proposal || !question) return;
    setEditTarget(target);
    if (target === "reply") setEditText(saved.studentReplies[currentCase.questionId] ?? proposal.student_reply);
    else {
      const current = decision?.editedValue !== undefined ? decision.editedValue : proposedValue(proposal, question);
      setEditText(Array.isArray(current) ? JSON.stringify(current, null, 2) : String(current ?? ""));
    }
    setModalAction("edit");
  };

  const saveEdit = () => {
    if (!currentCase || !proposal || !question) return;
    if (editTarget === "reply") {
      const item: AuditEntry = { id: crypto.randomUUID(), reportIds: currentCase.reports.map((r) => r.reportId), questionId: currentCase.questionId, action: "edited", actor: "Faculty reviewer", at: new Date().toISOString(), note: "Student reply preview updated locally.", previousStatus: decision?.status ?? null, newStatus: decision?.status ?? "edited", previousProposal: saved.studentReplies[currentCase.questionId], newProposal: editText, reason: "Local reply preview edit", field: null };
      commitState({ ...saved, studentReplies: { ...saved.studentReplies, [currentCase.questionId]: editText }, audit: [item, ...saved.audit] });
      setModalAction(null); showToast("Reply preview saved locally"); return;
    }
    let typedValue: unknown = editText;
    if (Array.isArray(beforeValue)) {
      try { typedValue = JSON.parse(editText); } catch { showToast("Enter a valid JSON array to preserve the stored answer type."); return; }
    }
    const checked = actionEligibility({ result: proposal, question, repairs, mode: proposal.route === "auto_apply" ? "stage" : "approve", editedValue: typedValue });
    if (!checked.ok) { showToast(checked.reasons[0] ?? "The edited proposal failed validation."); return; }
    const item: AuditEntry = { id: crypto.randomUUID(), reportIds: currentCase.reports.map((r) => r.reportId), questionId: currentCase.questionId, action: "edited", actor: "Faculty reviewer", at: new Date().toISOString(), note: `Edited the proposed ${proposal.edit?.field ?? "field"} value. The changed value passed the current safety checks.`, previousStatus: decision?.status ?? null, newStatus: "edited", previousProposal: afterValue, newProposal: typedValue, reason: "Faculty proposal edit", field: proposal.edit?.field ?? null, before: beforeValue, after: typedValue };
    commitState({ ...saved, decisions: { ...saved.decisions, [currentCase.questionId]: { status: "edited", editedValue: typedValue } }, audit: [item, ...saved.audit] });
    setModalAction(null); showToast("Proposal edited and revalidated locally");
  };

  const resetDemo = () => {
    resetLocalState(localStorage);
    setSaved(EMPTY_STATE); setStorageWarning(false); setSearch(""); setFilters(initialFilters); setModalAction(null); showToast("Local demo state reset");
  };
  const exportAudit = () => {
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), storage: "browser-local demo", entries: saved.audit }, null, 2)], { type: "application/json" });
    const link = document.createElement("a"); const url = URL.createObjectURL(blob); link.href = url; link.download = "acadza-audit-log.json"; link.click(); URL.revokeObjectURL(url);
  };

  const groupedDefects = baseCases.filter((item) => item.results.some((result) => result.verdict === "defect")).length;
  const safeCandidates = baseCases.filter((item) => {
    const r = item.proposal; return item.route === "auto_apply" && !!(r && item.question && actionEligibility({ result: r, question: item.question, repairs, mode: "stage" }).ok);
  }).length;
  const facultyCases = baseCases.filter((item) => item.results.some((result) => result.route === "faculty_review")).length;
  const noContentCases = baseCases.filter((item) => item.results.every((result) => !result.edit)).length;
  const completedReviews = Object.values(saved.decisions).filter((entry) => ["staged", "approved", "rejected", "reviewed"].includes(entry.status)).length;
  const verdictColors: Record<InvestigationResult["verdict"], string> = {
    defect: "#e47777", no_error: "#42b883", display_issue: "#61bfd0", app_issue: "#a58bea",
    language_mode: "#777d89", already_fixed: "#42b883", not_actionable: "#777d89",
  };
  const verdictChartData = Object.entries(verdictNames).map(([key, label]) => ({ key, label, value: results.filter((result) => result.verdict === key).length, color: verdictColors[key as InvestigationResult["verdict"]] })).filter((item) => item.value > 0);
  const routeChartData = Object.entries(routeNames).map(([key, label]) => ({ label, value: results.filter((result) => result.route === key).length, color: ({ auto_apply: "#42b883", faculty_review: "#e7b85c", no_change: "#777d89" } as Record<string, string>)[key] }));
  const subjectChartData = [...new Set(baseCases.map((item) => item.question?.subject).filter((value): value is string => !!value))].map((label) => ({ label, value: baseCases.filter((item) => item.question?.subject === label).length, color: "#6d8aff" })).sort((a, b) => b.value - a.value);
  const proactiveCount = bonus.student_report_findings.length + bonus.independently_discovered_findings.length;
  const recentAudit = saved.audit.slice(0, 5);
  const filteredAudit = filterAudit(saved.audit, auditFilters);
  const auditQuestions = new Map(questions.map((item) => [item._id, item]));
  const stagedEntries = Object.entries(saved.decisions).filter(([, value]) => stagedFilter === "all" || value.status === stagedFilter);
  const activeReportResults = new Map(currentCase?.results.map((result) => [result.reportId, result]) ?? []);
  const currentAfterIsHtml = proposal?.edit?.field === "question" || proposal?.edit?.field === "solution";
  const patchDifference = proposal?.edit ? inlineDifference(beforeValue, afterValue) : undefined;
  const eligibilityForAction = !proposal?.edit || !proposal.repair ? { ok: true, reasons: [], before: undefined, after: undefined } : proposal.route === "auto_apply" ? stageCheck : approveCheck;

  const renderNav = () => sections.map(({ id, label, icon: Icon }) => (
    <button key={id} className={`nav-item ${view === id ? "active" : ""}`} onClick={() => selectView(id)} aria-label={label} title={label} aria-current={view === id ? "page" : undefined}>
      <Icon size={18} /><span>{label}</span>{id === "queue" && <span className="nav-count">{baseCases.length}</span>}{id === "audit" && <span className="nav-count muted-count">{saved.audit.length}</span>}
    </button>
  ));

  return <div className={`shell redesign-shell ${sidebarCollapsed ? "nav-collapsed" : ""} ${mobileMenuOpen ? "mobile-menu-visible" : ""}`}>
    {mobileMenuOpen && <button className="drawer-scrim" aria-label="Close navigation" onClick={() => setMobileMenuOpen(false)} />}
    <aside className="sidebar">
      <div className="brand"><div className="brand-copy"><span className="brand-name">Acadza</span><span className="brand-product">QUESTION INTELLIGENCE</span></div><button className="icon-button sidebar-toggle" onClick={() => setSidebarCollapsed((value) => !value)} aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"} title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}>{sidebarCollapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}</button></div>
      <div className="workspace-label">FACULTY WORKSPACE</div><nav className="primary-nav" aria-label="Main navigation">{renderNav()}</nav>
      <div className="side-spacer" />
      <div className="sidebar-context"><span className="context-mark" /> Offline assignment · local review</div>
    </aside>
    <main className="main">
      <header className="topbar"><div className="topbar-start"><button className="icon-button mobile-menu-trigger" onClick={() => setMobileMenuOpen(true)} aria-label="Open navigation"><Menu size={19} /></button><div className="breadcrumb"><span>Acadza</span><ChevronRight size={14} /><strong>{sections.find((item) => item.id === view)?.label}</strong></div></div><button className="global-search" onClick={() => { selectView("queue"); window.setTimeout(() => searchRef.current?.focus(), 0); }} aria-label="Search reports and questions"><Search size={16} /><span>Search reports, questions…</span><kbd>Ctrl K</kbd></button><div className="topbar-right"><span className="date-stamp">43 QUESTIONS · 44 REPORTS</span><span className="system-status">OFFLINE REVIEWED DATA <span className="tooltip-mark" title="These are pre-reviewed assignment decisions. No live LLM inference is performed in this demo." aria-label="These are pre-reviewed assignment decisions. No live LLM inference is performed in this demo.">i</span></span></div></header>

      {view === "overview" && <section className="content-page overview-page">
        <div className="page-heading overview-hero"><div><div className="eyebrow"><span className="eyebrow-line" /> ASSIGNMENT SNAPSHOT</div><h1>Question Intelligence</h1><p className="page-subtitle">A review of question quality across the supplied reports.</p></div><span className="overview-context"><LockKeyhole size={14} /> Offline-reviewed data</span></div>
        <section className="overview-summary" aria-label="Assignment summary">
          <div className="summary-primary">
            <div><strong>{reports.length}</strong><span>Student reports</span></div>
            <div><strong>{baseCases.length}</strong><span>Question cases</span></div>
            <div><strong>{groupedDefects}</strong><span>Reported defects</span></div>
          </div>
          <div className="summary-secondary">
            <span><strong>{questions.length}</strong> questions</span>
            <span><strong>{safeCandidates}</strong> safe candidates</span>
            <span><strong>{facultyCases}</strong> faculty review</span>
            <span><strong>{noContentCases}</strong> no content edit</span>
            <span><strong>{completedReviews}/{baseCases.length}</strong> reviewed locally</span>
          </div>
        </section>
        <div className="overview-analysis">
          <ChartCard title="Verdict distribution" eyebrow="44 REPORT-LEVEL RESULTS"><DonutChart data={verdictChartData} total={results.length} /></ChartCard>
          <ChartCard title="Review route" eyebrow="RESULTS BY ROUTE"><BarChart data={routeChartData} /></ChartCard>
        </div>
        <div className="overview-lower">
          <section className="priority-panel overview-section"><div className="overview-section-heading"><div><span className="eyebrow">NEXT FOR REVIEW</span><h2>Highest-priority open cases</h2><p>Ranked by defect severity, route, repeated reports and offline review score.</p></div><button className="button button-quiet" onClick={() => selectView("queue")}>Open queue <ArrowRight size={15} /></button></div>
            <div className="overview-case-list">{baseCases.filter((item) => !saved.decisions[item.questionId] || saved.decisions[item.questionId].status === "edited").sort((a, b) => b.priority - a.priority).slice(0, 5).map((item) => <button key={item.questionId} className="overview-case" onClick={() => { setSelectedId(item.questionId); selectView("queue"); }}><span className={`priority-score ${item.priority >= 60 ? "priority-high" : item.priority >= 35 ? "priority-medium" : "priority-low"}`}>{item.priority}</span><span className="overview-case-main"><strong>{item.question?.qid ?? item.questionId}</strong><span>{item.question?.subject} · {item.question?.chapter}</span></span><span className="case-route-text">{routeNames[item.route]}</span><ChevronRight size={16} /></button>)}</div>
          </section>
          <aside className="overview-aside">
            <section className="subject-section"><div className="overview-section-heading"><div><span className="eyebrow">39 GROUPED CASES</span><h2>Cases by subject</h2></div></div><BarChart data={subjectChartData} /></section>
            <section className="recent-section"><div className="overview-section-heading"><div><span className="eyebrow">BROWSER-LOCAL ACTIVITY</span><h2>Recent review actions</h2></div><button className="icon-button" onClick={() => selectView("audit")} aria-label="Open audit history"><ArrowRight size={16} /></button></div>
              {recentAudit.length ? recentAudit.map((entry) => <AuditCompact key={entry.id} entry={entry} />) : <div className="empty-state"><strong>No local actions yet</strong><span>Review a case to add an entry to this browser’s audit history.</span></div>}
            </section>
            <button className="editorial-link" onClick={() => selectView("proactive")}><span><strong>{proactiveCount}</strong> separate findings</span><span>Open findings report <ArrowRight size={14} /></span></button>
          </aside>
        </div>
        <p className="offline-note"><LockKeyhole size={14} /> Pre-reviewed assignment results; no live LLM or Acadza production connection is active.</p>
      </section>}

      {view === "queue" && <section className="content-page queue-page">
        <div className="page-heading queue-page-heading"><div><div className="eyebrow"><span className="eyebrow-line" /> REPORTS TO RESOLUTION</div><h1>Review Queue</h1><p className="page-subtitle">Inspect the claim, trace every linked report and decide what happens next.</p></div><button className="button button-quiet" onClick={() => showToast("Offline assignment decisions are shown with source data and local review controls.")}><CircleHelp size={16} /> How review works</button></div>
        <div className="queue-toolbar redesigned-toolbar"><div className="queue-title"><h2>Question cases</h2><span className="case-total">{visibleCases.length} matching · {baseCases.length} total</span></div><div className="queue-controls"><label className="search-box"><Search size={17} /><input ref={searchRef} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search reports, content, source…" aria-label="Search all report and question content" /><span className="search-shortcut">Ctrl K</span></label><button className={`button button-quiet filter-toggle ${showFilters ? "selected" : ""}`} onClick={() => setShowFilters((value) => !value)} aria-expanded={showFilters}><Filter size={15} /> Filters <ChevronDown size={14} /></button><button className="button button-quiet clear-filter" onClick={clearFilters}>Clear all</button></div></div>
        {showFilters && <div className="filter-panel" aria-label="Combined case filters">
          <FilterSelect label="Verdict" value={filters.verdict} onChange={(value) => updateFilter("verdict", value)} options={Object.entries(taxonomy.verdicts).map(([key, label]) => [key, verdictNames[key as keyof typeof verdictNames] ?? label])} />
          <FilterSelect label="Repair" value={filters.repair} onChange={(value) => updateFilter("repair", value)} options={Object.entries(repairs).map(([key, value]) => [key, value.label])} />
          <FilterSelect label="Review route" value={filters.route} onChange={(value) => updateFilter("route", value)} options={Object.entries(routeNames)} />
          <FilterSelect label="Subject" value={filters.subject} onChange={(value) => updateFilter("subject", value)} options={[...new Set(baseCases.map((item) => item.question?.subject).filter((value): value is string => !!value))].sort().map((value) => [value, value])} />
          <FilterSelect label="Chapter" value={filters.chapter} onChange={(value) => updateFilter("chapter", value)} options={[...new Set(baseCases.map((item) => item.question?.chapter).filter((value): value is string => !!value))].sort().map((value) => [value, value])} />
          <FilterSelect label="Priority" value={filters.priority} onChange={(value) => updateFilter("priority", value)} options={[["high", "High · 60+"], ["medium", "Medium · 35–59"], ["low", "Low · under 35"]]} />
          <FilterSelect label="Review status" value={filters.status} onChange={(value) => updateFilter("status", value)} options={[["open", "Open"], ["edited", "Edited"], ["staged", "Staged locally"], ["approved", "Approved locally"], ["rejected", "Rejected"], ["reviewed", "Reviewed"]]} />
          <FilterSelect label="Source platform" value={filters.source} onChange={(value) => updateFilter("source", value)} options={[...new Set(reports.map((report) => report.source))].sort().map((value) => [value, value])} />
        </div>}
        <div className={`workbench redesigned-workbench ${mobileDetail ? "mobile-detail-open" : ""}`}>
          <aside className="queue-list" aria-label="Question review queue"><div className="queue-list-head"><span>CASE · ROUTE · STATUS</span><span>PRIORITY</span></div>
            {visibleCases.length ? visibleCases.map((item) => { const itemDecision = saved.decisions[item.questionId]; const selected = currentCase?.questionId === item.questionId; return <button key={item.questionId} className={`case-card ${selected ? "case-selected" : ""}`} onClick={() => { setSelectedId(item.questionId); setMobileDetail(true); }} aria-pressed={selected}>
              <div className="case-card-top"><span className={`mini-status ${item.route === "auto_apply" ? "status-lime" : item.route === "faculty_review" ? "status-amber" : "status-grey"}`} /><span className="case-subject">{item.question?.subject ?? "Question"}</span><span className="case-reports"><MessageSquareText size={13} />{item.reports.length}</span></div>
              <div className="case-card-primary"><strong>Q {item.question?.qid ?? item.questionId.slice(0, 8)}</strong><span>{verdictNames[item.verdict]}</span></div>
              <div className="case-repair">{item.proposal?.repair ? repairs[item.proposal.repair]?.label ?? item.proposal.repair : "No content repair proposed"}</div>
              <div className="case-card-bottom"><span className={`status-label status-text-${itemDecision?.status ?? "open"}`}>{itemDecision?.status ? itemDecision.status === "staged" ? "Staged locally" : itemDecision.status[0].toUpperCase() + itemDecision.status.slice(1) : routeNames[item.route]}</span><span>{timeAgo(item.latest)}</span></div>
              <div className="case-card-footer"><span>{item.question?.chapter ?? "Chapter unavailable"}</span><span className="priority-score small-score">Priority {item.priority}</span></div>
            </button>; }) : <div className="empty-queue"><Search size={23} /><strong>No matching cases</strong><span>Adjust the search or clear combined filters.</span><button className="button button-quiet" onClick={clearFilters}>Clear filters</button></div>}
          </aside>
          {currentCase && question && proposal ? <article className="case-detail redesigned-detail">
            <header className="case-detail-header"><button className="mobile-back" onClick={() => setMobileDetail(false)}><ChevronRight size={16} /> All cases</button><div className="case-title-line"><span className={`route-pill route-${currentCase.route === "auto_apply" ? "green" : currentCase.route === "faculty_review" ? "yellow" : "grey"}`}><span className="pill-dot" />{routeNames[currentCase.route]}</span>{decision && <span className={`local-status status-text-${decision.status}`}>{decision.status === "staged" ? "Staged locally" : decision.status === "approved" ? "Approved locally" : decision.status}</span>}<span className="confidence" title="An uncalibrated offline review score, not a statistical probability."><Activity size={14} /> {Math.round(proposal.confidence * 100)}% offline score · uncalibrated</span></div>
              <h2>{question.qid ?? `Q ${currentCase.questionId.slice(0, 8)}`} <span className="detail-id">/ {currentCase.questionId}</span></h2><div className="detail-meta"><span>{question.subject}</span><span>·</span><span>{question.chapter}</span><span>·</span><span>{question.questionType}</span><span>·</span><span>{currentCase.reports.length} linked reports</span><span>·</span><span>Priority {currentCase.priority}</span></div>
            </header>
            <div className="case-detail-body redesigned-detail-body">
              <section className="panel investigation-card"><div className="detail-section-heading"><h3>Evidence review</h3></div>
                <p className="evidence-copy">{proposal.evidence}</p><div className="evidence-grid"><EvidenceState label="Source record" state={source?.question && source?.solution ? "pass" : "warning"} detail={source?.question && source?.solution ? "Question and solution are available for inspection." : "Question or solution content is missing."} /><EvidenceState label="Taxonomy scope" state={proposal.repair && repairs[proposal.repair]?.fields.includes(proposal.edit?.field ?? "") ? "pass" : proposal.edit ? "warning" : "na"} detail={proposal.edit ? `${proposal.repair ?? "No repair"} · ${proposal.edit.field}` : "No content edit proposed."} /><EvidenceState label="Safety checks" state={!proposal.edit || !proposal.repair ? "na" : eligibilityForAction.ok ? "pass" : "warning"} detail={!proposal.edit || !proposal.repair ? "No content correction is proposed; actions are review-only." : eligibilityForAction.ok ? "Current proposal passes the checks for its route." : eligibilityForAction.reasons[0]} /><EvidenceState label="Faculty gate" state={currentCase.route === "faculty_review" ? "required" : currentCase.route === "auto_apply" ? "pass" : "na"} detail={currentCase.route === "faculty_review" ? "Required human approval before a local correction can be staged." : currentCase.route === "auto_apply" ? "Safe-route candidate; staging still requires confirmation." : "No correction action is required."} /></div>
              </section>
              <section className="panel reports-card"><div className="detail-section-heading"><h3>Reports <span className="count-badge">{currentCase.reports.length}</span></h3></div>
                <div className="report-list individual-reports">{currentCase.reports.map((report) => { const result = activeReportResults.get(report.reportId); return <div className="student-report" key={report.reportId}><div className="report-copy"><div className="report-heading"><strong>{report.reportId}</strong><span className="source-chip">{report.source}</span><time dateTime={report.reportedAt}>{timeLabel(report.reportedAt)}</time></div><p>{report.comment || "No comment provided."}</p>{result ? <div className="individual-adjudication"><span className={`verdict-chip verdict-${result.verdict}`}>{verdictNames[result.verdict]}</span><span>{routeNames[result.route]}</span><span>{result.repair ? repairs[result.repair]?.label ?? result.repair : "No repair taxonomy"}</span></div> : <div className="individual-adjudication"><span>Offline decision unavailable</span></div>}{result && <p className="report-evidence"><strong>Evidence:</strong> {result.evidence}</p>}{result?.edit && <p className="report-repair"><strong>Proposed {result.edit.field} repair:</strong> {result.edit.replace ?? answerText(result.edit.value)}</p>}</div></div>; })}</div>
              </section>
              <section className="panel question-card"><div className="detail-section-heading"><h3>Question record</h3><span className="question-type">{question.questionType}</span></div>
                <div className="record-tab-row" role="tablist" aria-label="Question source fields">{(["question", "solution", "answer", "images"] as const).map((tab) => <button key={tab} role="tab" aria-selected={recordTab === tab} className={recordTab === tab ? "active" : ""} onClick={() => setRecordTab(tab)}>{tab === "answer" ? "Answer & history" : tab[0].toUpperCase() + tab.slice(1)}</button>)}</div>
                {recordTab === "question" && <div className="question-html math-content" dangerouslySetInnerHTML={{ __html: cleanHtml(source?.question) }} />}
                {recordTab === "solution" && <div className="solution-preview standalone-solution math-content"><span className="solution-label">STORED SOLUTION</span><div dangerouslySetInnerHTML={{ __html: cleanHtml(source?.solution) }} /></div>}
                {recordTab === "answer" && <div className="answer-history"><div className="answer-row"><span>Stored answer key</span><strong>{answerText(source?.answer)}</strong><span className="answer-type">Stored as {Array.isArray(source?.answer) ? "array" : typeof source?.answer}</span></div><div className="history-label">ERROR HISTORY</div>{question.errorHistory?.length ? question.errorHistory.map((entry, index) => <div className="history-entry" key={index}><span>{entry.type ?? "Correction"}</span><span>{entry.note ?? "No note recorded."}</span><small>{entry.actor ?? "Unknown actor"} · {entry.at ?? "Date unavailable"}</small></div>) : <div className="history-empty">No prior corrections recorded.</div>}</div>}
                {recordTab === "images" && <ImageGallery question={question} />}
              </section>
              <section className="panel diff-card"><div className="detail-section-heading"><h3>Proposed change</h3><span className={`proposal-status proposal-${decision?.status ?? "proposed"}`}>{decision?.status === "staged" ? "STAGED LOCALLY" : decision?.status === "approved" ? "APPROVED LOCALLY" : decision?.status?.toUpperCase() ?? "PROPOSED"}</span></div>
                {proposal.edit ? <><div className="diff-grid redesigned-diff"><DiffPane label="Original" field={proposal.edit.field} value={beforeValue} html={proposal.edit.field === "question" || proposal.edit.field === "solution"} side="before" /><div className="diff-arrow"><ArrowRight size={18} /></div><DiffPane label="Proposed" field={proposal.edit.field} value={afterValue} html={currentAfterIsHtml} side="after" /></div><div className="change-fragment"><strong>{decision?.status === "edited" ? "Faculty edit" : "Exact patch"}</strong><span className="patch-context">{patchDifference?.beforeContext}</span><span className="patch-token removed">− {patchDifference?.removed || "(no text removed)"}</span><ArrowRight size={14} /><span className="patch-token inserted">+ {patchDifference?.inserted || "(no text inserted)"}</span><span className="patch-context">{patchDifference?.afterContext}</span></div>{decision?.status === "edited" && <p className="edit-revalidated"><CheckCircle2 size={15} /> Faculty edit was revalidated against the source and taxonomy.</p>}{!eligibilityForAction.ok && <div className="scope-warning"><TriangleAlert size={15} /> {eligibilityForAction.reasons.join(" ")}</div>}</> : <div className="no-edit"><div className="no-edit-icon"><ShieldCheck size={19} /></div><div><strong>No content correction proposed</strong><span>{currentCase.route === "no_change" ? "This report concerns a non-content issue, a request or content already judged correct." : "This case needs faculty investigation using source material; no automatic proposal is available."}</span></div></div>}
              </section>
              <section className="panel student-reply-card"><div className="detail-section-heading"><h3>Reply preview</h3><button className="link-button" onClick={() => openEditor("reply")}>Edit</button></div><div className="reply-bubble"><p>{saved.studentReplies[currentCase.questionId] ?? proposal.student_reply}</p><span className="reply-footer">Preview only · no message is sent</span></div></section>
            </div>
            <footer className="detail-footer redesigned-actionbar"><div className="footer-assurance"><ShieldCheck size={17} /><span><strong>Source record unchanged.</strong> This action only changes browser-local demo state.</span></div><div className="footer-actions">
              {proposal.edit && decision?.status !== "staged" && decision?.status !== "approved" && decision?.status !== "rejected" && <button className="button button-quiet" onClick={() => openEditor("proposal")}><span>✎</span> Edit proposal</button>}
              {decision?.status !== "staged" && decision?.status !== "approved" && decision?.status !== "rejected" && <button className="button button-reject" onClick={() => openAction("reject")}><X size={15} /> Reject</button>}
              {!decision || decision.status === "edited" ? currentCase.route === "auto_apply" && proposal.edit ? <button className="button button-primary" disabled={!stageCheck.ok} title={!stageCheck.ok ? stageCheck.reasons.join(" ") : ""} onClick={() => openAction("stage")}><ArrowDownToLine size={16} /> Stage safe correction</button> : currentCase.route === "faculty_review" && proposal.edit ? <button className="button button-primary" disabled={!approveCheck.ok} title={!approveCheck.ok ? approveCheck.reasons.join(" ") : ""} onClick={() => openAction("approve")}><Check size={16} /> Approve proposed correction</button> : <button className="button button-primary" onClick={() => openAction("review")}><Check size={16} /> {currentCase.route === "faculty_review" ? "Request further review" : "Mark as reviewed"}</button> : <span className="action-complete"><CheckCircle2 size={16} /> {decision.status === "staged" ? "Staged locally" : decision.status === "approved" ? "Approved locally" : decision.status === "rejected" ? "Rejected" : "Reviewed"}</span>}
            </div></footer>
          </article> : <div className="case-detail empty-detail"><div><Inbox size={28} /><h2>No cases match</h2><p>Clear or adjust your filters to continue reviewing.</p></div></div>}
        </div>
      </section>}

      {view === "proactive" && <section className="content-page secondary-page"><div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-line" /> SEPARATE ASSIGNMENT REVIEW</div><h1>Proactive Findings</h1><p className="page-subtitle">Independent review notes from the bonus file, kept separate from student-reported defects.</p></div><span className="baseline-badge">NOT STUDENT REPORTS</span></div>
        <div className="proactive-summary-row" aria-label="Findings summary"><div><strong>{bonus.student_report_findings.length}</strong><span>Student-report cross-references</span></div><div><strong>{bonus.independently_discovered_findings.length}</strong><span>Independent finding</span></div><div><strong>{bonus.unreported_questions_audited.length}</strong><span>Unreported questions audited</span></div></div>
        <div className="findings-list"><h2>Student-reported finding notes</h2><p>These notes do not change results.json or the original question records.</p>{bonus.student_report_findings.map((finding, index) => { const q = questions.find((item) => item._id === finding.questionId); const source = q?.[q.questionType]; return <article className="panel finding-card" key={`${finding.questionId}-${index}`}><div className="finding-top"><span className="finding-kind">STUDENT REPORT CROSS-REFERENCE</span><span className="verdict-chip verdict-defect">{findingCategoryLabel(finding.issueCategory)}</span></div><h3>{questionSummary(source?.question) || q?.qid || "Question record"}</h3><p className="finding-meta">{q?.subject} · {q?.chapter} · Reports {finding.reportIds.join(", ")}</p><details className="finding-record-id"><summary>Technical record ID</summary><code>{finding.questionId}</code></details><p>{finding.evidence}</p>{finding.proposedMinimalCorrection && <details><summary>Inspect proposed minimal correction</summary><div className="finding-patch"><code>Field: {finding.proposedMinimalCorrection.field}</code><del>{finding.proposedMinimalCorrection.find}</del><ins>{finding.proposedMinimalCorrection.replace}</ins></div></details>}<p className="human-action"><LockKeyhole size={15} /> {finding.requiredHumanAction}</p><button className="button button-quiet" onClick={() => { setSelectedId(finding.questionId); selectView("queue"); }}>Open source case <ArrowRight size={15} /></button></article>; })}</div>
        <div className="overview-columns proactive-bottom"><section className="panel"><span className="eyebrow">INDEPENDENTLY DISCOVERED</span><h2>Separate from the original report adjudication</h2>{bonus.independently_discovered_findings.map((finding, index) => { const q = questions.find((item) => item._id === finding.questionId); const source = q?.[q.questionType]; return <div key={index} className="independent-finding"><strong>{questionSummary(source?.question) || q?.qid || "Independent finding"} · {findingCategoryLabel(finding.issueCategory)}</strong><p>{finding.evidence}</p><span>{finding.requiredHumanAction}</span><details className="finding-record-id"><summary>Technical record ID</summary><code>{finding.questionId}</code></details></div>; })}</section><section className="panel"><span className="eyebrow">SOURCE AUDIT</span><h2>Unreported questions reviewed</h2>{bonus.unreported_questions_audited.map((item, index) => { const q = questions.find((row) => row._id === item.questionId); return <div key={index} className="unreported-row"><strong>{item.qid ?? q?.qid ?? "Question record"}</strong><span>{q?.subject} · {q?.chapter} · {item.result}</span><details className="finding-record-id"><summary>Technical record ID</summary><code>{item.questionId}</code></details></div>; })}</section></div>
      </section>}

      {view === "staged" && <section className="content-page secondary-page"><div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-line" /> BROWSER-LOCAL DECISIONS</div><h1>Approved / Staged Changes</h1><p className="page-subtitle">A local view of review decisions; no source database is changed.</p></div><span className="baseline-badge">LOCAL ONLY</span></div>
        <div className="filter-pills status-pills">{[["all", "All"], ["edited", "Edited"], ["approved", "Approved"], ["staged", "Staged"], ["rejected", "Rejected"], ["reviewed", "Reviewed"]].map(([key, label]) => <button key={key} className={stagedFilter === key ? "selected" : ""} onClick={() => setStagedFilter(key)}>{label} <span>{Object.values(saved.decisions).filter((item) => key === "all" || item.status === key).length}</span></button>)}</div>
        {stagedEntries.length ? <div className="change-list">{stagedEntries.map(([questionId, entry]) => { const item = baseCases.find((value) => value.questionId === questionId); const result = item?.proposal; const q = auditQuestions.get(questionId); const before = q && result?.edit ? currentFieldValue(q, result.edit.field) : undefined; return <article key={questionId} className="panel change-entry"><div className="change-entry-head"><div><span className="eyebrow">{entry.status.toUpperCase()} · LOCAL</span><h2>{q?.qid ?? questionId}</h2><p>{q?.subject} · {q?.chapter} · {item?.reports.map((r) => r.reportId).join(", ")}</p></div><span className={`proposal-status proposal-${entry.status}`}>{entry.status.toUpperCase()}</span></div>{result?.edit && <div className="change-summary"><strong>{result.edit.field}</strong><div><span>Before</span><code>{answerText(before)}</code></div><div><span>Saved proposal</span><code>{answerText(entry.editedValue ?? proposedValue(result, q!, undefined))}</code></div></div>}<span className="change-limitation">Browser-local record · Acadza production content is unchanged.</span><button className="button button-quiet" onClick={() => { setSelectedId(questionId); selectView("queue"); }}>Open case <ArrowRight size={15} /></button></article>; })}</div> : <div className="empty-state panel"><FileCheck2 size={27} /><strong>No local changes in this view</strong><span>Edits, approvals, staging and rejections will appear here.</span></div>}
      </section>}

      {view === "audit" && <section className="content-page secondary-page audit-page redesigned-audit"><div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-line" /> BROWSER-LOCAL TRACEABILITY</div><h1>Audit History</h1><p className="page-subtitle">A helpful local record of decisions. It is not an append-only server audit log.</p></div><button className="button button-quiet" onClick={exportAudit} disabled={!saved.audit.length}><ArrowDownToLine size={16} /> Export JSON</button></div>
        <div className="audit-filter-bar"><FilterSelect label="Action" value={auditFilters.action} onChange={(value) => setAuditFilters((current) => ({ ...current, action: value }))} options={[["staged", "Staged"], ["approved", "Approved"], ["edited", "Edited"], ["rejected", "Rejected"], ["reviewed", "Reviewed"]]} /><label className="filter-field"><span>Date</span><input type="date" value={auditFilters.date} onChange={(event) => setAuditFilters((current) => ({ ...current, date: event.target.value }))} /></label><label className="filter-field"><span>Question ID</span><input value={auditFilters.questionId} onChange={(event) => setAuditFilters((current) => ({ ...current, questionId: event.target.value }))} placeholder="Filter by question" /></label><label className="filter-field"><span>Report ID</span><input value={auditFilters.reportId} onChange={(event) => setAuditFilters((current) => ({ ...current, reportId: event.target.value }))} placeholder="Filter by report" /></label><button className="button button-quiet" onClick={() => setAuditFilters({ action: "", date: "", questionId: "", reportId: "" })}>Clear</button></div>
        <div className="audit-summary"><span><History size={17} /> <strong>{filteredAudit.length}</strong> matching of {saved.audit.length} local entries</span><span>{storageWarning ? "Browser storage unavailable" : "Saved in this browser"}</span></div>
        {filteredAudit.length ? <div className="audit-list redesigned-audit-list">{filteredAudit.map((entry) => <AuditRow key={entry.id} entry={entry} expanded={expandedAudit.includes(entry.id)} onToggle={() => setExpandedAudit((items) => items.includes(entry.id) ? items.filter((id) => id !== entry.id) : [...items, entry.id])} />)}</div> : <div className="empty-state panel"><History size={27} /><strong>{saved.audit.length ? "No matching audit entries" : "No review actions yet"}</strong><span>{saved.audit.length ? "Try a broader set of audit filters." : "Actions recorded in this browser will appear here."}</span></div>}
      </section>}
      <footer className="page-footer redesigned-footer"><span>ACADZA QUESTION INTELLIGENCE <span className="footer-sep">/</span> DEMONSTRATION</span><span>{questions.length} questions · {reports.length} reports · {baseCases.length} question cases · {saved.audit.length} local actions</span><button onClick={() => setModalAction("reset")}>Reset demo</button></footer>
    </main>
    {modalAction && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setModalAction(null); }} onKeyDown={(event) => { if (event.key === "Escape") setModalAction(null); }}>
      {modalAction === "edit" ? <div className="edit-modal" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><div className="modal-head"><div><div className="eyebrow"><span className="eyebrow-line" /> LOCAL EDITOR</div><h2 id="dialog-title">{editTarget === "reply" ? "Edit reply preview" : "Edit proposed correction"}</h2></div><button className="icon-button" onClick={() => setModalAction(null)} aria-label="Close"><X size={18} /></button></div><p>{editTarget === "reply" ? "This preview is stored locally and is never sent." : <>The candidate is validated again when saved. The source record remains unchanged. Field: <strong>{proposal?.edit?.field}</strong>.</>}</p><textarea autoFocus value={editText} onChange={(event) => setEditText(event.target.value)} rows={9} spellCheck={false} aria-label="Edited proposal value" /><div className="modal-note"><LockKeyhole size={14} /> {editTarget === "reply" ? "Browser-local reply preview." : `Revalidated ${proposal?.route === "auto_apply" ? "against the safe staging policy" : "for faculty approval"}.`}</div><div className="modal-actions"><button className="button button-quiet" onClick={() => setModalAction(null)}>Cancel</button><button className="button button-primary" onClick={saveEdit} disabled={!editText.trim()}><Check size={15} /> Save and revalidate</button></div></div> : modalAction === "reset" ? <div className="edit-modal" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><div className="modal-head"><div><div className="eyebrow">RESET LOCAL DATA</div><h2 id="dialog-title">Clear this demo’s review state?</h2></div><button className="icon-button" onClick={() => setModalAction(null)} aria-label="Close"><X size={18} /></button></div><p>This removes {saved.audit.length} browser-local audit entries, decisions and reply previews. The supplied source data is not affected.</p><div className="modal-actions"><button className="button button-quiet" onClick={() => setModalAction(null)}>Keep local state</button><button className="button button-reject" onClick={resetDemo}>Reset demo</button></div></div> : <div className="edit-modal confirm-modal" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><div className="modal-head"><div><div className="eyebrow">{modalAction === "reject" ? "REJECT CASE" : "CONFIRM LOCAL REVIEW"}</div><h2 id="dialog-title">{modalAction === "stage" ? "Stage this safe correction?" : modalAction === "approve" ? "Approve this proposed correction?" : modalAction === "reject" ? "Reject this case?" : "Record this review?"}</h2></div><button className="icon-button" onClick={() => setModalAction(null)} aria-label="Close"><X size={18} /></button></div><p>{modalAction === "reject" ? "The report and proposal will be marked rejected in this browser. The original question remains unchanged." : modalAction === "review" ? "This records that a reviewer checked the case. It does not stage or publish a correction." : "The action is local to this browser; no production record will be written."}</p>{proposal?.edit && (modalAction === "stage" || modalAction === "approve") && <div className="confirmation-diff"><div><strong>BEFORE · {proposal.edit.field}</strong><ValueView value={beforeValue} html={proposal.edit.field === "question" || proposal.edit.field === "solution"} /></div><div><strong>AFTER · {proposal.edit.field}</strong><ValueView value={afterValue} html={currentAfterIsHtml} /></div></div>}{(modalAction === "stage" || modalAction === "approve") && <div className="modal-note"><ShieldCheck size={14} /> {modalAction === "stage" ? "All safe-staging checks passed." : "Faculty review gate recorded; proposal passes source and taxonomy validation."}</div>}<div className="modal-actions"><button className="button button-quiet" onClick={() => setModalAction(null)}>Cancel</button><button className={`button ${modalAction === "reject" ? "button-reject" : "button-primary"}`} onClick={() => recordAction(modalAction)}>{modalAction === "stage" ? "Stage locally" : modalAction === "approve" ? "Approve locally" : modalAction === "reject" ? "Reject locally" : "Record review"}</button></div></div>}
    </div>}
    {toast && <div className="toast" role="status" aria-live="polite"><Check size={16} />{toast}</div>}
    {storageWarning && <div className="storage-warning" role="status"><TriangleAlert size={15} /> Browser storage is unavailable. Changes may not persist after closing this tab.</div>}
  </div>;
}

type ChartDatum = { label: string; value: number; color: string };

function ChartCard({ title, eyebrow, className = "", children }: { title: string; eyebrow: string; className?: string; children: React.ReactNode }) {
  return <section className={`chart-card ${className}`}><div className="chart-heading"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div></div>{children}</section>;
}

function DonutChart({ data, total }: { data: Array<ChartDatum & { key: string }>; total: number }) {
  const circumference = 2 * Math.PI * 44;
  const segments = data.map((item, index) => ({ ...item, length: total ? circumference * item.value / total : 0, offset: total ? circumference * data.slice(0, index).reduce((sum, part) => sum + part.value, 0) / total : 0 }));
  return <div className="donut-layout"><div className="donut-visual"><svg viewBox="0 0 120 120" role="img" aria-label={`Verdict distribution across ${total} report results`}><circle cx="60" cy="60" r="44" fill="none" stroke="var(--chart-track)" strokeWidth="11" />{segments.map((item) => <circle key={item.key} cx="60" cy="60" r="44" fill="none" stroke={item.color} strokeWidth="11" strokeDasharray={`${item.length} ${circumference - item.length}`} strokeDashoffset={-item.offset} transform="rotate(-90 60 60)" />)}</svg><div className="donut-center"><strong>{total}</strong><span>reports</span></div></div><div className="chart-legend">{data.map((item) => <div className="legend-row" key={item.key}><span style={{ background: item.color }} /><span>{item.label}</span><strong>{item.value}</strong></div>)}</div></div>;
}

function BarChart({ data }: { data: ChartDatum[] }) {
  const max = Math.max(1, ...data.map((item) => item.value));
  return <div className="bar-chart" role="img" aria-label={data.map((item) => `${item.label}: ${item.value}`).join(", ")}>{data.map((item) => <div className="bar-row" key={item.label}><span className="bar-label" title={item.label}>{item.label}</span><span className="bar-track"><span style={{ width: `${(item.value / max) * 100}%`, background: item.color }} /></span><strong>{item.value}</strong></div>)}</div>;
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: Array<[string, string]> }) {
  return <label className="filter-field"><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)}><option value="">All {label.toLowerCase()}s</option>{options.map(([key, name]) => <option key={key} value={key}>{name}</option>)}</select></label>;
}

function EvidenceState({ label, state, detail }: { label: string; state: "pass" | "warning" | "required" | "na"; detail: string }) {
  const Icon = state === "pass" ? CheckCircle2 : state === "warning" ? TriangleAlert : state === "required" ? CircleHelp : Clock3;
  const stateName = state === "pass" ? "Passed" : state === "warning" ? "Warning" : state === "required" ? "Required" : "Not applicable";
  return <div className={`evidence-state evidence-${state}`}><Icon size={17} /><div><span>{label} · {stateName}</span><p>{detail}</p></div></div>;
}

function ValueView({ value, html }: { value: unknown; html: boolean }) {
  if (html && typeof value === "string") return <div className="math-content diff-value" dangerouslySetInnerHTML={{ __html: cleanHtml(value) }} />;
  return <div className="diff-value">{answerText(value)}</div>;
}

function DiffPane({ label, field, value, html, side }: { label: string; field: string; value: unknown; html: boolean; side: "before" | "after" }) {
  return <div className={`diff-pane ${side}-pane`}><div className="diff-label"><span>{label}</span><span className="diff-field">{field}</span></div><ValueView value={value} html={html} /></div>;
}

function ImageGallery({ question }: { question: Question }) {
  const content = question[question.questionType];
  const images = [...(content?.quesImages ?? []), ...(content?.solutionImages ?? [])];
  if (!images.length) return <div className="image-fallback"><BookOpen size={20} /><span>No source images are attached to this question.</span></div>;
  return <div className="image-gallery">{images.map((src, index) => <figure key={`${src}-${index}`}><img src={src} alt={`Source question figure ${index + 1}`} onError={(event) => { event.currentTarget.hidden = true; const fallback = event.currentTarget.nextElementSibling; if (fallback) fallback.textContent = "Source image unavailable in this offline package."; }} /><figcaption>Source image {index + 1}<span /></figcaption></figure>)}</div>;
}

function AuditCompact({ entry }: { entry: AuditEntry }) {
  return <div className="audit-compact"><span className={`audit-icon audit-${entry.action}`}>{entry.action === "rejected" ? <X size={15} /> : entry.action === "edited" ? <FileCheck2 size={15} /> : <Check size={15} />}</span><div><strong>{entry.action[0].toUpperCase() + entry.action.slice(1)} · {entry.questionId}</strong><span>{entry.note}</span><small>{timeLabel(entry.at)}</small></div></div>;
}

function AuditRow({ entry, expanded, onToggle }: { entry: AuditEntry; expanded: boolean; onToggle: () => void }) {
  return <article className="audit-row redesigned-audit-row"><div className={`audit-icon audit-${entry.action}`}>{entry.action === "rejected" ? <X size={16} /> : entry.action === "edited" ? <FileCheck2 size={16} /> : <Check size={16} />}</div><div className="audit-main"><strong>{entry.action[0].toUpperCase() + entry.action.slice(1)} · Q {entry.questionId}</strong><span>{entry.note}</span><small>{entry.actor} · Reports {entry.reportIds.join(", ")} · {timeLabel(entry.at)}</small><button className="audit-expand" aria-expanded={expanded} onClick={onToggle}>{expanded ? "Hide details" : "Show details"} <ChevronDown size={14} /></button>{expanded && <div className="audit-details"><div><strong>Action</strong><span>{entry.action}</span></div><div><strong>Status</strong><span>{entry.previousStatus ?? "No previous decision"} → {entry.newStatus ?? "Unknown"}</span></div><div><strong>Field</strong><span>{entry.field ?? "No content field"}</span></div><div><strong>Reason</strong><span>{entry.reason ?? entry.note}</span></div>{entry.before !== undefined && <div><strong>Before</strong><code>{answerText(entry.before)}</code></div>}{entry.after !== undefined && <div><strong>After</strong><code>{answerText(entry.after)}</code></div>}</div>}</div><span className="audit-time">{timeLabel(entry.at)}</span></article>;
}

export default App;
