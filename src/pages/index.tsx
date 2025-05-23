
import { useEffect, useState, useCallback } from 'react';
import { ProductCard } from '@/components/product-card';
import type { Product, ApiPack, ApiPackListResponse } from '@/types';
import Head from 'next/head';
import { Loader2 } from 'lucide-react';
import { BASE_API_URL } from '@/lib/api';

// Helper function to transform API pack data to Product type
function transformApiPackToProduct(apiPack: ApiPack): Product {
  const tagsString = apiPack.tags;
  const description = tagsString || 'No description available.';
  const category = tagsString ? tagsString.split('-')[0].trim().toLowerCase() || 'general' : 'general';
  const idForLink = apiPack.producto_id || String(apiPack.id);

  return {
    id: idForLink,
    title: apiPack.nombre,
    description: description,
    tagsString: tagsString,
    imageUrl: apiPack.imagen,
    category: category,
    productType: (apiPack.isVideo === "1" || (apiPack.url_video && apiPack.url_video !== "")) ? 'streaming' : 'standard',
    videoUrl: apiPack.url_video || undefined,
    hotLink: apiPack.hotLink,
  };
}

// Helper function for fetching page data
async function fetchPageData(page: number): Promise<ApiPackListResponse> {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const baseUrl = isDevelopment ? '/api-proxy' : BASE_API_URL;
  const apiUrl = `${baseUrl}/packs?page=${page}`;

  const response = await fetch(apiUrl);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
  }
  const data: ApiPackListResponse = await response.json();
  if (!data || !data.data || typeof data.last_page === 'undefined') {
    throw new Error('API response did not contain expected data structure (data array or last_page).');
  }
  return data;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1); // Stores the *next* page to fetch
  const [hasMore, setHasMore] = useState(true);

  // Initial data load (pages 1 and potentially 2)
  useEffect(() => {
    async function loadInitialProducts() {
      setInitialLoading(true);
      setError(null);
      setHasMore(true); 
      setCurrentPage(1); 

      try {
        const page1Response = await fetchPageData(1);
        let allFetchedProductsRaw: ApiPack[] = [...page1Response.data];
        let nextPageToLoad = 2;
        let moreDataExistsAfterInitialLoad = page1Response.next_page_url != null && 1 < page1Response.last_page;

        if (moreDataExistsAfterInitialLoad) {
          try {
            const page2Response = await fetchPageData(2);
            allFetchedProductsRaw = [...allFetchedProductsRaw, ...page2Response.data];
            nextPageToLoad = 3; 
            moreDataExistsAfterInitialLoad = page2Response.next_page_url != null && 2 < page2Response.last_page;
          } catch (page2Error: any) {
            console.warn("Failed to fetch page 2 during initial load:", page2Error.message);
          }
        }
        
        setProducts(allFetchedProductsRaw.map(transformApiPackToProduct));
        setCurrentPage(nextPageToLoad);
        setHasMore(moreDataExistsAfterInitialLoad);

      } catch (e: any) {
        console.error("Failed to fetch initial products:", e);
        let errorMessage = e.message || 'Failed to load products.';
        if (e.message && e.message.includes('Failed to fetch')) {
          const isDevelopmentEnv = process.env.NODE_ENV === 'development';
          if (isDevelopmentEnv) {
             errorMessage = `Network error. Ensure the API server (https://test.onlysfree.com) is accessible and the development proxy is working correctly. Proxy is targeting /api-proxy. Details: ${e.message}`;
          } else {
            errorMessage = `Network error or CORS issue. Ensure the API server (https://test.onlysfree.com) is accessible and CORS is configured for your deployment domain. Details: ${e.message}`;
          }
        }
        setError(errorMessage);
        setHasMore(false); 
      } finally {
        setInitialLoading(false);
      }
    }
    loadInitialProducts();
  }, []);


  const loadMoreProducts = useCallback(async () => {
    if (loadingMore || !hasMore || initialLoading) return;

    setLoadingMore(true);
    try {
      const pageResponse = await fetchPageData(currentPage);
      setProducts(prevProducts => [
        ...prevProducts,
        ...pageResponse.data.map(transformApiPackToProduct)
      ]);
      
      if (pageResponse.next_page_url != null && currentPage < pageResponse.last_page) {
        setCurrentPage(prev => prev + 1);
        setHasMore(true);
      } else {
        setHasMore(false);
      }
    } catch (e: any) {
      console.error(`Failed to load more products (page ${currentPage}):`, e);
      setError(`Failed to load page ${currentPage}. Further loading may be affected.`);
      setHasMore(false); 
    } finally {
      setLoadingMore(false);
    }
  }, [currentPage, hasMore, loadingMore, initialLoading]);

  const handleScroll = useCallback(() => {
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
        <p className="text-xl text-muted-foreground">Loading models...</p>
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-3xl font-bold text-destructive mb-4">Error Loading Models</h1>
        <p className="text-xl text-muted-foreground whitespace-pre-wrap px-4">{error}</p>
        <p className="text-sm text-muted-foreground mt-2">
          Please check your internet connection and ensure the API server is accessible.
          If running a static export, ensure the API server ({`${BASE_API_URL}`}) has CORS configured correctly.
        </p>
      </div>
    );
  }

  if (products.length === 0 && !error) {
    return (
      <div className="container mx-auto py-8 text-center">
        <Head>
          <title>OnlysFree - No Models</title>
        </Head>
        <h1 className="text-3xl font-bold text-foreground mb-4">No Models Found</h1>
        <p className="text-xl text-muted-foreground">Please check back later or try refreshing the page.</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>OnlysFree - Featured Models</title>
      </Head>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-8 text-foreground text-center sm:text-left">Featured Models</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={`${product.id}-${product.title}`} product={product} />
          ))}
        </div>
        {loadingMore && (
          <div className="py-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground mt-2">Loading more...</p>
          </div>
        )}
        {!hasMore && products.length > 0 && !initialLoading && (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">You've reached the end!</p>
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
