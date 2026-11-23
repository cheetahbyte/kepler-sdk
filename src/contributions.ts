import type { PluginContext } from "./context";
import type { PluginListItem, PluginResultItem } from "./results";
import type { PluginResolution } from "./resolve";
import type { LookAheadItem } from "./look-ahead";
import type { MaybePromise } from "./plugin";
import type { PluginQuery } from "./query";
import type { PluginMatch } from "./match";
import type { PluginIcon } from "./icons";

export type PluginCommand = {
  id: string;
  title: string;
  subtitle?: string;
  keywords?: string[];
  icon?: PluginIcon;
  shortcutPrefix?: string;
  /** Search bar placeholder shown when this mode is active.
   *  Falls back to "Search <name>…" when omitted. */
  placeholder?: string;
  run(query: PluginQuery, ctx: PluginContext): MaybePromise<PluginListItem[]>;
  sectionedResults?(
    query: PluginQuery,
    ctx: PluginContext
  ): MaybePromise<PluginResultItem[]>;
};

export type PluginProvider = {
  id: string;
  title?: string;
  priorityBias?: number;
  supportsTabResults?: boolean;
  /** The host invokes `match` with the query only — no context is passed.
   *  Kepler treats a missing `match` as `Match.none()` and skips `run`. */
  match(query: PluginQuery): MaybePromise<PluginMatch>;
  run(query: PluginQuery, ctx: PluginContext, match?: PluginMatch): MaybePromise<PluginListItem[]>;
};

export type FileSearchResponse = {
  files: Array<{
    /** Absolute local filesystem path, not a URL. */
    path: string;
    isDirectory: boolean;
    /** Relevance from 0 to 100. Omit to use ordered fallback scores. */
    score?: number;
  }>;
  /** Omitted status means ready. Indexing is not an error. */
  status?: "ready" | "indexing" | "unavailable";
  message?: string;
};

export type PluginFileSearchProvider = {
  id: string;
  title: string;
  run(
    query: PluginQuery,
    ctx: PluginContext,
    options: { limit: number }
  ): MaybePromise<FileSearchResponse>;
};

export type PluginResolver = {
  id: string;
  title?: string;
  priorityBias?: number;
  /** The host invokes `match` with the query only — no context is passed.
   *  Widget matching is advisory: `run` still executes with `Match.none()` when `match` does not match. */
  match(query: PluginQuery): MaybePromise<PluginMatch>;
  run(query: PluginQuery, ctx: PluginContext, match?: PluginMatch): MaybePromise<PluginResolution | null>;
};

export type PluginLookAhead = {
  id: string;
  title: string;
  subtitle?: string;
  keywords?: string[];
  icon?: PluginIcon;
  shortcutPrefix?: string;
  placeholder?: string;
  run(ctx: PluginContext): MaybePromise<LookAheadItem[]>;
};

export type PluginContributions = {
  searchModes: PluginCommand[];
  searchProviders: PluginProvider[];
  fileSearchProviders?: PluginFileSearchProvider[];
  widgets: PluginResolver[];
  lookAhead: PluginLookAhead[];
};
