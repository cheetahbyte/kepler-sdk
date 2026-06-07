import type { PluginContext } from "./context";
import type { PluginListItem, PluginResultItem } from "./results";
import type { PluginResolution } from "./resolve";
import type { LookAheadItem } from "./look-ahead";
import type { MaybePromise } from "./plugin";
import type { PluginQuery } from "./query";
import type { PluginMatch } from "./match";
import type { PluginIcon } from "./icons";
import type { PluginCommandDescriptor } from "./manifest";

export type PluginCommand = {
  id: string;
  title: string;
  subtitle?: string;
  keywords?: string[];
  icon?: PluginIcon;
  shortcutPrefix?: string;
  run(query: PluginQuery, ctx: PluginContext): MaybePromise<PluginListItem[]>;
  sectionedResults?(
    query: PluginQuery,
    ctx: PluginContext
  ): MaybePromise<PluginResultItem[]>;
};

/**
 * Optional interface for plugins that need to return structured rows (widgets, galleries)
 * from a search mode instead of flat list items.
 */
export type SearchModeSectionPlugin = {
  sectionedResults(
    searchMode: PluginCommandDescriptor,
    query: PluginQuery,
    ctx: PluginContext
  ): MaybePromise<PluginResultItem[]>;
};

export type PluginProvider = {
  id: string;
  title?: string;
  match?(query: PluginQuery, ctx: PluginContext): MaybePromise<PluginMatch>;
  run(query: PluginQuery, ctx: PluginContext, match?: PluginMatch): MaybePromise<PluginListItem[]>;
};

export type PluginResolver = {
  id: string;
  title?: string;
  priorityBias?: number;
  match?(query: PluginQuery, ctx: PluginContext): MaybePromise<PluginMatch>;
  run(query: PluginQuery, ctx: PluginContext, match?: PluginMatch): MaybePromise<PluginResolution | null>;
};

export type PluginLookAhead = {
  id: string;
  title?: string;
  subtitle?: string;
  keywords?: string[];
  icon?: PluginIcon;
  shortcutPrefix?: string;
  run(ctx: PluginContext): MaybePromise<LookAheadItem[]>;
};

export type PluginContributions = {
  searchModes: PluginCommand[];
  searchProviders: PluginProvider[];
  widgets: PluginResolver[];
  lookAhead: PluginLookAhead[];
};
