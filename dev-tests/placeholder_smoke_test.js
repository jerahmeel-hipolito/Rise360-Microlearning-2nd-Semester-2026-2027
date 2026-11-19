// placeholder_smoke_test.js
// Guards the 2nd-semester rule: a lesson that is NOT listed in js/releases.js
// is a locked "Coming soon" page that cannot log anything, and listing its ID
// switches ONLY that lesson to the live, tracked page.
// Sections 1 and 3 run with plain Node. Section 2 drives a real browser and
// needs Playwright (skipped, loudly, if it isn't installed):
//   node dev-tests/placeholder_smoke_test.js

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const http = require('http');

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

// ---------- 1. Static: structure of the generated tree ----------
{
  const pages = walk(path.join(REPO, 'courses')).filter(f => /lesson-\d+[\\/]index\.html$/.test(f));
  check('all 46 lesson wrapper pages exist', pages.length === 46, `found ${pages.length}`);

  const badId = [];
  const staticTracking = [];
  for (const f of pages) {
    const html = fs.readFileSync(f, 'utf8');
    const m = f.match(/courses[\\/]([a-z0-9]+)[\\/]chapter-\d+[\\/]lesson-(\d+)/);
    const want = `${m[1]}-L${m[2]}`;
    if (!html.includes(`var LESSON_ID = '${want}';`)) badId.push(path.relative(REPO, f));
    // tracking scripts may appear ONLY inside the document.write gate, never as normal <script src> tags
    // strip comments AND inline <script> bodies (the release gate's document.write string lives there)
    const markup = html.replace(/<!--[\s\S]*?-->/g, '').replace(/<script>[\s\S]*?<\/script>/g, '');
    if (/<script[^>]+src="[^"]*(tracking|api|rise-integration)\.js"/.test(markup)) staticTracking.push(path.relative(REPO, f));
    if (/<iframe[^>]+\ssrc=/.test(html)) staticTracking.push(path.relative(REPO, f) + ' (iframe has src)');
  }
  check("every wrapper's embedded LESSON_ID matches its own folder (e.g. chapter-02/lesson-04 -> bst305-L04)", badId.length === 0, badId.slice(0, 3).join(', '));
  check('no wrapper loads tracking/api/rise-integration via a normal script tag, or gives the iframe a src up front', staticTracking.length === 0, staticTracking.slice(0, 3).join(', '));
  check('no rise/ folders exist in the shipped tree (nothing for a student to open or "simulate")', walk(path.join(REPO, 'courses')).every(f => !f.includes(`${path.sep}rise${path.sep}`)), '');

  const rel = fs.readFileSync(path.join(REPO, 'js/releases.js'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const ctx = { window: {} }; vm.createContext(ctx); vm.runInContext(rel, ctx);
  check('shipped js/releases.js unlocks nothing', Array.isArray(ctx.window.RELEASED_LESSONS) && ctx.window.RELEASED_LESSONS.length === 0, JSON.stringify(ctx.window.RELEASED_LESSONS));
  const anySimulate = ['index.html', 'courses.html', 'course-bst305.html', 'course-mas204a.html', 'course-mas308.html', 'js/lesson-nav.js']
    .some(f => /Simulate lesson completion/i.test(fs.readFileSync(path.join(REPO, f), 'utf8')));
  check('no page offers a "Simulate lesson completion" button', !anySimulate, '');

  const seed = fs.readFileSync(path.join(REPO, 'apps-script/Code.gs'), 'utf8');
  check('Code.gs seed block has 46 lesson rows and the 3 courses',
    (seed.match(/\["(bst305|mas204a|mas308)-L\d\d"/g) || []).length === 46 && /\["mas308", "Categorical Data Analysis"\]/.test(seed), '');
}

// ---------- 2. Real browser: locked vs unlocked behaviour ----------
async function browserSection() {
  let chromium;
  try { ({ chromium } = require('playwright')); } catch (e) { console.log('SKIPPED browser section (playwright not installed)'); return; }

  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p.endsWith('/')) p += 'index.html';
    const f = path.join(REPO, p);
    if (!f.startsWith(REPO) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end('nf'); return; }
    const ext = path.extname(f);
    res.writeHead(200, { 'Content-Type': { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css' }[ext] || 'application/octet-stream' });
    res.end(fs.readFileSync(f));
  });
  await new Promise(r => server.listen(0, r));
  const base = `http://localhost:${server.address().port}`;
  const browser = await chromium.launch();

  async function open(url, releases) {
    const ctx = await browser.newContext();
    await ctx.addInitScript(() => { try { localStorage.setItem('studentId', '2025-000123'); } catch (e) {} });
    const page = await ctx.newPage();
    const log = { urls: [], posts: [] };
    page.on('request', r => { log.urls.push(r.url()); if (r.method() === 'POST') log.posts.push(r.postData() || ''); });
    await page.route('**/js/releases.js', route => route.fulfill({ contentType: 'application/javascript', body: `window.RELEASED_LESSONS = ${JSON.stringify(releases)};` }));
    await page.route('**/rise/index.html', route => route.fulfill({ contentType: 'text/html', body: '<html><body>fake rise</body></html>' }));
    await page.goto(base + url); await page.waitForTimeout(500);
    return { page, log, ctx };
  }
  const has = (log, name) => log.urls.some(u => u.includes(name));
  const LESSON = '/courses/bst305/chapter-01/lesson-01/';

  // 2a. locked lesson
  {
    const { page, log, ctx } = await open(LESSON, []);
    check('LOCKED: "Coming soon" panel visible, live frame hidden',
      await page.locator('#lesson-locked').isVisible() && !(await page.locator('#lesson-live').isVisible()), '');
    check('LOCKED: tracking.js, api.js and rise-integration.js are never even requested',
      !has(log, 'tracking.js') && !has(log, 'api.js') && !has(log, 'rise-integration.js'), log.urls.filter(u => /tracking|api|rise/.test(u)).join(' '));
    check('LOCKED: no Rise export is requested', !has(log, '/rise/'), '');
    check('LOCKED: window.markLessonComplete does not exist', await page.evaluate(() => typeof window.markLessonComplete === 'undefined'), '');
    await page.evaluate(() => window.postMessage({ type: 'complete' }, '*'));
    await page.evaluate(() => window.dispatchEvent(new Event('pagehide')));
    await page.waitForTimeout(400);
    check('LOCKED: a forged completion message and a page-leave send NOTHING to the backend', log.posts.length === 0, JSON.stringify(log.posts));
    await ctx.close();
  }

  // 2b. unlocked lesson
  {
    const { page, log, ctx } = await open(LESSON, ['bst305-L01']);
    check('UNLOCKED: live frame visible, locked panel hidden',
      await page.locator('#lesson-live').isVisible() && !(await page.locator('#lesson-locked').isVisible()), '');
    check('UNLOCKED: Rise export is requested and tracking scripts load in order',
      has(log, '/rise/index.html') && has(log, 'tracking.js') && has(log, 'rise-integration.js'), '');
    await page.evaluate(() => window.postMessage({ type: 'complete' }, '*'));
    await page.waitForTimeout(500);
    const completed = log.posts.map(p => { try { return JSON.parse(p); } catch (e) { return {}; } })
      .find(p => p.status === 'Completed');
    check('UNLOCKED: a completion message logs a Completed record with the right composite IDs',
      completed && completed.lessonId === 'bst305-L01' && completed.courseId === 'bst305' && completed.studentId === '2025-000123', JSON.stringify(log.posts).slice(0, 300));
    await ctx.close();
  }

  // 2c. a DIFFERENT lesson stays locked when only L01 is unlocked
  {
    const { page, log, ctx } = await open('/courses/bst305/chapter-01/lesson-02/', ['bst305-L01']);
    check('only listed lessons unlock: L02 stays locked when only L01 is listed',
      await page.locator('#lesson-locked').isVisible() && !has(log, 'tracking.js'), '');
    await ctx.close();
  }

  // 2d. course page: released row is a link; others locked; progress counts released lessons only
  {
    const { page, ctx } = await open('/course-bst305.html', ['bst305-L01']);
    await page.evaluate(() => document.querySelectorAll('details').forEach(d => { d.open = true; }));
    const links = await page.locator('.lesson-row a').count();
    const locked = await page.locator('.lesson-row-locked').count();
    const label = (await page.locator('#progress-label').innerText()).replace(/\s+/g, ' ');
    check('course page: 1 clickable lesson, 15 locked rows when only L01 is listed', links === 1 && locked === 15, `${links} links / ${locked} locked`);
    check('course page: progress label counts released lessons only', /0 of 1 released lesson completed/.test(label), label);
    await ctx.close();
  }
  {
    const { page, ctx } = await open('/course-bst305.html', []);
    const label = (await page.locator('#progress-label').innerText()).replace(/\s+/g, ' ');
    check('course page: with nothing released it says so', /No lessons released yet/.test(label), label);
    await ctx.close();
  }

  await browser.close(); server.close();
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

(async () => {
  await browserSection();
  console.log('\n=== Placeholder / Release Smoke Test Results ===\n');
let allPass = true;
for (const r of results) {
  if (!r.pass) allPass = false;
  console.log(`[${r.pass ? 'PASS' : 'FAIL'}] ${r.label}${r.pass ? '' : '  -> ' + r.detail}`);
}
console.log(`\n${results.filter(r => r.pass).length}/${results.length} passed`);
process.exit(allPass ? 0 : 1);
})();
