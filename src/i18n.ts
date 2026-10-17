import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ru from "./locales/ru.json";
import en from "./locales/en.json";
let language = "ru";
try {
  language = localStorage.getItem("biler-language") === "en" ? "en" : "ru";
} catch {
  /* Storage is optional. */
}
void i18n.use(initReactI18next).init({
  resources: { ru: { translation: ru }, en: { translation: en } },
  lng: language,
  fallbackLng: "en",
  supportedLngs: ["ru", "en"],
  interpolation: { escapeValue: false },
});
document.documentElement.lang = language;
i18n.on("languageChanged", (next) => {
  document.documentElement.lang = next;
  try {
    localStorage.setItem("biler-language", next);
  } catch {
    /* Storage is optional. */
  }
});
export default i18n;
