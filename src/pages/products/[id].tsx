
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import type { Product, ApiModelDetailResponse } from '@/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, ArrowLeft, Loader2, PlayCircle, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import Head from 'next/head';

// Helper function to transform API model detail to Product type
function transformApiModelToProduct(apiModel: ApiModelDetailResponse): Product {
  const description = apiModel.tags || 'No description available.';
  const category = apiModel.tags ? apiModel.tags.split('-')[0].trim().toLowerCase() || 'general' : 'general';
  return {
    id: String(apiModel.id),
    title: apiModel.nombre,
    description: description,
    imageUrl: apiModel.imagen,
    category: category,
    productType: apiModel.isVideo === "1" || (apiModel.url_video && apiModel.url_video !== "") ? 'streaming' : 'standard',
    videoUrl: apiModel.url_video || undefined,
    hotLink: apiModel.hotLink,
  };
}

export default function ProductDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const productId = Array.isArray(id) ? id?.[0] : id;

    if (!router.isReady || !productId) {
      if (router.isReady && !productId) {
        setLoading(false);
        setError("Product ID is missing or invalid from URL.");
      }
      return;
    }

    async function fetchProductDetails(currentId: string) {
      setLoading(true);
      setError(null);

      const isDevelopment = process.env.NODE_ENV === 'development';
      const baseUrl = isDevelopment ? '/api-proxy' : 'https://test.onlysfree.com/api';
      const apiUrl = `${baseUrl}/model/${currentId}`;

      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          const errorText = await response.text();
          if (response.status === 404) {
            throw new Error('Product not found on the API.');
          }
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        const data: ApiModelDetailResponse = await response.json();
        if (data && data.id) { 
             setProduct(transformApiModelToProduct(data));
        } else {
            throw new Error('API response did not contain expected data structure for product details.');
        }
      } catch (e: any) {
        console.error("Failed to fetch product details:", e);
        let errorMessage = e.message || 'Failed to load product details. Check browser console for more details.';
        if (e.message && e.message.includes('Failed to fetch') && !isDevelopment) {
            errorMessage += ' This might be a CORS issue if the API server (https://test.onlysfree.com) is not configured to allow requests from this domain.';
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    fetchProductDetails(productId);
  }, [id, router.isReady]);

  if (loading) {
    return (
      <>
        <Head>
          <title>Loading Product... - Venta Rapida</title>
        </Head>
        <div className="container mx-auto py-8 text-center flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-xl text-muted-foreground">Loading product details...</p>
        </div>
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Head>
          <title>Product Not Found - Venta Rapida</title>
        </Head>
        <div className="container mx-auto py-8 text-center">
          <h1 className="text-3xl font-bold text-destructive mb-4">
            {error || 'Product Not Found'}
          </h1>
          <p className="text-xl text-muted-foreground mb-6 whitespace-pre-wrap">
            Sorry, we couldn't find the product you were looking for.
          </p>
          <Button variant="outline" asChild className="mt-4">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to All Products
            </Link>
          </Button>
        </div>
      </>
    );
  }

  const isStreamingProduct = product.productType === 'streaming' && product.videoUrl;

  return (
    <>
      <Head>
        <title>{product.title} - Venta Rapida</title>
        <meta name="description" content={product.description.substring(0, 160)} />
      </Head>
      <div className="container mx-auto py-8 px-4">
        <Button variant="outline" asChild className="mb-6">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to All Products
          </Link>
        </Button>

        <Card className="overflow-hidden shadow-xl rounded-lg">
          <CardHeader className="p-6">
            <p className="text-sm text-muted-foreground mb-1">{product.category}</p>
            <CardTitle className="text-2xl lg:text-3xl font-bold text-foreground">{product.title}</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            {isStreamingProduct ? (
              <div className="aspect-video w-full bg-muted rounded-md overflow-hidden mb-6 shadow-inner">
                <iframe
                  src={product.videoUrl}
                  title={product.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
            ) : (
              product.imageUrl && (
                <div className="aspect-square relative w-full overflow-hidden rounded-md md:rounded-lg mb-6 shadow-inner">
                   <Image
                    src={product.imageUrl}
                    alt={product.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                    data-ai-hint={`${product.category} ${product.productType} product detail`}
                    priority={true}
                    onError={(e) => { e.currentTarget.src = 'https://placehold.co/600x400.png?text=Image+Error'; e.currentTarget.srcset = '';}}
                  />
                </div>
              )
            )}
            <CardDescription className="text-base text-foreground/80 mb-6">
              {product.description}
            </CardDescription>
          </CardContent>
          <CardFooter className="p-6 pt-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
             {product.hotLink ? (
                <Button size="lg" className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
                  <a href={product.hotLink} target="_blank" rel="noopener noreferrer">
                    {isStreamingProduct ? <PlayCircle className="mr-2 h-5 w-5" /> : <ImageIcon className="mr-2 h-5 w-5" />}
                    {isStreamingProduct ? 'Watch Stream' : 'View Content'}
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              ) : (
                <p className="text-muted-foreground">No direct link available.</p>
              )}
          </CardFooter>
        </Card>
      </div>
    </>
  );
}

// Required for dynamic routes with output: 'export'
// Returns an empty paths array as pages are generated/content-fetched client-side
export async function getStaticPaths() {
  return {
    paths: [], 
    fallback: false, 
  };
}

export async function getStaticProps({ params }: { params: { id: string } }) {
  return {
    props: {
      // id: params.id, // This prop isn't strictly needed since we get id from router.query
    },
  };
}
