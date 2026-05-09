// file: components/dashboard/nav-user.tsx
"use client";

import { useState, useTransition } from "react";
import { ChevronsUpDown, LogOut, KeyRound, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
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
      const res = await fetch("/api/auth/logout", { method: "POST" });
      const result = await res.json();
      if (result.success) {
        startTransition(() => {
          router.push("/");
          router.refresh();
        });
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
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                disabled={isPending}
              >
                <Avatar className="h-8 w-8 rounded-full">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-full bg-sidebar-primary text-sidebar-primary-foreground text-xs font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden ml-1">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-[10px] opacity-60">
                    {user.nip}
                  </span>
                </div>

                <ChevronsUpDown className="ml-auto size-3.5 opacity-40 group-data-[collapsible=icon]:hidden" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-52 rounded-xl"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={8}
            >
              <div className="px-3 py-2 border-b mb-1">
                <p className="text-sm font-semibold text-foreground truncate">
                  {user.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.nip}
                </p>
              </div>

              <DropdownMenuItem
                onClick={() => setIsPasswordOpen(true)}
                className="cursor-pointer"
              >
                <KeyRound className="mr-2 size-4" />
                Ubah Password
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleLogout}
                disabled={isPending}
                className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                {isPending ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <LogOut className="mr-2 size-4" />
                )}
                {isPending ? "Keluar..." : "Keluar"}
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
