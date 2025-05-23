
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, ArrowLeft, ExternalLink } from 'lucide-react';
import type { Product, ApiModelDetailResponse, ApiPpvDetailResponse, ApiPpvItem, ApiPack } from '@/types';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { BASE_API_URL } from '@/lib/api';

// Helper function to transform API model detail (from /api/model/[id]) to Product type
function transformApiModelToProduct(apiModel: ApiModelDetailResponse): Product {
  const tagsString = apiModel.tags;
  const description = tagsString || 'No description available.';
  const category = tagsString ? tagsString.split('-')[0].trim().toLowerCase() || 'general' : 'general';

  return {
    id: String(apiModel.id),
    title: apiModel.nombre,
    description: description,
    tagsString: tagsString,
    imageUrl: apiModel.imagen,
    category: category,
    productType: (apiModel.isVideo === "1" || (apiModel.url_video && apiModel.url_video !== "")) ? 'streaming' : 'standard',
    videoUrl: apiModel.url_video || undefined,
    hotLink: apiModel.hotLink,
  };
}

// Helper function to transform API PPV detail (from /api/ppv/[id]) to Product type
function transformApiPpvDetailToProduct(apiPpvItem: ApiPpvItem): Product {
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


export default function ProductDetailPage() {
  const router = useRouter();
  const { id, type: productTypeParam } = router.query;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProductDetails() {
      const currentId = typeof id === 'string' ? id : undefined;
      if (!currentId) {
        setLoading(false);
        // setError("Product ID is missing in URL query parameters."); // Less aggressive error for initial render
        return;
      }

      setLoading(true);
      setError(null);
      
      const isDevelopment = process.env.NODE_ENV === 'development';
      let apiBaseUrlPart = isDevelopment ? '/api-proxy' : BASE_API_URL;
      
      let apiUrl = '';
      let isStreamingTypeFromQuery = productTypeParam === 'streaming';

      if (isStreamingTypeFromQuery) {
        apiUrl = `${apiBaseUrlPart}/ppv/${currentId}`;
      } else {
        apiUrl = `${apiBaseUrlPart}/model/${currentId}`;
      }

      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        const responseData = await response.json();
        
        if (responseData && responseData.id) {
            if (isStreamingTypeFromQuery) {
                setProduct(transformApiPpvDetailToProduct(responseData as ApiPpvDetailResponse));
            } else {
                setProduct(transformApiModelToProduct(responseData as ApiModelDetailResponse));
            }
        } else {
            throw new Error('API response did not contain expected data structure or was empty.');
        }
      } catch (e: any) {
        console.error(`Error fetching product with ID ${currentId} (type: ${productTypeParam || 'standard'}):`, e);
        let errorMessage = e.message || 'Failed to load product details.';
        if (e.message && e.message.includes('Failed to fetch')) {
            if (isDevelopment){
                errorMessage = `Network error. Ensure the API server (https://test.onlysfree.com) is accessible and the development proxy is working correctly. Proxy is targeting /api-proxy. Details: ${e.message}`;
            } else {
                errorMessage = `Network error or CORS issue. Ensure the API server (https://test.onlysfree.com) is accessible and CORS is configured for your deployment domain. Details: ${e.message}`;
            }
        } else if (e.message && e.message.includes('HTTP error! status: 404')) {
          errorMessage = `Could not find the product (404). The API endpoint might be incorrect or the item ID (${currentId}) does not exist for the specified type (${productTypeParam || 'standard'}).`;
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    if (router.isReady && id) { // Ensure router is ready AND id is present
        fetchProductDetails();
    } else if (router.isReady && !id) {
        setLoading(false);
        setError("Product ID is missing from URL.");
    }
  }, [id, productTypeParam, router.isReady]);

  const handleBackNavigation = () => {
    if (productTypeParam === 'streaming') {
      router.push('/streamings');
    } else {
      router.push('/');
    }
  };

  const handleTagClick = (tag: string) => {
    router.push(`/search/tag?tag=${encodeURIComponent(tag.trim())}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 text-center flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-xl text-muted-foreground">Loading product details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-destructive mb-2">Error Loading Product</h1>
        <p className="text-muted-foreground mb-4 whitespace-pre-wrap px-4">{error}</p>
        <Button variant="outline" onClick={handleBackNavigation}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">Product Not Found</h1>
        <p className="text-muted-foreground mb-6">The product you are looking for (ID: {id || 'N/A'}, Type: {productTypeParam || 'standard'}) does not exist or could not be loaded.</p>
        <Button variant="outline" onClick={handleBackNavigation}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{product.title} - Venta Rapida</title>
        <meta name="description" content={product.description} />
      </Head>
      <div className="container mx-auto p-4 md:p-8">
        <Button variant="outline" onClick={handleBackNavigation} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div>
            {product.productType === 'streaming' && product.videoUrl ? (
              <div className="aspect-video bg-muted rounded-lg overflow-hidden shadow-lg mb-4">
                <iframe
                  width="100%"
                  height="100%"
                  src={product.videoUrl}
                  title={product.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="min-h-[300px] md:min-h-[400px] lg:min-h-[450px]"
                ></iframe>
              </div>
            ) : (
              <div className="aspect-square relative w-full rounded-lg overflow-hidden shadow-lg mb-4 bg-muted">
                <Image
                  src={product.imageUrl || 'https://placehold.co/600x600.png?text=Image+Not+Available'}
                  alt={product.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain"
                  data-ai-hint={`${product.category} product item`}
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/600x600.png?text=Image+Error';
                    e.currentTarget.srcset = '';
                  }}
                />
              </div>
            )}
          </div>

          <div className="space-y-6">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">{product.title}</h1>
            <p className="text-lg text-muted-foreground">{product.description}</p>
            
            <div className="bg-card p-4 rounded-lg shadow">
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">Category</h3>
                <p className="text-card-foreground capitalize">{product.category}</p>
            </div>
            <div className="bg-card p-4 rounded-lg shadow">
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">Product Type</h3>
                <p className="text-card-foreground capitalize">{product.productType}</p>
            </div>
            
            {product.tagsString && product.tagsString.trim() !== '' && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tagsString.split('-')
                    .map(tag => tag.trim())
                    .filter(tag => tag !== '')
                    .map((tag, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
                        onClick={() => handleTagClick(tag)}
                        title={`Search for tag: ${tag}`}
                      >
                        {tag}
                      </Badge>
                    ))}
                </div>
              </div>
            )}

            {product.hotLink && product.productType !== 'streaming' && (
              <Button size="lg" className="w-full mt-6" asChild>
                <a href={product.hotLink} target="_blank" rel="noopener noreferrer">
                  View Content
                  <ExternalLink className="ml-2 h-5 w-5" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
