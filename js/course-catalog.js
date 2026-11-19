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
 * RELEASE STATE is NOT stored here. At load time (see the footer below)
 * each lesson's `released` flag is set from window.RELEASED_LESSONS, which
 * js/releases.js defines — that small file is the only thing edited week
 * to week. Anything not listed there is a locked "Coming soon" lesson.
 *
 * WEEKLY PUBLISHING WORKFLOW: upload the lesson's Rise export into its
 * rise/ folder, then add the lesson ID (e.g. 'bst305-L01') to
 * js/releases.js on GitHub. No regeneration or zip needed.
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
            "lessonNum": 1
          },
          {
            "lessonId": "lesson-02",
            "lessonTitle": "Variables, Measurement Scales, Data Collection, Sampling, and Sample Size",
            "lessonNum": 2
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
            "lessonNum": 3
          },
          {
            "lessonId": "lesson-04",
            "lessonTitle": "Data Visualization and Presentation",
            "lessonNum": 4
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
            "lessonNum": 5
          },
          {
            "lessonId": "lesson-06",
            "lessonTitle": "Probability Essentials and Probability Distributions",
            "lessonNum": 6
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
            "lessonNum": 7
          },
          {
            "lessonId": "lesson-08",
            "lessonTitle": "Comparing Two Means — t-Tests",
            "lessonNum": 8
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
            "lessonNum": 9
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
            "lessonNum": 10
          },
          {
            "lessonId": "lesson-11",
            "lessonTitle": "Randomized Block and Repeated-Measures Designs",
            "lessonNum": 11
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
            "lessonNum": 12
          },
          {
            "lessonId": "lesson-13",
            "lessonTitle": "Categorical Data Analysis and Epidemiologic Measures of Association",
            "lessonNum": 13
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
            "lessonNum": 14
          },
          {
            "lessonId": "lesson-15",
            "lessonTitle": "Statistics in Genetics, Ecology, and Dose–Response Studies",
            "lessonNum": 15
          },
          {
            "lessonId": "lesson-16",
            "lessonTitle": "Logistic Regression and Introduction to Survival Analysis",
            "lessonNum": 16
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
            "lessonNum": 1
          },
          {
            "lessonId": "lesson-02",
            "lessonTitle": "Correlation Analysis",
            "lessonNum": 2
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
            "lessonNum": 3
          },
          {
            "lessonId": "lesson-04",
            "lessonTitle": "Simple Linear Regression II: Variation and Goodness of Fit",
            "lessonNum": 4
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
            "lessonNum": 5
          },
          {
            "lessonId": "lesson-06",
            "lessonTitle": "Simple Linear Regression IV: Model Assumptions and Residual Analysis",
            "lessonNum": 6
          },
          {
            "lessonId": "lesson-07",
            "lessonTitle": "Simple Linear Regression V: Unusual Observations and Transformations",
            "lessonNum": 7
          },
          {
            "lessonId": "lesson-08",
            "lessonTitle": "Simple Linear Regression VI: Applications and Review",
            "lessonNum": 8
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
            "lessonNum": 9
          },
          {
            "lessonId": "lesson-10",
            "lessonTitle": "Multiple Linear Regression II: Inference",
            "lessonNum": 10
          },
          {
            "lessonId": "lesson-11",
            "lessonTitle": "Multiple Linear Regression III: Diagnostics",
            "lessonNum": 11
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
            "lessonNum": 12
          },
          {
            "lessonId": "lesson-13",
            "lessonTitle": "Model Building I: Variable Selection Criteria",
            "lessonNum": 13
          },
          {
            "lessonId": "lesson-14",
            "lessonTitle": "Model Building II: Selection Procedures and Model Validation",
            "lessonNum": 14
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
            "lessonNum": 15
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
            "lessonNum": 1
          },
          {
            "lessonId": "lesson-02",
            "lessonTitle": "Probability Distributions for Categorical and Count Data",
            "lessonNum": 2
          },
          {
            "lessonId": "lesson-03",
            "lessonTitle": "Statistical Inference for Proportions",
            "lessonNum": 3
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
            "lessonNum": 4
          },
          {
            "lessonId": "lesson-05",
            "lessonTitle": "Contingency Tables II: Comparing Proportions, Relative Risk, and Odds Ratio",
            "lessonNum": 5
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
            "lessonNum": 6
          },
          {
            "lessonId": "lesson-07",
            "lessonTitle": "Residuals and Fisher's Exact Test",
            "lessonNum": 7
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
            "lessonNum": 8
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
            "lessonNum": 9
          },
          {
            "lessonId": "lesson-10",
            "lessonTitle": "Generalized Linear Models II: Count Data, Inference, and Model Checking",
            "lessonNum": 10
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
            "lessonNum": 11
          },
          {
            "lessonId": "lesson-12",
            "lessonTitle": "Loglinear Models II: Three-Way Tables and Model Selection",
            "lessonNum": 12
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
            "lessonNum": 13
          },
          {
            "lessonId": "lesson-14",
            "lessonTitle": "Logistic Regression II: Model Building, Fit, and Diagnostics",
            "lessonNum": 14
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
            "lessonNum": 15
          }
        ]
      }
    ]
  }
];

// Convenience derived data, computed once here so every page that loads
// this file (courses.html, the course-*.html detail pages, lesson-nav.js)
// shares identical totals instead of re-deriving them slightly differently.
// Layer the release state on. js/releases.js must be loaded BEFORE this file;
// if it is missing (or empty) every lesson is simply locked — the safe default.
(function () {
  var list = (typeof window !== 'undefined' && window.RELEASED_LESSONS) || [];
  var released = {};
  list.forEach(function (id) { released[String(id).trim()] = true; });
  CourseCatalog.forEach(function (course) {
    course.chapters.forEach(function (ch) {
      ch.lessons.forEach(function (l) {
        var n = l.lessonNum < 10 ? '0' + l.lessonNum : String(l.lessonNum);
        l.released = released[course.courseId + '-L' + n] === true;
      });
    });
  });
})();

CourseCatalog.forEach(function (course) {
  course.totalLessons = course.chapters.reduce(function (sum, ch) {
    return sum + ch.lessons.length;
  }, 0);
  course.releasedLessons = course.chapters.reduce(function (sum, ch) {
    return sum + ch.lessons.filter(function (l) { return l.released; }).length;
  }, 0);
});
