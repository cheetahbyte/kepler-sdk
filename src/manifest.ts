import type { PluginIcon } from "./icons";
import type { PluginSettingDefinition } from "./settings";

export type PluginManifest = {
  id: string;
  name: string;
  version: string;
  author: string;
  description?: string;
  icon?: PluginIcon;
  shortcutPrefix?: string;
  showsInSettingsSidebar?: boolean;
  settings?: PluginSettingDefinition[];
};
