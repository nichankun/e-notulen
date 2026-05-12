import { LiveMeetingClient } from "./live-meeting-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LiveMeetingPage({ params }: PageProps) {
  const { id } = await params;
  return <LiveMeetingClient id={id} />;
}
