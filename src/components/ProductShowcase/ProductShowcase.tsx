import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { Link, useLocation, useNavigationType } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { products, type ProductCategory } from "../../data/products";
import { Reveal } from "../shared/Reveal";
import styles from "./ProductShowcase.module.css";
import { readCataloguePosition, saveCataloguePosition } from "../../utils/cataloguePosition";
const categories = ["all", "mohito", "vitaminized", "coffee", "water"] as const;
export function ProductShowcase() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigationType = useNavigationType();
  const saved = readCataloguePosition();
  const returning = saved && ((navigationType === "PUSH" && location.state?.restoreCatalogue && location.state.catalogueKey === saved.key) || (navigationType === "POP" && location.key === saved.key));
  const initialPosition = useRef(returning ? saved : undefined);
  const [category, setCategory] = useState<ProductCategory | "all">(initialPosition.current?.category ?? "all");
  const carousel = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (initialPosition.current?.category !== category) initialPosition.current = undefined;
    const position = initialPosition.current;
    carousel.current?.scrollTo({ left: position?.x ?? 0, behavior: "instant" });
  }, [category]);
  const visible = products.filter(
    (p) => category === "all" || p.category === category,
  );
  return (
    <section
      id="products"
      className={"section " + styles.section}
      aria-labelledby="products-title"
    >
      <div className="container">
        <Reveal className="section-heading">
          <div>
            <p className="eyebrow">{t("products.eyebrow")}</p>
            <h2 className="display-title" id="products-title">
              <span>{t("products.title")}</span>
              <span>{t("products.titleSecond")}</span>
            </h2>
          </div>
          <p>{t("products.description")}</p>
        </Reveal>
        <div
          className={styles.filters}
          role="group"
          aria-label={t("products.filter")}
        >
          {categories.map((item) => (
            <button
              type="button"
              key={item}
              aria-pressed={item === category}
              onClick={() => {
                setCategory(item);
                carousel.current?.scrollTo({ left: 0, behavior: "instant" });
              }}
            >
              {t("categories." + item)}
            </button>
          ))}
        </div>
        <div key={category} ref={carousel} className={styles.grid}>
          {visible.map((product) => {
            const name = t("productNames." + product.id, {
              defaultValue: product.name,
            });
            return (
              <Link
                key={product.id}
                to={"/products/" + product.slug}
                state={{ catalogueKey: location.key }}
                onClick={(event) => {
                  if (event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
                    saveCataloguePosition({ key: location.key, y: window.scrollY, x: carousel.current?.scrollLeft ?? 0, category });
                  }
                }}
                className={styles.card}
                data-product={product.id}
                style={{ "--accent": product.accent } as CSSProperties}
                aria-label={name + ": " + t("productDetail.view")}
              >
                <span className={styles.category}>
                  {t("categories." + product.category)}
                </span>
                <div className={styles.visual}>
                  <span className={styles.glow} aria-hidden="true" />
                  <img
                    src={product.image}
                    alt={name}
                    loading="lazy"
                    draggable={false}
                  />
                </div>
                <div className={styles.copy}>
                  <h3>{name}</h3>
                  <p>{t(product.descriptionKey)}</p>
                  <div className={styles.meta}>
                    <span>
                      {new Intl.NumberFormat(i18n.language, {
                        style: "unit",
                        unit: "milliliter",
                        unitDisplay: "short",
                      }).format(product.volume)}
                    </span>
                    <span>
                      {t("productDetail.view")}{" "}
                      <span aria-hidden="true">↗</span>
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        <p className="sr-only" role="status">
          {t("products.count", { count: visible.length })}
        </p>
      </div>
    </section>
  );
}
