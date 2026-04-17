// file: components/change-password-dialog.tsx
"use client";

import { Loader2, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

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
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: "Password baru tidak boleh sama dengan password lama",
    path: ["newPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangePasswordDialog({
  open,
  onOpenChange,
}: ChangePasswordDialogProps) {
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const { isSubmitting } = form.formState;

  const onSubmitPassword = async (data: PasswordFormValues) => {
    try {
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
        onOpenChange(false);
        form.reset();
      } else {
        toast.error("Gagal Merubah Password", {
          description: result.message || "Pastikan password lama Anda benar.",
        });
      }
    } catch (error: unknown) {
      console.error("Reset Password Error:", error);
      toast.error("Terjadi kesalahan jaringan.");
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      form.reset();
      form.clearErrors();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {/* PERBAIKAN 1: Menghapus bg-white dan font-sans. 
          Menggunakan rounded-2xl untuk kesan modern. */}
      <DialogContent className="sm:max-w-md rounded-2xl p-6 md:p-8">
        <DialogHeader className="mb-4 text-left">
          <DialogTitle className="text-xl font-bold tracking-tight">
            Ubah Password Akun
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium">
            Pastikan Anda menggunakan kombinasi karakter yang unik untuk menjaga
            keamanan akun.
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
                  <FormLabel className="text-sm font-semibold text-foreground">
                    Password Saat Ini
                  </FormLabel>
                  <FormControl>
                    {/* PERBAIKAN 3: Input dibersihkan dari border kaku, biarkan shadcn yang mengurus focus-ring-nya. */}
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="h-12 bg-background rounded-xl"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-foreground">
                    Password Baru
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="h-12 bg-background rounded-xl"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-foreground">
                    Konfirmasi Password Baru
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="h-12 bg-background rounded-xl"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              {/* PERBAIKAN 4: Tombol submit mengikuti standar variant primary aplikasi. 
                  Menghapus hex warna manual. */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full font-bold h-12 rounded-xl transition-all shadow-md"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Simpan Password Baru
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
