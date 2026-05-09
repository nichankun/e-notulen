"use client";

import { BrandingSection } from "./branding-section";
import { LoginForm } from "./login-form";
import { ForgotPasswordDialog, RequestAccountDialog } from "./auth-dialogs";
import { HelpDropdown } from "./help-dropdown";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      <BrandingSection />
      <div className="flex-1 flex items-center justify-center bg-muted/20 px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Portal Masuk
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <h2 className="text-xl font-medium text-foreground mb-1">
            Masuk ke akun Anda
          </h2>
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
            Gunakan NIP dan kata sandi yang telah diberikan oleh Admin IT.
          </p>

          <LoginForm />

          <div className="text-center mt-5">
            <ForgotPasswordDialog />
          </div>

          <div className="flex items-center gap-3 my-6">
            <div className="h-px bg-border flex-1" />
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
              atau
            </span>
            <div className="h-px bg-border flex-1" />
          </div>

          <RequestAccountDialog />

          <div className="flex items-center justify-center gap-4 mt-7">
            <HelpDropdown />
          </div>
        </div>
      </div>
    </div>
  );
}
