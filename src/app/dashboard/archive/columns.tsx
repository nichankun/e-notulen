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

const STATUS_CONFIG = {
  live: {
    label: "Live Aktif",
    icon: Clock,
    className: "bg-primary/10 text-primary border-primary/20 gap-1.5 px-2",
    iconClass: "animate-pulse",
  },
  archived: {
    label: "Selesai",
    icon: CheckCircle2,
    className:
      "text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-400 gap-1.5 px-2",
    iconClass: "",
  },
  draft: {
    label: "Draft",
    icon: FileEdit,
    className: "text-muted-foreground gap-1.5 px-2",
    iconClass: "",
  },
} as const;

function StatusBadge({ status }: { status: Meeting["status"] }) {
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
  if (!config) return null;
  const Icon = config.icon;
  return (
    <Badge variant="outline" className={config.className}>
      <Icon className={`h-3.5 w-3.5 ${config.iconClass}`} />
      {config.label}
    </Badge>
  );
}

export const columns: ColumnDef<Meeting>[] = [
  {
    accessorKey: "date",
    header: "Tanggal",
    cell: ({ row }) => {
      const date = row.getValue("date");
      return (
        <div
          suppressHydrationWarning
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
      <Badge
        variant="secondary"
        className="px-2.5 py-0.5 rounded-md font-medium"
      >
        {row.getValue("attendanceCount") ?? 0} Hadir
      </Badge>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="whitespace-nowrap flex items-center">
        <StatusBadge status={row.getValue("status")} />
      </div>
    ),
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
