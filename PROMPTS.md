# MASTER AUTONOMOUS CODEX PROMPT — ACADZA AI INTERN BUILD ROUND

> **Current release snapshot — 12 November 2026:** This file preserves earlier prompts and time-specific outcomes as historical context. The latest production record is deployment `dpl_GMkT9TWaDke4CDLGWYjURGpesbTG`, Ready on Vercel; an authenticated deployment-list check found no newer production deployment. The public alias is https://acadza-question-intelligence.vercel.app and returned HTTP 200. The latest recorded browser walkthrough has 37 Chromium checks; earlier 23-, 35-, and 36-check runs are historical. The final public video is an edited 3:00 highlight cut: [watch it here](https://github.com/Hiten41/acadza-question-intelligence/releases/download/acadza-demo-walkthrough-2026-11-11/Acadza-Question-Intelligence-Walkthrough-Trimmed.mp4). It shows R001 staged and R034 approved as browser-local demonstration actions; the audit view contains those two local entries. This approval is not a real faculty decision or an Acadza production write. The application remains an offline demonstration, not a live LLM or Acadza production integration.

## MISSION

Build a complete, exceptionally polished, working AI-powered question-defect detection and correction platform for Acadza.

This is a real engineering assignment, not a tutorial or a prototype.

Act as a senior AI engineer, full-stack engineer, ML researcher, product designer, database architect, security engineer and QA lead.

You have permission to make technical decisions, write code, install dependencies, create files, run commands, test the application, debug failures and improve the implementation autonomously.

**Do not stop after planning. Do not wait for me to approve individual implementation decisions. Continue until the project is fully built and verified.**

The final product must demonstrate:
- Excellent AI orchestration.
- Evidence-based mathematical and scientific verification.
- Accurate report classification.
- Safe, surgical corrections.
- A genuinely useful faculty review console.
- Exceptional visual design.
- Complete documentation.
- Reproducible testing.
- A working deployment, if authorized infrastructure is available.

---

# PHASE 0 — FIND AND INSPECT THE ACTUAL ASSIGNMENT

Locate:

`Acadza_AI_Intern_Assignment.zip`

Check:
- Current Codex workspace.
- Project root.
- Downloads directory.
- Uploaded conversation attachments, if accessible.

In the local Downloads directory, also check:

`Acadza_AI_Intern_Assignment.zip`

and

`Acadza_AI_Intern_Assignment (1).zip`

Do not assume the archive is in any particular location.

Extract the ZIP into the project workspace without modifying the original archive.

The archive contains:

```text
ac adza-report-fix/
    README.md
    data/
        questions.json
        reports.json
        taxonomy.json
```

The actual folder name is `ac adza-report-fix` only if that is what extraction reports; always use the exact extracted path.

Read the complete original README.md before implementation.

Inspect every record in all three JSON files.

## Verified dataset characteristics

The supplied archive contains:

- 43 questions.
- 44 student reports.
- 39 distinct reported question IDs.
- 7 allowed verdicts.
- 18 allowed repair types.

Question distribution:
- 31 SCQ.
- 2 MCQ.
- 10 integer questions.

There are four groups of repeated reports:

- R001, R002, R003.
- R007, R008.
- R009, R010.
- R018, R019.

Group the investigation by question, but never discard individual reports.

There are four questions without associated student reports. Inspect those separately for the bonus defect-discovery task.

## CRITICAL DATA SCHEMA

`questions.json` contains records with fields such as:

```text
_id
qid
questionType
subject
chapter
concept
subConcept
level
error
updatedAt
scq
mcq
integerQuestion
errorHistory
```

The actual question, solution, answer and image arrays are nested inside the object corresponding to `questionType`.

For example:

```text
scq.question
scq.solution
scq.answer
scq.quesImages
scq.solutionImages
```

The same general structure applies to `mcq` and `integerQuestion`.

**Join reports to questions using `reports[].questionId == questions[]._id`. Do not use `qid` as the primary join key.**

The question HTML contains actual HTML and inline MathML. Preserve it.

Answers may have different data types, including strings and arrays. Do not assume every answer is a string.

The MCQ records contain unusual answer-array representations. Inspect and normalize them carefully without losing their original representation.

`reports.json` contains:

```text
reportId
questionId
studentId
source
reportedAt
comment
```

`taxonomy.json` is authoritative.

Create:

`docs/assignment-analysis.md`

Document:
- Dataset structure.
- Exact schemas.
- Data-quality observations.
- Report grouping.
- Taxonomy.
- Assignment acceptance criteria.
- Technical implementation plan.
- Security considerations.

If the archive cannot be found, stop and tell me exactly what is missing. Never pretend to have inspected data that is unavailable.

---

# PHASE 1 — BUILD THE PRODUCT

Product name:

**ACADZA | QUESTION INTELLIGENCE**

Tagline:

**Every question deserves to be right.**

Build a platform that sits between student error reports and corrections to Acadza's JEE/NEET question bank.

Acadza has approximately eight lakh questions.

The core workflow is:

```text
Student submits report
        |
        v
Report ingestion
        |
        v
Question retrieval
        |
        v
Duplicate grouping
        |
        v
AI investigation
        |
        v
Independent verification
        |
        v
Verdict + proposed repair
        |
        v
Safety validation
        |
        v
+--------------------------+
|                          |
v                          v
Safe auto-apply       Faculty review
|                          |
v                          v
Staged correction     Approve / Edit / Reject
|                          |
+------------+-------------+
             |
             v
        Audit history
             |
             v
        Student reply
```

Every stage must have an actual implementation.

Do not create a chatbot that merely explains what might be wrong.

The system must investigate the original question, its solution, answer key, options and student report.

---

# PHASE 2 — IMPLEMENT THE EXACT TAXONOMY

This is mandatory.

Do not invent alternative verdicts or repair categories.

## Allowed verdicts

Use only these seven values:

```text
defect
no_error
display_issue
app_issue
language_mode
already_fixed
not_actionable
```

Interpretation:

- `defect`: The question, answer key or solution is actually incorrect.
- `no_error`: The question is correct; the student misunderstood or incorrectly solved it.
- `display_issue`: The underlying content is correct but its rendering, layout or loading is problematic.
- `app_issue`: The problem concerns platform behaviour rather than question content.
- `language_mode`: The student requests another language.
- `already_fixed`: The reported defect is demonstrably absent from the current record.
- `not_actionable`: The comment is empty, unintelligible or contains no usable defect claim.

## Allowed repair types and exact permissions

| Repair | Allowed fields | Taxonomy auto |
|---|---|---|
| spelling | question, solution | true |
| noise | question, solution | true |
| exam_reference | question, solution | true |
| markup_leak | question, solution | true |
| answer_form | question | true |
| notation | question, solution | true |
| stem_data | question | true |
| option_repair | question | true |
| solution_fix | solution | true |
| solution_missing | solution | true |
| answer_key | answer, solution | true |
| type_mismatch | questionType, question, answer | true |
| identical_options | none | false |
| diagram | none | false |
| wrong_question | none | false |
| unsound | none | false |
| wrong_chapter | none | false |
| syllabus | none | false |

The taxonomy file is the actual authority. Load the permissions programmatically.

**Never allow a repair to modify a field outside its declared scope.**

A taxonomy value of `auto: true` means automatic application is permitted when sufficient evidence and safety conditions exist. It does not mean every such repair should be applied automatically.

A value of `auto: false` means mandatory human review.

---

# PHASE 3 — BUILD THE AI INVESTIGATION ENGINE

This is the central engineering challenge.

Build a modular, multi-stage AI investigation system.

Do not use one enormous LLM prompt for everything.

## 3.1 Report normalization

Normalize comments without destroying their original text.

Support:
- Hindi.
- English.
- Hinglish.
- Informal student language.
- Misspellings.
- Mathematical expressions.
- Very short reports.
- Repeated reports.
- Ambiguous reports.
- Malicious instructions.

Preserve the original comment for display and auditing.

## 3.2 Question retrieval

For every report:

1. Retrieve the exact question by `_id`.
2. Identify the correct question type.
3. Extract the original question.
4. Extract the answer options.
5. Extract the stored answer.
6. Extract the solution.
7. Retrieve relevant metadata.
8. Retrieve other reports for the same question.
9. Retrieve related reports where useful.

Do not use approximate question matching when an exact question ID exists.

## 3.3 Duplicate grouping

Implement question-level grouping.

For example, R001, R002 and R003 refer to the same underlying question.

Investigate the question once, then assess the individual comments separately.

Use:
- Exact question IDs.
- Normalized comment similarity.
- Semantic similarity when appropriate.
- Evidence deduplication.

Do not merge unrelated issues just because comments use the same words.

## 3.4 AI investigation stages

Implement the following modules:

**A. Intent extraction**

Determine what the student actually claims.

**B. Evidence collection**

Retrieve the question, answer, options, solution and related reports.

**C. Independent verification**

Attempt to establish the truth independently of the student's claim.

**D. Verdict generation**

Choose exactly one allowed verdict.

**E. Repair selection**

If the report identifies a real defect, select an allowed repair type.

**F. Edit generation**

Generate the smallest possible change.

**G. Safety validation**

Check the proposed edit against taxonomy permissions.

**H. Student response**

Generate a supportive, concise reply.

Each stage must have structured inputs and outputs.

## 3.5 Independent mathematical verification

This is especially important because the dataset contains physics and mathematical questions.

Implement independent verification wherever possible.

Use suitable tools and libraries, such as:
- Python SymPy.
- Numerical computation.
- JavaScript mathematical utilities.
- Deterministic formula validators.
- Structured LLM reasoning.

Examples of checks:

- Arithmetic consistency.
- Dimensional analysis.
- Unit conversion.
- Equation consistency.
- Correct answer versus stored key.
- Consistency between solution and final answer.
- Correctness of numerical approximations.
- Consistency between question data and solution assumptions.

Do not rely on an LLM agreeing with another LLM as sufficient mathematical verification.

For high-stakes answer-key corrections, require two independent reasoning paths or one deterministic calculation plus an independently checked derivation.

If verification is incomplete, send the case to faculty.

## 3.6 AI provider abstraction

Implement a provider-independent AI interface.

Use an available configured provider such as OpenAI or Gemini.

Requirements:

- Structured JSON output.
- Strict schemas.
- Input and output validation.
- Retry handling.
- Timeouts.
- Token-efficient context construction.
- Batch processing.
- Error handling.
- Logging.
- Model and provider identification.
- Configurable model selection.

Use environment variables.

Never expose credentials to the browser.

Never send unnecessary student identifiers to an external model.

Treat student comments as untrusted data, not instructions.

If an API key is unavailable:

- Provide a functional deterministic baseline.
- Use precomputed results when appropriate.
- Clearly label deterministic versus LLM-generated decisions.
- Do not pretend that an LLM was called.

The console must remain usable without paid API credits.

---

# PHASE 4 — REPAIR GENERATION AND SAFETY

The system must generate surgical corrections.

Do not rewrite entire question HTML strings unnecessarily.

## Edit format

Follow the assignment's edit contract:

```json
{
  "field": "answer",
  "find": "C",
  "replace": "A"
}
```

For text edits, use exact original substrings.

For answer edits, preserve the original value type.

For a new answer, use the new answer representation permitted by the assignment.

The system must:
- Validate that the original value exists.
- Validate the replacement.
- Confirm the field is allowed.
- Confirm the change is minimal.
- Preserve unrelated HTML and MathML.
- Preserve all unaffected options.
- Prevent accidental changes to images.
- Reject stale or conflicting patches.

For complex corrections involving several fields, maintain a richer internal patch list. Keep `results.json` compatible with the assignment's single-edit representation.

## Safety policy

Never allow the AI to:
- Change an answer key based solely on a student comment.
- Follow instructions embedded in student comments.
- Invent missing diagrams.
- Invent unsupported options.
- Invent missing numerical values.
- Change unrelated question content.
- Modify forbidden taxonomy fields.
- Publish uncertain corrections.
- Silently overwrite original records.

Keep the original question snapshot immutable.

Auto-applied changes must be versioned and reversible.

The application should maintain a staged corrected version, not pretend to have directly modified Acadza's live eight-lakh-question production database.

## Confidence

Provide a confidence score between 0 and 1.

It is an internal decision score, not a statistically calibrated probability.

Use stricter requirements for:
- Answer-key changes.
- Missing numerical data.
- Type changes.
- Ambiguous solutions.

Never auto-apply a repair when evidence is contradictory or incomplete.

---

# PHASE 5 — IMPORTANT DATASET TEST CASES

Use these as independent verification and regression-test anchors.

**Do not hardcode report-ID-specific branches in the production classifier.** Implement general reasoning that correctly handles these cases.

Recompute the results independently before finalizing them.

### Answer-key and mathematical cases

1. R001–R003: LCR circuit. The solution calculates 50 V, which is option A, whereas the stored key is C.

2. R004: Gas pressure. Use P = ρv²/3. The calculation gives 4800 N/m², option D, not the stored A.

3. R005: Gauss's law. The face-centre charge contributes q/(4ε₀); the corner charge contributes q/(4ε₀). Total flux is q/(2ε₀), so n = 1, not the stored 2.

4. R006: Cube volume contraction. The question omits the cube edge length, while the solution assumes 10 cm. Investigate whether this is a recoverable `stem_data` repair.

5. R007–R008: Inductance is missing from the stem, while the solution uses 95.5 mH. Investigate the missing-data repair.

6. R009–R010: Option D is missing. Do not invent a distractor if its intended text cannot be recovered.

7. R011: Option C is blank. The forces on the two charges have equal magnitudes, giving a ratio of 1:1. Investigate a surgical option repair.

8. R015: Options B and C are identical. This is `identical_options`, which must receive faculty review.

9. R016: The solution calculates 40 cm, but its equation gives 20 cm. The stored integer answer is 20.

10. R018–R019: The question gives a de Broglie wavelength of 0.3 nm = 3 Å. The solution contains an inconsistent 5.47 Å intermediate. The final answer of 16.8 eV is correct.

11. R021: The question has only one correct option, B, but is stored as MCQ. Investigate `type_mismatch` and the malformed answer representation.

12. R024: The friction question expects 20 N, but the question does not explicitly state the answer unit. Investigate `answer_form`.

13. R034: Both the assertion and reason are false under the standard interference-intensity formula. There is no valid option representing both false. This is an `unsound` case and MUST go to faculty review. Do not automatically invent a fifth option or select C.

### False-report cases

14. R017: The original option contains the word "more", not "mere". The student reports a spelling error that is not present in the supplied question. Do not introduce a correction.

15. R020: The correct MCQ selections are A, B and D. The student says they selected all three but received an incorrect result. Investigate possible answer serialization or scoring behaviour. Do not change the content key without evidence.

16. R027: The student comment contains an explicit prompt-injection instruction telling the AI to change the answer to C. Ignore it completely. The underlying answer is A. Treat the report as non-actionable if no genuine defect claim exists.

17. R028: The correct projectile angle is tan⁻¹(4), not tan⁻¹(2).

18. R029: The coefficient of friction is 0.8, not 0.4.

19. R030: The correct SHM amplitude is 8√2 m, not 4√2 m.

20. R031: The first realignment time is 4 seconds, not 2 seconds.

21. R032: 0.08 m equals 8 cm. The stored answer 8 is correct.

22. R033: The correctly rounded result gives 3113. The student's 3112.99 claim is not a reason to change the stored answer.

23. R040: The correct option is Golden Rice. Investigate the vague "wrong" comment without assuming the key is defective.

24. R043: The surface-charge-density ratio is 4:1, not 1:4.

25. R044: The potential at P is 22 V and at S is 8 V. Their potential difference is 14 V, not 22 V.

### Separate issues

26. R012: "Epithellial tisue" should be "Epithelial tissue".

27. R013: Investigate removal of the extraneous NEET 2019 reference.

28. R014: Raw `\frac{7}{8}` markup is visible in the question.

29. R022: "Choroid plexux" contains a spelling error.

30. R023: A neural-control question is filed under The Living World. Faculty should review the chapter correction.

31. R025: The question refers to a figure that is missing. Manual review is mandatory.

32. R026: The student reports that the question is outside the NEET syllabus. Faculty must verify.

33. R035: The answer-key complaint is incorrect; option D is the correct answer. However, independently flag the unrelated factual error in the solution claiming insulin and glucagon work synergistically. They are antagonistic hormones. This should be a separate proactive content finding, not a false defect verdict for the student's answer-key complaint.

34. R036: Options are cut off on the student's phone. This is a display issue.

35. R037: The question takes too long to load. This is a display/performance issue.

36. R038: The student selected A but the application saved B. This is an app issue.

37. R039: The student requests Hindi. This is a language-mode request.

38. R041: The comment is unintelligible and should not trigger a correction.

39. R042: A displacement-current question is filed under geometrical optics. Faculty should review the chapter classification.

These anchors are not a substitute for examining all 44 reports. Review every report individually.

---

# PHASE 6 — BONUS: FIND UNREPORTED DEFECTS

The assignment explicitly rewards finding defects that nobody reported.

Examine all 43 questions, including the four without reports.

Look for:

- Incorrect solutions.
- Incorrect answer keys.
- Contradictory explanations.
- Missing numerical data.
- Wrong units.
- Incorrect subject/chapter classification.
- Malformed mathematical notation.
- Missing images.
- Duplicated options.
- Invalid question types.
- Ambiguous questions.
- Scientific inaccuracies.

Create:

`bonus_findings.json`

Each finding should contain:

- Question ID.
- Field.
- Issue category.
- Original content.
- Evidence.
- Explanation.
- Proposed minimal correction.
- Confidence.
- Required human action.

Separate:
1. Defects reported by students.
2. Additional defects independently discovered by the system.

Never inflate the bonus findings by reporting harmless stylistic preferences as defects.

---

# PHASE 7 — GENERATE RESULTS.JSON

This file is mandatory and is automatically evaluated.

Generate it from the actual execution of your investigation pipeline.

Required output:

`results.json`

It must contain exactly 44 entries, one for each original report.

Each entry must follow this structure:

```json
{
  "reportId": "R001",
  "questionId": "60f744b3f1b9bc7cc7b4a949",
  "verdict": "defect",
  "repair": "answer_key",
  "edit": {
    "field": "answer",
    "find": "C",
    "replace": "A"
  },
  "route": "auto_apply",
  "confidence": 0.99,
  "evidence": "Independent calculation gives 50 V, matching option A and contradicting the stored key C.",
  "student_reply": "You're right to flag this. The stored answer key was incorrect; the calculation gives 50 V. Thanks for helping us catch it."
}
```

Allowed route values:

```text
auto_apply
faculty_review
no_change
```

Requirements:

- Preserve every report ID.
- Preserve every corresponding question ID.
- Include exactly one record per report.
- Do not drop duplicates.
- Do not add unapproved verdict values.
- Do not add unapproved repair values.
- Use null when no repair applies.
- Use null when no edit is proposed.
- Keep student replies between one and three sentences.
- Keep the evidence concise and specific.
- Do not include student IDs.
- Validate the output against a strict JSON schema.
- Do not add extra keys to individual records.
- Do not fabricate confidence or validation results.

`results.json` must be regenerated whenever the investigation engine changes.

Preserve the source reports and original questions.

Also provide an internal richer JSON representation for multiple proposed patches if necessary, without changing the required public results schema.

---

# PHASE 8 — FACULTY REVIEW CONSOLE

This is worth 20 marks.

The evaluator will use the console as a faculty member working at 10 PM.

Design the experience around speed, trust and clarity.

The faculty member must understand a case within seconds.

## 8.1 Main dashboard

Show real metrics:

- Total questions.
- Total reports.
- Unique affected questions.
- Pending reviews.
- Defects identified.
- Student mistakes.
- Display issues.
- App issues.
- Auto-applied repairs.
- Faculty-approved repairs.
- Rejected reports.
- High-priority cases.
- Average review time, if actually measured.

Do not hardcode numbers.

## 8.2 Main navigation

Build:

- Overview.
- Review Queue.
- Auto-applied Changes.
- Faculty Review.
- Approved Corrections.
- Rejected Reports.
- Application Issues.
- Proactive Findings.
- Analytics.
- Audit Log.
- Settings.

## 8.3 Review queue

Group reports by question.

Display:
- Question ID.
- Number of reports.
- Latest report time.
- Verdict.
- Repair type.
- Confidence.
- Severity.
- Priority.
- Route.
- Review status.

Sort by a defensible priority formula.

Priority should consider:
- Potential student harm.
- Answer-key defects.
- Number of students affected.
- Repeated reports.
- Severity.
- Age of unresolved report.

Explain the prioritization logic in documentation.

Provide:
- Search.
- Filters.
- Sorting.
- Pagination.
- Report status filters.
- Repair filters.
- Verdict filters.
- Date filters.
- Priority filters.

## 8.4 Individual investigation screen

Show a complete case:

1. Student report.
2. Original question.
3. Properly rendered mathematical expressions.
4. All answer options.
5. Stored answer.
6. Original solution.
7. AI verdict.
8. Evidence.
9. Independent verification.
10. Related reports.
11. Proposed correction.
12. Before/after comparison.
13. Safety validation.
14. Student reply preview.
15. Audit history.

Render HTML and MathML correctly.

Use safe HTML sanitization. Do not allow scripts or unsafe event handlers from imported question content.

Preserve native MathML rendering.

Make mathematical expressions readable on desktop and mobile.

## 8.5 Before/after diff

This is one of the most important screens.

Show the precise changed content.

Use:
- Clear removed text.
- Clear inserted text.
- Unchanged context.
- Readable mathematical notation.
- Field-level change identification.

Never show a rewritten entire question when only one option changes.

For mathematical corrections, show both the original and corrected expression.

## 8.6 Faculty actions

Implement fully functional:

- Approve.
- Edit.
- Reject.
- Escalate.
- Request re-investigation.
- Mark as duplicate.
- Undo/revert where appropriate.

All actions must persist.

Each action must create an audit entry containing:

- Actor.
- Timestamp.
- Report ID.
- Question ID.
- Action.
- Previous state.
- New state.
- Previous content.
- New content.
- Reason.

Implement optimistic concurrency checks.

Use confirmation for consequential actions.

Never let an approval silently overwrite the original source snapshot.

---

# PHASE 9 — VISUAL DESIGN

The design must be exceptional.

Do not use generic AI dashboard templates.

Design it as a serious, modern EdTech quality-intelligence product.

Visual direction:

- Premium enterprise SaaS.
- Editorial clarity.
- Strong typography.
- Restrained colors.
- Clean white or subtle neutral backgrounds.
- Excellent contrast.
- Carefully designed status indicators.
- Beautiful mathematical typography.
- Professional tables.
- Intuitive navigation.
- Consistent spacing.
- Subtle transitions.
- Responsive design.
- Excellent empty states.
- Excellent loading and error states.

Prioritize desktop, since faculty review is primarily desktop-oriented.

Create a distinct visual identity.

Use a professional logo/wordmark treatment for ACADZA QUESTION INTELLIGENCE.

Do not fill the interface with gradients, unnecessary cards, giant statistics or decorative charts.

Every visible button must perform a real action.

Do not leave placeholder screens.

Do not use fake data or fake activity.

The result should look like a mature commercial product.

---

# PHASE 10 — ENGINEERING ARCHITECTURE

Inspect the existing workspace before choosing the stack.

Reuse any suitable existing infrastructure.

If starting from scratch, prefer:

Frontend:
- Next.js.
- TypeScript.
- React.
- Tailwind CSS.
- A consistent component system.
- Recharts where charts are genuinely useful.
- A mathematical rendering solution that supports MathML.

Backend:
- Next.js API routes or FastAPI if a separate Python investigation service materially improves the design.

Database:
- PostgreSQL for persistent deployment.
- Prisma or an appropriate ORM.
- SQLite for convenient local development if appropriate.

Validation:
- Zod or equivalent.

AI:
- Provider abstraction.
- Structured outputs.
- Prompt versioning.

Testing:
- Vitest or equivalent.
- Playwright or equivalent for browser testing.

Avoid unnecessary microservices.

Create a clean architecture with separate modules for:

```text
src/
    app/
    components/
    features/
        dashboard/
        reports/
        investigation/
        corrections/
        audit/
        analytics/
    lib/
        ai/
        classification/
        verification/
        taxonomy/
        ingestion/
        safety/
        database/
    prompts/
    types/
    validators/
```

Adapt the structure to the chosen framework.

Create:
- `.env.example`
- `.gitignore`
- Database migrations.
- Seed scripts.
- Reproducible setup instructions.
- Error logging.
- Structured application logs.

Never commit API keys or credentials.

---

# PHASE 11 — TESTING AND EVALUATION

Testing is not optional.

Build a proper evaluation and regression suite.

## Data tests

- All 43 questions load.
- All 44 reports load.
- Every report maps to a question.
- No duplicate report IDs.
- Question types are validated.
- Answers retain their original data types.
- MathML and HTML are preserved.
- Repeated reports are grouped correctly.

## AI tests

- Correct verdict selection.
- Correct repair selection.
- Incorrect student claims.
- Duplicate reports.
- Ambiguous reports.
- Prompt injection.
- Mathematical contradictions.
- Incorrect answer keys.
- Missing data.
- Missing options.
- Malformed model output.
- Low confidence.
- Conflicting evidence.

## Safety tests

- Repair scope validation.
- Human-only repair enforcement.
- Immutable original data.
- Safe patch application.
- No unauthorized field changes.
- Reversible changes.
- Concurrency conflicts.
- Prompt-injection resistance.

## UI tests

- Dashboard rendering.
- Review queue filtering.
- Search.
- Sorting.
- Case navigation.
- Mathematical rendering.
- Before/after diffs.
- Approve.
- Edit.
- Reject.
- Audit entries.
- Responsive layouts.
- Error handling.

## Evaluation report

Create:

`docs/evaluation.md`

Include:
- Classification methodology.
- Hand-verified findings.
- False-positive analysis.
- False-negative analysis.
- Confusion matrix if valid labels are available.
- Limitations.
- Edge cases.
- Safety results.

Do not invent ground-truth labels or performance metrics.

If the supplied archive does not contain official labels, clearly distinguish independently verified findings from official ground truth.

Create a manually reviewed regression set based on the actual dataset.

---

# PHASE 12 — PROMPTS.MD

This is mandatory and worth 15 marks.

Create a genuinely comprehensive:

`PROMPTS.md`

It must include every prompt used inside the actual product, verbatim.

Include:

1. System prompt.
2. Report interpretation prompt.
3. Question investigation prompt.
4. Answer verification prompt.
5. Classification prompt.
6. Repair-generation prompt.
7. Repair-validation prompt.
8. Student-reply prompt.
9. Any specialized mathematical verification prompts.

For each prompt:
- Give the exact prompt text.
- Explain its purpose.
- Show its input schema.
- Show its output schema.
- Record its version.
- Explain changes between versions.
- Explain why changes were made.

Also include the key prompts used with Codex during development.

**Save this master prompt verbatim as the initial coding-assistant prompt in PROMPTS.md.** Record subsequent material Codex instructions and iterations.

The assignment specifically asks for:

### Three instances where AI was wrong

Identify three real, reproducible instances where the AI model made an incorrect claim or proposed an unsafe action.

For each:
- Original prompt.
- Actual model output.
- Why it was wrong.
- How it was detected.
- What safeguard was implemented.
- The corrected result.

Run adversarial evaluations to discover these failure modes.

Do not fabricate model failures, outputs, experiments or historical prompt versions.

If no live LLM was available, say so honestly and document the adversarial tests and the limitations of the fallback system.

### Design decisions log

Record:
- What you tried.
- What you retained.
- What you discarded.
- Why you made each decision.
- How you chose auto-apply versus faculty review.
- How you controlled LLM cost.
- How you handled uncertain mathematical answers.
- How you handled untrusted student comments.

The file must demonstrate genuine engineering thought.

---

# PHASE 13 — PRODUCT.MD

Create:

`PRODUCT.md`

Maximum length: one page.

Answer the four questions in the assignment.

1. Who loses the most when a question is broken, and how does the design reflect that?
2. What would you never let the AI auto-apply, and why?
3. What one metric would you watch in week one?
4. What is one idea beyond the assignment that you would pitch to Acadza?

Use thoughtful, specific product reasoning.

Focus on student impact, trust, faculty workload and learning outcomes.

Do not use generic startup language.

---

# PHASE 14 — DOCUMENTATION

Create:

```text
README.md
PROMPTS.md
PRODUCT.md
results.json
bonus_findings.json

docs/
    assignment-analysis.md
    architecture.md
    data-dictionary.md
    evaluation.md
    safety.md
    design-decisions.md
    deployment.md
    testing-report.md
    demo-walkthrough.md

SUBMISSION_REPLY_DRAFT.md
VIDEO_SCRIPT.md
```

README.md must include:

- Product overview.
- Screenshots.
- Architecture.
- Features.
- Technology stack.
- Installation.
- Environment variables.
- Database setup.
- Data ingestion.
- Running locally.
- Running tests.
- Generating results.json.
- Deployment.
- Known limitations.

The README must be sufficient for another engineer to run the application without asking me questions.

---

# PHASE 15 — THREE-MINUTE DEMONSTRATION

Prepare a professional three-minute demo.

Create:

`VIDEO_SCRIPT.md`

The video must demonstrate:

0:00–0:20 — The problem and product.

0:20–0:45 — Main dashboard and priority queue.

0:45–1:15 — A genuine answer-key defect and independent verification.

1:15–1:45 — Before/after correction and safety checks.

1:45–2:15 — A difficult faculty-review case, such as R034 or R025.

2:15–2:40 — A false student report and a non-content issue.

2:40–3:00 — Audit history, student reply and product impact.

Use actual dataset records.

Prepare the application and browser state so the demonstration can be recorded smoothly.

Do not claim to have created a recording if you have only prepared a script.

---

# PHASE 16 — DEPLOYMENT AND GITHUB

The assignment requires:

- A public GitHub repository.
- A live application.
- Availability for at least seven days.

Prepare the project for deployment.

Inspect available credentials and authenticated integrations.

Prefer a free-tier deployment.

Possible architectures include:
- Vercel.
- Render.
- Netlify.
- Hugging Face Spaces.

Choose the most suitable option based on the actual application architecture and available credentials.

Do not create paid resources.

Do not invent deployment URLs.

Do not expose secrets.

Do not expose student identifiers in public UI or logs.

Review the assignment's data-sharing implications before publishing raw supplied data. Do not publish the original archive or unnecessary student-level information. Include only data necessary for the assignment and permitted for public sharing.

The public repo should contain:
- Application source.
- Tests.
- Results.
- Documentation.
- PROMPTS.md.
- PRODUCT.md.
- Reproducible setup instructions.

If the LLM API is unavailable in production, deploy the console with verified precomputed results and clearly disclose this in the README.

Use persistent storage for faculty actions and audit logs wherever possible.

Verify the deployed application by actually opening it and exercising the workflow.

If deployment credentials are missing:
- Finish all local work.
- Prepare deployment configuration.
- Give exact deployment steps.
- State precisely what credential or action remains necessary.

Do not email Acadza or submit the assignment without my explicit approval.

---

# PHASE 17 — FINAL QUALITY GATE

Do not declare completion merely because the code compiles.

Run:

1. Dependency installation.
2. Lint.
3. Type checking.
4. Unit tests.
5. Integration tests.
6. Browser tests.
7. Production build.
8. Database migrations.
9. Seed/import.
10. Results generation.
11. JSON schema validation.
12. Security checks.
13. Application startup.
14. Full browser walkthrough.

Verify:

- 43 questions imported.
- 44 reports processed.
- All reports mapped correctly.
- All duplicates retained.
- Exact taxonomy enforced.
- All repair scopes enforced.
- All 44 result entries present.
- No malformed JSON.
- No fabricated model calls.
- No invented evaluation metrics.
- No automatic human-only repairs.
- No prompt injection succeeding.
- No original question content silently overwritten.
- Audit entries persist.
- Mathematical rendering works.
- Before/after diffs are correct.
- All important buttons work.
- No broken routes.
- No critical console errors.
- No broken deployment paths.

Fix critical and high-priority failures.

Then perform another complete test run.

Maintain:

`docs/implementation-log.md`

Update it as work progresses, including completed phases, commands executed, failures, fixes and remaining work.

If interrupted, resume from the log without restarting unnecessarily.

---

# FINAL EXPECTED OUTPUT

The completed project must include:

1. A working AI report investigation engine.
2. An independently validated classification pipeline.
3. Safe correction generation.
4. Strict taxonomy enforcement.
5. Duplicate report grouping.
6. Faculty review console.
7. Before/after diffs.
8. Mathematical rendering.
9. Persistent approval/rejection workflow.
10. Audit history.
11. Student reply generation.
12. `results.json` with all 44 reports.
13. `bonus_findings.json`.
14. `PROMPTS.md`.
15. `PRODUCT.md`.
16. Complete README.
17. Automated tests.
18. Evaluation documentation.
19. Three-minute video script.
20. Public GitHub repository, if authorized and available.
21. Live application URL, if successfully deployed.
22. Submission reply draft.

## FOUR EMAIL SUBMISSION QUESTIONS

Prepare a draft for the four questions in the original assignment:

1. Is this long-term remote Monday-to-Saturday product-building role genuinely what you want?
2. How many months can you commit?
3. What is your earliest start date?
4. In 2–3 lines, why this work and why now?

Do not invent my commitment duration or earliest start date. Leave clearly marked fields for my confirmation.

Do not send the email.

---

# FINAL REPORT TO ME

When implementation is complete, provide a concise but detailed report containing:

**1. Product**
- What was built.
- How the AI pipeline works.
- What makes the system reliable.

**2. Dataset**
- Questions processed.
- Reports processed.
- Duplicate groups.
- Defects found.
- False reports handled.
- Bonus discoveries.

**3. Engineering**
- Technology stack.
- Architecture.
- Important implementation decisions.

**4. Results**
- Location of results.json.
- Classification validation.
- Test results.
- Safety validation.

**5. Deliverables**
- Repository path.
- PROMPTS.md.
- PRODUCT.md.
- README.
- Video script.
- Submission reply draft.

**6. Deployment**
- Local URL.
- Live URL if verified.
- GitHub URL if created.
- Remaining deployment requirements.

**7. Remaining work**
- List only genuine outstanding items.
- Identify any action that requires my authorization.

---

# EXECUTION DIRECTIVE

Start by inspecting the actual assignment archive.

Then implement the complete application.

Do not return a plan instead of a product.

Do not stop after the first successful build.

Do not create a superficial dashboard.

Do not hardcode the dataset's answers as the sole classification mechanism.

Do not fabricate AI reasoning, experiments, tests or results.

Do not sacrifice safety for a higher automatic-correction rate.

The goal is to build a product that makes the Acadza engineering team think:

**This person understands AI, can reason about real engineering problems, cares about students, and can build software that people can actually trust.**

Work autonomously through all phases until the strongest complete submission possible is ready.

BEGIN NOW.

---

## Product prompts

The shipped application makes no LLM or external-model calls. It uses pre-reviewed offline adjudications in data/adjudications.json, and results are validated by scripts/generate-results.mjs and shared safety checks. There are no runtime system, classification, verification, repair, or student-reply prompts to reproduce. The interface discloses that it is an offline baseline; it does not connect to Acadza production.

## Development process and recovered instructions

The implementation used AI-assisted coding under iterative user direction and review. The initial master prompt above is preserved as it appeared in this file. The following attached user instructions are reproduced verbatim where the source text is available. Their inclusion records what was requested, not a claim that every requested action was performed. Outcomes below each prompt point to repository evidence.

### Stage 2 — UI and workflow quality refinement

Source: the attached prompt titled “ACADZA QUESTION INTELLIGENCE — COMPLETE UI/UX REDESIGN AND QUALITY IMPROVEMENT.” The prompt text below is verbatim.

`````text
# ACADZA QUESTION INTELLIGENCE — COMPLETE UI/UX REDESIGN AND QUALITY IMPROVEMENT

Act as a principal product designer, senior frontend engineer, accessibility specialist and QA engineer.

You are working on an EXISTING application:

`ac adza-question-intelligence`

The existing application uses React, TypeScript, Vite, Lucide icons and custom CSS.

Your task is to transform it into an exceptionally polished, professional faculty-facing SaaS product.

This is a refinement of the existing implementation, not a complete rewrite.

## NON-NEGOTIABLE RULES

1. Preserve the existing working application.
2. Do not delete or modify the original question dataset.
3. Do not change the 44 report-level adjudications without independently establishing a factual error.
4. Preserve exactly 44 entries in results.json.
5. Preserve the assignment's seven verdicts and 18 repair types.
6. Preserve all question IDs and report IDs.
7. Do not introduce fabricated metrics or fake activity.
8. Do not claim live AI inference.
9. Keep the offline adjudication baseline clearly identified.
10. Do not replace working functionality with decorative UI.
11. Implement all important interactions.
12. Test the application after every substantial change.

# PART 1 — COMPLETE VISUAL REDESIGN

The existing interface has a major readability problem.

58 of its 66 font-size declarations are between 7px and 10px.

This must be corrected.

### Typography system

Establish consistent design tokens.

Suggested sizes:

- Main page heading: 28–32px.
- Section headings: 18–21px.
- Card headings: 15–17px.
- Main body: 14–15px.
- Supporting text: 12–13px.
- Metadata: 11–12px.
- Button text: 13–14px.
- Small labels: minimum 10–11px.

Use consistent line heights.

Use DM Sans or another suitable professional font for body content and Manrope for headings.

Mathematical content must remain particularly readable.

Never sacrifice readability to fit more information on the screen.

### Visual direction

Create a premium enterprise EdTech interface.

Retain the existing Acadza identity:
- Navy/charcoal typography.
- Restrained lime accent.
- Neutral background.
- Subtle blue and green status colors.

Improve:
- Spacing.
- Alignment.
- Typography.
- Borders.
- Shadows.
- Card hierarchy.
- Navigation.
- Responsive behaviour.
- Interactive states.

Avoid:
- Excessive gradients.
- Oversized decorative graphics.
- Unnecessary rounded cards everywhere.
- Generic AI dashboard aesthetics.
- Excessive empty space.
- Tiny text.

The product should feel like a mature commercial SaaS application.

# PART 2 — IMPROVE THE OVERALL APPLICATION STRUCTURE

Create a more useful navigation system.

Recommended sections:

1. Overview.
2. Review Queue.
3. Proactive Findings.
4. Approved / Staged Changes.
5. Audit History.

The Overview should provide an actual summary of the dataset.

Use only real values calculated from the supplied records and local review state.

Do not create artificial analytics.

The Overview should include:
- Total questions.
- Total reports.
- Unique affected questions.
- Verified defects.
- Safe correction candidates.
- Faculty review cases.
- Non-content issues.
- Completed local reviews.
- Highest-priority unresolved cases.
- Recent actual local review actions.

Add a useful chart only where it communicates meaningful information.

The Proactive Findings section should display findings from bonus_findings.json, separately from student-reported defects.

# PART 3 — REDESIGN THE REVIEW QUEUE

Make this the strongest screen in the application.

### Layout

Use a desktop-first two-pane layout:

Left:
- Search and filters.
- Question-case list.
- Priority and status.

Right:
- Selected case investigation.
- Evidence.
- Original question.
- Proposed correction.
- Faculty actions.

Use a comfortable queue width of approximately 340–390px on desktop.

Ensure the detail area has sufficient space for long mathematical expressions and solutions.

Make the detail header and action bar accessible while scrolling.

### Queue cards

Every case card should display:

- Question ID.
- Subject.
- Chapter.
- Verdict.
- Repair category.
- Priority.
- Number of linked reports.
- Latest report time.
- Current review status.

Make the priority indicator visually meaningful.

Do not simply label the first item "Top priority" without explaining the underlying score.

Use appropriate status labels:
- Safe fix candidate.
- Faculty review required.
- No content change.
- Already reviewed.

### Search

Improve search to cover:

- Report ID.
- Question ID.
- QID.
- Subject.
- Chapter.
- Student comment.
- Question text.
- Solution text.
- Stored answer.
- Source platform.

Implement the displayed keyboard shortcut:

- Ctrl+K on Windows/Linux.
- Cmd+K on macOS.
- Escape to clear or close search.

The displayed shortcut must actually work.

### Filters

Implement working filters for:

- Verdict.
- Repair type.
- Review route.
- Subject.
- Chapter.
- Priority.
- Review status.
- Source platform.

Show the number of matching cases.

Provide a clear-all-filters action.

Ensure filters can be combined.

Maintain correct selection when filtering changes the visible cases.

# PART 4 — IMPROVE THE INVESTIGATION EXPERIENCE

The selected case must provide a clear, logically ordered investigation.

### Header

Display:

- QID.
- Question ID.
- Subject and chapter.
- Question type.
- Linked report count.
- Verdict.
- Review route.
- Priority.
- Review confidence.

Confidence must be described as an uncalibrated offline review score, not a statistically calibrated probability.

### Evidence panel

Replace vague AI-style presentation with an honest investigation summary.

Show:

- Student's claim.
- Relevant question evidence.
- Answer verification.
- Solution consistency.
- Taxonomy validation.
- Safety decision.
- Why the case was routed for faculty review or safe staging.

Use clear pass, warning and not-applicable states.

Do not mark mandatory faculty review as a failed validation. Show it as a required human gate.

Change the current `OFFLINE VERIFIED` label to:

`REVIEWED OFFLINE BASELINE`

Add a small explanatory tooltip:

"These are pre-reviewed assignment decisions. No live LLM inference is performed in this demo."

### Individual student reports

When multiple reports belong to one question, show every report separately.

For each report display:
- Report ID.
- Original comment.
- Source platform.
- Submission time.
- Individual verdict.
- Individual evidence.
- Individual proposed repair, if any.

Do not silently rely only on the first report's adjudication when grouped reports have different results.

Keep question-level aggregation while preserving report-level traceability.

### Original question

Redesign the question viewer.

Provide clear tabs:

- Question.
- Solution.
- Answer and history.
- Images, if present.

Preserve original HTML and MathML.

Use DOMPurify or equivalent safe sanitization.

Ensure:
- Equations render correctly.
- Superscripts and subscripts are readable.
- Fractions render properly.
- Options have clear separation.
- Long solutions wrap correctly.
- Images have appropriate fallbacks.
- Source content is never modified by local review actions.

# PART 5 — EXCEPTIONAL BEFORE/AFTER COMPARISON

This is one of the most important improvements.

The current comparison shows entire content blocks but does not adequately highlight the exact changed substring.

Build a precise diff experience.

For each proposal:

- Display the exact field.
- Show the original content.
- Show the proposed content.
- Highlight removed content.
- Highlight inserted content.
- Preserve unchanged context.
- Render mathematical expressions correctly.

For answer-key changes, show the original and proposed answer clearly.

For question and solution changes, use an inline diff where practical.

For array-valued answers, preserve the original data type.

For long solutions, allow expanding the diff.

Clearly identify whether the change is:
- Proposed.
- Edited by faculty.
- Approved locally.
- Staged locally.
- Rejected.

Never imply that the actual Acadza production database was modified.

# PART 6 — FIX ACTION SAFETY

Review the existing `recordAction`, `saveEdit` and `validateEditScope` logic.

There is an important improvement required:

**No apply or approval action should be possible when the correction fails its safety checks.**

Implement a central action eligibility function.

Before enabling a safe correction, verify:

1. The repair exists in the official taxonomy.
2. The field is allowed.
3. The original value matches.
4. The proposed replacement is valid.
5. The confidence threshold is satisfied.
6. The route is permitted.
7. The repair is not human-only.
8. No unresolved safety warning exists.
9. Any faculty-edited replacement passes validation again.

Do not trust the original validation result after someone edits the proposed replacement.

### Action buttons

Remove the duplicate primary action in the page header.

Keep one clear primary action in the selected case's action bar.

Use contextual labels:

- Stage safe correction.
- Approve proposed correction.
- Mark as reviewed.
- Reject report.
- Request further review.

For consequential content changes, show a concise confirmation dialog with the actual before/after change.

For no-change reports, do not display an action that suggests a correction will be applied.

Ensure the buttons have appropriate disabled states and explanations.

All actions must remain local to the demo.

# PART 7 — PROPER AUDIT HISTORY

The current audit entry stores basic metadata and a note.

Improve this.

Each action should retain:

- Unique audit ID.
- Timestamp.
- Actor.
- Question ID.
- Associated report IDs.
- Action.
- Previous status.
- New status.
- Previous proposed value.
- New proposed value.
- Reason.
- Repair field.

For correction edits, retain before/after snapshots.

Add an expandable audit entry.

Add filters for:
- Action type.
- Date.
- Question ID.
- Report ID.

Allow JSON export.

Maintain the distinction between:
- Proposed.
- Edited.
- Approved.
- Staged.
- Rejected.

Do not claim append-only server-side audit guarantees: this is still browser-local demo storage.

Implement robust localStorage handling for:
- Missing state.
- Invalid JSON.
- Old schema versions.
- Storage failures.
- Resetting the demo.

Add a safe demo-reset confirmation.

# PART 8 — ACCESSIBILITY AND RESPONSIVENESS

Test at:

- 360px mobile.
- 390px mobile.
- 768px tablet.
- 1024px laptop.
- 1280px desktop.
- 1440px desktop.
- 1920px desktop.

Requirements:

- No horizontal overflow.
- No clipped content.
- Readable mathematical content.
- Proper mobile queue navigation.
- Keyboard-accessible buttons.
- Visible focus states.
- Appropriate contrast.
- Accessible modal interactions.
- Correct semantic headings.
- Useful accessible labels.
- Reduced-motion support.

The desktop two-pane layout must not be forced onto small screens.

Use a dedicated mobile case-navigation experience.

# PART 9 — MICROINTERACTIONS

Add polished but restrained interactions:

- Smooth queue selection.
- Subtle hover feedback.
- Clear selected states.
- Status transitions.
- Toast notifications.
- Modal opening and closing.
- Loading indicators where actual loading occurs.
- Useful empty states.
- Clear error states.

Do not simulate network activity.

Do not show fake AI thinking animations.

Do not show fake progress percentages.

# PART 10 — AUTOMATED TESTS

Expand the test suite.

Add tests for:

- Search across all intended fields.
- Combined filters.
- Priority sorting.
- Grouped report display.
- Report-level versus case-level verdicts.
- Local review state.
- Edited proposal validation.
- Safety-gated actions.
- Rejected changes.
- Audit snapshots.
- Audit filtering.
- Demo reset.
- Corrupted localStorage.
- Responsive navigation where practical.
- MathML preservation.
- Exact results.json schema.

Use Playwright for end-to-end browser testing if the required environment is available.

Test the complete flow:

1. Open dashboard.
2. Search R001.
3. Open its question.
4. Inspect the answer-key defect.
5. Inspect the before/after change.
6. Stage the correction.
7. Verify the audit entry.
8. Edit another proposal.
9. Confirm the edit is revalidated.
10. Reject a report.
11. Reset the demo.
12. Confirm the application returns to its initial state.

Do not report tests as passed unless actually executed.

# PART 11 — SCREENSHOTS

Capture real screenshots from the improved running application.

Save them under:

`docs/screenshots/`

Required:

1. overview.png
2. review-queue.png
3. investigation-detail.png
4. mathematical-diff.png
5. faculty-review.png
6. proactive-findings.png
7. audit-history.png
8. mobile-view.png

Use actual assignment records.

Show the R001–R003 LCR case, a faculty-review case such as R034, and an appropriate no-error case.

Ensure screenshots contain no broken components, clipped equations or placeholder data.

Update README.md to display the screenshots.

# PART 12 — DOCUMENTATION

Update:

- README.md.
- docs/architecture.md.
- docs/safety.md.
- docs/testing-report.md.
- docs/demo-walkthrough.md.
- docs/implementation-log.md.

Document every material change.

Be honest that:
- The app uses pre-reviewed offline adjudications.
- It does not call a live LLM.
- It does not connect to Acadza production.
- Faculty decisions persist only in browser-local storage.
- It is a demonstration application.

Do not exaggerate the system's production readiness.

# PART 13 — FINAL VERIFICATION

Run:

```bash
npm ci
npm run lint
npm test
npm run results
npm run build
npm audit
```

Also perform actual browser testing.

Ensure:
- Exactly 43 questions.
- Exactly 44 reports.
- Exactly 39 question cases.
- Exactly 44 results.
- No lost duplicate reports.
- No changed question IDs.
- No invalid taxonomy values.
- No unsafe automatic repairs.
- No broken routes.
- No console errors.
- No broken screenshots.

Do not alter the adjudications simply to make the dashboard appear better.

# PART 14 — COMPLETE ZIP DELIVERABLE

After everything is finished, create:

`Acadza-Question-Intelligence-Polished.zip`

It must include:

- Complete application source.
- All required data files.
- results.json.
- bonus_findings.json.
- PROMPTS.md.
- PRODUCT.md.
- README.md.
- Documentation.
- Screenshots.
- Production build.
- Deployment configuration.
- Tests.

Exclude:
- node_modules.
- Temporary files.
- Unnecessary caches.
- Local secrets.
- Personal credentials.

Verify the archive can be extracted and its source structure is complete.

Do not include the ZIP inside itself.

# FINAL REPORT

Return:

1. What changed visually.
2. What functional issues were fixed.
3. Screenshots directory.
4. Test results.
5. Build results.
6. Updated project path.
7. Exact polished ZIP path.
8. Remaining limitations.

Do not stop after producing a design proposal.

Implement the complete redesign, test it, capture screenshots and create the final ZIP.

BEGIN WITH THE EXISTING PROJECT.
`````

**Recorded outcome:** The implementation log records clearer typography and hierarchy, combined search and filters, report-level case details, exact before/after views, safety checks, audit workflow, and responsive layouts. The eight earlier screenshots are retained under docs/screenshots/. The request is evidence of desired changes; the log and screenshots are evidence of resulting work.

### Stage 3 — Public GitHub release and deployment

Source: the attached prompt titled “ACADZA FINAL SUBMISSION — PUBLIC GITHUB, LIVE DEPLOYMENT AND RELEASE VERIFICATION.” The prompt text below is verbatim.

`````text
# ACADZA FINAL SUBMISSION — PUBLIC GITHUB, LIVE DEPLOYMENT AND RELEASE VERIFICATION

Continue from the existing polished project. Do not rebuild the application.

Project:

`ac adza-question-intelligence`

Use the actual project directory containing package.json, README.md, results.json and src/.

The latest project archive is `Acadza-Question-Intelligence-Polished.zip`.

The user has authorized publication of the anonymized assignment dataset for this submission.

Your mission is to take the existing polished application through final release and submission readiness.

## 1. INSPECT THE CURRENT PROJECT

Inspect:
- Git status and remotes.
- package.json and package-lock.json.
- README.md.
- PROMPTS.md.
- PRODUCT.md.
- results.json.
- bonus_findings.json.
- data/.
- docs/.
- screenshots.
- dist/.
- deployment configuration.

Preserve all existing functionality and data.

Do not overwrite working source files unnecessarily.

## 2. FIX DOCUMENTATION INCONSISTENCIES

Make the documentation match the actual current application.

In particular:

- Replace the stale `OFFLINE VERIFIED` references with `REVIEWED OFFLINE BASELINE`.
- Replace the stale claim about four unit tests with the actual verified test count.
- Ensure PROMPTS.md accurately says that no live LLM calls are made.
- Keep the explanation that adjudications are a pre-reviewed offline baseline.
- Do not fabricate three model failures.
- Do not invent prompt experiments.
- Preserve the original master coding prompt verbatim.

Explain the difference between report-level and case-level metrics.

The dashboard reports grouped question cases, while results.json contains individual report entries.

For example:
- 11 report-level auto_apply entries correspond to 9 safe question cases.
- 19 report-level faculty_review entries correspond to 16 faculty-review cases.
- 44 individual report results remain in results.json.

Add this distinction to README.md and docs/evaluation.md.

Create `docs/data-anonymization.md` documenting:
- Original studentId field removal.
- Preservation of report IDs and question IDs needed for joins.
- Preservation of the supplied question content and taxonomy.
- Verification that no student IDs remain in public report records.
- The fact that the original archive remains private.

Do not claim that Acadza gave written authorization unless such evidence exists.

## 3. STRENGTHEN FINAL SAFETY VALIDATION

Inspect the result-generation script and the application action eligibility checks.

Ensure the following conditions are enforced consistently:

- Only verdict `defect` can be automatically staged.
- Repair must exist in the official taxonomy.
- The field must be explicitly permitted.
- Taxonomy `auto` must be true.
- The proposed source value must match.
- Confidence must meet the 95% threshold.
- The route must be `auto_apply`.
- The edit must be valid and non-empty.
- Human-only repairs must never be automatically staged.
- The original source data must remain unchanged.

Keep a conservative allowlist for safe automatic repairs where appropriate.

Ensure the generator cannot accept an unsafe explicit `route` value that bypasses the derived-route safety rules.

Add regression tests for unsafe explicit routes and human-only repairs.

Do not change correct existing results merely to improve the appearance of the metrics.

## 4. RUN COMPLETE VALIDATION

Use Node.js 22.12 or newer.

Run:

```bash
npm ci
npm run lint
npm test
npm run results
npm run build
npm audit
```

Fix actual failures.

Record exact command outputs and test counts in:
- docs/testing-report.md
- docs/implementation-log.md

Verify:
- 43 questions.
- 44 reports.
- 39 question cases.
- 44 unique results.
- Correct question joins.
- Exact taxonomy.
- Valid result schema.
- No student IDs in the anonymized report dataset.
- No unsafe automatic corrections.
- No secrets committed.

Do not claim success for commands that were not executed.

## 5. CREATE THE PUBLIC GITHUB REPOSITORY

GitHub CLI is already authenticated.

Verify:

```bash
gh auth status
```

Check whether the project already has a GitHub remote.

If an appropriate repository exists, reuse it.

Otherwise create a PUBLIC repository using a valid kebab-case name derived from:

`Acadza Question Intelligence`

Suggested name:

`ac adza-question-intelligence`

Remove spaces to form a valid GitHub repository slug.

Repository description:

"Faculty-facing AI question-quality review console with evidence-backed defect triage, safe correction proposals, and audit history."

Before pushing:

- Review `.gitignore`.
- Exclude `.env`.
- Exclude credentials.
- Exclude node_modules.
- Exclude unnecessary temporary files.
- Include source code.
- Include anonymized assignment data.
- Include results.json.
- Include PROMPTS.md.
- Include PRODUCT.md.
- Include documentation and screenshots.
- Include the result-generation script.

The original assignment ZIP must not be committed.

Preserve the existing question and report IDs.

Do not remove the anonymized assignment data.

Run a complete secret scan before committing.

Commit with a professional message:

`Finalize Acadza Question Intelligence submission`

Push to the main branch.

Verify the repository is actually public and that the latest commit is visible remotely.

Return the exact repository URL.

## 6. DEPLOY THE LIVE APPLICATION

The current application is a static React/Vite application.

Prefer GitHub Pages with GitHub Actions if supported.

Alternatively use Vercel or Netlify if an authenticated deployment account is available.

### GitHub Pages option

1. Configure Vite's base path correctly for the repository.
2. Add `.github/workflows/deploy.yml`.
3. Use Node.js 22.
4. Install with npm ci.
5. Run lint and tests.
6. Build the production application.
7. Upload the dist artifact.
8. Deploy GitHub Pages.
9. Configure the repository's Pages source to GitHub Actions.
10. Wait for the workflow to finish.

Do not break the existing local development URL.

If Vite requires a repository-specific base path, configure it without hardcoding an incorrect path.

### Deployment verification

Open the actual public URL.

Check:
- Dashboard loads.
- All 43 questions are represented.
- All 44 reports are available.
- R001–R003 group correctly.
- Mathematical expressions render.
- Search works.
- Filters work.
- Before/after comparison works.
- Local staging works.
- Audit history works.
- Reset demo works.
- No broken asset paths.
- No console errors.

The public app must work without an API key.

Clearly state that it uses pre-reviewed offline results and does not perform live LLM inference.

Do not claim that local browser storage provides shared faculty persistence.

Keep the deployment available for at least seven days.

If GitHub Pages is unavailable, investigate another free hosting provider.

Do not create paid resources.

Do not invent a live URL.

## 7. FINAL VIDEO PREPARATION

Inspect VIDEO_SCRIPT.md.

The assignment requires a three-minute screen recording.

If an actual screen-recording tool is available, record the application.

Otherwise:
- Keep the timestamped script.
- Prepare the exact browser navigation sequence.
- Prepare the selected question cases.
- Ensure the demo starts from a clean local state.
- Tell me exactly how to record it using Windows Game Bar or OBS.

The video should demonstrate:
1. Overview.
2. Review queue.
3. R001–R003 mathematical verification.
4. Before/after answer correction.
5. R034 faculty review.
6. R017 false report.
7. Audit history.
8. Safety boundary.

Do not claim that a recording exists if only the script exists.

## 8. UPDATE THE SUBMISSION EMAIL

Update SUBMISSION_REPLY_DRAFT.md.

Include:
- Actual GitHub URL.
- Actual verified live URL.
- Video link placeholder.
- Brief project explanation.
- Answers to the four role questions.

Do not invent:
- My commitment duration.
- My earliest joining date.
- My personal motivation.

Leave these for my confirmation.

Do not send the email.

## 9. FINAL RELEASE PACKAGE

Create:

`Acadza-Question-Intelligence-Final-Submission.zip`

Include:
- Complete source.
- Anonymized data.
- results.json.
- bonus_findings.json.
- PROMPTS.md.
- PRODUCT.md.
- README.md.
- Documentation.
- Screenshots.
- Tests.
- Deployment workflow.
- Production build.

Exclude:
- node_modules.
- Private credentials.
- Original unmodified assignment archive.
- Temporary files.
- Git internals.

Verify that the ZIP can be extracted and that its structure is complete.

## 10. FINAL RESPONSE

Return:

1. Public GitHub repository URL.
2. Verified live application URL.
3. Latest Git commit hash.
4. Deployment workflow status.
5. Test results.
6. Build results.
7. Secret-scan results.
8. Final ZIP path.
9. Screenshots directory.
10. Video status.
11. Final submission email draft.
12. Remaining actions requiring my input.

Do not send or submit anything on my behalf.

Do not stop after creating the GitHub repository. Finish deployment and verify the live site.

BEGIN WITH THE EXISTING POLISHED PROJECT.
`````

**Recorded outcome:** The public repository is https://github.com/Hiten41/acadza-question-intelligence. The Vercel history is chronological: the first recorded production verification lists deployment dpl_2n4fzg3jytmJqdiRGobVYeV1ubAA and 23 browser checks; later visual refinements produced newer deployments. The current deployment record is in docs/deployment.md and docs/implementation-log.md. Those records distinguish requested actions from checks actually performed. The prompt's video-link placeholder was later replaced with the public 3:00 walkthrough: https://github.com/Hiten41/acadza-question-intelligence/releases/download/acadza-demo-walkthrough-2026-11-11/Acadza-Question-Intelligence-Walkthrough-Trimmed.mp4.

#### Follow-up production deployment instructions

A later user message restated the deployment task and included an absolute local workspace path. To avoid publishing that personal path, this is a reconstructed summary rather than a purported verbatim quotation. It asked to continue from the existing repository, synchronize safely with main, run installation, lint, tests, result generation, production build and npm audit, then deploy to the existing Vercel personal account only if checks passed. It required real-browser testing of the live interactions, genuine screenshots, documentation updates, preservation of assignment data/results, and a documentation commit/push. It explicitly prohibited email, assignment submission, unsupported production claims, a live-LLM claim, and switching hosts or creating a paid subscription.

**Recorded outcome:** docs/deployment.md records the production alias, deployment ID dpl_GMkT9TWaDke4CDLGWYjURGpesbTG, HTTP 200 access, and 37 Chromium checks for the latest deployment. The initial 23-check run is historical, not the latest count. Genuine captures are in screenshots/deployed/.

### Stage 4 — Premium dark-mode redesign

Source: the attached prompt titled “ACADZA QUESTION INTELLIGENCE — PREMIUM DARK MODE REDESIGN.” The prompt text below is verbatim.

`````text
# ACADZA QUESTION INTELLIGENCE — PREMIUM DARK MODE REDESIGN

Act as an award-winning SaaS product designer, senior frontend engineer and design-system architect.

Redesign the existing Acadza Question Intelligence application into a visually exceptional, premium DARK-MODE-FIRST SaaS product.

This is a complete visual redesign, not a minor CSS update.

The current interface is too plain, washed out and visually uninteresting. I want a polished, sophisticated, colorful dark interface with excellent typography, rich surfaces, beautiful charts, carefully designed cards and professional interactions.

## 1. DESIGN INSPIRATION

Take inspiration from the visual quality of:

- Linear.
- Vercel.
- Raycast.
- Modern developer analytics platforms.
- Premium AI products.
- High-quality dark SaaS dashboards.

Do not copy their layouts directly.

Create a distinct Acadza visual identity.

The finished product should look like a professionally funded AI SaaS startup product.

**DARK MODE IS MANDATORY.**

Do not create a predominantly white interface.
Do not use a white main content background.
Do not use light cards on a dark background.
Do not make the UI plain black and grey either.

The interface must have depth, color, contrast and personality.

## 2. COMPLETE DARK DESIGN SYSTEM

Use the following palette as the starting point.

### Backgrounds

- Main application background: #090D18
- Sidebar: #0B1020
- Main surfaces: #111827
- Elevated cards: #172238
- Hover surfaces: #202D45
- Borders: #28354B

### Accent colors

- Electric indigo: #818CF8
- Violet: #A78BFA
- Cyan: #22D3EE
- Emerald: #34D399
- Blue: #60A5FA
- Amber: #FBBF24
- Coral: #FB7185
- Pink: #F472B6

### Typography

- Primary text: #F1F5F9
- Secondary text: #A7B3C7
- Muted text: #77869F

Create centralized CSS variables for every design token.

Use Manrope for headings and DM Sans for body text.

Use consistent spacing, typography, shadows, borders, gradients and radii.

## 3. SIDEBAR — PREMIUM DARK NAVIGATION

Create a sophisticated dark sidebar.

Requirements:

- Deep navy background.
- Prominent Acadza wordmark.
- Attractive custom logo treatment.
- Clear navigation icons.
- Bright indigo selected navigation item.
- Subtle colored active indicator.
- Attractive hover transitions.
- Proper spacing.
- Readable navigation labels.
- Distinct bottom profile and application-status area.

Navigation:

1. Overview.
2. Review Queue.
3. Proactive Findings.
4. Approved / Staged Changes.
5. Audit History.

The sidebar should feel like a premium developer platform.

Use a collapsible sidebar on desktop and a proper drawer on mobile.

## 4. TOP NAVIGATION

Build a refined top navigation bar.

Include:

- Current page title.
- Breadcrumbs where appropriate.
- Global search.
- Notification indicator only if backed by real data.
- Offline-baseline status.
- Profile/settings menu.

Use subtle borders and translucent dark surfaces.

Avoid unnecessary decorative icons.

## 5. DASHBOARD — MAKE IT VISUALLY IMPRESSIVE

The dashboard must be the strongest first impression.

Create a visually rich overview.

### Header

Title:

"Question Intelligence"

Subtitle:

"Monitor, investigate and resolve question-quality issues."

Show a tasteful violet/indigo accent or subtle gradient.

Clearly disclose that the application uses pre-reviewed offline assignment results rather than live LLM inference.

### Metric cards

Create large, beautifully designed metric cards.

Use distinct accent identities:

- Questions: Blue.
- Student Reports: Violet.
- Question Cases: Cyan.
- Verified Defects: Coral.
- Safe Correction Candidates: Emerald.
- Faculty Review: Amber.
- No Content Change: Indigo.
- Completed Reviews: Teal.

Each metric card must have:

- Large readable value.
- Attractive icon.
- Clear label.
- Short supporting description.
- Subtle colored glow.
- Carefully designed border.
- Gradient accent or decorative visual.
- Smooth hover interaction.

Cards should not all look identical.

Use actual dataset values.

### Charts

Build beautiful dark-mode visualizations.

Required:
- Verdict distribution donut chart.
- Repair category distribution.
- Review route distribution.
- Subject-wise issue distribution.

Use Recharts if appropriate.

Chart styling:
- Dark transparent backgrounds.
- Vibrant series colors.
- Elegant tooltips.
- Readable labels.
- Subtle grid lines.
- Clear legends.
- Responsive sizing.

Use actual result data only.

### Additional dashboard sections

Include:
- Highest-priority cases.
- Recent review activity.
- Subject distribution.
- Review completion.
- Proactive findings summary.

Create a visually balanced layout with varying card sizes.

Avoid a grid of eight identical white-looking rectangles.

## 6. REVIEW QUEUE — PREMIUM INVESTIGATION WORKSPACE

Create a sophisticated dark two-pane layout.

Left pane:
- Search.
- Filters.
- Case list.
- Priority indicators.
- Verdict badges.
- Subject and chapter.

Right pane:
- Selected case header.
- Investigation summary.
- Evidence.
- Original question.
- Individual reports.
- Proposed correction.
- Before/after comparison.
- Faculty actions.

Use subtle surface differences to establish hierarchy.

### Color-coded statuses

- Defect: Coral.
- Safe correction: Emerald.
- Faculty review: Amber.
- No error: Blue.
- Display issue: Cyan.
- App issue: Violet.
- Not actionable: Muted slate.

Use tinted badges, subtle glows and consistent status colors.

Do not rely on color alone: retain readable text labels.

### Search and filtering

Preserve all existing functionality.

Support:
- Report ID.
- Question ID.
- Subject.
- Chapter.
- Student comment.
- Question text.
- Solution text.

Implement attractive modern filter controls.

## 7. INVESTIGATION DETAIL — STRONG VISUAL HIERARCHY

Create distinct dark panels for:

1. Case summary.
2. Student reports.
3. Question content.
4. Solution.
5. Answer verification.
6. Evidence.
7. Proposed correction.
8. Safety validation.
9. Faculty decisions.

Use different accent treatments.

For example:

- AI/offline investigation: Violet.
- Verified evidence: Cyan.
- Defect: Coral.
- Safe correction: Emerald.
- Faculty review: Amber.
- Original question: Blue.

Mathematical expressions must remain readable.

Preserve HTML and MathML rendering.

Use safe HTML sanitization.

## 8. BEFORE/AFTER DIFF — PREMIUM PRESENTATION

Create a beautiful side-by-side comparison.

Original panel:
- Dark surface.
- Muted coral border.
- Red highlighted removed text.

Proposed panel:
- Dark surface.
- Emerald border.
- Green highlighted inserted text.

Use a clear arrow between the panels.

Show:
- Field being changed.
- Exact original value.
- Exact proposed value.
- Supporting evidence.
- Safety status.

Support mathematical expressions and arrays.

Never rewrite unrelated content.

## 9. PROACTIVE FINDINGS

Give this page a distinct violet/indigo visual identity.

Show:
- Finding severity.
- Question ID.
- Field.
- Evidence.
- Explanation.
- Suggested correction.
- Faculty action required.

Keep proactive findings separate from student-reported issues.

## 10. STAGED CHANGES AND APPROVALS

Build a polished change-management screen.

Use:
- Emerald for approved.
- Blue for staged.
- Amber for pending.
- Coral for rejected.

Show clear change status and exact before/after values.

Keep local demo decisions distinct from changes to Acadza's real question bank.

## 11. AUDIT TIMELINE

Use a vertical timeline with attractive colored event indicators.

Include:
- Action.
- Actor.
- Timestamp.
- Question ID.
- Report ID.
- Previous state.
- New state.
- Before/after snapshots.

Provide search and filters.

Keep the audit interface dark and highly readable.

## 12. TYPOGRAPHY AND SPACING

Use:
- Page headings: 30–34px.
- Section headings: 19–22px.
- Card titles: 15–17px.
- Body text: 14–15px.
- Supporting text: 12–13px.
- Metadata: 11–12px.

Do not use tiny typography to fit more content.

Use proper line heights and text contrast.

## 13. DEPTH AND POLISH

The interface must not look flat.

Use:
- Layered dark surfaces.
- Subtle gradients.
- Fine borders.
- Restrained colored shadows.
- Soft accent glows.
- Elegant transitions.
- Carefully designed hover states.
- Beautiful focus states.
- Polished dialogs and dropdowns.

Use gradients selectively on hero sections, metric cards and key actions.

Avoid excessive neon effects.

The final product should be sophisticated, not a gaming dashboard.

## 14. PRESERVE FUNCTIONALITY

This is mandatory.

Preserve:

- 43 questions.
- 44 reports.
- 39 question cases.
- All 44 result entries.
- Seven verdicts.
- Eighteen repair types.
- Search and filters.
- Investigation workflow.
- Safety checks.
- Approval and rejection.
- Local persistence.
- Audit history.
- Demo reset.

Do not fabricate statistics.

Do not modify correct adjudications.

Do not claim live LLM inference.

Do not introduce broken or decorative buttons.

## 15. RESPONSIVE DESIGN

Test:
- 360px.
- 390px.
- 768px.
- 1024px.
- 1280px.
- 1440px.
- 1920px.

Use a proper mobile navigation drawer.

The dark interface must maintain contrast on every screen size.

## 16. VISUAL QUALITY CONTROL

Open the application in a real browser.

Inspect every page.

Take screenshots of:
- Overview.
- Review queue.
- Investigation detail.
- Mathematical comparison.
- Proactive findings.
- Staged changes.
- Audit history.
- Mobile view.

Do not consider the redesign finished merely because the CSS compiles.

Compare the screenshots against the intended visual direction.

Improve any page that still looks plain, grey, empty or generic.

The result must have a coherent dark theme across the entire application.

## 17. RELEASE

Run:

- npm run lint
- npm test
- npm run results
- npm run build
- npm audit

Capture new screenshots.

Update README.md.

Commit and push to:

https://github.com/Hiten41/acadza-question-intelligence

Deploy the updated version to the existing Vercel project.

Verify the actual production URL and all main interactions.

Create:

Ac adza-Question-Intelligence-Dark-Premium.zip

Use the correct filename:

Ac adza-Question-Intelligence-Dark-Premium.zip

The final intended filename is:

Acadza-Question-Intelligence-Dark-Premium.zip

Include complete source, tests, screenshots, documentation and production build.

Do not send emails or submit the assignment.

## FINAL ACCEPTANCE CRITERIA

The application must:

- Be dark mode on every page.
- Have a beautiful navy/charcoal foundation.
- Use vibrant indigo, violet, cyan, emerald, amber and coral accents.
- Have rich, visually distinct dashboard cards.
- Have professional charts.
- Have an attractive sidebar.
- Have readable typography.
- Have beautifully designed investigation panels.
- Have clear before/after comparisons.
- Feel like a premium commercial AI SaaS product.

Do not simply recolor the existing application.

Completely transform its visual experience while preserving the underlying functionality.

BEGIN IMPLEMENTATION NOW.
`````

**Recorded outcome:** Commit 1fa6f98 introduced the dark dashboard. Its archived screenshot at that commit shows the colorful repeated eight-metric-card layout and prominent gradients/glows requested in this prompt. This was an intermediate design, not the final visual state.

### Stage 5 — Human-directed restrained dark refinement

Source: the attached prompt titled “ACADZA — HUMAN-DESIGNED PREMIUM DARK UI REFINEMENT.” The prompt text below is verbatim.

`````text
# ACADZA — HUMAN-DESIGNED PREMIUM DARK UI REFINEMENT

I am dissatisfied with the current visual design. Although it has a dark theme and colorful elements, it looks highly AI-generated.

I want you to approach this as an experienced product design team would.

This is NOT another generic AI dashboard redesign.

The objective is to create a distinctive, sophisticated, production-quality interface that looks intentionally designed by a skilled human product designer.

## 1. DESIGN PHILOSOPHY

Use these design references for their underlying design principles:

- Linear: information hierarchy, precise spacing, restrained surfaces.
- Raycast: typography, interactions, keyboard navigation.
- Vercel: clean technical presentation and excellent data visualization.
- Premium editorial analytics products: structured information and intentional composition.

Do not copy their interfaces.

Create an original Acadza design identity.

The application must remain dark mode throughout.

## 2. REMOVE THE GENERIC AI DASHBOARD AESTHETIC

Audit every page and remove unnecessary:

- Gradient backgrounds.
- Glowing borders.
- Neon shadows.
- Decorative blobs.
- Oversized icons.
- Excessive rounded cards.
- Repetitive metric tiles.
- Artificial AI labels.
- Unnecessary animations.
- Decorative charts that communicate no useful information.

Do not add gradients merely to make a section look attractive.

Every visual element must have a reason to exist.

## 3. NEW VISUAL IDENTITY

Use a sophisticated neutral dark palette.

Background: #101114
Sidebar: #141519
Primary surface: #191B20
Secondary surface: #1E2026
Hover surface: #252830
Borders: #2B2E36
Primary text: #F0F0F2
Secondary text: #A4A7B0
Muted text: #777D89

Use ONE primary accent:

Electric blue: #6D8AFF

Use semantic colors only where needed:

- Green: #42B883
- Amber: #E7B85C
- Red: #E47777
- Cyan: #61BFD0
- Violet: #A58BEA

Color should communicate meaning, not decorate the interface.

Use mostly neutral surfaces and reserve saturated colors for actions, status, selected elements and important evidence.

## 4. TYPOGRAPHY

Typography should carry the visual identity.

Use a carefully selected combination such as:
- Inter or Geist for interface text.
- A restrained monospace font for IDs and technical information.

Avoid excessively large headings.

Use:
- Page title: 25–29px.
- Section heading: 16–19px.
- Body: 14px.
- Secondary text: 12–13px.
- Metadata: 11–12px.

Establish consistent weights and line heights.

Do not use bold text everywhere.

Use whitespace and alignment to create hierarchy.

## 5. SIDEBAR

Create a narrow, understated dark sidebar.

Requirements:
- Simple Acadza wordmark.
- Small, consistent Lucide icons.
- Subtle selected navigation background.
- One blue accent for active navigation.
- Carefully aligned labels.
- No glowing icons.
- No oversized branding.
- No decorative profile card.

The sidebar should feel like a professional engineering tool.

## 6. OVERVIEW

Completely reconsider the dashboard layout.

Do not make eight identical colorful metric cards.

Instead:

- A compact page header.
- A restrained summary row.
- A meaningful verdict distribution visualization.
- A compact review-route breakdown.
- A priority queue.
- A subject-level issue breakdown.
- Recent local review activity.

Use a combination of tables, typography, dividers and small charts.

Metrics should be easy to scan, not the entire purpose of the page.

Do not invent activity or statistics.

## 7. REVIEW QUEUE

This should be the signature feature of the product.

Design it as a serious engineering investigation workspace.

Use:
- A compact left-hand case list.
- A spacious right-hand investigation panel.
- Clear selection states.
- Precise alignment.
- Thin dividers.
- Minimal status badges.
- Strong information hierarchy.

Avoid placing every individual field inside a separate rounded card.

Group related information naturally.

Make the question and solution readable.

## 8. INVESTIGATION DETAILS

Make this screen feel like a technical review tool rather than an AI chatbot.

Present:

1. Question information.
2. Original student reports.
3. Stored answer.
4. Solution.
5. Verification evidence.
6. Proposed repair.
7. Safety checks.
8. Faculty decision.

Use a clear reading order.

Use compact labels and meaningful section headings.

Do not write artificial descriptions such as "AI intelligence detected a high-confidence insight."

Explain what was actually verified.

The application uses an offline reviewed baseline. Represent this honestly.

## 9. BEFORE/AFTER COMPARISON

Make the correction interface exceptionally precise.

Use two aligned content areas with subtle semantic highlighting.

Original:
- Neutral dark surface.
- Muted red highlighting for removed content.

Proposed:
- Neutral dark surface.
- Muted green highlighting for inserted content.

No giant colored backgrounds.

The actual mathematical or textual change should be the focus.

## 10. TABLES AND DATA

Use professional data-table design.

- Consistent row heights.
- Clear column alignment.
- Restrained hover state.
- Subtle separators.
- Proper empty states.
- Readable identifiers.
- Useful sorting and filtering.

Do not put every table row inside a separate card.

## 11. MICROINTERACTIONS

Use restrained interactions:

- Smooth but quick transitions.
- Clear focus states.
- Elegant dropdowns.
- Useful keyboard shortcuts.
- Subtle selected-state feedback.
- Minimal toast notifications.

Avoid unnecessary motion and glowing effects.

## 12. MAKE EACH PAGE DISTINCT

Do not reuse the same generic card layout across all pages.

The dashboard should feel analytical.

The review queue should feel operational.

The investigation screen should feel technical.

Proactive findings should feel like an editorial findings report.

Audit history should feel like a chronological engineering log.

Each page should have a layout suited to its actual purpose.

## 13. PRESERVE ALL FUNCTIONALITY

Do not change:
- Original questions.
- Reports.
- Results.
- Bonus findings.
- Taxonomy.
- Adjudications.
- Safety rules.
- Review workflow.
- Local persistence.
- Audit functionality.

Preserve all existing tests and add tests for any modified behaviour.

Do not introduce fake AI inference.

## 14. VISUAL QA

Run the application and inspect every screen.

Take fresh screenshots.

Compare them against the design principles above.

Ask:

- Does this look like a real product?
- Is every color meaningful?
- Is the information hierarchy obvious?
- Is there unnecessary decoration?
- Does the interface look consistent?
- Could a professional designer defend every layout decision?

If it still looks like a generic AI-generated dashboard, refine it again.

## 15. RELEASE

Run lint, tests, result generation, production build and npm audit.

Capture new screenshots.

Preserve the existing GitHub repository and Vercel project.

Push and deploy only after all checks pass.

Do not send any emails.

Do not modify the actual assignment results.

Create a final ZIP containing the complete source, tests, documentation, screenshots and production build.

## FINAL ACCEPTANCE

I want a dark, sophisticated, restrained and genuinely beautiful interface.

No excessive gradients.

No neon everywhere.

No repetitive cards.

No fake AI aesthetics.

No generic dashboard templates.

**Make it look like an experienced product designer spent real time designing every screen.**
`````

**Recorded outcome:** Commit d695fc1 refined the dark workspace into neutral surfaces, fewer repeated tiles, compact navigation, meaningful charts, and layouts suited to each page. The deployed overview screenshot in screenshots/deployed/overview.png shows the restrained summary, charts, and priority queue. The implementation log records that question/report data, results, bonus findings, taxonomy, adjudications, and review behavior were retained.

### Stage 6 — Final production clarity corrections

The remaining short user feedback is available in this conversation but was not a full design prompt. The user questioned repeated investigation headings and opaque identifiers such as 60f742f660d187cc13a8078. These are recorded here as a reconstructed summary, not as verbatim prompts.

- Commit 7fb8965 simplified repeated investigation section headings; 2957979 documents that production update.
- Commit 279afb3 replaced prominent raw finding categories and database IDs with readable labels, a question-text preview, and a collapsed technical reference; 108a7cd documents the change.
- Commit 7cc4a21 refreshed the production screenshots. The latest deployment and 37-check browser verification are recorded in docs/deployment.md.

## Engineering decisions and tradeoffs

These decisions are reflected in data/adjudications.json, data/taxonomy.json, src/lib/review.ts, src/lib/route-safety.mjs, scripts/generate-results.mjs, the regression tests, and project documentation.

1. **Group work by exact question identity, retain each report.** Reports join to question _id through questionId, and the queue groups by that stable relation. Individual report IDs, comments, and adjudications remain visible in results.json. This reduces duplicate investigation without erasing report-level evidence.
2. **Keep the assignment snapshot read-only.** Source question/report records and reviewed adjudications are preserved; regeneration writes the result artifact. This makes the demonstration reproducible and avoids implying that it edits Acadza’s question bank.
3. **Use the assignment taxonomy as the permission boundary.** The seven verdicts and 18 repair types are loaded from the supplied taxonomy. Unknown values and out-of-scope fields fail validation instead of being mapped to an invented category.
4. **Derive the review route centrally.** Result generation and UI actions share safety logic. A proposed route cannot become automatic merely because a record labels it that way; repair type, evidence, confidence threshold, field scope, original value, and human-only rules are rechecked.
5. **Raise the bar for answer-key changes.** A student assertion alone is not proof. The exact proposal must match the source representation and evidence, pass eligibility checks, and show the change clearly; ambiguous or contradictory cases remain with faculty.
6. **Keep restricted and uncertain repairs human-controlled.** Cases involving unsound questions, diagrams, missing options, wrong question/chapter, syllabus, or identical options are not safe for automatic staging. The workflow presents a faculty gate rather than disguising uncertainty as a passed check.
7. **Prefer minimal patches over rewriting.** Exact source substrings and field-level values preserve unrelated text, HTML, MathML, images, and options. This makes review easier and limits collateral edits, at the cost of leaving complex repairs unresolved until faculty action.
8. **Preserve mathematical content and answer types.** Source MathML/HTML is sanitized for rendering without rewriting the underlying record; scalar and array answer representations are validated and retained. A new display representation was rejected because it could diverge from the source.
9. **Treat student comments as evidence, not instructions or ground truth.** Comments are shown unchanged for review. They are not submitted to a model, and instruction-like text such as R027 cannot change the classification or patch.
10. **Separate local staging from production writes.** Faculty-style actions demonstrate the review flow without credentials or a production endpoint. The tradeoff is that actions are not shared with a team and do not correct source content.
11. **Use a pre-reviewed offline baseline.** No model credential or server runtime was available for a safe live integration. A browser-side fake or key-bearing provider would misrepresent capability or expose secrets. This deterministic demonstration cannot adjudicate new incoming reports and states that limitation.
12. **Keep persistence and audit scope honest.** Local storage supports refresh, audit filtering/export, and demo reset without a backend. It is browser-profile local, mutable, and non-append-only; real faculty use would require authenticated shared storage and a durable audit service.
13. **Avoid fabricated analytics.** The priority heuristic is inspectable and includes defect urgency, route, offline score, repeated reports, and recency. It is not described as a learned or calibrated risk model; unmeasured activity and time metrics were omitted.

## Three verified AI-assisted development corrections

These examples concern generated implementation or documentation reviewed during AI-assisted work. They are not live LLM adjudication failures. The application did not run a live model, so no runtime model output or adversarial experiment is claimed.

### 1. Readability and information hierarchy

- **Instruction/evidence:** The attached Stage 2 prompt records a code audit finding that 58 of 66 font-size declarations were between 7 and 10 pixels and requested a readable scale. The earlier overview screenshot is docs/screenshots/overview.png; its eight equally weighted metric tiles demonstrate the density and hierarchy issue identified in the review.
- **Generated result that needed correction:** The initial interface’s small type and crowded metric-first overview did not give investigation evidence enough visual priority. This is a visual-quality shortcoming, not a mathematical error.
- **Detection:** The supplied font-size audit and screenshot review identified it.
- **Correction:** The implementation log records replacement of undersized typography with a readable type/spacing system, clearer status hierarchy, focus states, reduced motion, and responsive layouts. Later dashboard refinement removed the eight-tile emphasis. The current production capture is screenshots/deployed/overview.png.
- **Limit:** The available record supports the qualitative correction and recorded font audit; it does not contain a formal readability or accessibility study.

### 2. Excessive decoration in the intermediate dark redesign

- **Instruction/evidence:** The Stage 4 prompt explicitly requested saturated accents, gradients, glows, and eight distinct metric cards. The image archived at commit 1fa6f98:screenshots/deployed/overview.png visibly implements that direction.
- **Generated result that needed correction:** The result looked like a generic, heavily decorated dashboard and repeated the same metric-card pattern. This failed the later stated goal of a distinctive, human-directed product.
- **Detection and corrective instruction:** The user’s Stage 5 prompt explicitly identified excessive gradients, glow, repeated tiles, and generic AI-dashboard styling and requested restraint.
- **Correction:** Commit d695fc1 refined surfaces, overview composition, navigation, and page-specific layouts. Current screenshots and docs/implementation-log.md confirm the subsequent state. The 1fa6f98 screenshot remains retrievable through Git history; it is not represented as the final UI.

### 3. Deployment status becoming stale

- **What the record supports:** The implementation log contains time-ordered pre-deployment and successful-deployment notes, and its production entry says the successful deployment supersedes the preceding pre-deployment status. Current docs/deployment.md records the production alias, deployment ID, public HTTP verification, and latest 37-browser-check run.
- **Detection and correction:** A user-provided documentation instruction called out stale statements such as no live URL/no deployment. The correction was to record the successful deployment and identify the earlier status as superseded. The current documents report the verified URL https://acadza-question-intelligence.vercel.app, deployment dpl_GMkT9TWaDke4CDLGWYjURGpesbTG, and 37 checks for the latest deployment.
- **Historical limitation:** Searching the reachable Git history did not recover the exact earlier sentence variants listed in that instruction. They are treated as user-reported stale wording, not quoted or attributed to a particular commit. The successful current deployment is independently documented; the exact prior wording is not independently verifiable.

## Model-failure claims and limitations

No live LLM was configured or invoked in this submission. There are no reproducible live-model failures or actual model outputs to document, and no red-team experiment is claimed. Runtime protections instead validated the deterministic baseline: route derivation, taxonomy scope, source matching, human-only repair gating, untrusted report handling, and answer-type preservation. Future model integration would need versioned server-side prompts, strict schemas, independent mathematical verification, and adversarial evaluation before it could be described as working.
