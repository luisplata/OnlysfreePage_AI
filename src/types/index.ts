import type { LucideIcon } from 'lucide-react';

export interface Product {
  id: string;
  title: string;
  description: string;
  imageUrl: string; // For standard products, main image. For streaming, can be a thumbnail.
  category: string;
  price: string;
  productType: 'standard' | 'streaming';
  videoUrl?: string; // Only for streaming products
}

export interface SaleCategory {
  id: string;
  name: string;
  href: string;
  icon: LucideIcon;
}
