// file: components/nav-user.tsx
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

// Import Komponen Dialog yang baru kita buat
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
              <SidebarMenuButton
                id="nav-user-trigger"
                suppressHydrationWarning
                size="lg"
                // PERUBAHAN UI: Text putih, hover putih transparan agar cocok dengan background biru pekat
                className="data-[state=open]:bg-white/10 data-[state=open]:text-white hover:bg-white/10 hover:text-white text-white rounded-xl transition-colors"
                disabled={isPending}
              >
                {/* Avatar Border diubah jadi putih transparan */}
                <Avatar className="h-8 w-8 rounded-full border border-white/20 shadow-sm">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  {/* Warna Avatar Fallback: Background putih, teks biru pekat */}
                  <AvatarFallback className="rounded-full bg-white text-[#0866ff] font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-semibold tracking-tight">
                    {user.name}
                  </span>
                  <span className="truncate text-[11px] text-blue-200 font-medium">
                    {user.nip}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto size-4 text-blue-200 group-data-[collapsible=icon]:hidden" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            {/* DROPDOWN MENU TETAP TERANG (LIGHT MODE) */}
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl bg-white border-gray-100 text-gray-700 p-2 shadow-[0_4px_12px_rgba(0,0,0,0.05)] font-sans"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={12}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-3 px-2 py-2 text-left text-sm">
                  <Avatar className="h-9 w-9 rounded-full border border-gray-100">
                    <AvatarFallback className="rounded-full bg-blue-50 text-[#0866ff]">
                      <User className="size-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-bold text-gray-900">
                      {user.name}
                    </span>
                    <span className="truncate text-xs text-gray-500 font-medium">
                      {user.nip}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-100 my-1.5" />

              <DropdownMenuItem
                onClick={() => setIsPasswordOpen(true)}
                className="text-gray-700 cursor-pointer focus:bg-gray-50 focus:text-gray-900 rounded-md py-2.5 font-medium mb-1 transition-colors"
              >
                <KeyRound className="mr-2 size-4 text-gray-500" />
                Ubah Password
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={handleLogout}
                disabled={isPending}
                className="text-red-600 cursor-pointer focus:bg-red-50 focus:text-red-700 rounded-md py-2.5 font-medium transition-colors"
              >
                {isPending ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <LogOut className="mr-2 size-4 text-red-500" />
                )}
                {isPending ? "Keluar..." : "Log out"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      {/* Memanggil komponen dialog terpisah */}
      <ChangePasswordDialog
        open={isPasswordOpen}
        onOpenChange={setIsPasswordOpen}
      />
    </>
  );
}
