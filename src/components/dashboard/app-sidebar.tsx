"use client";

import * as React from "react";
import {
  LayoutDashboard,
  PlusCircle,
  Archive,
  Power,
  Layers,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarRail,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="bg-slate-900 text-white border-b border-slate-800 h-20 flex justify-center px-6">
        <div className="flex items-center gap-3 w-full">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-600 text-sidebar-primary-foreground">
            <Layers className="size-5 text-white" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-bold text-lg tracking-wide">
              E-NOTULEN
            </span>
            <span className="truncate text-[10px] text-slate-400 uppercase tracking-widest">
              Administrator
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-slate-900 text-slate-300">
        <SidebarGroup>
          <SidebarMenu className="gap-2 px-2 py-4">
            {/* Dashboard Item */}
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="Dashboard"
                isActive={pathname === "/dashboard"}
                className="h-12 data-[active=true]:bg-blue-600 data-[active=true]:text-white data-[active=true]:shadow-lg hover:bg-slate-800 hover:text-white transition-all"
              >
                <Link href="/dashboard">
                  <LayoutDashboard className="size-5!" />
                  <span className="font-medium text-sm ml-1">Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-500 text-[10px] uppercase tracking-wider font-bold px-4 mt-2 mb-1">
            Manajemen Kegiatan
          </SidebarGroupLabel>
          <SidebarMenu className="gap-2 px-2">
            {/* Buat Agenda */}
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="Buat Agenda Baru"
                isActive={pathname === "/dashboard/create"}
                className="h-12 text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
              >
                <Link href="/dashboard/create">
                  <PlusCircle className="size-5! text-green-400" />
                  <span className="font-medium text-sm ml-1">
                    Buat Agenda Baru
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Arsip Notulen */}
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="Arsip Notulen"
                isActive={pathname === "/dashboard/archive"}
                className="h-12 text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
              >
                <Link href="/dashboard/archive">
                  <Archive className="size-5! text-yellow-400" />
                  <span className="font-medium text-sm ml-1">
                    Arsip Notulen
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-slate-900 border-t border-slate-800 p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="h-12 border border-slate-700 text-slate-400 hover:bg-red-900/30 hover:text-red-400 hover:border-red-800 transition-all justify-center"
            >
              <button onClick={() => alert("Keluar?")}>
                <Power className="mr-2 size-4" />
                <span>Keluar</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
