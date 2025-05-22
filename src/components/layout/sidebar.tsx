
"use client";

import Link from 'next/link';
import { useRouter } from 'next/router'; // Corrected import for Pages Router
import Image from 'next/image';
import * as React from 'react';

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
import { ScrollArea } from '@/components/ui/scroll-area';
import { VentaRapidaLogo } from '@/components/icons';
import { saleCategories } from '@/data/mock-data';
import { Loader2, Tag as TagIcon } from 'lucide-react';
import type { Product, ApiHotItem, ApiHotListResponse, ApiTagsResponse, Tag, ApiPpvItem, ApiPack } from '@/types';
import { Badge } from '@/components/ui/badge';


// Helper function to transform API Hot/Popular item data to Product type
function transformApiHotItemToProduct(apiHotItem: ApiHotItem): Product {
  const description = apiHotItem.tags || 'No description available.';
  const category = apiHotItem.tags ? apiHotItem.tags.split('-')[0].trim().toLowerCase() || 'general' : 'general';

  return {
    id: String(apiHotItem.producto_id || apiHotItem.id), // Prefer producto_id if available for linking
    title: apiHotItem.nombre,
    description: description,
    imageUrl: apiHotItem.imagen,
    category: category,
    productType: apiHotItem.isVideo === "1" || (apiHotItem.url_video && apiHotItem.url_video !== "") ? 'streaming' : 'standard',
    videoUrl: apiHotItem.url_video || undefined,
    hotLink: apiHotItem.hotLink,
  };
}

function transformApiTagsResponseToArray(apiTags: ApiTagsResponse): Tag[] {
  return Object.entries(apiTags)
    .map(([id, name]) => ({ id, name }))
    .filter(tag => tag.name && tag.name.trim() !== "") // Filter out tags with empty names
    .sort((a, b) => a.name.localeCompare(b.name)); // Sort tags alphabetically
}

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]]; // swap elements
  }
  return newArray;
}


export function SaleCategorySidebar() {
  const router = useRouter();
  const pathname = router.pathname;

  const streamingsCategory = saleCategories.find(cat => cat.id === 'streamings');

  const publicityImageUrl = "https://test.onlysfree.com/api/publicity/image/game";
  const publicityLinkUrl = "https://test.onlysfree.com/publicity/game";

  const [hotOffers, setHotOffers] = React.useState<Product[]>([]);
  const [loadingHotOffers, setLoadingHotOffers] = React.useState(true);
  const [errorHotOffers, setErrorHotOffers] = React.useState<string | null>(null);

  const [popularOffers, setPopularOffers] = React.useState<Product[]>([]);
  const [loadingPopularOffers, setLoadingPopularOffers] = React.useState(true);
  const [errorPopularOffers, setErrorPopularOffers] = React.useState<string | null>(null);

  const [tags, setTags] = React.useState<Tag[]>([]);
  const [loadingTags, setLoadingTags] = React.useState(true);
  const [errorTags, setErrorTags] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchHotOffers() {
      setLoadingHotOffers(true);
      setErrorHotOffers(null);
      const isDevelopment = process.env.NODE_ENV === 'development';
      const baseUrl = isDevelopment ? '/api-proxy' : 'https://test.onlysfree.com/api';
      const apiUrl = `${baseUrl}/hot`;

      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        const data: ApiHotListResponse = await response.json();
        if (Array.isArray(data)) {
          setHotOffers(data.map(transformApiHotItemToProduct));
        } else {
          throw new Error('API response for hot offers did not contain an array.');
        }
      } catch (e: any) {
        console.error("Failed to fetch hot offers:", e);
        let errorMessage = e.message || 'Failed to load hot offers.';
        if (e.message && e.message.includes('Failed to fetch')) {
          errorMessage = `Hot Offers: Network error. Details: ${e.message}`;
        }
        setErrorHotOffers(errorMessage);
      } finally {
        setLoadingHotOffers(false);
      }
    }
    fetchHotOffers();
  }, []);

  React.useEffect(() => {
    async function fetchPopularOffers() {
      setLoadingPopularOffers(true);
      setErrorPopularOffers(null);
      const isDevelopment = process.env.NODE_ENV === 'development';
      const baseUrl = isDevelopment ? '/api-proxy' : 'https://test.onlysfree.com/api';
      const apiUrl = `${baseUrl}/popular`;

      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        const data: ApiHotListResponse = await response.json();
        if (Array.isArray(data)) {
          setPopularOffers(data.map(transformApiHotItemToProduct));
        } else {
          throw new Error('API response for popular offers did not contain an array.');
        }
      } catch (e: any) {
        console.error("Failed to fetch popular offers:", e);
        let errorMessage = e.message || 'Failed to load popular offers.';
        if (e.message && e.message.includes('Failed to fetch')) {
          errorMessage = `Popular Offers: Network error. Details: ${e.message}`;
        }
        setErrorPopularOffers(errorMessage);
      } finally {
        setLoadingPopularOffers(false);
      }
    }
    fetchPopularOffers();
  }, []);

  React.useEffect(() => {
    async function fetchTags() {
      setLoadingTags(true);
      setErrorTags(null);
      const isDevelopment = process.env.NODE_ENV === 'development';
      const baseUrl = isDevelopment ? '/api-proxy' : 'https://test.onlysfree.com/api';
      const apiUrl = `${baseUrl}/tags`;

      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        const data: ApiTagsResponse = await response.json();
        const allTags = transformApiTagsResponseToArray(data);
        const shuffledTags = shuffleArray(allTags);
        setTags(shuffledTags.slice(0, 10)); // Get first 10 random tags
      } catch (e: any) {
        console.error("Failed to fetch tags:", e);
        let errorMessage = e.message || 'Failed to load tags.';
        if (e.message && e.message.includes('Failed to fetch')) {
            errorMessage = `Tags: Network error. Details: ${e.message}`;
        }
        setErrorTags(errorMessage);
      } finally {
        setLoadingTags(false);
      }
    }
    fetchTags();
  }, []);


  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <VentaRapidaLogo />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {streamingsCategory && (
            <SidebarMenuItem>
               <SidebarMenuButton
                asChild
                isActive={pathname === streamingsCategory.href}
                tooltip={streamingsCategory.name}
                className="h-auto p-2 flex flex-col items-center justify-center text-center group-data-[collapsible=icon]:p-1 group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:h-auto focus-visible:ring-inset"
              >
                <Link href={streamingsCategory.href || '/'}>
                  <div className="w-full aspect-[16/9] rounded-md overflow-hidden group-data-[collapsible=icon]:w-7 group-data-[collapsible=icon]:h-7 group-data-[collapsible=icon]:aspect-square relative">
                    <Image
                      src="https://placehold.co/200x112.png"
                      alt={streamingsCategory.name}
                      fill={true}
                      sizes="(max-width: 256px) 100vw, 200px"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      data-ai-hint="streaming entertainment"
                    />
                  </div>
                  <span className="mt-1 text-xs font-medium group-data-[collapsible=icon]:hidden">{streamingsCategory.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          {/* Publicity Card */}
          <SidebarMenuItem className="mt-2">
            <SidebarMenuButton
              asChild
              tooltip="Publicity"
              className="h-auto p-2 flex flex-col items-center justify-center text-center group-data-[collapsible=icon]:p-1 group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:h-auto focus-visible:ring-inset"
            >
              <a href={publicityLinkUrl} target="_blank" rel="noopener noreferrer">
                <div className="w-full aspect-[16/9] rounded-md overflow-hidden group-data-[collapsible=icon]:w-7 group-data-[collapsible=icon]:h-7 group-data-[collapsible=icon]:aspect-square relative">
                  <Image
                    src={publicityImageUrl}
                    alt="Publicity"
                    fill={true}
                    sizes="(max-width: 256px) 100vw, 200px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint="advertisement banner"
                     onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/200x112.png?text=Ad+Error';
                        (e.target as HTMLImageElement).srcset = '';
                      }}
                  />
                </div>
                <span className="mt-1 text-xs font-medium group-data-[collapsible=icon]:hidden">Publicidad</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarSeparator className="my-3" />

          {/* Hot Offers Section */}
          <SidebarGroup>
            <SidebarGroupLabel className="mb-1 px-2 text-sidebar-foreground/90 group-data-[collapsible=icon]:sr-only">Hot Offers</SidebarGroupLabel>
            <SidebarMenu>
              {loadingHotOffers && (
                <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-sidebar-foreground/70 group-data-[collapsible=expanded]:ml-2" />
                   <span className="ml-2 text-xs text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">Loading offers...</span>
                </SidebarMenuItem>
              )}
              {errorHotOffers && !loadingHotOffers && (
                 <SidebarMenuItem className="px-2 text-xs text-destructive group-data-[collapsible=icon]:hidden">
                   {errorHotOffers}
                 </SidebarMenuItem>
              )}
              {!loadingHotOffers && !errorHotOffers && hotOffers.length === 0 && (
                <SidebarMenuItem className="px-2 text-xs text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
                  No hot offers available.
                </SidebarMenuItem>
              )}
              {!loadingHotOffers && !errorHotOffers && hotOffers.map((product) => {
                const detailPageUrl = `/products/detail?id=${product.id}${product.productType === 'streaming' ? '&type=streaming' : ''}`;
                return (
                  <SidebarMenuItem key={`hot-${product.id}`}>
                    <SidebarMenuButton
                      asChild
                      tooltip={{
                        content: product.title,
                        className: "max-w-[200px] text-center",
                      }}
                      className="h-auto py-1.5 px-2 text-left group-data-[collapsible=icon]:p-1.5 group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:h-auto focus-visible:ring-inset"
                    >
                      <Link href={detailPageUrl} className="flex items-center gap-2 w-full">
                        <div className="w-8 h-8 rounded-sm overflow-hidden relative shrink-0 group-data-[collapsible=icon]:w-6 group-data-[collapsible=icon]:h-6">
                          <Image
                            src={product.imageUrl || 'https://placehold.co/40x40.png'}
                            alt={product.title}
                            fill={true}
                            sizes="40px"
                            className="object-cover"
                            data-ai-hint="product offer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://placehold.co/40x40.png?text=Error';
                              (e.target as HTMLImageElement).srcset = '';
                            }}
                          />
                        </div>
                        <span className="text-xs font-medium line-clamp-2 leading-tight group-data-[collapsible=icon]:hidden">
                          {product.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>

          <SidebarSeparator className="my-3" />

           {/* Popular Offers Section */}
          <SidebarGroup>
            <SidebarGroupLabel className="mb-1 px-2 text-sidebar-foreground/90 group-data-[collapsible=icon]:sr-only">Popular Offers</SidebarGroupLabel>
            <SidebarMenu>
              {loadingPopularOffers && (
                <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-sidebar-foreground/70 group-data-[collapsible=expanded]:ml-2" />
                   <span className="ml-2 text-xs text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">Loading offers...</span>
                </SidebarMenuItem>
              )}
              {errorPopularOffers && !loadingPopularOffers && (
                 <SidebarMenuItem className="px-2 text-xs text-destructive group-data-[collapsible=icon]:hidden">
                   {errorPopularOffers}
                 </SidebarMenuItem>
              )}
              {!loadingPopularOffers && !errorPopularOffers && popularOffers.length === 0 && (
                <SidebarMenuItem className="px-2 text-xs text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
                  No popular offers available.
                </SidebarMenuItem>
              )}
              {!loadingPopularOffers && !errorPopularOffers && popularOffers.map((product) => {
                const detailPageUrl = `/products/detail?id=${product.id}${product.productType === 'streaming' ? '&type=streaming' : ''}`;
                return (
                  <SidebarMenuItem key={`popular-${product.id}`}>
                    <SidebarMenuButton
                      asChild
                      tooltip={{
                        content: product.title,
                        className: "max-w-[200px] text-center",
                      }}
                      className="h-auto py-1.5 px-2 text-left group-data-[collapsible=icon]:p-1.5 group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:h-auto focus-visible:ring-inset"
                    >
                      <Link href={detailPageUrl} className="flex items-center gap-2 w-full">
                        <div className="w-8 h-8 rounded-sm overflow-hidden relative shrink-0 group-data-[collapsible=icon]:w-6 group-data-[collapsible=icon]:h-6">
                          <Image
                            src={product.imageUrl || 'https://placehold.co/40x40.png'}
                            alt={product.title}
                            fill={true}
                            sizes="40px"
                            className="object-cover"
                            data-ai-hint="popular product"
                            onError={(e) => {
                              if (product.imageUrl && product.imageUrl.endsWith('.mp4')) {
                                (e.target as HTMLImageElement).src = 'https://placehold.co/40x40.png?text=Video';
                              } else {
                                (e.target as HTMLImageElement).src = 'https://placehold.co/40x40.png?text=Error';
                              }
                              (e.target as HTMLImageElement).srcset = '';
                            }}
                          />
                        </div>
                        <span className="text-xs font-medium line-clamp-2 leading-tight group-data-[collapsible=icon]:hidden">
                          {product.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>

          <SidebarSeparator className="my-3" />

          {/* Tags Section */}
          <SidebarGroup>
            <SidebarGroupLabel className="mb-1 px-2 text-sidebar-foreground/90 group-data-[collapsible=icon]:sr-only">Tags</SidebarGroupLabel>
            <ScrollArea className="h-[200px] group-data-[collapsible=icon]:hidden">
               <div className="flex flex-wrap p-1 group-data-[collapsible=icon]:hidden">
                {loadingTags && (
                  <div className="w-full flex items-center justify-center p-2">
                    <Loader2 className="h-5 w-5 animate-spin text-sidebar-foreground/70" />
                    <span className="ml-2 text-xs text-sidebar-foreground/70">Loading tags...</span>
                  </div>
                )}
                {errorTags && !loadingTags && (
                  <p className="px-2 text-xs text-destructive w-full">{errorTags}</p>
                )}
                {!loadingTags && !errorTags && tags.length === 0 && (
                  <p className="px-2 text-xs text-sidebar-foreground/70 w-full">No tags available.</p>
                )}
                {!loadingTags && !errorTags && tags.map((tag) => (
                  <Badge
                    key={`tag-${tag.id}`}
                    variant="secondary"
                    className="m-1 cursor-pointer hover:bg-accent hover:text-accent-foreground"
                    onClick={() => { /* Future: handle tag click, e.g., filter products by tag */ }}
                    title={tag.name}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </ScrollArea>
          </SidebarGroup>

        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
         {/* Footer can be empty or used for other elements later */}
      </SidebarFooter>
    </Sidebar>
  );
}
