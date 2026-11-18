#!/usr/bin/env python3
"""
generate_course_catalog_js.py
Regenerates js/course-catalog.js from data/catalog.json.

Previously this was a manual step ("replace the const CourseCatalog = [...]
array with the contents of data/catalog.json") — this script does it
directly instead, so a catalog.py edit propagates here with no hand-editing
and no chance of pasting into the wrong spot.

Run AFTER data/build_catalog_json.py (which regenerates data/catalog.json
from data/catalog.py). Safe to re-run any time.

Run from the repo root: python3 generate_course_catalog_js.py
"""

import json
import os

REPO = os.path.dirname(os.path.abspath(__file__))

with open(os.path.join(REPO, "data", "catalog.json")) as f:
    catalog = json.load(f)

HEADER = '''/**
 * course-catalog.js
 * Drives the navigation shown on courses.html. This is the FRONTEND mirror
 * of the "Course Catalog" / "Lesson Catalog" tabs in the Google Sheet
 * (see the project skill's sheets-setup.md) — it exists so the site can
 * render a lesson list without a network call back to Apps Script just to
 * show navigation. The Sheet catalogs are still the source of truth for
 * analytics lookups server-side; this file only drives what the student
 * sees and clicks.
 *
 * GENERATED FILE — do not hand-edit. Edit data/catalog.py, then run
 * ./generate_all.sh (runs the whole generator chain in the right order).
 *
 * Each lesson carries a `released` flag. Unreleased lessons are shown
 * everywhere as locked "Coming soon" rows with no link, and their wrapper
 * pages load no tracking code at all (see generate_lessons.py).
 *
 * WEEKLY PUBLISHING WORKFLOW: drop the lesson's Rise export into its
 * rise/ folder, set released=True for it in data/catalog.py, run
 * ./generate_all.sh, and upload the changed files. See data/catalog.py.
 */

'''

FOOTER = '''

// Convenience derived data, computed once here so every page that loads
// this file (courses.html, the course-*.html detail pages, lesson-nav.js)
// shares identical totals instead of re-deriving them slightly differently.
CourseCatalog.forEach(function (course) {
  course.totalLessons = course.chapters.reduce(function (sum, ch) {
    return sum + ch.lessons.length;
  }, 0);
  course.releasedLessons = course.chapters.reduce(function (sum, ch) {
    return sum + ch.lessons.filter(function (l) { return l.released; }).length;
  }, 0);
});
'''

body = "const CourseCatalog = " + json.dumps(catalog, indent=2, ensure_ascii=False) + ";"

out_path = os.path.join(REPO, "js", "course-catalog.js")
with open(out_path, "w") as f:
    f.write(HEADER + body + FOOTER)

print(f"Wrote {out_path} ({len(catalog)} courses)")
