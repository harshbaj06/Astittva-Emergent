import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Building2, Calendar, BadgeCheck, Home, ArrowLeft, Phone } from "lucide-react";
import api, { fileUrl, formatApiErrorDetail } from "@/lib/api";
import { toast } from "sonner";

export default function PropertyDetailPage() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/properties/${id}`)
      .then(({ data }) => setProperty(data))
      .catch(() => setProperty(false))
      .finally(() => setLoading(false));
  }, [id]);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/leads", {
        ...form,
        interest: property?.project_name || "Property Enquiry",
        source: `property:${id}`,
      });
      toast.success("Enquiry sent. Our team will reach out shortly.");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="pt-40 text-center text-ivory/50 tracking-[0.3em] uppercase">Loading...</div>;
  if (!property) {
    return (
      <div className="pt-40 max-w-3xl mx-auto px-6 text-center">
        <h2 className="font-display text-3xl text-ivory mb-4">Property not found</h2>
        <Link to="/properties" className="btn-outline mt-4">Back to Properties</Link>
      </div>
    );
  }

  const images = property.images?.length ? property.images : [];

  return (
    <div data-testid="property-detail-page" className="pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <Link to="/properties" className="inline-flex items-center gap-2 text-copper text-xs tracking-[0.3em] uppercase mb-8 hover:text-rose-gold">
          <ArrowLeft className="w-4 h-4" /> Back to Properties
        </Link>

        {/* Gallery */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-12">
          <div className="lg:col-span-9 aspect-[16/10] overflow-hidden">
            <img
              src={images[activeImg] ? fileUrl(images[activeImg]) : "https://images.pexels.com/photos/24805054/pexels-photo-24805054.jpeg"}
              alt={property.project_name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="lg:col-span-3 grid grid-cols-4 lg:grid-cols-1 gap-4">
            {(images.length ? images : [null,null,null]).slice(0, 4).map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`aspect-[4/3] overflow-hidden border ${activeImg === i ? "border-copper" : "border-copper/15"} transition`}
              >
                {img ? (
                  <img src={fileUrl(img)} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-charcoal-2/60" />
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className="overline mb-3">{property.property_category || property.property_type}</div>
            <h1 className="font-display font-light text-4xl sm:text-5xl text-ivory">{property.project_name}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-ivory/60 text-sm">
              <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-copper" /> {property.location}, {property.city}</span>
              {property.builder && <span className="flex items-center gap-2"><Building2 className="w-4 h-4 text-copper" /> {property.builder}</span>}
              {property.rera_number && <span className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-copper" /> RERA: {property.rera_number}</span>}
            </div>
            <div className="copper-divider mt-8 mb-8" />

            <p className="text-ivory/75 leading-relaxed font-light whitespace-pre-line text-base">{property.description}</p>

            <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 gap-px bg-copper/15">
              {[
                ["Type", property.property_type],
                ["Category", property.property_category || "—"],
                ["Bedrooms", property.bedrooms || "—"],
                ["Area", property.area_sqft ? `${property.area_sqft} sqft` : "—"],
                ["Possession", property.possession_date || "—"],
                ["Starting Price", property.price_label || (property.starting_price ? `₹${property.starting_price}` : "On request")],
              ].map(([k, v]) => (
                <div key={k} className="bg-charcoal p-5">
                  <div className="text-[10px] text-ivory/40 tracking-[0.25em] uppercase mb-2">{k}</div>
                  <div className="text-ivory font-display text-sm font-light">{v}</div>
                </div>
              ))}
            </div>

            {property.amenities?.length > 0 && (
              <div className="mt-12">
                <h3 className="overline mb-5">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((a) => (
                    <span key={a} className="border border-copper/25 text-ivory/80 text-xs px-4 py-2 tracking-wider">{a}</span>
                  ))}
                </div>
              </div>
            )}

            {property.google_maps_url && (
              <div className="mt-12">
                <h3 className="overline mb-5">Location</h3>
                <div className="aspect-video border border-copper/15">
                  <iframe
                    title="map"
                    src={property.google_maps_url}
                    className="w-full h-full"
                    loading="lazy"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Enquiry */}
          <aside className="lg:col-span-1">
            <div className="sticky top-28 luxury-card p-8">
              <div className="overline mb-3">Enquire</div>
              <h3 className="font-display text-2xl text-ivory mb-2 font-light">Request details</h3>
              <p className="text-ivory/60 text-sm mb-6 font-light">A senior advisor will share the brochure, pricing & site visit slots.</p>
              <form onSubmit={submit} className="space-y-4" data-testid="property-enquiry-form">
                <input required placeholder="Name" data-testid="enquiry-name" className="input-luxury" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
                <input required type="tel" placeholder="Phone" data-testid="enquiry-phone" className="input-luxury" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} />
                <input required type="email" placeholder="Email" data-testid="enquiry-email" className="input-luxury" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />
                <textarea rows={3} placeholder="Message (optional)" data-testid="enquiry-message" className="input-luxury" value={form.message} onChange={(e) => setForm({...form, message: e.target.value})} />
                <button type="submit" disabled={submitting} data-testid="enquiry-submit" className="btn-primary w-full disabled:opacity-50">
                  {submitting ? "Sending..." : "Send Enquiry"}
                </button>
              </form>
              <div className="mt-6 pt-6 border-t border-copper/10 text-center">
                <a href="tel:+919000000000" className="text-copper text-sm tracking-wider flex items-center justify-center gap-2 hover:text-rose-gold">
                  <Phone className="w-4 h-4" /> +91 90000 00000
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
