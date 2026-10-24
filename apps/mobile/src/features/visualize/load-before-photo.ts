import { supabase } from '@/lib/supabase';

export async function loadFirstBeforePhotoDataUrl(homeId: string): Promise<string | null> {
  if (!supabase) {
    return null;
  }
  const { data: photo } = await supabase
    .from('home_photos')
    .select('storage_path')
    .eq('home_id', homeId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!photo || typeof photo.storage_path !== 'string') {
    return null;
  }
  const { data: file } = await supabase.storage.from('home-photos').download(photo.storage_path);
  if (!file) {
    return null;
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (bytes.byteLength === 0) {
    return null;
  }
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return `data:image/jpeg;base64,${btoa(binary)}`;
}
