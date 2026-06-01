/** Per-call context passed to a plugin's `run` (and optionally `match`). */
export type PluginContext = {
  /** Locale string, e.g. "en_US". */
  locale: string;
  /** ISO 8601 timestamp of "now". */
  now: string;
  /**
   * Resolved values of the settings declared in your plugin's `metadata.settings`,
   * keyed by setting id. Each value falls back to that setting's `defaultValue`
   * when the user has not changed it. Read your API keys etc. from here:
   *
   * ```ts
   * run(query, ctx) {
   *   const key = ctx.settings.apiKey as string;
   * }
   * ```
   */
  settings: Record<string, string | number | boolean | Array<Record<string, string>>>;
  /** `fetch()` is available as a global polyfill — no import needed. */
};

/** Result of resolving a city + country to a timezone via MapKit. */
export interface ResolvedPlace {
  city: string;
  country: string;
  countryCode: string;
  timeZone: string;
}

/**
 * Persistent per-plugin key-value storage.
 *
 * NOTE: not yet available inside the JavaScriptCore host — `ctx` currently
 * exposes `settings` only. This type is reserved for a future host that
 * bridges storage back to the app.
 */
export interface PluginStorage {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
}
