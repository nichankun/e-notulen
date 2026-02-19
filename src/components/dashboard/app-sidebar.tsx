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
      className="border-r-slate-800 bg-slate-900 text-slate-300 shadow-xl"
    >
      {/* 1. HEADER: LOGO INSTANSI */}
      <SidebarHeader className="bg-slate-900 border-b border-slate-800/60 p-2 overflow-hidden">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="hover:bg-slate-800 hover:text-white transition-all duration-200"
            >
              {/* FIXED: shrink-0 wajib agar ikon tidak gepeng saat sidebar menutup */}
              <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-500/20">
                <Layers className="size-4" />
              </div>

              {/* Teks Branding: Otomatis hilang lewat data-attribute Shadcn */}
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden overflow-hidden ml-1">
                <span className="truncate font-black tracking-wide text-white uppercase">
                  E-NOTULEN
                </span>
                <span className="truncate text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                  Bapenda Sultra
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* 2. CONTENT: MENU NAVIGASI */}
      <SidebarContent className="bg-slate-900 scrollbar-none pt-2">
        <NavMain items={navMainItems} />
      </SidebarContent>

      {/* 3. FOOTER: INFORMASI USER */}
      <SidebarFooter className="bg-slate-900 border-t border-slate-800/60 p-2">
        <NavUser user={user} />
      </SidebarFooter>

      {/* Interactive Rail (Desktop Only) */}
      <SidebarRail className="hover:after:bg-blue-600/50" />
    </Sidebar>
  );
}
