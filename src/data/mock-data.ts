
import type { SaleCategory } from '@/types'; // Product type removed as it's fetched from API
import { Tag, Zap, Gift, ShoppingBag } from 'lucide-react'; // Film icon removed as it was an example

// mockProducts array is removed as product data will be fetched from the API.

export const saleCategories: SaleCategory[] = [
  { id: 'daily-deals', name: 'Daily Deals', href: '/deals/daily', icon: Tag },
  { id: 'flash-sales', name: 'Flash Sales', href: '/deals/flash', icon: Zap },
  { id: 'seasonal-offers', name: 'Seasonal Offers', href: '/deals/seasonal', icon: Gift },
  { id: 'all-products', name: 'All Products', href: '/', icon: ShoppingBag },
];
