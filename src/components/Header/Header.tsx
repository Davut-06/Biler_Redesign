import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import logo from "../../assets/brand/biler-header-logo.png";
import styles from "./Header.module.css";

const navigation = [
  ["products", "#products"],
  ["about", "#about"],
  ["partners", "#partners"],
  ["contacts", "#contacts"],
] as const;

export function Header() {
  const { t, i18n } = useTranslation();
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const [activeSection, setActiveSection] = useState("");
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setActiveSection("");
    if (pathname !== "/") return;
    const sections = navigation.flatMap(([key]) => {
      const element = document.getElementById(key);
      return element ? [element] : [];
    });
    let observer: IntersectionObserver;
    const observe = () => {
      observer?.disconnect();
      const offset = (headerRef.current?.getBoundingClientRect().height ?? 88) + 16;
      // A narrow band below the fixed header gives one stable section at a time,
      // independently of section height. Contacts takes precedence when the footer
      // enters the visible viewport, including when it cannot reach the band.
      const update = () => {
        const contacts = document.getElementById("contacts");
        if (contacts && contacts.getBoundingClientRect().top < window.innerHeight - 32) {
          setActiveSection("contacts");
          return;
        }
        const current = [...sections].reverse().find((section) => {
          const rect = section.getBoundingClientRect();
          return rect.top <= offset + 48 && rect.bottom > offset;
        });
        setActiveSection(current?.id ?? "");
      };
      observer = new IntersectionObserver(update, {
        rootMargin: `-${offset}px 0px -${Math.max(0, window.innerHeight - offset - 48)}px 0px`,
        threshold: 0,
      });
      sections.forEach((section) => observer.observe(section));
      footerObserver.disconnect();
      const contacts = document.getElementById("contacts");
      if (contacts) footerObserver.observe(contacts);
      updateRef = update;
      update();
    };
    let updateRef = () => {};
    const footerObserver = new IntersectionObserver(() => updateRef(), {
      rootMargin: "0px 0px -32px 0px", threshold: 0,
    });
    observe();
    window.addEventListener("resize", observe);
    return () => {
      observer.disconnect();
      footerObserver.disconnect();
      window.removeEventListener("resize", observe);
    };
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    const onResize = () => {
      if (window.innerWidth > 1100) setOpen(false);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !headerRef.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <header
      ref={headerRef}
      className={[
        styles.header,
        scrolled ? styles.scrolled : "",
        open ? styles.menuOpen : "",
      ].join(" ")}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <div className={styles.inner}>
        <a
          className={styles.logo}
          href="/#home"
          aria-label={t("header.home")}
          onClick={() => setOpen(false)}
        >
          <img src={logo} alt="Biler" width="72" height="72" />
        </a>
        <nav
          id="main-navigation"
          className={styles.nav}
          aria-label={t("header.label")}
        >
          {navigation.map(([key, href]) => (
            <Link key={key} to={"/" + href} state={{ sectionNavigation: true }} aria-current={pathname === "/" && activeSection === key ? "location" : undefined} onClick={() => setOpen(false)}>
              {t("header." + key)}
            </Link>
          ))}
          <a
            className={styles.mobileCta}
            href="/#partners"
            onClick={() => setOpen(false)}
          >
            {t("header.cta")} <span aria-hidden="true">↗</span>
          </a>
        </nav>
        <div className={styles.actions}>
          <div
            className={styles.languages}
            role="group"
            aria-label={t("header.language")}
          >
            {(["ru", "en"] as const).map((language, index) => (
              <span key={language}>
                {index > 0 && (
                  <span className={styles.separator} aria-hidden="true">
                    /
                  </span>
                )}
                <button
                  type="button"
                  lang={language}
                  aria-label={language === "ru" ? "Русский" : "English"}
                  aria-pressed={i18n.resolvedLanguage === language}
                  onClick={() => void i18n.changeLanguage(language)}
                >
                  {language.toUpperCase()}
                </button>
              </span>
            ))}
          </div>
          <motion.a
            href="/#partners"
            className={styles.cta}
            whileHover={reduceMotion ? undefined : { y: -2 }}
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            {t("header.cta")} <span aria-hidden="true">↗</span>
          </motion.a>
          <button
            ref={toggleRef}
            type="button"
            className={styles.toggle}
            aria-controls="main-navigation"
            aria-expanded={open}
            aria-label={t(open ? "header.close" : "header.open")}
            onClick={() => setOpen((previous) => !previous)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}
