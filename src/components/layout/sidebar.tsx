"use client";

import Link from 'next/link';
import { useRouter } from 'next/router';
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
import { Button } from '@/components/ui/button';
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
                <SidebarMenuButton
                  asChild
                  isActive={pathname === category.href}
                  tooltip={category.name}
                >
                  <a>
                    <category.icon />
                    <span>{category.name}</span>
                  </a>
                </SidebarMenuButton>
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
