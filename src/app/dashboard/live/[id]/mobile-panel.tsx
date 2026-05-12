"use client";

import { ArrowLeft } from "lucide-react";
import { MeetingQRCode } from "@/components/dashboard/live/meeting-qr";
import { MeetingAttendees } from "@/components/dashboard/live/meeting-attendees";
import { PhotoDocumentation } from "@/components/dashboard/live/photo-documentation";
import type { Attendee } from "@/db/database/schema";
import type { MobileTab, PhotoProps } from "./live-meeting-client";

const TAB_LABELS: Record<MobileTab, string> = {
  editor: "Notulen",
  qr: "QR Code",
  attendees: "Peserta",
  photos: "Foto Dokumentasi",
};

interface Props {
  activeTab: Exclude<MobileTab, "editor">;
  meetingId: string;
  origin: string;
  attendees: Attendee[];
  photoProps: PhotoProps;
  onBack: () => void;
}

export function MobilePanel({
  activeTab,
  meetingId,
  origin,
  attendees,
  photoProps,
  onBack,
}: Props) {
  return (
    <>
      <div className="mx-4 mt-2 mb-1 flex items-center gap-2 shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Kembali ke Notulen
        </button>
        <span className="text-muted-foreground/40">·</span>
        <span className="text-xs font-semibold text-foreground">
          {TAB_LABELS[activeTab]}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {activeTab === "qr" && (
          <div className="bg-background border border-border rounded-2xl p-5 flex flex-col items-center gap-4">
            <p className="text-sm font-semibold text-foreground">
              Scan untuk Bergabung
            </p>
            <MeetingQRCode meetingId={meetingId} origin={origin} />
            <p className="text-xs text-muted-foreground text-center">
              Arahkan kamera ke QR Code di atas
            </p>
          </div>
        )}

        {activeTab === "attendees" && (
          <div className="bg-background border border-border rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Peserta</p>
              <span className="text-xs bg-primary/10 text-primary font-semibold px-2.5 py-0.5 rounded-full">
                {attendees.length} orang
              </span>
            </div>
            <MeetingAttendees attendees={attendees} />
          </div>
        )}

        {activeTab === "photos" && (
          <div className="bg-background border border-border rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">
                Foto Dokumentasi
              </p>
              {photoProps.photos.length > 0 && (
                <span className="text-xs bg-primary/10 text-primary font-semibold px-2.5 py-0.5 rounded-full">
                  {photoProps.photos.length} foto
                </span>
              )}
            </div>
            <div className="p-4">
              <PhotoDocumentation {...photoProps} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
