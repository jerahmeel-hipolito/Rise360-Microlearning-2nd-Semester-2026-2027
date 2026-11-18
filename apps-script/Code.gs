/**
 * Code.gs
 * Google Apps Script Web App backend for the GitHub Microlearning Portal.
 *
 * DEPLOYMENT (do this after pasting this code into a bound or standalone
 * Apps Script project attached to the analytics Google Sheet):
 *   1. Deploy > New deployment > select type "Web app"
 *   2. Execute as: Me (your own Google account) — NOT "User accessing the
 *      web app". Students never authenticate, so the script must run under
 *      the developer's identity to have permission to write to the sheet.
 *   3. Who has access: Anyone — NOT "Anyone with Google account". Students
 *      aren't signing in with Google at all.
 *   4. Deploy, copy the resulting Web App URL, and paste it into
 *      js/api.js -> Api.ENDPOINT_URL.
 *   5. After ANY future code change, you must create a new deployment
 *      version (or "Manage deployments" -> edit -> new version) for the
 *      change to actually take effect at the existing URL. Editing the
 *      script alone does not update what the live URL serves.
 *
 * WHY THE FRONTEND SENDS Content-Type: text/plain INSTEAD OF
 * application/json: application/json triggers a CORS preflight (an OPTIONS
 * request) that Apps Script web apps don't handle the way a normal backend
 * does, so the real POST never arrives. text/plain is a CORS "simple
 * request" and skips the preflight. The body is still a JSON string — this
 * script JSON.parses it from e.postData.contents below.
 *
 * WHY doPost ALWAYS RETURNS HTTP 200: Apps Script web apps cannot set a
 * custom HTTP status code on their response. Every logical outcome —
 * success, validation failure, student not found, server error — is
 * therefore signaled through the `success` field (and `code` field on
 * failure) inside the JSON response body, never through the HTTP status.
 * js/api.js checks response.json().success, never response.status.
 */

// ---------- Sheet name + column constants ----------
// Centralized here so a renamed tab or reordered column only needs to
// change in one place.

const SHEET_ROSTER = 'Student Roster';
const SHEET_COURSE_CATALOG = 'Course Catalog';
const SHEET_LESSON_CATALOG = 'Lesson Catalog';
const SHEET_ACTIVITY_LOG = 'Activity Log';

// Column position of SessionID within the Activity Log tab (1-indexed).
// Must match the column order defined in the project skill's
// sheets-setup.md exactly. If that layout ever changes, update this.
//
// BUGFIX: this was 11 before a ChapterTitle column was added at position 9
// (see appendActivityRow below) — SessionID shifted to 12 as a result.
const ACTIVITY_LOG_SESSION_ID_COL = 12;

const REQUIRED_FIELDS = [
  'timestamp', 'studentId', 'sessionId', 'courseId', 'chapterId',
  'lessonId', 'attemptNumber', 'status', 'startTime', 'endTime', 'durationSeconds'
];

// ---------- Entry point ----------

function doPost(e) {
  const lock = LockService.getScriptLock();
  let hasLock = false;

  try {
    hasLock = lock.tryLock(10000); // wait up to 10s for the lock
    if (!hasLock) {
      return jsonResponse({ success: false, code: 500, message: 'Server busy, please retry.' });
    }

    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ success: false, code: 400, message: 'Missing request body.' });
    }

    let payload;
    try {
      payload = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return jsonResponse({ success: false, code: 400, message: 'Request body was not valid JSON.' });
    }

    // Read-only cross-device progress lookup (js/api.js -> fetchProgress).
    // Handled BEFORE payload validation because it isn't an analytics
    // record; it never writes anything to the sheet.
    if (payload && payload.action === 'getProgress') {
      return handleGetProgress(payload);
    }

    const validation = validatePayload(payload);
    if (!validation.valid) {
      return jsonResponse({ success: false, code: 400, message: validation.message });
    }

    // Duplicate check happens BEFORE roster/catalog lookups, both because
    // it's cheaper (fail fast) and because it must be inside the same lock
    // as the append below — checking and appending must be atomic together,
    // or two simultaneous requests for the same sessionId could both pass
    // the check before either has appended its row, producing two rows for
    // one session. See the project skill's data-contract.md for the full
    // explanation of why sessionId alone (not studentId+sessionId) is the
    // correct dedup key.
    if (sessionAlreadyLogged(payload.sessionId)) {
      return jsonResponse({ success: true, message: 'Duplicate session ignored.', duplicate: true });
    }

    const student = lookupStudent(payload.studentId);
    if (!student) {
      return jsonResponse({ success: false, code: 404, message: 'Student ID not found.' });
    }

    const course = lookupCourse(payload.courseId);
    const lesson = lookupLesson(payload.lessonId);

    appendActivityRow(payload, student, course, lesson);

    return jsonResponse({ success: true, message: 'Activity logged.' });

  } catch (err) {
    return jsonResponse({ success: false, code: 500, message: 'Server error: ' + err.message });
  } finally {
    if (hasLock) lock.releaseLock();
  }
}

// Apps Script web apps need a GET handler too, even if unused, so visiting
// the deployed URL directly in a browser (e.g. while sanity-checking the
// deployment) returns something readable instead of an opaque error.
function doGet(e) {
  return ContentService
    .createTextOutput('Microlearning Portal backend is running. POST analytics payloads to this URL.')
    .setMimeType(ContentService.MimeType.TEXT);
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ---------- Cross-device progress (read-only) ----------
// Returns the composite LessonIDs (e.g. "bst305-L05") this student has a
// 'Completed' row for, on any device. js/progress-sync.js merges these into
// the browser's local completion flags. Unknown students get the same 404
// as a normal analytics POST.

function handleGetProgress(payload) {
  if (!payload.studentId || typeof payload.studentId !== 'string') {
    return jsonResponse({ success: false, code: 400, message: 'Missing studentId.' });
  }
  if (!lookupStudent(payload.studentId)) {
    return jsonResponse({ success: false, code: 404, message: 'Student ID not found.' });
  }

  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_ACTIVITY_LOG);
  const lastRow = sheet.getLastRow();
  const completed = {};
  if (lastRow >= 2) {
    // Columns 1..14 cover StudentID (2), LessonID (10) and Status (14).
    const rows = sheet.getRange(2, 1, lastRow - 1, 14).getValues();
    rows.forEach(function (r) {
      if (String(r[1]) === String(payload.studentId) && r[13] === 'Completed') {
        completed[String(r[9])] = true;
      }
    });
  }
  return jsonResponse({ success: true, completedLessonIds: Object.keys(completed) });
}

// ---------- Validation ----------

function validatePayload(p) {
  for (let i = 0; i < REQUIRED_FIELDS.length; i++) {
    const field = REQUIRED_FIELDS[i];
    if (p[field] === undefined || p[field] === null || p[field] === '') {
      return { valid: false, message: 'Missing required field: ' + field };
    }
  }
  if (p.status !== 'Completed' && p.status !== 'Incomplete') {
    return { valid: false, message: 'Invalid status value: ' + p.status };
  }
  if (typeof p.durationSeconds !== 'number' || p.durationSeconds < 0) {
    return { valid: false, message: 'Invalid durationSeconds.' };
  }
  if (typeof p.attemptNumber !== 'number' || p.attemptNumber < 1 || p.attemptNumber % 1 !== 0) {
    return { valid: false, message: 'Invalid attemptNumber.' };
  }
  return { valid: true };
}

// ---------- Duplicate detection ----------
// sessionId alone is the dedup key (NOT studentId+sessionId — see
// data-contract.md for why that combination can't catch the real failure
// mode this guards against: the same session firing two terminal events,
// e.g. lesson_complete followed by a pagehide-triggered Incomplete for the
// same session a moment later).
//
// This is a linear scan and will get slower as the Activity Log grows
// across semesters. Fine at the scale of one class/one semester (low
// thousands of rows at most). If this becomes slow after a year or two of
// accumulated data, archive old semesters to a separate sheet rather than
// trying to optimize this scan — see the project skill's
// deployment-and-testing.md roadmap notes.

function sessionAlreadyLogged(sessionId) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_ACTIVITY_LOG);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return false; // only header row exists, nothing logged yet

  const data = sheet.getRange(2, ACTIVITY_LOG_SESSION_ID_COL, lastRow - 1, 1).getValues();
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === sessionId) return true;
  }
  return false;
}

// ---------- Lookups ----------
// Three lookups (student, course, lesson) so the Activity Log row can be
// fully denormalized — readable course/lesson names written directly into
// the log, so the instructor never has to write a VLOOKUP just to read
// their own spreadsheet. See sheets-setup.md for the full column layout
// this feeds into.

function lookupStudent(studentId) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_ROSTER);
  const data = sheet.getDataRange().getValues(); // includes header row at index 0
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(studentId)) {
      return {
        studentId: data[i][0],
        name: data[i][1],
        program: data[i][2],
        section: data[i][3]
      };
    }
  }
  return null; // missing student IS a hard failure — see doPost's 404 handling
}

// BUGFIX: Course Catalog's CourseID column must contain the same values the
// FRONTEND actually sends as courseId — which is the URL folder name
// (e.g. "bst305", "mas204a", "mas308"; see tracking.js deriveLessonMetadata),
// not a short display code like "BST305". The previous seed data used the
// short codes, so this lookup never matched anything and CourseName always
// silently fell back to the raw folder id instead of the real course name.
// setupSpreadsheet() below now seeds folder-style IDs so this actually
// resolves. ("BST305"/"MAS204A"/"MAS308" still exist purely as a cosmetic display
// tag in js/course-catalog.js's courseCode field — that value is never sent
// to this backend and isn't looked up here.)
function lookupCourse(courseId) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_COURSE_CATALOG);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(courseId)) {
      return { courseId: data[i][0], courseName: data[i][1] };
    }
  }
  // Missing catalog entry falls back to the raw ID rather than blocking the
  // write — a metadata gap shouldn't prevent logging the attempt. Only a
  // missing STUDENT (above) is treated as a hard failure.
  return { courseId: courseId, courseName: courseId };
}

// BUGFIX: LessonID (and therefore LessonTitle/ChapterTitle accuracy) was
// broken because tracking.js used to send a bare folder number ("01", "02"…)
// as lessonId — NOT unique across courses, since every course restarts its
// lesson numbering at 1. lookupLesson would match whichever Lesson Catalog
// row happened to come first for that number, so the LOGGED LessonTitle
// (and the raw, un-looked-up ChapterID shown in the sheet) were frequently
// for the WRONG course's lesson entirely. Fixed at the source in
// tracking.js: it now sends a globally-unique composite ID like
// "bst305-L05". This function is otherwise unchanged — it just
// receives a key that's actually unique now. Also now returns chapterTitle,
// pulled from the same Lesson Catalog row (see the ChapterTitle column in
// sheets-setup.md), so the Activity Log can show a readable chapter name
// instead of just the raw ChapterID string.
function lookupLesson(lessonId) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_LESSON_CATALOG);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(lessonId)) {
      return { lessonId: data[i][0], lessonTitle: data[i][1], chapterTitle: data[i][2] };
    }
  }
  // Missing catalog entry (e.g. a lesson published on GitHub Pages before
  // its Lesson Catalog row was added) falls back to the raw IDs rather than
  // blocking the write.
  return { lessonId: lessonId, lessonTitle: lessonId, chapterTitle: '' };
}

// ---------- Write ----------
// Column order here MUST exactly match the Activity Log header row defined
// in sheets-setup.md. If you add a field to the data contract later, add
// it to both this array and that header in the same change.

function appendActivityRow(payload, student, course, lesson) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_ACTIVITY_LOG);
  sheet.appendRow([
    payload.timestamp,        //  1 Timestamp
    student.studentId,        //  2 StudentID
    student.name,              //  3 StudentName
    student.program,           //  4 Program
    student.section,            //  5 Section
    course.courseId,           //  6 CourseID
    course.courseName,         //  7 CourseName
    payload.chapterId,         //  8 ChapterID     (now a globally-unique ID like "bst305-CH03", not a raw digit)
    lesson.chapterTitle,        //  9 ChapterTitle  (NEW — looked up from the Lesson Catalog row, human-readable)
    lesson.lessonId,            // 10 LessonID       (now globally-unique, e.g. "bst305-L05")
    lesson.lessonTitle,         // 11 LessonTitle
    payload.sessionId,          // 12 SessionID  <- dedup key, see ACTIVITY_LOG_SESSION_ID_COL above
    payload.attemptNumber,      // 13 AttemptNumber
    payload.status,             // 14 Status
    payload.startTime,          // 15 StartTime
    payload.endTime,            // 16 EndTime
    payload.durationSeconds     // 17 DurationSeconds
  ]);
}

// ---------- One-time setup helper ----------
// Run this manually once (Apps Script editor -> select function -> Run)
// against a brand-new spreadsheet to create all required tabs with correct
// headers, so you don't have to type them by hand. Safe to re-run — it
// skips any tab that already exists rather than overwriting it.

function setupSpreadsheet() {
  const ss = SpreadsheetApp.getActive();

  const rosterSheet = createTabIfMissing(ss, SHEET_ROSTER, ['StudentID', 'StudentName', 'Program', 'Section']);
  // BUGFIX: CourseID here must match what the FRONTEND sends (the URL
  // folder name — "bst305"/"mas204a"/"mas308"), not a short display code
  // like "BST305". See lookupCourse's comment above for the full
  // explanation of why the old seed data ("BST305" etc.) never matched.
  const courseSheet = createTabIfMissing(ss, SHEET_COURSE_CATALOG, ['CourseID', 'CourseName']);
  const lessonSheet = createTabIfMissing(ss, SHEET_LESSON_CATALOG, ['LessonID', 'LessonTitle', 'ChapterTitle', 'CourseID']);
  createTabIfMissing(ss, SHEET_ACTIVITY_LOG, [
    'Timestamp', 'StudentID', 'StudentName', 'Program', 'Section',
    'CourseID', 'CourseName', 'ChapterID', 'ChapterTitle', 'LessonID', 'LessonTitle',
    'SessionID', 'AttemptNumber', 'Status', 'StartTime', 'EndTime', 'DurationSeconds'
  ]);
  const dashboardSheet = createTabIfMissing(ss, 'Dashboard', []);
  createTabIfMissing(ss, 'Settings', ['Key', 'Value']);

  // Seed one sample row per lookup tab, ONLY if that tab is otherwise
  // empty (header row only) — so re-running this after real data exists
  // never overwrites anything. This also makes testDoPostManually() below
  // work correctly out of the box instead of 404'ing on a student that
  // doesn't exist yet.
  // Seed real Course Catalog and Lesson Catalog rows so the spreadsheet is
  // production-ready immediately, not just a smoke-test fixture. Each call
  // only writes if that exact row doesn't already exist — safe to re-run
  // after adding more real rows by hand, it won't duplicate anything.
  // The Student Roster intentionally gets ONE sample test row only — real
  // student rosters must be entered by the instructor, never guessed here.
  seedRowIfEmpty(rosterSheet, ['TEST-0001', 'Test Student', 'Sample Program', 'Section A']);

  // >>> GENERATED SEED (do not hand-edit; run ./generate_all.sh) >>>
  seedRowsIfMissing(courseSheet, [
    ["bst305", "Biostatistics"],
    ["mas204a", "Statistical Analysis II"],
    ["mas308", "Categorical Data Analysis"]
  ]);

  // All 46 lessons (every course), LessonID = the same globally-unique
  // composite format tracking.js sends ("<courseId>-L<NN>").
  seedRowsIfMissing(lessonSheet, [
    ["bst305-L01", "Welcome to BST 305 — Course Orientation and Introduction to Biostatistics", "Foundations of Biostatistics and Data", "bst305"],
    ["bst305-L02", "Variables, Measurement Scales, Data Collection, Sampling, and Sample Size", "Foundations of Biostatistics and Data", "bst305"],
    ["bst305-L03", "Frequency Distributions, Basic Data Management, and Measures of Frequency", "Organizing and Visualizing Biological Data", "bst305"],
    ["bst305-L04", "Data Visualization and Presentation", "Organizing and Visualizing Biological Data", "bst305"],
    ["bst305-L05", "Descriptive Statistics — Central Tendency, Dispersion, and Shape", "Descriptive Statistics and Probability", "bst305"],
    ["bst305-L06", "Probability Essentials and Probability Distributions", "Descriptive Statistics and Probability", "bst305"],
    ["bst305-L07", "Foundations of Hypothesis Testing", "Hypothesis Testing", "bst305"],
    ["bst305-L08", "Comparing Two Means — t-Tests", "Hypothesis Testing", "bst305"],
    ["bst305-L09", "Principles of Experimental Design and One-Way ANOVA", "Experimental Design and ANOVA I", "bst305"],
    ["bst305-L10", "Two-Way Factorial ANOVA", "ANOVA II: Factorial, Blocked, and Repeated Designs", "bst305"],
    ["bst305-L11", "Randomized Block and Repeated-Measures Designs", "ANOVA II: Factorial, Blocked, and Repeated Designs", "bst305"],
    ["bst305-L12", "Non-Parametric Statistics", "Non-Parametric and Categorical Data", "bst305"],
    ["bst305-L13", "Categorical Data Analysis and Epidemiologic Measures of Association", "Non-Parametric and Categorical Data", "bst305"],
    ["bst305-L14", "Correlation and Simple Linear Regression", "Regression and Applied Biological Statistics", "bst305"],
    ["bst305-L15", "Statistics in Genetics, Ecology, and Dose–Response Studies", "Regression and Applied Biological Statistics", "bst305"],
    ["bst305-L16", "Logistic Regression and Introduction to Survival Analysis", "Regression and Applied Biological Statistics", "bst305"],
    ["mas204a-L01", "Welcome to MAS 204a — Course Orientation and Introduction to Regression Analysis", "Orientation and Correlation", "mas204a"],
    ["mas204a-L02", "Correlation Analysis", "Orientation and Correlation", "mas204a"],
    ["mas204a-L03", "Simple Linear Regression I: The Model and Least Squares Estimation", "Simple Linear Regression: Model, Least Squares, Fit", "mas204a"],
    ["mas204a-L04", "Simple Linear Regression II: Variation and Goodness of Fit", "Simple Linear Regression: Model, Least Squares, Fit", "mas204a"],
    ["mas204a-L05", "Simple Linear Regression III: Inference", "Simple Linear Regression: Inference, Diagnostics, Unusual Observations, Application", "mas204a"],
    ["mas204a-L06", "Simple Linear Regression IV: Model Assumptions and Residual Analysis", "Simple Linear Regression: Inference, Diagnostics, Unusual Observations, Application", "mas204a"],
    ["mas204a-L07", "Simple Linear Regression V: Unusual Observations and Transformations", "Simple Linear Regression: Inference, Diagnostics, Unusual Observations, Application", "mas204a"],
    ["mas204a-L08", "Simple Linear Regression VI: Applications and Review", "Simple Linear Regression: Inference, Diagnostics, Unusual Observations, Application", "mas204a"],
    ["mas204a-L09", "Multiple Linear Regression I: The Model and Estimation", "Multiple Linear Regression", "mas204a"],
    ["mas204a-L10", "Multiple Linear Regression II: Inference", "Multiple Linear Regression", "mas204a"],
    ["mas204a-L11", "Multiple Linear Regression III: Diagnostics", "Multiple Linear Regression", "mas204a"],
    ["mas204a-L12", "Categorical Predictors and Interaction", "Categorical Predictors, Interaction, and Model Building", "mas204a"],
    ["mas204a-L13", "Model Building I: Variable Selection Criteria", "Categorical Predictors, Interaction, and Model Building", "mas204a"],
    ["mas204a-L14", "Model Building II: Selection Procedures and Model Validation", "Categorical Predictors, Interaction, and Model Building", "mas204a"],
    ["mas204a-L15", "Applied Regression Analysis: Advanced Topics and Tips", "Advanced Topics", "mas204a"],
    ["mas308-L01", "Welcome to MAS 308 — Course Orientation and Introduction to Categorical Data Analysis", "Orientation and Foundations", "mas308"],
    ["mas308-L02", "Probability Distributions for Categorical and Count Data", "Orientation and Foundations", "mas308"],
    ["mas308-L03", "Statistical Inference for Proportions", "Orientation and Foundations", "mas308"],
    ["mas308-L04", "Contingency Tables I: Notation and Probability Structure", "Contingency Tables and Association", "mas308"],
    ["mas308-L05", "Contingency Tables II: Comparing Proportions, Relative Risk, and Odds Ratio", "Contingency Tables and Association", "mas308"],
    ["mas308-L06", "Confidence Intervals and the Chi-Squared Test of Independence", "Inference for Two-Way Tables", "mas308"],
    ["mas308-L07", "Residuals and Fisher's Exact Test", "Inference for Two-Way Tables", "mas308"],
    ["mas308-L08", "Association in Three-Way Tables", "Three-Way Tables", "mas308"],
    ["mas308-L09", "Generalized Linear Models I: Components and Binary Response Models", "Generalized Linear Models", "mas308"],
    ["mas308-L10", "Generalized Linear Models II: Count Data, Inference, and Model Checking", "Generalized Linear Models", "mas308"],
    ["mas308-L11", "Loglinear Models I: Two-Way Tables", "Loglinear Models", "mas308"],
    ["mas308-L12", "Loglinear Models II: Three-Way Tables and Model Selection", "Loglinear Models", "mas308"],
    ["mas308-L13", "Logistic Regression I: The Model and Its Interpretation", "Logistic Regression", "mas308"],
    ["mas308-L14", "Logistic Regression II: Model Building, Fit, and Diagnostics", "Logistic Regression", "mas308"],
    ["mas308-L15", "Regression for Count Data and Applied Categorical Data Analysis", "Count Data Regression", "mas308"]
  ]);
  // <<< GENERATED SEED <<<

  buildDashboardSheet(dashboardSheet);

  Logger.log('Spreadsheet setup complete.');
}

function seedRowIfEmpty(sheet, rowValues) {
  if (sheet.getLastRow() > 1) return; // already has data beyond the header — leave it alone
  sheet.getRange(2, 1, 1, rowValues.length).setValues([rowValues]);
}

// Like seedRowIfEmpty, but for catalogs that need MULTIPLE distinct rows
// (lessonId alone repeats across courses — e.g. "lesson-01" exists once per
// course — so the real uniqueness check has to consider the full row, not
// just whether the sheet already has ANY data). Skips any row that's an
// exact match for one already present; appends any that are missing. Safe
// to re-run after manually adding more rows.
// Dedupes by the ID column (column 1 of each row) only — NOT full-row
// equality. A row is considered "already seeded" if a row with that same ID
// already exists, even if its other columns differ. This matters because
// LessonID/CourseID are meant to be unique PRIMARY KEYS: if this deduped on
// full-row equality instead, a row whose ID already exists but whose title
// text is slightly different (e.g. an instructor tweaked a title by hand,
// or an older seed run used placeholder text for the same ID) would be
// treated as a "new" row and inserted anyway — leaving two rows with the
// same LessonID/CourseID and silently corrupting the catalog for that ID
// (lookupLesson/lookupCourse both return whichever row comes first).
function seedRowsIfMissing(sheet, rows) {
  const existing = sheet.getDataRange().getValues();
  const existingIds = new Set(
    existing.slice(1).map(r => String(r[0]))
  );
  rows.forEach(function (row) {
    if (!existingIds.has(String(row[0]))) {
      sheet.appendRow(row);
      existingIds.add(String(row[0])); // guard against duplicate IDs within `rows` itself too
    }
  });
}

function createTabIfMissing(ss, name, headerRow) {
  let sheet = ss.getSheetByName(name);
  if (sheet) return sheet; // don't overwrite an existing tab

  sheet = ss.insertSheet(name);
  if (headerRow.length > 0) {
    sheet.getRange(1, 1, 1, headerRow.length).setValues([headerRow]);
    sheet.getRange(1, 1, 1, headerRow.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// ---------- Dashboard ----------
// Previously the Dashboard tab was created empty, with ready-to-paste
// formulas living only in apps-script/dashboard-formulas.md for the
// instructor to copy in by hand — so a fresh spreadsheet had NO working
// dashboard until someone did that manually. This function builds it
// automatically: six QUERY/FILTER blocks laid out SIDE BY SIDE (separate
// column bands) rather than stacked vertically, so each block's dynamic
// row count (which grows as the Activity Log grows) can never collide with
// the block next to it. Safe to re-run — it only ever writes into this
// fixed set of header/formula cells, never touches the Activity Log or any
// other tab, and re-running just refreshes the labels/formulas in place.
//
// Column-letter map this assumes for 'Activity Log' (see sheets-setup.md
// and appendActivityRow above for the authoritative column order):
//   A Timestamp   B StudentID   C StudentName   D Program   E Section
//   F CourseID    G CourseName  H ChapterID     I ChapterTitle
//   J LessonID    K LessonTitle L SessionID     M AttemptNumber
//   N Status      O StartTime   P EndTime       Q DurationSeconds
//
// NOTE ON "CASE WHEN": an earlier draft of these formulas used SQL-style
// CASE WHEN inside QUERY — that is NOT valid in Google's Visualization
// Query Language (it only *looks* SQL-like). Every split-by-status formula
// below uses `pivot N` instead, which is the native GViz way to split a
// count across the distinct values of a column. This has been verified for
// syntactic validity but, like dashboard-formulas.md, has not been
// exercised against a live Google Sheet, since this environment has no way
// to open a real Sheet — sanity-check the first run against real data.
function buildDashboardSheet(sheet) {
  sheet.clear();

  function block(col, title, formula) {
    const range = sheet.getRange(1, col);
    range.setValue(title);
    range.setFontWeight('bold');
    sheet.getRange(3, col).setFormula(formula);
  }

  // Block 1 (columns A-D): per-lesson completion, split by status.
  block(1, 'Per-Lesson Completion by Status',
    "=IFERROR(QUERY('Activity Log'!A:Q, \"select K, count(K) group by K pivot N label count(K) 'Attempts'\", 1), \"No activity logged yet.\")");

  // Block 2 (columns F-H): per-student progress (completed-lesson count).
  block(6, 'Per-Student Progress (Completed Lessons)',
    "=IFERROR(QUERY('Activity Log'!A:Q, \"select B, C, count(K) where N = 'Completed' group by B, C order by count(K) desc label count(K) 'Completed Lessons'\", 1), \"No activity logged yet.\")");

  // Block 3 (columns J-K): average completion time per lesson (Completed only).
  block(10, 'Average Duration per Lesson (Completed, seconds)',
    "=IFERROR(QUERY('Activity Log'!A:Q, \"select K, avg(Q) where N = 'Completed' group by K label avg(Q) 'Avg Duration (sec)'\", 1), \"No activity logged yet.\")");

  // Block 4 (columns M-O): course-level rollup, split by status.
  block(13, 'Course-Level Rollup by Status',
    "=IFERROR(QUERY('Activity Log'!A:Q, \"select G, count(K) group by G pivot N label count(K) 'Attempts'\", 1), \"No activity logged yet.\")");

  // Block 5 (columns Q-S): section x course comparison, split by status.
  block(17, 'Section Comparison by Course',
    "=IFERROR(QUERY('Activity Log'!A:Q, \"select E, G, count(K) group by E, G pivot N label count(K) 'Attempts'\", 1), \"No activity logged yet.\")");

  // Block 6 (column V): students on the roster with ZERO logged activity —
  // an anti-join, which QUERY's GViz dialect can't express, so this is a
  // plain spreadsheet array formula (FILTER + COUNTIF) instead of a QUERY.
  // One buffer column after block 5 (which can grow up to 4 columns wide:
  // Section, CourseName, + one pivoted column per status value) so the two
  // never touch even at status's max width (Completed/Incomplete, per
  // validatePayload's fixed set of allowed values).
  sheet.getRange(1, 22).setValue('Students with Zero Activity');
  sheet.getRange(1, 22).setFontWeight('bold');
  sheet.getRange(3, 22).setFormula(
    "=IFERROR(FILTER('Student Roster'!A2:B, COUNTIF('Activity Log'!B2:B, 'Student Roster'!A2:A) = 0), \"Every roster student has at least one logged attempt.\")"
  );

  sheet.setFrozenRows(0);
  sheet.getRange(1, 1, 1, 22).setFontFamily('Inter');
}

// ---------- Manual test helper ----------
// Run this manually (Apps Script editor -> select function -> Run) to send
// a fake payload through the full doPost pipeline without needing a
// deployed URL or a real browser request. Check the Activity Log tab
// afterward for the new row, and check Logger output (View > Logs) for
// the response.

function testDoPostManually() {
  const fakeEvent = {
    postData: {
      contents: JSON.stringify({
        timestamp: new Date().toISOString(),
        studentId: 'TEST-0001',
        sessionId: 'manual-test-' + new Date().getTime(),
        courseId: 'bst305',
        chapterId: 'bst305-CH01',
        lessonId: 'bst305-L01',
        attemptNumber: 1,
        status: 'Completed',
        startTime: new Date(Date.now() - 600000).toISOString(),
        endTime: new Date().toISOString(),
        durationSeconds: 600
      })
    }
  };

  const result = doPost(fakeEvent);
  Logger.log(result.getContent());
}
