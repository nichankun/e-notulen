import { columns } from "./columns";
import { DataTable } from "./data-table";
import { CreateUserDialog } from "./create-user-dialog";

// Import Database & Schema
import { db } from "@/db";
import { users } from "@/db/database/schema";
import { desc } from "drizzle-orm";

// 1. UPDATE TIPE DATA (Sesuaikan dengan columns.tsx yang baru)
type UIUser = {
  id: number;
  name: string;
  nip: string;
  role: string;
  agency: string | null;
};

async function getUsers(): Promise<UIUser[]> {
  const dbData = await db.select().from(users).orderBy(desc(users.createdAt));

  return dbData.map((user) => {
    return {
      id: user.id,
      name: user.name,
      nip: user.nip,
      role: user.role || "pegawai",

      // 2. MAPPING FIELD AGENCY

      agency: user.agency,
    };
  });
}

export default async function UsersPage() {
  const data = await getUsers();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 p-4 md:p-0">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            Manajemen Pengguna
          </h2>
          <p className="text-sm md:text-base text-slate-500 mt-1">
            Kelola data admin dan pegawai instansi di sini.
          </p>
        </div>

        {/* Tombol Dialog */}
        <div className="w-full md:w-auto">
          <CreateUserDialog />
        </div>
      </div>

      {/* DATATABLE */}
      <DataTable columns={columns} data={data} />
    </div>
  );
}
