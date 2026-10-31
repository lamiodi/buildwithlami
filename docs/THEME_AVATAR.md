# Theme assistant avatar

Created on 31 October 2026 using the built-in image-generation tool, with the owner's existing site portrait as the identity reference.

- Reference: `frontend/public/eugene-hero.webp`.
- Web asset: `frontend/public/images/lami-theme-avatar.webp`, 256 × 256 with transparency.
- Consumers: `ThemeToast.jsx` at 64 × 64 CSS pixels, `ServiceFinder.jsx` at 56 × 56, and the software `WhatsAppWidget.jsx` at 40 × 40.
- The original portrait is unchanged. The generated source PNG is retained in the chat workspace under `generated-assets/lami-theme-avatar.png`.

The avatar is decorative beside the clearly labelled Theme assistant notice. It does not represent a live chat or a live founder response. The existing automatic theme policy, countdown and user controls remain the same.

## Generation prompt

Use case: stylized-concept. Asset: one square, transparent-background avatar for the BuildWithLami website's small theme-assistant popup. Input image 1 is the identity reference: use the same man, preserving his recognizable facial structure, warm brown complexion, short dense curly black hair, eyebrows, eyes, nose, lips, subtle moustache and distinctive small goatee. Create a polished friendly 3D illustrated head-and-shoulders avatar, grown-up and professional, softly sculpted materials and clear expressive features. Face the viewer with a gentle confident closed-mouth smile. Remove the hand against the cheek and the original photographic room; no hands in the avatar. Keep a simple black zip-neck top inspired by his clothing, with restrained orange-red #F44A22 trim that matches his website. Frame tightly so the head fills most of the square and remains recognizable at 56–72 pixels. Both ears and full hairstyle visible; comfortable transparent margin. Soft even studio lighting, strong readable silhouette on both white and charcoal interfaces. Make an avatar of the person, not a metal robot. Exactly one person, no text, no logos, no headset, no extra objects, no background plate, no border, no watermark. Output genuine transparency.
