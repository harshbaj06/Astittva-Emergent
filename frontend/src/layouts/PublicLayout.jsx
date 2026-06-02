import { Outlet } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import AmbientGlow from "@/components/AmbientGlow";

export default function PublicLayout() {
  return (
    <div className="relative bg-charcoal text-ivory min-h-screen overflow-x-hidden">
      <AmbientGlow />
      <div className="relative z-10">
        <Header />
        <main>
          <Outlet />
        </main>
        <Footer />
        <FloatingWhatsApp />
      </div>
    </div>
  );
}
