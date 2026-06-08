# Quiz hub

A single static page that runs multiple-choice quizzes from plain markdown files. No build framework, no server, no database. Each quiz is one markdown file; a small Python script collects them into a manifest the page reads at runtime. Progress is saved in the browser.

This copy is the [Causal Map Ltd](https://causalmap.app) quiz hub, which teaches the basics of causal mapping. See it running at **[causalmapquizzes.netlify.app](https://causalmapquizzes.netlify.app/)**. The quiz engine is generic, so you can fork this repository, drop in your own quizzes, swap the branding, and publish your own quiz site. See [Make it your own](#make-it-your-own).

Because there is no build step, hosting is easy: point [Netlify](https://www.netlify.com/) at your fork and it publishes the repository root as-is (the included `netlify.toml` sets `publish = "."`). New commits redeploy automatically. Any other static host works the same way. See [Deployment](#deployment).

## How it works

```
index.html                  The quiz app shell (HTML, CSS, JS). Branding lives here.
content/*.md                One markdown file per quiz, numbered (01-, 02-, ...)
quizzes.json                Generated manifest listing the quizzes
build_quizzes_manifest.py   Regenerates quizzes.json from content/
js/app.js                   The quiz runner (parses markdown, renders, saves progress)
css/, images/, assets/      Front-end assets
netlify.toml                Publishes the repo root as-is (no build step)
```

The page loads `quizzes.json` to build the sidebar, then loads the chosen markdown file from `content/`. Static hosting cannot list a directory, which is why the manifest is generated rather than read live.

## Quiz file format

A quiz is a markdown file in `content/`, named `NN-slug.md` (a two-or-more digit number, a hyphen, then a slug, for example `03-factors.md`). The number sets the order in the sidebar; the slug becomes the quiz id used in the URL hash.

Optional YAML frontmatter sets the title (otherwise the slug is title-cased):

```markdown
---
title: Causal coding
---
```

After the frontmatter, **blank lines separate blocks**. Each block is one question:

- The **first line** is the question.
- Each following line is an **answer option**.
- An option starting with `y ` (the letter y and a space) is **correct**. A question can have more than one correct option; the learner must tick every correct one and nothing else.
- An optional line starting with `hint ` sets the message shown when the answer is wrong (the default is "Incorrect").

Any paragraphs before the first question block render as an introduction above the questions.

Example:

```markdown
---
title: Fractions
---

Some quick questions on fractions.

What is half of 4?
1
y 2
3

Which of these equal one half? (tick all that apply)
y 2/4
3/4
y 1/2
hint Remember that 2/4 simplifies to 1/2.
```

Two text shortcuts are applied when rendering (a convenience from the original causal-mapping quizzes, harmless otherwise):

- `-->` becomes a right arrow (→).
- `///` becomes a line break.

Answer options are shuffled each time a quiz loads, so the position of the correct answer is not predictable. Markdown (links, bold, images) works in questions and options.

## Editing quizzes

1. Add, rename or edit a numbered markdown file in `content/`.
2. Regenerate the manifest from the repo root:

   ```bash
   python build_quizzes_manifest.py
   ```

3. Commit `content/` and the updated `quizzes.json`.

## Running locally

On Windows, double-click `Open-quizzes-locally.bat`. Or serve the folder with any static server, for example:

```bash
python -m http.server
```

Then open the printed local URL. Opening `index.html` directly with `file://` will not work because the page fetches `quizzes.json` and the markdown files.

## Make it your own

The quiz engine (`js/app.js`, `build_quizzes_manifest.py`) needs no changes. To adapt the hub for your own subject:

1. **Replace the quizzes.** Delete the files in `content/` and add your own `NN-slug.md` files using the format above, then run `python build_quizzes_manifest.py`.
2. **Swap the branding in `index.html`.** Every spot to change is marked with a `BRANDING:` comment. They are:
   - the page `<title>` and favicon,
   - the fonts and the Bootstrap theme,
   - the sidebar logo and tagline,
   - the welcome heading, intro paragraphs, and the "Start the first quiz" button (point its `href` at your first quiz's id),
   - the footer links and the licence line.
3. **Adjust colours** in `css/site.css` if you want a different palette.
4. **Deploy** (see below).

That is the whole adaptation. No code changes to the runner.

## Deployment

Netlify publishes the repository root directly (`publish = "."` in `netlify.toml`), so the committed files are the live site. There is no build step on Netlify; run the manifest script locally before pushing. Any other static host (GitHub Pages, Cloudflare Pages, an S3 bucket) works the same way: serve the repo root.

## Licence

The Causal Map quiz **content** in this repository is licensed under CC BY-NC 4.0. If you fork the project for your own quizzes, replace the content and update the licence line in the footer of `index.html` to suit your own work.
