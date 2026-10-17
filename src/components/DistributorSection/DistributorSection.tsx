import { useState, type FormEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Icon } from "../shared/Icon";
import { Reveal } from "../shared/Reveal";
import styles from "./DistributorSection.module.css";

const fields = [
  {
    name: "company",
    type: "text",
    autoComplete: "organization",
    maxLength: 160,
  },
  { name: "name", type: "text", autoComplete: "name", maxLength: 120 },
  { name: "phone", type: "tel", autoComplete: "tel", maxLength: 50 },
  { name: "email", type: "email", autoComplete: "email", maxLength: 200 },
] as const;
export function DistributorSection() {
  const { t } = useTranslation();
  const reduced = useReducedMotion();
  const [draft, setDraft] = useState("");
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    for (const field of fields) {
      if (!String(data.get(field.name) ?? "").trim()) {
        const input = form.elements.namedItem(field.name) as HTMLInputElement;
        input.setCustomValidity(t("partner.required"));
        input.reportValidity();
        return;
      }
    }
    const body = fields
      .map(
        (field) =>
          t("partner.fields." + field.name) +
          ": " +
          String(data.get(field.name)).trim(),
      )
      .join("\n");
    setDraft(
      "mailto:biler.distribute@gmail.com?subject=" +
        encodeURIComponent(t("partner.subject")) +
        "&body=" +
        encodeURIComponent(body),
    );
  };
  return (
    <section
      id="partners"
      className={"section " + styles.section}
      aria-labelledby="partners-title"
    >
      <div className={"container " + styles.grid}>
        <Reveal className={styles.copy}>
          <p className="eyebrow">{t("partner.eyebrow")}</p>
          <h2 className={styles.title} id="partners-title">
            <span>{t("partner.title")}</span>
            <span>{t("partner.highlight")}</span>
            <span>BILER DRINKS</span>
          </h2>
          <p className={styles.description}>{t("partner.description")}</p>
          <a className={styles.email} href="mailto:biler.distribute@gmail.com">
            biler.distribute@gmail.com
            <Icon name="diagonal" width="16" height="16" />
          </a>
        </Reveal>
        <div className={styles.benefitGroup}>
        <h3 className={styles.benefitLabel}>{t("partner.benefitsLabel")}</h3>
        <ul className={styles.benefits}>
          {["terms", "supply", "marketing", "trust"].map((key) => (
            <li key={key}>
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                {key === "terms" ? (
                  <><path d="M4 4v16M12 4v16M20 4v16" /><path d="M1 8h6m2 8h6m2-9h6" /></>
                ) : key === "supply" ? (
                  <><path d="M3 5h11v12H3V5Zm11 5h4l3 4v3h-7" /><circle cx="7" cy="18" r="2" /><circle cx="18" cy="18" r="2" /></>
                ) : key === "marketing" ? (
                  <><path d="m4 9 14-5v14L4 13V9Zm0 0H2v4h2m3 1 1 6h4l-2-5m11-7 1-1m-1 7 1 1" /></>
                ) : (
                  <><path d="m12 3 8 3v6c0 4-3 7-8 10-5-3-8-6-8-10V6l8-3Z" /><path d="m8 12 3 3 5-5" /></>
                )}
              </svg>
              <h3>{t("partner.advantages." + key + ".title")}</h3>
              <p>{t("partner.advantages." + key + ".text")}</p>
            </li>
          ))}
        </ul>
        </div>
        <Reveal className={styles.formWrap}>
          <form
            className={styles.form}
            onSubmit={handleSubmit}
            onInput={(event) => {
              if (event.target instanceof HTMLInputElement)
                event.target.setCustomValidity("");
              setDraft("");
            }}
          >
            <div className={styles.formHeading}>
              <h3>{t("partner.formTitle")}</h3>
              <span>B2B</span>
            </div>
            <div className={styles.fields}>
              {fields.map((field) => (
                <label key={field.name}>
                  <span>
                    {t("partner.fields." + field.name)}{" "}
                    <span aria-hidden="true">*</span>
                  </span>
                  <input
                    name={field.name}
                    type={field.type}
                    autoComplete={field.autoComplete}
                    maxLength={field.maxLength}
                    required
                    placeholder={t("partner.placeholders." + field.name)}
                  />
                </label>
              ))}
            </div>
            <p id="partner-notice" className={styles.notice}>
              {t("partner.notice")}
            </p>
            <motion.button
              type="submit"
              className="button button-primary"
              aria-describedby="partner-notice"
              whileHover={reduced ? undefined : { y: -2 }}
              whileTap={reduced ? undefined : { scale: 0.99 }}
            >
              {t("partner.submit")}
              <Icon name="arrow" width="18" height="18" />
            </motion.button>
            {draft && (
              <div className={styles.result} role="status">
                <p>{t("partner.ready")}</p>
                <a className="text-link" href={draft}>
                  {t("partner.openEmail")}
                  <Icon name="arrow" width="18" height="18" />
                </a>
              </div>
            )}
          </form>
        </Reveal>
      </div>
    </section>
  );
}
