import type { AppProps } from 'next/app';
import Head from 'next/head';
import { Geist, Geist_Mono } from 'next/font/google';
import '@/app/globals.css'; // Path to globals.css
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { SaleCategorySidebar } from '@/components/layout/sidebar';
import { SearchableTopbar } from '@/components/layout/topbar';
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Venta Rapida</title>
        <meta name="description" content="Quick sales and great deals!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Consider adding a link rel="icon" href="/favicon.ico" if you have one */}
      </Head>
      <div className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SidebarProvider>
          <SaleCategorySidebar />
          <SidebarInset> {/* SidebarInset renders a <main> tag internally */}
            <SearchableTopbar />
            <Component {...pageProps} />
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </div>
    </>
  );
}
