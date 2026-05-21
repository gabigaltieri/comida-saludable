"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart, formatPrice } from "@/lib/cart";
import { CATEGORIES, WHATSAPP_NUMBER, Product } from "@/lib/data";
import { getProducts } from "@/lib/db";
import { cn } from "@/lib/utils";
import StoreNavbar from "@/components/StoreNavbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  Plus,
  Minus,
  ShoppingBag,
  MessageCircle,
  Truck,
  Home,
  Snowflake,
  Check,
  Loader2,
} from "lucide-react";

function ProductDetail({ productId }: { productId: string }) {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem, items, openCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => {
    getProducts()
      .then(setAllProducts)
      .finally(() => setLoading(false));
  }, []);

  const product = allProducts.find((p) => p.id === productId);
  const cartItem = items.find((i) => i.product.id === product?.id);
  const category = CATEGORIES.find((c) => c.id === product?.category);
  const photos = product
    ? [product.image, product.image2, product.image3].filter(Boolean) as string[]
    : [];

  const related = useMemo(
    () =>
      allProducts
        .filter((p) => p.category === product?.category && p.id !== product?.id)
        .slice(0, 4),
    [allProducts, product?.category, product?.id]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-100">
        <StoreNavbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 text-sage-400 animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-cream-100">
        <StoreNavbar />
        <div className="flex flex-col items-center justify-center py-32 text-center px-5">
          <p className="text-5xl mb-4">😔</p>
          <h1
            className="font-serif text-3xl text-sage-700 mb-2"
            style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
          >
            Producto no encontrado
          </h1>
          <p className="font-sans text-sage-400 text-sm mb-8">
            El producto que buscás no existe o fue removido.
          </p>
          <Link
            href="/tienda"
            className="bg-sage-500 hover:bg-sage-600 text-white font-sans font-medium px-6 py-3 rounded-full transition-colors"
          >
            Volver a la tienda
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const handleAdd = () => {
    for (let i = 0; i < quantity; i++) addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    openCart();
  };

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(
      `¡Hola! Me interesa:\n*${product.name}* x${quantity}\nTotal: ${formatPrice(product.price * quantity)}\n\n¿Está disponible?`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-cream-100">
      <StoreNavbar />

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-4">
        <nav className="flex items-center gap-1.5 text-xs font-sans text-sage-400">
          <Link href="/" className="hover:text-sage-600 transition-colors">
            Inicio
          </Link>
          <ChevronRight className="w-3 h-3 flex-shrink-0" />
          <Link href="/tienda" className="hover:text-sage-600 transition-colors">
            Tienda
          </Link>
          <ChevronRight className="w-3 h-3 flex-shrink-0" />
          <Link href="/tienda" className="hover:text-sage-600 transition-colors">
            {category?.name}
          </Link>
          <ChevronRight className="w-3 h-3 flex-shrink-0" />
          <span className="text-sage-600 font-medium truncate max-w-[160px]">
            {product.name}
          </span>
        </nav>
      </div>

      <main className="max-w-6xl mx-auto px-5 md:px-8 pb-20">
        {/* Product section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-20 mb-24">

          {/* ── Left: galería ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Foto principal */}
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-cream-200 shadow-[0_24px_64px_rgba(84,125,84,0.13)]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePhoto}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={photos[activePhoto]}
                    alt={product.imageAlt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                </motion.div>
              </AnimatePresence>
              {product.featured && (
                <div className="absolute top-4 left-4 bg-salmon-400 text-white text-xs font-sans font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full shadow">
                  Destacado
                </div>
              )}
              {cartItem && (
                <div className="absolute top-4 right-4 bg-sage-500 text-white text-xs font-sans font-bold px-3 py-1.5 rounded-full shadow">
                  {cartItem.quantity} en carrito
                </div>
              )}
            </div>

            {/* Thumbnails — solo si hay más de una foto */}
            {photos.length > 1 && (
              <div className="flex gap-2 mt-3">
                {photos.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActivePhoto(i)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shadow-sm flex-shrink-0 ${
                      activePhoto === i
                        ? "border-sage-500 scale-105"
                        : "border-sage-100 hover:border-sage-300 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <div className="relative w-full h-full">
                      <Image src={src} alt="" fill className="object-cover" sizes="56px" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* ── Right: info ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="flex flex-col"
          >
            {/* Category tag */}
            <p className="font-sans text-xs uppercase tracking-[0.22em] text-sage-400 mb-3">
              {category?.emoji} {category?.name}
            </p>

            {/* Title */}
            <h1
              className="font-serif text-4xl md:text-5xl font-semibold text-sage-800 leading-tight mb-5"
              style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
            >
              {product.name}
            </h1>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-5">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="font-sans text-xs px-3 py-1 rounded-full bg-white text-sage-600 border border-sage-200 font-medium shadow-sm"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Description */}
            <p className="font-sans text-sage-600 text-[15px] leading-relaxed mb-7 border-l-2 border-sage-200 pl-4 italic">
              {product.description}
            </p>

            {/* Price */}
            <div className="flex items-baseline gap-2.5 mb-7">
              <span
                className="font-serif text-5xl font-semibold text-sage-700"
                style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
              >
                {formatPrice(product.price)}
              </span>
              <span className="font-sans text-sm text-sage-400">por unidad</span>
            </div>

            <div className="h-px bg-sage-100 mb-6" />

            {/* Quantity + subtotal */}
            <div className="flex items-center gap-5 mb-5">
              <div className="flex items-center gap-3 bg-white border border-sage-200 rounded-full px-4 py-2.5 shadow-sm">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-6 h-6 rounded-full bg-sage-100 hover:bg-sage-200 flex items-center justify-center transition-colors text-sage-600"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="font-sans font-semibold text-sage-800 w-5 text-center tabular-nums">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-6 h-6 rounded-full bg-sage-100 hover:bg-sage-200 flex items-center justify-center transition-colors text-sage-600"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {quantity > 1 && (
                <motion.p
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="font-sans text-sm text-sage-400"
                >
                  Subtotal:{" "}
                  <span
                    className="font-serif text-xl text-sage-700 font-semibold"
                    style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
                  >
                    {formatPrice(product.price * quantity)}
                  </span>
                </motion.p>
              )}
            </div>

            {/* Add to cart */}
            <motion.button
              onClick={handleAdd}
              disabled={!product.available}
              whileTap={{ scale: 0.97 }}
              className={cn(
                "w-full flex items-center justify-center gap-2.5 rounded-2xl py-4 font-sans font-semibold text-base transition-all duration-300 mb-3",
                added
                  ? "bg-sage-600 text-white"
                  : "bg-sage-500 hover:bg-sage-600 text-white shadow-[0_4px_20px_rgba(84,125,84,0.28)] hover:shadow-[0_8px_32px_rgba(84,125,84,0.38)] hover:-translate-y-0.5",
                !product.available && "opacity-40 cursor-not-allowed"
              )}
            >
              <AnimatePresence mode="wait">
                {added ? (
                  <motion.span
                    key="check"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    {quantity > 1 ? `${quantity} unidades en tu carrito` : "¡Agregado al carrito!"}
                  </motion.span>
                ) : (
                  <motion.span
                    key="add"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center gap-2"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    Agregar al carrito
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* WhatsApp */}
            <button
              onClick={handleWhatsApp}
              className="w-full flex items-center justify-center gap-2.5 rounded-2xl py-3.5 font-sans font-medium text-sm border border-sage-200 bg-white text-sage-600 hover:border-[#25D366] hover:text-[#25D366] hover:bg-green-50 transition-all duration-300 shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              Consultar disponibilidad por WhatsApp
            </button>

            {/* Info pills */}
            <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-sage-100">
              {[
                { Icon: Truck, text: "Entrega coordinada por WhatsApp" },
                { Icon: Home, text: "Retiro en local disponible" },
                { Icon: Snowflake, text: "Packaging isotérmico incluido" },
              ].map(({ Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-1.5 text-xs font-sans text-sage-500 bg-sage-50 px-3 py-1.5 rounded-full border border-sage-100"
                >
                  <Icon className="w-3 h-3 text-sage-400" />
                  {text}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <section>
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="font-sans text-xs uppercase tracking-widest text-sage-400 mb-1">
                  De la misma categoría
                </p>
                <h2
                  className="font-serif text-3xl md:text-4xl text-sage-800 font-semibold"
                  style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
                >
                  También te puede gustar
                </h2>
              </div>
              <Link
                href="/tienda"
                className="hidden md:block font-sans text-sm text-sage-500 hover:text-sage-700 transition-colors pb-1"
              >
                Ver todos →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.35 }}
                >
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function ProductPage({ params }: { params: { id: string } }) {
  return <ProductDetail productId={params.id} />;
}
