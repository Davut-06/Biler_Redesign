import { useId, useRef, useState, type FormEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Icon } from "../shared/Icon";
import { Reveal } from "../shared/Reveal";
import styles from "./DistributorSection.module.css";
import {
  enquiryFields,
  normalizeEnquiry,
  validateEnquiry,
  type DistributorEnquiry,
  type EnquiryErrors,
  type EnquiryField,
} from "../../utils/distributorEnquiry";
import { sendDistributorEnquiry } from "../../utils/emailjsEnquiry";

const fields = [
  {
    name: "company",
    type: "text",
    autoComplete: "organization",
    maxLength: 120,
  },
  { name: "taxId", type: "text", autoComplete: "off", maxLength: 30 },
  { name: "name", type: "text", autoComplete: "name", maxLength: 80 },
  { name: "phone", type: "tel", autoComplete: "tel", maxLength: 50 },
  { name: "email", type: "email", autoComplete: "email", maxLength: 254 },
] as const;
export function DistributorSection() {
  const { t } = useTranslation();
  const reduced = useReducedMotion();
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const submitting = useRef(false);
  const [errors, setErrors] = useState<EnquiryErrors>({});
  const id = useId();
  const readValues = (form: HTMLFormElement) => {
    const data = new FormData(form);
    return Object.fromEntries(
      enquiryFields.map((field) => [field, String(data.get(field) ?? "")]),
    ) as DistributorEnquiry;
  };
  const validateField = (input: HTMLInputElement) => {
    const field = input.name as EnquiryField;
    const error = validateEnquiry(readValues(input.form!))[field];
    setErrors((previous) => ({ ...previous, [field]: error }));
  };
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting.current) return;
    const form = event.currentTarget;
    setStatus("idle");
    const values = normalizeEnquiry(readValues(form));
    const nextErrors = validateEnquiry(values);
    setErrors(nextErrors);
    const firstInvalid = enquiryFields.find((field) => nextErrors[field]);
    if (firstInvalid) {
      (form.elements.namedItem(firstInvalid) as HTMLInputElement).focus({
        preventScroll: true,
      });
      return;
    }
    submitting.current = true;
    setStatus("submitting");
    const config = {
      serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
      templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
    };
    try {
      await sendDistributorEnquiry(values, config);
      form.reset();
      setErrors({});
      setStatus("success");
    } catch {
      if (import.meta.env.DEV && (!config.serviceId?.trim() || !config.templateId?.trim() || !config.publicKey?.trim())) {
        console.warn("Distributor form: required EmailJS environment variables are missing.");
      }
      setStatus("error");
    } finally {
      submitting.current = false;
    }
  };
  return (
    <section
      id="partners"
      className={"section " + styles.section}
      aria-labelledby="partners-title"
    >
      <div className={"container " + styles.grid}>
        <div className={styles.contentColumns}>
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
                <svg
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  focusable="false"
                >
                  {key === "terms" ? (
                    <>
                      <path d="M4 4v16M12 4v16M20 4v16" />
                      <path d="M1 8h6m2 8h6m2-9h6" />
                    </>
                  ) : key === "supply" ? (
                    <>
                      <path d="M3 5h11v12H3V5Zm11 5h4l3 4v3h-7" />
                      <circle cx="7" cy="18" r="2" />
                      <circle cx="18" cy="18" r="2" />
                    </>
                  ) : key === "marketing" ? (
                    <>
                      <path d="m4 9 14-5v14L4 13V9Zm0 0H2v4h2m3 1 1 6h4l-2-5m11-7 1-1m-1 7 1 1" />
                    </>
                  ) : (
                    <>
                      <path d="m12 3 8 3v6c0 4-3 7-8 10-5-3-8-6-8-10V6l8-3Z" />
                      <path d="m8 12 3 3 5-5" />
                    </>
                  )}
                </svg>
                <h3>{t("partner.advantages." + key + ".title")}</h3>
                <p>{t("partner.advantages." + key + ".text")}</p>
              </li>
            ))}
          </ul>
        </div>
        </div>
        <Reveal className={styles.formWrap}>
          <form
            className={styles.form}
            noValidate
            aria-busy={status === "submitting"}
            onSubmit={handleSubmit}
            onInput={(event) => {
              if (
                event.target instanceof HTMLInputElement &&
                errors[event.target.name as EnquiryField]
              )
                validateField(event.target);
              if (!submitting.current) setStatus("idle");
            }}
          >
            <div className={styles.formHeading}>
              <h3>{t("partner.formTitle")}</h3>
            </div>
            <div className={styles.fields}>
              {fields.map((field) => (
                <label key={field.name} htmlFor={id + "-" + field.name}>
                  <span>
                    {t("partner.fields." + field.name)}{" "}
                    <span aria-hidden="true">*</span>
                  </span>
                  <input
                    id={id + "-" + field.name}
                    name={field.name}
                    type={field.type}
                    inputMode={field.name === "phone" ? "tel" : undefined}
                    autoComplete={field.autoComplete}
                    maxLength={field.maxLength}
                    required
                    readOnly={status === "submitting"}
                    aria-invalid={Boolean(errors[field.name])}
                    aria-describedby={
                      errors[field.name]
                        ? id + "-" + field.name + "-error"
                        : undefined
                    }
                    onBlur={(event) => validateField(event.currentTarget)}
                  />
                  {errors[field.name] && (
                    <span
                      id={id + "-" + field.name + "-error"}
                      className={styles.fieldError}
                      aria-live="polite"
                    >
                      {t("partner.errors." + errors[field.name])}
                    </span>
                  )}
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
              disabled={status === "submitting"}
              whileHover={reduced ? undefined : { y: -2 }}
              whileTap={reduced ? undefined : { scale: 0.99 }}
            >
              {t(status === "submitting" ? "partner.sending" : "partner.submit")}
              <Icon name="arrow" width="18" height="18" />
            </motion.button>
            <div role="status" aria-live="polite" aria-atomic="true">
              {(status === "success" || status === "error") && (
                <div className={styles.result}>
                  <p>{t(status === "success" ? "partner.success" : "partner.failure")}</p>
                </div>
              )}
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
