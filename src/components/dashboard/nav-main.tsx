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
      <SidebarGroupLabel className="text-slate-600 text-[10px] uppercase tracking-[0.2em] font-black group-data-[collapsible=icon]:hidden mb-2 px-3">
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
                className="h-11 px-3 text-slate-400 hover:bg-slate-900 hover:text-white data-[active=true]:bg-blue-600 data-[active=true]:text-white transition-all rounded-xl gap-3"
              >
                <Link href={item.url}>
                  {/* Icon shrink-0 agar tidak miring saat dikompres */}
                  <item.icon className="size-5 shrink-0" />
                  <span className="font-bold tracking-tight group-data-[collapsible=icon]:hidden truncate">
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
