
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Corrected import for App Router
// For Pages Router, you'd use: import { useRouter } from 'next/router'; and then const router = useRouter(); const pathname = router.pathname;

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  // SidebarSeparator, // Commented out as featured products are removed for now
  // SidebarGroup, // Commented out
  // SidebarGroupLabel, // Commented out
} from '@/components/ui/sidebar';
import { VentaRapidaLogo } from '@/components/icons';
import { saleCategories } from '@/data/mock-data'; // Keep saleCategories for now
// import type { Product } from '@/types'; // Commented out as featured products are removed
// import Image from 'next/image'; // Commented out
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

// const featuredProductsCount = 3; // Commented out

export function SaleCategorySidebar() {
  const pathname = usePathname(); // For App Router. If you are truly on Pages Router, this needs to change.
                                  // Assuming you might revert or for future App Router use.
                                  // For Pages Router:
                                  // import { useRouter } from 'next/router';
                                  // const router = useRouter();
                                  // const pathname = router.pathname;


  // Select a few products to feature - This section is removed for now
  // const productsToFeature: Product[] = []; // mockProducts.slice(0, featuredProductsCount);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <VentaRapidaLogo />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {saleCategories.map((category) => (
            <SidebarMenuItem key={category.id}>
              <Link href={category.href} passHref>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === category.href}
                  tooltip={category.name}
                >
                  <>
                    <category.icon />
                    <span>{category.name}</span>
                  </>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        {/* Featured Products Section Removed for API integration focus */}
        {/* {productsToFeature.length > 0 && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Featured Products</SidebarGroupLabel>
              <SidebarMenu>
                {productsToFeature.map((product) => (
                  <SidebarMenuItem key={product.id}>
                    <Link href={`/products/${product.id}`} passHref>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === `/products/${product.id}`}
                        tooltip={product.title}
                        className="h-auto py-3"
                      >
                        <>
                          <Image
                            src={product.imageUrl}
                            alt={product.title}
                            width={36}
                            height={36}
                            className="rounded-md object-cover flex-shrink-0"
                            data-ai-hint={`${product.category} thumbnail`}
                          />
                          <span className="line-clamp-2 leading-snug text-sm"> 
                            {product.title}
                          </span>
                        </>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </>
        )} */}
      </SidebarContent>
      <SidebarFooter className="p-2">
         <SidebarMenuButton tooltip="Logout">
            <LogOut />
            <span>Logout</span>
          </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
