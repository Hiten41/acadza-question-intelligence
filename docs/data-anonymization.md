# Assignment data anonymization

The public demo uses the assignment snapshot with the student identifier field removed from report records.

- `studentId` was removed from every record in `data/reports.json`. A regression check and release-time scan verify that no `studentId` field remains in the public report data.
- Original `reportId` and `questionId` values are retained because they are required to preserve report-level traceability and to join each report to `questions[]._id`.
- The supplied question content, including HTML and MathML, and the official repair taxonomy are preserved. The report comments and source platform/timestamps are retained as provided for this assignment exercise.
- No student identifier is included in `results.json`; results link to the retained report and question IDs only.
- The original, unmodified assignment archives remain in the user's private Downloads folder, outside the project, and are excluded from the public repository and release archive. This project makes no claim that Acadza provided written authorization; public release is based on the user's explicit instruction for this submission.

The scan checks the project files for known credential formats and checks report records for student identifier fields. It is not a guarantee that all question text or comments are free of every possible personal or confidential detail; those remain assignment-provided content and should be reviewed under the assignment's distribution requirements.
