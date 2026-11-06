# AGENTS.md — Coding Agent Operating Manual

> Give this file to your coding agent and check that it is using these instructions. Keep the stack, commands, and ground rules current.

## 1. Project Overview
- **What this repo builds:** Homeward, a single source of truth for families rebuilding after a wildfire. It tracks what the HOA, builder, insurer, and city each said, and flags when they contradict each other.
- **Primary user & core workflow:** [See the living PRD in `docs/index.html`]
- **Tech stack:** Node.js 21+ (no npm dependencies) / plain HTML page / OpenRouter API (default model `anthropic/claude-opus-5.5`) / saved data in a local JSON file under `data/` (git-ignored)
- **Main files:** `server.js` (web server, AI call, saving), `prompt.js` (AI instructions and answer schema), `public/index.html` (the page), `tests/run-samples.js` (sample test)
- **Private data:** real family documents go in `private/`; saved claims go in `data/`. Both are git-ignored and must never be committed.

## 2. Commands
- **Install dependencies:** none (needs Node.js 21 or newer; check with `node --version`)
- **Run locally:** `npm start`, then open http://localhost:3000
- **Run deterministic tests:** [none yet]
- **Run model evals:** `npm run test:samples` (calls the real AI, about $0.20 per run; compare output with `samples/ANSWER_KEY.md`)

## 3. Non-Negotiable Engineering Rules
1. **Plan before coding:** Before touching multiple files, propose a brief plan and wait for approval.
2. **Small batches:** Make small, focused changes that can be reviewed and explained by a human in a single Pull Request.
3. **Explainability:** Avoid unnecessary abstractions or dependencies. Help the human builder understand the main components, what changed, why it matters, what could break, and how it was checked.
4. **Verify changes:** Run relevant checks. For a reproducible logic bug, use a failing test to demonstrate the fix when practical. Record manual checks and known limitations; follow the selected Build 4 evaluation track.
5. **Zero secrets in code:** Never hardcode API keys, tokens, or credentials. Always read from environment variables (`.env`) and update `.env.example` when new variables are needed.
6. **Stop when looping:** If a fix fails twice in a row, stop, summarize what failed, and ask the human before trying a third approach.
