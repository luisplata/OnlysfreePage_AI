
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/product-card';
import type { Product, ApiCategorizedSearchResultsResponse, ApiPack, ApiPpvItem } from '@/types';
import { Loader2, ArrowLeft } from 'lucide-react';

// Helper function to transform API pack data (from search results 'productos') to Product type
function transformApiPackToProduct(apiPack: ApiPack): Product {
  const description = apiPack.tags || 'No description available.';
  const category = apiPack.tags ? apiPack.tags.split('-')[0].trim().toLowerCase() || 'general' : 'general';
  const idForLink = apiPack.producto_id || String(apiPack.id); // Use producto_id if available

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
    hotLink: apiPpvItem.url, // For PPV, the main URL is the hotlink
  };
}

export default function GeneralSearchPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [foundProducts, setFoundProducts] = useState<Product[]>([]);
  const [foundStreams, setFoundStreams] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!router.isReady) return;

    const queryTerm = router.query.term;

    if (typeof queryTerm === 'string' && queryTerm.trim() !== '') {
      const decodedQuery = decodeURIComponent(queryTerm.trim());
      setSearchTerm(decodedQuery);
      fetchResults(decodedQuery);
    } else {
      setLoading(false);
      setError('No search term provided.');
    }

    async function fetchResults(term: string) {
      setLoading(true);
      setError(null);
      setFoundProducts([]);
      setFoundStreams([]);

      const isDevelopment = process.env.NODE_ENV === 'development';
      const baseUrl = isDevelopment ? '/api-proxy' : 'https://test.onlysfree.com/api';
      const apiUrl = `${baseUrl}/search?query=${encodeURIComponent(term)}`;

      try {
        const response = await fetch(apiUrl, { headers: { 'Accept': 'application/json' } });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        const data: ApiCategorizedSearchResultsResponse = await response.json();

        if (data.productos && data.productos.data) {
          setFoundProducts(data.productos.data.map(transformApiPackToProduct));
        }
        if (data.streams && data.streams.data) {
          setFoundStreams(data.streams.data.map(transformApiPpvItemToProduct));
        }

        if ((!data.productos || data.productos.data.length === 0) && (!data.streams || data.streams.data.length === 0)) {
          // Optionally set an error or specific message if no results are found
          // setError(`No results found for "${term}"`);
        }

      } catch (e: any) {
        console.error(`Failed to fetch search results for query "${term}":`, e);
        let errorMessage = e.message || 'Failed to load search results.';
         if (e.message && e.message.toLowerCase().includes('failed to fetch')) {
            errorMessage = `Network error or CORS issue. Ensure the API server is accessible. Details: ${e.message}`;
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  }, [router.isReady, router.query.term]);

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

        {loading && (
          <div className="text-center py-10">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-xl text-muted-foreground">Searching for: "{searchTerm}"...</p>
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-10">
            <h1 className="text-2xl font-bold text-destructive mb-2">Search Error</h1>
            <p className="text-muted-foreground">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            <h1 className="text-3xl font-bold mb-8 text-foreground">
              Search Results for: <span className="text-primary">{searchTerm}</span>
            </h1>

            {foundProducts.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-semibold mb-6 text-foreground">Products</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {foundProducts.map((product) => (
                    <ProductCard key={`prod-${product.id}`} product={product} />
                  ))}
                </div>
              </section>
            )}

            {foundStreams.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold mb-6 text-foreground">Streams</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {foundStreams.map((product) => (
                    <ProductCard key={`stream-${product.id}`} product={product} />
                  ))}
                </div>
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
