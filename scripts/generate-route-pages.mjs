import fs from "node:fs";
import { loadProducts } from "./load-products.mjs";
import { loadSeo, loadRussianTranslation } from "./load-seo.mjs";
import { renderRouteHtml } from "./route-html.mjs";

const products = await loadProducts();
const { getPageMetadata } = await loadSeo();
const t = loadRussianTranslation();
const template = fs.readFileSync(new URL("../dist/index.html", import.meta.url), "utf8");
const slugs = new Set();
for (const product of products) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(product.slug) || slugs.has(product.slug)) {
    throw new Error("Invalid or duplicate product slug");
  }
  slugs.add(product.slug);
  const directory = new URL(`../dist/products/${product.slug}/`, import.meta.url);
  const metadata = getPageMetadata(`/products/${product.slug}/`, products, t);
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(new URL("index.html", directory), renderRouteHtml(template, metadata));
}
console.log(`Generated ${slugs.size} product route HTML pages with static Russian SEO metadata`);
