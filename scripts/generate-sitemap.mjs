import fs from "node:fs";
import { loadProducts } from "./load-products.mjs";
import { loadSeo, loadRussianTranslation } from "./load-seo.mjs";

const products = await loadProducts();
const { getPageMetadata, siteUrl } = await loadSeo();
const t = loadRussianTranslation();
const urls = [siteUrl, ...products.map(product =>
  getPageMetadata(`/products/${product.slug}/`, products, t).canonical)];
if (new Set(urls).size !== urls.length) throw new Error("Duplicate sitemap URLs");
const xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
  + urls.map(url => `  <url><loc>${url}</loc></url>`).join("\n")
  + '\n</urlset>\n';
fs.writeFileSync(new URL("../public/sitemap.xml", import.meta.url), xml);
console.log(`Generated sitemap with ${urls.length} URLs from src/data/products.ts`);
