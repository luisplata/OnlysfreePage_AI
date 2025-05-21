import type { Product, SaleCategory } from '@/types';
import { Tag, Zap, Gift, ShoppingBag } from 'lucide-react';

export const mockProducts: Product[] = [
  {
    id: '1',
    title: 'Modern Wireless Headphones',
    description: 'Experience immersive sound with these sleek wireless headphones. Long battery life and comfortable fit.',
    imageUrl: 'https://placehold.co/600x400.png',
    category: 'Electronics',
    price: '$99.99',
  },
  {
    id: '2',
    title: 'Classic Leather Wallet',
    description: 'A timeless leather wallet with multiple card slots and a currency compartment. Durable and stylish.',
    imageUrl: 'https://placehold.co/600x400.png',
    category: 'Accessories',
    price: '$45.00',
  },
  {
    id: '3',
    title: 'Smart Home Assistant',
    description: 'Control your home with voice commands. Plays music, answers questions, and controls smart devices.',
    imageUrl: 'https://placehold.co/600x400.png',
    category: 'Electronics',
    price: '$79.50',
  },
  {
    id: '4',
    title: 'Ergonomic Office Chair',
    description: 'Improve your posture and comfort with this ergonomic office chair. Adjustable and supportive.',
    imageUrl: 'https://placehold.co/600x400.png',
    category: 'Furniture',
    price: '$249.00',
  },
  {
    id: '5',
    title: 'Gourmet Coffee Beans',
    description: 'Start your day with premium Arabica coffee beans, ethically sourced and expertly roasted.',
    imageUrl: 'https://placehold.co/600x400.png',
    category: 'Groceries',
    price: '$18.99',
  },
  {
    id: '6',
    title: 'Portable Bluetooth Speaker',
    description: 'Compact and powerful Bluetooth speaker for music on the go. Water-resistant and durable.',
    imageUrl: 'https://placehold.co/600x400.png',
    category: 'Electronics',
    price: '$59.99',
  },
];

export const saleCategories: SaleCategory[] = [
  { id: 'daily-deals', name: 'Daily Deals', href: '/deals/daily', icon: Tag },
  { id: 'flash-sales', name: 'Flash Sales', href: '/deals/flash', icon: Zap },
  { id: 'seasonal-offers', name: 'Seasonal Offers', href: '/deals/seasonal', icon: Gift },
  { id: 'all-products', name: 'All Products', href: '/', icon: ShoppingBag },
];
