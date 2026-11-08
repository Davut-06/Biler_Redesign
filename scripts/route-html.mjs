export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

export function decodeHtml(value) {
  return value.replace(/&(amp|lt|gt|quot|#39);/g, (_, entity) => ({
    amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'",
  })[entity]);
}

// Read only the controlled, quoted attributes emitted by Vite and this generator.
export function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)]
    .map(([, key, double, single]) => [key.toLowerCase(), decodeHtml(double ?? single)]));
}

export function metadataEntries(metadata) {
  return [
    ["meta", { name: "description", content: metadata.description }],
    ["link", { rel: "canonical", href: metadata.canonical }],
    ["meta", { property: "og:title", content: metadata.title }],
    ["meta", { property: "og:description", content: metadata.description }],
    ["meta", { property: "og:url", content: metadata.canonical }],
    ["meta", { name: "twitter:title", content: metadata.title }],
    ["meta", { name: "twitter:description", content: metadata.description }],
  ];
}

export function renderRouteHtml(template, metadata) {
  if (!metadata.canonical || metadata.noindex) throw new Error("Only known, indexable product routes may be generated");
  if (!/<head\b[^>]*>[\s\S]*?<\/head>/i.test(template)) throw new Error("Missing HTML head");
  return template.replace(/(<head\b[^>]*>)([\s\S]*?)(<\/head>)/i, (_, open, head, close) => {
    const entries = metadataEntries(metadata);
    // Replace managed tags as a group so even stale duplicates cannot survive.
    const retained = head.replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, "")
      .replace(/<(meta|link)\b[^>]*>/gi, (tag, kind) => {
        const values = attributes(tag);
        if (kind.toLowerCase() === "meta" && values.name === "robots") return "";
        return entries.some(([entryKind, entry]) => kind.toLowerCase() === entryKind
          && (entry.name ? values.name === entry.name : entry.property ? values.property === entry.property : values.rel === entry.rel)) ? "" : tag;
      });
    const tags = entries.map(([kind, values]) => `<${kind} ${Object.entries(values)
      .map(([key, value]) => `${key}="${escapeHtml(value)}"`).join(" ")} />`);
    return `${open}${retained.trimEnd()}\n<title>${escapeHtml(metadata.title)}</title>\n${tags.join("\n")}\n${close}`;
  });
}
