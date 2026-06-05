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
  /** `fetch()` is available as a global polyfill. No import needed. */
  /**
   * Persistent per-plugin key-value storage. Values are JSON-serialized and kept
   * in the app's sandbox. Each plugin only sees its own keys.
   */
  storage: PluginStorage;
  /**
   * AppleScript execution bridge. Requires `metadata.permissions: ["appleScript"]`.
   * If the permission is missing, `run()` will reject.
   *
   * ```ts
   * const result = await ctx.appleScript.run(`tell app "Finder" to name of every disk`);
   * ```
   */
  appleScript: PluginAppleScript;
};

/** Result of resolving a city + country to a timezone via MapKit. */
export interface ResolvedPlace {
  city: string;
  country: string;
  countryCode: string;
  timeZone: string;
}

/** Values that can be stored and retrieved via `ctx.storage`. */
export type PluginStorageValue =
  | string
  | number
  | boolean
  | null
  | PluginStorageValue[]
  | { [key: string]: PluginStorageValue };

/**
 * Persistent per-plugin key-value storage bridged from the native host.
 * Values are JSON only: strings, numbers, booleans, null, arrays, and plain
 * objects. Functions, Dates, and circular references are not supported.
 */
export interface PluginStorage {
  /** Read a value. Returns `null` if the key doesn't exist. */
  get<T extends PluginStorageValue = PluginStorageValue>(key: string): T | null;
  /** Write a value. Overwrites any existing value. */
  set<T extends PluginStorageValue>(key: string, value: T): void;
  /** Remove a key. No-op if the key doesn't exist. */
  delete(key: string): void;
}

/**
 * AppleScript execution bridge.
 * Requires the plugin to declare `metadata.permissions: ["appleScript"]`.
 */
export interface PluginAppleScript {
  /**
   * Execute an AppleScript and return its result as a string.
   * Rejects if the script fails or if the `appleScript` permission is missing.
   */
  run(script: string): Promise<string>;
}
