import { chromium } from '/tmp/pw/node_modules/playwright/index.mjs';
const base = 'http://127.0.0.1:8765/';
const b = await chromium.launch();
const errors = [];
async function page(vp, motion) {
  const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: vp.width < 500 ? 2 : 1, reducedMotion: motion ? 'no-preference' : 'reduce' });
  const p = await ctx.newPage(); p.on('pageerror', e => errors.push(String(e))); p.on('console', m => m.type() === 'error' && errors.push(m.text()));
  return { ctx, p };
}
const M = { width: 390, height: 844 }, D = { width: 1440, height: 900 };
// Above-fold (motion on, after intro)
for (const [f, vp, q] of [['mobile-390-fr-above-fold.png', M, 'lang=fr&p=49'], ['desktop-1440-fr-above-fold.png', D, 'lang=fr&p=49'], ['desktop-1440-en-above-fold.png', D, 'lang=en&p=99'], ['mobile-390-en-above-fold.png', M, 'lang=en&p=99']]) {
  const { ctx, p } = await page(vp, true); await p.goto(base + 'index.html?' + q, { waitUntil: 'networkidle' }); await p.waitForTimeout(1800);
  await p.screenshot({ path: 'screenshots/' + f }); await ctx.close();
}
// Full page (static, reduced motion = everything visible)
for (const [f, vp, q] of [['mobile-390-fr-full.png', M, 'index.html?lang=fr&p=49'], ['mobile-390-en-full.png', M, 'index.html?lang=en&p=99'], ['desktop-1440-fr-full.png', D, 'index.html?lang=fr&p=49'], ['mobile-390-privacy-fr.png', M, 'privacy.html?lang=fr']]) {
  const { ctx, p } = await page(vp, false); await p.goto(base + q, { waitUntil: 'networkidle' }); await p.waitForTimeout(400);
  await p.screenshot({ path: 'screenshots/' + f, fullPage: true }); await ctx.close();
}
// Scroll sequence (motion on)
for (const [prefix, vp, stops] of [['desktop', D, ['#hero:0', '#hero:450', '#hero:900', '#problem', '#how:600', '#preview', '#numbers']], ['mobile', M, ['#houseCard:-200', '#houseCard:250', '#timeline', '#preview:300', '#numbers:200', '#reserve']]]) {
  const { ctx, p } = await page(vp, true); await p.goto(base + 'index.html?lang=fr&p=49', { waitUntil: 'networkidle' }); await p.waitForTimeout(1600);
  let n = 1;
  for (const s of stops) {
    const [sel, off] = s.split(':');
    await p.evaluate(([sel, off]) => { const el = document.querySelector(sel); const st = window.ScrollTrigger && ScrollTrigger.getAll().find(t => t.pin === el);
      const top = st ? st.start : el.getBoundingClientRect().top + scrollY; window.scrollTo(0, top + Number(off || 0)); }, [sel, off]);
    await p.waitForTimeout(1500);
    await p.screenshot({ path: `screenshots/scroll-${prefix}-${n++}.png` });
  }
  await ctx.close();
}
// OG image
{ const ctx = await b.newContext({ viewport: { width: 1200, height: 630 } }); const p = await ctx.newPage(); await p.goto(base + 'tools/og-image.html', { waitUntil: 'networkidle' }); await p.screenshot({ path: 'og-image.png' }); await ctx.close(); }
// Behaviour checks
{ const { ctx, p } = await page(M, true); await p.goto(base + 'index.html?lang=en&p=99', { waitUntil: 'networkidle' });
  console.log('price:', await p.$$eval('#priceAmt,.priceAmt', e => e.map(x => x.textContent)));
  await p.click('#fq1'); console.log('faq open:', await p.getAttribute('#fq1', 'aria-expanded'), await p.isVisible('#fa1'));
  await p.fill('#email', 'x@example.org'); await p.check('#consent'); await p.click('#submitBtn'); console.log('form:', await p.textContent('#formStatusText'));
  await p.click('button[data-lang=fr]'); console.log('fr price:', await p.textContent('#priceAmt'));
  await ctx.close(); }
console.log('errors:', errors.length ? errors : 'none');
await b.close();
