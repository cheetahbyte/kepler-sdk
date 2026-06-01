// Ambient declarations for the Kepler plugin runtime (a JavaScriptCore host).
//
// The host injects ONLY `fetch` and `console`. There is no DOM, no Node, no
// timers (`setTimeout`/`setInterval`), no `Buffer`/`process`, and no module
// system at runtime — plugins are pre-bundled to a single script.
//
// Compile plugins with `"lib": ["ES2022"]` and `"types": []` so these globals
// describe what actually exists instead of the fuller browser/Node typings.

/** The subset of `Response` the host provides. Not a DOM `Response`. */
interface KeplerResponse {
  /** True when `status` is in the range 200–299. */
  readonly ok: boolean;
  readonly status: number;
  readonly statusText: string;
  /** Final URL after any redirects. */
  readonly url: string;
  /**
   * Response headers as a plain object with lowercased keys.
   * This is NOT a `Headers` instance — use `res.headers["content-type"]`.
   */
  readonly headers: Record<string, string>;
  /** Resolves with the response body decoded as UTF-8 text. */
  text(): Promise<string>;
  /** Parses the body as JSON. Rejects if the body is not valid JSON. */
  json<T = unknown>(): Promise<T>;
}

interface KeplerRequestInit {
  method?: string;
  headers?: Record<string, string>;
  /**
   * Request body. A string is sent as UTF-8; an object/array is JSON-encoded
   * by the host. `FormData`, `Blob`, and `ArrayBuffer` are NOT supported.
   */
  body?: string | Record<string, unknown> | unknown[];
}

/**
 * Host `fetch`. HTTPS/HTTP only, ~10s timeout, text/JSON bodies only (binary
 * responses are decoded as UTF-8 and will be garbled). Rejects on network,
 * DNS, or TLS failure; a non-2xx response still resolves with `ok === false`.
 */
declare function fetch(input: string, init?: KeplerRequestInit): Promise<KeplerResponse>;

/** Host `console`. Output is forwarded to the app log (NSLog). */
declare const console: {
  log(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
  info(...args: unknown[]): void;
};
