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
      {/* PERBAIKAN 1: Menggunakan text-sidebar-foreground dengan opacity.
          Ini jauh lebih aman daripada blue-200 jika suatu saat tema warna diubah. */}
      <SidebarGroupLabel className="text-sidebar-foreground/60 text-[10px] uppercase tracking-[0.15em] font-bold group-data-[collapsible=icon]:hidden mb-2 px-3">
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
              {/* PERBAIKAN 2: Membersihkan warna kaku.
                  - text-sidebar-foreground: warna teks default sidebar.
                  - hover:bg-sidebar-accent: warna hover otomatis (transparan halus).
                  - data-[active=true]: menggunakan warna aksen sidebar yang solid.
              */}
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                isActive={isActive}
                className="h-10 px-3 transition-all duration-200 rounded-lg gap-3 group text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[active=true]:font-semibold"
              >
                <Link href={item.url}>
                  {/* Icon tetap shrink-0 agar stabil */}
                  <item.icon className="size-4.5 shrink-0 opacity-80 group-data-[active=true]:opacity-100" />

                  <span className="tracking-tight group-data-[collapsible=icon]:hidden truncate text-sm">
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
