// placeholder_smoke_test.js
// Guards the 2nd-semester rule: a lesson that is NOT released must be a
// locked "Coming soon" page that cannot log anything, and releasing a
// lesson must switch ONLY that lesson to the live, tracked wrapper.
// Run with plain Node (needs python3 on PATH for the generator step):
//   node dev-tests/placeholder_smoke_test.js

const fs = require('fs');
const os = require('os');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

const REPO = path.join(__dirname, '..');
const results = [];
function check(label, cond, detail) { results.push({ label, pass: !!cond, detail }); }

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}

// ---------- 1. Every lesson in the committed tree is a tracking-free placeholder ----------
{
  const lessonPages = walk(path.join(REPO, 'courses')).filter(f => /lesson-\d+[\\/]index\.html$/.test(f));
  const FORBIDDEN = ['tracking.js', 'api.js', 'rise-integration.js', '<iframe', 'simulate', 'markLessonComplete', 'postMessage', 'Finish Lesson'];
  const offenders = [];
  for (const f of lessonPages) {
    const html = fs.readFileSync(f, 'utf8');
    // ignore the explanatory comments: strip HTML comments before scanning
    const body = html.replace(/<!--[\s\S]*?-->/g, '');
    const hit = FORBIDDEN.filter(t => body.toLowerCase().includes(t.toLowerCase()));
    if (hit.length) offenders.push(path.relative(REPO, f) + ' -> ' + hit.join(','));
  }
  check('all 46 lesson wrapper pages exist', lessonPages.length === 46, `found ${lessonPages.length}`);
  check('NO placeholder wrapper loads tracking/api/rise scripts, an iframe, or any completion trigger', offenders.length === 0, offenders.slice(0, 5).join(' | '));

  const riseDirs = walk(path.join(REPO, 'courses')).filter(f => f.includes(`${path.sep}rise${path.sep}`));
  check('no rise/ folder (and so no simulate-completion page) exists for unreleased lessons', riseDirs.length === 0, riseDirs.slice(0, 3).join(', '));

  const catalogJs = fs.readFileSync(path.join(REPO, 'js', 'course-catalog.js'), 'utf8');
  check('course-catalog.js marks every lesson released:false', !/"released": true/.test(catalogJs) && (catalogJs.match(/"released": false/g) || []).length === 46, '');
  const anyActiveSimulate = ['index.html', 'courses.html', 'course-bst305.html', 'course-mas204a.html', 'course-mas308.html']
    .some(f => /Simulate lesson completion/i.test(fs.readFileSync(path.join(REPO, f), 'utf8')));
  check('no page anywhere offers a "Simulate lesson completion" button', !anyActiveSimulate, '');
}

// ---------- 2. Releasing ONE lesson flips only that lesson to the live, tracked wrapper ----------
{
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rel-'));
  fs.cpSync(REPO, tmp, { recursive: true });
  fs.rmSync(path.join(tmp, 'courses'), { recursive: true, force: true });
  const catPath = path.join(tmp, 'data', 'catalog.py');
  let cat = fs.readFileSync(catPath, 'utf8');
  const target = 'L("Data Visualization and Presentation")';
  check('test fixture: found the lesson to release in catalog.py', cat.includes(target), '');
  cat = cat.replace(target, 'L("Data Visualization and Presentation", released=True)');
  fs.writeFileSync(catPath, cat);
  const out = execFileSync('bash', ['generate_all.sh'], { cwd: tmp, encoding: 'utf8' });

  const live = fs.readFileSync(path.join(tmp, 'courses/bst305/chapter-02/lesson-04/index.html'), 'utf8');
  const other = fs.readFileSync(path.join(tmp, 'courses/bst305/chapter-02/lesson-03/index.html'), 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  check('released lesson gets the live wrapper (tracking.js, rise-integration.js, rise iframe)',
    live.includes('js/tracking.js') && live.includes('js/rise-integration.js') && live.includes('src="rise/index.html"'), '');
  check('a neighbouring unreleased lesson is still a tracking-free placeholder',
    !other.includes('tracking.js') && !other.includes('<iframe') && other.includes('Coming soon'), '');
  const stub = fs.readFileSync(path.join(tmp, 'courses/bst305/chapter-02/lesson-04/rise/index.html'), 'utf8');
  check('released-but-empty lesson gets a notice page with NO button and NO completion message',
    !/<button/i.test(stub) && !/postMessage/.test(stub) && /hasn't been uploaded/i.test(stub), '');
  check('generator warns when a released lesson has no Rise export yet', /WARNING: bst305 lesson 04 is released=True/.test(out), out.slice(-300));

  // a real export already in rise/ must never be overwritten
  fs.writeFileSync(path.join(tmp, 'courses/bst305/chapter-02/lesson-04/rise/index.html'), '<html>REAL RISE EXPORT</html>');
  execFileSync('bash', ['generate_all.sh'], { cwd: tmp, encoding: 'utf8' });
  check('re-running the generators never overwrites an existing Rise export',
    fs.readFileSync(path.join(tmp, 'courses/bst305/chapter-02/lesson-04/rise/index.html'), 'utf8').includes('REAL RISE EXPORT'), '');

  const seed = fs.readFileSync(path.join(tmp, 'apps-script/Code.gs'), 'utf8');
  check('Code.gs seed block is regenerated (46 lesson rows, 3 course rows)',
    (seed.match(/\["(bst305|mas204a|mas308)-L\d\d"/g) || []).length === 46 && /\["mas308", "Categorical Data Analysis"\]/.test(seed), '');
  fs.rmSync(tmp, { recursive: true, force: true });
}

// ---------- 3. lesson-nav.js: locked rows in the sidebar, Next/Prev skip unreleased lessons ----------
{
  function makeEl(tag) {
    const el = { tag, children: [], className: '', style: {}, attrs: {}, _text: '', href: undefined,
      appendChild(c) { this.children.push(c); return c; },
      setAttribute(k, v) { this.attrs[k] = v; },
      addEventListener() {},
      classList: { add(c) { el.className = (el.className + ' ' + c).trim(); }, toggle() {}, contains(c) { return el.className.split(/\s+/).includes(c); } },
      set textContent(v) { this._text = v; }, get textContent() { return this._text; },
      set innerHTML(v) { this._html = v; }, get innerHTML() { return this._html; } };
    return el;
  }
  const byId = { 'lesson-sidebar': makeEl('aside'), 'next-lesson-link': makeEl('a'), 'prev-lesson-link': makeEl('a'), 'sidebar-toggle-btn': makeEl('button') };
  let ready = null;
  const catalog = [{ courseId: 'bst305', courseCode: 'BST305', courseName: 'Biostatistics', chapters: [
    { chapterId: '01', chapterTitle: 'Foundations', lessons: [
      { lessonId: 'lesson-01', lessonTitle: 'One', lessonNum: 1, released: true },
      { lessonId: 'lesson-02', lessonTitle: 'Two (locked)', lessonNum: 2, released: false } ] },
    { chapterId: '02', chapterTitle: 'Next', lessons: [
      { lessonId: 'lesson-03', lessonTitle: 'Three', lessonNum: 3, released: true },
      { lessonId: 'lesson-04', lessonTitle: 'Four (locked)', lessonNum: 4, released: false } ] } ] }];

  function run(pathname) {
    Object.values(byId).forEach(e => { e.children = []; e._text = ''; });
    const sandbox = {
      window: { location: { pathname } },
      localStorage: { getItem: () => null, setItem() {} },
      document: { getElementById: id => byId[id] || null, createElement: makeEl, querySelector: () => null, addEventListener: (ev, fn) => { if (ev === 'DOMContentLoaded') ready = fn; } },
      Storage: { isLessonCompletedLocally: () => false },
      CourseCatalog: catalog, console
    };
    vm.createContext(sandbox);
    vm.runInContext(fs.readFileSync(path.join(REPO, 'js/lesson-nav.js'), 'utf8'), sandbox);
    ready();
    return byId;
  }

  const els = run('/courses/bst305/chapter-01/lesson-01/index.html');
  const next = els['next-lesson-link'];
  check('Next skips the locked lesson and goes to the next RELEASED one', /chapter-02\/lesson-03\/$/.test(next.href) && /Three/.test(next._text), `${next.href} ${next._text}`);
  check('first released lesson has no Previous link', els['prev-lesson-link'].style.display === 'none', JSON.stringify(els['prev-lesson-link'].style));

  const rows = [];
  (function collect(e) { (e.children || []).forEach(c => { if ((c.className || '').includes('sidebar-lesson-row')) rows.push(c); collect(c); }); })(els['lesson-sidebar']);
  const lockedRows = rows.filter(r => r.className.includes('locked'));
  const hasAnchor = r => r.children.some(c => c.tag === 'a');
  check('sidebar shows 4 lesson rows, 2 locked', rows.length === 4 && lockedRows.length === 2, `${rows.length} rows / ${lockedRows.length} locked`);
  check('locked sidebar rows have no link; released rows do', lockedRows.every(r => !hasAnchor(r)) && rows.filter(r => !r.className.includes('locked')).every(hasAnchor), '');

  const last = run('/courses/bst305/chapter-02/lesson-03/index.html');
  check('Previous from lesson 3 skips locked lesson 2 and goes back to lesson 1', /chapter-01\/lesson-01\/$/.test(last['prev-lesson-link'].href), last['prev-lesson-link'].href);
  check('last released lesson\'s Next goes back to the course page, not a locked lesson', /course-bst305\.html$/.test(last['next-lesson-link'].href), last['next-lesson-link'].href);
}

console.log('\n=== Placeholder / Release Smoke Test Results ===\n');
let allPass = true;
for (const r of results) {
  if (!r.pass) allPass = false;
  console.log(`[${r.pass ? 'PASS' : 'FAIL'}] ${r.label}${r.pass ? '' : '  -> ' + r.detail}`);
}
console.log(`\n${results.filter(r => r.pass).length}/${results.length} passed`);
process.exit(allPass ? 0 : 1);
