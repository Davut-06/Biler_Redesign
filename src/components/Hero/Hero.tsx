import { useRef, type CSSProperties, type ImgHTMLAttributes } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { products } from "../../data/products";
import mountainBackground from "../../assets/optimized/backgrounds/hero-mountains.webp";
import splashLeft from "../../assets/optimized/hero/splash-left.webp";
import splashRight from "../../assets/optimized/hero/splash-right.webp";
import droplets from "../../assets/optimized/hero/droplets.webp";
import iceLeft from "../../assets/optimized/hero/ice-left.webp";
import iceRight from "../../assets/optimized/hero/ice-right.webp";
import mobileMountains from "../../assets/optimized/backgrounds/mobile/hero-mountains.webp";
import mobileSplashLeft from "../../assets/optimized/hero/mobile/splash-left.webp";
import mobileIceLeft from "../../assets/optimized/hero/mobile/ice-left.webp";
import mobileIceRight from "../../assets/optimized/hero/mobile/ice-right.webp";
import styles from "./Hero.module.css";

const bottleImages = import.meta.glob<string>("../../assets/optimized/hero/{bottles,mobile/bottles}/*.webp", {
  eager: true, query: "?url", import: "default",
});
const heroBottles = [
  { id: "orange", position: "outerLeft" },
  { id: "smorodina", position: "outerRight" },
  { id: "mohito-classic", position: "left" },
  { id: "raspberry", position: "right" },
  { id: "berry", position: "center" },
].map((slot) => {
  const product = products.find((product) => product.id === slot.id)!;
  const filename = product.imagePath.split("/").at(-1)!;
  return {
    ...product,
    image: bottleImages["../../assets/optimized/hero/bottles/" + filename],
    mobileImage: bottleImages["../../assets/optimized/hero/mobile/bottles/" + filename],
    position: slot.position,
  };
});

const benefitKeys = ["taste", "quality", "refreshment"] as const;

// Match the existing 600px visibility breakpoint without fetching hidden artwork.
const transparentPixel = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
function HeroImage({ desktopOnly = false, mobileSrc, ...props }: ImgHTMLAttributes<HTMLImageElement> & { desktopOnly?: boolean; mobileSrc?: string }) {
  if (!desktopOnly && !mobileSrc) return <img {...props} />;
  return (
    <picture className={styles.responsiveImage}>
      <source media="(max-width: 600px)" srcSet={desktopOnly ? transparentPixel : mobileSrc} />
      <img {...props} />
    </picture>
  );
}

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
  return (
    <section id="home" className={styles.hero} aria-labelledby="hero-title">
      <HeroImage
        className={styles.mountains}
        src={mountainBackground}
        mobileSrc={mobileMountains}
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
            <a
              className={styles.primary}
              href="#products"
            >
              {t("hero.cta")}
              <Arrow />
            </a>
            <a
              className={styles.secondary}
              href="#partners"
            >
              {t("hero.secondary")}
            </a>
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
            <HeroImage
              className={styles.splashLeft}
              src={splashLeft}
              mobileSrc={mobileSplashLeft}
              alt=""
              decoding="async"
            />
            <HeroImage
              desktopOnly
              className={styles.splashRight}
              src={splashRight}
              alt=""
              decoding="async"
            />
          </div>
          <HeroImage
            desktopOnly
            className={styles.droplets}
            src={droplets}
            alt=""
            aria-hidden="true"
            decoding="async"
          />
          <div className={styles.foregroundIce} aria-hidden="true">
            <HeroImage
              className={styles.iceLeft}
              src={iceLeft}
              mobileSrc={mobileIceLeft}
              alt=""
              decoding="async"
            />
            <HeroImage
              className={styles.iceRight}
              src={iceRight}
              mobileSrc={mobileIceRight}
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
                <HeroImage desktopOnly={bottle.position === "outerLeft" || bottle.position === "outerRight"} src={bottle.image} mobileSrc={bottle.mobileImage} alt="" decoding="async" />
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
                  <HeroImage
                    desktopOnly={bottle.position === "outerLeft" || bottle.position === "outerRight"}
                    src={bottle.image}
                    mobileSrc={bottle.mobileImage}
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
