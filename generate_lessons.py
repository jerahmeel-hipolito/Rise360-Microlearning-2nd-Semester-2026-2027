#!/usr/bin/env python3
"""
generate_lessons.py
Generates the lesson wrapper index.html for EVERY lesson in data/catalog.py
from one template (data/lesson_wrapper_template.html).

All 46 wrappers are the same page apart from titles/IDs. Each one decides AT
RUNTIME whether it is unlocked, by looking for its ID in js/releases.js:
  * not listed -> a locked "Coming soon" panel; no Rise iframe src and NONE of
                  api.js / tracking.js / rise-integration.js are loaded, so it
                  can never write to the Activity Log
  * listed     -> the Rise export loads in the iframe and tracking starts

So releasing a lesson never needs this script — just upload the Rise export
into the lesson's rise/ folder and add the ID to js/releases.js. Run this
only after renaming/reorganizing lessons in catalog.py.

This script never creates or touches any rise/ folder.
Run from the repo root: python3 generate_lessons.py
"""

import os
import sys

REPO = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(REPO, "data"))
from catalog import COURSES  # noqa: E402

with open(os.path.join(REPO, "data", "lesson_wrapper_template.html")) as f:
    TEMPLATE = f.read()

generated = []
for course in COURSES:
    lesson_counter = 0
    for chapter in course["chapters"]:
        chapter_num_padded = f"{chapter['num']:02d}"
        for lesson in chapter["lessons"]:
            lesson_counter += 1
            lesson_num_padded = f"{lesson_counter:02d}"
            lesson_dir = os.path.join(
                REPO, "courses", course["course_id"],
                f"chapter-{chapter_num_padded}", f"lesson-{lesson_num_padded}"
            )
            os.makedirs(lesson_dir, exist_ok=True)
            out = (TEMPLATE
                .replace("__LESSON_TITLE__", lesson["title"])
                .replace("__COURSE_CODE__", course["course_code"])
                .replace("__COURSE_ID__", course["course_id"])
                .replace("__CHAPTER_NUM_PADDED__", chapter_num_padded)
                .replace("__LESSON_NUM_PADDED__", lesson_num_padded))
            with open(os.path.join(lesson_dir, "index.html"), "w") as f:
                f.write(out)
            generated.append((course["course_id"], chapter_num_padded, lesson_num_padded, lesson["title"]))

print(f"Generated {len(generated)} lesson wrapper pages:")
current = None
for course_id, ch, ln, title in generated:
    if course_id != current:
        print(f"\n  == {course_id} ==")
        current = course_id
    print(f"    {course_id}-L{ln}  courses/{course_id}/chapter-{ch}/lesson-{ln}/  ->  {title}")
