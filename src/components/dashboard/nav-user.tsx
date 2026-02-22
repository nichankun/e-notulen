"use client";

import { useState, useTransition } from "react";
import {
  ChevronsUpDown,
  LogOut,
  User,
  KeyRound,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// --- SCHEMA VALIDASI PASSWORD ---
const passwordSchema = z
  .object({
    oldPassword: z.string().min(1, "Password lama wajib diisi"),
    newPassword: z.string().min(6, "Password baru minimal 6 karakter"),
    confirmPassword: z
      .string()
      .min(6, "Konfirmasi password minimal 6 karakter"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

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

  // State untuk mengontrol Dialog Ubah Password
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const { isSubmitting } = form.formState;

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

  const onSubmitPassword = async (data: PasswordFormValues) => {
    try {
      // NOTE: Sesuaikan endpoint ini dengan route API ganti password Anda
      const response = await fetch("/api/users/reset-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success("Password Berhasil Diubah!", {
          description:
            "Silakan gunakan password baru pada sesi login berikutnya.",
        });
        setIsPasswordOpen(false);
        form.reset();
      } else {
        toast.error("Gagal", {
          description: result.message || "Gagal mengubah password.",
        });
      }
    } catch (error: unknown) {
      console.error("Reset Password Error:", error);
      toast.error("Terjadi kesalahan jaringan.");
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

              {/* TOMBOL UBAH PASSWORD */}
              <DropdownMenuItem
                onClick={() => setIsPasswordOpen(true)}
                className="text-slate-300 cursor-pointer focus:bg-slate-800 focus:text-white rounded-lg py-2.5 font-bold mb-1 transition-colors"
              >
                <KeyRound className="mr-2 size-4" />
                Ubah Password
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={handleLogout}
                disabled={isPending}
                className="text-red-400 cursor-pointer focus:bg-red-500/10 focus:text-red-400 rounded-lg py-2.5 font-bold transition-colors"
              >
                <LogOut className="mr-2 size-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      {/* DIALOG UBAH PASSWORD (DI LUAR MENU AGAR TIDAK TERKENA Z-INDEX/FOCUS TRAP) */}
      <Dialog
        open={isPasswordOpen}
        onOpenChange={(open) => {
          setIsPasswordOpen(open);
          if (!open) form.reset();
        }}
      >
        <DialogContent className="sm:max-w-md bg-white rounded-3xl p-6 md:p-8">
          <DialogHeader className="mb-4 text-left">
            <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <KeyRound className="h-6 w-6 text-blue-600" />
            </div>
            <DialogTitle className="text-xl font-black text-slate-800">
              Ubah Password Akun
            </DialogTitle>
            <DialogDescription className="text-slate-500 font-medium">
              Pastikan Anda menggunakan kombinasi karakter yang unik untuk
              menjaga keamanan akun Anda.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmitPassword)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="oldPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Password Saat Ini
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="bg-slate-50 rounded-xl h-11 border-slate-200"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Password Baru
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="bg-slate-50 rounded-xl h-11 border-slate-200"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Konfirmasi Password Baru
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="bg-slate-50 rounded-xl h-11 border-slate-200"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-blue-200 transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      Simpan Password Baru
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
