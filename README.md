# Microlearning Portal — 2nd Semester, SY 2026–2027

GitHub Pages hosts Rise 360 lesson exports, a small shared JS module times each lesson, and a Google Apps Script web app logs it to Google Sheets. Three courses, **46 lessons**, released week by week (unlocked from one small file, `js/releases.js`):

| Slug | Course | Chapters | Lessons |
|---|---|---|---|
| `bst305` | BST 305 — Biostatistics | 8 | 16 |
| `mas204a` | MAS 204a — Statistical Analysis II | 6 | 15 |
| `mas308` | MAS 308 — Categorical Data Analysis | 8 | 15 |

This is a separate site, Sheet, and Apps Script deployment from the 1st-semester portal. Only Rise 360 lessons are in scope — exams, quizzes, and presentations are not part of the catalog.

## Placeholders and the tracker

Every lesson is a locked **"Coming soon"** page until its ID is listed in `js/releases.js`. A locked page never gives the Rise iframe a source and never loads `api.js` / `tracking.js` / `rise-integration.js`, so nothing a student does there can create an Activity Log row. In every list and sidebar it shows as a non-clickable "Coming soon" row, and Next/Previous skip it. The old "Simulate lesson completion" test button no longer exists anywhere.

## Weekly release workflow (all in the GitHub web page — no Python, no zips)

1. **Upload the lesson's Rise export.** Export from Rise 360 as **HTML5** (with the completion block from `rise-completion-trigger/` as the last block of the final slide), unzip it, and upload the contents into `courses/<slug>/chapter-NN/lesson-NN/rise/`, so that `rise/index.html` exists. On GitHub: open the lesson's folder, **Add file → Upload files**, and drag in the `rise` folder (GitHub accepts up to 100 files per upload — do it in batches if the export is bigger). Chapter/lesson folder numbers are in the table below.
2. **Unlock it.** Open `js/releases.js` on GitHub, click the pencil icon, add the lesson's ID on its own line (keep the quotes and comma), and **Commit changes**:
   ```js
   window.RELEASED_LESSONS = [
     'bst305-L01',
     'bst305-L02',
   ];
   ```
   ID format is `<slug>-L<NN>` with a two-digit lesson number (`bst305-L01` … `bst305-L16`, `mas204a-L01` … `mas204a-L15`, `mas308-L01` … `mas308-L15`). Delete a line to lock a lesson again.
3. **Test it** (about 1–3 minutes after the commit; browsers may hold the old list for up to ~10 minutes): sign in as `TEST-0001`, open the lesson, press Finish Lesson, and check the Activity Log for exactly **one** new row.

Do step 1 before step 2. If you list a lesson that has no export yet, students see an empty frame (it can't log anything, but it looks broken).

`js/releases.js` is the **only** file you edit week to week. Nothing else changes, and you never need to regenerate anything. The generator scripts are only for renaming or reorganizing lessons in `data/catalog.py`.

| Course | Lesson → folder |
|---|---|
| `bst305` | L01–02 → `chapter-01`, L03–04 → `chapter-02`, L05–06 → `chapter-03`, L07–08 → `chapter-04`, L09 → `chapter-05`, L10–11 → `chapter-06`, L12–13 → `chapter-07`, L14–16 → `chapter-08` |
| `mas204a` | L01–02 → `chapter-01`, L03–04 → `chapter-02`, L05–08 → `chapter-03`, L09–11 → `chapter-04`, L12–14 → `chapter-05`, L15 → `chapter-06` |
| `mas308` | L01–03 → `chapter-01`, L04–05 → `chapter-02`, L06–07 → `chapter-03`, L08 → `chapter-04`, L09–10 → `chapter-05`, L11–12 → `chapter-06`, L13–14 → `chapter-07`, L15 → `chapter-08` |

The lesson folder is `courses/<slug>/chapter-NN/lesson-NN/` where the lesson number is the same two digits as in the ID (e.g. `bst305-L05` → `courses/bst305/chapter-03/lesson-05/`).

## One-time setup for this semester

1. **Sheet + Apps Script**: make a copy of the 1st-sem Sheet (or start fresh), clear its Activity Log, paste `apps-script/Code.gs` over the script, run `setupSpreadsheet()`, deploy a new Web app (see `apps-script/README.md`). Fill the **Student Roster** tab from `student-roster-import.csv` (in the separate private folder that came with this zip — **never put class lists in this public repo**). Student numbers are converted to the portal's `YYYY-NNNNNN` sign-in format (e.g. `2025001234` → `2025-001234`).
2. **`js/api.js`**: replace `PASTE_DEPLOYED_APPS_SCRIPT_URL_HERE` with the new deployment URL.
3. **New GitHub repo** (e.g. `Rise360-Microlearning-2nd-Semester-2026-2027`), upload everything, then Settings → Pages → Deploy from `main` / root.

## Why the slugs and storage keys differ from 1st semester

Both sites are served from the same `jerahmeel-hipolito.github.io` origin, so they share browser storage. New slugs (`bst305` / `mas204a` / `mas308`) keep lesson IDs and local "completed" flags from colliding with `biostatistics` / `ssa` / `ama`, and the offline retry queue uses its own key (`pendingPayloads_2026S2`) so neither site can flush the other's queued records into the wrong spreadsheet. The Student ID itself is intentionally shared, so returning students don't have to retype it.

## The single source of truth: `data/catalog.py`

Course, chapter, and lesson names live there (release state does not — that's `js/releases.js`). Never hand-edit `js/course-catalog.js`, `course-*.html`, the lesson wrapper pages, or the generated seed block in `Code.gs` — the next `./generate_all.sh` would overwrite them. If you **rename** an existing lesson, also edit its row in the Sheet's Lesson Catalog tab by hand (`setupSpreadsheet()` only adds missing IDs).

## Repo layout

```
index.html, courses.html        sign-in and course picker
course-bst305.html, course-mas204a.html, course-mas308.html     (generated)
css/portal.css                  light / blue / minimalist design system
js/                             releases.js (the weekly unlock list), storage, api, tracking, rise-integration, lesson-nav, progress-sync, course-catalog (generated)
courses/<slug>/chapter-NN/lesson-NN/index.html     (generated; you add the rise/ folder)
data/                           catalog.py + templates (lesson wrapper, course page)
apps-script/                    Code.gs (seed block generated), README, dashboard notes
rise-completion-trigger/        master completion-block.html (used only when authoring a real lesson)
dev-tests/                      three Node smoke tests — run all three after any edit to js/, Code.gs, or catalog.py
generate_all.sh                 runs the whole generator chain
```

## Tests

```bash
node dev-tests/frontend_smoke_test.js      # 12 checks
node dev-tests/apps_script_smoke_test.js   # 33 checks
node dev-tests/placeholder_smoke_test.js   # 25 checks (browser part needs Playwright)
```
