
"use client";

import Link from 'next/link';
import { useRouter } from 'next/router'; // Corrected for Pages Router
import Image from 'next/image'; // Added for the image card

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { VentaRapidaLogo } from '@/components/icons';
import { saleCategories } from '@/data/mock-data';
import { LogOut } from 'lucide-react';

export function SaleCategorySidebar() {
  const router = useRouter(); // Corrected for Pages Router
  const pathname = router.pathname; // Corrected for Pages Router

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <VentaRapidaLogo />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {saleCategories.map((category) => {
            if (category.id === 'streamings') {
              return (
                <SidebarMenuItem key={category.id}>
                  <Link href={category.href} passHref legacyBehavior>
                    <SidebarMenuButton
                      asChild // Important for Link with custom component
                      isActive={pathname === category.href}
                      tooltip={category.name}
                      className="h-auto p-2 flex flex-col items-center justify-center text-center group-data-[collapsible=icon]:p-1 group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:h-auto focus-visible:ring-inset"
                    >
                      <>
                        <div className="w-full aspect-[16/9] rounded-md overflow-hidden group-data-[collapsible=icon]:w-7 group-data-[collapsible=icon]:h-7 group-data-[collapsible=icon]:aspect-square">
                          <Image
                            src="https://placehold.co/200x112.png"
                            alt={category.name}
                            layout="fill"
                            objectFit="cover"
                            data-ai-hint="streaming entertainment"
                            className="transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <span className="mt-1 text-xs font-medium group-data-[collapsible=icon]:hidden">{category.name}</span>
                      </>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              );
            }
            // Fallback for other categories, if any (currently none)
            // This part is currently not reached as saleCategories only has 'streamings'
            return (
              <SidebarMenuItem key={category.id}>
                <Link href={category.href} passHref legacyBehavior>
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
            );
          })}
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

