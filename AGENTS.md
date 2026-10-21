# AGENTS.md

Instructions for any AI agent that changes this repository.

## What this is

A tiny web app that greets a person by name. KAEIDOS uses it to prove its factory end to end:
a request, an agent's change, a pull request, CI, a preview, acceptance, a merge.

- `src/greeting.js` builds the greeting.
- `src/app.js` answers the HTTP routes: `/`, `/api/greeting` and `/health`.
- `server.js` starts the app on port 3000.
- `test/` holds the tests, run with Node's own test runner.

## Rules

1. Use Node 24 and its standard library only. Add no dependency.
2. Every change comes with a test that fails without it. Run `npm test` and `npm run lint`
   before you finish: both must pass.
3. The page's text is in French. Code, comments and commit messages are in English.
4. Escape anything a visitor sends before it reaches the page (see `escapeHtml`).
5. Never change `.github/workflows/` or `.kaeidos/`: a person reviews those.
