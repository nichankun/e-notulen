import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { Header } from "@/components/dashboard/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/database/schema";
import { eq } from "drizzle-orm";
import { Toaster } from "@/components/ui/sonner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token")?.value;

  if (!authToken) redirect("/");

  const [currentUser] = await db
    .select({
      name: users.name,
      nip: users.nip,
      role: users.role,
      agency: users.agency,
    })
    .from(users)
    .where(eq(users.id, Number(authToken)))
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
