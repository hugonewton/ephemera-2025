# Page événement — lot du 2026-11-04 (retours screens)

- [x] 1. Breadcrumb « Nos événements » : `#` → `/privatisation#nos-evenements`
      (ancre posée sur la section `nos_events_wrap` de la page Privatisation)
- [x] 2. Galerie « La soirée en images » : lightbox au clic
      `[data-lightbox]` sur `event_gallery_grid` + module dans `global.js`
- [x] 3. « Visite Virtuelle » : ouvre la visite 3D en pop-up iframe (`[data-popup-iframe]`)
- [x] 4. « Visite Virtuelle » : composant Button Main, variante text-link, lien lié au CMS
- [x] 5. FAQ : ListClasses `u-flex-vertical-nowrap u-gap-16px-4` → gap de 16 px
- [x] 6. Cartes « D'autres événements » : composant Button Main, `u-width-full`, sans icône
- [x] 7. Publication Webflow (faite par Hugo depuis le Designer)
- [x] 8. Galerie et visite virtuelle passées dans la pop-up de réservation
      (légende sur l'image + bande de miniatures)

## Review

**Architecture** — `global.js` + `main.css`, déployés par Cloudflare Pages.

La pop-up de réservation (`.iframe_resa_wrap`) devient **la** pop-up plein écran
du site. Sa timeline est passée derrière `window.EphemeraOverlay`
(`openIframe` / `openPanel` / `close`), si bien que la galerie réutilise la même
coquille, la même croix et la même animation au lieu d'en refaire une.

Trois déclencheurs, tous en attribut :

| Attribut | Effet |
|---|---|
| `[data-resa]` | ouvre l'url de l'attribut dans l'iframe (inchangé) |
| `[data-popup-iframe]` | ouvre le `href` du lien dans l'iframe — la visite 3D |
| `[data-lightbox]` | sur un conteneur d'images : ouvre le diaporama |

La galerie est un panneau injecté dans `.iframe_resa_layout` : légende posée sur
le bas de la photo sur fond `obscurite-o80`, bande de miniatures qui suit la
sélection, flèches, clavier et swipe. La boîte de la photo est dimensionnée en JS
à partir du ratio de l'image et remesurée par un `ResizeObserver` sur le cadre —
sans ça une image portrait laissait des bandes et la légende débordait.

**Webflow** — breadcrumb `/privatisation#nos-evenements` (ancre posée sur la
section événements de Privatisation), attribut lightbox sur la grille, gap FAQ de
16 px, les deux CTA remplacés par des instances de `Button Main`, anciens
éléments supprimés et classes `event_related_cta` / `event_venue_cta` effacées.

Le bouton de carte porte `data-card-button` : son lien propre est neutralisé en
CSS pour que le `Clickable` de la carte garde le clic — vérifié, un clic au
centre du bouton atteint bien `/events/byoma-x-stellar`.

**Vérifié sur le sous-domaine publié**, 1440 et 375 : diaporama 8 images avec
navigation et miniatures qui suivent, boîte toujours au ratio de la photo et
légende exactement à sa largeur, visite 3D qui s'affiche dans la pop-up sans
nouvel onglet, « Demander un devis » toujours intact (ouverture, fermeture, `src`
vidé), breadcrumb, gap FAQ à 16 px, aucun débordement horizontal.

**Reste à faire**

1. Format de date : « OCT 2025 » → « OCTOBRE 2025 ».
2. Avant toute mise en prod : noindex sur `detail_events` ou l'item DEMO en Draft.
