import Seo from "@/components/Seo";

/**
 * Aramya Greens — served exactly as uploaded, in complete isolation.
 * A full-viewport iframe loads the untouched standalone HTML so nothing
 * from the Astittva shell (navbar, footer, layout, CSS) touches it.
 * The React route only handles routing + SEO metadata for search engines.
 */
export default function AramyaGreensPage() {
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
    <div data-testid="aramya-greens-page">
      <Seo
        title="Aramya Greens | Premium Gated Plotted Township in Hatisala, New Town | Astittva Marketing"
        description="Explore Aramya Greens, a newly launched premium gated plotted township in Hatisala, New Town offering green living, spacious residential plots, excellent connectivity and long-term investment value."
        path="/aramya-greens"
        keywords="Aramya Greens, gated plotted township Hatisala, New Town plots, plotted township Kolkata, residential plots New Town"
        image="https://astittva.in/aramya/images/img_1.jpg"
        jsonLd={jsonLd}
      />
      <iframe
        src="/aramya/index.html"
        title="Aramya Greens"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          border: "none",
          margin: 0,
          padding: 0,
          zIndex: 999,
        }}
      />
    </div>
  );
}
