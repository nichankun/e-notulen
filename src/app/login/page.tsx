"use client";

import { BrandingSection } from "./branding-section";
import { LoginForm } from "./login-form";
import { ForgotPasswordDialog, RequestAccountDialog } from "./auth-dialogs";
import { HelpDropdown } from "./help-dropdown";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4 sm:p-8">
      <div className="max-w-5xl w-full flex flex-col lg:flex-row items-center justify-between gap-10 pb-10 md:pb-0">
        {/* KIRI: Branding Section */}
        <BrandingSection />

        {/* KANAN: Form Section */}
        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-end">
          <div className="w-full max-w-md">
            <div className="bg-card rounded-[2rem] shadow-xl border p-6 sm:p-8">
              <h3 className="text-xl font-bold text-foreground mb-6 text-center lg:text-left">
                Masuk Ke Akun Anda
              </h3>

              <LoginForm />

              <div className="text-center mt-6">
                <ForgotPasswordDialog />
              </div>

              <div className="flex items-center gap-4 my-6">
                <div className="h-px bg-border flex-1"></div>
                <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
                  Atau
                </span>
                <div className="h-px bg-border flex-1"></div>
              </div>

              <div className="flex justify-center pb-2">
                <RequestAccountDialog />
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 flex flex-col items-center gap-3">
              <HelpDropdown />
              <p className="text-xs text-muted-foreground font-medium tracking-wide">
                <span className="font-bold text-foreground">
                  Bapenda Prov. Sultra
                </span>{" "}
                &copy; {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
