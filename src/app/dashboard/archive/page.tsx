import { db } from "@/db"; // Sesuaikan path ini
import { meetings } from "@/db/database/schema"; // Sesuaikan path ini
import { desc } from "drizzle-orm";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Trash2, Search, FileText, Database } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Ubah jadi ASYNC component
export default async function ArchivePage() {
  // --- REAL DATA FETCHING START ---
  // Ambil semua data meeting, urutkan dari yang terbaru
  const allMeetings = await db
    .select()
    .from(meetings)
    .orderBy(desc(meetings.date));
  // --- REAL DATA FETCHING END ---

  return (
    <Card className="border-slate-200 shadow-sm animate-in fade-in duration-500">
      <CardHeader className="border-b border-slate-200 px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-slate-800">
              Arsip Digital
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Semua notulen yang tersimpan di database
            </p>
          </div>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Cari tanggal atau judul..."
            className="pl-9 h-10 border-slate-200 focus-visible:ring-blue-200"
          />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-slate-50/50">
              <TableHead className="w-45 font-semibold text-slate-600">
                Tanggal
              </TableHead>
              <TableHead className="font-semibold text-slate-600">
                Nama Kegiatan
              </TableHead>
              <TableHead className="font-semibold text-slate-600">
                Kehadiran
              </TableHead>
              <TableHead className="font-semibold text-slate-600">
                Status
              </TableHead>
              <TableHead className="font-semibold text-slate-600 text-right pr-6">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allMeetings.length === 0 ? (
              // Empty State jika belum ada data
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-slate-500 italic"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Database className="h-8 w-8 text-slate-300" />
                    Belum ada data rapat tersimpan.
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              // Mapping Real Data
              allMeetings.map((item) => (
                <TableRow
                  key={item.id}
                  className="hover:bg-blue-50/50 transition-colors group"
                >
                  <TableCell className="font-medium text-slate-500">
                    {/* Format Tanggal Indonesia */}
                    {new Date(item.date).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="font-bold text-slate-800">
                    {item.title}
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-0">
                      {item.attendanceCount} Hadir
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {/* Badge Status Dinamis */}
                    <Badge
                      variant="outline"
                      className={`
                        ${
                          item.status === "live"
                            ? "border-blue-200 text-blue-700 bg-blue-50"
                            : "border-slate-200 text-slate-600 bg-slate-50"
                        }
                      `}
                    >
                      {item.status === "live" ? "Live Aktif" : "Selesai"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2 pr-6">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-blue-600 hover:bg-blue-100"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-400 hover:bg-red-100 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
