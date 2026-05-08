/* Static quiz runner: parse quiz markdown (same blocks as learnr txt), render, persist to localStorage. */
(function () {
  const STORAGE_KEY = "cmquiz-progress-v1";

  /** Mirror learnr preprocessing in quizzes.Rmd make_question() */
  function applyLearnrTransforms(s) {
    return s
      .replaceAll("-->", "\u2192")
      .replaceAll("///", "\n\n")
      // Obsidian-compatible paths in markdown: ../images/... ; web resolves from index.html as images/
      .replaceAll("../images/", "images/");
  }

  /** Split optional YAML front matter; return { meta, body } */
  function splitFrontMatter(raw) {
    const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    if (!m) return { meta: {}, body: raw.trim() };
    const meta = {};
    m[1].split(/\r?\n/).forEach((line) => {
      const i = line.indexOf(":");
      if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, "");
    });
    return { meta, body: m[2].trim() };
  }

  /** One question block -> structured object */
  function parseQuestionBlock(block) {
    const lines = block
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length && !l.startsWith("<!--"));

    let hint = "Incorrect";
    const hintLine = lines.find((l) => l.toLowerCase().startsWith("hint "));
    const rest = lines.filter((l) => !l.toLowerCase().startsWith("hint "));
    if (hintLine) hint = hintLine.replace(/^hint\s+/i, "").trim();

    if (rest.length < 2) return null;
    const stem = applyLearnrTransforms(rest[0]);
    const options = rest.slice(1).map((l) => {
      const correct = /^y\s+/i.test(l);
      const text = applyLearnrTransforms(l.replace(/^y\s+/i, "").trim());
      return { correct, text };
    });

    return { stem, hint, options };
  }

  function parseQuizMarkdown(md) {
    const { meta, body } = splitFrontMatter(md);
    const blocks = body
      .split(/\r?\n\r?\n+/)
      .map((b) => b.trim())
      .filter(Boolean);
    // Leading paragraphs that are not quiz blocks (e.g. Garden links) render above questions
    const introChunks = [];
    const questions = [];
    for (const b of blocks) {
      const q = parseQuestionBlock(b);
      if (q) questions.push(q);
      else if (!questions.length) introChunks.push(applyLearnrTransforms(b));
    }
    const introMd = introChunks.join("\n\n");
    return { meta, introMd, questions };
  }

  /** Shuffle copy Fisher-Yates, seeded per quiz+q index so order stable across revisits until reload */
  function shuffle(arr, seed) {
    const out = arr.slice();
    let x = seed >>> 0;
    function rnd() {
      x ^= x << 13;
      x ^= x >>> 17;
      x ^= x << 5;
      return (x >>> 0) / 4294967296;
    }
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  function seedFrom(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function loadProgress() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  }

  function saveProgress(all) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  }

  function renderStem(htmlRoot, stemMd) {
    htmlRoot.innerHTML = marked.parse(stemMd, { breaks: true });
  }

  function renderOptionLabel(el, textMd) {
    el.innerHTML = marked.parseInline(textMd);
  }

  /** ---------- DOM ---------- */
  const tocNav = document.getElementById("toc-nav");
  const hubSel = document.getElementById("hub-pane");
  const quizSel = document.getElementById("quiz-pane");
  const quizTitleEl = document.getElementById("quiz-title");
  const quizBodyEl = document.getElementById("quiz-body");
  const quizFooterEl = document.getElementById("quiz-footer");
  const brandHome = document.getElementById("brand-home");

  let manifest = [];
  let activeQuizId = null;

  function setPane(which) {
    hubSel.classList.toggle("d-none", which !== "hub");
    quizSel.classList.toggle("d-none", which !== "quiz");
    updateTOCActive();
  }

  function openQuiz(id) {
    activeQuizId = id;
    if (location.hash !== `#${id}`) location.hash = id;
    else {
      setPane("quiz");
      loadAndRenderQuiz(id);
    }
  }

  function openHub() {
    activeQuizId = null;
    if (location.hash) history.replaceState(null, "", location.pathname + location.search);
    setPane("hub");
    window.scrollTo(0, 0);
  }

  /** LHS TOC from manifest */
  function buildTOC() {
    tocNav.innerHTML = "";

    const intro = document.createElement("a");
    intro.href = "#";
    intro.className = "nav-link toc-link";
    intro.id = "toc-intro";
    intro.textContent = "Introduction";
    intro.addEventListener("click", (e) => {
      e.preventDefault();
      openHub();
    });
    tocNav.appendChild(intro);

    manifest.forEach((q) => {
      const a = document.createElement("a");
      a.href = `#${q.id}`;
      a.className = "nav-link toc-link";
      a.dataset.quizId = q.id;
      a.textContent = q.title;
      tocNav.appendChild(a);
    });
  }

  /** Highlight current intro vs quiz in sidebar */
  function updateTOCActive() {
    const h = location.hash.replace(/^#/, "");
    const introEl = document.getElementById("toc-intro");
    if (introEl)
      introEl.classList.toggle(
        "active",
        !h || !manifest.some((q) => q.id === h)
      );

    tocNav.querySelectorAll(".toc-link[data-quiz-id]").forEach((el) => {
      el.classList.toggle("active", h === el.dataset.quizId);
    });
  }

  /** Bottom nav: next quiz or back to intro */
  function renderQuizFooter(id) {
    quizFooterEl.innerHTML = "";
    const idx = manifest.findIndex((x) => x.id === id);
    if (idx < 0) return;

    if (idx < manifest.length - 1) {
      const next = manifest[idx + 1];
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn-primary btn-lg";
      btn.textContent = `Next topic: ${next.title}`;
      btn.addEventListener("click", () => {
        location.hash = next.id;
        window.scrollTo(0, 0);
      });
      quizFooterEl.appendChild(btn);
    } else {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn-outline-secondary btn-lg";
      btn.textContent = "Back to introduction";
      btn.addEventListener("click", () => openHub());
      quizFooterEl.appendChild(btn);
    }
  }

  async function loadManifest() {
    const res = await fetch("quizzes.json", { cache: "no-store" });
    manifest = (await res.json()).quizzes;
    buildTOC();
    updateTOCActive();
  }

  async function loadAndRenderQuiz(id) {
    const entry = manifest.find((x) => x.id === id);
    if (!entry) return;
    const res = await fetch(entry.file, { cache: "no-store" });
    const md = await res.text();
    const parsed = parseQuizMarkdown(md);
    quizTitleEl.textContent = parsed.meta.title || entry.title;

    quizBodyEl.innerHTML = "";
    if (parsed.introMd) {
      const introEl = document.createElement("div");
      introEl.className = "quiz-intro mb-4 text-secondary";
      introEl.innerHTML = marked.parse(parsed.introMd, { breaks: true });
      introEl.querySelectorAll("a[href]").forEach((a) => {
        a.target = "_blank";
        a.rel = "noopener noreferrer";
      });
      quizBodyEl.appendChild(introEl);
    }
    const prog = loadProgress()[id] || {};

    parsed.questions.forEach((q, qi) => {
      const wrap = document.createElement("div");
      wrap.className = "card mb-4";
      wrap.dataset.qIndex = String(qi);

      const body = document.createElement("div");
      body.className = "card-body";

      const stemEl = document.createElement("div");
      stemEl.className = "quiz-stem mb-3";
      renderStem(stemEl, q.stem);

      const multi = q.options.filter((o) => o.correct).length !== 1;
      if (multi) {
        const mh = document.createElement("div");
        mh.className = "multi-hint mb-2";
        mh.textContent = "Select all that apply.";
        body.appendChild(mh);
      }

      const optsWrap = document.createElement("div");
      optsWrap.className = multi ? "" : "list-group";

      const seed = seedFrom(`${id}:${qi}`);
      const indexed = q.options.map((o, oi) => ({ ...o, origIndex: oi }));
      const shuffled = shuffle(indexed, seed);

      const saved = prog[String(qi)] || {};

      shuffled.forEach((opt, displayIdx) => {
        const inputId = `${id}-q${qi}-o${displayIdx}`;
        const row = document.createElement("div");
        row.className = multi ? "form-check mb-1" : "list-group-item";

        const input = document.createElement("input");
        input.className = multi ? "form-check-input" : "form-check-input me-2";
        input.type = multi ? "checkbox" : "radio";
        input.name = `${id}-q${qi}`;
        input.id = inputId;
        input.value = String(displayIdx);
        input.dataset.origIndex = String(opt.origIndex);

        input.checked = !!(saved.picked && saved.picked.includes(displayIdx));

        input.addEventListener("change", () => {
          persistQuestionState(id, qi, readPickedInputs(optsWrap, multi));
          feedbackEl.textContent = "";
          feedbackEl.className = "small mt-2";
        });

        const lab = document.createElement("label");
        lab.className = multi ? "form-check-label" : "form-check-label d-inline";
        lab.setAttribute("for", inputId);
        renderOptionLabel(lab, opt.text);

        row.appendChild(input);
        row.appendChild(lab);
        optsWrap.appendChild(row);
      });

      const btnRow = document.createElement("div");
      btnRow.className = "mt-3";

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn-primary btn-sm";
      btn.textContent = "Check answer";

      const feedbackEl = document.createElement("div");
      feedbackEl.className = "small mt-2";

      if (saved.feedback) {
        feedbackEl.textContent = saved.feedback.text;
        feedbackEl.className = `small mt-2 ${saved.feedback.ok ? "text-success" : "text-danger"}`;
      }

      btn.addEventListener("click", () => {
        const pickedArr = readPickedInputs(optsWrap, multi);
        const correctSet = new Set(
          shuffled.map((o, displayIdx) => (o.correct ? displayIdx : null)).filter((x) => x !== null)
        );
        const pickedSet = new Set(pickedArr);
        let ok =
          pickedSet.size === correctSet.size && [...correctSet].every((idx) => pickedSet.has(idx));

        feedbackEl.textContent = ok ? "Correct." : q.hint;
        feedbackEl.className = `small mt-2 ${ok ? "text-success" : "text-danger"}`;
        persistQuestionState(id, qi, pickedArr, { ok, text: feedbackEl.textContent });
      });

      btnRow.appendChild(btn);
      btnRow.appendChild(feedbackEl);

      body.appendChild(stemEl);
      body.appendChild(optsWrap);
      body.appendChild(btnRow);
      wrap.appendChild(body);
      quizBodyEl.appendChild(wrap);
    });

    renderQuizFooter(id);
    window.scrollTo(0, 0);
  }

  function readPickedInputs(optsWrap, multi) {
    const inputs = [...optsWrap.querySelectorAll("input")];
    if (multi) return inputs.filter((i) => i.checked).map((i) => Number(i.value));
    const one = inputs.find((i) => i.checked);
    return one ? [Number(one.value)] : [];
  }

  function persistQuestionState(quizId, qi, pickedDisplayIndices, feedback) {
    const all = loadProgress();
    all[quizId] = all[quizId] || {};
    const cur = { picked: pickedDisplayIndices };
    if (feedback) cur.feedback = feedback;
    else delete cur.feedback;
    all[quizId][String(qi)] = cur;
    saveProgress(all);
  }

  /** ---------- boot ---------- */
  brandHome.addEventListener("click", (e) => {
    e.preventDefault();
    openHub();
  });

  window.addEventListener("hashchange", () => {
    const h = location.hash.replace(/^#/, "");
    if (h && manifest.some((q) => q.id === h)) {
      activeQuizId = h;
      setPane("quiz");
      loadAndRenderQuiz(h);
    } else {
      activeQuizId = null;
      setPane("hub");
    }
    window.scrollTo(0, 0);
  });

  loadManifest().then(() => {
    const h = location.hash.replace(/^#/, "");
    if (h && manifest.some((q) => q.id === h)) {
      activeQuizId = h;
      setPane("quiz");
      loadAndRenderQuiz(h);
    } else setPane("hub");
  });
})();
