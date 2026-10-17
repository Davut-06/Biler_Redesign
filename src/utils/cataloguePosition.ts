import type { ProductCategory } from "../data/products";

type CataloguePosition = { key: string; y: number; x: number; category: ProductCategory | "all" };
const storageKey = "biler-catalogue-position";
export function readCataloguePosition(): CataloguePosition | undefined {
  try {
    const value = JSON.parse(sessionStorage.getItem(storageKey) ?? "null");
    if (value && typeof value.key === "string" && Number.isFinite(value.y) && value.y >= 0 && Number.isFinite(value.x) && value.x >= 0 && ["all", "mohito", "vitaminized", "coffee", "water"].includes(value.category)) return value;
  } catch { /* Storage is optional. */ }
}
export function saveCataloguePosition(value: CataloguePosition) {
  try { sessionStorage.setItem(storageKey, JSON.stringify(value)); } catch { /* Use the normal products anchor when storage is unavailable. */ }
}
