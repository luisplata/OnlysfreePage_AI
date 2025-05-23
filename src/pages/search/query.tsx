
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/product-card';
import type { Product, ApiCategorizedSearchResultsResponse, ApiPack, ApiPpvItem } from '@/types';
import { Loader2, ArrowLeft } from 'lucide-react';
import { BASE_API_URL } from '@/lib/api';

// Helper function to transform API pack data (from search results 'productos') to Product type
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

// Helper function to transform API PPV item data (from search results 'streams') to Product type
function transformApiPpvItemToProduct(apiPpvItem: ApiPpvItem): Product {
  const tagsString = apiPpvItem.tags;
  const description = tagsString || 'No description available.';
  const category = tagsString ? tagsString.split('-')[0].trim().toLowerCase() || 'streaming' : 'streaming';

  return {
    id: String(apiPpvItem.id),
    title: apiPpvItem.nombre,
    description: description,
    tagsString: tagsString,
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
  const [combinedResults, setCombinedResults] = useState<Product[]>([]);
  
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [baseApiUrl, setBaseApiUrl] = useState<string>('');

  const [currentPageProducts, setCurrentPageProducts] = useState(1);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);

  const [currentPageStreams, setCurrentPageStreams] = useState(1);
  const [hasMoreStreams, setHasMoreStreams] = useState(true);

  useEffect(() => {
    if (!router.isReady) return;

    const queryTermParam = router.query.term;

    if (typeof queryTermParam === 'string' && queryTermParam.trim() !== '') {
      const decodedQuery = decodeURIComponent(queryTermParam.trim());
      setSearchTerm(decodedQuery);

      const isDevelopment = process.env.NODE_ENV === 'development';
      const apiUrlDomain = isDevelopment ? '/api-proxy' : BASE_API_URL;
      const constructedBaseApiUrl = `${apiUrlDomain}/search?query=${encodeURIComponent(decodedQuery)}`;
      setBaseApiUrl(constructedBaseApiUrl);
      
      fetchInitialResults(constructedBaseApiUrl);
    } else {
      setInitialLoading(false);
      setError('No search term provided.');
      setCombinedResults([]);
      setHasMoreProducts(false);
      setHasMoreStreams(false);
    }

    async function fetchInitialResults(url: string) {
      setInitialLoading(true);
      setError(null);
      setCombinedResults([]);
      setCurrentPageProducts(1); 
      setHasMoreProducts(true);
      setCurrentPageStreams(1); 
      setHasMoreStreams(true);

      let initialItems: Product[] = [];
      let fetchedAnyData = false;

      try {
        // Fetch page 1 of products
        const productsUrl = `${url}&productos_page=1`;
        const productsResponse = await fetch(productsUrl, { headers: { 'Accept': 'application/json' } });
        if (!productsResponse.ok) {
           console.warn(`HTTP error fetching initial products! status: ${productsResponse.status}, message: ${await productsResponse.text()}`);
           setHasMoreProducts(false); // Assume no more if initial fetch fails
        } else {
            const productsData: ApiCategorizedSearchResultsResponse = await productsResponse.json();
            if (productsData.productos && productsData.productos.data) {
              initialItems = [...initialItems, ...productsData.productos.data.map(transformApiPackToProduct)];
              setCurrentPageProducts(productsData.productos.current_page + 1);
              setHasMoreProducts(productsData.productos.next_page_url != null && productsData.productos.current_page < productsData.productos.last_page);
              fetchedAnyData = true;
            } else {
              setHasMoreProducts(false);
            }
        }
      } catch (e: any) {
        console.warn("Error fetching initial products:", e.message);
        setHasMoreProducts(false);
      }
      
      try {
        // Fetch page 1 of streams
        const streamsUrl = `${url}&streams_page=1`;
        const streamsResponse = await fetch(streamsUrl, { headers: { 'Accept': 'application/json' } });
        if (!streamsResponse.ok) {
          console.warn(`HTTP error fetching initial streams! status: ${streamsResponse.status}, message: ${await streamsResponse.text()}`);
          setHasMoreStreams(false); // Assume no more if initial fetch fails
        } else {
            const streamsData: ApiCategorizedSearchResultsResponse = await streamsResponse.json();
            if (streamsData.streams && streamsData.streams.data) {
              initialItems = [...initialItems, ...streamsData.streams.data.map(transformApiPpvItemToProduct)];
              setCurrentPageStreams(streamsData.streams.current_page + 1);
              setHasMoreStreams(streamsData.streams.next_page_url != null && streamsData.streams.current_page < streamsData.streams.last_page);
              fetchedAnyData = true;
            } else {
              setHasMoreStreams(false);
            }
        }
      } catch (e: any) {
        console.warn("Error fetching initial streams:", e.message);
        setHasMoreStreams(false);
      }
        
      setCombinedResults(initialItems);
      if (!fetchedAnyData && initialItems.length === 0) {
         // setError can be set here if both fetches failed and no data was ever loaded.
         // For now, the UI will show "No products or streams found" if combinedResults is empty.
      }

      setInitialLoading(false);
    }
  }, [router.isReady, router.query.term]);

 const loadMoreResults = useCallback(async () => {
    if (loadingMore || initialLoading || !baseApiUrl) return;
    if (!hasMoreProducts && !hasMoreStreams) return;

    setLoadingMore(true);
    let newItems: Product[] = [];

    try {
      if (hasMoreProducts) {
        const productsUrl = `${baseApiUrl}&productos_page=${currentPageProducts}`;
        const productsRes = await fetch(productsUrl, { headers: { 'Accept': 'application/json' } });
        if (!productsRes.ok) {
            console.warn(`Failed to fetch products page ${currentPageProducts}: ${await productsRes.text()}`);
            setHasMoreProducts(false);
        } else {
            const productsData: ApiCategorizedSearchResultsResponse = await productsRes.json();
            if (productsData.productos && productsData.productos.data) {
              newItems = [...newItems, ...productsData.productos.data.map(transformApiPackToProduct)];
              setHasMoreProducts(productsData.productos.next_page_url != null && productsData.productos.current_page < productsData.productos.last_page);
              setCurrentPageProducts(productsData.productos.current_page + 1);
            } else {
              setHasMoreProducts(false);
            }
        }
      }
    } catch (e: any) {
        console.error("Error loading more products:", e.message);
        setError("Failed to load more products. " + e.message);
        setHasMoreProducts(false); // Stop trying for products if an error occurs
    }

    try {
      if (hasMoreStreams) {
        const streamsUrl = `${baseApiUrl}&streams_page=${currentPageStreams}`;
        const streamsRes = await fetch(streamsUrl, { headers: { 'Accept': 'application/json' } });
        if (!streamsRes.ok) {
            console.warn(`Failed to fetch streams page ${currentPageStreams}: ${await streamsRes.text()}`);
            setHasMoreStreams(false);
        } else {
            const streamsData: ApiCategorizedSearchResultsResponse = await streamsRes.json();
            if (streamsData.streams && streamsData.streams.data) {
              newItems = [...newItems, ...streamsData.streams.data.map(transformApiPpvItemToProduct)];
              setHasMoreStreams(streamsData.streams.next_page_url != null && streamsData.streams.current_page < streamsData.streams.last_page);
              setCurrentPageStreams(streamsData.streams.current_page + 1);
            } else {
              setHasMoreStreams(false);
            }
        }
      }
    } catch (e: any) {
        console.error("Error loading more streams:", e.message);
        setError("Failed to load more streams. " + e.message);
        setHasMoreStreams(false); // Stop trying for streams if an error occurs
    }

    if (newItems.length > 0) {
        setCombinedResults(prev => [...prev, ...newItems]);
    }
    setLoadingMore(false);
  }, [
    baseApiUrl,
    currentPageProducts,
    currentPageStreams,
    hasMoreProducts,
    hasMoreStreams,
    loadingMore,
    initialLoading
  ]);

  const handleScroll = useCallback(() => {
    const nearBottom = window.innerHeight + document.documentElement.scrollTop + 300 >= document.documentElement.offsetHeight;
    if (nearBottom && !loadingMore && (hasMoreProducts || hasMoreStreams)) {
      loadMoreResults();
    }
  }, [loadingMore, hasMoreProducts, hasMoreStreams, loadMoreResults]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <>
      <Head>
        <title>{searchTerm ? `Search: ${searchTerm}` : 'Search Results'} - OnlysFree</title>
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

        {!initialLoading && error && combinedResults.length === 0 && (
          <div className="text-center py-10">
            <h1 className="text-2xl font-bold text-destructive mb-2">Search Error</h1>
            <p className="text-muted-foreground whitespace-pre-wrap">{error}</p>
          </div>
        )}

        {!initialLoading && (
          <>
            <h1 className="text-3xl font-bold mb-8 text-foreground">
              Search Results for: <span className="text-primary">{searchTerm}</span>
            </h1>
             {combinedResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {combinedResults.map((product) => (
                  <ProductCard key={`${product.productType}-${product.id}-${product.title}`} product={product} />
                ))}
              </div>
            ) : (
              !error && <div className="text-center py-10">
                <p className="text-xl text-muted-foreground">No products or streams found for "{searchTerm}".</p>
              </div>
            )}
            {loadingMore && (
              <div className="py-8 text-center col-span-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                <p className="text-muted-foreground mt-2">Loading more results...</p>
              </div>
            )}
            {!hasMoreProducts && !hasMoreStreams && combinedResults.length > 0 && !initialLoading && !loadingMore && (
              <div className="py-8 text-center col-span-full">
                <p className="text-muted-foreground">All results shown for this query.</p>
              </div>
            )}
            {error && combinedResults.length > 0 && (
                 <div className="py-8 text-center text-destructive">
                    <p>{error}</p>
                 </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
