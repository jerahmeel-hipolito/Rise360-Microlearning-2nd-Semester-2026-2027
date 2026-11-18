"""
catalog.py — SINGLE SOURCE OF TRUTH for the 2nd-semester (SY 2026-2027)
course/chapter/lesson masterlist.

Everything else is GENERATED from this file — never hand-edit them:
  js/course-catalog.js        frontend navigation data
  courses/<course>/...        lesson wrapper pages
  course-<course>.html        per-course chapter/lesson pages
  apps-script/Code.gs         the block between the GENERATED SEED markers

WEEKLY RELEASE WORKFLOW
  Every lesson starts as a locked "Coming soon" placeholder (released=False).
  A placeholder page has NO Rise iframe, NO completion button and loads NO
  tracking scripts, so nothing a student does on it can reach the Activity
  Log. When a lesson's Rise 360 export is ready:
    1. Drop the unzipped export into courses/<course>/chapter-NN/lesson-NN/rise/
    2. Change that lesson's L(...) call below to  L("Title", released=True)
    3. Run ./generate_all.sh and upload the changed files.
  Only then does the lesson become clickable and start tracking.

Course slugs (bst305 / mas204a / mas308) are deliberately different from the
1st-semester slugs (biostatistics / ssa / ama): both portals are served from
the same github.io origin, so identical slugs would collide in browser
storage and in lesson IDs.
"""


def L(title, released=False):
    """One lesson. released=False renders a locked 'Coming soon' placeholder
    with no tracking; flip to True only once the Rise export is in place."""
    return {"title": title, "released": released}


COURSES = [
    {
        "course_id": "bst305",
        "course_code": "BST305",
        "course_number": "BST 305",
        "course_name": "Biostatistics",
        "course_description": "Practical biostatistics for biology students — from data and design to ANOVA, regression, and survival analysis.",
        "chapters": [
            {"num": 1, "title": "Foundations of Biostatistics and Data", "lessons": [
                L("Welcome to BST 305 — Course Orientation and Introduction to Biostatistics"),
                L("Variables, Measurement Scales, Data Collection, Sampling, and Sample Size"),
            ]},
            {"num": 2, "title": "Organizing and Visualizing Biological Data", "lessons": [
                L("Frequency Distributions, Basic Data Management, and Measures of Frequency"),
                L("Data Visualization and Presentation"),
            ]},
            {"num": 3, "title": "Descriptive Statistics and Probability", "lessons": [
                L("Descriptive Statistics — Central Tendency, Dispersion, and Shape"),
                L("Probability Essentials and Probability Distributions"),
            ]},
            {"num": 4, "title": "Hypothesis Testing", "lessons": [
                L("Foundations of Hypothesis Testing"),
                L("Comparing Two Means — t-Tests"),
            ]},
            {"num": 5, "title": "Experimental Design and ANOVA I", "lessons": [
                L("Principles of Experimental Design and One-Way ANOVA"),
            ]},
            {"num": 6, "title": "ANOVA II: Factorial, Blocked, and Repeated Designs", "lessons": [
                L("Two-Way Factorial ANOVA"),
                L("Randomized Block and Repeated-Measures Designs"),
            ]},
            {"num": 7, "title": "Non-Parametric and Categorical Data", "lessons": [
                L("Non-Parametric Statistics"),
                L("Categorical Data Analysis and Epidemiologic Measures of Association"),
            ]},
            {"num": 8, "title": "Regression and Applied Biological Statistics", "lessons": [
                L("Correlation and Simple Linear Regression"),
                L("Statistics in Genetics, Ecology, and Dose–Response Studies"),
                L("Logistic Regression and Introduction to Survival Analysis"),
            ]},
        ],
    },
    {
        "course_id": "mas204a",
        "course_code": "MAS204A",
        "course_number": "MAS 204a",
        "course_name": "Statistical Analysis II",
        "course_description": "Introductory regression analysis — correlation, simple and multiple linear regression, diagnostics, and model building.",
        "chapters": [
            {"num": 1, "title": "Orientation and Correlation", "lessons": [
                L("Welcome to MAS 204a — Course Orientation and Introduction to Regression Analysis"),
                L("Correlation Analysis"),
            ]},
            {"num": 2, "title": "Simple Linear Regression: Model, Least Squares, Fit", "lessons": [
                L("Simple Linear Regression I: The Model and Least Squares Estimation"),
                L("Simple Linear Regression II: Variation and Goodness of Fit"),
            ]},
            {"num": 3, "title": "Simple Linear Regression: Inference, Diagnostics, Unusual Observations, Application", "lessons": [
                L("Simple Linear Regression III: Inference"),
                L("Simple Linear Regression IV: Model Assumptions and Residual Analysis"),
                L("Simple Linear Regression V: Unusual Observations and Transformations"),
                L("Simple Linear Regression VI: Applications and Review"),
            ]},
            {"num": 4, "title": "Multiple Linear Regression", "lessons": [
                L("Multiple Linear Regression I: The Model and Estimation"),
                L("Multiple Linear Regression II: Inference"),
                L("Multiple Linear Regression III: Diagnostics"),
            ]},
            {"num": 5, "title": "Categorical Predictors, Interaction, and Model Building", "lessons": [
                L("Categorical Predictors and Interaction"),
                L("Model Building I: Variable Selection Criteria"),
                L("Model Building II: Selection Procedures and Model Validation"),
            ]},
            {"num": 6, "title": "Advanced Topics", "lessons": [
                L("Applied Regression Analysis: Advanced Topics and Tips"),
            ]},
        ],
    },
    {
        "course_id": "mas308",
        "course_code": "MAS308",
        "course_number": "MAS 308",
        "course_name": "Categorical Data Analysis",
        "course_description": "Methods for categorical and count data — contingency tables, generalized linear, loglinear, logistic, and Poisson regression models.",
        "chapters": [
            {"num": 1, "title": "Orientation and Foundations", "lessons": [
                L("Welcome to MAS 308 — Course Orientation and Introduction to Categorical Data Analysis"),
                L("Probability Distributions for Categorical and Count Data"),
                L("Statistical Inference for Proportions"),
            ]},
            {"num": 2, "title": "Contingency Tables and Association", "lessons": [
                L("Contingency Tables I: Notation and Probability Structure"),
                L("Contingency Tables II: Comparing Proportions, Relative Risk, and Odds Ratio"),
            ]},
            {"num": 3, "title": "Inference for Two-Way Tables", "lessons": [
                L("Confidence Intervals and the Chi-Squared Test of Independence"),
                L("Residuals and Fisher's Exact Test"),
            ]},
            {"num": 4, "title": "Three-Way Tables", "lessons": [
                L("Association in Three-Way Tables"),
            ]},
            {"num": 5, "title": "Generalized Linear Models", "lessons": [
                L("Generalized Linear Models I: Components and Binary Response Models"),
                L("Generalized Linear Models II: Count Data, Inference, and Model Checking"),
            ]},
            {"num": 6, "title": "Loglinear Models", "lessons": [
                L("Loglinear Models I: Two-Way Tables"),
                L("Loglinear Models II: Three-Way Tables and Model Selection"),
            ]},
            {"num": 7, "title": "Logistic Regression", "lessons": [
                L("Logistic Regression I: The Model and Its Interpretation"),
                L("Logistic Regression II: Model Building, Fit, and Diagnostics"),
            ]},
            {"num": 8, "title": "Count Data Regression", "lessons": [
                L("Regression for Count Data and Applied Categorical Data Analysis"),
            ]},
        ],
    },
]


def flatten():
    """Flat, ordered list of every lesson across all courses. lesson_num is
    course-scoped and continuous across chapters (e.g. BST 305 chapter 3's
    first lesson is lesson 5)."""
    out = []
    for course in COURSES:
        lesson_counter = 0
        for chapter in course["chapters"]:
            for lesson in chapter["lessons"]:
                lesson_counter += 1
                out.append({
                    "course_id": course["course_id"],
                    "course_code": course["course_code"],
                    "course_number": course["course_number"],
                    "course_name": course["course_name"],
                    "chapter_num": chapter["num"],
                    "chapter_title": chapter["title"],
                    "lesson_num": lesson_counter,
                    "lesson_title": lesson["title"],
                    "released": lesson["released"],
                })
    return out


if __name__ == "__main__":
    flat = flatten()
    print(f"{len(flat)} total lessons across {len(COURSES)} courses")
    for course in COURSES:
        total = sum(len(ch["lessons"]) for ch in course["chapters"])
        released = sum(1 for ch in course["chapters"] for l in ch["lessons"] if l["released"])
        print(f"  {course['course_code']}: {len(course['chapters'])} chapters, {total} lessons ({released} released)")
