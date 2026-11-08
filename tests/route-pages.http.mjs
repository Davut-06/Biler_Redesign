// Run after production build. Exercises directory indexes without Vite rewrites.
import assert from "node:assert/strict";
import { createStaticHost } from "./static-host.mjs";
import { loadProducts } from "../scripts/load-products.mjs";
import { loadSeo, loadRussianTranslation } from "../scripts/load-seo.mjs";
import { decodeHtml } from "../scripts/route-html.mjs";

const server = createStaticHost();
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const base = `http://127.0.0.1:${server.address().port}`;
try {
  const products = await loadProducts();
  const { getPageMetadata } = await loadSeo();
  const t = loadRussianTranslation();
  for (const product of products) {
    const route = `/products/${product.slug}/`;
    const redirect = await fetch(base + route.slice(0, -1), { redirect: "manual" });
    assert.equal(redirect.status, 301);
    assert.equal(redirect.headers.get("location"), route);
    for (let attempt = 0; attempt < 2; attempt++) {
      const response = await fetch(base + route);
      assert.equal(response.status, 200);
      assert.match(response.headers.get("content-type"), /text\/html/);
      const html = await response.text();
      assert.equal(decodeHtml(/<title>(.*?)<\/title>/.exec(html)[1]), getPageMetadata(route, products, t).title);
    }
  }
  for (const route of ["/robots.txt", "/sitemap.xml", "/og-image.png", "/biler-icon.png", "/favicon.svg"]) {
    assert.equal((await fetch(base + route)).status, 200);
  }
  assert.equal((await fetch(base + "/products/not-a-product/")).status, 404);
  console.log(`PASS ${products.length} routes: slash redirects, direct HTML/refresh, public assets and unknown-route HTTP 404 on no-fallback fixture`);
} finally {
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
}
