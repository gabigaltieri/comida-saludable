"use client";

import { useState } from "react";
import { CartProvider } from "@/lib/cart";
import Navbar from "@/components/Navbar";
import Hero from "@/components/sections/Hero";
import Categories from "@/components/sections/Categories";
import MenuSection from "@/components/sections/MenuSection";
import AboutSection from "@/components/sections/AboutSection";
import CateringSection from "@/components/sections/CateringSection";
import Reviews from "@/components/sections/Reviews";
import LocationSection from "@/components/sections/LocationSection";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

export default function HomePage() {
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();

  const handleCategorySelect = (id: string) => {
    setSelectedCategory(id);
    // Scroll to menu
    setTimeout(() => {
      document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  return (
    <CartProvider>
      <div className="min-h-screen">
        <Navbar onCartOpen={() => setCartOpen(true)} />

        <main>
          <Hero />
          <Categories onCategorySelect={handleCategorySelect} />
          <MenuSection initialCategory={selectedCategory} />
          <AboutSection />
          <CateringSection />
          <Reviews />
          <LocationSection />
        </main>

        <Footer />

        {/* Overlays */}
        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
        <FloatingWhatsApp />
      </div>
    </CartProvider>
  );
}
