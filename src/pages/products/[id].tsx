import { mockProducts } from '@/data/mock-data';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Head from 'next/head';
import type { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';
import type { Product } from '@/types';

export default function ProductDetailPage({ product }: InferGetStaticPropsType<typeof getStaticProps>) {
  if (!product) {
    // This should ideally be handled by getStaticProps notFound: true,
    // leading to a 404 page. This is a fallback.
    return (
      <>
        <Head>
          <title>Product Not Found - Venta Rapida</title>
        </Head>
        <div className="container mx-auto py-8 text-center">
          <p className="text-xl text-destructive">Product not found.</p>
          <Button variant="outline" asChild className="mt-4">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Link>
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{product.title} - Venta Rapida</title>
        <meta name="description" content={product.description.substring(0, 160)} />
      </Head>
      <div className="container mx-auto py-8">
        <Button variant="outline" asChild className="mb-6">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Link>
        </Button>
        <Card className="overflow-hidden">
          <div className="grid md:grid-cols-2 gap-6 lg:gap-12 items-start">
            <CardHeader className="p-0 md:p-6">
              <div className="aspect-square relative w-full overflow-hidden rounded-md">
                <Image
                  src={product.imageUrl}
                  alt={product.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  data-ai-hint={`${product.category} product detail`}
                />
              </div>
            </CardHeader>
            <CardContent className="p-6 flex flex-col justify-between h-full">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{product.category}</p>
                <CardTitle className="text-3xl lg:text-4xl font-bold mb-3">{product.title}</CardTitle>
                <CardDescription className="text-base text-foreground/80 mb-6">
                  {product.description} This is an extended description for the product detail page, providing more insights into its features, benefits, and why it's a great choice.
                </CardDescription>
              </div>
              <CardFooter className="p-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <p className="text-3xl font-bold text-primary">{product.price}</p>
                <Button size="lg" className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
              </CardFooter>
            </CardContent>
          </div>
        </Card>

        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {mockProducts.filter(p => p.id !== product.id).slice(0, 4).map(relatedProduct => (
               <Link key={relatedProduct.id} href={`/products/${relatedProduct.id}`} passHref legacyBehavior>
                <a className="block group">
                  <Card className="h-full flex flex-col overflow-hidden transition-all duration-200 ease-in-out group-hover:shadow-lg group-hover:scale-105">
                    <CardHeader className="p-0">
                      <div className="aspect-video relative w-full overflow-hidden">
                        <Image
                          src={relatedProduct.imageUrl}
                          alt={relatedProduct.title}
                          fill
                          className="object-cover"
                          data-ai-hint={`${relatedProduct.category} product related`}
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 flex-grow">
                      <CardTitle className="text-md leading-tight mb-1 group-hover:text-primary transition-colors">
                        {relatedProduct.title}
                      </CardTitle>
                      <p className="text-md font-semibold text-primary">{relatedProduct.price}</p>
                    </CardContent>
                  </Card>
                </a>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = mockProducts.map((product) => ({
    params: { id: product.id },
  }));
  return { paths, fallback: 'blocking' }; // 'blocking' or true if you want to ISR for new paths, false for 404
};

export const getStaticProps: GetStaticProps<{ product: Product | null }, { id: string }> = async (context) => {
  const { params } = context;
  const productId = params?.id;
  const product = mockProducts.find((p) => p.id === productId) || null;

  if (!product) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      product,
    },
    // revalidate: 60, // Optional: enable ISR if your data changes frequently
  };
};
