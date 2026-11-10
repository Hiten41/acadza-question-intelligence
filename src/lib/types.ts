export type Verdict =
  | "defect"
  | "no_error"
  | "display_issue"
  | "app_issue"
  | "language_mode"
  | "already_fixed"
  | "not_actionable";

export type Repair =
  | "spelling"
  | "noise"
  | "exam_reference"
  | "markup_leak"
  | "answer_form"
  | "notation"
  | "stem_data"
  | "option_repair"
  | "solution_fix"
  | "solution_missing"
  | "answer_key"
  | "type_mismatch"
  | "identical_options"
  | "diagram"
  | "wrong_question"
  | "unsound"
  | "wrong_chapter"
  | "syllabus";

export type Route = "auto_apply" | "faculty_review" | "no_change";
export type EditableField = "question" | "solution" | "answer" | "questionType";

export interface Edit {
  field: EditableField;
  find?: string;
  replace?: string;
  value?: unknown;
}

export interface Report {
  reportId: string;
  questionId: string;
  source: string;
  reportedAt: string;
  comment: string;
}

export interface Question {
  _id: string;
  qid?: string | null;
  questionType: "scq" | "mcq" | "integerQuestion";
  subject?: string;
  chapter?: string;
  concept?: string | null;
  subConcept?: string | null;
  level?: string;
  error?: number;
  updatedAt?: string;
  errorHistory?: Array<{ type?: string; actor?: string; at?: string; note?: string }>;
  scq?: QuestionContent;
  mcq?: QuestionContent;
  integerQuestion?: QuestionContent;
}

export interface QuestionContent {
  question?: string;
  solution?: string;
  answer?: string | string[];
  quesImages?: string[];
  solutionImages?: string[];
}

export interface InvestigationResult {
  reportId: string;
  questionId: string;
  verdict: Verdict;
  repair: Repair | null;
  edit: Edit | null;
  route: Route;
  confidence: number;
  evidence: string;
  student_reply: string;
}

export interface AuditEntry {
  id: string;
  reportIds: string[];
  questionId: string;
  action: "staged" | "approved" | "edited" | "rejected" | "reviewed";
  actor: string;
  note: string;
  at: string;
  previousStatus?: LocalDecision["status"] | null;
  newStatus?: LocalDecision["status"];
  previousProposal?: unknown;
  newProposal?: unknown;
  reason?: string;
  field?: EditableField | null;
  before?: unknown;
  after?: unknown;
}

export interface LocalDecision {
  status: "edited" | "staged" | "approved" | "rejected" | "reviewed";
  editedValue?: unknown;
}

export interface PersistedState {
  version: 2;
  decisions: Record<string, LocalDecision>;
  audit: AuditEntry[];
  studentReplies: Record<string, string>;
}
