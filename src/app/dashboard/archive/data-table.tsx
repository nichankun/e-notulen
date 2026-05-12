"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Loader2,
  SlidersHorizontal,
  Eye,
  Clock,
  CheckCircle2,
  FileEdit,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Meeting } from "@/db/database/schema";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterKey?: string;
  placeholder?: string;
}

const columnLabels: Record<string, string> = {
  date: "Tanggal",
  title: "Nama Kegiatan",
  attendanceCount: "Kehadiran",
  status: "Status",
};

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const PAGE_SIZES = [5, 10, 20, 50];

function StatusBadgeMobile({ status }: { status: Meeting["status"] }) {
  if (status === "live")
    return (
      <Badge
        variant="outline"
        className="bg-primary/10 text-primary border-primary/20 gap-1 px-2 text-[10px]"
      >
        <Clock className="h-3 w-3 animate-pulse" /> Live Aktif
      </Badge>
    );
  if (status === "archived")
    return (
      <Badge
        variant="outline"
        className="text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 gap-1 px-2 text-[10px]"
      >
        <CheckCircle2 className="h-3 w-3" /> Selesai
      </Badge>
    );
  return (
    <Badge
      variant="secondary"
      className="text-muted-foreground gap-1 px-2 text-[10px]"
    >
      <FileEdit className="h-3 w-3" /> Draft
    </Badge>
  );
}

function MobileCard({ item }: { item: Meeting }) {
  const destination =
    item.status === "archived"
      ? `/dashboard/result/${item.id}`
      : `/dashboard/live/${item.id}`;

  return (
    <div className="bg-card text-card-foreground border border-border rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium">
          {item.date ? dateFormatter.format(new Date(item.date)) : "-"}
        </span>
        <StatusBadgeMobile status={item.status} />
      </div>
      <p className="text-sm font-bold text-foreground leading-snug">
        {item.title}
      </p>
      <div className="flex items-center justify-between pt-1 border-t border-border">
        <span className="text-xs bg-muted text-muted-foreground font-medium px-2.5 py-1 rounded-full">
          {item.attendanceCount ?? 0} Hadir
        </span>
        <Link
          href={destination}
          className="flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-xl hover:bg-primary/20 transition-colors"
        >
          <Eye className="h-3.5 w-3.5" />
          Lihat
        </Link>
      </div>
    </div>
  );
}

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

export function DataTable<TData, TValue>({
  columns,
  data,
  filterKey = "title",
  placeholder = "Cari data...",
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [searchValue, setSearchValue] = React.useState("");
  const [isPending, startTransition] = React.useTransition();

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: { sorting, columnFilters, columnVisibility },
    initialState: { pagination: { pageSize: 10 } },
  });

  React.useEffect(() => {
    startTransition(() => {
      table.getColumn(filterKey)?.setFilterValue(searchValue);
    });
  }, [searchValue, filterKey, table]);

  const filteredData = table
    .getFilteredRowModel()
    .rows.map((r) => r.original as Meeting);

  return (
    <div className="space-y-4 w-full">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={placeholder}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-9 pr-9 h-10 rounded-xl bg-background"
          />
          {isPending && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-primary h-4 w-4 animate-spin" />
          )}
        </div>
        <div className="hidden sm:block">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-10 rounded-xl flex items-center gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Tampilan Kolom
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl">
              {table
                .getAllColumns()
                .filter((col) => col.getCanHide())
                .map((col) => (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    className="capitalize font-medium text-sm"
                    checked={col.getIsVisible()}
                    onCheckedChange={(v) => col.toggleVisibility(!!v)}
                  >
                    {columnLabels[col.id] || col.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {filteredData.length > 0 ? (
          filteredData.map((item) => <MobileCard key={item.id} item={item} />)
        ) : (
          <EmptyState />
        )}
      </div>

      {/* Desktop table */}
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
          Total {table.getFilteredRowModel().rows.length} data
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
                  <SelectItem
                    key={size}
                    value={`${size}`}
                    className="text-xs font-medium"
                  >
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
