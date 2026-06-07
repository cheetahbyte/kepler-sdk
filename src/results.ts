import type { PluginAction } from "./actions";
import type { PluginIcon } from "./icons";
import type { PluginResolution } from "./resolve";

export type PluginListItem = {
  id: string;
  title: string;
  subtitle?: string;
  icon?: PluginIcon;
  accessory?: PluginListAccessory;
  action?: PluginAction;
};

export type PluginListAccessory = {
  type: "text" | "keyboardShortcut" | "badge";
  value: string;
  /**
   * When false (default), the accessory only shows on the highlighted row.
   * Set true to keep it visible on every row.
   */
  alwaysVisible?: boolean;
};

export const Accessory = {
  text(value: string, alwaysVisible?: boolean): PluginListAccessory {
    return { type: "text", value, alwaysVisible };
  },

  keyboardShortcut(value: string, alwaysVisible?: boolean): PluginListAccessory {
    return { type: "keyboardShortcut", value, alwaysVisible };
  },

  badge(value: string, alwaysVisible?: boolean): PluginListAccessory {
    return { type: "badge", value, alwaysVisible };
  },
};

// MARK: - Sectioned Results

export type PluginResultItemAction = {
  id: string;
  title: string;
};

export type PluginResultItem = {
  id: string;
  title?: string;
  rows: PluginResultRow[];
  actions?: PluginResultItemAction[];
};

export type PluginResultRow =
  | { type: "list"; item: PluginListItem }
  | { type: "widget"; widget: PluginWidgetRow }
  | { type: "gallery"; gallery: PluginGalleryRow };

export type PluginWidgetRow = {
  id: string;
  view: PluginResolution;
};

// MARK: - Gallery

export type PluginGalleryLayout = "grid" | "horizontal";

export type PluginGalleryRow = {
  id: string;
  items: PluginGalleryItem[];
  layout?: PluginGalleryLayout;
  maxVisibleRows?: number;
};

export type PluginGalleryItem = {
  id: string;
  title: string;
  subtitle?: string;
  detail?: string;
  icon?: PluginIcon;
  preview: PluginGalleryPreview;
  action: PluginAction;
  isPinned?: boolean;
};

export type PluginGalleryPreview =
  | { type: "text"; value: string }
  | { type: "code"; value: string }
  | { type: "image"; url: string }
  | { type: "icon"; icon: PluginIcon }
  | { type: "fileIcon"; path: string }
  | { type: "none" };

