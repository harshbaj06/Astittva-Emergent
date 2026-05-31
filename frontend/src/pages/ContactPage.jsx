import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import api, { formatApiErrorDetail } from "@/lib/api";
import { toast } from "sonner";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", interest: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/leads", { ...form, source: "contact-page" });
      toast.success("Thank you. We'll be in touch shortly.");
      setForm({ name: "", email: "", phone: "", interest: "", message: "" });
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div data-testid="contact-page" className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mb-16">
          <div className="overline mb-4">Contact</div>
          <h1 className="font-display font-light text-4xl sm:text-5xl lg:text-6xl text-ivory tracking-tight">
            Let's begin a conversation.
          </h1>
          <p className="mt-6 text-ivory/65 font-light max-w-2xl">
            Reach out for a private consultation, property visit, or general advisory. We respond within one business day.
          </p>
          <div className="copper-divider mt-10" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-10">
            <div>
              <div className="overline mb-3">Office</div>
              <div className="flex items-start gap-4 text-ivory/75 font-light">
                <MapPin className="w-5 h-5 text-copper shrink-0 mt-1" />
                <p>New Town, Rajarhat<br />Kolkata, West Bengal 700156<br />India</p>
              </div>
            </div>
            <div>
              <div className="overline mb-3">Phone</div>
              <a href="tel:+919000000000" className="flex items-center gap-4 text-ivory/75 hover:text-copper font-light">
                <Phone className="w-5 h-5 text-copper" /> +91 90000 00000
              </a>
            </div>
            <div>
              <div className="overline mb-3">Email</div>
              <a href="mailto:hello@astitva.com" className="flex items-center gap-4 text-ivory/75 hover:text-copper font-light">
                <Mail className="w-5 h-5 text-copper" /> hello@astitva.com
              </a>
            </div>
            <div>
              <div className="overline mb-3">Hours</div>
              <p className="text-ivory/75 font-light">Mon – Sat &nbsp; · &nbsp; 10:00 AM – 7:00 PM IST</p>
            </div>
          </div>

          <form onSubmit={submit} className="luxury-card p-8 sm:p-10 space-y-5" data-testid="contact-form">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="input-label">Name</label>
                <input required data-testid="contact-name" className="input-luxury" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
              </div>
              <div>
                <label className="input-label">Phone</label>
                <input required type="tel" data-testid="contact-phone" className="input-luxury" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="input-label">Email</label>
              <input required type="email" data-testid="contact-email" className="input-luxury" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />
            </div>
            <div>
              <label className="input-label">Interest</label>
              <select data-testid="contact-interest" className="input-luxury" value={form.interest} onChange={(e) => setForm({...form, interest: e.target.value})}>
                <option value="">Select</option>
                <option>Residential — Luxury</option>
                <option>Residential — Premium</option>
                <option>Commercial</option>
                <option>Plot / Land</option>
                <option>Investment Advisory</option>
                <option>Partnership / Other</option>
              </select>
            </div>
            <div>
              <label className="input-label">Message</label>
              <textarea rows={4} data-testid="contact-message" className="input-luxury" value={form.message} onChange={(e) => setForm({...form, message: e.target.value})} />
            </div>
            <button type="submit" disabled={submitting} data-testid="contact-submit" className="btn-primary w-full sm:w-auto disabled:opacity-50">
              {submitting ? "Sending..." : "Send Message"} <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
