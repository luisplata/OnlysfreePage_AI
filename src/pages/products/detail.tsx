
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, ArrowLeft, ExternalLink } from 'lucide-react';
import type { Product, ApiModelDetailResponse } from '@/types';
import Link from 'next/link';

// Helper function to transform API model detail to Product type
function transformApiModelToProduct(apiModel: ApiModelDetailResponse): Product {
  const description = apiModel.tags || 'No description available.';
  // Extract a category from tags, e.g., "meganworld" from "meganworld-onlyfans"
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
  const { id } = router.query; // Get the product ID from the URL query parameters

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProductDetails() {
      if (!id || typeof id !== 'string') {
        setLoading(false);
        // setError('Product ID is missing or invalid.'); // Optional: show error if no ID
        return;
      }

      setLoading(true);
      setError(null);
      
      const isDevelopment = process.env.NODE_ENV === 'development';
      const baseUrl = isDevelopment ? '/api-proxy' : 'https://test.onlysfree.com/api';
      const apiUrl = `${baseUrl}/model/${id}`;

      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        const apiModel: ApiModelDetailResponse = await response.json();
        if (apiModel && apiModel.id) { // Check if data is valid
            setProduct(transformApiModelToProduct(apiModel));
        } else {
            throw new Error('API response did not contain expected data structure or was empty.');
        }
      } catch (e: any) {
        console.error(`Error fetching product with ID ${id}:`, e);
        let errorMessage = e.message || 'Failed to load product details.';
        if (e.message && e.message.includes('Failed to fetch')) {
            errorMessage += '\nThis might be a CORS issue if the API server is not configured to allow requests from this domain, or a network connectivity problem.';
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    if (router.isReady) { // Ensure router.query is populated
        fetchProductDetails();
    }
  }, [id, router.isReady]);


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
        <p className="text-muted-foreground mb-4 whitespace-pre-wrap">{error}</p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">Product Not Found</h1>
        <p className="text-muted-foreground mb-6">The product you are looking for does not exist or could not be loaded.</p>
        <Button variant="outline" asChild>
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
        <title>{product.title} - Venta Rapida</title>
        <meta name="description" content={product.description} />
      </Head>
      <div className="container mx-auto p-4 md:p-8">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div>
            {product.productType === 'streaming' && product.videoUrl ? (
              <div className="aspect-video bg-muted rounded-lg overflow-hidden shadow-lg mb-4">
                {product.videoUrl.includes('youtube.com') || product.videoUrl.includes('youtu.be') ? (
                  <iframe
                    width="100%"
                    height="100%"
                    src={product.videoUrl.replace('watch?v=', 'embed/')}
                    title={product.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="min-h-[300px]"
                  ></iframe>
                ) : (
                   <video controls width="100%" className="min-h-[300px]" poster={product.imageUrl}>
                    <source src={product.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            ) : (
              <div className="aspect-square relative w-full rounded-lg overflow-hidden shadow-lg mb-4 bg-muted">
                <Image
                  src={product.imageUrl || 'https://placehold.co/600x600.png?text=Image+Not+Available'}
                  alt={product.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain"
                  data-ai-hint={`${product.category} product`}
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

            {product.hotLink && (
              <Button size="lg" className="w-full" asChild>
                <a href={product.hotLink} target="_blank" rel="noopener noreferrer">
                  {product.productType === 'streaming' ? 'Watch Stream' : 'View Content'}
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
