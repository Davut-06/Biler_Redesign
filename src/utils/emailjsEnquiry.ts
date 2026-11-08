import emailjs from "@emailjs/browser";
import { normalizeEnquiry, validateEnquiry, type DistributorEnquiry } from "./distributorEnquiry";

export interface EmailJSConfig {
  serviceId?: string;
  templateId?: string;
  publicKey?: string;
}

export async function sendDistributorEnquiry(values: DistributorEnquiry, config: EmailJSConfig): Promise<void> {
  const data = normalizeEnquiry(values);
  if (Object.keys(validateEnquiry(data)).length) throw new Error("Invalid distributor enquiry");
  const serviceId = config.serviceId?.trim();
  const templateId = config.templateId?.trim();
  const publicKey = config.publicKey?.trim();
  if (!serviceId || !templateId || !publicKey) throw new Error("Missing EmailJS configuration");
  if (serviceId === "your_service_id" || templateId === "your_template_id" || publicKey === "your_public_key") {
    throw new Error("Missing EmailJS configuration");
  }
  const response = await emailjs.send(serviceId, templateId, {
    company_name: data.company,
    inn: data.taxId,
    name: data.name,
    phone_number: data.phone,
    email: data.email,
    time: new Date().toISOString(),
  }, { publicKey });
  if (response.status !== 200) throw new Error("EmailJS did not confirm submission");
}
