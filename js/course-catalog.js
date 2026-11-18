/**
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

const CourseCatalog = [
  {
    "courseId": "bst305",
    "courseCode": "BST305",
    "courseNumber": "BST 305",
    "courseName": "Biostatistics",
    "courseDescription": "Practical biostatistics for biology students — from data and design to ANOVA, regression, and survival analysis.",
    "chapters": [
      {
        "chapterId": "01",
        "chapterTitle": "Foundations of Biostatistics and Data",
        "lessons": [
          {
            "lessonId": "lesson-01",
            "lessonTitle": "Welcome to BST 305 — Course Orientation and Introduction to Biostatistics",
            "lessonNum": 1,
            "released": false
          },
          {
            "lessonId": "lesson-02",
            "lessonTitle": "Variables, Measurement Scales, Data Collection, Sampling, and Sample Size",
            "lessonNum": 2,
            "released": false
          }
        ]
      },
      {
        "chapterId": "02",
        "chapterTitle": "Organizing and Visualizing Biological Data",
        "lessons": [
          {
            "lessonId": "lesson-03",
            "lessonTitle": "Frequency Distributions, Basic Data Management, and Measures of Frequency",
            "lessonNum": 3,
            "released": false
          },
          {
            "lessonId": "lesson-04",
            "lessonTitle": "Data Visualization and Presentation",
            "lessonNum": 4,
            "released": false
          }
        ]
      },
      {
        "chapterId": "03",
        "chapterTitle": "Descriptive Statistics and Probability",
        "lessons": [
          {
            "lessonId": "lesson-05",
            "lessonTitle": "Descriptive Statistics — Central Tendency, Dispersion, and Shape",
            "lessonNum": 5,
            "released": false
          },
          {
            "lessonId": "lesson-06",
            "lessonTitle": "Probability Essentials and Probability Distributions",
            "lessonNum": 6,
            "released": false
          }
        ]
      },
      {
        "chapterId": "04",
        "chapterTitle": "Hypothesis Testing",
        "lessons": [
          {
            "lessonId": "lesson-07",
            "lessonTitle": "Foundations of Hypothesis Testing",
            "lessonNum": 7,
            "released": false
          },
          {
            "lessonId": "lesson-08",
            "lessonTitle": "Comparing Two Means — t-Tests",
            "lessonNum": 8,
            "released": false
          }
        ]
      },
      {
        "chapterId": "05",
        "chapterTitle": "Experimental Design and ANOVA I",
        "lessons": [
          {
            "lessonId": "lesson-09",
            "lessonTitle": "Principles of Experimental Design and One-Way ANOVA",
            "lessonNum": 9,
            "released": false
          }
        ]
      },
      {
        "chapterId": "06",
        "chapterTitle": "ANOVA II: Factorial, Blocked, and Repeated Designs",
        "lessons": [
          {
            "lessonId": "lesson-10",
            "lessonTitle": "Two-Way Factorial ANOVA",
            "lessonNum": 10,
            "released": false
          },
          {
            "lessonId": "lesson-11",
            "lessonTitle": "Randomized Block and Repeated-Measures Designs",
            "lessonNum": 11,
            "released": false
          }
        ]
      },
      {
        "chapterId": "07",
        "chapterTitle": "Non-Parametric and Categorical Data",
        "lessons": [
          {
            "lessonId": "lesson-12",
            "lessonTitle": "Non-Parametric Statistics",
            "lessonNum": 12,
            "released": false
          },
          {
            "lessonId": "lesson-13",
            "lessonTitle": "Categorical Data Analysis and Epidemiologic Measures of Association",
            "lessonNum": 13,
            "released": false
          }
        ]
      },
      {
        "chapterId": "08",
        "chapterTitle": "Regression and Applied Biological Statistics",
        "lessons": [
          {
            "lessonId": "lesson-14",
            "lessonTitle": "Correlation and Simple Linear Regression",
            "lessonNum": 14,
            "released": false
          },
          {
            "lessonId": "lesson-15",
            "lessonTitle": "Statistics in Genetics, Ecology, and Dose–Response Studies",
            "lessonNum": 15,
            "released": false
          },
          {
            "lessonId": "lesson-16",
            "lessonTitle": "Logistic Regression and Introduction to Survival Analysis",
            "lessonNum": 16,
            "released": false
          }
        ]
      }
    ]
  },
  {
    "courseId": "mas204a",
    "courseCode": "MAS204A",
    "courseNumber": "MAS 204a",
    "courseName": "Statistical Analysis II",
    "courseDescription": "Introductory regression analysis — correlation, simple and multiple linear regression, diagnostics, and model building.",
    "chapters": [
      {
        "chapterId": "01",
        "chapterTitle": "Orientation and Correlation",
        "lessons": [
          {
            "lessonId": "lesson-01",
            "lessonTitle": "Welcome to MAS 204a — Course Orientation and Introduction to Regression Analysis",
            "lessonNum": 1,
            "released": false
          },
          {
            "lessonId": "lesson-02",
            "lessonTitle": "Correlation Analysis",
            "lessonNum": 2,
            "released": false
          }
        ]
      },
      {
        "chapterId": "02",
        "chapterTitle": "Simple Linear Regression: Model, Least Squares, Fit",
        "lessons": [
          {
            "lessonId": "lesson-03",
            "lessonTitle": "Simple Linear Regression I: The Model and Least Squares Estimation",
            "lessonNum": 3,
            "released": false
          },
          {
            "lessonId": "lesson-04",
            "lessonTitle": "Simple Linear Regression II: Variation and Goodness of Fit",
            "lessonNum": 4,
            "released": false
          }
        ]
      },
      {
        "chapterId": "03",
        "chapterTitle": "Simple Linear Regression: Inference, Diagnostics, Unusual Observations, Application",
        "lessons": [
          {
            "lessonId": "lesson-05",
            "lessonTitle": "Simple Linear Regression III: Inference",
            "lessonNum": 5,
            "released": false
          },
          {
            "lessonId": "lesson-06",
            "lessonTitle": "Simple Linear Regression IV: Model Assumptions and Residual Analysis",
            "lessonNum": 6,
            "released": false
          },
          {
            "lessonId": "lesson-07",
            "lessonTitle": "Simple Linear Regression V: Unusual Observations and Transformations",
            "lessonNum": 7,
            "released": false
          },
          {
            "lessonId": "lesson-08",
            "lessonTitle": "Simple Linear Regression VI: Applications and Review",
            "lessonNum": 8,
            "released": false
          }
        ]
      },
      {
        "chapterId": "04",
        "chapterTitle": "Multiple Linear Regression",
        "lessons": [
          {
            "lessonId": "lesson-09",
            "lessonTitle": "Multiple Linear Regression I: The Model and Estimation",
            "lessonNum": 9,
            "released": false
          },
          {
            "lessonId": "lesson-10",
            "lessonTitle": "Multiple Linear Regression II: Inference",
            "lessonNum": 10,
            "released": false
          },
          {
            "lessonId": "lesson-11",
            "lessonTitle": "Multiple Linear Regression III: Diagnostics",
            "lessonNum": 11,
            "released": false
          }
        ]
      },
      {
        "chapterId": "05",
        "chapterTitle": "Categorical Predictors, Interaction, and Model Building",
        "lessons": [
          {
            "lessonId": "lesson-12",
            "lessonTitle": "Categorical Predictors and Interaction",
            "lessonNum": 12,
            "released": false
          },
          {
            "lessonId": "lesson-13",
            "lessonTitle": "Model Building I: Variable Selection Criteria",
            "lessonNum": 13,
            "released": false
          },
          {
            "lessonId": "lesson-14",
            "lessonTitle": "Model Building II: Selection Procedures and Model Validation",
            "lessonNum": 14,
            "released": false
          }
        ]
      },
      {
        "chapterId": "06",
        "chapterTitle": "Advanced Topics",
        "lessons": [
          {
            "lessonId": "lesson-15",
            "lessonTitle": "Applied Regression Analysis: Advanced Topics and Tips",
            "lessonNum": 15,
            "released": false
          }
        ]
      }
    ]
  },
  {
    "courseId": "mas308",
    "courseCode": "MAS308",
    "courseNumber": "MAS 308",
    "courseName": "Categorical Data Analysis",
    "courseDescription": "Methods for categorical and count data — contingency tables, generalized linear, loglinear, logistic, and Poisson regression models.",
    "chapters": [
      {
        "chapterId": "01",
        "chapterTitle": "Orientation and Foundations",
        "lessons": [
          {
            "lessonId": "lesson-01",
            "lessonTitle": "Welcome to MAS 308 — Course Orientation and Introduction to Categorical Data Analysis",
            "lessonNum": 1,
            "released": false
          },
          {
            "lessonId": "lesson-02",
            "lessonTitle": "Probability Distributions for Categorical and Count Data",
            "lessonNum": 2,
            "released": false
          },
          {
            "lessonId": "lesson-03",
            "lessonTitle": "Statistical Inference for Proportions",
            "lessonNum": 3,
            "released": false
          }
        ]
      },
      {
        "chapterId": "02",
        "chapterTitle": "Contingency Tables and Association",
        "lessons": [
          {
            "lessonId": "lesson-04",
            "lessonTitle": "Contingency Tables I: Notation and Probability Structure",
            "lessonNum": 4,
            "released": false
          },
          {
            "lessonId": "lesson-05",
            "lessonTitle": "Contingency Tables II: Comparing Proportions, Relative Risk, and Odds Ratio",
            "lessonNum": 5,
            "released": false
          }
        ]
      },
      {
        "chapterId": "03",
        "chapterTitle": "Inference for Two-Way Tables",
        "lessons": [
          {
            "lessonId": "lesson-06",
            "lessonTitle": "Confidence Intervals and the Chi-Squared Test of Independence",
            "lessonNum": 6,
            "released": false
          },
          {
            "lessonId": "lesson-07",
            "lessonTitle": "Residuals and Fisher's Exact Test",
            "lessonNum": 7,
            "released": false
          }
        ]
      },
      {
        "chapterId": "04",
        "chapterTitle": "Three-Way Tables",
        "lessons": [
          {
            "lessonId": "lesson-08",
            "lessonTitle": "Association in Three-Way Tables",
            "lessonNum": 8,
            "released": false
          }
        ]
      },
      {
        "chapterId": "05",
        "chapterTitle": "Generalized Linear Models",
        "lessons": [
          {
            "lessonId": "lesson-09",
            "lessonTitle": "Generalized Linear Models I: Components and Binary Response Models",
            "lessonNum": 9,
            "released": false
          },
          {
            "lessonId": "lesson-10",
            "lessonTitle": "Generalized Linear Models II: Count Data, Inference, and Model Checking",
            "lessonNum": 10,
            "released": false
          }
        ]
      },
      {
        "chapterId": "06",
        "chapterTitle": "Loglinear Models",
        "lessons": [
          {
            "lessonId": "lesson-11",
            "lessonTitle": "Loglinear Models I: Two-Way Tables",
            "lessonNum": 11,
            "released": false
          },
          {
            "lessonId": "lesson-12",
            "lessonTitle": "Loglinear Models II: Three-Way Tables and Model Selection",
            "lessonNum": 12,
            "released": false
          }
        ]
      },
      {
        "chapterId": "07",
        "chapterTitle": "Logistic Regression",
        "lessons": [
          {
            "lessonId": "lesson-13",
            "lessonTitle": "Logistic Regression I: The Model and Its Interpretation",
            "lessonNum": 13,
            "released": false
          },
          {
            "lessonId": "lesson-14",
            "lessonTitle": "Logistic Regression II: Model Building, Fit, and Diagnostics",
            "lessonNum": 14,
            "released": false
          }
        ]
      },
      {
        "chapterId": "08",
        "chapterTitle": "Count Data Regression",
        "lessons": [
          {
            "lessonId": "lesson-15",
            "lessonTitle": "Regression for Count Data and Applied Categorical Data Analysis",
            "lessonNum": 15,
            "released": false
          }
        ]
      }
    ]
  }
];

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
