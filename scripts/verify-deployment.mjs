import assert from "node:assert/strict";
import fs from "node:fs";

// Validate build artifacts, not Apache execution. Run after vite build.
for (const file of [".htaccess", "robots.txt", "sitemap.xml", "og-image.png", "biler-icon.png", "favicon.svg"]) {
  const source = fs.readFileSync(new URL(`../public/${file}`, import.meta.url));
  const built = fs.readFileSync(new URL(`../dist/${file}`, import.meta.url));
  assert(source.equals(built), `dist/${file} must match public/${file}`);
}
const config = fs.readFileSync(new URL("../dist/.htaccess", import.meta.url), "utf8");
const pattern = new RegExp(/<FilesMatch "([^"]+)">/.exec(config)[1]);
const assets = fs.readdirSync(new URL("../dist/assets/", import.meta.url));
assert(assets.some(file => file.endsWith(".js")), "Missing JavaScript bundle");
assert(assets.some(file => file.endsWith(".css")), "Missing CSS bundle");
for (const file of assets) assert(pattern.test(file), `Cache rule does not cover Vite asset ${file}`);
assert(fs.existsSync(new URL("../dist/index.html", import.meta.url)), "Missing SPA entry point");
console.log(`Deployment artifacts verified: .htaccess, SEO/icons, index.html and ${assets.length} fingerprinted assets`);
