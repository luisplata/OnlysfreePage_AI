import type { LucideIcon } from 'lucide-react';

export interface Product {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  price: string;
}

export interface SaleCategory {
  id: string;
  name: string;
  href: string;
  icon: LucideIcon;
}
