import { notFound } from "next/navigation";
import { db } from "@/db";
import { meetings, attendees } from "@/db/database/schema";
import { eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ResultStats } from "./result-stats";
import { PdfSection } from "./pdf-section";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getMeetingData(id: string) {
  const [meetingResult, attendeeResult] = await Promise.all([
    db.select().from(meetings).where(eq(meetings.id, id)).limit(1),
    db.select().from(attendees).where(eq(attendees.meetingId, id)),
  ]);

  if (!meetingResult[0]) notFound();

  const meetingData = meetingResult[0];
  const attendeeList = attendeeResult;

  let photos: string[] = [];
  if (meetingData.photos) {
    try {
      const parsed = JSON.parse(meetingData.photos);
      if (Array.isArray(parsed)) photos = parsed;
    } catch {}
  }

  return { meetingData, attendeeList, photos };
}

export default async function ResultPage({ params }: PageProps) {
  const { id } = await params;
  const { meetingData, attendeeList, photos } = await getMeetingData(id);

  return (
    <div className="space-y-4 max-w-5xl mx-auto p-4 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="rounded-full h-8 w-8 shrink-0"
          >
            <Link href="/dashboard/archive">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="font-bold text-lg text-foreground truncate tracking-tight">
              {meetingData.title}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge
                variant="outline"
                className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] font-bold px-2 py-0 uppercase tracking-widest"
              >
                Selesai
              </Badge>
              <span className="text-xs font-medium text-muted-foreground hidden md:block truncate">
                ID: {id}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* STATS */}
      <ResultStats
        attendeeCount={attendeeList.length}
        photoCount={photos.length}
        date={meetingData.date.toISOString()}
      />

      {/* PDF — client component */}
      <PdfSection
        meetingData={meetingData}
        attendees={attendeeList}
        photos={photos}
      />
    </div>
  );
}
