import { AttendanceClient } from "./attendance-client";

export default async function AttendancePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AttendanceClient id={id} />;
}
