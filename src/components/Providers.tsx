"use client";

import { CartProvider } from "@/lib/cart";
import { AuthProvider } from "@/lib/auth";
import AuthModal from "@/components/AuthModal";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        {children}
        <AuthModal />
      </CartProvider>
    </AuthProvider>
  );
}
