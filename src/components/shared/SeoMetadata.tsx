import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { products } from "../../data/products";
import { applyPageMetadata, getPageMetadata } from "../../utils/seo";

export function SeoMetadata() {
  const { pathname } = useLocation();
  const { t, i18n } = useTranslation();
  useLayoutEffect(() => {
    applyPageMetadata(document, getPageMetadata(pathname, products,
      (key, fallback) => t(key, { defaultValue: fallback })));
  }, [pathname, t, i18n.language]);
  return null;
}
