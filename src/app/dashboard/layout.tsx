import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { Header } from "@/components/dashboard/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/database/schema";
import { eq } from "drizzle-orm";
import { Toaster } from "@/components/ui/sonner";
interface AuthenticatedUser {
  name: string;
  nip: string;
  role: string;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Ambil cookie 'auth_token' (sesuaikan dengan API Login)
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token")?.value;

  // 2. Jika tidak ada token, langsung tendang (Security Layer 2 setelah Middleware)
  if (!authToken) {
    redirect("/");
  }

  // 3. Ambil data user dari DB
  // Kita asumsikan ID di DB adalah integer, jadi kita convert authToken ke Number
  const userResult = await db
    .select({
      name: users.name,
      nip: users.nip,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, Number(authToken)))
    .limit(1);

  const currentUser = userResult[0];

  // 4. Jika user tidak ditemukan (misal ID di cookie sudah tidak valid di DB)
  if (!currentUser) {
    redirect("/");
  }

  const userData: AuthenticatedUser = {
    name: currentUser.name,
    nip: currentUser.nip,
    role: currentUser.role ?? "pegawai",
  };

  return (
    <SidebarProvider>
      <AppSidebar user={userData} />
      <SidebarInset className="bg-slate-50 min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 p-4 md:p-8 pt-0 w-full max-w-7xl mx-auto">
          {children}
        </main>
        <Toaster />
      </SidebarInset>
    </SidebarProvider>
  );
}
