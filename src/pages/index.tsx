import { ProductCard } from '@/components/product-card';
import { mockProducts } from '@/data/mock-data';
import Head from 'next/head';

export default function HomePage() {
  return (
    <>
      <Head>
        <title>Venta Rapida - Featured Products</title>
        {/* You can add other page-specific meta tags here */}
      </Head>
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-foreground">Featured Products</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {mockProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </>
  );
}
