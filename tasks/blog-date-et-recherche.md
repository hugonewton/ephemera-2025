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

## À faire — pour toi

1. **Publier** le site (le garde-fou de Claude Code refuse `publish_site`).
2. **Format de la date** : Webflow n'expose pas le format d'affichage par API.
   Sur le nouveau bloc date, choisir un format en toutes lettres
   (« 6 novembre 2026 ») plutôt que le format anglais par défaut.
   Même geste que sur la page événement pour « OCTOBRE 2025 ».
3. Le **placeholder** du champ est posé par le JS faute d'écriture d'attribut en
   fin de session. Si tu le renseignes dans le Designer, c'est le tien qui gagne.

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
