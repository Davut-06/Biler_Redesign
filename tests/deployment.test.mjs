import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const config = fs.readFileSync(new URL("../public/.htaccess", import.meta.url), "utf8");

test("optional Apache compatibility fallback is guarded and requires a missing file and directory", () => {
  const block = /<IfModule mod_rewrite\.c>([\s\S]*?)<\/IfModule>/.exec(config)?.[1];
  assert(block, "mod_rewrite must be optional rather than causing an unknown-directive 500");
  const directives = block.split(/\r?\n/).map(line => line.trim()).filter(line => line && !line.startsWith("#"));
  assert.deepEqual(directives, [
    "RewriteEngine On",
    "RewriteCond %{REQUEST_FILENAME} !-f",
    "RewriteCond %{REQUEST_FILENAME} !-d",
    "RewriteRule ^ index.html [L]",
  ]);
  assert(!/\b(?:Options|DirectoryIndex|ErrorDocument|ExpiresActive|Redirect)\b/.test(config));
});

test("cache directives are guarded, immutable only for fingerprints, and HTML revalidates", () => {
  const block = /<IfModule mod_headers\.c>([\s\S]*?)<\/IfModule>/.exec(config)?.[1];
  assert(block);
  const [, pattern, headers] = /<FilesMatch "([^"]+)">([\s\S]*?)<\/FilesMatch>/.exec(block);
  assert.match(headers, /Header set Cache-Control "public, max-age=31536000, immutable"/);
  const fingerprint = new RegExp(pattern);
  for (const file of ["index-DdlJ7BBN.js", "index-CgsFYEZE.css", "orange-oqdF8Le0.webp", "Oswald-Bold-CHB0NlSS.ttf"]) {
    assert(fingerprint.test(file), file);
  }
  for (const file of ["index.html", "robots.txt", "sitemap.xml", "og-image.png", "biler-icon.png", "favicon.svg", "app.js", "photo-source.png"]) {
    assert(!fingerprint.test(file), file);
  }
  assert.match(block, /<Files "index\.html">\s*Header set Cache-Control "no-cache, max-age=0, must-revalidate"\s*<\/Files>/);
});
