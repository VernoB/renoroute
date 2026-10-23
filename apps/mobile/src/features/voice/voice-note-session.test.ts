import { isVoiceTooLong, startVoiceSession, stopVoiceSession } from './voice-note-session';

describe('voice note session', () => {
  it('measures duration and flags notes over two minutes', () => {
    const started = startVoiceSession(1_000);
    expect(started.recording).toBe(true);
    const stopped = stopVoiceSession(started, 6_000, 'file:///tmp/note.m4a');
    expect(stopped.recording).toBe(false);
    expect(stopped.durationSeconds).toBe(5);
    expect(stopped.uri).toBe('file:///tmp/note.m4a');
    expect(isVoiceTooLong(120)).toBe(false);
    expect(isVoiceTooLong(121)).toBe(true);
  });
});
