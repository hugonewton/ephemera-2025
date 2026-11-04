# Matrice de couverture — page événement `/events/<slug>`

Run du **2026-11-03**, sur la page réellement publiée :
https://ephemera-2025.webflow.io/events/demo-byoma-stellar
Mesures : lecture du DOM rendu + styles calculés dans un navigateur réel à 1280x900 puis 390x844,
clics DOM réels sur les déclencheurs, lecture console et réseau. Aucun chiffre cité de mémoire.

## A. Registre des sections (10 dessinées, 10 codées)

| # | classe | Codée | Assertion | Résultat |
|---|---|---|---|---|
| 1 | `event_hero_wrap` | oui | hauteur, cover contenue, H1 lié, 2 CTA | **PASS** — 1280x620 (Figma 620), cover 1280x620 contenue, H1 = « Byoma : lancement de marque… » depuis le CMS, 2 CTA |
| 2 | `event_meta_wrap` | oui | 5 paires, valeurs liées | **PASS partiel** — 5 paires ; Convives/Format/Date liés, Restaurant + Type en statique (trou T2/T3) |
| 3 | `event_brief_wrap` | oui | 2 colonnes, corps RichText lié | **PASS** — 2 colonnes 397/804 (ratio 349/707 respecté), 2 paragraphes depuis le CMS |
| 4 | `event_gallery_wrap` | oui | 1 visuel large + 3 colonnes | **PASS structure / FAIL contenu** — feature 1193x504, grille 382x3, 6 tuiles ; images vides (trou T1) |
| 5 | `event_delivery_wrap` | oui | chiffres à GAUCHE, prestations à DROITE | **PASS** — ordre conforme au Figma, 4 KPI liés, 5 puces depuis le CMS |
| 6 | `event_verbatim_wrap` | oui | crème, citation + auteur liés | **PASS** — fond rgb(247,233,212), texte rgb(19,16,13), citation et auteur depuis le CMS |
| 7 | `event_specs_wrap` | oui | 7 lignes, specs gauche / carte droite | **PASS partiel** — 7 lignes, colonnes 624/523 ; 5 valeurs sur 7 non liées (trou T4) |
| 8 | `event_devis_wrap` | oui | crème, 3 réassurances, CTA | **PASS** — fond crème, 3 items + 3 SVG check, CTA avec `data-resa` |
| 9 | `event_faq_wrap` | oui | 2 colonnes, Accordion List posée | **PASS partiel** — 2 colonnes 368/779, Accordion List en place, 0 item (trou T5) |
| 10 | `event_related_wrap` | oui | Collection List 3 items | **FAIL** — liste compilée vide (trou T6) |

## B. Cas fonctionnels

| # | Cas | Résultat |
|---|---|---|
| F1 | Clic « Demander un devis » → pop-up | **PASS** — avant : wrap `display:none`, `opacity:0`, iframe `src` vide. Après clic : `display:block`, `opacity:1`, `src = https://agora.ephemera-group.com/demande` |
| F2 | Fermeture → `src` remis à vide | **PASS** — `display:none`, `opacity:0`, `src` vide |
| F3 | Titre d'onglet depuis le CMS | **PASS** — « Lancement de produit 20 personnes au Stellar — Ephemera », pas « Ephemera 2025 » |
| F4 | Valeurs relues après rechargement | **PASS** — 4 navigations successives, mêmes valeurs. (Note : la page n'a aucun champ saisissable, la règle « affiché/accepté/relu » se réduit à « affiché/relu ») |
| F5 | Aucun texte de gabarit | **PASS** — ni « Lorem ipsum », ni « Button Text », ni « Heading 1 » |
| F6 | Pas de débordement horizontal | **PASS** — `scrollWidth - clientWidth = 0` à 1280 **et** à 390 |
| F7 | Mobile 390 | **PASS** — brief/delivery/specs/faq en 1 colonne (354px), caractéristiques en 2 colonnes (164,75px), KPI en 2x2 (170,125px), hero 620 |
| F8 | Bloc pop-up présent | **PASS** — `.iframe_resa_wrap` dans le DOM via le composant `iframe_resa` |
| F9 | Cartes « autres événements » | **NON TESTABLE** — liste vide (trou T6) |
| F10 | Console | **PRÉEXISTANT, pas imputable** — les erreurs et avertissements GSAP portent tous sur le menu mobile (`.burger_line`, `.nav_menu_wrap`, `.nav_menu_overlay`), éléments du composant `nav_custom`, pas sur la page. À confirmer sur une page restaurant avant de conclure. |

## C. Trous déclarés

Tous de la même famille sauf T5/T6 : **l'API Webflow refuse tout binding qui traverse une Référence,
et ne sait ni sourcer une Collection List sur un champ multi-images ni insérer dans un slot de composant.**

| | Trou | Message exact | Remédiation Designer |
|---|---|---|---|
| T1 | Galerie non liée | `Incompatible binding: CMS field … cannot bind to target` (MultiImage → Image) | sourcer une Collection List sur « Photos de l'event » |
| T2 | Nom du restaurant | `CMS field not found` | lier au champ Restaurant → Nom |
| T3 | Type d'événement | `Incompatible binding` (multi-référence → texte) | Collection List imbriquée |
| T4 | Jauges, surface, équipements, adresse, accès + image et logo de la carte « Le lieu » | idem T2 | 7 bindings via la Référence Restaurant |
| T5 | 6 items de FAQ | `Cannot insert relative to a component instance` | dupliquer l'Accordion Item 6 fois |
| T6 | Collection List « autres événements » | source et tri bien enregistrés (`get_settings` le confirme) mais le HTML compilé ne contient ni `w-dyn-items` ni template d'item | recréer/rebinder la liste dans le Designer |
| T7 | Format de date | aucune clé de format exposée par l'API | choisir « Octobre 2025 » sur l'élément lié |
| T8 | Lien « Voir le restaurant » | `Incompatible binding` (Référence → prop link) | Link → Restaurant → page |

## D. Écarts Figma / design system — arbitrage Hugo

| Écart | Figma | Système du site | Choix retenu |
|---|---|---|---|
| Taille H1 | 64 px | `font-size/h1` ≈ 74 px à 1280 | token du site (validé par Hugo) |
| Casse H1 | casse normale | `u-text-style-h1` applique `text-transform: uppercase` | token du site → **le H1 sort en majuscules**, à trancher |
| Marge de conteneur | 72 px | `--site--margin` ≈ 43 px à 1280 (conteneur 1193) | token du site |
| Rayon des cartes | 4 px | `--radius--small` = 8 px | token du site |

## E. Blocage rencontré en fin de run

Les écritures au niveau **élément** sont refusées depuis la fin de session :
`MPS rejected update … [Conflict] The operation could not be applied to the component map`.
Les écritures de **style** passent toujours. Conséquence : la section « autres événements »
n'a pas pu être masquée et affiche l'état vide de Webflow. Un rafraîchissement du Designer
devrait lever le conflit.
