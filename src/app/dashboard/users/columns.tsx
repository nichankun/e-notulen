"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { UserActions } from "./user-actions";

export type User = {
  id: string;
  name: string;
  nip: string;
  role: "admin" | "pegawai";
  agency: string | null;
};

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Nama",
    cell: ({ row }) => (
      <div>
        <p className="font-semibold text-foreground text-sm">
          {row.getValue("name")}
        </p>
        <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
          {row.original.nip}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "agency",
    header: "Instansi",
    cell: ({ row }) => (
      <p className="text-sm text-muted-foreground">
        {(row.getValue("agency") as string) || "Bapenda"}
      </p>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const isAdmin = row.getValue("role") === "admin";
      return (
        <Badge
          variant={isAdmin ? "outline" : "secondary"}
          className={
            isAdmin ? "text-primary border-primary/30 bg-primary/10" : ""
          }
        >
          {isAdmin ? "Admin" : "Pegawai"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Aksi</div>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <UserActions user={row.original} />
      </div>
    ),
  },
];
