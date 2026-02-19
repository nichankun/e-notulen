"use client";

import { useTransition } from "react";
import { ChevronsUpDown, LogOut, User } from "lucide-react";
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
import { useRouter } from "next/navigation";

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

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      const result = (await response.json()) as { success: boolean };

      if (result.success) {
        startTransition(() => {
          router.push("/");
          router.refresh();
        });
      }
    } catch (err: unknown) {
      console.error("Logout error:", err);
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-slate-900 data-[state=open]:text-white hover:bg-slate-900 hover:text-white rounded-xl transition-all"
              disabled={isPending}
            >
              <Avatar className="h-8 w-8 rounded-lg border border-slate-700">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg bg-slate-800 text-blue-400 font-black">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-bold text-slate-200 tracking-tight">
                  {user.name}
                </span>
                <span className="truncate text-[10px] text-slate-500 font-mono">
                  {user.nip}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-slate-500 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-2xl bg-slate-950 border-slate-800 text-slate-300 p-2 shadow-2xl"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={12}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-3 px-2 py-2 text-left text-sm">
                <Avatar className="h-9 w-9 rounded-xl border border-slate-800">
                  <AvatarFallback className="rounded-xl bg-slate-800 text-blue-400">
                    <User className="size-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-black text-white">
                    {user.name}
                  </span>
                  <span className="truncate text-xs text-slate-500 font-mono">
                    {user.nip}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-800 my-2" />
            <DropdownMenuItem
              onClick={handleLogout}
              disabled={isPending}
              className="text-red-400 cursor-pointer focus:bg-red-500/10 focus:text-red-400 rounded-lg py-2.5 font-bold"
            >
              <LogOut className="mr-2 size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
