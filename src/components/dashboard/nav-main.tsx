"use client";

import { type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
}: {
  items: { title: string; url: string; icon: LucideIcon }[];
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      {/* PERUBAHAN UI: Teks label diubah menjadi text-blue-200 agar terbaca elegan di atas background biru pekat */}
      <SidebarGroupLabel className="text-blue-200 text-[10px] uppercase tracking-wider font-semibold group-data-[collapsible=icon]:hidden mb-2 px-3">
        Menu Utama
      </SidebarGroupLabel>

      <SidebarMenu className="gap-1">
        {items.map((item) => {
          const isActive =
            item.url === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.url);

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                isActive={isActive}
                // PERUBAHAN UI: Styling transparan putih untuk hover dan active state
                className="h-11 px-3 text-blue-100 hover:bg-white/10 hover:text-white data-[active=true]:bg-white/20 data-[active=true]:text-white transition-colors rounded-xl gap-3 group"
              >
                <Link href={item.url}>
                  {/* Icon shrink-0 agar tidak miring saat dikompres */}
                  <item.icon className="size-5 shrink-0" />
                  <span className="font-medium group-data-[active=true]:font-bold tracking-tight group-data-[collapsible=icon]:hidden truncate text-[15px]">
                    {item.title}
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
