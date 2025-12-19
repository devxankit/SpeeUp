export interface Category {
  id: string;
  name: string;
  icon?: string; // emoji or small label
  imageUrl?: string; // optional imported image path
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  pack: string; // e.g. "1 L", "500 g"
  price: number; // selling price
  mrp?: number; // max retail price (optional)
  imageUrl?: string; // imported image path if available
  categoryId: string; // foreign key to Category
  tags?: string[]; // e.g. ["bestseller", "under-99", "deal-of-the-day"]
  rating?: number;
  reviews?: number;
  deliveryTime?: number;
  power?: string;
}

