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
  /** The host invokes `match` with the query only — no context is passed. */
  match?(query: PluginQuery): MaybePromise<PluginMatch>;
  run(query: PluginQuery, ctx: PluginContext, match?: PluginMatch): MaybePromise<PluginListItem[]>;
};

export type PluginResolver = {
  id: string;
  title?: string;
  priorityBias?: number;
  /** The host invokes `match` with the query only — no context is passed. */
  match?(query: PluginQuery): MaybePromise<PluginMatch>;
  run(query: PluginQuery, ctx: PluginContext, match?: PluginMatch): MaybePromise<PluginResolution | null>;
};

export type PluginLookAhead = {
  id: string;
  title?: string;
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
  widgets: PluginResolver[];
  lookAhead: PluginLookAhead[];
};
