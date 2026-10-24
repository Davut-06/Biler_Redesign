export const enquiryFields = ["company", "taxId", "name", "phone", "email"] as const;
export type EnquiryField = (typeof enquiryFields)[number];
export type DistributorEnquiry = Record<EnquiryField, string>;
export type EnquiryErrors = Partial<Record<EnquiryField, string>>;

export function normalizeEnquiry(values: DistributorEnquiry): DistributorEnquiry {
  return Object.fromEntries(enquiryFields.map((field) => [
    field,
    values[field].normalize("NFC").trim(),
  ])) as DistributorEnquiry;
}

export function validateEnquiry(values: DistributorEnquiry): EnquiryErrors {
  const data = normalizeEnquiry(values);
  const errors: EnquiryErrors = {};
  const length = (value: string) => Array.from(value).length;
  for (const field of enquiryFields) {
    if (!data[field]) errors[field] = `${field}Required`;
  }
  if (data.company) {
    if (length(data.company) < 2) errors.company = "companyShort";
    else if (length(data.company) > 120) errors.company = "companyLong";
    else if (!/^[\p{L}\p{M}\p{N} &'’.,()\-]+$/u.test(data.company) || !/[\p{L}\p{N}]/u.test(data.company)) errors.company = "companyInvalid";
  }
  if (data.taxId && (length(data.taxId) < 5 || length(data.taxId) > 30 || !/^[\p{L}\p{M}\p{Nd} ./\-]+$/u.test(data.taxId) || !/\p{Nd}/u.test(data.taxId))) errors.taxId = "taxIdInvalid";
  if (data.name) {
    if (/\p{N}/u.test(data.name)) errors.name = "nameNumbers";
    else if (length(data.name) < 2 || length(data.name) > 80 || !/^[\p{L}\p{M} '’\-]+$/u.test(data.name) || !/\p{L}/u.test(data.name)) errors.name = "nameInvalid";
  }
  if (data.phone) {
    const digits = data.phone.replace(/\D/g, "");
    if (!/^\+?[0-9 ()\-]+$/.test(data.phone) || digits.length < 7 || digits.length > 15) errors.phone = "phoneInvalid";
  }
  if (data.email) {
    const [local = ""] = data.email.split("@");
    const emailPattern = /^[a-z0-9!#$%&'*+/=?^_`{|}~\-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~\-]+)*@(?:[a-z0-9](?:[a-z0-9\-]{0,61}[a-z0-9])?\.)+[a-z](?:[a-z0-9\-]{0,61}[a-z0-9])?$/i;
    if (length(data.email) > 254 || local.length > 64 || !emailPattern.test(data.email)) errors.email = "emailInvalid";
  }
  return errors;
}

function validPayload(values: DistributorEnquiry): DistributorEnquiry {
  const payload = normalizeEnquiry(values);
  if (Object.keys(validateEnquiry(payload)).length) throw new Error("Invalid distributor enquiry");
  return payload;
}

export function createEnquiryMailto(values: DistributorEnquiry, labels: Record<EnquiryField, string>, subject: string): string {
  const payload = validPayload(values);
  const body = enquiryFields.map((field) => `${labels[field]}: ${payload[field]}`).join("\n");
  return `mailto:biler.distribute@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// Not enabled in the form until a real backend is deployed. A draft is not a submission.
export async function postDistributorEnquiry(values: DistributorEnquiry, signal?: AbortSignal): Promise<void> {
  const payload = validPayload(values);
  const response = await fetch("/api/distributor-enquiry", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
    signal,
  });
  if (!response.ok) throw new Error("Distributor enquiry was not accepted");
  const result: unknown = await response.json();
  if (!result || typeof result !== "object" || !("success" in result) || result.success !== true) {
    throw new Error("Distributor enquiry was not confirmed");
  }
}
