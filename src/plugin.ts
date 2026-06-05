import type { PluginContext } from "./context";
import type { PluginListItem } from "./results";
import type { PluginResolution } from "./resolve";
import type { LookAheadItem } from "./look-ahead";
import type { PluginCapabilities, PluginPermission } from "./manifest";
import type { PluginSettingDefinition } from "./settings";
import type { PluginCommand, PluginProvider, PluginResolver, PluginLookAhead } from "./contributions";
import type { PluginIcon } from "./icons";
import type { PluginShortcutDefinition } from "./shortcuts";

export type MaybePromise<T> = T | Promise<T>;

export type KeplerPluginMeta = {
  id: string;
  name: string;
  version: string;
  author: string;
  description?: string;
  icon?: PluginIcon;
  capabilities?: Partial<PluginCapabilities>;
  settings?: PluginSettingDefinition[];
  shortcuts?: PluginShortcutDefinition[];
  permissions?: PluginPermission[];
  networkUrls?: string[];
};

export type KeplerPluginObject = {
  metadata?: KeplerPluginMeta;

  searchModes?: PluginCommand[];
  searchProviders?: PluginProvider[];
  widgets?: PluginResolver[];
  lookAhead?: PluginLookAhead[];
  /** @deprecated use metadata */
  manifest?: KeplerPluginMeta;

  /** @deprecated use searchModes */
  search?(query: string, ctx: PluginContext): MaybePromise<PluginListItem[]>;

  /** @deprecated use searchProviders */
  canHandle?(query: string): boolean;
  /** @deprecated use searchProviders */
  searchGlobal?(query: string, ctx: PluginContext): MaybePromise<PluginListItem[]>;

  /** @deprecated use widgets */
  resolve?(query: string, ctx: PluginContext): MaybePromise<PluginResolution | null>;

  /** @deprecated use lookAhead */
  lookAheadItems?(ctx: PluginContext): MaybePromise<LookAheadItem[]>;
};

export function definePlugin(plugin: KeplerPluginObject): KeplerPluginObject {
  return plugin;
}
