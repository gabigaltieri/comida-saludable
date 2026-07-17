export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  sale_price?: number;
  on_sale?: boolean;
  category: CategoryId;
  subcategory_id?: string;
  image: string;
  image2?: string;
  image3?: string;
  imageAlt: string;
  tags: string[];
  featured?: boolean;
  available: boolean;
}

export type CategoryId = string;


export interface Combo {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  imageAlt: string;
  product_ids: string[];
  product_quantities: Record<string, number>;
  available: boolean;
  sort_order?: number;
}

export const WHATSAPP_NUMBER = "5491138567142";
export const SHIPPING_COST = 10000;
export const INSTAGRAM_HANDLE = "@262.cosasricas";
export const ADDRESS = "Tte. Gral. Eustoquio Frías 262, CABA";
export const MAPS_LINK = "https://maps.app.goo.gl/cu11C5LPSFpRDtvF8";
export const OPENING_HOURS = {
  weekdays: "Lunes a viernes: 9:00 a 15:00",
  saturday: "",
  sunday: "",
};
