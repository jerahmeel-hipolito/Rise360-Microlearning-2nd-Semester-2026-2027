#!/usr/bin/env python3
"""
generate_apps_script_seed.py
Rewrites the Course Catalog / Lesson Catalog seed rows inside
apps-script/Code.gs (the block between the GENERATED SEED markers) from
data/catalog.py, so the Google Sheet's catalog tabs can never drift from the
frontend catalog.

Lesson rows are seeded for EVERY lesson (released or not): the sheet's
catalog is just a lookup of IDs -> titles, and it's what lets the Activity
Log show readable names the moment a lesson is released. Whether a lesson
can be visited at all is controlled by `released` in catalog.py, not here.

Reminder: setupSpreadsheet() only ADDS missing IDs — it never edits an
existing row. If you rename a lesson later, edit that row in the Sheet by
hand too.

Run from the repo root: python3 generate_apps_script_seed.py
"""
import os, sys, json

REPO = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(REPO, "data"))
from catalog import COURSES  # noqa: E402

START = "  // >>> GENERATED SEED (do not hand-edit; run ./generate_all.sh) >>>\n"
END = "  // <<< GENERATED SEED <<<\n"

def js(v):
    return json.dumps(v, ensure_ascii=False)

course_rows = ",\n".join(f"    [{js(c['course_id'])}, {js(c['course_name'])}]" for c in COURSES)

lesson_rows = []
for c in COURSES:
    n = 0
    for ch in c["chapters"]:
        for lesson in ch["lessons"]:
            n += 1
            lesson_rows.append(
                f"    [{js(f'{c['course_id']}-L{n:02d}')}, {js(lesson['title'])}, {js(ch['title'])}, {js(c['course_id'])}]"
            )
total = len(lesson_rows)
lessons = ",\n".join(lesson_rows)

body = (
    START
    + "  seedRowsIfMissing(courseSheet, [\n" + course_rows + "\n  ]);\n\n"
    + f"  // All {total} lessons (every course), LessonID = the same globally-unique\n"
    + "  // composite format tracking.js sends (\"<courseId>-L<NN>\").\n"
    + "  seedRowsIfMissing(lessonSheet, [\n" + lessons + "\n  ]);\n"
    + END
)

path = os.path.join(REPO, "apps-script", "Code.gs")
src = open(path).read()
a, b = src.index(START), src.index(END) + len(END)
open(path, "w").write(src[:a] + body + src[b:])
print(f"Wrote {len(COURSES)} course rows and {total} lesson rows into apps-script/Code.gs")
