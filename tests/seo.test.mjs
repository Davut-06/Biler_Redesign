import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import ts from "typescript";
import { loadProducts } from "../scripts/load-products.mjs";

const products = await loadProducts();
const source = fs.readFileSync(new URL("../src/utils/seo.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
});
const { getPageMetadata, applyPageMetadata, socialImage, socialImageAlt } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
const locales = Object.fromEntries(["ru", "en"].map(language => [language,
  JSON.parse(fs.readFileSync(new URL(`../src/locales/${language}.json`, import.meta.url), "utf8"))]));
const translate = language => (key, fallback) => key.split(".").reduce((value, part) => value?.[part], locales[language]) ?? fallback ?? key;

test("sitemap contains exactly the homepage and all 14 actual product routes", () => {
  assert.equal(products.length, 14);
  const xml = fs.readFileSync(new URL("../public/sitemap.xml", import.meta.url), "utf8");
  assert.match(xml, /xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9"/);
  const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
  assert.deepEqual(urls, ["https://bilerdrinks.com/", ...products.map(p => `https://bilerdrinks.com/products/${p.slug}`)]);
  assert.equal(new Set(urls).size, 15);
  assert(urls.includes("https://bilerdrinks.com/products/classic-mohito"));
  assert(!urls.some(url => url.includes("mohito-classic")));
  assert.match(fs.readFileSync(new URL("../public/robots.txt", import.meta.url), "utf8"),
    /Sitemap: https:\/\/bilerdrinks.com\/sitemap.xml/);
});

for (const language of ["ru", "en"]) {
  test(`${language}: every product uses its actual localized title, description and canonical`, () => {
    const t = translate(language);
    for (const product of products) {
      const metadata = getPageMetadata(`/products/${product.slug}`, products, t);
      assert.equal(metadata.title, `${locales[language].productNames[product.id]} | Biler Drinks`);
      assert.equal(metadata.description, locales[language].productDetail.descriptions[product.id]);
      assert.equal(metadata.canonical, `https://bilerdrinks.com/products/${product.slug}`);
      assert.equal(metadata.noindex, false);
      assert.deepEqual(getPageMetadata(`/products/${product.slug}/`, products, t), metadata);
      const document = headDocument();
      applyPageMetadata(document, metadata);
      assertSocialMetadata(document);
    }
  });
  test(`${language}: unknown and malformed paths cannot inherit homepage indexing metadata`, () => {
    for (const path of ["/products/no-such-drink", "/products/%ZZ", "/products/orange/extra", "/ru/", "/missing"]) {
      const metadata = getPageMetadata(path, products, translate(language));
      assert.equal(metadata.noindex, true);
      assert.equal(metadata.canonical, undefined);
    }
  });
}

// Minimal head DOM to exercise the production updater across navigation,
// including duplicate removal and clearing stale noindex/canonical tags.
function headDocument() {
  const nodes = [];
  const createElement = tag => ({ tag, attributes: {},
    setAttribute(name, value) { this.attributes[name] = value; },
    remove() { nodes.splice(nodes.indexOf(this), 1); },
  });
  return { title: "", nodes, createElement, head: {
    appendChild(node) { nodes.push(node); },
    querySelectorAll(selector) {
      const [, tag, key, value] = /^(\w+)\[(\w+)="([^"]+)"\]$/.exec(selector);
      return nodes.filter(node => node.tag === tag && node.attributes[key] === value);
    },
  } };
}

function assertSocialMetadata(document) {
  for (const [attribute, key, expected] of [
    ["property", "og:image", "https://bilerdrinks.com/og-image.png"],
    ["property", "og:image:width", "1200"],
    ["property", "og:image:height", "630"],
    ["property", "og:image:alt", socialImageAlt],
    ["name", "twitter:image", "https://bilerdrinks.com/og-image.png"],
    ["name", "twitter:card", "summary_large_image"],
  ]) {
    const nodes = document.head.querySelectorAll(`meta[${attribute}="${key}"]`);
    assert.equal(nodes.length, 1, `${key} must be unique`);
    assert.equal(nodes[0].attributes.content, expected);
  }
}

test("metadata updates on direct product entry, product navigation, RU/EN switch, unknown route and return home", () => {
  const document = headDocument();
  const content = (key, property = false) => document.head.querySelectorAll(`meta[${property ? "property" : "name"}="${key}"]`)[0]?.attributes.content;
  for (const [path, language] of [["/products/orange", "ru"], ["/products/lemon", "ru"],
    ["/products/lemon", "en"], ["/products/missing", "en"], ["/", "ru"]]) {
    const metadata = getPageMetadata(path, products, translate(language));
    applyPageMetadata(document, metadata);
    applyPageMetadata(document, metadata);
    assertSocialMetadata(document);
    assert.equal(document.title, metadata.title);
    assert.equal(content("description"), metadata.description);
    assert.equal(content("og:title", true), metadata.title);
    assert.equal(content("og:description", true), metadata.description);
    assert.equal(content("og:url", true), metadata.canonical);
    assert.equal(content("og:site_name", true), "Biler Drinks");
    assert.equal(content("og:type", true), "website");
    assert.equal(content("twitter:title"), metadata.title);
    assert.equal(content("twitter:description"), metadata.description);
    assert.equal(content("robots"), metadata.noindex ? "noindex, follow" : undefined);
    assert.equal(document.head.querySelectorAll('link[rel="canonical"]')[0]?.attributes.href, metadata.canonical);
    const keys = document.nodes.map(node => JSON.stringify([node.tag, node.attributes.name ?? node.attributes.property ?? node.attributes.rel]));
    assert.equal(new Set(keys).size, keys.length);
  }
  const duplicate = document.createElement("meta");
  duplicate.setAttribute("name", "description");
  document.head.appendChild(duplicate);
  applyPageMetadata(document, getPageMetadata("/", products, translate("en")));
  assert.equal(document.head.querySelectorAll('meta[name="description"]').length, 1);
  for (const key of ["og:image", "og:image:width", "og:image:height", "og:image:alt"]) {
    const duplicate = document.createElement("meta");
    duplicate.setAttribute("property", key);
    duplicate.setAttribute("content", "stale value");
    document.head.appendChild(duplicate);
  }
  applyPageMetadata(document, getPageMetadata("/products/orange", products, translate("ru")));
  assertSocialMetadata(document);
});

test("static homepage metadata agrees with runtime defaults and icon assets exist", () => {
  const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
  const metadata = getPageMetadata("/", products, translate("ru"));
  assert(html.includes(`<title>${metadata.title}</title>`));
  assert(html.includes(`content="${metadata.description}"`));
  assert(html.includes(`<link rel="canonical" href="${metadata.canonical}"`));
  for (const key of ["og:type", "og:site_name", "og:title", "og:description", "og:url"]) {
    assert.equal([...html.matchAll(new RegExp(`property="${key}"`, "g"))].length, 1);
  }
  assert.equal(socialImage, "https://bilerdrinks.com/og-image.png");
  for (const [attribute, key, expected] of [
    ["property", "og:image", socialImage],
    ["property", "og:image:width", "1200"],
    ["property", "og:image:height", "630"],
    ["property", "og:image:alt", socialImageAlt],
    ["name", "twitter:image", socialImage],
    ["name", "twitter:card", "summary_large_image"],
  ]) {
    assert(html.includes(`<meta ${attribute}="${key}" content="${expected}" />`));
    assert.equal([...html.matchAll(new RegExp(`${attribute}="${key}"`, "g"))].length, 1);
  }
  assert(!/name="robots"|hreflang=/.test(html));
  assert(html.includes('rel="apple-touch-icon" href="/biler-icon.png"'));
  assert.equal(fs.readFileSync(new URL("../public/biler-icon.png", import.meta.url)).readUInt32BE(0), 0x89504e47);
});

test("social preview is a real 1200x630 PNG at the advertised public path", () => {
  const png = fs.readFileSync(new URL("../public/og-image.png", import.meta.url));
  assert(png.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])));
  assert.equal(png.subarray(12, 16).toString(), "IHDR");
  assert.equal(png.readUInt32BE(16), 1200);
  assert.equal(png.readUInt32BE(20), 630);
});
