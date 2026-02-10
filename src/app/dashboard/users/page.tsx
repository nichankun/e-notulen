import { columns } from "./columns";
import { DataTable } from "./data-table";
import { CreateUserDialog } from "./create-user-dialog";

// Import Database & Schema
import { db } from "@/db";
import { users } from "@/db/database/schema";
import { desc } from "drizzle-orm";

// Tipe data untuk frontend
type UIUser = {
  id: string;
  name: string;
  nip: string;
  email: string;
  role: "admin" | "pegawai";
  status: "active" | "inactive";
};

async function getUsers(): Promise<UIUser[]> {
  const dbData = await db.select().from(users).orderBy(desc(users.createdAt));

  return dbData.map((user) => {
    return {
      id: String(user.id),
      name: user.name,
      nip: user.nip,
      email: "-",
      role: user.role === "admin" ? "admin" : "pegawai",
      status: "active",
    };
  });
}

export default async function UsersPage() {
  const data = await getUsers();

  return (
    // P-4 di mobile agar tidak mepet layar
    <div className="container mx-auto p-4 md:py-10 space-y-6 animate-in fade-in duration-500">
      {/* HEADER: Flex-col (stack) di mobile, Row di desktop */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            Manajemen Pengguna
          </h2>
          <p className="text-sm md:text-base text-slate-500 mt-1">
            Kelola data admin dan pegawai Bapenda di sini.
          </p>
        </div>

        {/* Tombol Dialog: Full width di mobile */}
        <div className="w-full md:w-auto">
          <CreateUserDialog />
        </div>
      </div>

      {/* LANGSUNG DATATABLE (Tanpa Wrapper Card Tambahan) */}
      <DataTable columns={columns} data={data} />
    </div>
  );
}
