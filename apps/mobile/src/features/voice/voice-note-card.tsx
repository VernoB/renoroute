import { useTranslation } from 'react-i18next';
import { Pressable, Text, TextInput, View } from 'react-native';

export type VoiceNoteCardProps = {
  recording?: boolean;
  transcribing?: boolean;
  transcript: string;
  tooLong?: boolean;
  error?: boolean;
  onRecord: () => void;
  onStop: () => void;
  onTranscriptChange: (value: string) => void;
  onDelete: () => void;
};

export function VoiceNoteCard(props: VoiceNoteCardProps) {
  const { t } = useTranslation();
  return (
    <View className="gap-3 rounded-lg bg-surface p-4 shadow-1" testID="voice-note-card">
      <Text accessibilityRole="header" className="font-display-semibold text-h2 text-neutral-900">
        {t('voice.title')}
      </Text>
      {props.tooLong ? (
        <Text className="font-inter text-body text-danger-700">{t('voice.tooLong')}</Text>
      ) : null}
      {props.error ? (
        <Text className="font-inter text-body text-danger-700">{t('voice.saveError')}</Text>
      ) : null}
      <VoiceControls {...props} />
      <TranscriptEditor {...props} />
    </View>
  );
}

function VoiceControls({
  recording = false,
  transcribing = false,
  onRecord,
  onStop,
}: VoiceNoteCardProps) {
  const { t } = useTranslation();
  if (transcribing) {
    return <Text className="font-inter text-body text-neutral-700">{t('voice.transcribing')}</Text>;
  }
  if (recording) {
    return <VoiceButton label={t('voice.stop')} onPress={onStop} />;
  }
  return <VoiceButton label={t('voice.record')} onPress={onRecord} />;
}

function TranscriptEditor({ transcript, onTranscriptChange, onDelete }: VoiceNoteCardProps) {
  const { t } = useTranslation();
  if (transcript.length === 0) {
    return null;
  }
  return (
    <View className="gap-3">
      <Text className="font-inter text-body text-neutral-700">{t('voice.transcript')}</Text>
      <TextInput
        accessibilityLabel={t('voice.transcript')}
        className="min-h-24 rounded-lg border border-neutral-400 bg-surface px-3 py-2 font-inter text-body text-neutral-900"
        multiline
        onChangeText={onTranscriptChange}
        textAlignVertical="top"
        value={transcript}
      />
      <VoiceButton label={t('voice.delete')} onPress={onDelete} />
    </View>
  );
}

function VoiceButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      className="min-h-12 items-center justify-center rounded-lg bg-primary-700 px-4"
      onPress={onPress}
    >
      <Text className="font-inter-semibold text-button text-surface">{label}</Text>
    </Pressable>
  );
}
