"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Clock, CheckCircle2, FileEdit } from "lucide-react";
import Link from "next/link";
import { DeleteMeetingButton } from "@/components/delete-meeting-button";
import { Meeting } from "@/db/database/schema";

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export const columns: ColumnDef<Meeting>[] = [
  {
    accessorKey: "date",
    header: "Tanggal",
    cell: ({ row }) => {
      const date = row.getValue("date");
      return (
        <div
          suppressHydrationWarning
          // PERBAIKAN: Gunakan text-muted-foreground agar otomatis support Dark Mode
          className="whitespace-nowrap text-sm text-muted-foreground font-medium"
        >
          {date ? dateFormatter.format(new Date(date as string)) : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "title",
    header: "Nama Kegiatan",
    cell: ({ row }) => (
      <div
        // PERBAIKAN: Menggunakan text-foreground, dan memperbaiki logika truncate responsif
        className="font-bold text-foreground max-w-37.5 md:max-w-75 truncate"
        title={row.getValue("title")}
      >
        {row.getValue("title")}
      </div>
    ),
  },
  {
    accessorKey: "attendanceCount",
    header: "Kehadiran",
    cell: ({ row }) => (
      <div className="whitespace-nowrap">
        {/* PERBAIKAN: Menggunakan variant="secondary" bawaan shadcn agar warnanya soft/kalem */}
        <Badge
          variant="secondary"
          className="px-2.5 py-0.5 rounded-md font-medium"
        >
          {row.getValue("attendanceCount") ?? 0} Hadir
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as Meeting["status"];

      return (
        <div className="whitespace-nowrap flex items-center">
          {status === "live" && (
            // Live: Gunakan warna primary (tema utama Anda) tapi diberi efek transparan agar tidak terlalu mencolok
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary/20 gap-1.5 px-2"
            >
              <Clock className="h-3.5 w-3.5 animate-pulse" /> Live Aktif
            </Badge>
          )}
          {status === "archived" && (
            // Archived: Dianggap selesai/sukses. Kita pakai variant outline biasa tapi dengan warna netral/muted
            <Badge
              variant="outline"
              className="text-muted-foreground gap-1.5 px-2 bg-transparent"
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Selesai
            </Badge>
          )}
          {status === "draft" && (
            // Draft: Belum dimulai. Pakai variant secondary agar terlihat pasif
            <Badge
              variant="secondary"
              className="text-muted-foreground gap-1.5 px-2"
            >
              <FileEdit className="h-3.5 w-3.5" /> Draft
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Aksi</div>,
    cell: ({ row }) => {
      const item = row.original;

      const destination =
        item.status === "archived"
          ? `/dashboard/result/${item.id}`
          : `/dashboard/live/${item.id}`;

      return (
        <div className="flex items-center justify-end gap-2 whitespace-nowrap">
          <Button
            variant="ghost"
            size="icon"
            // PERBAIKAN: Efek hover disesuaikan dengan tema (text-primary)
            className="h-8 w-8 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-lg transition-colors"
            asChild
          >
            <Link href={destination}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>

          <DeleteMeetingButton id={item.id} />
        </div>
      );
    },
  },
];
