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
import { MobileBottomNav } from "@/components/dashboard/mobile-bottom-nav";

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
    <>
      {/* ── Desktop Sidebar (lg ke atas) ── */}
      {/* Menghapus shadow-xl dan border-r-0 agar menggunakan border bawaan shadcn */}
      <Sidebar collapsible="icon" {...props} className="hidden lg:flex">
        <SidebarHeader className="border-b border-sidebar-border p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200"
              >
                <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
                  <Layers className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden ml-1">
                  <span className="truncate font-bold tracking-tight">
                    E-Notulen
                  </span>
                  <span className="truncate text-[10px] opacity-70 uppercase tracking-widest font-semibold">
                    Bapenda Sultra
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent className="scrollbar-none pt-2">
          <NavMain items={navMainItems} />
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border p-2">
          <NavUser user={user} />
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      {/* ── Mobile Bottom Nav (di bawah lg) ── */}
      {/* PERBAIKAN: role={user.role} diganti menjadi user={user} */}
      <MobileBottomNav user={user} />
    </>
  );
}
