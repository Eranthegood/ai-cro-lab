// L'impact doit être visible en même temps que la capture, sans recouvrement.
const CIBLE = process.argv[2] || require('path').resolve(__dirname, '../tower-revue-constats.html');
const SORTIE = process.env.SORTIE || require('path').resolve(__dirname, 'captures');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  const bad=[];
  for(const vp of [{width:1440,height:900},{width:1024,height:768},{width:820,height:1180}]){
    const p=await b.newPage({viewport:vp});
    await p.goto('file://' + CIBLE);
    for(const th of ['dark','light']) for(const st of ['recurrent','bruit','exporte','interrompu','encours']){
      await p.evaluate(([t,s])=>{applyTheme(t);setState(s)},[th,st]);
      await p.waitForTimeout(80);
      const r=await p.evaluate(()=>{
        const im=document.querySelector('.impact'); if(!im) return null;
        const b=im.getBoundingClientRect();
        if(b.height===0) return null;
        const pts=[[b.left+8,b.top+4],[b.left+8,b.bottom-4]];
        return pts.map(([x,y])=>{const e=document.elementFromPoint(x,y);
          return e && (e===im||im.contains(e)) ? 'ok' : (e?e.className||e.tagName:'rien');});
      });
      if(r && r.some(v=>v!=='ok')) bad.push(`${vp.width}x${vp.height} ${th} ${st} → ${r.join(' | ')}`);
    }
    await p.close();
  }
  console.log(bad.length? bad.join('\n') : 'impact jamais recouvert : 30/30 combinaisons');
  await b.close();
})();
