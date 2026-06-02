// Site-wide constants
export const PHONE_E164 = "+919000000000"; // change to real number
export const PHONE_DISPLAY = "+91 90000 00000";
export const WHATSAPP_NUMBER = "919000000000"; // no + for wa.me
export const EMAIL = "hello@astitva.com";
export const LOGO_URL = "https://customer-assets.emergentagent.com/job_astitva-luxury-1/artifacts/c212hx9z_ASTITTVA%20MARKETING%20FINAL.png";
export const BRAND_NAME = "ASTITVA";
export const BRAND_TAGLINE = "Luxury Real Estate";

export function whatsappLink(message = "") {
  const text = encodeURIComponent(message || "Hi Astitva, I'd like to know more about your properties.");
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}
