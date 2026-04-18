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
        <button className="text-primary hover:underline text-sm font-bold transition-all">
          Lupa kata sandi?
        </button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-md rounded-2xl p-6 border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Lupa Kata Sandi
          </DialogTitle>
          <DialogDescription>
            Masukkan Nama dan NIP Anda untuk mereset kata sandi via WhatsApp
            Admin.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSend} className="space-y-4 pt-4">
          <Input
            placeholder="Nama Lengkap"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="h-12 rounded-xl"
          />
          <Input
            placeholder="NIP Pegawai"
            value={nip}
            onChange={(e) => setNip(e.target.value)}
            required
            className="h-12 rounded-xl"
          />
          <DialogFooter className="pt-2">
            <Button
              type="submit"
              className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl gap-2"
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
          className="h-14 px-8 font-bold text-[15px] rounded-full transition-colors border-2"
        >
          Buat akun baru
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-md rounded-2xl p-6 border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Minta Pembuatan Akun
          </DialogTitle>
          <DialogDescription>
            Isi data diri Anda di bawah. Pesan otomatis akan disiapkan untuk
            Admin.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSend} className="space-y-4 pt-4">
          <Input
            placeholder="Nama Lengkap"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="h-12 rounded-xl"
          />
          <Input
            placeholder="NIP Pegawai"
            value={nip}
            onChange={(e) => setNip(e.target.value)}
            required
            className="h-12 rounded-xl"
          />
          <Input
            placeholder="Unit Kerja / Bidang"
            value={bidang}
            onChange={(e) => setBidang(e.target.value)}
            required
            className="h-12 rounded-xl"
          />
          <DialogFooter className="pt-2">
            <Button
              type="submit"
              className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl gap-2"
            >
              Kirim via WhatsApp <ArrowRight className="h-4 w-4" />
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
