
import Head from 'next/head';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function DailyDealsPage() {
  return (
    <>
      <Head>
        <title>Daily Deals - OnlysFree</title>
      </Head>
      <div className="container mx-auto py-8">
        <Button variant="outline" asChild className="mb-6">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        <h1 className="text-3xl font-bold mb-8 text-foreground">Daily Deals</h1>
        <div className="text-center py-10">
          <p className="text-xl text-muted-foreground">
            This page is under construction. Check back soon for exciting daily deals!
          </p>
        </div>
      </div>
    </>
  );
}
