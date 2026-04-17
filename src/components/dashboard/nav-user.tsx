// file: components/dashboard/nav-user.tsx
"use client";

import { useState, useTransition } from "react";
import { ChevronsUpDown, LogOut, User, KeyRound, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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

interface NavUserProps {
  user: {
    name: string;
    nip: string;
    avatar?: string;
  };
}

export function NavUser({ user }: NavUserProps) {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      const result = await response.json();

      if (result.success) {
        startTransition(() => {
          router.push("/");
          router.refresh();
        });
      }
    } catch (err: unknown) {
      console.error("Logout error:", err);
      toast.error("Gagal logout, periksa koneksi Anda.");
    }
  };

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {/* PERBAIKAN 1: Menggunakan variabel semantik sidebar-accent. 
                  Ini akan otomatis memberikan efek hover yang elegan sesuai warna dasar sidebar Anda. */}
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200 rounded-xl"
                disabled={isPending}
              >
                {/* Avatar Border menggunakan opacity dari foreground agar selalu terlihat pas */}
                <Avatar className="h-8 w-8 rounded-full border border-sidebar-foreground/10 shadow-sm">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  {/* Fallback menggunakan warna primary dari sidebar */}
                  <AvatarFallback className="rounded-full bg-sidebar-primary text-sidebar-primary-foreground font-bold text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden ml-1">
                  <span className="truncate font-semibold tracking-tight">
                    {user.name}
                  </span>
                  <span className="truncate text-[10px] opacity-70 font-medium uppercase tracking-wider">
                    {user.nip}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto size-3.5 opacity-50 group-data-[collapsible=icon]:hidden" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            {/* DROPDOWN CONTENT: Dibersihkan dari warna manual */}
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl p-2 shadow-lg border-border/50"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={12}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-3 px-2 py-2 text-left text-sm">
                  <Avatar className="h-9 w-9 rounded-full border border-border/50">
                    <AvatarFallback className="rounded-full bg-primary/10 text-primary">
                      <User className="size-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-bold text-foreground">
                      {user.name}
                    </span>
                    <span className="truncate text-xs text-muted-foreground font-medium">
                      {user.nip}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator className="my-1.5" />

              <DropdownMenuItem
                onClick={() => setIsPasswordOpen(true)}
                className="cursor-pointer py-2.5 font-medium mb-1 transition-colors"
              >
                <KeyRound className="mr-2 size-4 text-muted-foreground" />
                Ubah Password
              </DropdownMenuItem>

              {/* PERBAIKAN 2: Menggunakan variant destructive semantik untuk Logout */}
              <DropdownMenuItem
                onClick={handleLogout}
                disabled={isPending}
                className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer py-2.5 font-medium transition-colors"
              >
                {isPending ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <LogOut className="mr-2 size-4" />
                )}
                {isPending ? "Keluar..." : "Keluar Aplikasi"}
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
