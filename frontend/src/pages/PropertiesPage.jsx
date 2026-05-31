import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Filter } from "lucide-react";
import api, { fileUrl } from "@/lib/api";

const CITIES = ["", "New Town", "Rajarhat", "Kolkata"];
const TYPES = ["", "Residential", "Commercial", "Villa", "Apartment", "Plot"];
const CATEGORIES = ["", "Luxury", "Premium", "Affordable"];

export default function PropertiesPage() {
  const [params, setParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const city = params.get("city") || "";
  const property_type = params.get("type") || "";
  const category = params.get("category") || "";

  useEffect(() => {
    setLoading(true);
    const q = {};
    if (city) q.city = city;
    if (property_type) q.property_type = property_type;
    if (category) q.category = category;
    api.get("/properties", { params: q })
      .then(({ data }) => setProperties(data))
      .finally(() => setLoading(false));
  }, [city, property_type, category]);

  const setParam = (k, v) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v); else next.delete(k);
    setParams(next);
  };

  return (
    <div data-testid="properties-page" className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <div className="overline mb-4">Curated Portfolio</div>
          <h1 className="font-display font-light text-4xl sm:text-5xl lg:text-6xl text-ivory tracking-tight">
            Properties
          </h1>
          <div className="copper-divider mt-8" />
        </motion.div>

        {/* Filters */}
        <div className="mb-12 flex flex-wrap gap-4 items-center border border-copper/15 p-6 bg-charcoal-2/40">
          <div className="flex items-center gap-2 text-copper text-xs tracking-[0.3em] uppercase">
            <Filter className="w-4 h-4" /> Filter
          </div>
          <select data-testid="filter-city" value={city} onChange={(e) => setParam("city", e.target.value)} className="input-filled max-w-[200px]">
            {CITIES.map((c) => <option key={c} value={c}>{c || "All Cities"}</option>)}
          </select>
          <select data-testid="filter-type" value={property_type} onChange={(e) => setParam("type", e.target.value)} className="input-filled max-w-[200px]">
            {TYPES.map((t) => <option key={t} value={t}>{t || "All Types"}</option>)}
          </select>
          <select data-testid="filter-category" value={category} onChange={(e) => setParam("category", e.target.value)} className="input-filled max-w-[200px]">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c || "All Categories"}</option>)}
          </select>
          {(city || property_type || category) && (
            <button data-testid="clear-filters-btn" onClick={() => setParams({})} className="text-copper text-xs tracking-[0.25em] uppercase hover:text-rose-gold">
              Clear
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-ivory/50 text-center py-20 tracking-[0.3em] uppercase text-xs">Loading...</div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20 border border-copper/15">
            <p className="text-ivory/60 font-light italic mb-6">No properties match your current filters.</p>
            <Link to="/contact" className="btn-outline">Speak To Advisor</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
                className="luxury-card group"
                data-testid={`property-card-${p.id}`}
              >
                <Link to={`/properties/${p.id}`}>
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <img
                      src={p.images?.[0] ? fileUrl(p.images[0]) : "https://images.pexels.com/photos/24805054/pexels-photo-24805054.jpeg"}
                      alt={p.project_name}
                      className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
                    />
                    {p.is_featured && (
                      <div className="absolute top-4 left-4 bg-copper text-charcoal text-[10px] tracking-[0.3em] uppercase px-3 py-1.5">
                        Featured
                      </div>
                    )}
                  </div>
                  <div className="p-7">
                    <div className="flex items-center gap-2 text-copper text-[10px] tracking-[0.3em] uppercase mb-3">
                      <MapPin className="w-3 h-3" /> {p.location || p.city}
                    </div>
                    <h3 className="font-display text-xl text-ivory mb-2 font-normal group-hover:text-copper transition">{p.project_name}</h3>
                    {p.builder && <p className="text-ivory/50 text-xs uppercase tracking-wider mb-3">{p.builder}</p>}
                    <p className="text-ivory/60 text-sm font-light line-clamp-2">{p.description}</p>
                    <div className="mt-5 flex items-center justify-between pt-5 border-t border-copper/10">
                      <span className="text-rose-gold font-display text-sm">{p.price_label || "Price on request"}</span>
                      <span className="text-copper text-xs tracking-[0.25em] uppercase flex items-center gap-1">Details <ArrowRight className="w-3 h-3" /></span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
