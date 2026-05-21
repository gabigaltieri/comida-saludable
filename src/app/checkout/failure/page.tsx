import Link from "next/link";
import StoreNavbar from "@/components/StoreNavbar";
import Footer from "@/components/Footer";
import { XCircle, ShoppingBag, ArrowLeft } from "lucide-react";

export default function CheckoutFailurePage() {
  return (
    <div className="min-h-screen bg-cream-100">
      <StoreNavbar />

      <div className="max-w-xl mx-auto px-5 py-24 flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-full bg-salmon-100 flex items-center justify-center mb-6">
          <XCircle className="w-12 h-12 text-salmon-400" />
        </div>

        <h1
          className="font-serif text-4xl text-sage-800 font-semibold mb-3"
          style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
        >
          Pago no realizado
        </h1>

        <p className="font-sans text-sage-500 text-base leading-relaxed mb-10">
          El pago no pudo procesarse. Podés intentarlo de nuevo o elegir otro
          método de pago como transferencia o efectivo.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Link
            href="/checkout"
            className="flex-1 flex items-center justify-center gap-2 bg-sage-500 hover:bg-sage-600 text-white font-sans font-medium px-6 py-3.5 rounded-2xl transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al checkout
          </Link>
          <Link
            href="/tienda"
            className="flex-1 flex items-center justify-center gap-2 border border-sage-200 text-sage-600 hover:border-sage-400 font-sans font-medium px-6 py-3.5 rounded-2xl transition-colors bg-white"
          >
            <ShoppingBag className="w-4 h-4" />
            Ver la tienda
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
