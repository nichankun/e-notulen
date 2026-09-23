export type MeetingLifecycleStatus = "draft" | "live" | "archived" | "completed";

/** `completed` is retained as a legacy alias for finalized meetings. */
export function isFinalizedMeetingStatus(
  status: string | null | undefined,
): boolean {
  return status === "archived" || status === "completed";
}

/** Finalized statuses are terminal; new meetings keep using `archived`. */
export function canTransitionMeetingStatus(
  currentStatus: string | null,
  nextStatus: MeetingLifecycleStatus,
): boolean {
  if (currentStatus === nextStatus) return true;
  if (currentStatus === "draft") {
    return nextStatus === "live" || isFinalizedMeetingStatus(nextStatus);
  }
  if (currentStatus === "live") return isFinalizedMeetingStatus(nextStatus);
  return false;
}
