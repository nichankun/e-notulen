"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PlusCircle,
  Archive,
  Users as UsersIcon,
  UserCircle,
  LogOut,
  Loader2,
  KeyRound,
} from "lucide-react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { ChangePasswordDialog } from "./change-password-dialog";

// Interface diubah untuk menerima seluruh objek user
interface MobileBottomNavProps {
  user: {
    name: string;
    nip: string;
    role: string;
    avatar?: string;
  };
}

export function MobileBottomNav({ user }: MobileBottomNavProps) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);

  const items = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      title: "Buat Baru",
      url: "/dashboard/create",
      icon: PlusCircle,
      exact: false,
    },
    {
      title: "Arsip",
      url: "/dashboard/archive",
      icon: Archive,
      exact: false,
    },
    ...(user.role === "admin"
      ? [
          {
            title: "Users",
            url: "/dashboard/users",
            icon: UsersIcon,
            exact: false,
          },
        ]
      : []),
  ];

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      const result = await res.json();
      if (result.success) {
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
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border flex items-stretch h-16 lg:hidden">
        {/* Render Tab Utama */}
        {items.map((item) => {
          const isActive = item.exact
            ? pathname === item.url
            : pathname.startsWith(item.url);

          return (
            <Link
              key={item.title}
              href={item.url}
              className={`
                flex-1 flex flex-col items-center justify-center gap-0.5 relative
                transition-all duration-150 active:scale-95
                ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}
              `}
            >
              {/* Active indicator */}
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full" />
              )}

              <item.icon
                className={`h-5 w-5 transition-transform duration-150 ${isActive ? "scale-110" : "scale-100"}`}
              />
              <span
                className={`text-[10px] font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}
              >
                {item.title}
              </span>
            </Link>
          );
        })}

        {/* Render Tab Ekstra: Menu Profil Khusus Mobile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex-1 flex flex-col items-center justify-center gap-0.5 relative transition-all duration-150 active:scale-95 text-muted-foreground hover:text-foreground outline-none">
              <UserCircle className="h-5 w-5 transition-transform duration-150 scale-100" />
              <span className="text-[10px] font-medium">Profil</span>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            side="top"
            className="w-56 rounded-xl mb-2 border-border"
          >
            {/* Header: Nama User & Tombol Tema */}
            <div className="px-3 py-2 border-b border-border mb-1 flex items-center justify-between gap-3">
              <div className="flex flex-col min-w-0">
                <p className="text-sm font-bold text-foreground truncate leading-tight">
                  {user.name}
                </p>
                <p className="text-[10px] text-muted-foreground truncate font-medium">
                  {user.nip}
                </p>
              </div>
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
              {isPending ? "Keluar..." : "Keluar E-Notulen"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>

      {/* Dialog Ganti Password untuk Mobile */}
      <ChangePasswordDialog
        open={isPasswordOpen}
        onOpenChange={setIsPasswordOpen}
      />
    </>
  );
}
