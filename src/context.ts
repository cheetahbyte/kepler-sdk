export type PluginContext = {
  /** Locale string, e.g. "en_US" */
  locale: string;
  /** ISO 8601 timestamp of "now" */
  now: string;
  /** Persistent key-value store scoped to this plugin */
  storage: PluginStorage;
  /** fetch() is available as a global polyfill — no import needed */
};

export interface PluginStorage {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
}
