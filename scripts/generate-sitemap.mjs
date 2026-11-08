import fs from "node:fs";
import { loadProducts } from "./load-products.mjs";

const products = await loadProducts();
const urls = ["https://bilerdrinks.com/", ...products.map(product =>
  `https://bilerdrinks.com/products/${encodeURIComponent(product.slug)}`)];
if (new Set(urls).size !== urls.length) throw new Error("Duplicate sitemap URLs");
const xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
  + urls.map(url => `  <url><loc>${url}</loc></url>`).join("\n")
  + '\n</urlset>\n';
fs.writeFileSync(new URL("../public/sitemap.xml", import.meta.url), xml);
console.log(`Generated sitemap with ${urls.length} URLs from src/data/products.ts`);
