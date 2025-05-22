
import type { SaleCategory } from '@/types';
import { PlaySquare, Tag, Zap, Gift, ShoppingBag } from 'lucide-react';

// Updated to only include Streamings as per user request for the sidebar.
export const saleCategories: SaleCategory[] = [
  { id: 'streamings', name: 'Streamings', href: '/streamings', icon: PlaySquare },
  // { id: 'daily-deals', name: 'Daily Deals', href: '/deals/daily', icon: Tag },
  // { id: 'flash-sales', name: 'Flash Sales', href: '/deals/flash', icon: Zap },
  // { id: 'seasonal-offers', name: 'Seasonal Offers', href: '/deals/seasonal', icon: Gift },
  // { id: 'all-products', name: 'All Products', href: '/', icon: ShoppingBag },
];
