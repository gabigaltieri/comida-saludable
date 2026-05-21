import Link from "next/link";
import StoreNavbar from "@/components/StoreNavbar";
import Footer from "@/components/Footer";
import { CheckCircle2, ShoppingBag } from "lucide-react";

interface Props {
  searchParams: {
    external_reference?: string;
    payment_id?: string;
    status?: string;
    collection_status?: string;
  };
}

export default function CheckoutSuccessPage({ searchParams }: Props) {
  const orderNumber = searchParams.external_reference;
  const status = searchParams.status ?? searchParams.collection_status;
  const isPending = status === "pending" || status === "in_process";

  return (
    <div className="min-h-screen bg-cream-100">
      <StoreNavbar />

      <div className="max-w-xl mx-auto px-5 py-24 flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-full bg-sage-100 flex items-center justify-center mb-6">
          <CheckCircle2 className="w-12 h-12 text-sage-500" />
        </div>

        <h1
          className="font-serif text-4xl text-sage-800 font-semibold mb-3"
          style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
        >
          {isPending ? "Pago en proceso" : "¡Pago aprobado!"}
        </h1>

        <p className="font-sans text-sage-500 text-base leading-relaxed mb-2">
          {isPending
            ? "Tu pago está siendo procesado. Te avisaremos cuando se confirme."
            : "Tu pedido fue registrado y el pago fue acreditado correctamente."}
        </p>

        {orderNumber && (
          <div className="w-full bg-sage-50 border border-sage-200 rounded-2xl px-6 py-4 my-6">
            <p className="font-sans text-xs uppercase tracking-widest text-sage-400 mb-1">
              Número de orden
            </p>
            <p
              className="font-serif text-3xl font-semibold text-sage-700 tracking-wide"
              style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
            >
              {orderNumber}
            </p>
            <p className="font-sans text-xs text-sage-400 mt-1">
              Guardá este número para hacer seguimiento de tu pedido
            </p>
          </div>
        )}

        <p className="font-sans text-sm text-sage-400 mb-10">
          En breve nos comunicamos para coordinar la entrega.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Link
            href="/tienda"
            className="flex-1 flex items-center justify-center gap-2 bg-sage-500 hover:bg-sage-600 text-white font-sans font-medium px-6 py-3.5 rounded-2xl transition-colors shadow-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            Seguir comprando
          </Link>
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 border border-sage-200 text-sage-600 hover:border-sage-400 font-sans font-medium px-6 py-3.5 rounded-2xl transition-colors bg-white"
          >
            Ir al inicio
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
