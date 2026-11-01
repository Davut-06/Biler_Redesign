# Optimized delivery images

The source PNGs in the sibling asset directories are retained unchanged for editing.
These delivery copies preserve their artwork, transparency, framing and proportions.

- Product bottles: original dimensions, WebP quality 97/100, for Hero and ProductDetail.
- Product card thumbnails: proportional resize to a 960px longest edge, WebP quality 97/100.
- Mountain background: original 1672×941 dimensions, WebP quality 95/100.
- Splash and droplets: original dimensions, WebP quality 97/100.
- Ice: proportional resize to 640×640, WebP quality 97/100.
- Shared logo: proportional resize to 256×256, WebP quality 98/100.
- Favicon: same logo artwork resized to 48×48, PNG.

Delivery copies were generated with Chromium's canvas WebP/PNG encoder, using high-quality
image smoothing for resized assets. No generative edits, cropping or recoloring were applied.
When source artwork changes, regenerate the corresponding full-size and thumbnail copies
with these settings and compare the rendered results at desktop/mobile sizes.
