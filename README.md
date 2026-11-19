# Microlearning Portal — 2nd Semester, SY 2026–2027

GitHub Pages hosts Rise 360 lesson exports, a small shared JS module times each lesson, and a Google Apps Script web app logs it to Google Sheets. Three courses, **46 lessons**, released week by week:

| Slug | Course | Chapters | Lessons |
|---|---|---|---|
| `bst305` | BST 305 — Biostatistics | 8 | 16 |
| `mas204a` | MAS 204a — Statistical Analysis II | 6 | 15 |
| `mas308` | MAS 308 — Categorical Data Analysis | 8 | 15 |

This is a separate site, Sheet, and Apps Script deployment from the 1st-semester portal. Only Rise 360 lessons are in scope — exams, quizzes, and presentations are not part of the catalog.

## Placeholders and the tracker

Every lesson starts as a locked **"Coming soon"** placeholder. A placeholder page has no Rise iframe, no completion button, and loads **none** of `api.js` / `tracking.js` / `rise-integration.js`, so nothing a student does there can create an Activity Log row. In every list and sidebar it shows as a non-clickable "Coming soon" row, and Next/Previous skip it. The old "Simulate lesson completion" test button no longer exists anywhere.

## Weekly release workflow

1. Export the lesson from Rise 360 as **HTML5**, unzip it, and put the contents in `courses/<slug>/chapter-NN/lesson-NN/rise/` (the folder path is shown on the lesson's placeholder page and in `generate_lessons.py`'s output). Add the completion block from `rise-completion-trigger/` as the last block of the final slide *before* exporting.
2. In `data/catalog.py`, change that lesson from `L("Title")` to `L("Title", released=True)`.
3. Run `./generate_all.sh`. It regenerates, in order: `data/catalog.json`, `js/course-catalog.js`, every lesson wrapper page, the three `course-*.html` pages, and the seed block in `apps-script/Code.gs`. It prints a **WARNING** if you release a lesson that has no Rise export yet.
4. Upload to GitHub (web UI, no Git CLI needed), in this order: top-level files and `js/` first, then `courses/` — and only the lesson folders that changed. Never replace an existing lesson's `rise/` folder with anything but a real export.
5. Test it with `TEST-0001`: complete the lesson, then check the Activity Log for one new row.

Re-running the generators never overwrites an existing `rise/` folder, so a real export is safe.

## One-time setup for this semester

1. **Sheet + Apps Script**: make a copy of the 1st-sem Sheet (or start fresh), clear its Activity Log, paste `apps-script/Code.gs` over the script, run `setupSpreadsheet()`, deploy a new Web app (see `apps-script/README.md`). Fill the **Student Roster** tab from `student-roster-import.csv` (in the separate private folder that came with this zip — **never put class lists in this public repo**). Student numbers are converted to the portal's `YYYY-NNNNNN` sign-in format (e.g. `2025001234` → `2025-001234`).
2. **`js/api.js`**: replace `PASTE_DEPLOYED_APPS_SCRIPT_URL_HERE` with the new deployment URL.
3. **New GitHub repo** (e.g. `Rise360-Microlearning-2nd-Semester-2026-2027`), upload everything, then Settings → Pages → Deploy from `main` / root.

## Why the slugs and storage keys differ from 1st semester

Both sites are served from the same `jerahmeel-hipolito.github.io` origin, so they share browser storage. New slugs (`bst305` / `mas204a` / `mas308`) keep lesson IDs and local "completed" flags from colliding with `biostatistics` / `ssa` / `ama`, and the offline retry queue uses its own key (`pendingPayloads_2026S2`) so neither site can flush the other's queued records into the wrong spreadsheet. The Student ID itself is intentionally shared, so returning students don't have to retype it.

## The single source of truth: `data/catalog.py`

Course, chapter, and lesson names and the `released` flag all live there. Never hand-edit `js/course-catalog.js`, `course-*.html`, the lesson wrapper pages, or the generated seed block in `Code.gs` — the next `./generate_all.sh` would overwrite them. If you **rename** an existing lesson, also edit its row in the Sheet's Lesson Catalog tab by hand (`setupSpreadsheet()` only adds missing IDs).

## Repo layout

```
index.html, courses.html        sign-in and course picker
course-bst305.html, course-mas204a.html, course-mas308.html     (generated)
css/portal.css                  light / blue / minimalist design system
js/                             storage, api, tracking, rise-integration, lesson-nav, progress-sync, course-catalog (generated)
courses/<slug>/chapter-NN/lesson-NN/index.html     (generated; rise/ appears when you upload an export)
data/                           catalog.py + templates (live wrapper, placeholder wrapper, course page)
apps-script/                    Code.gs (seed block generated), README, dashboard notes
rise-completion-trigger/        master completion-block.html (used only when authoring a real lesson)
dev-tests/                      three Node smoke tests — run all three after any edit to js/, Code.gs, or catalog.py
generate_all.sh                 runs the whole generator chain
```

## Tests

```bash
node dev-tests/frontend_smoke_test.js      # 12 checks
node dev-tests/apps_script_smoke_test.js   # 33 checks
node dev-tests/placeholder_smoke_test.js   # 18 checks (needs python3)
```
