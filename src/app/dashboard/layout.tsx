import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/database/schema";
import { verifyAuthToken } from "@/lib/auth";

import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { Header } from "@/components/dashboard/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
// 1. IMPORT TOOLTIP PROVIDER DI SINI
import { TooltipProvider } from "@/components/ui/tooltip";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token")?.value;

  if (!authToken) redirect("/");

  const payload = await verifyAuthToken(authToken);
  if (!payload?.id) redirect("/");

  const userId = String(payload.id);
  if (!userId || userId === "undefined") redirect("/");

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
    /* 2. BUNGKUS SELURUH PROVIDER DENGAN TOOLTIP PROVIDER */
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar user={userData} />

        <SidebarInset className="flex flex-col min-h-svh bg-background">
          <Header userAgency={userData.agency} />

          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 w-full max-w-7xl mx-auto animate-in fade-in duration-500">
            {children}
          </main>
        </SidebarInset>

        <Toaster position="top-center" richColors />
      </SidebarProvider>
    </TooltipProvider>
  );
}
