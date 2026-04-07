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
          className="whitespace-nowrap text-sm text-slate-500 font-medium"
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
        className="font-bold text-slate-800 min-w-50 md:min-w-0 truncate max-w-75"
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
        <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-0 px-2.5 py-0.5 rounded-md shadow-none font-medium">
          {row.getValue("attendanceCount") ?? 0} Hadir
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      // PERBAIKAN: Gunakan tipe status dari schema untuk type-safety
      const status = row.getValue("status") as Meeting["status"];

      return (
        <div className="whitespace-nowrap">
          {status === "live" && (
            <Badge
              variant="outline"
              className="border-blue-200 text-blue-700 bg-blue-50 shadow-none gap-1 px-2"
            >
              <Clock className="h-3 w-3 animate-pulse" /> Live Aktif
            </Badge>
          )}
          {status === "archived" && (
            <Badge
              variant="outline"
              className="border-emerald-200 text-emerald-700 bg-emerald-50 shadow-none gap-1 px-2"
            >
              <CheckCircle2 className="h-3 w-3" /> Selesai
            </Badge>
          )}
          {status === "draft" && (
            <Badge
              variant="outline"
              className="border-slate-200 text-slate-600 bg-slate-50 shadow-none gap-1 px-2"
            >
              <FileEdit className="h-3 w-3" /> Draft
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

      // LOGIKA LINK: Draft & Live masuk ke halaman Live, Archived masuk ke halaman Result
      const destination =
        item.status === "archived"
          ? `/dashboard/result/${item.id}`
          : `/dashboard/live/${item.id}`;

      return (
        <div className="flex items-center justify-end gap-2 whitespace-nowrap">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors"
            asChild
          >
            <Link href={destination}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>

          {/* UUID (string) otomatis didukung oleh komponen ini */}
          <DeleteMeetingButton id={item.id} />
        </div>
      );
    },
  },
];
