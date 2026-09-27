export type ReadyProduct = {
  id: string;
  name: string;
  description: string;
  includes: string;
  price: number;
  image: string;
  customizable?: boolean;
};

export type CartItem = {
  key: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  colours?: string;
  wording?: string;
};

export type PreparedRequest = {
  summary: string;
  referenceName?: string;
};

export const WHATSAPP_NUMBER = "6281311507710";
export const INSTAGRAM_URL = "https://www.instagram.com/sweetation_id/";

export const readyProducts: ReadyProduct[] = [
  {
    id: "cupcake-tower",
    name: "Cupcake Tower",
    description: "A beautiful little centerpiece, made for sharing.",
    includes: "10 regular cupcakes + 8 mini cookies",
    price: 480000,
    image: "/images/cupcake-tower.jpg",
    customizable: true,
  },
  {
    id: "diy-cookie-kit",
    name: "DIY Cookie Kit",
    description: "Everything you need for a sweet afternoon together.",
    includes: "Ready-to-decorate cookies, icing & decorations",
    price: 150000,
    image: "/images/diy-kits.jpg",
  },
];

export function formatRupiah(value: number) {
  return `Rp ${new Intl.NumberFormat("id-ID").format(value)}`;
}