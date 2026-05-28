import type { PluginContext } from "./context";
import type { PluginListItem } from "./results";
import type { PluginResolution } from "./resolve";
import type { LookAheadItem } from "./look-ahead";

export type MaybePromise<T> = T | Promise<T>;

export type KeplerPluginObject = {
  /** Required when capabilities.activatable = true */
  search?(query: string, ctx: PluginContext): MaybePromise<PluginListItem[]>;

  /** Required when capabilities.globalSearch = true */
  canHandle?(query: string): boolean;
  searchGlobal?(query: string, ctx: PluginContext): MaybePromise<PluginListItem[]>;

  /** Required when capabilities.resolvable = true */
  resolve?(query: string, ctx: PluginContext): MaybePromise<PluginResolution | null>;

  /** Required when capabilities.lookAhead = true */
  lookAheadItems?(ctx: PluginContext): MaybePromise<LookAheadItem[]>;
};

export function definePlugin(plugin: KeplerPluginObject): KeplerPluginObject {
  return plugin;
}
