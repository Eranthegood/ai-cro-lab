// L'étiquette de zone ne doit recouvrir aucun texte de la page capturée.
const CIBLE = process.argv[2] || require('path').resolve(__dirname, '../tower-revue-constats.html');
const SORTIE = process.env.SORTIE || require('path').resolve(__dirname, 'captures');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  const p=await b.newPage({viewport:{width:1440,height:900}});
  await p.goto('file://' + CIBLE);
  const r=await p.evaluate(()=>{
    const tous=[].concat(F,LIVE,PARTIAL); const mauvais=[];
    const hote=document.createElement('div');
    hote.style.cssText='position:fixed;left:-9999px;top:0;width:900px';
    document.body.appendChild(hote);
    for(const f of tous){
      hote.innerHTML=renderShot(f,true);
      const svg=hote.querySelector('svg');
      const g=svg.querySelector('.dimmer');
      const etiq=g.querySelectorAll('rect')[1].getBBox();   // le cartouche blanc
      let chevauche=0;
      svg.querySelectorAll('text').forEach(t=>{
        if(g.contains(t)) return;
        const bb=t.getBBox();
        const ox=Math.min(etiq.x+etiq.width,bb.x+bb.width)-Math.max(etiq.x,bb.x);
        const oy=Math.min(etiq.y+etiq.height,bb.y+bb.height)-Math.max(etiq.y,bb.y);
        if(ox>1&&oy>1) chevauche+=ox*oy;
      });
      if(chevauche>0) mauvais.push({id:f.id, zone:f.zone, px2:Math.round(chevauche)});
    }
    hote.remove();
    return {total:tous.length, mauvais};
  });
  console.log(`captures : ${r.total} · étiquettes qui recouvrent du texte : ${r.mauvais.length}`);
  r.mauvais.slice(0,8).forEach(m=>console.log('  -',m.id,m.zone,m.px2+' px²'));
  await b.close();
})();
