import { columns, type User } from "./columns";
import { DataTable } from "./data-table";
import { CreateUserDialog } from "./create-user-dialog";

// Import Database & Schema
import { db } from "@/db";
import { users } from "@/db/database/schema";
import { desc } from "drizzle-orm";

// OPTIMASI: getUsers sekarang lebih ringan karena hanya menarik kolom yang diperlukan (Data Projection)
// Ini mencegah field 'password' yang berat ikut tertarik dari database ke server component.
async function getUsers(): Promise<User[]> {
  const dbData = await db
    .select({
      id: users.id, // Sekarang ini otomatis berupa string (UUID)
      name: users.name,
      nip: users.nip,
      role: users.role,
      agency: users.agency,
    })
    .from(users)
    .orderBy(desc(users.createdAt));

  // Mapping dengan type-safety tanpa 'any'
  return dbData.map((user) => ({
    id: user.id, // Teruskan string UUID apa adanya
    name: user.name,
    nip: user.nip,
    // PERBAIKAN: Type casting yang aman menyesuaikan enum PostgreSQL
    role: (user.role as "admin" | "pegawai") ?? "pegawai",
    agency: user.agency,
  }));
}

export default async function UsersPage() {
  const data = await getUsers();

  return (
    // PERBAIKAN 1: Menghapus 'font-sans' karena sudah dikendalikan secara global oleh tag <body> di layout.tsx
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 p-4 md:p-0">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {/* PERBAIKAN 2: text-gray-900 diubah ke text-foreground */}
          <h2 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
            Manajemen Pengguna
          </h2>
          {/* PERBAIKAN 3: text-gray-500 diubah ke text-muted-foreground */}
          <p className="text-sm text-muted-foreground mt-1 font-medium">
            Kelola data hak akses administrator dan pegawai instansi.
          </p>
        </div>

        {/* Action Section */}
        <div className="w-full md:w-auto shrink-0">
          <CreateUserDialog />
        </div>
      </div>

      {/* TABLE SECTION */}
      {/* Kita tidak perlu lagi membungkus dengan Card di sini karena 
          DataTable yang kita buat sebelumnya sudah memiliki styling 
          rounded-xl, border, dan shadow-sm yang serasi.
      */}
      <DataTable
        columns={columns}
        data={data}
        filterKey="name"
        placeholder="Cari nama pegawai..."
      />
    </div>
  );
}
