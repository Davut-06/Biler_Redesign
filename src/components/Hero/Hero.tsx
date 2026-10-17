import { useRef, type CSSProperties } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { products } from "../../data/products";
import mountainBackground from "../../assets/backgrounds/hero-mountains.png";
import splashLeft from "../../assets/hero/splash-left.png";
import splashRight from "../../assets/hero/splash-right.png";
import droplets from "../../assets/hero/droplets.png";
import iceLeft from "../../assets/hero/ice-left.png";
import iceRight from "../../assets/hero/ice-right.png";
import styles from "./Hero.module.css";

const heroBottles = [
  { id: "orange", position: "outerLeft" },
  { id: "smorodina", position: "outerRight" },
  { id: "mohito-classic", position: "left" },
  { id: "raspberry", position: "right" },
  { id: "berry", position: "center" },
].map((slot) => ({
  ...products.find((product) => product.id === slot.id)!,
  position: slot.position,
}));

const benefitKeys = ["taste", "quality", "refreshment"] as const;

function Arrow() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 12h14m-6-6 6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Hero() {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const sceneRef = useRef<HTMLElement>(null);
  const sceneVisible = useInView(sceneRef);
  const hover = reduceMotion ? undefined : { y: -3 };
  return (
    <section id="home" className={styles.hero} aria-labelledby="hero-title">
      <img
        className={styles.mountains}
        src={mountainBackground}
        alt=""
        aria-hidden="true"
        fetchPriority="high"
        decoding="async"
      />
      <div className={styles.darkOverlay} aria-hidden="true" />
      <div className={styles.blueLight} aria-hidden="true" />
      <div className={styles.redLight} aria-hidden="true" />
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>
            <span aria-hidden="true" />
            BILER DRINKS
          </p>
          <motion.h1
            id="hero-title"
            className={styles.headline}
            initial={{ opacity: 0, y: reduceMotion ? 0 : 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reduceMotion ? 0 : 0.65,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <span>{t("hero.lineOne")}</span>
            <span>{t("hero.lineTwo")}</span>
            <span className={styles.accent}>{t("hero.lineThree")}</span>
          </motion.h1>
          <p className={styles.description}>{t("hero.description")}</p>
          <div className={styles.buttons}>
            <motion.a
              className={styles.primary}
              href="#products"
              whileHover={hover}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              {t("hero.cta")}
              <Arrow />
            </motion.a>
            <motion.a
              className={styles.secondary}
              href="#partners"
              whileHover={hover}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              {t("hero.secondary")}
            </motion.a>
          </div>
          <ul className={styles.benefits} aria-label={t("hero.benefitsLabel")}>
            {benefitKeys.map((key, index) => (
              <li key={key}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  {index === 0 && (
                    <path d="m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4L12 3Z" />
                  )}
                  {index === 1 && (
                    <>
                      <path d="m12 3 7 3v6c0 4-7 9-7 9s-7-5-7-9V6l7-3Z" />
                      <path d="m8.5 12 2.5 2.5 4.5-5" />
                    </>
                  )}
                  {index === 2 && (
                    <path d="M12 3S5 11 5 15a7 7 0 0 0 14 0c0-4-7-12-7-12Zm-3 12a3 3 0 0 0 3 3" />
                  )}
                </svg>
                <span>{t("hero.benefits." + key)}</span>
              </li>
            ))}
          </ul>
        </div>
        <motion.figure
          ref={sceneRef}
          data-motion={sceneVisible && !reduceMotion ? "active" : "paused"}
          className={styles.composition}
          aria-label={t("hero.composition")}
          initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: reduceMotion ? 0 : 0.9,
            delay: reduceMotion ? 0 : 0.12,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <div className={styles.spotlight} aria-hidden="true" />
          <div className={styles.ground} aria-hidden="true" />
          <div className={styles.waterBehind} aria-hidden="true">
            <img
              className={styles.splashLeft}
              src={splashLeft}
              alt=""
              decoding="async"
            />
            <img
              className={styles.splashRight}
              src={splashRight}
              alt=""
              decoding="async"
            />
          </div>
          <img
            className={styles.droplets}
            src={droplets}
            alt=""
            aria-hidden="true"
            decoding="async"
          />
          <div className={styles.foregroundIce} aria-hidden="true">
            <img
              className={styles.iceLeft}
              src={iceLeft}
              alt=""
              decoding="async"
            />
            <img
              className={styles.iceRight}
              src={iceRight}
              alt=""
              decoding="async"
            />
          </div>
          <div className={styles.atmosphere} aria-hidden="true">
            <span className={styles.mist} />
          </div>
          {heroBottles.map((bottle, index) => (
            <div
              key={bottle.id}
              data-bottle={bottle.id}
              style={
                {
                  "--image-scale": bottle.imageScale + "%",
                  "--image-bottom": bottle.imageBottom + "%",
                  "--float-height":
                    bottle.position === "center" ? "-6px" : "-3px",
                  "--float-duration":
                    (bottle.position === "center" ? 5.8 : 6.2 + index * 0.35) +
                    "s",
                  "--float-delay": -index * 0.8 + "s",
                } as CSSProperties
              }
              className={styles.bottle + " " + styles[bottle.position]}
            >
              <div className={styles.reflection} aria-hidden="true">
                <img src={bottle.image} alt="" decoding="async" />
              </div>
              <span className={styles.bottleShadow} aria-hidden="true" />
              <motion.div
                className={styles.bottleEntrance}
                initial={
                  reduceMotion ? false : { opacity: 0, y: 16, scale: 0.98 }
                }
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: reduceMotion ? 0 : 0.8,
                  delay: reduceMotion ? 0 : index * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <div className={styles.float}>
                  <img
                    src={bottle.image}
                    alt={t("productNames." + bottle.id, {
                      defaultValue: bottle.name,
                    })}
                    width="240"
                    height="480"
                    fetchPriority={
                      bottle.position === "center" ? "high" : "auto"
                    }
                    decoding="async"
                  />
                </div>
              </motion.div>
            </div>
          ))}
        </motion.figure>
      </div>
      <div className={styles.bottom}>
        <span className={styles.categoryLine}>
          MOJITO <b aria-hidden="true">•</b> VITAMINIZED{" "}
          <b aria-hidden="true">•</b> COFFEE <b aria-hidden="true">•</b> WATER
        </span>
        <a href="#products">
          {t("hero.scroll")}
          <span aria-hidden="true">↓</span>
        </a>
      </div>
    </section>
  );
}
