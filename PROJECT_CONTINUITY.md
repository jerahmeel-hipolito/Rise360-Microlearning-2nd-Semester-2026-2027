# Project continuity — 2nd-Semester Microlearning Portal (SY 2026–2027)

Attach this file to a new Claude session to resume. It replaces the 1st-semester continuity doc for this repo.

## What this is
A separate GitHub Pages portal + Google Sheet + Apps Script deployment for the 2nd semester. ~Same architecture as the 1st-sem portal (see README.md). Sole instructor/admin; deploys through the GitHub web UI only (no Git CLI).

## Scope decisions (from the instructor)
- Courses: BST 305 Biostatistics (16 lessons / 8 chapters), MAS 204a Statistical Analysis II (15 / 6), MAS 308 Categorical Data Analysis (15 / 8) = 46 lessons, from the syllabi. MAS 308's chapter grouping was drafted by Claude (the syllabus has none).
- Rise 360 lesson deliverables only. Midterms, finals, quizzes, presentations are NOT chapters/lessons and are not counted.
- Every lesson is a locked placeholder until released (weekly). Placeholders carry NO Rise completion tracker, no simulate button, and load no tracking scripts, so they cannot touch the Activity Log.
- Slugs `bst305` / `mas204a` / `mas308` (1st sem used `biostatistics` / `ssa` / `ama` on the same github.io origin).

## State at handoff
- All 46 lessons: `released=False`. Catalog, generators, placeholder templates, locked UI rows, Code.gs seed, `getProgress` handler, and 3 test suites (12 + 33 + 18 passing) are done.
- NOT done yet: new Google Sheet / Apps Script deployment; `Api.ENDPOINT_URL` still a placeholder; new GitHub repo + Pages; Student Roster for 2nd sem; every Rise export.

## Rules that must keep holding
- `data/catalog.py` is the only place to edit course/lesson data; run `./generate_all.sh` after.
- `setupSpreadsheet()` only adds rows; renamed lessons need a manual Sheet edit.
- Completion keys stay normalized via `Storage._completionKey`; composite IDs `<slug>-CH<NN>` / `<slug>-L<NN>` are built from the URL in `tracking.js`.
- Use `window.top.postMessage` in the Rise completion block.
- Retry queue key is `pendingPayloads_2026S2` — don't revert it to the shared name.
- Re-run all three tests after changing `js/`, `Code.gs`, or `catalog.py`.
