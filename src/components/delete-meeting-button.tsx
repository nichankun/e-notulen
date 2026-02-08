"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function DeleteMeetingButton({ id }: { id: number }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Apakah Anda yakin ingin menghapus arsip ini permanen?"))
      return;

    setLoading(true);
    try {
      // HIT API DELETE
      const res = await fetch(`/api/meetings/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.refresh(); // Refresh halaman arsip
      } else {
        alert("Gagal menghapus data");
      }
    } catch (error) {
      console.error(error);
      alert("Error jaringan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-red-400 hover:bg-red-100 hover:text-red-600"
      onClick={handleDelete}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </Button>
  );
}
