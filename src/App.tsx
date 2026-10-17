import { useLayoutEffect, useRef } from "react";
import { Routes, Route, useLocation, useNavigationType } from "react-router-dom";
import { ProductDetail } from "./pages/ProductDetail/ProductDetail";
import { MotionConfig } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Header } from "./components/Header/Header";
import { Hero } from "./components/Hero/Hero";
import { ProductShowcase } from "./components/ProductShowcase/ProductShowcase";
import { Benefits } from "./components/Benefits/Benefits";
import { DistributorSection } from "./components/DistributorSection/DistributorSection";
import { Footer } from "./components/Footer/Footer";

import { readCataloguePosition } from "./utils/cataloguePosition";

export default function App() {
  const { t } = useTranslation();
  const location = useLocation();
  const { pathname, hash } = location;
  const navigationType = useNavigationType();
  const previousPath = useRef(pathname);
  useLayoutEffect(() => {
    const saved = readCataloguePosition();
    const fromDetail = previousPath.current.startsWith("/products/");
    previousPath.current = pathname;
    const restore = pathname === "/" && saved && (
      (navigationType === "PUSH" && location.state?.restoreCatalogue && location.state.catalogueKey === saved.key) ||
      (navigationType === "POP" && fromDetail && location.key === saved.key)
    );
    // Restore before paint, then repeat once after the catalogue has mounted.
    if (restore) window.scrollTo({ top: saved.y, behavior: "instant" });
    const frame = requestAnimationFrame(() => {
      if (restore) window.scrollTo({ top: saved.y, behavior: "instant" });
      else if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: location.state?.sectionNavigation && navigationType === "PUSH" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "smooth" : "instant" });
      else window.scrollTo({ top: 0, behavior: "instant" });
      if (pathname !== "/") document.getElementById("main")?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash, location.key, location.state, navigationType]);
  return (
    <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#main">
        {t("skip")}
      </a>
      <Header />
      <main id="main" tabIndex={-1}>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Hero />
                <ProductShowcase />
                <Benefits />
                <DistributorSection />
              </>
            }
          />
          <Route path="/products/:slug" element={<ProductDetail />} />
          <Route path="*" element={<ProductDetail />} />
        </Routes>
      </main>
      {pathname === "/" && <Footer />}
    </MotionConfig>
  );
}
