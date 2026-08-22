import type { PluginSettingDefinition } from "./settings";
import type { PluginIcon } from "./icons";
import type { PluginShortcutDefinition } from "./shortcuts";

export type PluginPermission = "network" | "appleScript";

export type PluginCapabilities = {
  /** Plugin has its own search mode (/prefix) */
  hasSearchMode: boolean;
  /** Contributes results to the global search bar */
  isSearchProvider: boolean;
  /** Can turn a query into an inline widget view */
  hasWidget: boolean;
  /** Contributes items to the look-ahead strip */
  lookAhead: boolean;
};

export type PluginCommandDescriptor = {
  id: string;
  title: string;
  subtitle?: string;
  keywords?: string[];
  icon?: PluginIcon;
  shortcutPrefix?: string;
  /** Search bar placeholder shown when this mode is active.
   *  Falls back to "Search <name>…" when omitted. */
  placeholder?: string;
};

export type PluginProviderDescriptor = {
  id: string;
  title?: string;
};

export type PluginWidgetDescriptor = {
  id: string;
  title?: string;
  priorityBias?: number;
};

export type PluginLookAheadDescriptor = {
  id: string;
  title: string;
  subtitle?: string;
  keywords?: string[];
  icon?: PluginIcon;
  shortcutPrefix?: string;
  placeholder?: string;
};

export type PluginContributionsDescriptor = {
  searchModes: PluginCommandDescriptor[];
  searchProviders: PluginProviderDescriptor[];
  widgets: PluginWidgetDescriptor[];
  lookAhead: PluginLookAheadDescriptor[];
};

export type PluginManifest = {
  /** Reverse-DNS identifier, e.g. "com.example.myplugin" */
  id: string;
  name: string;
  /** Semver string, e.g. "1.0.0" */
  version: string;
  author: string;
  description?: string;
  /** SF Symbol name, single emoji, HTTPS URL, or badge composite. Omit for default plugin icon. */
  icon?: PluginIcon;
  capabilities: PluginCapabilities;
  contributions?: PluginContributionsDescriptor;
  settings?: PluginSettingDefinition[];
  /** Declared keyboard shortcuts (search prefixes or global hotkeys). */
  shortcuts?: PluginShortcutDefinition[];
  /** Sensitive resources the plugin may access. */
  permissions: PluginPermission[];
  /** Base domains the plugin may contact via fetch()/XHR. Subdomains are allowed. */
  networkUrls: string[];
};
