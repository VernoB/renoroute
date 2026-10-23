import { MAX_VOICE_SECONDS } from '@renoroute/shared';

export type VoiceNoteSession = {
  recording: boolean;
  startedAt: number | null;
  durationSeconds: number;
  uri: string | null;
};

export function startVoiceSession(now: number): VoiceNoteSession {
  return { recording: true, startedAt: now, durationSeconds: 0, uri: null };
}

export function stopVoiceSession(
  session: VoiceNoteSession,
  now: number,
  uri: string | null,
): VoiceNoteSession {
  const startedAt = session.startedAt ?? now;
  const durationSeconds = Math.max(0, Math.round((now - startedAt) / 1000));
  return {
    recording: false,
    startedAt: null,
    durationSeconds,
    uri,
  };
}

export function isVoiceTooLong(durationSeconds: number): boolean {
  return durationSeconds > MAX_VOICE_SECONDS;
}
