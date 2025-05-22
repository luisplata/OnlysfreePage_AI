
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { ProductCard } from '@/components/product-card';
import type { Product, ApiPpvItem, ApiPpvListResponse } from '@/types';

// Helper function to transform API PPV item data to Product type
function transformApiPpvItemToProduct(apiPpvItem: ApiPpvItem): Product {
  const description = apiPpvItem.tags || 'No description available.';
  // Extract a category from tags, e.g., "onlyfans" from "onlyfans-natalie monroe"
  const category = apiPpvItem.tags ? apiPpvItem.tags.split('-')[0].trim().toLowerCase() || 'streaming' : 'streaming';

  return {
    id: String(apiPpvItem.id),
    title: apiPpvItem.nombre,
    description: description,
    imageUrl: apiPpvItem.imagen.trim(), // Ensure no leading/trailing spaces in image URL
    category: category,
    productType: 'streaming', // All items from /api/ppv are considered streaming
    videoUrl: apiPpvItem.url, // The 'url' field from PPV seems to be the direct video link
    // hotLink: apiPpvItem.url, // Could also use url as hotLink if needed for consistency
  };
}

export default function StreamingsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStreamings() {
      setLoading(true);
      setError(null);
      
      const isDevelopment = process.env.NODE_ENV === 'development';
      // Use proxy for development, direct API URL for production/static export
      const apiUrl = isDevelopment 
        ? '/api-proxy/ppv' 
        : 'https://test.onlysfree.com/api/ppv';

      try {
        const response = await fetch(apiUrl, { 
          headers: { 
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        
        const data: ApiPpvListResponse = await response.json();
        
        if (data && data.data) {
          setProducts(data.data.map(transformApiPpvItemToProduct));
        } else {
          throw new Error('API response did not contain expected data structure for PPV items (expected "data" array).');
        }
      } catch (e: any) {
        console.error("Failed to fetch streaming products:", e);
        let errorMessage = e.message || 'Failed to load streaming products.';
        
        if (e.message && e.message.toLowerCase().includes('failed to fetch')) {
            errorMessage = 'Network error or CORS issue. Ensure the API server (https://test.onlysfree.com) is accessible and CORS is configured correctly if running a static build. For development, check proxy settings.';
        } else if (e.message && e.message.includes('HTTP error! status: 404')) {
          errorMessage = 'Could not find the streaming products (404). The API endpoint might be incorrect or temporarily unavailable.';
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }
    fetchStreamings();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-8 text-center flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-xl text-muted-foreground">Loading streams...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-3xl font-bold text-destructive mb-4">Error Loading Streams</h1>
        <p className="text-xl text-muted-foreground whitespace-pre-wrap px-4">{error}</p>
         <Button variant="outline" asChild className="mt-6">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="container mx-auto py-8 text-center">
        <Head>
          <title>Venta Rapida - No Streams Found</title>
        </Head>
        <h1 className="text-3xl font-bold text-foreground mb-4">No Streams Found</h1>
        <p className="text-xl text-muted-foreground">Please check back later or try refreshing the page.</p>
         <Button variant="outline" asChild className="mt-6">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Streamings - Venta Rapida</title>
        <meta name="description" content="Featured streaming content available on Venta Rapida." />
      </Head>
      <div className="container mx-auto p-4">
        <Button variant="outline" asChild className="mb-6">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        <h1 className="text-3xl font-bold mb-8 text-foreground text-center sm:text-left">Featured Streams</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </>
  );
}
