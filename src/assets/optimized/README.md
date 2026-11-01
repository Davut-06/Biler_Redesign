# Production image delivery

Original PNG/JPG artwork remains unchanged in the sibling source directories.
Unused product-detail ingredient/effect artwork is not delivered or converted.

Current assets use Pillow/libwebp, method=6, with exact alpha preservation verified
against the resized RGBA source for every rendition. Resize uses Lanczos, preserves
aspect ratio, never crops, and never enlarges source artwork.

| Usage | WebP quality | Resolution |
| --- | --- | --- |
| ProductDetail desktop | 94 | Original source dimensions |
| ProductDetail mobile | 94 | 960px longest edge |
| Hero bottles desktop | 94 | 1200px longest edge |
| Hero bottles mobile | 94 | 720px longest edge; only the three visible bottles |
| ProductShowcase thumbnails | 85 | 720px longest edge |
| Mountains | 86 | Original 1672px width; 1000px mobile variant |
| Splash left / ice | 88 | Splash 960px / 640px mobile; ice 640px / 256px mobile |
| Splash right / droplets | 86 | 960px longest edge; suppressed on mobile |
| Shared logo | 94 | 192px longest edge |
| Favicon | Lossless | Existing 48px rendition, 1792 bytes |

Hero picture sources select mobile variants at the existing 600px breakpoint.
Hidden effects and outer bottles use a transparent data URI, making no artwork
request on mobile. ProductDetail uses its 960px variant below 801px; its decode
preloader chooses the same variant to avoid an extra full-resolution download.
Hero and Header imagery load eagerly; catalogue thumbnails retain lazy loading.
No image CSS, visual dimensions, object-fit, positioning or composition is changed.

The full delivery set contains 62 WebP renditions, totalling 10,968,866 bytes,
versus 30,291,008 bytes for the prior lossless delivery set (63.79% reduction).
The additional variants are selected responsively, not downloaded together.

performance-report.json is the current per-asset size/quality/alpha report.
lossless-report.json is a historical baseline from the previous lossless conversion,
not a description of the current WebP encoding.
