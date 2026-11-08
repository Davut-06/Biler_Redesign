# SEO and generated product entries

The homepage has a static Russian title, description, canonical, Open Graph and
Twitter metadata. The shared `src/utils/seo.ts` logic also updates the document
head through `SeoMetadata` on route and RU/EN changes, removing stale duplicates.
The former independent product title effect remains removed.

## Static product metadata

The build now generates 14 real entries at
`dist/products/<actual-slug>/index.html` using the built homepage as a template.
`scripts/load-seo.mjs` executes the actual shared metadata logic in Node and reads
`src/locales/ru.json`; `scripts/load-products.mjs` executes the real catalogue and
slug mapping while substituting only Vite image imports/globs. No product names,
slugs or descriptions are duplicated in the generator.

Product title, description, canonical, og:title, og:description, og:url,
twitter:title and twitter:description are written into HTML before any browser
JavaScript executes. HTML metacharacters in text and attributes are escaped.
Managed tags are replaced without duplicates; social images, icons, built JS/CSS
entry points and body/mount point remain unchanged. These are HTML entry files
with static head metadata, not full product-content prerendering or SSR.

Product links, static/runtime canonical and og:url and the 15-URL sitemap use
trailing slashes, including the actual classic-mohito slug. BrowserRouter accepts
both slash forms. Queries/fragments are excluded from canonical URLs. robots.txt
points at https://bilerdrinks.com/sitemap.xml. No invented language URLs or hreflang
are added. Unknown paths receive no generated page.

## Languages and images

Generated HTML is Russian with html.lang=ru. The existing i18n startup restores
the saved RU/EN selection, updates html.lang and localized metadata, and keeps the
same canonical URL in both languages. Search/social crawlers that do not run
JavaScript see Russian metadata. Independently addressable English URLs do not
exist. Product body content still requires JavaScript.

The unchanged 1200x630 PNG at public/og-image.png supplies the shared brand image
at https://bilerdrinks.com/og-image.png, with Open Graph width, height, descriptive
alt text, twitter:image and summary_large_image card. Generated route pages retain
these tags. The PNG favicon and Apple icon remain the Biler logo copied from the
old site's logo.png; the WebP favicon is preserved. The old production HTML had
only a generic description and icon links, without canonical or social tags.

## Verification and limits

- Run `node --test tests/*.test.mjs`, `npm run typecheck`, `npm run build` and
  `node tests/route-pages.http.mjs`. Tests cover all products, RU/EN runtime
  metadata, escaping, duplicate removal and canonical/sitemap consistency. The
  build verifies all generated pages and real JS/CSS/icon/SEO assets.
- The no-fallback HTTP fixture checks directory-index routing and refreshes. The
  existing browser test additionally checks actual React navigation and language
  switching; see the hosting guide for its local setup. Neither test establishes
  production cache headers or nginx status codes.
- nginx-only production serves actual directory indexes. Direct unknown paths
  should receive its HTTP 404; React's client-side not-found/noindex does not set
  HTTP status. Optional Apache fallback behavior is separate and may return 200.
- Raw product HTML now contains product-specific Russian metadata, so social
  crawlers no longer need JavaScript for those tags. Full visual/product body
  rendering remains client-side. No framework migration or full prerender was
  introduced. Validate social services and Search Console after authorized upload.
- Selected static extensions are cached by the host for 45 days. The unversioned
  social image may retain earlier content; review caching manually. HTML is not
  long-term cached under the confirmed hosting setup.
- The live Yandex verification file is absent locally and MUST be copied unchanged
  from the existing server before deployment. Never delete or overwrite it.

See [reg.ru deployment safeguards and manual checks](reg-ru-hosting.md). This work
changes only local build/routing/SEO behavior; it does not deploy, modify EmailJS,
change credentials, implement CI/CD, or close issues.
