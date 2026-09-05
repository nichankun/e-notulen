"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Loader2,
} from "lucide-react";
import { type User } from "./columns";
import { UserActions } from "./user-actions";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterKey?: string;
  placeholder?: string;
}

const PAGE_SIZES = [5, 10, 20, 50];

function EmptyState({ colSpan }: { colSpan?: number }) {
  const content = (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
      <Inbox className="h-10 w-10 mb-2 stroke-[1.5px] opacity-50" />
      <p className="text-sm font-medium">Data tidak ditemukan</p>
    </div>
  );
  if (colSpan) {
    return (
      <TableRow>
        <TableCell colSpan={colSpan} className="h-48 text-center">
          {content}
        </TableCell>
      </TableRow>
    );
  }
  return content;
}

function MobileCard({ user }: { user: User }) {
  const isAdmin = user.role === "admin";
  return (
    <div className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-foreground text-sm truncate">
            {user.name}
          </p>
          <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
            {user.nip}
          </p>
        </div>
        <Badge
          variant={isAdmin ? "outline" : "secondary"}
          className={
            isAdmin
              ? "text-primary border-primary/30 bg-primary/10 shrink-0 text-[10px]"
              : "shrink-0 text-[10px]"
          }
        >
          {isAdmin ? "Admin" : "Pegawai"}
        </Badge>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <p className="text-xs text-muted-foreground">
          {user.agency || "Bapenda"}
        </p>
        <UserActions user={user} />
      </div>
    </div>
  );
}

export function DataTable<TData, TValue>({
  columns,
  data,
  filterKey = "name",
  placeholder = "Cari data...",
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [searchValue, setSearchValue] = React.useState("");
  const [isPending, startTransition] = React.useTransition();

  // TanStack Table intentionally returns mutable table APIs that React Compiler cannot memoize.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { sorting, columnFilters },
    initialState: { pagination: { pageSize: 10 } },
  });

  React.useEffect(() => {
    startTransition(() => {
      table.getColumn(filterKey)?.setFilterValue(searchValue);
    });
  }, [searchValue, filterKey, table]);

  const filteredUsers = table
    .getFilteredRowModel()
    .rows.map((r) => r.original as User);

  return (
    <div className="space-y-4 w-full">
      {/* Search */}
      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder={placeholder}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pl-9 pr-9 h-10 bg-background rounded-xl"
        />
        {isPending && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-primary" />
        )}
      </div>

      {/* Mobile */}
      <div className="sm:hidden space-y-3">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((u) => <MobileCard key={u.id} user={u} />)
        ) : (
          <EmptyState />
        )}
      </div>

      {/* Desktop */}
      <div className="hidden sm:block rounded-xl border bg-card overflow-hidden">
        <Table className="min-w-full">
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="hover:bg-transparent">
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="h-12 px-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="px-4 py-3.5 whitespace-nowrap"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <EmptyState colSpan={columns.length} />
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-2 gap-4">
        <p className="text-xs text-muted-foreground font-medium">
          Total {table.getFilteredRowModel().rows.length} pengguna
        </p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <p className="text-xs font-medium text-muted-foreground hidden sm:block">
              Per Halaman
            </p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(v) => table.setPageSize(Number(v))}
            >
              <SelectTrigger className="h-8 w-17.5 bg-background rounded-lg text-xs font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="top" className="rounded-xl">
                {PAGE_SIZES.map((size) => (
                  <SelectItem key={size} value={`${size}`} className="text-xs">
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-muted-foreground hidden md:block">
              Hal. {table.getState().pagination.pageIndex + 1} /{" "}
              {table.getPageCount() || 1}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-8 w-8 rounded-lg"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-8 w-8 rounded-lg"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
