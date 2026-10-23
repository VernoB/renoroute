import {
  parseCreateAssessment,
  type AppLocale,
  type HomeInput,
} from '@renoroute/shared';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

import { ReviewScreen } from '@/features/review/review-screen';
import { VoiceNoteRecorder } from '@/features/voice/voice-note-recorder';
import {
  currentUserId,
  loadConsentAiAt,
  loadFirstHome,
  loadPhotoCounts,
  photoCountTotal,
} from '@/lib/homes';
import { supabase } from '@/lib/supabase';

export default function ReviewRoute() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const locale: AppLocale = i18n.resolvedLanguage === 'en' ? 'en' : 'fr';
  const [home, setHome] = useState<HomeInput | null>(null);
  const [homeId, setHomeId] = useState<string | null>(null);
  const [photoCount, setPhotoCount] = useState(0);
  const [consentAiAt, setConsentAiAt] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const userId = await currentUserId();
      if (!userId) {
        return;
      }
      const [loaded, consent] = await Promise.all([loadFirstHome(userId), loadConsentAiAt(userId)]);
      setConsentAiAt(consent);
      if (!loaded) {
        return;
      }
      setHome(loaded.input);
      setHomeId(loaded.row.id);
      setPhotoCount(photoCountTotal(await loadPhotoCounts(loaded.row.id)));
    })();
  }, []);

  return (
    <ReviewScreen
      consentAiAt={consentAiAt}
      footer={
        <VoiceNoteRecorder
          onRecorded={(note) => {
            void transcribeNote(locale, note.durationSeconds).then((text) => {
              if (text) {
                setTranscript(text);
              }
            });
          }}
          onTranscriptChange={setTranscript}
          transcript={transcript}
        />
      }
      home={home}
      message={message}
      offline={supabase === null}
      onGenerate={() => {
        void createDraft(locale, home, homeId, photoCount, consentAiAt, transcript).then((result) => {
          if (result.ok) {
            router.push({
              pathname: '/(app)/plan/generating',
              params: { assessmentId: result.assessmentId },
            });
            return;
          }
          setMessage(t('review.saveError'));
        });
      }}
      photoCount={photoCount}
    />
  );
}

async function transcribeNote(locale: AppLocale, durationSeconds: number): Promise<string | null> {
  if (!supabase) {
    return null;
  }
  const { data } = await supabase.functions.invoke('transcribe-voice-note', {
    body: { locale, durationSeconds, deleteAfterTranscribe: true },
  });
  if (data && typeof data === 'object' && 'ok' in data && data.ok === true && 'transcript' in data) {
    const transcript = (data as { transcript: unknown }).transcript;
    return typeof transcript === 'string' ? transcript : null;
  }
  return null;
}

async function createDraft(
  locale: AppLocale,
  home: HomeInput | null,
  homeId: string | null,
  photoCount: number,
  consentAiAt: string | null,
  transcript: string,
): Promise<{ ok: true; assessmentId: string } | { ok: false }> {
  if (!supabase || !homeId) {
    return { ok: false };
  }
  const parsed = parseCreateAssessment({ consentAiAt, home, photoCount, locale });
  if (!parsed.ok) {
    return { ok: false };
  }
  const userId = await currentUserId();
  if (!userId) {
    return { ok: false };
  }
  const { data, error } = await supabase
    .from('assessments')
    .insert({
      owner_id: userId,
      home_id: homeId,
      status: 'draft',
      locale,
      input_snapshot: home,
      transcript: transcript.trim().length > 0 ? transcript : null,
    })
    .select('id')
    .maybeSingle();
  if (error || !data || typeof data.id !== 'string') {
    return { ok: false };
  }
  return { ok: true, assessmentId: data.id };
}
