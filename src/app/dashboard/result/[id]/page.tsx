import { notFound, redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { attendees, meetings } from "@/db/database/schema";
import { getAuthenticatedUser } from "@/lib/auth";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ResultStats } from "./result-stats";
import { PdfSection } from "./pdf-section";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getMeetingData(id: string, userId: string, role: string) {
  const meetingCondition =
    role === "admin"
      ? eq(meetings.id, id)
      : and(eq(meetings.id, id), eq(meetings.userId, userId));
  const [meetingResult] = await Promise.all([
    db.select().from(meetings).where(meetingCondition).limit(1),
  ]);

  const meetingData = meetingResult[0];
  if (!meetingData || meetingData.status !== "archived") notFound();

  const attendeeList = await db
    .select()
    .from(attendees)
    .where(eq(attendees.meetingId, meetingData.id));

  let photos: string[] = [];
  if (meetingData.photos) {
    try {
      const parsed = JSON.parse(meetingData.photos);
      if (
        Array.isArray(parsed) &&
        parsed.every((photo): photo is string => typeof photo === "string")
      ) {
        photos = parsed;
      }
    } catch {
      photos = [];
    }
  }

  return { meetingData, attendeeList, photos };
}

export default async function ResultPage({ params }: PageProps) {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/");

  const { id } = await params;
  const { meetingData, attendeeList, photos } = await getMeetingData(
    id,
    user.id,
    user.role,
  );

  return (
    <div className="space-y-4 max-w-5xl mx-auto p-4 animate-in fade-in duration-500">
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

      <ResultStats
        attendeeCount={attendeeList.length}
        photoCount={photos.length}
        date={meetingData.date.toISOString()}
      />

      <PdfSection
        meetingData={meetingData}
        attendees={attendeeList}
        photos={photos}
      />
    </div>
  );
}
