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

Product bottle images live in `src/assets/products/` and are imported through `src/data/products.ts`. Display names and descriptions come from the locale files. Technical IDs and slugs are distinct in some cases: `mohito-classic` maps to `/products/classic-mohito`.

The homepage renders Header, Hero, ProductShowcase, Benefits, DistributorSection, and Footer. Homepage anchors are `#home`, `#products`, `#about`, `#partners`, and `#contacts`. Header scroll-spy and mobile navigation share these section IDs. Catalogue return navigation restores the selected category and saved scroll position.

Preserve stable IDs/slugs, RU/EN key parity, keyboard/focus behavior, reduced-motion support, and scroll restoration when maintaining the site. All supplied images are retained, including additional ProductDetail artwork not imported by the current application; review usage before removing assets.

## Deployment to the Existing Domain

Build locally or in the deployment pipeline, then deploy the **contents of `dist/`** to the site's document root or equivalent static hosting destination. Node.js is needed for building; the generated frontend does not require a Node.js server.

The application uses BrowserRouter. The web server must serve existing static files normally and fall back to `/index.html` for client-side application routes. Direct visits and browser refreshes must work for routes such as:

- `/products/orange`
- `/products/classic-mohito`
- `/products/bilberry-mohito`

The receiving developer should apply the appropriate SPA rewrite/fallback for the actual hosting environment. Preserve unrelated API, admin, and existing-site routes; do not replace existing server configuration wholesale.

### Apache example

For a document-root deployment using `mod_rewrite`, adapt these rules in the site's configuration or an allowed `.htaccess` file:

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [L]
```

### Nginx example

Within the appropriate server block, adapt the document root and fallback:

```nginx
root /path/to/deployed/dist;

location / {
    try_files $uri $uri/ /index.html;
}
```

These are examples, not installed deployment configuration. Verify direct product URLs after deploying; successful in-app navigation alone does not validate server fallback behavior.

### Base path

`vite.config.ts` uses `base: "/"`, which is correct for deployment at a domain root such as `https://example.com/`. This intended configuration is unchanged.

Deployment under a subdirectory such as `https://example.com/biler/` requires reviewing both Vite's base path and routing/link configuration. Changing Vite's base alone is insufficient because the current router and links assume a root deployment.

## Distributor Form and Public Contacts

Public business contacts are displayed in DistributorSection and Footer. The form requires company, Tax ID / TIN, name, phone, and email. It validates all fields and prepares a mailto draft; the visitor reviews and sends it through their email client. The UI explicitly says the enquiry has **not** been submitted. No backend endpoint exists in this repository, and the frontend does not automatically send or persist enquiries.

Validation is implemented in `src/utils/distributorEnquiry.ts`, separate from the form and transport. All values are trimmed and Unicode-normalized (NFC). Company names accept international letters, numbers and ordinary punctuation (2–120 characters); Tax IDs accept international letters, digits, spaces, hyphens, slashes and dots (5–30 characters, at least one digit); names accept international letters, spaces, hyphens and apostrophes (2–80 characters). Phone numbers allow a leading `+`, digits, spaces, parentheses and hyphens, with 7–15 digits. Email requires a local part and a dotted domain without whitespace. Errors appear inline in RU/EN, on blur and on submit; fields already showing errors are revalidated while typing. All errors are checked before either transport can proceed.

### Connecting real email submission

Implement a server endpoint at **POST `/api/distributor-enquiry`** accepting `Content-Type: application/json`:

```json
{
  "company": "Example Company",
  "taxId": "DE123456789",
  "name": "Alexander",
  "phone": "+49 (176) 123-4567",
  "email": "name@company.com"
}
```

The backend must independently normalize and validate every field using the rules above; client validation can be bypassed. Send the enquiry to `biler.distribute@gmail.com` through a server-side mail provider, use a verified sender, and set the validated applicant email as Reply-To. Keep credentials exclusively in the server environment or secret manager, never in React code or `VITE_*` variables. Escape user content when generating HTML emails and prevent header injection. Apply request-size limits and abuse/rate limiting. Do not log enquiry bodies unnecessarily.

Return a 2xx JSON response `{ "success": true }` only after the mail provider confirms acceptance; this is not a guarantee of final inbox delivery. Return non-2xx for invalid requests, throttling or provider failure. Configure `/api/` routing before the SPA fallback, so requests cannot silently receive `index.html`. No real emails should be sent during local validation tests.

The exported `postDistributorEnquiry` helper already posts the normalized, validated JSON payload and rejects non-2xx, malformed responses, or responses without `success: true`. It is deliberately **not called** by the current form. After the backend is deployed, replace the `createEnquiryMailto` branch in `DistributorSection` with an awaited call to `postDistributorEnquiry`. Add a pending state and duplicate-submit protection, then show `partner.success` only after this promise resolves; show `partner.failure` on rejection and retain the entered values for retry. These RU/EN messages are supplied but are not displayed by the mailto fallback. Test successful responses, validation failures, network errors, non-JSON responses and provider errors before enabling direct submission. No API keys are needed in the frontend.

Run `node --test tests/distributorEnquiry.test.mjs` for validation and transport tests, in addition to typecheck and build.

## Environment Variables

No environment variables are currently required for the frontend.

Do not put private credentials in source code or `VITE_*` variables; frontend build values are visible to visitors. Environment files are ignored, with an exception for a future credential-free `.env.example`.

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
- Form validation and email-draft preparation with a configured email client.

Dependencies, build output, local browser profiles, review output, environment files, logs, and private key containers are excluded through `.gitignore`. Review staged files before the first public commit; ignore rules do not prevent force-adding files or publishing unrecognized secrets.
