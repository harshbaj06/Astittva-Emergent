// Site-wide constants
export const PHONE_E164 = "+919000000000"; // change to real number
export const PHONE_DISPLAY = "+91 90000 00000";
export const WHATSAPP_NUMBER = "919000000000"; // no + for wa.me
export const EMAIL = "hello@astitva.com";

export function whatsappLink(message = "") {
  const text = encodeURIComponent(message || "Hi Astitva, I'd like to know more about your properties.");
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}
