// Pendant un run en direct, l'écran et le geste doivent toujours désigner
// le même constat, y compris quand un arrivant réordonne la file.
const CIBLE = process.argv[2] || require('path').resolve(__dirname, '../tower-revue-constats.html');
const SORTIE = process.env.SORTIE || require('path').resolve(__dirname, 'captures');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  const p=await b.newPage({viewport:{width:1440,height:900}});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://' + CIBLE);
  await p.evaluate(()=>{applyTheme('dark');setState('encours')});
  let releves=0, desync=0;
  for(let t=0;t<80;t++){
    const r=await p.evaluate(()=>{
      const row=document.querySelector('.row[aria-selected="true"]');
      const cur=current();
      const url=document.querySelector('.evidence__url');
      const obs=document.querySelector('.obs');
      if(!row||!cur) return null;
      return {ligne:row.dataset.id, geste:cur.id,
              preuve: url ? url.textContent.trim().endsWith(cur.url) : true,
              texte: obs ? obs.textContent.trim().slice(0,40)===cur.obs.slice(0,40) : true};
    });
    if(r){ releves++; if(r.ligne!==r.geste || !r.preuve || !r.texte) desync++; }
    await p.waitForTimeout(300);
  }
  // et un jugement en pleine fenêtre d'arrivée
  await p.evaluate(()=>setState('encours'));
  await p.waitForTimeout(3100);
  const avant=await p.evaluate(()=>{
    const row=document.querySelector('.row[aria-selected="true"]');
    return {ligne:row&&row.dataset.id, panneau:current().id,
            obs:document.querySelector('.obs').textContent.trim().slice(0,50)};
  });
  await p.keyboard.press('e');
  const apres=await p.evaluate(()=>({toast:document.querySelector('#toast-text').textContent,
    exportes:items.filter(f=>f.statut==='exporte').map(f=>f.id)}));
  console.log(`relevés : ${releves} · désynchronisations : ${desync}`);
  console.log('jugement en pleine arrivée :', JSON.stringify({avant, apres}));
  console.log('erreurs JS :', errs.length?errs:'aucune');
  await b.close();
})();
