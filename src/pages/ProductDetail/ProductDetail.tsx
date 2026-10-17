import { useEffect, useState, type CSSProperties } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { products } from "../../data/products";
import styles from "./ProductDetail.module.css";

export function ProductDetail() {
  const { slug } = useParams();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const product = products.find((p) => p.slug === slug);
  const [readyScene, setReadyScene] = useState<string>();
  useEffect(() => {
    let cancelled = false;
    if (!product) return;
    const source = product.image;
    const sources = [source];
    // Reveal the bottle and its CSS lighting together after decoding.
    void Promise.all(sources.map((src) => {
      const image = new Image();
      image.src = src;
      return image.decode().catch(() => undefined);
    })).then(() => { if (!cancelled) setReadyScene(source); });
    return () => { cancelled = true; };
  }, [product]);
  const name = product
    ? t("productNames." + product.id, { defaultValue: product.name })
    : t("productDetail.notFound");
  useEffect(() => {
    const previous = document.title;
    document.title = name + " | Biler";
    return () => {
      document.title = previous;
    };
  }, [name]);
  const back = (
    <Link className={styles.back} to="/#products" state={{ restoreCatalogue: true, catalogueKey: location.state?.catalogueKey }}>
      <svg className={styles.backArrow} viewBox="0 0 32 20" fill="none" aria-hidden="true" focusable="false">
        <path d="M29 10H3m7-7-7 7 7 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {t("productDetail.back")}
    </Link>
  );
  if (!product)
    return (
      <section className={styles.page}>
        <div className="container">
          {back}
          <h1>{name}</h1>
          <p>{t("productDetail.notFoundText")}</p>
        </div>
      </section>
    );
  return (
    <section
      className={styles.page}
      data-detail={product.slug}
      style={{
        "--accent": product.accent,

      } as CSSProperties}
    >
      <div className="container">
        {back}
        <div className={styles.layout}>
          <div className={styles.heading}>
            <p className={styles.category}>
              {t("categories." + product.category)}
            </p>
            <h1>{name}</h1>
          </div>
          <div className={styles.visual} data-ready={readyScene === product.image}>
            <span className={styles.glow} aria-hidden="true" />
            <div className={styles.scene} data-ready={readyScene === product.image}>
              <img className={styles.bottle} src={product.image} alt={name}
                loading="eager" fetchPriority="high" />
            </div>
            <span className={styles.floor} aria-hidden="true" />
          </div>
          <p className={styles.description}>{t("productDetail.descriptions." + product.id, { defaultValue: t(product.descriptionKey) })}</p>
          <div className={styles.infoBar} data-vitamins={product.vitamins.length > 0}>
            <div className={styles.highlights}>
              <div
                className={styles.volume}
                aria-label={t("productDetail.volume")}
              >
                <span className={styles.metricLabel}>
                  {t("productDetail.volume")}
                </span>
                <div>
                  {new Intl.NumberFormat(i18n.language, {
                    style: "unit",
                    unit: "milliliter",
                    unitDisplay: "short",
                  })
                    .formatToParts(product.volume)
                    .map((part, index) => (
                      <span
                        key={index}
                        className={
                          part.type === "integer" ? styles.number : styles.unit
                        }
                      >
                        {part.value}
                      </span>
                    ))}
                </div>
              </div>
              {product.vitamins.length > 0 && (
                <section className={styles.vitamins} aria-labelledby="vitamins-title">
                  <h2 id="vitamins-title">{t("productDetail.vitamins")}</h2>
                  <ul className={styles.badges}>
                    {product.vitamins.map((vitamin) => (
                      <li className={styles.badge} key={vitamin.name}>
                        <strong>{vitamin.name.replace(/^(?:vitamin|витамин)\s+/i, "")}</strong>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
            <ul className={styles.features}>
              {(
                [
                  "refreshing",
                  "vitaminized",
                  "nonAlcoholic",
                  "carbonated",
                ] as const
              )
                .filter((feature) =>
                  (feature !== "vitaminized" || product.vitamins.length > 0) &&
                  (feature !== "carbonated" || product.id !== "cold-coffee")
                )
                .map((feature) => (
                <li className={styles.featureChip} key={feature}>
                  <span className={styles.featureIcon}>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    {feature === "refreshing" ? (
                      <>
                        <path d="M10 3.5C7.8 6.6 4.5 10.1 4.5 14a5.5 5.5 0 0 0 11 0c0-1.2-.4-2.5-1-3.7M7.5 14a2.5 2.5 0 0 0 2.5 2.5" />
                        <path d="m18 2 1.2 3.8L23 7l-3.8 1.2L18 12l-1.2-3.8L13 7l3.8-1.2L18 2Z" />
                      </>
                    ) : feature === "vitaminized" ? (
                      <>
                        <path d="m10 3 2.2 6.8L19 12l-6.8 2.2L10 21l-2.2-6.8L1 12l6.8-2.2L10 3Z" />
                        <path d="M19 2v5m-2.5-2.5h5" />
                      </>
                    ) : feature === "nonAlcoholic" ? (
                      <path d="M7 3h10l-.7 6M7.5 7l.5 5a4 4 0 0 0 7.5 1.8M12 16v5m-4 0h8M3 3l18 18M8 8h4" />
                    ) : (
                      <>
                        <circle cx="8" cy="16" r="4" />
                        <circle cx="16" cy="9" r="3" />
                        <circle cx="9" cy="3.5" r="1.5" />
                        <path d="M18 17v3m-1.5-1.5h3" />
                      </>
                    )}
                  </svg>
                  </span>
                  <span className={styles.featureLabel}>{t("productDetail.features." + feature)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
