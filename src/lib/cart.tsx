"use client";

import { useState, useCallback, useEffect, createContext, useContext } from "react";
import { Product, Combo, WHATSAPP_NUMBER } from "./data";

export interface ComboCartItem {
  combo: Combo;
  quantity: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  comboItems: ComboCartItem[];
  addCombo: (combo: Combo) => void;
  removeCombo: (comboId: string) => void;
  replaceCombo: (oldId: string, newCombo: Combo) => void;
  updateComboQuantity: (comboId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  sendToWhatsApp: () => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

function loadCart<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function useCartState(): CartState {
  const [items, setItems] = useState<CartItem[]>(() => loadCart("cart_items", []));
  const [comboItems, setComboItems] = useState<ComboCartItem[]>(() => loadCart("cart_combos", []));
  const [isOpen, setIsOpen] = useState(false);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    localStorage.setItem("cart_items", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem("cart_combos", JSON.stringify(comboItems));
  }, [comboItems]);

  const addCombo = useCallback((combo: Combo) => {
    setComboItems((prev) => {
      const existing = prev.find((i) => i.combo.id === combo.id);
      if (existing) return prev.map((i) => i.combo.id === combo.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { combo, quantity: 1 }];
    });
  }, []);

  const removeCombo = useCallback((comboId: string) => {
    setComboItems((prev) => prev.filter((i) => i.combo.id !== comboId));
  }, []);

  const replaceCombo = useCallback((oldId: string, newCombo: Combo) => {
    setComboItems((prev) =>
      prev.map((i) => i.combo.id === oldId ? { combo: newCombo, quantity: i.quantity } : i)
    );
  }, []);

  const updateComboQuantity = useCallback((comboId: string, quantity: number) => {
    if (quantity <= 0) {
      setComboItems((prev) => prev.filter((i) => i.combo.id !== comboId));
    } else {
      setComboItems((prev) => prev.map((i) => i.combo.id === comboId ? { ...i, quantity } : i));
    }
  }, []);

  const addItem = useCallback((product: Product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.product.id !== productId));
    } else {
      setItems((prev) =>
        prev.map((i) =>
          i.product.id === productId ? { ...i, quantity } : i
        )
      );
    }
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setComboItems([]);
    localStorage.removeItem("cart_items");
    localStorage.removeItem("cart_combos");
    Object.keys(localStorage)
      .filter((k) => k.startsWith("combo_selection_"))
      .forEach((k) => localStorage.removeItem(k));
  }, []);

  const total =
    items.reduce((sum, item) => sum + item.product.price * item.quantity, 0) +
    comboItems.reduce((sum, item) => sum + item.combo.price * item.quantity, 0);
  const itemCount =
    items.reduce((sum, item) => sum + item.quantity, 0) +
    comboItems.reduce((sum, item) => sum + item.quantity, 0);

  const sendToWhatsApp = useCallback(() => {
    if (items.length === 0 && comboItems.length === 0) return;

    const productLines = items.map(
      (item) => `• ${item.quantity}x ${item.product.name} – $${(item.product.price * item.quantity).toLocaleString("es-AR")}`
    );
    const comboLines = comboItems.map((item) => {
      const detail = item.combo.description ? `\n   (${item.combo.description})` : "";
      return `• ${item.quantity}x 🎁 ${item.combo.name} – $${(item.combo.price * item.quantity).toLocaleString("es-AR")}${detail}`;
    });

    const message = [
      "¡Hola! Quiero hacer un pedido 🛒",
      "",
      ...productLines,
      ...comboLines,
      "",
      `*Total: $${total.toLocaleString("es-AR")}*`,
      "",
      "¿Podrían confirmarme disponibilidad y coordinar entrega? ¡Gracias!",
    ].join("\n");

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, "_blank");
  }, [items, comboItems, total]);

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    comboItems,
    addCombo,
    removeCombo,
    replaceCombo,
    updateComboQuantity,
    clearCart,
    total,
    itemCount,
    sendToWhatsApp,
    isOpen,
    openCart,
    closeCart,
  };
}

// Context
import React from "react";

const CartContext = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const cart = useCartState();
  return React.createElement(CartContext.Provider, { value: cart }, children);
}

export function useCart(): CartState {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}
