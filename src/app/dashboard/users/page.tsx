import { columns, type User } from "./columns";
import { DataTable } from "./data-table";
import { CreateUserDialog } from "./create-user-dialog";

import { db } from "@/db";
import { users } from "@/db/database/schema";
import { desc } from "drizzle-orm";

async function getUsers(): Promise<User[]> {
  const dbData = await db
    .select({
      id: users.id,
      name: users.name,
      nip: users.nip,
      role: users.role,
      agency: users.agency,
    })
    .from(users)
    .orderBy(desc(users.createdAt));

  return dbData.map((user) => ({
    id: user.id,
    name: user.name,
    nip: user.nip,
    role: (user.role as "admin" | "pegawai") ?? "pegawai",
    agency: user.agency,
  }));
}

export default async function UsersPage() {
  const data = await getUsers();

  return (
    <div className="p-4 md:p-0 space-y-8 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex items-end justify-between border-b pb-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
            Admin
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
            Manajemen Pengguna
          </h1>
        </div>

        <div className="pb-0.5">
          <CreateUserDialog />
        </div>
      </div>

      {/* TABEL */}
      <DataTable
        columns={columns}
        data={data}
        filterKey="name"
        placeholder="Cari nama pegawai..."
      />
    </div>
  );
}
