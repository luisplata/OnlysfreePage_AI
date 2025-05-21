
// This file is no longer actively used for product details.
// The product detail functionality has been moved to /pages/products/detail.tsx
// This file is kept to prevent potential 404s if old links are somehow accessed,
// but it will not render any meaningful content.

import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function LegacyProductPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new detail page structure if an ID is present
    if (router.query.id) {
      router.replace(`/products/detail?id=${router.query.id}`);
    } else {
      // Or redirect to home if no ID (though this page shouldn't be reached without one)
      router.replace('/');
    }
  }, [router]);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <p>Redirecting to the new product page...</p>
    </div>
  );
}

// Minimal getStaticPaths and getStaticProps to satisfy Next.js build requirements for dynamic routes
// when output: 'export' is used, even though this page is now effectively deprecated.
export async function getStaticPaths() {
  return {
    paths: [], // No paths are pre-rendered for this legacy route
    fallback: 'blocking', // or false, 'blocking' might try to render it if hit directly
  };
}

export async function getStaticProps() {
  return {
    props: {},
    // revalidate: 60, // Optional: if fallback: 'blocking' and you want to regenerate
  };
}
