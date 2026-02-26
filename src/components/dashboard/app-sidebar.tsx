"use client";

import * as React from "react";
import {
  LayoutDashboard,
  PlusCircle,
  Archive,
  Layers,
  Users as UsersIcon,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

import { NavMain } from "@/components/dashboard/nav-main";
import { NavUser } from "@/components/dashboard/nav-user";

interface UserData {
  name: string;
  nip: string;
  role: string;
  avatar?: string;
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: UserData;
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  // Memoize menu agar performa tetap ringan meski terjadi re-render di parent
  const navMainItems = React.useMemo(() => {
    const items = [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Buat Agenda Baru",
        url: "/dashboard/create",
        icon: PlusCircle,
      },
      {
        title: "Arsip Notulen",
        url: "/dashboard/archive",
        icon: Archive,
      },
    ];

    if (user.role === "admin") {
      items.push({
        title: "Manajemen User",
        url: "/dashboard/users",
        icon: UsersIcon,
      });
    }
    return items;
  }, [user.role]);

  return (
    <Sidebar
      collapsible="icon"
      {...props}
      // UI BIRU SOLID: Sama persis dengan warna tombol login (#0866ff)
      className="border-r-0 bg-[#0866ff] text-white shadow-xl"
    >
      {/* 1. HEADER: LOGO INSTANSI */}
      <SidebarHeader className="bg-[#0866ff] border-b border-white/20 p-2 overflow-hidden">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              // Hover memakai efek kaca (putih transparan) agar elegan di atas warna biru
              className="hover:bg-white/10 hover:text-white transition-all duration-200"
            >
              {/* KOTAK LOGO: Warnanya dibalik (kotak putih, logo biru) agar terlihat */}
              <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#0866ff] shadow-sm">
                <Layers className="size-4" />
              </div>

              {/* TEKS BRANDING */}
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden overflow-hidden ml-1">
                <span className="truncate font-bold tracking-wide text-white">
                  E-Notulen
                </span>
                <span className="truncate text-[10px] text-blue-200 uppercase tracking-widest font-semibold">
                  Bapenda Sultra
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* 2. CONTENT: MENU NAVIGASI */}
      <SidebarContent className="bg-[#0866ff] scrollbar-none pt-2">
        <NavMain items={navMainItems} />
      </SidebarContent>

      {/* 3. FOOTER: INFORMASI USER */}
      <SidebarFooter className="bg-[#0866ff] border-t border-white/20 p-2">
        <NavUser user={user} />
      </SidebarFooter>

      {/* Interactive Rail (Desktop Only) */}
      <SidebarRail className="hover:after:bg-white/40" />
    </Sidebar>
  );
}
