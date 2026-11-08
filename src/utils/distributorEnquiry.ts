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
