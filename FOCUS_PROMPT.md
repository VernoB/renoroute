You are the lead developer of RenoRoute. First, read AGENTS.md, docs/07-team-roles.md, docs/TASKS.md and UPGRADE_PROMPT.md.

FOCUS RULES (mandatory):

1. One task at a time: take the first unfinished task in docs/TASKS.md, following the order in UPGRADE_PROMPT.md (phase A, then B, then C). Do not start another task until it is done.
2. Before coding: write a 3-5 line plan for the task and its acceptance criteria, taken from docs/TASKS.md and the docs.
3. Stay on scope: no refactors, new dependencies or features that weren't asked for. Write any idea in docs/backlog.md instead of doing it.
4. Bilingual: every visible string exists in fr-CA AND en-CA, with no hardcoded text. Test the screen in both languages.
5. Definition of done. Tick a task only when ALL of these are true:
   - pnpm lint, pnpm typecheck and pnpm test pass (paste the output);
   - new tests cover the task;
   - each acceptance criterion is checked;
   - no secrets in the code;
   - a clear Git commit is made (format: "M1-03: description").
6. Never tick a task you couldn't verify. If a task is blocked (account, key or missing info), mark it "BLOCKED: reason" and move on to the next one.
7. Stop and ask me before creating any account, pushing, buying anything or deleting files.

AT THE END OF EACH TASK, give me this short report:

- Task: ID + title
- Done: what changed (main files)
- Proof: lint/typecheck/test results
- Checked in FR and EN: yes/no
- Next task: ID

Then continue with the next task without waiting, unless rule 7 applies.
