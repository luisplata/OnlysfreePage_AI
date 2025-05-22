
"use client";

import Link from 'next/link';
import { useRouter } from 'next/router'; // Corrected for Pages Router

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  // SidebarSeparator, // No longer used as mockProducts are removed
  // SidebarGroup,
  // SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { VentaRapidaLogo } from '@/components/icons';
import { saleCategories } from '@/data/mock-data';
// import type { Product } from '@/types'; // No longer used here
// import Image from 'next/image'; // No longer used here
// import { Button } from '@/components/ui/button'; // No longer used here
import { LogOut } from 'lucide-react';

export function SaleCategorySidebar() {
  const router = useRouter();
  const pathname = router.pathname;

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
                {category.id === 'streamings' ? (
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === category.href}
                    tooltip={category.name}
                    className="h-auto py-4 flex flex-col items-center justify-center text-center group-data-[collapsible=icon]:!size-auto group-data-[collapsible=icon]:p-2" // Custom classes for Streamings card
                  >
                    <>
                      <category.icon className="h-10 w-10 mb-1 group-data-[collapsible=icon]:h-6 group-data-[collapsible=icon]:w-6 group-data-[collapsible=icon]:mb-0" /> {/* Larger icon */}
                      <span className="text-sm font-medium group-data-[collapsible=icon]:hidden">{category.name}</span>
                    </>
                  </SidebarMenuButton>
                ) : (
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === category.href}
                    tooltip={category.name}
                  >
                    <>
                      <category.icon /> {/* Default icon size */}
                      <span>{category.name}</span>
                    </>
                  </SidebarMenuButton>
                )}
              </Link>
            </SidebarMenuItem>
          ))}
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
