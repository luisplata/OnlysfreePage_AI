
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import type { Product } from '@/types';
import { mockProducts } from '@/data/mock-data';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, ArrowLeft, Loader2, PlayCircle } from 'lucide-react';
import Link from 'next/link';
import Head from 'next/head';

// Required for dynamic routes with `output: 'export'`
// This tells Next.js that no specific paths are pre-rendered at build time.
// The page will be a shell, and data fetched client-side.
export async function getStaticPaths() {
  const paths = mockProducts.map((product) => ({
    params: { id: product.id },
  }));
  return {
    paths, // Pre-render paths from mockProducts
    fallback: false, // Any path not returned by getStaticPaths will result in a 404 page.
  };
}

// Required if getStaticPaths is used.
// Can be minimal if all data is fetched client-side for some products,
// but for pre-rendered paths, it should fetch data.
export async function getStaticProps({ params }: { params: { id: string } }) {
  const product = mockProducts.find((p) => p.id === params.id) || null;
  return {
    props: {
      product, // Pass product data for pre-rendering
    },
  };
}

export default function ProductDetailPage({ product: initialProduct }: { product: Product | null }) {
  const router = useRouter();
  const { id: queryId } = router.query;

  const [product, setProduct] = useState<Product | null | undefined>(initialProduct);
  const [loading, setLoading] = useState(!initialProduct); // Only loading if no initial product

  useEffect(() => {
    // If product was passed via getStaticProps, no need to fetch client-side initially
    if (initialProduct) {
      setProduct(initialProduct);
      setLoading(false);
      return;
    }

    // Fallback to client-side fetching if not pre-rendered or if router ID changes
    if (!router.isReady) {
      setLoading(true);
      return;
    }

    let currentId: string | undefined = undefined;
    if (Array.isArray(queryId)) {
      currentId = queryId[0];
    } else {
      currentId = queryId;
    }

    if (currentId) {
      setLoading(true);
      // Simulate API call. Replace this with your actual API call.
      // console.log('Client-side: Fetching product with ID:', currentId);
      const foundProduct = mockProducts.find((p) => p.id === currentId);
      setTimeout(() => { // Simulate network latency
        setProduct(foundProduct || null);
        setLoading(false);
      }, 300);
    } else if (router.isReady) {
      // console.log('Client-side: No valid ID available, setting product to null');
      setProduct(null);
      setLoading(false);
    }
  }, [queryId, router.isReady, initialProduct]);

  if (loading || product === undefined) {
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

  if (!product) {
    return (
      <>
        <Head>
          <title>Product Not Found - Venta Rapida</title>
        </Head>
        <div className="container mx-auto py-8 text-center">
          <h1 className="text-3xl font-bold text-destructive mb-4">Product Not Found</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Sorry, we couldn't find the product you were looking for.
          </p>
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to All Products
            </Link>
          </Button>
        </div>
      </>
    );
  }

  const relatedProducts = mockProducts.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

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

        {product.productType === 'streaming' && product.videoUrl ? (
          <Card className="overflow-hidden shadow-xl rounded-lg">
            <CardHeader className="p-6">
              <p className="text-sm text-muted-foreground mb-1">{product.category}</p>
              <CardTitle className="text-2xl lg:text-3xl font-bold text-foreground">{product.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
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
              <CardDescription className="text-base text-foreground/80 mb-6">
                {product.description}
              </CardDescription>
            </CardContent>
            <CardFooter className="p-6 pt-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <p className="text-3xl font-bold text-primary self-center sm:self-auto">{product.price}</p>
              <Button size="lg" className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
                <PlayCircle className="mr-2 h-5 w-5" />
                {product.category === 'Streaming' ? 'Watch Now' : 'Add to Cart'}
              </Button>
            </CardFooter>
          </Card>
        ) : (
          // Standard Product Layout
          <Card className="overflow-hidden shadow-xl rounded-lg">
            <div className="grid md:grid-cols-2 gap-0 md:gap-6 lg:gap-12 items-start">
              <div className="p-0 md:p-4">
                <div className="aspect-square relative w-full overflow-hidden rounded-md md:rounded-lg">
                  <Image
                    src={product.imageUrl}
                    alt={product.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                    data-ai-hint={`${product.category} ${product.productType} product detail`}
                    priority={true}
                  />
                </div>
              </div>
              <div className="p-6 flex flex-col justify-between h-full">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{product.category}</p>
                  <CardTitle className="text-2xl lg:text-3xl font-bold mb-3 text-foreground">{product.title}</CardTitle>
                  <CardDescription className="text-base text-foreground/80 mb-6">
                    {product.description}
                  </CardDescription>
                </div>
                <CardFooter className="p-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-auto">
                  <p className="text-3xl font-bold text-primary self-center sm:self-auto">{product.price}</p>
                  <Button size="lg" className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to Cart
                  </Button>
                </CardFooter>
              </div>
            </div>
          </Card>
        )}

        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-center md:text-left text-foreground">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(relatedProduct => (
                 <Link key={relatedProduct.id} href={`/products/${relatedProduct.id}`} passHref legacyBehavior>
                  <a className="block group">
                    <Card className="h-full flex flex-col overflow-hidden transition-all duration-200 ease-in-out group-hover:shadow-xl group-hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg">
                      <CardHeader className="p-0">
                        <div className="aspect-video relative w-full overflow-hidden">
                          <Image
                            src={relatedProduct.imageUrl}
                            alt={relatedProduct.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            data-ai-hint={`${relatedProduct.category} ${relatedProduct.productType} product related`}
                          />
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 flex-grow">
                        <CardTitle className="text-md leading-tight mb-1 group-hover:text-primary transition-colors">
                          {relatedProduct.title}
                        </CardTitle>
                         <p className="text-md font-semibold text-primary mt-1">{relatedProduct.price}</p>
                      </CardContent>
                       <CardFooter className="p-4 pt-0">
                        <Button variant="outline" size="sm" className="w-full">
                          View Product
                        </Button>
                      </CardFooter>
                    </Card>
                  </a>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
