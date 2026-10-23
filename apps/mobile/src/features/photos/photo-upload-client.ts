import type { Database } from '@renoroute/shared/types/database';
import type { SupabaseClient } from '@supabase/supabase-js';

import type { PhotoCommitClient } from './commit-photo';

export function createPhotoCommitClient(
  client: SupabaseClient<Database>,
): PhotoCommitClient {
  return {
    async upload(path, body) {
      const { error } = await client.storage.from('home-photos').upload(path, body, {
        contentType: 'image/jpeg',
        upsert: false,
      });
      return { error: error ? { message: error.message } : null };
    },
    async insert(row) {
      const { error } = await client.from('home_photos').insert(row);
      return { error: error ? { message: error.message } : null };
    },
  };
}

export async function requestPhotoAnalysis(
  client: SupabaseClient<Database>,
  photoId: string,
): Promise<void> {
  await client.functions.invoke('analyze-photo', { body: { photoId } });
}
