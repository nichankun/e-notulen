import { columns } from "./columns";
import { DataTable } from "./data-table";
// 1. Import Dialog Component yang baru
import { CreateUserDialog } from "./create-user-dialog";

// Import Database & Schema
import { db } from "@/db";
import { users } from "@/db/database/schema";
import { desc } from "drizzle-orm";

// Tipe data untuk frontend (Mapping)
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
      email: "-", // Default karena belum ada di DB
      role: user.role === "admin" ? "admin" : "pegawai",
      status: "active", // Default karena belum ada di DB
    };
  });
}

export default async function UsersPage() {
  const data = await getUsers();

  return (
    <div className="container mx-auto py-10 space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Manajemen Pengguna
          </h2>
          <p className="text-slate-500 mt-1">
            Kelola data admin dan pegawai Bapenda di sini.
          </p>
        </div>

        {/* 2. GANTI DISINI: Gunakan Dialog Component */}
        <CreateUserDialog />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1">
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
}
