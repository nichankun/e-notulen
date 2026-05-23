import { BrandingSection } from "./branding-section";
import { LoginPanel } from "./login-panel";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Panel Kiri - Branding (Hanya muncul di desktop) */}
      <BrandingSection />
      
      {/* Panel Kanan - Form Login */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-8">
        <LoginPanel />
      </div>
    </div>
  );
}