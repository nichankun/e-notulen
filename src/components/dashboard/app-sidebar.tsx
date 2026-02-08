"use client";

import * as React from "react";
import { LayoutDashboard, PlusCircle, Archive, Layers } from "lucide-react";

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

// 1. Konfigurasi Data Menu (Agar rapi & terpusat)
const data = {
  user: {
    name: "Admin IT",
    email: "admin@bapenda.go.id",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
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
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
                <span className="truncate text-xs text-slate-400 uppercase tracking-widest">
                  Administrator
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* KONTEN MENU UTAMA */}
      <SidebarContent className="bg-slate-900">
        {/* Panggil Component NavMain */}
        <NavMain items={data.navMain} />
      </SidebarContent>

      {/* FOOTER USER */}
      <SidebarFooter className="bg-slate-900 border-t border-slate-800">
        {/* Panggil Component NavUser */}
        <NavUser user={data.user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
