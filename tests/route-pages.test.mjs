import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { loadProducts } from "../scripts/load-products.mjs";
import { loadSeo, loadRussianTranslation } from "../scripts/load-seo.mjs";
import { renderRouteHtml, attributes, decodeHtml, escapeHtml } from "../scripts/route-html.mjs";

const products = await loadProducts();
const { getPageMetadata } = await loadSeo();
const t = loadRussianTranslation();
const template = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const values = (html, kind, key, value) => [...html.matchAll(new RegExp(`<${kind}\\b[^>]*>`, "gi"))]
  .map(([tag]) => attributes(tag)).filter(tag => tag[key] === value);

test("all 14 product documents carry unique static Russian metadata and unchanged app resources", () => {
  assert.equal(products.length, 14);
  const sitemap = fs.readFileSync(new URL("../public/sitemap.xml", import.meta.url), "utf8");
  for (const product of products) {
    const metadata = getPageMetadata(`/products/${product.slug}/`, products, t);
    const html = renderRouteHtml(template, metadata);
    assert.equal(decodeHtml(/<title>(.*?)<\/title>/.exec(html)[1]), metadata.title);
    assert.equal((html.match(/<title>/g) ?? []).length, 1);
    const canonical = `https://bilerdrinks.com/products/${product.slug}/`;
    assert.equal(values(html, "link", "rel", "canonical").length, 1);
    assert.equal(values(html, "link", "rel", "canonical")[0].href, canonical);
    assert(sitemap.includes(`<loc>${canonical}</loc>`));
    for (const [key, expected] of [["description", metadata.description], ["twitter:title", metadata.title], ["twitter:description", metadata.description]]) {
      assert.deepEqual(values(html, "meta", "name", key), [{ name: key, content: expected }]);
    }
    for (const [key, expected] of [["og:title", metadata.title], ["og:description", metadata.description], ["og:url", canonical]]) {
      assert.deepEqual(values(html, "meta", "property", key), [{ property: key, content: expected }]);
    }
    for (const key of ["og:image", "og:image:width", "og:image:height", "og:image:alt"]) {
      assert.deepEqual(values(html, "meta", "property", key), values(template, "meta", "property", key));
    }
    assert.deepEqual(values(html, "meta", "name", "twitter:image"), values(template, "meta", "name", "twitter:image"));
    assert.deepEqual(html.slice(html.indexOf("<body>")), template.slice(template.indexOf("<body>")));
    assert.deepEqual(html.match(/<(?:script|link)\b[^>]*(?:src=|rel="(?:icon|stylesheet|apple-touch-icon)")[^>]*>/g),
      template.match(/<(?:script|link)\b[^>]*(?:src=|rel="(?:icon|stylesheet|apple-touch-icon)")[^>]*>/g));
  }
});

test("HTML text and attributes escape metacharacters without adding tags or duplicate metadata", () => {
  const value = `Fruit & "Coffee" <b>'Biler'</b> </title><script>alert(1)</script>`;
  const metadata = { title: value, description: value, canonical: 'https://bilerdrinks.com/products/test/?a="&b=<>', noindex: false };
  const dirty = template.replace("</head>", '<title>Stale</title><meta name="description" content="stale"><meta property="og:title" content="stale"><link rel="canonical" href="stale"><meta name="robots" content="noindex"></head>');
  const html = renderRouteHtml(dirty, metadata);
  assert.equal(decodeHtml(/<title>(.*?)<\/title>/.exec(html)[1]), value);
  assert(html.includes(escapeHtml(value)));
  assert(!html.includes("<script>alert(1)</script>"));
  assert.equal(values(html, "meta", "name", "description").length, 1);
  assert.equal(values(html, "meta", "name", "description")[0].content, value);
  assert.equal(values(html, "link", "rel", "canonical")[0].href, metadata.canonical);
  assert.equal(values(html, "meta", "property", "og:title").length, 1);
  assert.equal(values(html, "meta", "name", "robots").length, 0);
  assert.equal(renderRouteHtml(html, metadata), html, "generation should be idempotent");
});

test("unknown routes cannot be emitted as indexable documents", () => {
  assert.throws(() => renderRouteHtml(template, getPageMetadata("/products/missing/", products, t)), /known, indexable/);
});
