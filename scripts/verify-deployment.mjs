import assert from "node:assert/strict";
import fs from "node:fs";
import { loadProducts } from "./load-products.mjs";
import { loadSeo, loadRussianTranslation } from "./load-seo.mjs";
import { attributes, decodeHtml, metadataEntries } from "./route-html.mjs";

// nginx serves real directories; Apache compatibility is not a production dependency.
for (const file of ["robots.txt", "sitemap.xml", "og-image.png", "biler-icon.png", "favicon.svg"]) {
  const source = fs.readFileSync(new URL(`../public/${file}`, import.meta.url));
  const built = fs.readFileSync(new URL(`../dist/${file}`, import.meta.url));
  assert(source.equals(built), `dist/${file} must match public/${file}`);
}
const assets = fs.readdirSync(new URL("../dist/assets/", import.meta.url));
assert(assets.some(file => file.endsWith(".js")), "Missing JavaScript bundle");
assert(assets.some(file => file.endsWith(".css")), "Missing CSS bundle");
const products = await loadProducts();
assert.equal(products.length, 14, "Review catalogue changes before updating expected route count");
assert.deepEqual(fs.readdirSync(new URL("../dist/products/", import.meta.url)).sort(),
  products.map(product => product.slug).sort(), "Generated product directories must match the catalogue exactly");
const { getPageMetadata, socialImage, socialImageAlt } = await loadSeo();
const t = loadRussianTranslation();
const sitemap = fs.readFileSync(new URL("../dist/sitemap.xml", import.meta.url), "utf8");
const homepage = fs.readFileSync(new URL("../dist/index.html", import.meta.url), "utf8");
const resourceTags = html => html.match(/<(?:script|link)\b[^>]*>/gi)?.filter(tag => {
  const values = attributes(tag);
  return values.src || ["stylesheet", "icon", "apple-touch-icon", "modulepreload"].includes(values.rel);
}) ?? [];
for (const product of products) {
  const html = fs.readFileSync(new URL(`../dist/products/${product.slug}/index.html`, import.meta.url), "utf8");
  const metadata = getPageMetadata(`/products/${product.slug}/`, products, t);
  const titles = [...html.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)];
  assert.equal(titles.length, 1);
  assert.equal(decodeHtml(titles[0][1]), metadata.title);
  assert.match(html, /<html lang="ru">/);
  const entries = [...metadataEntries(metadata),
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:site_name", content: "Biler Drinks" }],
    ["meta", { property: "og:image", content: socialImage }],
    ["meta", { property: "og:image:width", content: "1200" }],
    ["meta", { property: "og:image:height", content: "630" }],
    ["meta", { property: "og:image:alt", content: socialImageAlt }],
    ["meta", { name: "twitter:image", content: socialImage }],
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
  ];
  for (const [kind, expected] of entries) {
    const selector = expected.name ? "name" : expected.property ? "property" : "rel";
    const matches = [...html.matchAll(new RegExp(`<${kind}\\b[^>]*>`, "gi"))]
      .map(([tag]) => attributes(tag)).filter(values => values[selector] === expected[selector]);
    assert.equal(matches.length, 1, `${product.slug}: ${expected[selector]} must be unique`);
    assert.deepEqual(matches[0], expected);
  }
  assert(sitemap.includes(`<loc>${metadata.canonical}</loc>`), "Canonical missing from sitemap");
  assert.deepEqual(resourceTags(html), resourceTags(homepage), "Product must keep built JS/CSS/icon entries");
  assert(!/<meta\b[^>]*name="robots"/i.test(html), "Known product must be indexable");
}
for (const tag of resourceTags(homepage)) {
  const values = attributes(tag);
  const path = values.src ?? values.href;
  assert(path.startsWith("/") && !path.startsWith("//"), "Expected domain-root resource URL");
  assert(fs.existsSync(new URL(`../dist${path}`, import.meta.url)), `Missing static resource: ${path}`);
}
const verificationFile = "yandex_9012eb5604d3035e.html";
const verificationSource = new URL(`../public/${verificationFile}`, import.meta.url);
if (fs.existsSync(verificationSource)) {
  assert(fs.readFileSync(verificationSource).equals(fs.readFileSync(new URL(`../dist/${verificationFile}`, import.meta.url))));
} else {
  console.warn(`MANUAL DEPLOYMENT BLOCKER: copy the existing server's ${verificationFile} unchanged into public/ before deployment; never delete or overwrite the live file.`);
}
console.log(`Deployment artifacts verified: ${products.length} route pages, SEO/icons, entry resources and ${assets.length} assets`);
