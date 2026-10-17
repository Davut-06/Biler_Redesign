import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { Reveal } from "../shared/Reveal";
import styles from "./Benefits.module.css";

type BenefitIconName = "leaf" | "shield" | "spark" | "bolt";
const benefits: { key: string; icon: BenefitIconName }[] = [
  { key: "ingredients", icon: "leaf" },
  { key: "quality", icon: "shield" },
  { key: "taste", icon: "spark" },
  { key: "energy", icon: "bolt" },
];
function BenefitIcon({ icon, className }: { icon: BenefitIconName; className?: string }) {
  return (<svg viewBox="0 0 28 28" className={className} fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                  {icon === "leaf" ? (
                    <>
                      <path d="M6 23c1-6 4-11 11-15M10 19C3 15 5 6 23 4c0 12-4 19-13 15Z" />
                      <path d="m12 13 5 1m-5-1-1-4" />
                    </>
                  ) : icon === "shield" ? (
                    <>
                      <path d="M14 3c3 2 6 3 10 4v7c0 5-4 9-10 12C8 23 4 19 4 14V7c4-1 7-2 10-4Z" />
                      <path d="m9.5 14 3 3 6-6" />
                    </>
                  ) : icon === "spark" ? (
                    <>
                      <path d="m12 4 2.8 7.2L22 14l-7.2 2.8L12 24l-2.8-7.2L2 14l7.2-2.8L12 4Z" />
                      <path d="M23 3v5m-2.5-2.5h5" />
                    </>
                  ) : (
                    <>
                      <path d="m14 3-9 12h7l-1 10 9-13h-7l1-9Z" />
                      <path d="M22 4c-1.5 2-3 3.5-3 5a3 3 0 0 0 6 0c0-1.5-1.5-3-3-5Z" />
                    </>
                  )}
                </svg>);
}
export function Benefits() {
  const { t } = useTranslation();
  const [active, setActive] = useState(0);
  const [mobile, setMobile] = useState(() => window.matchMedia("(max-width: 760px)").matches);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();
  useEffect(() => {
    const media = window.matchMedia("(max-width: 760px)");
    const update = () => setMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setActive(index);
      return;
    }
    if (mobile) return;
    let next: number;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") next = (index + 1) % benefits.length;
    else if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = (index + benefits.length - 1) % benefits.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = benefits.length - 1;
    else return;
    event.preventDefault();
    setActive(next);
    buttons.current[next]?.focus();
  }
  const selected = benefits[active];
  return (
    <section id="about" className={"section " + styles.section} aria-labelledby="benefits-title" data-active={active}>
      <div className="container">
        <Reveal className={"section-heading " + styles.heading}>
          <div>
            <p className="eyebrow">{t("benefits.eyebrow")}</p>
            <h2 className="display-title" id="benefits-title">
              <span>{t("benefits.title")}</span>
              <span>{t("benefits.titleSecond")}</span>
            </h2>
          </div>
          <p>{t("benefits.description")}</p>
        </Reveal>
        <div className={styles.interactive}>
          <div className={styles.list} role={mobile ? undefined : "tablist"} aria-orientation={mobile ? undefined : "vertical"} aria-labelledby="benefits-title">
            {benefits.map(({ key, icon }, index) => (
              <div className={styles.item} key={key} role={mobile ? undefined : "presentation"}>
                <button
                  ref={(element) => { buttons.current[index] = element; }}
                  type="button"
                  id={id + "-tab-" + index}
                  role={mobile ? undefined : "tab"}
                  aria-selected={mobile ? undefined : active === index}
                  aria-expanded={mobile ? active === index : undefined}
                  aria-controls={mobile ? id + "-accordion-" + index : id + "-panel"}
                  tabIndex={mobile || active === index ? 0 : -1}
                  className={styles.trigger}
                  data-active={active === index}
                  onClick={() => setActive(index)}
                  onKeyDown={(event) => navigate(event, index)}
                >
                  {mobile && <BenefitIcon icon={icon} className={styles.listIcon} />}
                  <span className={styles.label}>{t("benefits." + key + ".title")}</span>
                  {mobile ? <span className={styles.chevron} aria-hidden="true" /> : <BenefitIcon icon={icon} className={styles.listIcon} />}
                </button>
                {mobile && (
                  <div id={id + "-accordion-" + index} role="region" aria-labelledby={id + "-tab-" + index} hidden={active !== index} className={styles.accordionPanel}>
                    <div className={styles.mobileContent} key={active}>
                      <div>
                        <p>{t("benefits." + key + ".text")}</p>
                        {key === "energy" && <div className={styles.vitaminLine}>C · B2 · B3 · B5 · B6</div>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          {!mobile && (
            <div id={id + "-panel"} role="tabpanel" aria-labelledby={id + "-tab-" + active} tabIndex={0} className={styles.panel}>
              <div className={styles.panelContent} key={selected.key}>
                <div className={styles.panelTop}>
                  <BenefitIcon icon={selected.icon} className={styles.panelIcon} />
                </div>
                <h3>{t("benefits." + selected.key + ".title")}</h3>
                <p>{t("benefits." + selected.key + ".text")}</p>
                {selected.key === "energy" && <div className={styles.vitaminLine}>C · B2 · B3 · B5 · B6</div>}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
