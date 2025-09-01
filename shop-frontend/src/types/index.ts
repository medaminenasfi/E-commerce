export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'employer' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  slug: string;
  categoryId: string;
  category?: {
    _id: string;
    name: string;
    slug: string;
  };
  brand?: string;
  variants: ProductVariant[];
  images: string[];
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  name: string;
  sku: string;
  price: number;
  comparePrice?: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  attributes: Record<string, string>;
  isActive: boolean;
}

export interface CartItem {
  productId: string;
  variantSku: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
  image?: string;
}

export interface Cart {
  _id: string;
  items: CartItem[];
  subtotal: number;
  total: number;
  couponCode?: string;
  couponDiscount: number;
  itemCount: number;
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  slug: string;
  parentId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
