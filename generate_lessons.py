#!/usr/bin/env python3
"""
generate_lessons.py
Generates the lesson wrapper index.html for EVERY lesson in data/catalog.py
(the single source of truth), in one of two modes per lesson:

  released=False  ->  PLACEHOLDER wrapper (data/lesson_placeholder_template.html)
                      A locked "Coming soon" page. It has NO Rise iframe, NO
                      completion button, and loads NONE of api.js / tracking.js
                      / rise-integration.js, so nothing on it can ever write a
                      row to the Activity Log. No rise/ folder is created.

  released=True   ->  LIVE wrapper (data/lesson_wrapper_template.html)
                      Loads rise/index.html in an iframe and the tracking
                      scripts. If rise/index.html is missing, a plain
                      "content not uploaded yet" notice (no buttons, no
                      completion signal) is written there and a WARNING is
                      printed — the lesson shouldn't be released yet.

Safe to re-run any time. Wrapper pages are always regenerated; an existing
rise/index.html is NEVER overwritten, so a real Rise 360 export is never
clobbered.

Run from the repo root: python3 generate_lessons.py
"""

import os
import sys

REPO = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(REPO, "data"))
from catalog import COURSES  # noqa: E402

def read(name):
    with open(os.path.join(REPO, "data", name)) as f:
        return f.read()

LIVE_TEMPLATE = read("lesson_wrapper_template.html")
PLACEHOLDER_TEMPLATE = read("lesson_placeholder_template.html")
MISSING_RISE_TEMPLATE = read("rise_missing_template.html")

generated = []
warnings = []

for course in COURSES:
    lesson_counter = 0
    for chapter in course["chapters"]:
        chapter_num_padded = f"{chapter['num']:02d}"
        for lesson in chapter["lessons"]:
            lesson_counter += 1
            lesson_num_padded = f"{lesson_counter:02d}"
            title = lesson["title"]
            released = bool(lesson["released"])

            lesson_dir = os.path.join(
                REPO, "courses", course["course_id"],
                f"chapter-{chapter_num_padded}", f"lesson-{lesson_num_padded}"
            )
            os.makedirs(lesson_dir, exist_ok=True)

            template = LIVE_TEMPLATE if released else PLACEHOLDER_TEMPLATE
            wrapper_out = (template
                .replace("__LESSON_TITLE__", title)
                .replace("__COURSE_CODE__", course["course_code"])
                .replace("__COURSE_ID__", course["course_id"])
                .replace("__CHAPTER_NUM_PADDED__", chapter_num_padded)
                .replace("__LESSON_NUM_PADDED__", lesson_num_padded)
            )
            with open(os.path.join(lesson_dir, "index.html"), "w") as f:
                f.write(wrapper_out)

            if released:
                rise_dir = os.path.join(lesson_dir, "rise")
                rise_index = os.path.join(rise_dir, "index.html")
                if not os.path.exists(rise_index):
                    os.makedirs(rise_dir, exist_ok=True)
                    with open(rise_index, "w") as f:
                        f.write(MISSING_RISE_TEMPLATE.replace("__LESSON_TITLE__", title))
                    warnings.append(
                        f"{course['course_id']} lesson {lesson_num_padded} is released=True but has no "
                        f"Rise export in {os.path.relpath(rise_dir, REPO)}/ — wrote a notice page. "
                        f"Upload the export before announcing it."
                    )

            generated.append((course["course_id"], chapter_num_padded, lesson_num_padded, title, released))

print(f"Generated {len(generated)} lesson wrapper pages:")
current_course = None
for course_id, ch, ln, title, released in generated:
    if course_id != current_course:
        print(f"\n  == {course_id} ==")
        current_course = course_id
    state = "LIVE       " if released else "placeholder"
    print(f"    [{state}] chapter-{ch}/lesson-{ln}/  ->  {title}")

for w in warnings:
    print(f"\nWARNING: {w}")
