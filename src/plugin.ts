import type { PluginManifest } from "./manifest";
import type { PluginContext } from "./context";
import type { PluginListItem } from "./results";
import type { PluginResolution } from "./resolve";
import type { LookAheadItem } from "./look-ahead";

export type MaybePromise<T> = T | Promise<T>;

export type KeplerPlugin = {
  manifest: PluginManifest;

  search?: (
    query: string,
    context: PluginContext
  ) => MaybePromise<PluginListItem[]>;

  searchGlobal?: (
    query: string,
    context: PluginContext
  ) => MaybePromise<PluginListItem[]>;

  resolve?: (
    query: string,
    context: PluginContext
  ) => MaybePromise<PluginResolution | null>;

  lookAhead?: (
    context: PluginContext
  ) => MaybePromise<LookAheadItem[]>;
};

export function definePlugin(plugin: KeplerPlugin): KeplerPlugin {
  return plugin;
}
