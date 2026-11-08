# Biler Drinks Website

Bilingual Russian/English website for Biler Drinks, with a product catalogue, product detail pages, brand benefits, and distributor enquiries.

## Tech Stack

- React 19 and TypeScript
- Vite 7
- React Router (BrowserRouter)
- i18next and react-i18next
- Framer Motion
- CSS Modules and shared global styles

Exact dependency versions are recorded in `package-lock.json`.

## Requirements

Node.js 22.12 or newer and npm. The installed Vite package declares support for `^20.19.0 || >=22.12.0`; Node.js 22.12+ is the handoff baseline.

## Installation

After cloning the repository, run these commands from its root:

```bash
npm install
```

For a reproducible installation from the committed lockfile, use `npm ci` instead.

## Local Development

```bash
npm run dev
```

Vite normally serves the site at `http://localhost:5173/`. If that port is occupied, it chooses the next available port; use the URL printed in the terminal. Development and preview scripts bind to all network interfaces for testing from other devices on the local network.

## Type Check

```bash
npm run typecheck
```

## Production Build

```bash
npm run build
```

This runs TypeScript checking and generates the production website in `dist/`, including JavaScript, CSS, imported assets, and files copied from `public/`. Do not commit `dist/` or `node_modules/`.

## Production Preview

```bash
npm run preview
```

Build first. Preview normally starts at `http://localhost:4173/`; use the URL printed in the terminal. This is for local verification, not the production web server.

## Main Project Structure

```text
src/
  App.tsx                 Routes and page scroll/restoration behavior
  main.tsx                React entry point and BrowserRouter
  components/             Header, Hero, ProductShowcase, Benefits,
                          DistributorSection, Footer, and shared UI
  pages/ProductDetail/    Product detail page
  data/products.ts        Product definitions, IDs, slugs, order, and images
  locales/ru.json         Russian translations
  locales/en.json         English translations
  i18n.ts                 Translation setup and saved language preference
  assets/                 Product, brand, Hero, background, and font assets
  styles/                 Global styles and shared design variables
  utils/                  Catalogue position persistence
public/                   Files copied unchanged into the production build
vite.config.ts            Vite settings, including the root base path
```

Product bottle images live in `src/assets/products/` and are imported through `src/data/products.ts`. Display names and descriptions come from the locale files. Technical IDs and slugs are distinct in some cases: `mohito-classic` maps to `/products/classic-mohito/`.

The homepage renders Header, Hero, ProductShowcase, Benefits, DistributorSection, and Footer. Homepage anchors are `#home`, `#products`, `#about`, `#partners`, and `#contacts`. Header scroll-spy and mobile navigation share these section IDs. Catalogue return navigation restores the selected category and saved scroll position.

Preserve stable IDs/slugs, RU/EN key parity, keyboard/focus behavior, reduced-motion support, and scroll restoration when maintaining the site. All supplied images are retained, including additional ProductDetail artwork not imported by the current application; review usage before removing assets.

## Deployment to the Existing Domain

Production is nginx-only reg.ru hosting at https://bilerdrinks.com, document root
`/www/bilerdrinks.com`. Apache rewrites do not run there. nginx serves directory
index.html files, so Option B generates `dist/products/<actual-slug>/index.html`
for every one of the 14 catalogue routes. Product pages contain accurate static
Russian SEO metadata and the same React/CSS/JS entry points as the homepage.

The build order is sitemap generation, TypeScript check, Vite build, route HTML
generation, then deployment-artifact verification. Links, canonical/og:url and
sitemap product URLs end in a slash; React Router supports both forms. Examples:

- `/products/orange/`
- `/products/classic-mohito/`
- `/products/bilberry-mohito/`

After separate approval, upload the CONTENTS of dist/ (including products/ and
assets/) to the document root. Do not deploy only the root index.html or mirror
with deletion. **Before deployment copy the existing server's
`yandex_9012eb5604d3035e.html` unchanged into public/, then rebuild. It is absent
locally. Never delete or overwrite the live verification file.** Preserve unrelated
server files and older hashed assets; never upload .env or the source tree.

See [reg.ru hosting instructions](docs/reg-ru-hosting.md) for manual direct-load,
refresh, directory redirect and cache checks, plus the no-fallback local HTTP test.
nginx caches selected static extensions for 45 days; HTML is not long-term cached.
`public/.htaccess` remains optional Apache compatibility for other hosts and is
ignored on production. No nginx configuration, DNS, SSL or ISPmanager changes are
required or included.

Only known product routes receive entries. Direct unknown routes should receive
nginx HTTP 404; client-side not-found UI cannot change HTTP status. Metadata is
static, but product body content still requires JavaScript. Generated metadata
uses Russian; saved RU/EN selection updates the client UI and head as before.
Vite base remains / and this build assumes domain-root hosting.

## Distributor Form and Public Contacts

The form sends normalized, validated company, Tax ID / TIN, contact name, phone and email using @emailjs/browser. Existing validation rules are unchanged. Submitting disables the button, locks inputs temporarily, and blocks duplicate submissions. Confirmed EmailJS success clears fields; failures preserve them for retry. Feedback is localized in RU/EN and announced inline. The public contact email link remains independent of submission.

## Environment Variables

Copy .env.example to .env and set VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID and VITE_EMAILJS_PUBLIC_KEY. Restart Vite after editing environment files; production values must be set before building. .env is gitignored. These three EmailJS identifiers are public client configuration. Never add Gmail passwords, EmailJS account passwords, SMTP credentials or private keys to frontend variables.

### EmailJS template and live test

The existing local `.env` service and template IDs were checked and match issue #3: `service_tt44rvc` and `template_t0wz8uj`; a public key is present locally. The IDs are read from environment variables, never hardcoded into the sender. Matching local configuration does not verify that these resources are active or compatible in the EmailJS account. Dashboard access was unavailable, so template compatibility and Gmail delivery remain unverified, including the reported reconnect fix in issue #2. Copied placeholder configuration is rejected locally without an EmailJS request.

In the EmailJS dashboard, verify the service and template destination is biler.distribute@gmail.com and that the template body includes all variables: {{company_name}}, {{inn}}, {{name}}, {{phone_number}}, {{email}}, {{time}}. The repository cannot verify dashboard template content. Add a contact-name line using {{name}} if absent; use {{email}} as Reply-To where appropriate. The timestamp is ISO 8601 UTC.

For a safe live test, coordinate with the recipient first. Run npm run dev, open the printed local URL, go to the distributor form, and use a company name such as `TEST Company`, a synthetic Tax ID such as `TEST12345`, a synthetic contact name and phone, and an email address you control. Submit once and confirm inline success. Check EmailJS Email History and the destination Gmail inbox (including spam) for the actual message and all six template fields, including the contact name. Success in the UI means EmailJS accepted the request; inbox delivery remains a separate check. No live delivery has been verified by automated tests.

Missing configuration shows the localized failure message without sending a request. Automated tests mock EmailJS and never send real email. Run node --test tests/*.test.mjs, npm run typecheck and npm run build. Configure allowed deployment origins and review EmailJS rate limits/spam protection before deployment; CAPTCHA has not been added.

## Assets and Font Notice

The existing font is `src/assets/hero/Oswald-Bold.ttf`. Its copyright and SIL Open Font License 1.1 are included in `public/licenses/Oswald-OFL.txt`, copied to `dist/licenses/Oswald-OFL.txt` during the build. Upstream notice: <https://github.com/google/fonts/blob/main/ofl/oswald/OFL.txt>.

The font notice applies to Oswald; it does not grant rights to the site's product images, branding, or other assets. Retain the applicable asset permissions and notices when redistributing the project.

## Handoff Verification

Before deployment, run the type check and production build, then preview the build and verify:

- Homepage and direct product URLs, including browser refresh.
- Homepage hash links and ProductDetail-to-homepage navigation.
- Catalogue category/position restoration and browser back/forward.
- Header active-section underline and mobile menu at 390px.
- RU/EN names, image loading, responsive layout, keyboard navigation, and reduced motion.
- Form validation, EmailJS sending/success/error states, retry behavior, and confirmed delivery in EmailJS History or Gmail.

Dependencies, build output, local browser profiles, review output, environment files, logs, and private key containers are excluded through `.gitignore`. Review staged files before the first public commit; ignore rules do not prevent force-adding files or publishing unrecognized secrets.
