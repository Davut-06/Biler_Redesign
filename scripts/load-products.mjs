import fs from "node:fs";
import ts from "typescript";

// Run the real catalogue/slug mapping in Node. Only Vite's image imports and
// image globs are replaced; no product identifiers or routing rules are copied.
export async function loadProducts() {
  const source = fs.readFileSync(new URL("../src/data/products.ts", import.meta.url), "utf8");
  const { outputText, diagnostics } = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
    reportDiagnostics: true,
    transformers: { before: [context => {
      const visit = node => {
        if (ts.isImportDeclaration(node) && node.moduleSpecifier.text.endsWith(".webp")) {
          return ts.factory.createVariableStatement(undefined, ts.factory.createVariableDeclarationList([
            ts.factory.createVariableDeclaration(node.importClause.name, undefined, undefined,
              ts.factory.createStringLiteral(node.moduleSpecifier.text)),
          ], ts.NodeFlags.Const));
        }
        if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)
          && node.expression.getText() === "import.meta.glob") {
          return ts.factory.createObjectLiteralExpression();
        }
        return ts.visitEachChild(node, visit, context);
      };
      return node => ts.visitNode(node, visit);
    }] },
  });
  if (diagnostics?.length) throw new Error("Could not compile product data");
  return (await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`)).products;
}
