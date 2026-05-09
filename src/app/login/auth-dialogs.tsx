"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

const ADMIN_WA = "6281283848569";

export function ForgotPasswordDialog() {
  const [name, setName] = useState("");
  const [nip, setNip] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !nip.trim()) {
      return toast.error("Form tidak lengkap", {
        description: "Harap isi Nama dan NIP Anda.",
      });
    }
    const msg = encodeURIComponent(
      `Halo Admin IT E-Notulen Bapenda Sultra,\n\nSaya lupa password untuk akun E-Notulen saya dan ingin meminta reset password. Berikut data diri saya:\n\n*Nama Lengkap*: ${name}\n*NIP*: ${nip}\n\nMohon dibantu untuk mereset kata sandi saya. Terima kasih.`,
    );
    window.open(`https://wa.me/${ADMIN_WA}?text=${msg}`, "_blank");
    setName("");
    setNip("");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-sm text-primary hover:text-primary/80 transition-colors">
          Lupa kata sandi?
        </button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-sm rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-base font-medium">
            Lupa Kata Sandi
          </DialogTitle>
          <DialogDescription className="text-sm">
            Masukkan Nama dan NIP untuk mereset kata sandi via WhatsApp Admin.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSend} className="space-y-3 pt-3">
          <div>
            <label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground block mb-1.5">
              Nama Lengkap
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-11 rounded-lg"
            />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground block mb-1.5">
              NIP Pegawai
            </label>
            <Input
              value={nip}
              onChange={(e) => setNip(e.target.value)}
              required
              className="h-11 rounded-lg"
            />
          </div>
          <DialogFooter className="pt-2">
            <Button
              type="submit"
              className="w-full h-11 rounded-lg gap-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Hubungi Admin WA <ArrowRight className="h-4 w-4" />
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function RequestAccountDialog() {
  const [name, setName] = useState("");
  const [nip, setNip] = useState("");
  const [bidang, setBidang] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !nip.trim() || !bidang.trim()) {
      return toast.error("Form tidak lengkap", {
        description: "Harap isi semua kolom.",
      });
    }
    const msg = encodeURIComponent(
      `Halo Admin IT E-Notulen Bapenda Sultra,\n\nSaya ingin meminta dibuatkan akun akses untuk sistem E-Notulen. Berikut adalah data diri saya:\n\n*Nama Lengkap*: ${name}\n*NIP*: ${nip}\n*Unit Kerja/Bidang*: ${bidang}\n\nMohon bantuannya. Terima kasih.`,
    );
    window.open(`https://wa.me/${ADMIN_WA}?text=${msg}`, "_blank");
    setName("");
    setNip("");
    setBidang("");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full h-11 rounded-lg text-sm font-medium text-primary border-primary/30 hover:bg-primary/5 hover:text-primary"
        >
          Minta pembuatan akun
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-sm rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-base font-medium">
            Minta Pembuatan Akun
          </DialogTitle>
          <DialogDescription className="text-sm">
            Isi data diri Anda. Pesan otomatis akan disiapkan untuk Admin.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSend} className="space-y-3 pt-3">
          <div>
            <label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground block mb-1.5">
              Nama Lengkap
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-11 rounded-lg"
            />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground block mb-1.5">
              NIP Pegawai
            </label>
            <Input
              value={nip}
              onChange={(e) => setNip(e.target.value)}
              required
              className="h-11 rounded-lg"
            />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground block mb-1.5">
              Unit Kerja / Bidang
            </label>
            <Input
              value={bidang}
              onChange={(e) => setBidang(e.target.value)}
              required
              className="h-11 rounded-lg"
            />
          </div>
          <DialogFooter className="pt-2">
            <Button
              type="submit"
              className="w-full h-11 rounded-lg gap-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Kirim via WhatsApp <ArrowRight className="h-4 w-4" />
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
