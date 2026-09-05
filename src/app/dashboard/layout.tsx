import { redirect } from "next/navigation";

import { getAuthenticatedUser } from "@/lib/auth";

import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { Header } from "@/components/dashboard/header";
import { MobileBottomNav } from "@/components/dashboard/mobile-bottom-nav";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Layers } from "lucide-react"; // Import ikon agar konsisten dengan AppSidebar

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getAuthenticatedUser();
  if (!currentUser) redirect("/");

  // Data User lengkap untuk dipassing ke Sidebar & Mobile Nav
  const userData = {
    name: currentUser.name,
    nip: currentUser.nip,
    role: currentUser.role,
    agency: currentUser.agency ?? "BAPENDA PROV. SULTRA",
  };

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider>
        {/* ── DESKTOP layout (lg ke atas) ── */}
        <div className="hidden lg:contents">
          <SidebarProvider>
            <AppSidebar user={userData} />
            <SidebarInset className="flex flex-col min-h-svh bg-background">
              <Header userAgency={userData.agency} />
              <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 w-full max-w-7xl mx-auto animate-in fade-in duration-500">
                {children}
              </main>
            </SidebarInset>
          </SidebarProvider>
        </div>

        {/* ── MOBILE layout (di bawah lg) ── */}
        <div className="lg:hidden flex flex-col min-h-svh bg-background">
          {/* Mobile Header (Sesuai dengan standardisasi shadcn) */}
          <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
            {/* Logo & branding */}
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground shadow-sm">
                <Layers className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground leading-none">
                  E-Notulen
                </p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mt-0.5">
                  {userData.agency}
                </p>
              </div>
            </div>
          </header>

          {/* Konten halaman */}
          <main className="flex-1 overflow-y-auto p-4 pb-20 animate-in fade-in duration-500">
            {children}
          </main>

          {/* Mobile Bottom Nav */}
          {/* Perbaikan: Mengirim seluruh objek userData agar nama, NIP, dll terbaca */}
          <MobileBottomNav user={userData} />
        </div>

        <Toaster position="top-center" richColors />
      </TooltipProvider>
    </ThemeProvider>
  );
}
