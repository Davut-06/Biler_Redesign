// Local test fixture: real files/directory indexes only, deliberately NO SPA fallback.
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../dist/", import.meta.url));
export function createStaticHost() {
  return http.createServer((request, response) => {
    const url = new URL(request.url, "http://localhost");
    let pathname;
    try { pathname = decodeURIComponent(url.pathname); } catch { response.writeHead(400).end(); return; }
    let file = path.resolve(root, "." + pathname);
    const relative = path.relative(root, file);
    if (relative.startsWith("..") || path.isAbsolute(relative)) { response.writeHead(403).end(); return; }
    if (!fs.existsSync(file)) { response.writeHead(404).end("Not found"); return; }
    if (fs.statSync(file).isDirectory()) {
      if (!url.pathname.endsWith("/")) { response.writeHead(301, { Location: url.pathname + "/" + url.search }).end(); return; }
      file = path.join(file, "index.html");
    }
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) { response.writeHead(404).end("Not found"); return; }
    const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".webp": "image/webp", ".svg": "image/svg+xml", ".xml": "application/xml", ".txt": "text/plain", ".ttf": "font/ttf" };
    response.writeHead(200, { "Content-Type": mime[path.extname(file)] ?? "application/octet-stream" });
    if (request.method === "HEAD") response.end();
    else fs.createReadStream(file).pipe(response);
  });
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  createStaticHost().listen(5187, "127.0.0.1", () => console.log("No-fallback static test host: http://127.0.0.1:5187"));
}
