# reg.ru / ISPmanager SPA hosting (Issue #5)

The application uses `BrowserRouter`, `/products/:slug` routes, and Vite
`base: "/"`. The repository previously contained deployment examples in README,
but no active Apache or Nginx configuration. `public/.htaccess` now provides
Apache-compatible fallback for a domain-root installation. Vite copies it into
`dist/.htaccess`, which the production build verifies alongside SEO assets.

## What the file does

- With `mod_rewrite`, requests that match neither an existing file nor an existing
  directory are internally rewritten to `index.html`. The address bar retains the
  product URL; React Router then selects the product. There is no external redirect.
- Existing `robots.txt`, `sitemap.xml`, `og-image.png`, favicons, `/assets/*` and
  directories bypass the fallback. Missing asset URLs are still eligible for the
  general fallback, so a missing script may return HTML; use a real filename from
  the current build when checking asset responses.
- With `mod_headers`, filenames with Vite's eight-character content fingerprint
  receive `Cache-Control: public, max-age=31536000, immutable`. This covers the
  current JS, CSS, image and font output. Do not use filenames resembling Vite
  fingerprints for mutable public files. The build fails if a generated asset
  no longer matches this policy, prompting a review if Vite output changes.
- `index.html`, including the target of internal rewrites, receives
  `Cache-Control: no-cache, max-age=0, must-revalidate`. It may be stored but must
  revalidate before reuse. Nonfingerprinted public SEO/icon files receive no
  long-lived cache policy from this file. Existing host/proxy policies still need
  checking for those files.

Both module-dependent sections use `IfModule`. No `Options`, PHP handlers,
compression, `Expires`, virtual-host directives, or HTTPS/domain redirects are
added. Missing modules therefore skip their sections instead of failing on unknown
directives; missing rewrite support still means product links will not work.

## Hosting requirements and limitations

1. In ISPmanager, confirm the domain's actual document root and web-server mode.
   When deployment is separately authorized, upload the **contents** of `dist/`
   into that root, including the hidden `.htaccess`. Enable hidden-file display
   in the upload client/file manager. Do not deploy the source tree or `.env`.
2. Review any existing root `.htaccess` before uploading. Preserve host-managed
   PHP/security/redirect settings and unrelated routes; merge the SPA fallback
   after existing application-specific routing. A broad fallback can intercept
   nonexistent `/api` or `/admin` paths if they are used by another application.
   This repository has no live host configuration to inspect.
3. Apache must load `mod_rewrite` and permit rewrite directives through
   `AllowOverride FileInfo` (or an equivalent host allowlist). Header directives
   also require permission and `mod_headers`. `IfModule` protects against missing
   modules, **not** forbidden overrides. `AllowOverride None` can silently ignore
   `.htaccess`; restrictive overrides can produce HTTP 500. Ask reg.ru support to
   check the domain's error log and allowed directives if this occurs.
4. ISPmanager supports different server arrangements. Nginx-only hosting ignores
   `.htaccess`. With Nginx in front of Apache, Nginx may serve assets itself or
   reject requests without forwarding them. Ask the host to confirm that missing
   product routes reach Apache and that the front server does not override HTML
   or fingerprinted-asset cache headers. Do not assume access to Nginx configuration
   on shared hosting, or replace panel-managed configuration wholesale.
5. Apache `MultiViews`, if enabled by the host, can interfere with route rewriting.
   Ask support to disable it for this document root if needed; an `Options`
   directive is deliberately omitted because shared hosting may forbid it.
6. These rules assume a domain root and a working directory index for `/`.
   Subdirectory deployment would also require reviewing Vite base, BrowserRouter
   and links. A CDN or hosting cache can retain earlier 404/HTML responses; clear
   those through the hosting panel if needed after an authorized upload.

References: Apache documents [rewrite conditions](https://httpd.apache.org/docs/2.4/mod/mod_rewrite.html#rewritecond)
and [header directive permissions](https://httpd.apache.org/docs/2.4/mod/mod_headers.html).
ISPmanager documents [server modes and .htaccess support](https://www.ispmanager.com/docs/ispmanager/installing-and-changing-a-web-server-in-ispmanager).

## Local verification

```text
node --test tests/*.test.mjs
npm run typecheck
npm run build
```

The tests check guarded rewrite conditions and cache policy scope. The production
build runs `scripts/verify-deployment.mjs` after Vite: `.htaccess`, SEO files and
icons must match their public sources byte-for-byte, the entry point must exist,
and generated fingerprints must match the cache rule. No Apache runtime is
available in this workspace, so these are configuration/artifact checks, not
proof of Apache behavior. Vite dev/preview fallback does not exercise `.htaccess`.

## Manual verification after separately authorized deployment

In a new browser tab, paste each URL directly, then refresh it (including a hard
refresh with browser cache disabled):

- `https://bilerdrinks.com/products/orange`
- `https://bilerdrinks.com/products/classic-mohito`
- `https://bilerdrinks.com/products/bilberry-mohito`

Each should retain its URL, return a successful document response and render the
correct product instead of a host 404. Verify RU/EN switching, product metadata,
back navigation and homepage links. In DevTools Network check that JS/CSS are
served with their correct content types, not HTML, and that the document does not
receive a year-long cache lifetime.

Check response headers using `curl.exe -I` on Windows or `curl -I` elsewhere:

```text
curl.exe -I https://bilerdrinks.com/products/orange
curl.exe -I https://bilerdrinks.com/products/classic-mohito
curl.exe -I https://bilerdrinks.com/products/bilberry-mohito
curl.exe -I https://bilerdrinks.com/index.html
curl.exe -I https://bilerdrinks.com/robots.txt
curl.exe -I https://bilerdrinks.com/sitemap.xml
curl.exe -I https://bilerdrinks.com/og-image.png
curl.exe -I https://bilerdrinks.com/biler-icon.png
```

Expect product documents and index to revalidate, public files to retain their
actual content types, the social image to remain 1200×630, and XML/TXT requests
to return their real content. Also open the WebP favicon URL and at least one JS,
CSS, image and font URL copied from the current `dist/assets/` file listing or
Network panel. Expect `public, max-age=31536000, immutable` for those fingerprinted
assets. If Nginx serves them without these headers, the hosting configuration
needs equivalent cache settings. A successful HEAD alone does not prove the body
is correct: open or GET the response too.

## Unknown routes are not true HTTP 404s

The fallback also serves `index.html` for `/products/not-a-real-product` and other
missing paths. It can return **HTTP 200** even though the app renders its not-found
message and sets client-side `noindex`. This is SPA fallback, not a true HTTP 404.
Producing genuine unknown-route HTTP 404 responses requires a separately reviewed
server-aware route list or rendering solution. This patch does not implement it
or change the SEO implementation.

No deployment has been performed by this change.
