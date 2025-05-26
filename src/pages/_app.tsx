
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useEffect } from 'react';
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
  useEffect(() => {
    // NEXT_BUILD_ID es una variable de entorno que Next.js establece
    // con el resultado de generateBuildId (si está definido) o un hash predeterminado.
    if (process.env.NEXT_PUBLIC_BUILD_ID) {
      console.log(`App Build ID: ${process.env.NEXT_PUBLIC_BUILD_ID}`);
    } else if (process.env.NEXT_BUILD_ID) { // Para acceso en el servidor o durante el build
       console.log(`App Build ID (server/build): ${process.env.NEXT_BUILD_ID}`);
    }
    // Para hacerlo accesible en el cliente si no está prefijado con NEXT_PUBLIC_
    // necesitarías exponerlo a través de publicRuntimeConfig en next.config.js,
    // pero para este ejemplo, asumiremos que puede estar como NEXT_PUBLIC_BUILD_ID
    // o lo verificamos así para propósitos de log.
    // La forma más simple para el log en cliente sin publicRuntimeConfig es si generateBuildId
    // se usara para algo que el cliente pueda ver, ej. una meta tag.
    // Para este log, puede que necesitemos que el buildId sea expuesto via env vars.
    // No obstante, el BUILD_ID es más para uso interno de Next.js y cache de datos.

    // Una forma más sencilla de mostrar "algo" que cambie con el build:
    // Esto asume que pageProps podría tener el buildId si lo inyectáramos de alguna forma,
    // lo cual no es el caso estándar sin getInitialProps o similar.
    // Por ahora, el log directo de process.env.NEXT_BUILD_ID no funcionará en el cliente
    // sin más configuración. Vamos a simplificar y solo imprimir un mensaje.
    console.log("OnlysFree App Loaded. Build Time:", new Date(process.env.NEXT_PUBLIC_BUILD_TIMESTAMP || Date.now()).toISOString());

  }, []);

  return (
    <>
      <Head>
        <title>OnlysFree</title>
        <meta name="description" content="Consigue todos los Packs de tus modelos favoritas gratis!" />
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

// Pequeño ajuste para que el timestamp sea accesible en el cliente
// Esto requiere modificar cómo se pasa el build ID.
// Para simplificar, en `next.config.js` vamos a exponer el `buildId` como una variable de entorno pública.
// Esto se haría normalmente añadiendo `env: { NEXT_PUBLIC_BUILD_ID: new Date().toISOString() }`
// Pero generateBuildId es el método más canónico.
// Si NEXT_BUILD_ID no está disponible como NEXT_PUBLIC_BUILD_ID, el log no mostrará el ID exacto en el cliente.

// La forma correcta de acceder al buildId en el cliente (si lo necesitaras para lógica, no solo logs)
// sería pasarlo a través de pageProps desde _app.getInitialProps o similar,
// o usar una variable de entorno NEXT_PUBLIC_ que configures en next.config.js
// Por ahora, el log en el useEffect será más un indicador general.
// La función `generateBuildId` en `next.config.js` es usada por Next.js internamente.
// Para este ejemplo, he simplificado el log del cliente.
