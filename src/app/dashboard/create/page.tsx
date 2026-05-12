import { CreateMeetingForm } from "./Create-meeting-form";

// ─── Page (Server Component) ──────────────────────────────────────────────────

export default function CreateMeetingPage() {
  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-500 px-4 sm:px-0 pb-10">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 py-4 sm:py-0 sm:mb-8 border-b sm:border-b-0 border-border mb-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            E-Notulen
          </p>
          <h1 className="text-lg sm:text-2xl font-bold text-foreground tracking-tight leading-tight">
            Buat Agenda Baru
          </h1>
        </div>
      </div>

      {/* ── Form ───────────────────────────────────────────────────────────── */}
      <CreateMeetingForm />
    </div>
  );
}
