import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { Header } from "@/components/dashboard/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />

      {/* SidebarInset membungkus Header dan Konten agar layout responsif */}
      <SidebarInset className="bg-slate-50 min-h-screen flex flex-col">
        <Header />

        <main className="flex-1 p-4 md:p-8 pt-0 w-full max-w-7xl mx-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
