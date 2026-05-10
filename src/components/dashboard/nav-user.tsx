"use client";

import { useState, useTransition } from "react";
import { ChevronsUpDown, LogOut, KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChangePasswordDialog } from "./change-password-dialog";

// 1. IMPORT TOMBOL TEMA KITA DI SINI
import { ThemeToggle } from "@/components/theme/theme-toggle";

interface NavUserProps {
  user: {
    name: string;
    nip: string;
    avatar?: string;
  };
}

export function NavUser({ user }: NavUserProps) {
  const { isMobile } = useSidebar();
  const [isPending, startTransition] = useTransition();
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      const result = await res.json();

      if (result.success) {
        // Menggunakan hard redirect untuk memastikan Client Cache bersih
        window.location.assign("/");
      } else {
        toast.error("Gagal keluar dari sesi.");
      }
    } catch {
      toast.error("Gagal logout, periksa koneksi Anda.");
    }
  };

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground transition-all duration-200"
                disabled={isPending}
              >
                <Avatar className="h-8 w-8 rounded-full border border-border">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-full bg-primary/10 text-primary text-xs font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden ml-1">
                  <span className="truncate font-semibold text-foreground">
                    {user.name}
                  </span>
                  <span className="truncate text-[10px] text-muted-foreground">
                    {user.nip}
                  </span>
                </div>

                <ChevronsUpDown className="ml-auto size-3.5 text-muted-foreground group-data-[collapsible=icon]:hidden" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl border-border"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={8}
            >
              {/* HEADER DROPDOWN: Info User & Theme Toggle bersebelahan */}
              <div className="px-3 py-2 border-b border-border mb-1 flex items-center justify-between gap-3">
                <div className="flex flex-col min-w-0">
                  <p className="text-sm font-bold text-foreground truncate leading-tight">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate font-medium">
                    {user.nip}
                  </p>
                </div>

                {/* 2. TOMBOL TEMA DITEMPATKAN DI SINI */}
                <div className="shrink-0 bg-muted/50 rounded-full">
                  <ThemeToggle />
                </div>
              </div>

              <DropdownMenuItem
                onSelect={() => setIsPasswordOpen(true)}
                className="cursor-pointer font-medium py-2"
              >
                <KeyRound className="mr-2 size-4 text-muted-foreground" />
                Ubah Password
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-border" />

              <DropdownMenuItem
                disabled={isPending}
                onSelect={(e) => {
                  e.preventDefault();
                  startTransition(() => {
                    handleLogout();
                  });
                }}
                className="cursor-pointer font-medium text-destructive focus:text-destructive focus:bg-destructive/10 py-2"
              >
                {isPending ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <LogOut className="mr-2 size-4" />
                )}
                {isPending ? "Keluar..." : "Keluar dari E-Notulen"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <ChangePasswordDialog
        open={isPasswordOpen}
        onOpenChange={setIsPasswordOpen}
      />
    </>
  );
}
