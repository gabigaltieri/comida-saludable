"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/sections/Hero";
import Categories from "@/components/sections/Categories";
import MenuSection from "@/components/sections/MenuSection";
import AboutSection from "@/components/sections/AboutSection";
import EmpresasSection from "@/components/sections/EmpresasSection";
import HowToOrder from "@/components/sections/HowToOrder";
import Reviews from "@/components/sections/Reviews";
import LocationSection from "@/components/sections/LocationSection";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

export default function HomePage() {
  const [cartOpen, setCartOpen] = useState(false);
  return (
    <div className="min-h-screen">
        <Navbar onCartOpen={() => setCartOpen(true)} />

        <main>
          <Hero />
          <Categories />
          <MenuSection />
          <HowToOrder />
          <EmpresasSection />
          <LocationSection />
          <Reviews />
          <AboutSection />
        </main>

        <Footer />

        {/* Overlays */}
        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      </div>
  );
}
