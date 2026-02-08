"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import Link from "next/link";
import { DeleteMeetingButton } from "@/components/delete-meeting-button";
import { Meeting } from "@/db/database/schema";

export const columns: ColumnDef<Meeting>[] = [
  {
    accessorKey: "date",
    header: "Tanggal",
    cell: ({ row }) => {
      return new Date(row.getValue("date")).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    },
  },
  {
    accessorKey: "title",
    header: "Nama Kegiatan",
    cell: ({ row }) => (
      <span className="font-bold text-slate-800">{row.getValue("title")}</span>
    ),
  },
  {
    accessorKey: "attendanceCount",
    header: "Kehadiran",
    cell: ({ row }) => (
      <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-0">
        {row.getValue("attendanceCount")} Hadir
      </Badge>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          variant="outline"
          className={
            status === "live"
              ? "border-blue-200 text-blue-700 bg-blue-50"
              : "border-slate-200 text-slate-600 bg-slate-50"
          }
        >
          {status === "live" ? "Live Aktif" : "Selesai"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Aksi</div>,
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="text-right space-x-2">
          <Link
            href={
              item.status === "live"
                ? `/dashboard/live/${item.id}`
                : `/dashboard/result/${item.id}`
            }
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-blue-600 hover:bg-blue-100"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          <DeleteMeetingButton id={item.id} />
        </div>
      );
    },
  },
];
