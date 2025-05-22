
"use client";

import Link from 'next/link';
import { useRouter } from 'next/router'; // Corrected for Pages Router
import Image from 'next/image';

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator, // Added for visual separation
} from '@/components/ui/sidebar';
import { VentaRapidaLogo } from '@/components/icons';
import { saleCategories } from '@/data/mock-data'; // For the Streamings card config
import { LogOut } from 'lucide-react';

export function SaleCategorySidebar() {
  const router = useRouter();
  const pathname = router.pathname;

  const streamingsCategory = saleCategories.find(cat => cat.id === 'streamings');

  const publicityImageUrl = "https://test.onlysfree.com/api/publicity/image/game";
  const publicityLinkUrl = "https://test.onlysfree.com/publicity/game";

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
                <Link href={streamingsCategory.href}>
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

        </SidebarMenu>
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
