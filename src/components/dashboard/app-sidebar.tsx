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

// 1. Definisikan Interface User (Tanpa Any)
interface UserData {
  name: string;
  nip: string;
  role: string; // "admin" atau "pegawai"/"staff"
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: UserData;
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  // 2. Data Menu Dasar (Semua Role Bisa Lihat)
  const navMainItems = [
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

  // 3. Tambahkan Menu Khusus Admin secara Kondisional
  if (user.role === "admin") {
    navMainItems.push({
      title: "Manajemen User",
      url: "/dashboard/users",
      icon: UsersIcon, // Menggunakan icon Users yang lebih relevan
    });
  }

  return (
    <Sidebar
      collapsible="icon"
      {...props}
      className="border-r-slate-800 bg-slate-900 text-slate-300"
    >
      {/* HEADER LOGO */}
      <SidebarHeader className="bg-slate-900 border-b border-slate-800">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-slate-800 hover:text-white"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Layers className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-bold tracking-wide text-white">
                  E-NOTULEN
                </span>
                <span className="truncate text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                  {/* Menampilkan Role secara Dinamis */}
                  {user.role === "admin" ? "Administrator" : "Staff Pegawai"}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* KONTEN MENU UTAMA */}
      <SidebarContent className="bg-slate-900">
        {/* Mengirim items yang sudah difilter */}
        <NavMain items={navMainItems} />
      </SidebarContent>

      {/* FOOTER USER */}
      <SidebarFooter className="bg-slate-900 border-t border-slate-800">
        <NavUser user={user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
