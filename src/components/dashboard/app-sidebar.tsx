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

// 1. Definisikan Interface
interface UserData {
  name: string;
  nip: string;
  role: string;
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: UserData;
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  // 2. Data Menu (Dibuat memoize agar tidak re-render user tidak perlu, opsional tapi good practice)
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
      className="border-r-slate-800 bg-slate-900 text-slate-300"
    >
      {/* 3. HEADER LOGO */}
      <SidebarHeader className="bg-slate-900 border-b border-slate-800 pb-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="hover:bg-slate-800 hover:text-white data-[state=open]:bg-slate-800 data-[state=open]:text-white"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-900/20">
                <Layers className="size-4" />
              </div>

              {/* PENTING UNTUK DESKTOP FIX:
                  group-data-[collapsible=icon]:hidden 
                  Ini akan menyembunyikan teks saat sidebar dalam mode 'icon' (collapsed)
              */}
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-bold tracking-wide text-white">
                  E-NOTULEN
                </span>
                <span className="truncate text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                  {user.role === "admin" ? "Administrator" : "Staff Pegawai"}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* 4. KONTEN MENU UTAMA */}
      <SidebarContent className="bg-slate-900 pt-2">
        <NavMain items={navMainItems} />
      </SidebarContent>

      {/* 5. FOOTER USER */}
      <SidebarFooter className="bg-slate-900 border-t border-slate-800 p-2">
        {/* NavUser biasanya sudah handle tampilan collapsed secara internal jika pakai komponen Shadcn standar */}
        <NavUser user={user} />
      </SidebarFooter>

      {/* Rail untuk drag resize (opsional di mobile, berguna di desktop) */}
      <SidebarRail />
    </Sidebar>
  );
}
