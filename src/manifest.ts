import type { PluginSettingDefinition } from "./settings";

export type PluginCapabilities = {
  /** Plugin has its own search mode (/prefix) */
  activatable: boolean;
  /** Contributes results to the global search bar */
  globalSearch: boolean;
  /** Can turn a query into an inline resolved view */
  resolvable: boolean;
  /** Contributes items to the look-ahead strip */
  lookAhead: boolean;
};

export type PluginManifest = {
  /** Reverse-DNS identifier, e.g. "com.example.myplugin" */
  id: string;
  name: string;
  /** Semver string, e.g. "1.0.0" */
  version: string;
  author: string;
  description?: string;
  /** SF Symbol name, single emoji, or HTTPS URL. Omit for default plugin icon. */
  icon?: string;
  capabilities: PluginCapabilities;
  settings?: PluginSettingDefinition[];
};
