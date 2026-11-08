// Start Vite and a headless Chrome with --remote-debugging-port=9346.
// No form submissions or EmailJS requests are made by this test.
import assert from "node:assert/strict";
import fs from "node:fs";
import { loadProducts } from "../scripts/load-products.mjs";

const base = process.env.SEO_TEST_URL ?? "http://127.0.0.1:5174";
const pages = await (await fetch("http://127.0.0.1:9346/json")).json();
const ws = new WebSocket(pages.find(page => page.type === "page").webSocketDebuggerUrl);
await new Promise(resolve => { ws.onopen = resolve; });
let id = 0;
const pending = new Map();
ws.onmessage = event => {
  const message = JSON.parse(event.data);
  if (message.id) { pending.get(message.id)?.(message); pending.delete(message.id); }
};
const call = (method, params = {}) => new Promise((resolve, reject) => {
  const requestId = ++id;
  const timer = setTimeout(() => { pending.delete(requestId); reject(new Error(`CDP timeout: ${method}`)); }, 15000);
  pending.set(requestId, message => { clearTimeout(timer); message.error ? reject(new Error(JSON.stringify(message.error))) : resolve(message.result); });
  ws.send(JSON.stringify({ id: requestId, method, params }));
});
const evaluate = async expression => {
  const result = await call("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
};
const until = async expression => {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (await evaluate(expression)) return;
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  throw new Error(`Timed out: ${expression}`);
};
const read = () => evaluate(`({title:document.title,lang:document.documentElement.lang,
  description:document.querySelector('meta[name="description"]')?.content,
  canonical:document.querySelector('link[rel="canonical"]')?.href,
  ogTitle:document.querySelector('meta[property="og:title"]')?.content,
  ogDescription:document.querySelector('meta[property="og:description"]')?.content,
  ogUrl:document.querySelector('meta[property="og:url"]')?.content,
  twitterTitle:document.querySelector('meta[name="twitter:title"]')?.content,
  robots:document.querySelector('meta[name="robots"]')?.content,
  canonicalCount:document.querySelectorAll('link[rel="canonical"]').length,
  descriptionCount:document.querySelectorAll('meta[name="description"]').length})`);

try {
  await call("Page.enable");
  // Direct entry for every actual product, with both language selections.
  for (const language of ["ru", "en"]) {
    const locale = JSON.parse(fs.readFileSync(new URL(`../src/locales/${language}.json`, import.meta.url), "utf8"));
    for (const product of await loadProducts()) {
      await call("Page.navigate", { url: `${base}/products/${product.slug}` });
      await until(`!!document.querySelector('button[lang="${language}"]') && !!document.querySelector('[data-detail="${product.slug}"]')`);
      await evaluate(`document.querySelector('button[lang="${language}"]').click()`);
      const title = `${locale.productNames[product.id]} | Biler Drinks`;
      await until(`document.title===${JSON.stringify(title)}`);
      const state = await read();
      assert.equal(state.lang, language);
      assert.equal(state.description, locale.productDetail.descriptions[product.id]);
      assert.equal(state.ogDescription, state.description);
      assert.equal(state.canonical, `https://bilerdrinks.com/products/${product.slug}`);
      assert.equal(state.ogUrl, state.canonical);
      assert.equal(state.ogTitle, title);
      assert.equal(state.twitterTitle, title);
      assert.equal(state.robots, undefined);
      assert.equal(state.canonicalCount, 1);
      assert.equal(state.descriptionCount, 1);
    }
    console.log(`PASS all 14 direct product loads and ${language} metadata/language`);
  }
  // Use real React Router links to check transitions without a document reload.
  await evaluate(`window.__seoNavigationMarker=true;document.querySelector('main a[href="/#products"]').click()`);
  await until(`location.pathname==='/' && document.title==='Biler Drinks'`);
  assert.equal((await read()).canonical, "https://bilerdrinks.com/");
  await evaluate(`document.querySelector('a[href="/products/orange"]').click()`);
  await until(`location.pathname==='/products/orange' && document.title==='Orange | Biler Drinks'`);
  assert.equal(await evaluate("window.__seoNavigationMarker"), true);
  console.log("PASS client navigation product → home → product");
  await call("Page.navigate", { url: `${base}/products/missing-product` });
  await until(`document.querySelector('meta[name="robots"]')?.content==='noindex, follow'`);
  assert.equal((await read()).canonicalCount, 0);
  await evaluate(`document.querySelector('main a[href="/#products"]').click()`);
  await until(`location.pathname==='/' && !document.querySelector('meta[name="robots"]')`);
  assert.equal((await read()).canonicalCount, 1);
  console.log("PASS unknown product noindex and recovery to indexable homepage");
} finally {
  ws.close();
}
