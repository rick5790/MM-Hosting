# Asset organization

Keep runtime media grouped by both media type and purpose:

- `images/backgrounds/` — responsive page posters and background fallbacks.
- `images/brand/` — logos and wordmarks.
- `images/cakes/` — cake photography.
- `images/dessert-layers/illustrations/` — collection layer illustrations and language variants.
- `images/holidays/<event>/` — transparent seasonal illustrations. Keep source variants together even when only some are currently displayed.
- `images/qr/` — QR codes.
- `images/social/` — social profile and post images.
- `videos/backgrounds/` — responsive page background loops.
- `videos/mascots/default/` — the year-round mascot.
- `videos/mascots/seasonal/` — scheduled holiday mascot editions.

Performance rules:

- Holiday decorations must only mount inside their scheduled date window.
- Non-critical holiday images use async decoding; below-the-fold images also use lazy loading.
- Animation pauses while the element is off-screen or the page is hidden.
- Preserve the homepage mascot glass layer and the shop-card canvas/mask clipping fixes when changing media.
