
import Head from 'next/head';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function FlashSalesPage() {
  return (
    <>
      <Head>
        <title>Flash Sales - Venta Rapida</title>
      </Head>
      <div className="container mx-auto py-8">
        <Button variant="outline" asChild className="mb-6">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        <h1 className="text-3xl font-bold mb-8 text-foreground">Flash Sales</h1>
        <div className="text-center py-10">
          <p className="text-xl text-muted-foreground">
            This page is under construction. Get ready for amazing flash sales!
          </p>
        </div>
      </div>
    </>
  );
}
