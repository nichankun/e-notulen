import { LoginForm } from "./login-form";
import { ForgotPasswordDialog, RequestAccountDialog } from "./auth-dialogs";

export function LoginPanel() {
  return (
    <div className="login-form-panel w-65 xl:w-72.5 shrink-0 bg-card flex flex-col justify-center px-5 xl:px-7 py-6 xl:py-8">
      <div className="flex items-center gap-2 mb-4 xl:mb-5">
        <div
          className="h-px flex-1"
          style={{ background: "rgba(255,255,255,.1)" }}
        />
        <span
          className="text-[10px] uppercase tracking-widest whitespace-nowrap"
          style={{ color: "rgba(255,255,255,.4)" }}
        >
          Portal masuk
        </span>
        <div
          className="h-px flex-1"
          style={{ background: "rgba(255,255,255,.1)" }}
        />
      </div>

      <h2 className="text-[14px] xl:text-[15px] font-bold mb-1 text-card-foreground">
        Masuk ke akun Anda
      </h2>
      <p className="text-[11px] mb-4 xl:mb-5 leading-relaxed text-muted-foreground">
        Gunakan NIP dan kata sandi yang telah diberikan oleh Admin IT.
      </p>

      <LoginForm />

      <div className="text-center mt-3">
        <ForgotPasswordDialog />
      </div>

      <div className="flex items-center gap-2 my-3 xl:my-4">
        <div
          className="h-px flex-1"
          style={{ background: "rgba(255,255,255,.08)" }}
        />
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          atau
        </span>
        <div
          className="h-px flex-1"
          style={{ background: "rgba(255,255,255,.08)" }}
        />
      </div>

      <RequestAccountDialog />
    </div>
  );
}
