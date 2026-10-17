import { useTranslation } from "react-i18next";
import logo from "../../assets/brand/biler-header-logo.png";
import { Icon } from "../shared/Icon";
import styles from "./Footer.module.css";

export function Footer() {
  const { t, i18n } = useTranslation();
  return (
    <footer id="contacts" className={styles.footer}>
      <div className="container">
        <div className={styles.top}>
          <div className={styles.brand}>
            <a href="#home" aria-label={t("header.home")}>
              <img src={logo} alt="Biler" width="86" height="86" />
            </a>
            <p>{t("footer.tagline")}</p>
          </div>
          <div className={styles.statement}>
            {t("footer.statement")}
            <span>BILER DRINKS</span>
          </div>
        </div>
        <div className={styles.grid}>
          <nav aria-label={t("footer.products")}>
            <h3>{t("footer.products")}</h3>
            <a href="#products">Mohito Collection</a>
            <a href="#products">Pineapple Vitaminized</a>
            <a href="#products">{t("footer.coffeeWater")}</a>
          </nav>
          <nav aria-label={t("footer.partners")}>
            <h3>{t("footer.partners")}</h3>
            <a href="#partners">{t("header.cta")}</a>
            <a href="#about">{t("header.about")}</a>
            <a href="mailto:biler.distribute@gmail.com">
              {t("footer.distribution")}
            </a>
          </nav>
          <div>
            <h3>{t("footer.contact")}</h3>
            <a href="mailto:biler.drinks@gmail.com">biler.drinks@gmail.com</a>
            <a href="tel:+99362892970">+993 62 89 29 70</a>
            <a href="tel:+99361429401">+993 61 42 94 01</a>
          </div>
          <div>
            <h3>{t("footer.follow")}</h3>
            <div className={styles.socials}>
              <a
                href="https://www.instagram.com/biler.drinks"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t("footer.instagram")}
              >
                <Icon name="instagram" />
              </a>
              <a
                href="https://wa.me/99362892970"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t("footer.whatsapp")}
              >
                <Icon name="chat" />
              </a>
            </div>
            <div
              className={styles.languages}
              role="group"
              aria-label={t("header.language")}
            >
              {(["ru", "en"] as const).map((language) => (
                <button
                  key={language}
                  type="button"
                  lang={language}
                  aria-label={language === "ru" ? "Русский" : "English"}
                  aria-pressed={i18n.resolvedLanguage === language}
                  onClick={() => void i18n.changeLanguage(language)}
                >
                  {language.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className={styles.bottom}>
          <span>
            © {new Date().getFullYear()} Biler Drinks. {t("footer.rights")}
          </span>
          <a href="#home">
            {t("footer.top")}
            <Icon name="arrow" width="16" height="16" />
          </a>
        </div>
      </div>
    </footer>
  );
}
