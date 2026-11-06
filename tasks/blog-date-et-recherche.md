# Blog — date de parution et barre de recherche

Demande client du 2026-11-04.

## Fait

### Date de parution sur l'article
Le champ **Date de publication** existait déjà dans la collection Blog Posts et
il est rempli sur tous les articles vérifiés. Il manquait seulement à l'écran.

Ajouté sous le titre, dans `blog_article_heading_content` : un bloc texte lié au
champ, classe `blog_article_date` (majuscules, interlettrage, couleur atténuée,
tokens du site).

### Barre de recherche sur /blog
Champ posé en haut de la colonne de droite, au-dessus de la liste
(`blog_search_wrap` > form Webflow > input `form_main_field`), plus un message
`blog_search_empty` quand rien ne correspond.

Le filtrage est dans `global.js` : les articles sont déjà tous dans le DOM, on
masque ceux qui ne correspondent pas. Recherche sur le **titre et le résumé**,
insensible à la casse **et aux accents** (« evenement » trouve « événement »),
tous les mots saisis doivent correspondre.

Mesuré sur la page publiée, en injectant le champ à la main :
« team building » → 2 résultats, « evenement » → 10, « montpellier » → 18,
« zzzzz » → 0 avec le message, champ vidé → les 100 reviennent.

### Focus du champ (2026-11-05)
Webflow repasse le focus de ses inputs natifs en `#3898ec`. Ça ne touchait que ce
champ : les champs du formulaire de contact viennent d'un composant et n'ont pas
la classe `w-input`, donc jamais le bleu. Remplacé par la couleur du thème dans
`main.css` — un repère de focus reste visible, ce qui compte pour la navigation
au clavier. Vérifié au clic réel : les quatre bords passent en crème.

### Retour de résultats (2026-11-06)
Sous le champ : **« 44 résultats pour « paris » »**, avec le nombre et le terme
mis en avant, le singulier géré (« 1 résultat pour… »), le cas zéro
(« Aucun résultat pour… ») et une croix pour vider le champ — le composant
`Button Close` du site, pas une croix maison. Le résumé porte `role="status"` :
les lecteurs d'écran annoncent le nombre à chaque frappe.

**Traduction.** Aucune phrase n'est écrite dans le JavaScript. Les trois
formulations (« Aucun résultat pour », « résultat pour », « résultats pour »)
sont de vrais éléments de la page, donc traduisibles comme n'importe quel texte
Webflow ; le script ne pose que le nombre, le terme cherché et laquelle des trois
s'applique. C'est le point qui compte : une chaîne construite en JS échappe à
Weglot comme à la localisation Webflow.

Et l'index est **relu à chaque frappe** au lieu d'être mis en cache au
chargement : c'est le texte réellement affiché qui est cherché, donc la version
traduite si la page l'est.

**Weglot — ce qu'il faut savoir.** Le bloc `Weglot.initialize` est commenté dans
le pied de page, et il l'est aussi en production : ce n'est pas par là que Weglot
arrive. L'intégration Webflow de Weglot l'injecte **côté serveur**, et seulement
sur le domaine client — d'où son absence sur `ephemera-2025.webflow.io`.

Config lue sur `https://www.ephemera-group.com/en` :

- langues : **fr, en, nl, de**, en sous-répertoire (`/en`, `/nl`, `/de`) ;
- classe d'exclusion configurée : **`.weglot-exclude`** ;
- `excluded_paths` : **`START_WITH /blog`**.

⚠️ **Le blog est exclu de la traduction.** C'est pour ça que `/en/blog` redirige
vers `/blog`. La barre de recherche ne sera donc traduite dans aucune langue tant
que cette exclusion est en place — ce n'est pas une limite du code. Lever
l'exclusion revient à faire traduire les 136 articles, et Weglot facture au mot :
c'est un arbitrage budget, à remonter au client.

Le terme saisi et le compteur portent `weglot-exclude` : ce que tape le visiteur
ne doit jamais partir à la traduction.

Réserve : trois formulations couvrent le français et l'anglais. Une langue à plus
de deux formes de pluriel (polonais, russe…) demanderait un emplacement de plus.

Mesuré en ligne : « paris » → 44, « Montpellier » → 19, « evenement » → 10
(accents ignorés), « cadeaux » → 1 résultat au singulier, « zzzz » → aucun
résultat, champ vidé → les 100 reviennent. 1440 et 375, sans débordement.

## À faire — pour toi

**Format de la date** : Webflow n'expose pas le format d'affichage par API. Le
bloc sort aujourd'hui « May 6, 2026 ». À passer en français dans le Designer —
soit `01.11.2026` comme sur les cartes du blog, soit en toutes lettres. Même
geste que « OCTOBRE 2025 » sur la page événement.

## À signaler au client

La collection compte **136 articles, la page n'en affiche que 100**. C'est la
limite dure d'une Collection List Webflow sans pagination — ce n'est pas lié à la
recherche, c'était déjà le cas avant. Conséquence : 36 articles ne sont
atteignables que par leur URL directe, ni depuis le blog ni par la recherche, et
Google les voit comme orphelins.

Deux issues :
- **pagination** native Webflow : simple, mais la recherche ne porterait que sur
  la page courante ;
- **Finsweet CMS Load** : charge les pages suivantes dans le DOM, la recherche
  actuelle continue alors de fonctionner sur la totalité. C'est la solution que
  je recommande, à chiffrer.
