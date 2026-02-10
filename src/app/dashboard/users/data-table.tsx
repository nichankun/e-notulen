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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react"; // Import ikon search

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div className="space-y-4">
      {/* 1. INPUT PENCARIAN (Dengan Ikon) */}
      <div className="flex items-center py-4 px-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Cari nama pegawai..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* 2. TABEL DATA (Responsive Wrapper) */}
      {/* border-t dan border-b agar rapi di mobile view */}
      <div className="border-t border-slate-100">
        <div className="overflow-x-auto">
          <Table className="min-w-full w-full">
            <TableHeader className="bg-slate-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="border-b border-slate-200 hover:bg-transparent"
                >
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        className="font-semibold text-slate-700 whitespace-nowrap h-12 px-4"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-blue-50/50 transition-colors border-b border-slate-100 last:border-0"
                  >
                    {row.getVisibleCells().map((cell) => (
                      // whitespace-nowrap agar cell tidak wrapping di mobile
                      <TableCell
                        key={cell.id}
                        className="whitespace-nowrap px-4 py-3"
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
                    className="h-24 text-center text-slate-500"
                  >
                    Tidak ada data ditemukan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* 3. TOMBOL PAGINATION */}
      <div className="flex items-center justify-between px-4 py-4 border-t border-slate-100">
        <div className="text-xs text-slate-500 hidden md:block">
          {table.getFilteredRowModel().rows.length} Data ditemukan
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8 text-xs"
          >
            Sebelumnya
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-8 text-xs"
          >
            Berikutnya
          </Button>
        </div>
      </div>
    </div>
  );
}
