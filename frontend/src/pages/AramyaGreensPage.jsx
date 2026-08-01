import { useEffect, useState } from "react";
import Seo from "@/components/Seo";

/**
 * Aramya Greens — dedicated project landing.
 * The full source-of-truth HTML/CSS lives at /aramya/content.html (a
 * self-contained static file generated from the uploaded standalone page).
 * We fetch it at runtime and inject it inside the site's shared PublicLayout
 * so the Astittva navbar + footer + FAB stack wrap the experience.
 */
export default function AramyaGreensPage() {
  const [html, setHtml] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/aramya/content.html", { cache: "force-cache" })
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((t) => { if (!cancelled) setHtml(t); })
      .catch((e) => { if (!cancelled) setErr(e.message); });
    return () => { cancelled = true; };
  }, []);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Residence",
      name: "Aramya Greens",
      description:
        "Aramya Greens — a newly launched premium gated plotted township in Hatisala, New Town offering green living, spacious residential plots, excellent connectivity and long-term investment value.",
      url: "https://astittva.in/aramya-greens",
      image: "https://astittva.in/aramya/images/img_1.jpg",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Hatisala",
        addressLocality: "New Town",
        addressRegion: "West Bengal",
        addressCountry: "IN",
      },
      offers: {
        "@type": "Offer",
        priceCurrency: "INR",
        availability: "https://schema.org/InStock",
        seller: {
          "@type": "RealEstateAgent",
          "@id": "https://astittva.in/#organization",
          name: "Astittva Marketing",
        },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://astittva.in/" },
        { "@type": "ListItem", position: 2, name: "Aramya Greens", item: "https://astittva.in/aramya-greens" },
      ],
    },
  ];

  return (
    <div data-testid="aramya-greens-page" className="pt-24 sm:pt-28 pb-8 bg-[#F3EFE1]">
      <Seo
        title="Aramya Greens | Premium Gated Plotted Township in Hatisala, New Town | Astittva Marketing"
        description="Explore Aramya Greens, a newly launched premium gated plotted township in Hatisala, New Town offering green living, spacious residential plots, excellent connectivity and long-term investment value."
        path="/aramya-greens"
        keywords="Aramya Greens, gated plotted township Hatisala, New Town plots, Astittva Marketing, plotted township Kolkata, residential plots New Town, real estate investment Kolkata"
        image="https://astittva.in/aramya/images/img_1.jpg"
        jsonLd={jsonLd}
      />
      {!html && !err && (
        <div className="max-w-3xl mx-auto py-24 px-6 text-center text-[#4A5245]">
          <div className="font-serif italic text-2xl">Loading Aramya Greens…</div>
        </div>
      )}
      {err && (
        <div className="max-w-3xl mx-auto py-24 px-6 text-center text-red-800">
          Unable to load Aramya Greens content. Please refresh the page.
        </div>
      )}
      {html && <div dangerouslySetInnerHTML={{ __html: html }} />}
    </div>
  );
}
