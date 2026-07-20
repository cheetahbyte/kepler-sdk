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
  metadata: KeplerPluginMeta;

  searchModes?: PluginCommand[];
  searchProviders?: PluginProvider[];
  widgets?: PluginResolver[];
  lookAhead?: PluginLookAhead[];
};

export function definePlugin(plugin: KeplerPluginObject): KeplerPluginObject {
  return plugin;
}
