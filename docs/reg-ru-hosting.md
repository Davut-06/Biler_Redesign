# reg.ru nginx-only hosting: generated route pages

Confirmed production facts: https://bilerdrinks.com uses document root
`/www/bilerdrinks.com`, nginx only, and directory `index.html` serving. Apache,
PHP/CGI, `.htaccess` and `mod_rewrite` are unavailable. Selected static extensions
are cached for 45 days; HTML is not long-term cached. No server configuration,
DNS, SSL or ISPmanager settings are changed by this implementation.

## Option B build strategy

`npm run build` runs, in order:

1. Generate sitemap from the actual products and shared SEO canonical logic.
2. TypeScript check.
3. Vite build.
4. Generate `dist/products/<actual-slug>/index.html` for all 14 catalogue products.
5. Verify deployment artifacts, static metadata and resource references.

Each route file starts with the built homepage HTML, keeping its hashed JS/CSS,
favicons, social image tags and React mount point. Only product title,
description, canonical, Open Graph title/description/URL, and Twitter
title/description are replaced, with HTML escaping and duplicate removal. The
shared `getPageMetadata` function and Russian locale supply the static metadata.
This generates real HTML entry files, not server-rendered product body content.
The interactive UI still requires JavaScript; RU/EN behavior remains client-side.

Product links, sitemap, canonical and og:url use trailing slashes, for example
`/products/orange/`. nginx should redirect the slashless directory URL to the
slash form; confirm that after upload. React Router accepts both URL forms for
client navigation. nginx needs no fallback rewrite because the directories exist.
No nginx configuration file has been introduced.

`public/.htaccess` is retained solely for optional Apache compatibility on other
hosts. It is ignored on this nginx-only production host, including its cache
headers. Production uses the host's existing 45-day static cache policy. Do not
expect Apache's one-year immutable policy or HTML revalidation headers on nginx.
Keep existing hashed assets during an upload so cached/open pages can still load
older files. The unchanged URL og-image.png may remain cached for 45 days; review
host cache behavior when changing it. No automated upload or cache purge is added.

## Mandatory deployment safeguard: Yandex verification

`public/yandex_9012eb5604d3035e.html` is absent in this checkout. Before ANY
production deployment, copy the exact existing server file into `public/`,
rebuild, and verify the resulting `dist/` file is byte-identical. Do not invent
verification contents. Never delete or overwrite the live verification file.
The build reports a manual deployment blocker while this source is absent; if it
is present, verification checks the copy. A successful local build is not approval
to deploy without preserving that file.

## Manual upload and verification (only after separate approval)

1. Review all local changes and back up the existing site. Copy the Yandex file
   as above. Do not upload a replacement verification file or use a mirror/delete
   deployment that removes server-only files.
2. Upload the complete CONTENTS of `dist/` into `/www/bilerdrinks.com`, including
   the full `products/` directory tree and referenced `assets/`. A flat upload
   of index.html alone does not solve direct product routing. Do not upload source
   files or environment files. Preserve unrelated live files and older hashed
   assets; no cleanup script is supplied.
3. Paste these URLs into a new tab and refresh, including a hard refresh:
   - https://bilerdrinks.com/products/orange/
   - https://bilerdrinks.com/products/classic-mohito/
   - https://bilerdrinks.com/products/bilberry-mohito/
4. Check that slashless versions redirect to the corresponding directories and
   that all 14 sitemap URLs return their own HTML. Inspect page source with
   JavaScript disabled: product title, description, canonical and og:url must
   already be correct. Then enable JavaScript and verify product UI, RU/EN
   switching, back/forward, catalogue links and homepage return behavior.
5. Use DevTools or `curl.exe -I` (`curl -I` outside Windows) to check product
   documents, robots.txt, sitemap.xml, og-image.png, favicons, Yandex verification
   and real JS/CSS/image/font URLs from the build. GET responses too: successful
   status alone does not prove the correct content was returned. Expect HTML not
   to have the host's 45-day static cache policy. Recheck social previews and the
   sitemap after authorized upload; cached previews may need refreshing.

## Unknown routes and remaining limitations

Only catalogue products receive directories. A direct visit to an unknown route
should receive nginx's real HTTP 404; this depends on the live host's behavior and
has not been production-tested. It will not render the app's not-found page.
During client navigation React still shows its not-found UI and noindex metadata,
but client-side rendering does not set an HTTP response status. An optional Apache
SPA fallback may return HTTP 200 for unknown paths; it is not used on production.
There is no universal fallback for future routes: regenerate and upload route
pages when the catalogue changes. Remove retired route directories only after a
separate review; this task performs no server cleanup.

Local checks:

`node --test tests/*.test.mjs`, `npm run typecheck`, `npm run build`, then
`node tests/route-pages.http.mjs`. The HTTP test uses a local directory-index
server with NO SPA fallback, checking all 14 routes and unknown-route 404s; it does
not establish production status codes or cache headers. For browser tests run
`node tests/static-host.mjs` and a separate headless Chrome on debug port 9346,
then set `SEO_TEST_URL=http://127.0.0.1:5187` and run `node tests/seo.browser.mjs`.
Do not use Vite dev/preview alone as evidence that the host's direct routing works.

No deployment, CI/CD, credentials or production settings are changed here.
