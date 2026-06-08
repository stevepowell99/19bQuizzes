# 19bQuizzes

Static Causal Map quiz hub.

Read first:

- `index.html`
- `build_quizzes_manifest.py`

## Workflow

- Quiz content lives in `content/*.md`.
- `index.html` is the static quiz app shell.
- `build_quizzes_manifest.py` regenerates `quizzes.json` from numbered markdown files in `content/`.
- Run manifest generation from the repo root with `python build_quizzes_manifest.py` when quiz files are added, renamed or removed.
- Keep the app simple and static. Do not add a build framework unless Steve explicitly asks.

Global guidance: `C:\Users\Zoom\.claude\CLAUDE.md`
