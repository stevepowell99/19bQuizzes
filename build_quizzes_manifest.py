#!/usr/bin/env python3
"""
Regenerate quizzes.json from content/*.md so the sidebar matches files on disk.
Run from repo root:  python build_quizzes_manifest.py
Static hosting cannot directory-list content/ — the app loads quizzes.json only.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CONTENT = ROOT / "content"
OUT = ROOT / "quizzes.json"


def split_frontmatter(raw: str) -> tuple[dict[str, str], str]:
    if not raw.startswith("---"):
        return {}, raw
    end = raw.find("\n---", 3)
    if end == -1:
        return {}, raw
    block = raw[3:end].strip()
    body = raw[end + 4 :].lstrip("\n")
    meta: dict[str, str] = {}
    for line in block.splitlines():
        m = re.match(r"^([a-zA-Z0-9_-]+):\s*(.*)$", line)
        if not m:
            continue
        key, val = m.group(1), m.group(2).strip().strip('"').strip("'")
        meta[key] = val
    return meta, body


def stem_key(path: Path) -> tuple[int, str]:
    m = re.match(r"^(\d+)-", path.stem)
    if m:
        return (int(m.group(1)), path.stem)
    return (10**9, path.stem)


def main() -> None:
    if not CONTENT.is_dir():
        print("Missing content/", file=sys.stderr)
        sys.exit(1)

    files = sorted(CONTENT.glob("*.md"), key=stem_key)
    quizzes: list[dict[str, str]] = []
    seen_ids: dict[str, str] = {}

    for path in files:
        m = re.match(r"^\d+-(.+)$", path.stem)
        if not m:
            print(f"skip (no NN- prefix): {path.name}", file=sys.stderr)
            continue
        slug = m.group(1)
        meta, _ = split_frontmatter(path.read_text(encoding="utf-8"))
        quiz_id = (meta.get("quiz_id") or slug).strip()

        title = (meta.get("title") or slug.replace("-", " ").title()).strip()
        if not title:
            title = slug

        if quiz_id in seen_ids:
            print(f"duplicate id {quiz_id!r}: {path.name} and {seen_ids[quiz_id]}", file=sys.stderr)
            sys.exit(1)
        seen_ids[quiz_id] = path.name

        quizzes.append({"id": quiz_id, "file": f"content/{path.name}", "title": title})

    OUT.write_text(
        json.dumps({"quizzes": quizzes}, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(f"wrote {len(quizzes)} entries -> {OUT.relative_to(ROOT)}")
    if len(quizzes) < 30:
        print(
            "warning: very few quizzes — if content/ should have more, sync full folder before committing quizzes.json",
            file=sys.stderr,
        )


if __name__ == "__main__":
    main()
