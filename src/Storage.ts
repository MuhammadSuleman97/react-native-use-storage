/**
 * Storage adapter interface.
 * Implement this to support any key-value storage backend
 * (AsyncStorage, MMKV, SQLite, etc.).
 */
export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

function serialize<T>(value: T): string {
  return JSON.stringify(value);
}

function deserialize<T>(raw: string | null, fallback: T): T {
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/**
 * Storage class with typed get/set/remove and subscription support.
 */
export class Storage<T extends Record<string, unknown> = Record<string, unknown>> {
  private adapter: StorageAdapter;
  private listeners = new Map<string, Set<(value: unknown) => void>>();

  constructor(adapter: StorageAdapter) {
    this.adapter = adapter;
  }

  async get<K extends string & keyof T>(key: K, fallback: T[K]): Promise<T[K]>;
  async get<K extends string>(key: K, fallback: T[K]): Promise<T[K]> {
    const raw = await this.adapter.getItem(key);
    return deserialize(raw, fallback);
  }

  async set<K extends string & keyof T>(key: K, value: T[K]): Promise<void>;
  async set(key: string, value: unknown): Promise<void> {
    await this.adapter.setItem(key, serialize(value));
    this.notify(key, value);
  }

  async remove(key: string): Promise<void> {
    await this.adapter.removeItem(key);
    this.notify(key, undefined);
  }

  subscribe<K extends string>(key: K, callback: (value: unknown) => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(callback);
    return () => this.listeners.get(key)?.delete(callback);
  }

  private notify(key: string, value: unknown): void {
    this.listeners.get(key)?.forEach((cb) => cb(value));
  }
}

/**
 * Creates a namespaced storage instance.
 * All keys are automatically prefixed.
 */
export function createNamespacedStorage<T extends Record<string, unknown>>(
  storage: Storage,
  namespace: string,
): Storage<T> {
  const ns = `${namespace}:`;
  return {
    get: <K extends string>(key: K, fallback: unknown) =>
      storage.get(`${ns}${key}`, fallback),
    set: <K extends string>(key: K, value: unknown) =>
      storage.set(`${ns}${key}`, value),
    remove: (key: string) => storage.remove(`${ns}${key}`),
    subscribe: <K extends string>(key: K, cb: (v: unknown) => void) =>
      storage.subscribe(`${ns}${key}`, cb),
  } as Storage<T>;
}
