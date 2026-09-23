export type AudioCaptureProfileId = "room" | "close";

export function getAudioCaptureConstraints(
  profile: AudioCaptureProfileId,
): MediaTrackConstraints {
  const isRoomProfile = profile === "room";

  return {
    channelCount: 1,
    sampleRate: { ideal: 16000 },
    sampleSize: { ideal: 16 },
    // Noise suppression can mistake a quiet, distant voice for background noise.
    // The room profile preserves it for the transcription provider to process.
    echoCancellation: !isRoomProfile,
    noiseSuppression: !isRoomProfile,
    autoGainControl: true,
  };
}

export const AUDIO_CAPTURE_PROFILE_OPTIONS = [
  { id: "room", label: "Ruang rapat" },
  { id: "close", label: "Suara dekat" },
] as const satisfies ReadonlyArray<{
  id: AudioCaptureProfileId;
  label: string;
}>;
