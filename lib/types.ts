export type ProductSize = string;

export interface Product {
  id: string;
  name: string;
  concern: string;
  concernSlugs?: string[];
  price: number;
  mrp: number;
  sizes: ProductSize[];
  image: string;
  imageHover: string;
  slug: string;
  badge: string;
  rating: number;
  reviewCount: number;
  category: string;
  concerns: string[];
  description?: string;
  ingredients?: string;
  keyIngredients?: { name: string; benefit: string }[];
  howToUse?: string;
  gallery?: string[];
  galleryAlt?: string[];
}

export interface Review {
  name: string;
  verified: boolean;
  date: string;
  rating: number;
  title: string;
  body: string;
  productName: string;
  productSlug: string;
}

export interface BlogPost {
  title: string;
  excerpt: string;
  tag: string;
  date: string;
  image: string;
  slug: string;
  content?: string[];
}

export interface HeroSlide {
  badge: string;
  title: string;
  subtitle: string;
  benefits: string[];
  cta: string;
  href: string;
  image: string;
  bgColor: string;
}

export interface Announcement {
  text: string;
  href: string;
}

export interface RoutineStep {
  label: string;
  slug: string;
}

export interface Routine {
  id: string;
  title: string;
  description: string;
  steps: RoutineStep[];
}

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  image: string;
  size: string;
  price: number;
  quantity: number;
};
