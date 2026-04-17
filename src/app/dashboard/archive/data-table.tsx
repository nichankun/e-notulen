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
} from "lucide-react";

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
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    initialState: {
      pagination: { pageSize: 10 },
    },
  });

  React.useEffect(() => {
    startTransition(() => {
      table.getColumn(filterKey)?.setFilterValue(searchValue);
    });
  }, [searchValue, filterKey, table]);

  return (
    <div className="space-y-4 w-full animate-in fade-in duration-500">
      {/* BAGIAN ATAS: Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-sm">
          {/* Ikon menggunakan text-muted-foreground */}
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />

          {/* Input dibersihkan. Biarkan shadcn yang mengurus ring dan border */}
          <Input
            placeholder={placeholder}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-9 pr-9 h-10 rounded-xl bg-background transition-all"
          />
          {isPending && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-primary h-4 w-4 animate-spin" />
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-10 w-full sm:w-auto rounded-xl ml-auto flex items-center gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Tampilan Kolom
            </Button>
          </DropdownMenuTrigger>
          {/* w-50 diubah jadi w-[200px] karena w-50 tidak valid di Tailwind default */}
          <DropdownMenuContent align="end" className="w-50 rounded-xl">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize font-medium text-sm"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {columnLabels[column.id] || column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* BAGIAN TABEL */}
      {/* Menggunakan bg-card dan border standar */}
      <div className="rounded-xl border bg-card text-card-foreground overflow-hidden shadow-sm">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-muted">
          <Table className="min-w-full">
            <TableHeader className="bg-muted/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
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
                  // Menghapus hover kustom karena TableRow bawaan shadcn sudah memilikinya!
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
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-48 text-center"
                  >
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Inbox className="h-10 w-10 mb-2 stroke-[1.5px] opacity-50" />
                      <p className="text-sm font-medium">
                        Data tidak ditemukan
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* BAGIAN PAGINASI */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-2 gap-4">
        <div className="text-xs text-muted-foreground font-medium whitespace-nowrap">
          Menampilkan total {table.getFilteredRowModel().rows.length} entitas
          data.
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center space-x-2">
            <p className="text-xs font-medium text-muted-foreground hidden sm:block">
              Per Halaman
            </p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              {/* w-17.5 diganti menjadi w-[70px] */}
              <SelectTrigger className="h-8 w-17.5 bg-background rounded-lg text-xs font-bold">
                <SelectValue
                  placeholder={`${table.getState().pagination.pageSize}`}
                />
              </SelectTrigger>
              <SelectContent side="top" className="rounded-xl">
                {[5, 10, 20, 50].map((pageSize) => (
                  <SelectItem
                    key={pageSize}
                    value={`${pageSize}`}
                    className="text-xs font-medium"
                  >
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <div className="text-[11px] font-bold text-muted-foreground uppercase mr-2 hidden md:block">
              Hal. {table.getState().pagination.pageIndex + 1} /{" "}
              {table.getPageCount() || 1}
            </div>
            {/* Class dihapus sebagian, mengandalkan variant="outline" bawaan shadcn */}
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
