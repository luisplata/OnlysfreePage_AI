
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/product-card';
import type { Product, ApiCategorizedSearchResultsResponse, ApiPack, ApiPpvItem, ApiPackListResponse, ApiPpvListResponse } from '@/types';
import { Loader2, ArrowLeft } from 'lucide-react';

// Helper function to transform API pack data (from search results 'productos') to Product type
function transformApiPackToProduct(apiPack: ApiPack): Product {
  const description = apiPack.tags || 'No description available.';
  const category = apiPack.tags ? apiPack.tags.split('-')[0].trim().toLowerCase() || 'general' : 'general';
  const idForLink = apiPack.producto_id || String(apiPack.id);

  return {
    id: idForLink,
    title: apiPack.nombre,
    description: description,
    imageUrl: apiPack.imagen,
    category: category,
    productType: (apiPack.isVideo === "1" || (apiPack.url_video && apiPack.url_video !== "")) ? 'streaming' : 'standard',
    videoUrl: apiPack.url_video || undefined,
    hotLink: apiPack.hotLink,
  };
}

// Helper function to transform API PPV item data (from search results 'streams') to Product type
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
    hotLink: apiPpvItem.url,
  };
}

export default function GeneralSearchPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [foundProducts, setFoundProducts] = useState<Product[]>([]);
  const [foundStreams, setFoundStreams] = useState<Product[]>([]);

  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [baseApiUrl, setBaseApiUrl] = useState<string>('');

  const [currentPageProducts, setCurrentPageProducts] = useState(1);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const [loadingMoreProducts, setLoadingMoreProducts] = useState(false);

  const [currentPageStreams, setCurrentPageStreams] = useState(1);
  const [hasMoreStreams, setHasMoreStreams] = useState(true);
  const [loadingMoreStreams, setLoadingMoreStreams] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;

    const queryTermParam = router.query.term;

    if (typeof queryTermParam === 'string' && queryTermParam.trim() !== '') {
      const decodedQuery = decodeURIComponent(queryTermParam.trim());
      setSearchTerm(decodedQuery);

      const isDevelopment = process.env.NODE_ENV === 'development';
      const apiUrlDomain = isDevelopment ? '/api-proxy' : 'https://test.onlysfree.com/api';
      const constructedBaseApiUrl = `${apiUrlDomain}/search?query=${encodeURIComponent(decodedQuery)}`;
      setBaseApiUrl(constructedBaseApiUrl);
      
      fetchInitialResults(constructedBaseApiUrl);
    } else {
      setInitialLoading(false);
      setError('No search term provided.');
    }

    async function fetchInitialResults(url: string) {
      setInitialLoading(true);
      setError(null);
      setFoundProducts([]);
      setFoundStreams([]);
      setCurrentPageProducts(1);
      setHasMoreProducts(true);
      setCurrentPageStreams(1);
      setHasMoreStreams(true);

      try {
        const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        const data: ApiCategorizedSearchResultsResponse = await response.json();

        if (data.productos && data.productos.data) {
          setFoundProducts(data.productos.data.map(transformApiPackToProduct));
          setCurrentPageProducts(data.productos.current_page + 1);
          setHasMoreProducts(data.productos.next_page_url != null && data.productos.current_page < data.productos.last_page);
        } else {
          setHasMoreProducts(false);
        }

        if (data.streams && data.streams.data) {
          setFoundStreams(data.streams.data.map(transformApiPpvItemToProduct));
          setCurrentPageStreams(data.streams.current_page + 1);
          setHasMoreStreams(data.streams.next_page_url != null && data.streams.current_page < data.streams.last_page);
        } else {
          setHasMoreStreams(false);
        }
      } catch (e: any) {
        console.error(`Failed to fetch search results for query "${decodeURIComponent(queryTermParam as string)}":`, e);
        let errorMessage = e.message || 'Failed to load search results.';
         if (e.message && e.message.toLowerCase().includes('failed to fetch')) {
            errorMessage = `Network error or CORS issue. Ensure the API server is accessible. Details: ${e.message}`;
        }
        setError(errorMessage);
        setHasMoreProducts(false);
        setHasMoreStreams(false);
      } finally {
        setInitialLoading(false);
      }
    }
  }, [router.isReady, router.query.term]);

  const loadMoreProductsData = useCallback(async () => {
    if (!hasMoreProducts || loadingMoreProducts || initialLoading || !baseApiUrl) return;

    setLoadingMoreProducts(true);
    try {
      const url = `${baseApiUrl}&productos_page=${currentPageProducts}`;
      const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
      if (!response.ok) throw new Error(`Failed to fetch more products: ${response.status}`);
      const data: ApiCategorizedSearchResultsResponse = await response.json();
      
      if (data.productos && data.productos.data) {
        setFoundProducts(prev => [...prev, ...data.productos.data.map(transformApiPackToProduct)]);
        setCurrentPageProducts(data.productos.current_page + 1);
        setHasMoreProducts(data.productos.next_page_url != null && data.productos.current_page < data.productos.last_page);
      } else {
        setHasMoreProducts(false);
      }
    } catch (e: any) {
      console.error("Error loading more products:", e.message);
      setError("Failed to load more products. " + e.message);
    } finally {
      setLoadingMoreProducts(false);
    }
  }, [baseApiUrl, currentPageProducts, hasMoreProducts, loadingMoreProducts, initialLoading]);

  const loadMoreStreamsData = useCallback(async () => {
    if (!hasMoreStreams || loadingMoreStreams || initialLoading || !baseApiUrl) return;

    setLoadingMoreStreams(true);
    try {
      const url = `${baseApiUrl}&streams_page=${currentPageStreams}`;
      const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
      if (!response.ok) throw new Error(`Failed to fetch more streams: ${response.status}`);
      const data: ApiCategorizedSearchResultsResponse = await response.json();

      if (data.streams && data.streams.data) {
        setFoundStreams(prev => [...prev, ...data.streams.data.map(transformApiPpvItemToProduct)]);
        setCurrentPageStreams(data.streams.current_page + 1);
        setHasMoreStreams(data.streams.next_page_url != null && data.streams.current_page < data.streams.last_page);
      } else {
        setHasMoreStreams(false);
      }
    } catch (e: any) {
      console.error("Error loading more streams:", e.message);
      setError("Failed to load more streams. " + e.message);
    } finally {
      setLoadingMoreStreams(false);
    }
  }, [baseApiUrl, currentPageStreams, hasMoreStreams, loadingMoreStreams, initialLoading]);

  const handleScroll = useCallback(() => {
    const nearBottom = window.innerHeight + document.documentElement.scrollTop + 300 >= document.documentElement.offsetHeight;
    if (nearBottom) {
      if (hasMoreProducts && !loadingMoreProducts) {
        loadMoreProductsData();
      }
      if (hasMoreStreams && !loadingMoreStreams) {
        loadMoreStreamsData();
      }
    }
  }, [hasMoreProducts, loadingMoreProducts, loadMoreProductsData, hasMoreStreams, loadingMoreStreams, loadMoreStreamsData]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <>
      <Head>
        <title>{searchTerm ? `Search: ${searchTerm}` : 'Search Results'} - Venta Rapida</title>
      </Head>
      <div className="container mx-auto p-4">
        <Button variant="outline" asChild className="mb-6">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>

        {initialLoading && (
          <div className="text-center py-10">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-xl text-muted-foreground">Searching for: "{searchTerm}"...</p>
          </div>
        )}

        {!initialLoading && error && (
          <div className="text-center py-10">
            <h1 className="text-2xl font-bold text-destructive mb-2">Search Error</h1>
            <p className="text-muted-foreground whitespace-pre-wrap">{error}</p>
          </div>
        )}

        {!initialLoading && !error && (
          <>
            <h1 className="text-3xl font-bold mb-8 text-foreground">
              Search Results for: <span className="text-primary">{searchTerm}</span>
            </h1>

            {foundProducts.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-semibold mb-6 text-foreground">Products</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {foundProducts.map((product) => (
                    <ProductCard key={`prod-${product.id}-${product.title}`} product={product} />
                  ))}
                </div>
                {loadingMoreProducts && (
                  <div className="py-8 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground mt-2">Loading more products...</p>
                  </div>
                )}
                {!hasMoreProducts && foundProducts.length > 0 && !loadingMoreProducts && (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">All products shown for this query.</p>
                  </div>
                )}
              </section>
            )}

            {foundStreams.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold mb-6 text-foreground">Streams</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {foundStreams.map((product) => (
                    <ProductCard key={`stream-${product.id}-${product.title}`} product={product} />
                  ))}
                </div>
                 {loadingMoreStreams && (
                  <div className="py-8 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground mt-2">Loading more streams...</p>
                  </div>
                )}
                {!hasMoreStreams && foundStreams.length > 0 && !loadingMoreStreams && (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">All streams shown for this query.</p>
                  </div>
                )}
              </section>
            )}

            {foundProducts.length === 0 && foundStreams.length === 0 && (
              <div className="text-center py-10">
                <p className="text-xl text-muted-foreground">No products or streams found for "{searchTerm}".</p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
