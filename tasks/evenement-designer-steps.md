# Page événement — alignement sur le Figma

Mis à jour le 2026-11-04 après la passe de comparaison section par section contre
`evenement_id_desktop_v1` (Figma, page V2).

## Corrigé dans cette passe

| Section | Écart trouvé | Correction |
|---|---|---|
| Bandeau méta | valeurs en **Poppins** au lieu de Round Condensed, pas de majuscules | `font-family` → token `font/heading-main`, `text-transform: uppercase`, taille → token `font-size/h5` |
| Bandeau méta | libellés sans majuscules ni interlettrage | `uppercase` + `letter-spacing: .08em` (convention de `event_venue_label`) |
| Bandeau méta | « 20 » au lieu de « 20 PERSONNES » | unité ajoutée dans `event_meta_val_row` |
| Chiffres clés | libellés en Poppins Light sans majuscules | poids 600 + majuscules + interlettrage |
| Prestations | puces neutres | sigle Ephemera, en **masque sur `currentColor`** (`main.css`) |
| Verbatim | logo client absent, puis **invisible** | champ CMS rempli ; le SVG est en `#F7E9D4`, exactement la couleur du bandeau crème → `filter: brightness(0)` |
| Verbatim | auteur sans majuscules | `uppercase` + interlettrage |
| Fiche technique | libellés sans majuscules | `uppercase` + interlettrage |
| Fiche technique | « 200 » au lieu de « 200 personnes » | unité ajoutée dans `event_specs_val_row` |
| Fiche technique | libellé « Le lieu » absent du Figma | supprimé |
| Fiche technique | CTA **Visite Virtuelle** manquant | ajouté, lié au champ du restaurant |
| Autres événements | carte simplifiée | refaite au Figma : **deux colonnes** Client / Nombre + bouton **Voir plus** |

Classes créées, toutes sur tokens : `event_related_cols`, `event_related_col`,
`event_related_col_end`, `event_related_label`, `event_related_value`,
`event_related_value_row`, `event_related_cta`, `event_specs_val_row`,
`event_meta_val_row`, `event_venue_cta`.

### Deux pièges rencontrés, à retenir
- `set_style` (outil élément) **ne résout aucune classe `u-*`**. Le builder, lui, n'accepte
  qu'une **combinaison de classes déjà présente** sur la page. D'où : classes autonomes avec
  les tokens de typo, ou réutilisation d'une paire existante.
- Les `u-text-style-*` **rognent l'interligne** (la boîte hugge les glyphes, 10,7 px au lieu
  de 21). Une classe maison à côté ne le fait pas → décalage vertical. Valeur et unité doivent
  porter **la même paire de classes**.

---

## Lot du 2026-11-04 — retours sur screens

| Point | Correction |
|---|---|
| Breadcrumb « Nos événements » en `#` | → `/privatisation#nos-evenements` ; ancre posée sur la section `nos_events_wrap` de la page Privatisation |
| Galerie sans diaporama | **lightbox** au clic sur n'importe quelle image : flèches, clavier, swipe, compteur, légende = `alt` |
| Visite Virtuelle ouvrait un onglet | **pop-up iframe**, même modèle que la pop-up récap (fond, anim GSAP, croix) ; la visite tourmkr s'affiche bien |
| Visite Virtuelle n'était pas le composant | instance **Button Main**, variante `text-link`, lien lié au CMS, `_blank` en secours sans JS |
| FAQ sans gap | ListClasses `u-flex-vertical-nowrap u-gap-16px-4` → 16 px, comme le Figma et la page Privatisation |
| Boutons « Voir plus » pas le composant | instances **Button Main**, `u-width-full`, sans icône — exactement les cartes de la page Privatisation |

Le code vit dans `global.js` + `main.css` (dépôt `ephemera-2025`, servi par Cloudflare Pages).
Deux crochets en attribut, réutilisables ailleurs : `[data-lightbox]` sur un conteneur d'images,
`[data-popup-iframe]` sur un bouton. Le module sort immédiatement si aucun des deux n'est présent.

Classes supprimées car remplacées par le composant : `event_related_cta`, `event_venue_cta`.

---

## Retours client du 2026-11-06

### Chiffres clés supprimés
La colonne « Chiffres clés » est retirée de la page, il ne reste que « Ce qu'on a
mis en place », qui passe en pleine largeur avec une mesure lisible (51 rem).
Classes supprimées : `event_kpi_col`, `_title`, `_grid`, `_card`, `_value`, `_label`.

Les **9 champs CMS** (`chiffre-1-valeur` … `source-des-chiffres`) sont **laissés en
place** : les supprimer effacerait les valeurs déjà saisies, et le client peut
vouloir revenir en arrière. À arbitrer avec lui.

### Blocs vides qui n'apparaissent plus
Webflow pose lui-même `w-dyn-bind-empty` sur un champ CMS vide et masque le champ,
mais la coquille autour restait. Règles ajoutées dans `main.css` :

| Bloc | Disparaît quand |
|---|---|
| Section verbatim | pas de citation |
| Ligne de fiche technique | pas de valeur |
| Section galerie | pas de photo (évitait un « No items found. » en anglais) |
| Bouton Visite Virtuelle | pas d'url sur le restaurant lié |

La visibilité conditionnelle **native** de Webflow ferait la même chose en sortant
l'élément du HTML, mais l'API ne sait lier la visibilité qu'à un champ Switch :
une condition « est renseigné » se pose à la main dans le Designer.

Vérifié sur `/events/byoma-x-stellar`, un vrai item sans restaurant lié : la
section verbatim et les 7 lignes de fiche technique ont disparu. Et sur la démo,
« Surface » et « Équipements » — les deux lignes blanches du screen client — ne
s'affichent plus, le reste est intact.

### Ce qui reste vide sur un item mal rempli
Sur `/events/byoma-x-stellar`, il manque toujours le titre H1, la photo et le logo
du lieu, le format et la date. C'est un problème de **contenu**, pas de gabarit :
l'item n'a pas de restaurant lié. À ne pas masquer — un H1 absent doit se voir.

---

## Ce qui reste

### 0. Publier — pour toi
`publish_site` n'expose pas d'option « sous-domaine seulement », et le garde-fou de Claude Code
refuse l'appel. À lancer depuis le Designer, sur le sous-domaine.

### 1. Format de date — pour toi
La page sort **« OCT 2025 »**, le Figma demande **« OCTOBRE 2025 »**.
`event_meta_wrap > event_meta_contain > event_meta_layout-1 > 5e event_meta_item >
event_meta_value` → format avec le **mois en toutes lettres**.

### 2. Avant toute publication en prod
**noindex** sur `detail_events`, **ou** l'item **DEMO — Byoma x Stellar** en **Draft**.

---

## Écarts assumés, à arbitrer si tu veux

- **Taille des chiffres clés** : Figma 48 px, le token du site (`u-text-style-h2`) donne 37,7 px
  à 1280. J'ai gardé le token, comme pour le H1.
- **Titres de section** : le Figma utilise un composant `h2` ; la page utilise des Heading avec
  `u-text-style-h2`, qui rend la même police, la même taille et la même casse. Je ne les ai pas
  basculés sur `restaurant_heading` pour ne pas risquer de régression — dis-moi si tu veux.
- **Surface / Équipements** : champs vides sur les 8 restaurants. Je n'ai **pas** ajouté l'unité
  « m² », sinon la démo afficherait un « m² » seul. À ajouter une fois le champ rempli.
- **Contenu des chiffres clés** : mes valeurs de démo diffèrent de celles du Figma (maquette).

## Côté contenu — pour Ephemera
**Surface privatisable** et **Équipements événementiels** vides sur les 8 restaurants.
