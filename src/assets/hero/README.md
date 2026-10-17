# Hero assets

`src/components/Hero/Hero.tsx` composes the homepage Hero using bottle images from `src/data/products.ts`, the background in `src/assets/backgrounds/`, and the transparent ice, splash, and droplet PNGs in this directory.

Composition, responsive placements, and animation styles are defined in `Hero.module.css`. There is no automatic image-replacement workflow; update explicit imports only when intentionally changing artwork.

`Oswald-Bold.ttf` is the shared display font, loaded by `src/styles/globals.css`. Its copyright and SIL Open Font License 1.1 are in `public/licenses/Oswald-OFL.txt`, which is also included in production output. Keep the notice with redistributed font copies.
