import { mockProducts } from '@/data/mock-data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ProductDetailPageProps {
  params: { id: string };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const product = mockProducts.find((p) => p.id === params.id);

  if (!product) {
    notFound();
  }

  return (
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
  );
}

// Optional: Generate static paths if you have a fixed set of products
// export async function generateStaticParams() {
//   return mockProducts.map((product) => ({
//     id: product.id,
//   }));
// }
