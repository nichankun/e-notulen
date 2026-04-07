import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { Header } from "@/components/dashboard/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/database/schema";
import { eq } from "drizzle-orm";
import { Toaster } from "@/components/ui/sonner";
import { verifyAuthToken } from "@/lib/auth"; // Import dari file utility

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token")?.value;

  // Jika tidak ada token, tendang ke login
  if (!authToken) redirect("/");

  // Verifikasi dan ambil payload menggunakan fungsi utility
  const payload = await verifyAuthToken(authToken);
  if (!payload || !payload.id) redirect("/");

  // PERBAIKAN: Gunakan String() karena id sekarang adalah UUID, bukan angka
  const userId = String(payload.id);

  // Validasi tambahan untuk mencegah error jika token rusak/kosong
  if (!userId || userId.trim() === "" || userId === "undefined") {
    redirect("/");
  }

  // Ambil data user dari DB
  const [currentUser] = await db
    .select({
      name: users.name,
      nip: users.nip,
      role: users.role,
      agency: users.agency,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!currentUser) redirect("/");

  const userData = {
    name: currentUser.name,
    nip: currentUser.nip,
    role: currentUser.role ?? "pegawai",
    agency: currentUser.agency ?? "BAPENDA PROV. SULTRA",
  };

  return (
    <SidebarProvider>
      <AppSidebar user={userData} />

      <SidebarInset className="bg-slate-50 h-svh overflow-hidden flex flex-col">
        <Header userAgency={userData.agency} />

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 pt-6 w-full max-w-7xl mx-auto animate-in fade-in duration-700">
          {children}
        </main>

        <Toaster position="top-center" richColors />
      </SidebarInset>
    </SidebarProvider>
  );
}
