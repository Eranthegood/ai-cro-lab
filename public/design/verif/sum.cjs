const r = JSON.parse(require('fs').readFileSync(process.argv[2],'utf8'));
const line=[];
line.push('ERREURS JS: '+(r.errors.length?JSON.stringify(r.errors):'aucune'));
for(const [k,v] of Object.entries(r.states)){
  for(const th of ['dark','light']){
    const a=v[th];
    line.push(`${k}/${th}  hscroll=${a.hscroll}  contraste=${a.contrast.length}  cibles<44=${a.targets.length}`
      + (a.contrast.length? '\n   '+a.contrast.map(c=>`${c.sel} "${c.txt}" ${c.ratio}<${c.need}`).join('\n   '):'')
      + (a.targets.length? '\n   '+a.targets.map(t=>`${t.sel} "${t.txt}" h=${t.h}`).join('\n   '):''));
  }
}
line.push('FOCUS: '+r.focus.total+' éléments tabulés, sans anneau: '+(r.focus.missing.length?JSON.stringify(r.focus.missing):'0'));
line.push('CLAVIER: '+r.keyboard.keystrokesToClear+' touches pour vider la file, reste='+r.keyboard.remaining+', hscroll='+r.keyboard.scrollAfter);
line.push('TABLETTE 1024: hscroll='+r.tablet.hscroll+' contraste='+r.tablet.contrast.length+' cibles='+r.tablet.targets.length);
line.push('ÉTROIT 820:   hscroll='+r.narrow.hscroll+' contraste='+r.narrow.contrast.length+' cibles='+r.narrow.targets.length);
console.log(line.join('\n'));
