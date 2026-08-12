// Garde-fou : toute chaîne citée entre « … » dans une observation doit
// apparaître dans le SVG rendu pour ce constat — sauf quand l'observation
// affirme justement son absence, cas déclarés ci-dessous avec leur raison.
const CIBLE = process.argv[2] || require('path').resolve(__dirname, '../tower-revue-constats.html');
const SORTIE = process.env.SORTIE || require('path').resolve(__dirname, 'captures');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

const ABSENCES_ATTENDUES = {
  'C-1243': {'épuisé': "la mention n'est visible qu'après ouverture de la fiche, pas sur la grille"},
  'C-1252': {'veste hardshell': "le terme est au catalogue, la page de résultats est vide — c'est le constat"},
  'C-1274': {'détails': "l'onglet est absent de cette fiche — c'est le constat"},
  'C-1211': {'veste alpine 3l': "il faut ouvrir le détail pour la lire — c'est le constat"}
};

(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  const p=await b.newPage({viewport:{width:1440,height:900}});
  await p.goto('file://' + CIBLE);
  const res = await p.evaluate(()=>{
    const tous = [].concat(F, LIVE, PARTIAL);
    // comparaison mot à mot : ni la ponctuation ni la découpe en éléments
    // <text> ne doivent produire un faux écart
    const norm = t => t.toLowerCase().replace(/[^a-zà-ÿ0-9]+/gi,' ').replace(/\s+/g,' ').trim();
    const out = [];
    for(const f of tous){
      // on ne compare qu'au texte réellement lisible sur la capture,
      // pas au balisage SVG qui l'entoure
      const brut = renderShot(f, true);
      const lisible = [...brut.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map(m=>m[1]).join(' ');
      const svg = norm(lisible);
      const cites = [...f.obs.matchAll(/«([^»]{2,70})»/g)].map(m=>m[1].replace(/[  ]/g,' ').trim());
      const absents = cites.filter(c => !svg.includes(norm(c)));
      const slug = (f.url.match(/\/produits\/([^?#]+)/)||[])[1];
      const bonProduit = !slug || svg.includes(norm(CATALOGUE[slug] ? CATALOGUE[slug].nom : 'inconnu'));
      if(absents.length || !bonProduit) out.push({id:f.id, url:f.url, absents, bonProduit});
    }
    return {total: tous.length, defauts: out};
  });
  let echecs = 0;
  for(const d of res.defauts){
    const dec = ABSENCES_ATTENDUES[d.id] || {};
    const inattendus = d.absents.filter(c => !Object.keys(dec).some(k => c.toLowerCase().includes(k)));
    if(inattendus.length || !d.bonProduit){
      echecs++;
      console.log(' ÉCHEC', d.id, d.url, JSON.stringify(inattendus), d.bonProduit?'':'(produit dessiné ≠ produit de l\'URL)');
    }
  }
  console.log(`constats vérifiés : ${res.total} · écarts inattendus : ${echecs} · absences déclarées : ${Object.keys(ABSENCES_ATTENDUES).length}`);
  await b.close();
  process.exit(echecs ? 1 : 0);
})();
