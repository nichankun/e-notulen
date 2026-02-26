"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
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
      return (
        // 🔥 TAMBAHKAN suppressHydrationWarning DI SINI
        <div
          suppressHydrationWarning
          className="whitespace-nowrap text-sm text-slate-500 font-medium"
        >
          {dateFormatter.format(new Date(row.getValue("date")))}
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
        <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-0 px-2.5 py-0.5 rounded-md shadow-none">
          {row.getValue("attendanceCount")} Hadir
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <div className="whitespace-nowrap">
          <Badge
            variant="outline"
            className={
              status === "live"
                ? "border-blue-200 text-blue-700 bg-blue-50 shadow-none"
                : "border-slate-200 text-slate-600 bg-slate-50 shadow-none"
            }
          >
            {status === "live" ? "Live Aktif" : "Selesai"}
          </Badge>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Aksi</div>,
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex items-center justify-end gap-2 whitespace-nowrap">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors"
            asChild
          >
            <Link
              href={
                item.status === "live"
                  ? `/dashboard/live/${item.id}`
                  : `/dashboard/result/${item.id}`
              }
            >
              <Eye className="h-4 w-4" />
            </Link>
          </Button>

          <DeleteMeetingButton id={item.id} />
        </div>
      );
    },
  },
];
