
import { useEffect, useState } from 'react';
import { ProductCard } from '@/components/product-card';
import type { Product, ApiPack, ApiPackListResponse } from '@/types';
import Head from 'next/head';
import { Loader2 } from 'lucide-react';

// Helper function to transform API pack data to Product type
function transformApiPackToProduct(apiPack: ApiPack): Product {
  const description = apiPack.tags || 'No description available.';
  // Extract a category from tags, e.g., "meganworld" from "meganworld-onlyfans"
  const category = apiPack.tags ? apiPack.tags.split('-')[0].trim().toLowerCase() || 'general' : 'general';

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
      
      const isDevelopment = process.env.NODE_ENV === 'development';
      const baseUrl = isDevelopment ? '/api-proxy' : 'https://test.onlysfree.com/api';
      const apiUrl = `${baseUrl}/packs`;

      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        const data: ApiPackListResponse = await response.json();
        if (data && data.data) {
          setProducts(data.data.map(transformApiPackToProduct));
        } else {
          throw new Error('API response did not contain expected data structure.');
        }
      } catch (e: any) {
        console.error("Failed to fetch products:", e);
        let errorMessage = e.message || 'Failed to load products. Check browser console for more details.';
        if (e.message && e.message.includes('Failed to fetch') && !isDevelopment) {
            errorMessage += ' This might be a CORS issue if the API server (https://test.onlysfree.com) is not configured to allow requests from this domain.';
        }
        setError(errorMessage);
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
        <h1 className="text-3xl font-bold text-destructive mb-4">Error Loading Products</h1>
        <p className="text-xl text-muted-foreground whitespace-pre-wrap">{error}</p>
        <p className="text-sm text-muted-foreground mt-2">
          Please check your internet connection and ensure the API server is accessible.
          If running a static export, ensure the API server (https://test.onlysfree.com) has CORS configured correctly.
        </p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="container mx-auto py-8 text-center">
        <Head>
          <title>Venta Rapida - No Products</title>
        </Head>
        <h1 className="text-3xl font-bold text-foreground mb-4">No Products Found</h1>
        <p className="text-xl text-muted-foreground">Please check back later or try refreshing the page.</p>
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
