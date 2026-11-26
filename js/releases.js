/*
 * releases.js — WHICH LESSONS ARE UNLOCKED. This is the only file you edit
 * week to week.
 *
 * Every lesson is a locked "Coming soon" placeholder until its ID appears in
 * the list below. A locked lesson loads no tracking code and has no Rise
 * player, so it can never write anything to the Activity Log.
 *
 * WEEKLY STEPS (all in the GitHub web page):
 *   1. Upload the lesson's unzipped Rise 360 export into
 *        courses/<course>/chapter-NN/lesson-NN/rise/
 *      (rise/index.html must exist at the top of that folder).
 *   2. Come back here, click the pencil icon, add the lesson's ID to the
 *      list (keep the quotes and the comma), and Commit changes.
 *
 * ID format:  <course>-L<NN>   where NN is the lesson number, two digits.
 *   bst305-L01 ... bst305-L16     BST 305  Biostatistics
 *   mas204a-L01 ... mas204a-L15   MAS 204a Statistical Analysis II
 *   mas308-L01 ... mas308-L15     MAS 308  Categorical Data Analysis
 *
 * Example after unlocking the first two BST 305 lessons:
 *   window.RELEASED_LESSONS = [
 *     'bst305-L01',
 *     'bst305-L02',
 *   ];
 *
 * To lock a lesson again, delete its line. A browser may keep the old list
 * for up to ~10 minutes, so students can see a new unlock a few minutes late.
 */
window.RELEASED_LESSONS = [
  'bst305-L01',
  'mas204a-L01',
  'mas308-L01',
  'bst305-L02',
  'mas204a-L02',
  'bst305-L03',
];
