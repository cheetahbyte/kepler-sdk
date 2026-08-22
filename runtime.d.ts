// Ambient declarations for the Kepler plugin runtime (a JavaScriptCore host).
//
// The host injects ONLY `fetch`, `XMLHttpRequest`, and `console`. There is no
// DOM, no Node, no timers (`setTimeout`/`setInterval`), no `Buffer`/`process`,
// and no module system at runtime. Plugins are pre-bundled to a single script.
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
   * This is NOT a `Headers` instance. Use `res.headers["content-type"]`.
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
 * Host `fetch`. HTTPS/HTTP only, ~10s timeout, 5 MiB response limit, and
 * text/JSON bodies only (binary responses are decoded as UTF-8 and will be
 * garbled). Rejects on invalid URLs or network, DNS, and TLS failures; a
 * non-2xx response still resolves with `ok === false`.
 */
declare function fetch(input: string, init?: KeplerRequestInit): Promise<KeplerResponse>;

/** Host `console`. Kepler forwards these to the app log in DEBUG builds only. */
declare const console: {
  log(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
  info(...args: unknown[]): void;
};

/**
 * Host `XMLHttpRequest`. Async only — synchronous requests throw.
 * Same host/permission gating as `fetch`.
 * @example
 * const xhr = new XMLHttpRequest();
 * xhr.open("GET", "https://api.example.com/data");
 * xhr.onload = () => console.log(xhr.responseText);
 * xhr.send();
 */
declare class XMLHttpRequest {
  /** UNSENT = 0 */
  readonly readyState: number;
  readonly status: number;
  readonly responseText: string;
  readonly response: string;
  onload: (() => void) | null;
  onerror: (() => void) | null;

  open(method: string, url: string, async?: boolean): void;
  setRequestHeader(name: string, value: string): void;
  send(body?: string | Record<string, unknown> | unknown[]): void;
  getAllResponseHeaders(): string;
  getResponseHeader(name: string): string | null;
  abort(): void;
}
