
import { useEffect, useState } from 'react';
import { ProductCard } from '@/components/product-card';
import type { Product, ApiPack, ApiPackListResponse } from '@/types';
import Head from 'next/head';
import { Loader2 } from 'lucide-react';

// Helper function to transform API pack data to Product type
function transformApiPackToProduct(apiPack: ApiPack): Product {
  // Use tags for description and category for simplicity
  // You might want to process tags further for a more specific category
  const description = apiPack.tags || 'No description available.';
  const category = apiPack.tags ? apiPack.tags.split('-')[0] || 'General' : 'General';

  return {
    id: String(apiPack.id),
    title: apiPack.nombre,
    description: description,
    imageUrl: apiPack.imagen,
    category: category,
    productType: apiPack.isVideo === "1" || (apiPack.url_video && apiPack.url_video !== "") ? 'streaming' : 'standard',
    videoUrl: apiPack.url_video || undefined,
    hotLink: apiPack.hotLink,
  };
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('https://test.onlysfree.com/api/packs');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: ApiPackListResponse = await response.json();
        setProducts(data.data.map(transformApiPackToProduct));
      } catch (e: any) {
        console.error("Failed to fetch products:", e);
        setError(e.message || 'Failed to load products.');
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-8 text-center flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-xl text-muted-foreground">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-3xl font-bold text-destructive mb-4">Error</h1>
        <p className="text-xl text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-3xl font-bold text-foreground mb-4">No Products Found</h1>
        <p className="text-xl text-muted-foreground">Please check back later.</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Venta Rapida - Featured Products</title>
      </Head>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-8 text-foreground text-center sm:text-left">Featured Products</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </>
  );
}
