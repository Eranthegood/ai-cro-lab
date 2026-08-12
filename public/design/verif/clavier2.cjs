const CIBLE = process.argv[2] || require('path').resolve(__dirname, '../tower-revue-constats.html');
const SORTIE = process.env.SORTIE || require('path').resolve(__dirname, 'captures');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  const p=await b.newPage({viewport:{width:1440,height:900}});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://' + CIBLE);

  // parité clavier / interface : E ne doit rien faire sur un constat bruit
  await p.evaluate(()=>setState('bruit'));
  const av=await p.evaluate(()=>({id:current().id, statut:current().statut}));
  await p.keyboard.press('e');
  const ap2=await p.evaluate(id=>items.find(x=>x.id===id).statut, av.id);
  const t=await p.evaluate(()=>({txt:document.querySelector('#toast-text').textContent,
                                 ouvert:document.querySelector('#toast').dataset.open}));
  // « Voir » depuis la note de bruit
  await p.evaluate(()=>setState('recurrent'));
  await p.click('.queue__note button');
  const voir=await p.evaluate(()=>({id:current().id, statut:current().statut}));
  // 40 actions désordonnées
  for(const k of 'abjeukfabjuuesjkabuufeabjkuabjesfkuab'.split('')) await p.keyboard.press(k);
  const fin=await p.evaluate(()=>{
    const row=document.querySelector('.row[aria-selected="true"]'), cur=current();
    return {compteur:document.querySelector('#run-counts').textContent.trim(),
            verite:items.filter(f=>f.statut!=='a_juger').length+' jugés sur '+items.length,
            sync:(!row&&!cur)?'aucun des deux':!!(row&&cur&&row.dataset.id===cur.id)};
  });
  console.log(JSON.stringify({bruitAvant:av, statutApresE:ap2, toast:t, voir, fin},null,1));
  console.log('erreurs JS:', errs.length?errs:'aucune');
  await b.close();
})();
