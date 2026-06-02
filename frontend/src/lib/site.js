// Site-wide constants
export const PHONE_E164 = "+919000000000";
export const PHONE_DISPLAY = "+91 90000 00000";
export const WHATSAPP_NUMBER = "919000000000";

export const EMAIL = "sales@astittva.in";

export const LOGO_URL = "https://customer-assets.emergentagent.com/job_astitva-luxury-1/artifacts/c212hx9z_ASTITTVA%20MARKETING%20FINAL.png";

export const BRAND_NAME = "ASTITTVA";
export const BRAND_TAGLINE = "Luxury Real Estate";

export const OFFICE_ADDRESS = {
  building: "PS IXL Building",
  line1: "5th Floor, Room 511",
  street: "Biswa Bangla Sarani",
  area: "Atghara, New Town",
  city: "Kolkata",
  state: "West Bengal",
  pincode: "700136",
  country: "India",
};

export const OFFICE_ADDRESS_LINES = [
  "PS IXL Building",
  "5th Floor, Room 511",
  "Biswa Bangla Sarani",
  "Atghara, New Town",
  "Kolkata, West Bengal 700136",
  "India",
];

export function whatsappLink(message = "") {
  const text = encodeURIComponent(message || "Hi ASTITTVA, I'd like to know more about your properties.");
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}
