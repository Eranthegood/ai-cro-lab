// Portes mesurables du gauntlet : AA, 1440x900, cibles 44px, focus, clavier.
const CIBLE = process.argv[2] || require('path').resolve(__dirname, '../tower-revue-constats.html');
const SORTIE = process.env.SORTIE || require('path').resolve(__dirname, 'captures');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

const OUT = SORTIE;
const fs = require('fs');
fs.mkdirSync(OUT, { recursive: true });

const STATES = ['vide','encours','recurrent','bruit','exporte','interrompu'];

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', e => errors.push('JS: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.goto('file://' + CIBLE);

  const report = { errors, states: {} };

  await page.addScriptTag({ content: `
  window.__lum = function(c){
    const m = c.match(/[\\d.]+/g).map(Number);
    const f = v => { v/=255; return v<=0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055,2.4); };
    return 0.2126*f(m[0])+0.7152*f(m[1])+0.0722*f(m[2]);
  };
  window.__bg = function(el){
    let n = el;
    while(n && n !== document.documentElement){
      const c = getComputedStyle(n).backgroundColor;
      const m = c.match(/[\\d.]+/g);
      if(m && (m.length<4 || Number(m[3])>0.9)) return c;
      n = n.parentElement;
    }
    return getComputedStyle(document.body).backgroundColor;
  };
  window.__audit = function(){
    const out = { contrast: [], targets: [], hscroll: null, focusables: 0, noFocusRing: [] };
    out.hscroll = document.documentElement.scrollWidth - document.documentElement.clientWidth;
    // contraste texte
    document.querySelectorAll('body *').forEach(el => {
      if(!el.offsetParent && el.tagName !== 'BODY') return;
      const txt = Array.from(el.childNodes).filter(n=>n.nodeType===3 && n.textContent.trim()).map(n=>n.textContent.trim()).join(' ');
      if(!txt) return;
      const cs = getComputedStyle(el);
      if(cs.visibility==='hidden'||cs.opacity==='0') return;
      const fg = __lum(cs.color), bg = __lum(__bg(el));
      const ratio = (Math.max(fg,bg)+0.05)/(Math.min(fg,bg)+0.05);
      const size = parseFloat(cs.fontSize), bold = parseInt(cs.fontWeight,10)>=700;
      const large = size>=24 || (size>=18.66 && bold);
      const need = large ? 3 : 4.5;
      if(ratio < need) out.contrast.push({ sel: el.className||el.tagName, txt: txt.slice(0,48), ratio:+ratio.toFixed(2), need, size });
    });
    // cibles
    document.querySelectorAll('button, a[href], [role=option]').forEach(el => {
      const r = el.getBoundingClientRect();
      if(r.width===0 && r.height===0) return;
      if(el.closest('.states')) return; // sélecteur de maquette, hors produit
      if(r.height < 44) out.targets.push({ sel: el.className||el.tagName, txt:(el.textContent||'').trim().slice(0,32), h:+r.height.toFixed(1), w:+r.width.toFixed(1) });
    });
    return out;
  };
  `});

  await page.evaluate(() => applyTheme('dark'));
  for (const st of STATES) {
    await page.evaluate(s => setState(s), st);
    await page.waitForTimeout(120);
    const dark = await page.evaluate(() => __audit());
    await page.screenshot({ path: `${OUT}/${st}-dark.png` });
    await page.evaluate(() => applyTheme('light'));
    await page.waitForTimeout(80);
    const light = await page.evaluate(() => __audit());
    await page.screenshot({ path: `${OUT}/${st}-light.png` });
    await page.evaluate(() => applyTheme('dark'));
    report.states[st] = { dark, light };
  }

  // focus visible : tabuler et vérifier un box-shadow/outline
  await page.evaluate(() => setState('recurrent'));
  await page.waitForTimeout(100);
  const focus = [];
  for (let i = 0; i < 22; i++) {
    await page.keyboard.press('Tab');
    const info = await page.evaluate(() => {
      const a = document.activeElement;
      if (!a || a === document.body) return null;
      const cs = getComputedStyle(a);
      const has = (cs.boxShadow && cs.boxShadow !== 'none') || (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0);
      return { tag: a.tagName, cls: a.className, txt: (a.textContent||'').trim().slice(0,28), ring: has };
    });
    if (info) focus.push(info);
  }
  report.focus = { total: focus.length, missing: focus.filter(f => !f.ring) };

  // clavier : juger 30 constats
  await page.evaluate(() => setState('recurrent'));
  await page.waitForTimeout(100);
  let keys = 0;
  for (let i = 0; i < 40; i++) {
    const left = await page.evaluate(() => items.filter(f => f.statut === 'a_juger').length);
    if (left === 0) break;
    await page.keyboard.press(i % 3 === 0 ? 'b' : 'a');
    keys++;
  }
  report.keyboard = {
    keystrokesToClear: keys,
    remaining: await page.evaluate(() => items.filter(f => f.statut === 'a_juger').length),
    scrollAfter: await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  };
  await page.screenshot({ path: `${OUT}/cleared-dark.png` });

  // tablette
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.evaluate(() => setState('recurrent'));
  await page.waitForTimeout(150);
  report.tablet = await page.evaluate(() => __audit());
  await page.screenshot({ path: `${OUT}/tablet-dark.png` });
  await page.setViewportSize({ width: 820, height: 1180 });
  await page.waitForTimeout(150);
  report.narrow = await page.evaluate(() => __audit());
  await page.screenshot({ path: `${OUT}/narrow-dark.png` });

  console.log(JSON.stringify(report, null, 1));
  await browser.close();
})();
