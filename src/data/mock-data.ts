import type { Product, SaleCategory } from '@/types';
import { Tag, Zap, Gift, ShoppingBag, Film } from 'lucide-react';

export const mockProducts: Product[] = [
  {
    id: '1',
    title: 'Modern Wireless Headphones',
    description: 'Experience immersive sound with these sleek wireless headphones. Long battery life and comfortable fit.',
    imageUrl: 'https://placehold.co/600x400.png',
    category: 'Electronics',
    price: '$99.99',
    productType: 'standard',
  },
  {
    id: '2',
    title: 'Classic Leather Wallet',
    description: 'A timeless leather wallet with multiple card slots and a currency compartment. Durable and stylish.',
    imageUrl: 'https://placehold.co/600x400.png',
    category: 'Accessories',
    price: '$45.00',
    productType: 'standard',
  },
  {
    id: '3',
    title: 'Smart Home Assistant',
    description: 'Control your home with voice commands. Plays music, answers questions, and controls smart devices.',
    imageUrl: 'https://placehold.co/600x400.png',
    category: 'Electronics',
    price: '$79.50',
    productType: 'standard',
  },
  {
    id: '4',
    title: 'Ergonomic Office Chair',
    description: 'Improve your posture and comfort with this ergonomic office chair. Adjustable and supportive.',
    imageUrl: 'https://placehold.co/600x400.png',
    category: 'Furniture',
    price: '$249.00',
    productType: 'standard',
  },
  {
    id: '5',
    title: 'Gourmet Coffee Beans',
    description: 'Start your day with premium Arabica coffee beans, ethically sourced and expertly roasted.',
    imageUrl: 'https://placehold.co/600x400.png',
    category: 'Groceries',
    price: '$18.99',
    productType: 'standard',
  },
  {
    id: '6',
    title: 'Portable Bluetooth Speaker',
    description: 'Compact and powerful Bluetooth speaker for music on the go. Water-resistant and durable.',
    imageUrl: 'https://placehold.co/600x400.png',
    category: 'Electronics',
    price: '$59.99',
    productType: 'standard',
  },
  {
    id: '7',
    title: 'Live Concert Stream: The Cosmic Keys',
    description: 'Experience the electrifying performance of The Cosmic Keys, live from your home. High-definition video and concert-quality audio. This is an exclusive stream.',
    imageUrl: 'https://placehold.co/600x400.png', // Thumbnail for the stream
    category: 'Streaming',
    price: '$19.99',
    productType: 'streaming',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Example video (Rick Astley)
  },
];

export const saleCategories: SaleCategory[] = [
  { id: 'daily-deals', name: 'Daily Deals', href: '/deals/daily', icon: Tag },
  { id: 'flash-sales', name: 'Flash Sales', href: '/deals/flash', icon: Zap },
  { id: 'seasonal-offers', name: 'Seasonal Offers', href: '/deals/seasonal', icon: Gift },
  { id: 'all-products', name: 'All Products', href: '/', icon: ShoppingBag },
  // Example if we want to add a category for streaming products in the sidebar
  // { id: 'live-streams', name: 'Live Streams', href: '/streams', icon: Film },
];
