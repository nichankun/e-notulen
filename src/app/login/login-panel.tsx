import { LoginForm } from "./login-form";
import { RequestAccountDialog } from "./auth-dialogs";
import { HelpDropdown } from "./help-dropdown";
import { ClipboardList } from "lucide-react";

export function LoginPanel() {
  return (
    <div className="w-full max-w-95 flex flex-col">
      {/* Logo Mobile (Hanya muncul di HP) */}
      <div className="flex lg:hidden items-center gap-3 mb-10">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary text-primary-foreground">
          <ClipboardList className="h-5 w-5" />
        </div>
        <span className="text-sm font-bold tracking-wide text-foreground">
          Bapenda Prov. Sultra
        </span>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight mb-2 text-foreground">
          Masuk ke akun Anda
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Gunakan NIP dan kata sandi yang telah diberikan oleh Admin IT.
        </p>
      </div>

      <LoginForm />

      <div className="mt-8 flex flex-col items-center gap-6">
        <div className="relative w-full">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-3 font-medium text-muted-foreground">
              Belum punya akun?
            </span>
          </div>
        </div>

        <RequestAccountDialog />
      </div>

      <div className="mt-12 flex justify-center">
        <HelpDropdown />
      </div>
    </div>
  );
}