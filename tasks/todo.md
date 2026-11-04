# Page événement — lot du 2026-11-04 (retours screens)

- [x] 1. Breadcrumb « Nos événements » : `#` → `/privatisation#nos-evenements`
      (ancre posée sur la section `nos_events_wrap` de la page Privatisation)
- [x] 2. Galerie « La soirée en images » : lightbox au clic
      `[data-lightbox]` sur `event_gallery_grid` + module dans `global.js`
- [x] 3. « Visite Virtuelle » : ouvre la visite 3D en pop-up iframe (`[data-popup-iframe]`)
- [x] 4. « Visite Virtuelle » : composant Button Main, variante text-link, lien lié au CMS
- [x] 5. FAQ : ListClasses `u-flex-vertical-nowrap u-gap-16px-4` → gap de 16 px
- [x] 6. Cartes « D'autres événements » : composant Button Main, `u-width-full`, sans icône
- [ ] 7. **Publication Webflow** — bloquée par le classifieur (voir Review)

## Review

**Code** (`global.js` + `main.css`, commit `e651ea0`, déployé sur Cloudflare Pages)

Un seul module, deux crochets posés en attribut, donc réutilisables sur n'importe
quelle page :

- `[data-lightbox]` sur un conteneur d'images → chaque `<img>` ouvre un diaporama
  (flèches, clavier, swipe, compteur, légende = `alt`).
- `[data-popup-iframe]` sur un bouton/lien → son `href` s'ouvre dans une iframe,
  la valeur de l'attribut sert de titre.

La pop-up réutilise les classes `event_recap_item_wrap` / `_bg` de la pop-up récap
de la page Privatisation, donc le même fond et la même animation GSAP
(`clipPath: inset(100% 0 0 0)` + `y: 100`). Les icônes sont les SVG des composants
`SVG / arrow_left`, `SVG / arrow_right` et `Button Close`. Le module sort
immédiatement si aucun des deux attributs n'est présent : aucun effet sur les
autres pages, prod comprise.

**Vérifié en navigateur** sur le sous-domaine, attributs injectés à la main faute
de publication : 8 images, navigation 3/8 → 4/8, fermeture au clic hors cadre et
à la croix, scroll rendu à Lenis, visite 3D tourmkr qui **s'affiche bien** en
iframe 1120×630, et 375 px sans débordement.

**Webflow** — breadcrumb, attribut lightbox, gap FAQ, les deux boutons remplacés
par des instances de `Button Main`, anciens éléments supprimés et classes
`event_related_cta` / `event_venue_cta` effacées.

Le bouton de carte porte `data-card-button` : son lien propre est neutralisé en
CSS pour que le composant `Clickable` de la carte garde le clic (un seul lien par
carte), et son état hover est relayé depuis la carte.

**Reste à faire**

1. **Publier** — `publish_site` n'a pas d'option « sous-domaine seulement » et le
   classifieur le refuse. À lancer depuis le Designer.
2. Après publication, revérifier le `href` du breadcrumb : la valeur stockée est
   bonne mais ce champ a déjà mis une publication à se compiler.
3. Format de date : « OCT 2025 » → « OCTOBRE 2025 ».
4. Avant toute mise en prod : noindex sur `detail_events` ou l'item DEMO en Draft.
