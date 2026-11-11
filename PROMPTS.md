# MASTER AUTONOMOUS CODEX PROMPT — ACADZA AI INTERN BUILD ROUND

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

# Product prompt inventory and development record

## Product prompts

This build makes **no LLM or external model calls**. There are no runtime system, classification, verification, repair, or student-reply prompts to reproduce. The staged adjudications are a deterministic, manually researched baseline for this supplied assignment dataset. `scripts/generate-results.mjs` validates the closed taxonomy, report coverage, patch scope, and route constraints; it does not ask a language model to decide a case. The UI labels this mode “REVIEWED OFFLINE BASELINE.”

If a provider is added later, each prompt must be versioned here verbatim with its input and output schema. It must remain server-side, treat comments as untrusted data, and route uncertainty to faculty.

## Development instruction history

1. **Initial coding-assistant prompt:** the complete master prompt above, copied verbatim from the user-provided attachment on 10 November 2026.
2. **Follow-up user request:** “see acadza intern mail”. Gmail was searched to inspect the assignment email and its deadline; the provided prompt and attached assignment ZIP were then used to guide the implementation.
3. **Implementation iterations:** tool-assisted edits addressed data joining, taxonomy scope checks, UI navigation and audit flows, dynamic dashboard totals, and documentation. No additional model-directed prompts were used; these were direct code changes and deterministic validations, not AI adjudication runs.

## Model failures and limitations

There are no reproducible model failures to report because no live model was configured or invoked. Inventing outputs or claiming an experiment would be misleading. Relevant failure modes are instead covered by deterministic safeguards: R027's instruction-like text is treated as report content, unknown taxonomy values fail generation, and an answer-key patch outside its declared fields fails validation. The current regression suite covers dataset/output integrity, search and grouping, filter and priority behavior, exact diff behavior, safe-route derivation, human-only repair gating, typed proposals, browser-local state, and audit filtering; it is not a substitute for a future model red-team suite.

## Version history

- **v0 / offline assignment build:** no product prompts. Decision evidence is stored per report in `data/adjudications.json`; output is regenerated from source data and taxonomy. A future LLM-enabled version should add prompts here rather than silently changing behavior.
