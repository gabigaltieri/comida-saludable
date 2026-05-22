export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
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
  available: boolean;
  sort_order?: number;
}

export const WHATSAPP_NUMBER = "5491138567142";
export const INSTAGRAM_HANDLE = "@262.cosasricas";
export const ADDRESS = "Tte. Gral. Eustoquio Frías 262, CABA";
export const MAPS_LINK = "https://maps.google.com/?q=Tte.+Gral.+Eustoquio+Frías+262+Buenos+Aires";
export const OPENING_HOURS = {
  weekdays: "Lun – Vie: 9:00 a 20:00",
  saturday: "Sábado: 10:00 a 16:00",
  sunday: "Domingo: cerrado",
};
