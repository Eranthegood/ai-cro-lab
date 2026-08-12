# Vérifications de la maquette de revue des constats

Huit contrôles automatiques sur `../tower-revue-constats.html`. Ils ont été
écrits au fil d'une boucle de critique : chacun correspond à un défaut réel
trouvé sur la maquette, et sert à empêcher qu'il revienne.

Prérequis : Node et Playwright (`/opt/node22/lib/node_modules/playwright`),
Chromium à `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`. Les scripts
sont en `.cjs` parce que le dépôt est en `"type": "module"`.

```sh
cd public/design/verif
node gate.cjs > rapport.json && node sum.cjs rapport.json   # portes mesurables
node preuve.cjs      # la capture porte ce que l'observation cite
node etiq.cjs        # l'étiquette de zone ne masque rien
node occl.cjs        # l'impact n'est jamais recouvert
node ident.cjs       # un identifiant ne désigne qu'un problème
node desync.cjs      # écran et geste désignent le même constat
node clavier2.cjs    # parité clavier / interface, compteurs
```

Chaque script accepte un chemin de cible en premier argument ; sans argument
il vise `../tower-revue-constats.html`. `gate.cjs` écrit ses captures dans
`captures/` (surchargeable par la variable d'environnement `SORTIE`).

## Ce que chaque contrôle vérifie, et pourquoi

| Script | Contrôle | Défaut qu'il empêche de revenir |
|---|---|---|
| `gate.cjs` + `sum.cjs` | Contraste AA sur chaque paire texte/fond, défilement horizontal, hauteur des cibles, anneau de focus, erreurs JS, frappes pour vider la file — sur 6 états × 2 thèmes, plus 1024 et 820 px | Contrastes cassés en thème clair, cibles sous 44 px, régressions de mise en page |
| `preuve.cjs` | Toute chaîne citée entre guillemets dans une observation apparaît dans la capture rendue pour ce constat | Une capture qui montre un autre produit, une autre étape de tunnel, ou un élément que l'observation dit absent |
| `etiq.cjs` | Le cartouche de zone ne recouvre aucun texte de la page capturée | L'étiquette masquant le nom du produit, le logo, ou l'élément même que le constat cite |
| `occl.cjs` | L'observation et l'impact ne sont jamais recouverts par la barre de jugement | Le contexte replié en tablette qui pousse l'impact sous les boutons |
| `ident.cjs` | Un identifiant ne porte qu'une zone et qu'une observation ; les runs déclarés sont ceux où le constat apparaît | Deux problèmes différents fusionnés sous un identifiant, une persistance invérifiable |
| `desync.cjs` | Pendant un run en direct, la ligne surlignée, la capture, l'observation et le geste désignent le même constat | Un ticket Linear créé sur un constat que l'utilisateur n'a pas lu |
| `clavier2.cjs` | Une touche n'agit jamais là où l'interface déclare l'action impossible ; les compteurs restent exacts après une série d'actions désordonnées | `E` exportant un constat classé bruit, un compteur qui dérive |

## Les quatre absences déclarées de `preuve.cjs`

Quand un constat dit « la page ne contient pas X », l'absence de X **est** le
constat. Ces quatre cas sont listés dans le script avec leur raison ; toute
autre absence fait échouer le contrôle.
