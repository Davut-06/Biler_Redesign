import fs from "node:fs";
import ts from "typescript";

// seo.ts has only a type import, erased by TypeScript. Execute its actual logic
// without importing React, browser state, or Vite's image modules.
export async function loadSeo() {
  const source = fs.readFileSync(new URL("../src/utils/seo.ts", import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
}

export function loadRussianTranslation() {
  const locale = JSON.parse(fs.readFileSync(new URL("../src/locales/ru.json", import.meta.url), "utf8"));
  return (key, fallback) => key.split(".").reduce((value, part) => value?.[part], locale) ?? fallback ?? key;
}
