#!/usr/bin/env bash
# Runs the whole generator chain in the right order. Run from the repo root
# after ANY edit to data/catalog.py (e.g. flipping a lesson to released=True).
set -euo pipefail
cd "$(dirname "$0")"
python3 data/build_catalog_json.py > data/catalog.json
python3 generate_course_catalog_js.py
python3 generate_lessons.py
python3 generate_course_pages.py
python3 generate_apps_script_seed.py
