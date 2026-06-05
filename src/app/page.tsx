"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import AnnouncementBar from "@/components/AnnouncementBar";
import Hero from "@/components/sections/Hero";
import Categories from "@/components/sections/Categories";
import CategoryCards from "@/components/sections/CategoryCards";
import MenuSection from "@/components/sections/MenuSection";
import AboutSection from "@/components/sections/AboutSection";
import NosotrosSection from "@/components/sections/NosotrosSection";
import FaqSection from "@/components/sections/FaqSection";
import HowToOrder from "@/components/sections/HowToOrder";
import Reviews from "@/components/sections/Reviews";
import LocationSection from "@/components/sections/LocationSection";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

export default function HomePage() {
  const [cartOpen, setCartOpen] = useState(false);
  return (
    <div className="min-h-screen">
        <div className="sticky top-0 z-50">
          <AnnouncementBar />
          <Navbar onCartOpen={() => setCartOpen(true)} />
        </div>

        <main>
          <Hero />
          <CategoryCards />
          <MenuSection initialCategory="viandas-congeladas" />
          <HowToOrder />
          <LocationSection />
          <AboutSection />
          <Categories />
          <Reviews />
          <NosotrosSection />
          <FaqSection />
        </main>

        <Footer />

        {/* Overlays */}
        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      </div>
  );
}
