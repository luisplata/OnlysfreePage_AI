
import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { ProductCard } from '@/components/product-card';
import type { Product, ApiPpvItem, ApiPpvListResponse } from '@/types';

// Helper function to transform API PPV item data to Product type
function transformApiPpvItemToProduct(apiPpvItem: ApiPpvItem): Product {
  const description = apiPpvItem.tags || 'No description available.';
  const category = apiPpvItem.tags ? apiPpvItem.tags.split('-')[0].trim().toLowerCase() || 'streaming' : 'streaming';

  return {
    id: String(apiPpvItem.id),
    title: apiPpvItem.nombre,
    description: description,
    imageUrl: apiPpvItem.imagen.trim(),
    category: category,
    productType: 'streaming',
    videoUrl: apiPpvItem.url,
    hotLink: apiPpvItem.url, // For PPV, the stream URL itself can be the hotLink
  };
}

// Helper function for fetching page data
async function fetchPageData(page: number): Promise<ApiPpvListResponse> {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const baseUrl = isDevelopment ? '/api-proxy' : 'https://test.onlysfree.com/api';
  const apiUrl = `${baseUrl}/ppv?page=${page}`;

  const response = await fetch(apiUrl, { headers: { 'Accept': 'application/json' } });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
  }
  const data: ApiPpvListResponse = await response.json();
  if (!data || !data.data || typeof data.last_page === 'undefined') {
    throw new Error('API response for PPV did not contain expected data structure (data array or last_page).');
  }
  return data;
}


export default function StreamingsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1); // Stores the *next* page to fetch
  const [hasMore, setHasMore] = useState(true);


  // Initial data load (first page)
  useEffect(() => {
    async function loadInitialStreamings() {
      setInitialLoading(true);
      setError(null);
      setHasMore(true);
      setCurrentPage(1); // Reset current page for initial load

      try {
        const page1Response = await fetchPageData(1);
        setProducts(page1Response.data.map(transformApiPpvItemToProduct));
        
        if (page1Response.next_page_url != null && 1 < page1Response.last_page) {
          setCurrentPage(2);
          setHasMore(true);
        } else {
          setHasMore(false);
        }
      } catch (e: any) {
        console.error("Failed to fetch initial streamings:", e);
        let errorMessage = e.message || 'Failed to load streamings.';
        if (e.message && e.message.toLowerCase().includes('failed to fetch')) {
          const isDevelopmentEnv = process.env.NODE_ENV === 'development';
          if (!isDevelopmentEnv) {
            errorMessage = `Network error or CORS issue. Ensure the API server (https://test.onlysfree.com) is accessible and CORS is configured for your deployment domain. Details: ${e.message}`;
          } else {
            errorMessage = `Network error. Ensure the API server (https://test.onlysfree.com) is accessible and the development proxy targeting /api-proxy is working correctly. Details: ${e.message}`;
          }
        } else if (e.message && e.message.includes('HTTP error! status: 404')) {
          errorMessage = 'Could not find streaming products (404). The API endpoint might be incorrect or temporarily unavailable.';
        }
        setError(errorMessage);
        setHasMore(false);
      } finally {
        setInitialLoading(false);
      }
    }
    loadInitialStreamings();
  }, []);

  const loadMoreProducts = useCallback(async () => {
    if (loadingMore || !hasMore || initialLoading) return;

    setLoadingMore(true);
    try {
      const pageResponse = await fetchPageData(currentPage);
      setProducts(prevProducts => [
        ...prevProducts,
        ...pageResponse.data.map(transformApiPpvItemToProduct)
      ]);
      
      if (pageResponse.next_page_url != null && currentPage < pageResponse.last_page) {
        setCurrentPage(prev => prev + 1);
        setHasMore(true);
      } else {
        setHasMore(false);
      }
    } catch (e: any) {
      console.error(`Failed to load more streamings (page ${currentPage}):`, e);
      setError(`Failed to load page ${currentPage}. Further loading may be affected.`);
      // Optionally setHasMore(false) here if a subsequent page fails, to stop further attempts.
      // Or allow retries by not setting it to false. For now, let's keep it as is.
    } finally {
      setLoadingMore(false);
    }
  }, [currentPage, hasMore, loadingMore, initialLoading]);

  const handleScroll = useCallback(() => {
    // Check if the user is near the bottom of the page
    const nearBottom = window.innerHeight + document.documentElement.scrollTop + 300 >= document.documentElement.offsetHeight;
    if (nearBottom && hasMore && !loadingMore && !initialLoading) {
      loadMoreProducts();
    }
  }, [hasMore, loadingMore, initialLoading, loadMoreProducts]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);


  if (initialLoading) {
    return (
      <div className="container mx-auto py-8 text-center flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-xl text-muted-foreground">Loading streams...</p>
      </div>
    );
  }

  if (error && products.length === 0) {
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

  if (products.length === 0 && !error) {
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
            <ProductCard key={`${product.id}-${product.title}`} product={product} />
          ))}
        </div>
        {loadingMore && (
          <div className="py-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground mt-2">Loading more streams...</p>
          </div>
        )}
        {!hasMore && products.length > 0 && !initialLoading && (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">You've reached the end of the streams!</p>
          </div>
        )}
         {error && products.length > 0 && (
          <div className="py-8 text-center text-destructive">
            <p>{error}</p>
          </div>
        )}
      </div>
    </>
  );
}
