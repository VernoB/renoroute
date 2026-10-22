export type KeyValueStore = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};

const CHUNK_SIZE = 1800;

/** SecureStore rejects values past 2048 bytes. Sessions are split so they still persist. */
export function createChunkedStorage(store: KeyValueStore): KeyValueStore {
  return {
    async getItem(key) {
      const countRaw = await store.getItem(`${key}.count`);
      if (countRaw === null) {
        return store.getItem(key);
      }
      const count = Number(countRaw);
      if (!Number.isInteger(count) || count < 1) {
        return null;
      }
      const parts: string[] = [];
      for (let index = 0; index < count; index += 1) {
        const part = await store.getItem(`${key}.${index}`);
        if (part === null) {
          return null;
        }
        parts.push(part);
      }
      return parts.join('');
    },
    async setItem(key, value) {
      await this.removeItem(key);
      const count = Math.max(1, Math.ceil(value.length / CHUNK_SIZE));
      await store.setItem(`${key}.count`, String(count));
      for (let index = 0; index < count; index += 1) {
        await store.setItem(
          key + '.' + String(index),
          value.slice(index * CHUNK_SIZE, (index + 1) * CHUNK_SIZE),
        );
      }
    },
    async removeItem(key) {
      const countRaw = await store.getItem(`${key}.count`);
      const count = Number(countRaw ?? '0');
      if (Number.isInteger(count)) {
        for (let index = 0; index < count; index += 1) {
          await store.removeItem(`${key}.${index}`);
        }
      }
      await store.removeItem(`${key}.count`);
      await store.removeItem(key);
    },
  };
}

export const supabaseAuthOptions = {
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: false,
} as const;
