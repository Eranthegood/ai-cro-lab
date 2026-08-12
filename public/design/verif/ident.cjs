// Un identifiant ne doit désigner qu'un seul problème, et sa persistance
// déclarée doit correspondre aux runs où il apparaît réellement.
const CIBLE = process.argv[2] || require('path').resolve(__dirname, '../tower-revue-constats.html');
const SORTIE = process.env.SORTIE || require('path').resolve(__dirname, 'captures');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  const p=await b.newPage({viewport:{width:1440,height:900}});
  await p.goto('file://' + CIBLE);
  const r=await p.evaluate(()=>{
    const listes={13:F, 14:LIVE, 11:PARTIAL};
    const par={}; const pbs=[];
    for(const [run,l] of Object.entries(listes))
      for(const f of l) (par[f.id] = par[f.id]||[]).push({run:+run, f});
    for(const [id,occ] of Object.entries(par)){
      if(occ.length<2) continue;
      const zones=new Set(occ.map(o=>o.f.zone)), obs=new Set(occ.map(o=>o.f.obs));
      if(zones.size>1) pbs.push(`${id} : ${zones.size} zones différentes → ${[...zones].join(' / ')}`);
      if(obs.size>1) pbs.push(`${id} : ${obs.size} observations différentes sous un même identifiant`);
      const runsVus=occ.map(o=>o.run).sort((a,b)=>b-a);
      const dernier=occ.sort((a,b)=>b.run-a.run)[0].f;
      for(const rv of runsVus.slice(1))
        if(!dernier.runs.includes(rv))
          pbs.push(`${id} : apparaît au run ${rv} mais sa dernière version déclare runs:[${dernier.runs}]`);
    }
    return {partages:Object.values(par).filter(o=>o.length>1).length, pbs};
  });
  console.log(`identifiants partagés entre runs : ${r.partages} · incohérences : ${r.pbs.length}`);
  r.pbs.forEach(x=>console.log('  -',x));
  await b.close();
})();
