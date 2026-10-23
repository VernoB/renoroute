import { cleanup, fireEvent, render, screen } from '@testing-library/react-native';

import i18n from '@/lib/i18n';

import { VoiceNoteCard, type VoiceNoteCardProps } from './voice-note-card';

const copy = {
  fr: {
    title: 'Note vocale',
    record: 'Enregistrer',
    stop: 'Arrêter',
    transcribing: 'Transcription…',
    transcript: 'Texte (modifiable)',
    delete: 'Supprimer la note',
    tooLong: 'Deux minutes maximum.',
  },
  en: {
    title: 'Voice note',
    record: 'Record',
    stop: 'Stop',
    transcribing: 'Transcribing…',
    transcript: 'Text (editable)',
    delete: 'Delete the note',
    tooLong: 'Two minutes maximum.',
  },
} as const;

async function renderCard(overrides: Partial<VoiceNoteCardProps> = {}) {
  return render(
    <VoiceNoteCard
      onDelete={() => undefined}
      onRecord={() => undefined}
      onStop={() => undefined}
      onTranscriptChange={() => undefined}
      transcript=""
      {...overrides}
    />,
  );
}

describe('VoiceNoteCard', () => {
  afterEach(async () => {
    cleanup();
    await i18n.changeLanguage('fr');
  });

  it('shows French record controls', async () => {
    const onRecord = jest.fn();
    await i18n.changeLanguage('fr');
    await renderCard({ onRecord });
    expect(screen.getByText(copy.fr.title)).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: copy.fr.record }));
    expect(onRecord).toHaveBeenCalledTimes(1);
  });

  it('shows English stop and the two-minute limit', async () => {
    const onStop = jest.fn();
    await i18n.changeLanguage('en');
    await renderCard({ onStop, recording: true, tooLong: true });
    expect(screen.getByText(copy.en.title)).toBeTruthy();
    expect(screen.getByText(copy.en.tooLong)).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: copy.en.stop }));
    expect(onStop).toHaveBeenCalledTimes(1);
  });

  it('shows the transcribing state in French', async () => {
    await i18n.changeLanguage('fr');
    await renderCard({ transcribing: true });
    expect(screen.getByText(copy.fr.transcribing)).toBeTruthy();
    expect(screen.queryByRole('button', { name: copy.fr.record })).toBeNull();
    expect(screen.queryByRole('button', { name: copy.fr.stop })).toBeNull();
  });

  it('lets the homeowner edit and delete a transcript', async () => {
    const onDelete = jest.fn();
    const onTranscriptChange = jest.fn();
    await i18n.changeLanguage('en');
    await renderCard({
      onDelete,
      onTranscriptChange,
      transcript: 'the furnace is old',
    });
    expect(screen.getByText(copy.en.transcript)).toBeTruthy();
    fireEvent.changeText(screen.getByLabelText(copy.en.transcript), 'drafty windows');
    fireEvent.press(screen.getByRole('button', { name: copy.en.delete }));
    expect(onTranscriptChange).toHaveBeenCalledWith('drafty windows');
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
