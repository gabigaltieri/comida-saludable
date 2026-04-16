export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: CategoryId;
  image: string;
  imageAlt: string;
  tags: string[];
  featured?: boolean;
  available: boolean;
}

export type CategoryId = "viandas-diarias" | "viandas-congeladas" | "ensaladas-tartas" | "catering";

export interface Category {
  id: CategoryId;
  name: string;
  shortName: string;
  description: string;
  image: string;
  imageAlt: string;
  emoji: string;
}

export const CATEGORIES: Category[] = [
  {
    id: "viandas-diarias",
    name: "Viandas Diarias",
    shortName: "Diarias",
    description: "Menús frescos y nutritivos preparados cada día con ingredientes de temporada.",
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80",
    imageAlt: "Vianda diaria saludable con proteína, verduras y cereales integrales",
    emoji: "🥘",
  },
  {
    id: "viandas-congeladas",
    name: "Viandas Congeladas",
    shortName: "Congeladas",
    description: "Preparaciones listas para calentar. Tenés comida casera siempre a mano.",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80",
    imageAlt: "Viandas congeladas saludables listas para calentar en microondas",
    emoji: "❄️",
  },
  {
    id: "ensaladas-tartas",
    name: "Ensaladas & Tartas",
    shortName: "Frescas",
    description: "Ensaladas completas y tartas integrales. Ideales para el almuerzo en el trabajo.",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
    imageAlt: "Ensalada fresca colorida con vegetales de temporada y proteína",
    emoji: "🥗",
  },
  {
    id: "catering",
    name: "Catering para Eventos",
    shortName: "Catering",
    description: "Desayunos de trabajo, reuniones y eventos con una propuesta saludable y elegante.",
    image: "https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80",
    imageAlt: "Catering saludable boutique para eventos corporativos y sociales",
    emoji: "🎉",
  },
];

export const PRODUCTS: Product[] = [
  // Viandas Diarias
  {
    id: "vd-01",
    name: "Bowl de Pollo al Limón",
    description: "Pechuga grillada, arroz integral, brócoli al vapor y salsa de tahini.",
    price: 3200,
    category: "viandas-diarias",
    image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&q=80",
    imageAlt: "Bowl de pollo grillado con arroz integral y brócoli fresco",
    tags: ["proteína", "sin gluten", "bajo en calorías"],
    featured: true,
    available: true,
  },
  {
    id: "vd-02",
    name: "Pasta Integral con Pesto",
    description: "Fideos integrales, pesto de albahaca casero, tomates cherry y queso de cabra.",
    price: 2900,
    category: "viandas-diarias",
    image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=600&q=80",
    imageAlt: "Pasta integral al pesto con tomates cherry y queso de cabra",
    tags: ["vegetariano", "integral"],
    available: true,
  },
  {
    id: "vd-03",
    name: "Salmón con Quinoa",
    description: "Filet de salmón al horno, quinoa tricolor, espárragos y salsa de limón.",
    price: 4500,
    category: "viandas-diarias",
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&q=80",
    imageAlt: "Salmón horneado sobre quinoa con espárragos verdes frescos",
    tags: ["omega-3", "sin gluten", "premium"],
    featured: true,
    available: true,
  },
  {
    id: "vd-04",
    name: "Wok de Tofu & Vegetales",
    description: "Tofu salteado, mix de vegetales asiáticos, fideos de arroz y salsa tamari.",
    price: 2800,
    category: "viandas-diarias",
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=80",
    imageAlt: "Wok vegetariano de tofu con vegetales coloridos y fideos de arroz",
    tags: ["vegano", "sin gluten", "sin lactosa"],
    available: true,
  },
  // Viandas Congeladas
  {
    id: "vc-01",
    name: "Lasagna de Espinaca x3",
    description: "Lasagna vegetal con ricota, espinaca y salsa de tomate casera. Pack de 3 porciones.",
    price: 5400,
    category: "viandas-congeladas",
    image: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=600&q=80",
    imageAlt: "Lasagna de espinaca y ricota en contenedor para congelar",
    tags: ["vegetariano", "pack x3"],
    featured: true,
    available: true,
  },
  {
    id: "vc-02",
    name: "Cazuela de Lentejas x2",
    description: "Lentejas estofadas con verduras de temporada y especias. Reconfortante y nutritiva.",
    price: 3800,
    category: "viandas-congeladas",
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80",
    imageAlt: "Cazuela de lentejas con verduras en recipiente biodegradable",
    tags: ["vegano", "sin gluten", "alto en fibra", "pack x2"],
    available: true,
  },
  {
    id: "vc-03",
    name: "Pollo al Curry x3",
    description: "Curry de pollo con leche de coco, arroz jazmín y cilantro fresco. Exótico y saludable.",
    price: 6200,
    category: "viandas-congeladas",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80",
    imageAlt: "Pollo al curry con leche de coco y arroz jazmín en porción individual",
    tags: ["sin gluten", "sin lactosa", "pack x3"],
    available: true,
  },
  {
    id: "vc-04",
    name: "Empanadas Integrales x6",
    description: "Empanadas de tapa integral con rellenos rotativos. Consultá sabores disponibles.",
    price: 4200,
    category: "viandas-congeladas",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    imageAlt: "Empanadas integrales caseras listas para hornear",
    tags: ["artesanal", "pack x6"],
    available: true,
  },
  // Ensaladas & Tartas
  {
    id: "et-01",
    name: "Ensalada Mediterránea",
    description: "Rúcula, tomate seco, pepino, aceitunas negras, feta y aderezo de limón.",
    price: 2400,
    category: "ensaladas-tartas",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&q=80",
    imageAlt: "Ensalada mediterránea con rúcula queso feta y aceitunas en bowl de cerámica",
    tags: ["vegetariano", "sin gluten", "fresco"],
    featured: true,
    available: true,
  },
  {
    id: "et-02",
    name: "Tarta de Zapallito & Ricota",
    description: "Masa integral sin manteca, zapallito rallado, ricota y hierbas frescas.",
    price: 3100,
    category: "ensaladas-tartas",
    image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80",
    imageAlt: "Tarta integral de zapallito y ricota recién horneada cortada en porciones",
    tags: ["vegetariano", "integral", "horneado"],
    available: true,
  },
  {
    id: "et-03",
    name: "Bowl Proteico Power",
    description: "Garbanzos, huevo duro, aguacate, maíz morado, semillas y vinagreta de mostaza.",
    price: 2700,
    category: "ensaladas-tartas",
    image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=600&q=80",
    imageAlt: "Bowl proteico con garbanzos aguacate y semillas en bowl de madera",
    tags: ["alto en proteína", "vegano", "sin gluten"],
    available: true,
  },
  {
    id: "et-04",
    name: "Tarta de Puerro & Brie",
    description: "Masa de avena, puerros caramelizados, queso brie y semillas de sésamo.",
    price: 3400,
    category: "ensaladas-tartas",
    image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&q=80",
    imageAlt: "Tarta gourmet de puerro y queso brie con semillas de sésamo",
    tags: ["vegetariano", "gourmet"],
    available: true,
  },
  // Catering
  {
    id: "cat-01",
    name: "Desayuno Ejecutivo",
    description: "Mini sándwiches integrales, jugos prensados, frutas de temporada y café specialty. Desde 10 personas.",
    price: 8500,
    category: "catering",
    image: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=600&q=80",
    imageAlt: "Desayuno corporativo saludable con frutas jugos y sandwiches integrales",
    tags: ["corporativo", "desde 10 pax"],
    featured: true,
    available: true,
  },
  {
    id: "cat-02",
    name: "Lunch Boutique",
    description: "Catering completo para reuniones y eventos: entrada, principal y postre saludable.",
    price: 14000,
    category: "catering",
    image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&q=80",
    imageAlt: "Servicio de catering boutique con bandejas elegantes para eventos",
    tags: ["eventos", "completo", "desde 20 pax"],
    available: true,
  },
];

export const WHATSAPP_NUMBER = "5491100000000"; // Replace with real number
export const INSTAGRAM_HANDLE = "@262.cosasricas";
export const ADDRESS = "Tte. Gral. Eustoquio Frías 262, CABA";
export const MAPS_LINK = "https://maps.google.com/?q=Tte.+Gral.+Eustoquio+Frías+262+Buenos+Aires";
export const OPENING_HOURS = {
  weekdays: "Lun – Vie: 9:00 a 20:00",
  saturday: "Sábado: 10:00 a 16:00",
  sunday: "Domingo: cerrado",
};
