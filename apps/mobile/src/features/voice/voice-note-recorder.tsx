import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  useAudioRecorder,
} from 'expo-audio';
import { useState } from 'react';

import { VoiceNoteCard } from './voice-note-card';
import { isVoiceTooLong, startVoiceSession, stopVoiceSession } from './voice-note-session';

export type VoiceNoteRecorderProps = {
  transcript: string;
  onTranscriptChange: (value: string) => void;
  onRecorded?: (input: { uri: string; durationSeconds: number }) => void;
};

export function VoiceNoteRecorder({
  transcript,
  onTranscriptChange,
  onRecorded,
}: VoiceNoteRecorderProps) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [recording, setRecording] = useState(false);
  const [tooLong, setTooLong] = useState(false);
  const [error, setError] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);

  return (
    <VoiceNoteCard
      error={error}
      onDelete={() => onTranscriptChange('')}
      onRecord={() => {
        void begin();
      }}
      onStop={() => {
        void finish();
      }}
      onTranscriptChange={onTranscriptChange}
      recording={recording}
      tooLong={tooLong}
      transcript={transcript}
    />
  );

  async function begin() {
    setError(false);
    setTooLong(false);
    const permission = await requestRecordingPermissionsAsync();
    if (!permission.granted) {
      setError(true);
      return;
    }
    try {
      await recorder.prepareToRecordAsync();
      recorder.record();
      setStartedAt(startVoiceSession(Date.now()).startedAt);
      setRecording(true);
    } catch {
      setError(true);
    }
  }

  async function finish() {
    await recorder.stop().catch(() => undefined);
    const stopped = stopVoiceSession(
      { recording: true, startedAt, durationSeconds: 0, uri: null },
      Date.now(),
      recorder.uri,
    );
    setRecording(false);
    setStartedAt(null);
    if (isVoiceTooLong(stopped.durationSeconds)) {
      setTooLong(true);
      return;
    }
    if (stopped.uri) {
      onRecorded?.({ uri: stopped.uri, durationSeconds: stopped.durationSeconds });
      return;
    }
    setError(true);
  }
}
