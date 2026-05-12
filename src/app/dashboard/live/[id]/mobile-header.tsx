"use client";

import { ArrowLeft, QrCode, Users, Image as ImageIcon } from "lucide-react";
import type { Meeting } from "@/db/database/schema";
import type { MobileTab } from "./live-meeting-client";

const MOBILE_TABS = [
  { key: "qr" as MobileTab, label: "QR Code", icon: QrCode },
  { key: "attendees" as MobileTab, label: "Peserta", icon: Users },
  { key: "photos" as MobileTab, label: "Foto", icon: ImageIcon },
];

interface Props {
  meeting: Meeting | null;
  activeTab: MobileTab;
  attendeeCount: number;
  photoCount: number;
  onTabToggle: (key: MobileTab) => void;
  onBack: () => void;
}

export function MobileHeader({
  meeting,
  activeTab,
  attendeeCount,
  photoCount,
  onTabToggle,
  onBack,
}: Props) {
  return (
    <header className="sticky top-0 z-30 bg-background border-b border-border px-4 py-3 flex items-center gap-2 shrink-0">
      <button
        onClick={onBack}
        className="p-1.5 rounded-full hover:bg-muted transition-colors shrink-0"
      >
        <ArrowLeft className="h-5 w-5 text-foreground" />
      </button>

      <div className="flex-1 min-w-0">
        <h1 className="text-sm font-semibold text-foreground truncate">
          {meeting?.title || "Rapat Berlangsung"}
        </h1>
        {meeting?.date && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {new Date(meeting.date).toLocaleDateString("id-ID", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {MOBILE_TABS.map(({ key, label, icon: Icon }) => {
          const badge =
            key === "attendees"
              ? attendeeCount
              : key === "photos" && photoCount > 0
                ? photoCount
                : undefined;
          return (
            <button
              key={key}
              onClick={() => onTabToggle(key)}
              title={label}
              className={`relative p-2 rounded-xl transition-all duration-150 active:scale-95 ${
                activeTab === key
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {badge !== undefined && badge > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
                  {badge}
                </span>
              )}
              <Icon className="h-5 w-5" />
            </button>
          );
        })}
      </div>
    </header>
  );
}
