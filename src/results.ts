import type { PluginAction } from "./actions";
import type { PluginIcon } from "./icons";

export type PluginListItem = {
  id: string;
  title: string;
  subtitle?: string;
  icon?: PluginIcon;
  accessory?: PluginListAccessory;
  action?: PluginAction;
};

export type PluginListAccessory =
  | { type: "text"; value: string }
  | { type: "keyboardShortcut"; value: string }
  | { type: "badge"; value: string };

export const Accessory = {
  text(value: string): PluginListAccessory {
    return { type: "text", value };
  },

  keyboardShortcut(value: string): PluginListAccessory {
    return { type: "keyboardShortcut", value };
  },

  badge(value: string): PluginListAccessory {
    return { type: "badge", value };
  },
};
