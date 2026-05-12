"use client";

import { useState } from "react";
import {
  QrCode,
  Users,
  Image as ImageIcon,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { MeetingQRCode } from "@/components/dashboard/live/meeting-qr";
import { MeetingAttendees } from "@/components/dashboard/live/meeting-attendees";
import { PhotoDocumentation } from "@/components/dashboard/live/photo-documentation";
import type { Attendee } from "@/db/database/schema";
import type { PhotoProps } from "./live-meeting-client";

function CollapsiblePanel({
  icon: Icon,
  label,
  badge,
  children,
}: {
  icon: React.ElementType;
  label: string;
  badge?: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="bg-background border border-border rounded-lg overflow-hidden"
    >
      <CollapsibleTrigger asChild>
        <button className="w-full flex items-center justify-between px-3 py-2 hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Icon className="h-3.5 w-3.5" />
            {label}
          </div>
          <div className="flex items-center gap-1.5">
            {badge !== undefined && (
              <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full font-semibold text-muted-foreground">
                {badge}
              </span>
            )}
            {open ? (
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </div>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="border-t border-border">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

interface Props {
  meetingId: string;
  origin: string;
  attendees: Attendee[];
  photoProps: PhotoProps;
}

export function DesktopSidebar({
  meetingId,
  origin,
  attendees,
  photoProps,
}: Props) {
  return (
    <div className="lg:col-span-3 xl:col-span-2 space-y-1.5 lg:sticky lg:top-4">
      <CollapsiblePanel icon={QrCode} label="QR Code">
        <div className="p-2">
          <MeetingQRCode meetingId={meetingId} origin={origin} />
        </div>
      </CollapsiblePanel>

      <CollapsiblePanel icon={Users} label="Peserta" badge={attendees.length}>
        <MeetingAttendees attendees={attendees} />
      </CollapsiblePanel>

      <CollapsiblePanel
        icon={ImageIcon}
        label="Foto"
        badge={photoProps.photos.length}
      >
        <PhotoDocumentation {...photoProps} />
      </CollapsiblePanel>
    </div>
  );
}
