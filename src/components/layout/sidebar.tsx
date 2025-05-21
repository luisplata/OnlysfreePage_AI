
"use client";

import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { VentaRapidaLogo } from '@/components/icons';
import { saleCategories, mockProducts } from '@/data/mock-data';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

const featuredProductsCount = 3; // Show first 3 products as featured

export function SaleCategorySidebar() {
  const router = useRouter();
  const pathname = router.pathname;

  // Select a few products to feature
  const productsToFeature: Product[] = mockProducts.slice(0, featuredProductsCount);

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

        {productsToFeature.length > 0 && (
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
                        className="h-auto py-2" // Adjust height for potentially taller content if titles wrap
                      >
                        <>
                          <Image
                            src={product.imageUrl}
                            alt={product.title}
                            width={24} // Small image for sidebar
                            height={24}
                            className="rounded-sm object-cover flex-shrink-0"
                            data-ai-hint={`${product.category} thumbnail`}
                          />
                          <span className="truncate leading-snug">{product.title}</span>
                        </>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </>
        )}
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
