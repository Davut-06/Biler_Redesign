import type { Product } from "../data/products";

export const siteUrl = "https://bilerdrinks.com/";
export const siteName = "Biler Drinks";
export const socialImage = "https://bilerdrinks.com/og-image.png";
export const socialImageAlt = "Biler Drinks collection with fruit, mojito and coffee bottles against a mountain backdrop";

export interface PageMetadata {
  title: string;
  description: string;
  canonical?: string;
  noindex: boolean;
}

type Translate = (key: string, fallback?: string) => string;

export function getPageMetadata(pathname: string, products: readonly Product[], t: Translate): PageMetadata {
  if (pathname === "/") return {
    title: siteName,
    description: t("products.description"),
    canonical: siteUrl,
    noindex: false,
  };
  const match = /^\/products\/([^/]+)\/?$/i.exec(pathname);
  let slug: string | undefined;
  try { slug = match ? decodeURIComponent(match[1]) : undefined; } catch { /* Malformed URL is not a product. */ }
  const product = products.find((item) => item.slug === slug);
  if (!product) return {
    title: `${t("productDetail.notFound")} | ${siteName}`,
    description: t("productDetail.notFoundText"),
    noindex: true,
  };
  return {
    title: `${t("productNames." + product.id, product.name)} | ${siteName}`,
    description: t("productDetail.descriptions." + product.id, t(product.descriptionKey)),
    canonical: new URL(`products/${product.slug}`, siteUrl).href,
    noindex: false,
  };
}

// Update the existing static homepage tags in place; remove any stale duplicates.
function setHeadTag(document: Document, selector: string, tag: string, attributes?: Record<string, string>) {
  const [existing, ...duplicates] = Array.from(document.head.querySelectorAll(selector));
  duplicates.forEach((node) => node.remove());
  if (!attributes) { existing?.remove(); return; }
  const node = existing ?? document.createElement(tag);
  for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, value);
  if (!existing) document.head.appendChild(node);
}

export function applyPageMetadata(document: Document, metadata: PageMetadata) {
  document.title = metadata.title;
  const meta = (name: string, content: string | undefined, property = false) => {
    const attribute = property ? "property" : "name";
    setHeadTag(document, `meta[${attribute}="${name}"]`, "meta", content === undefined ? undefined : { [attribute]: name, content });
  };
  meta("description", metadata.description);
  meta("robots", metadata.noindex ? "noindex, follow" : undefined);
  setHeadTag(document, 'link[rel="canonical"]', "link", metadata.canonical ? { rel: "canonical", href: metadata.canonical } : undefined);
  meta("og:type", "website", true);
  meta("og:site_name", siteName, true);
  meta("og:title", metadata.title, true);
  meta("og:description", metadata.description, true);
  meta("og:url", metadata.canonical, true);
  meta("og:image", socialImage, true);
  meta("og:image:width", "1200", true);
  meta("og:image:height", "630", true);
  meta("og:image:alt", socialImageAlt, true);
  meta("twitter:card", "summary_large_image");
  meta("twitter:title", metadata.title);
  meta("twitter:description", metadata.description);
  meta("twitter:image", socialImage);
}
