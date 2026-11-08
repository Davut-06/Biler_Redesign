# SEO review for Issue #4

The old `../biler_01/public/index.html` was available for comparison. It supplied
the generic description “Vitaminized drinks”, a PNG favicon, and an Apple icon.
It had no canonical, Open Graph, or Twitter metadata. Its Biler `logo.png` has
been copied unchanged to `public/biler-icon.png` for PNG favicon and Apple icon
support. The existing WebP favicon remains the preferred icon; the old React
starter icons were deliberately not reused.

## Metadata and routes

`index.html` contains the default Russian homepage metadata, including the
canonical `https://bilerdrinks.com/`. `SeoMetadata` calls the shared updater in
`src/utils/seo.ts` on initial mount, pathname changes and language changes. It
updates the existing tags rather than adding competing copies. The former
product-only title effect has been removed.

Product names and descriptions come from the same locale keys as the visible
product pages, matched through `src/data/products.ts`. Query strings, fragments
and optional trailing slashes are excluded from canonical URLs. Unknown routes
receive `noindex, follow`, and their canonical and `og:url` are removed. Returning
to a valid route clears `noindex` and restores the correct tags.

The existing i18n initialization and `languageChanged` handler synchronize
`html.lang` with RU/EN selection; browser tests verify both languages. The URLs
are shared between languages, with the selection saved locally. No independently
addressable language URLs exist, so no hreflang or invented language paths were
added. Static response HTML defaults to Russian.

## Sitemap

`npm run sitemap` regenerates `public/sitemap.xml` from the actual exported product
array, including its `mohito-classic` → `classic-mohito` slug mapping. The Node
loader substitutes only Vite's image imports/globs, executing the original
catalogue and slug logic. The production build runs this generator automatically.
The sitemap contains 15 URLs: homepage plus all 14 products, with no language,
hash, filter or unknown routes. No unsupported update dates or priorities are
asserted. `public/robots.txt` allows crawling and points at the production sitemap.

## Social preview image

The user-supplied `public/og-image.png` was independently checked: it decodes as
a PNG and measures exactly 1200×630. It is used unchanged as the shared brand
preview for the homepage and every product page at
`https://bilerdrinks.com/og-image.png`. Static homepage tags and the existing
shared metadata updater supply `og:image`, width, height, descriptive image alt
text, `twitter:image`, and `twitter:card=summary_large_image`. Localized titles,
descriptions and route-specific canonicals/`og:url` remain independent of this
fallback image. The existing `SeoMetadata` component needs no changes: it already
calls the shared updater on route and language changes. Tests check that image
tags remain unique across repeated updates and that stale duplicates are removed.

Vite copies the image to `dist/og-image.png`; compare it with the source after
building. Public availability and social service caching still need checking
after a separately authorized deployment.

## Outstanding limitations

- This remains a client-rendered SPA. Product metadata is correct after JavaScript
  executes, including direct loads served by Vite's fallback. Raw product response
  HTML still contains homepage metadata. Crawlers that do not execute JavaScript,
  including many social preview services, will not see product-specific metadata.
- The unknown-page UI and client-side `noindex` do **not** return HTTP 404. A host
  that falls back to `index.html` may return HTTP 200. True 404 responses, rewrite
  configuration, redirects and live deep-link availability remain Issue #5.
  No deployment configuration has been changed here.
- Prerendering is feasible for this finite catalogue, but is deferred. A safe
  implementation must generate real page content and head metadata together,
  define a default language independent of local storage, avoid browser-only
  image/scroll/animation assumptions, and coordinate static route resolution and
  unknown-route status handling with hosting. Metadata-only files would leave
  empty app shells; a framework or router migration is not warranted for this
  patch. Review a separate prerender implementation if social previews for
  individual product URLs are required before release.

Google documents JavaScript metadata and SPA soft-404 limitations in its
[JavaScript SEO guidance](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics).

## Verification and checks before closing

Run:

```text
npm run sitemap
node --test tests/*.test.mjs
npm run typecheck
npm run build
```

`tests/seo.test.mjs` checks all products in both languages, sitemap exactness,
canonical normalization, unknown routes, repeated head updates and metadata
consistency with the static homepage. Existing EmailJS and validation tests remain
part of the test suite. No lint command is configured.

For real browser checks, run the dev server and headless Chrome with remote
debugging on port 9346, then `node tests/seo.browser.mjs`. It defaults to
`http://127.0.0.1:5174`; set `SEO_TEST_URL` if the server uses another port. Use a
separate browser profile for testing. It verifies all 14 direct product entries
in RU/EN, the document language, real React Router navigation through the
homepage, and recovery from unknown-product noindex. It sends no enquiries.

Before closing Issue #4:

1. Review the supplied social preview image and verify social cards and image
   HTTP availability after separately authorized deployment.
2. Decide whether the documented client-rendered product preview limitation is
   acceptable or whether a separately reviewed prerender change is required.
3. Review rendered head tags and language switching on representative mobile and
   desktop product pages; check back/forward and homepage navigation.
4. After separately authorized deployment, verify robots/sitemap and asset HTTP
   responses, inspect rendered URLs in Search Console, submit the sitemap and
   test previews with the target social services. Coordinate real HTTP status
   checks with Issue #5. Local Vite tests cannot establish production routing.

This change does not modify EmailJS configuration, deployment, or Issues #5,
#7 or #8, and does not close any issue.
