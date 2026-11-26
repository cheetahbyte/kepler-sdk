import type { PluginAction } from "./actions";

export type LookAheadItemKind =
  | "calendar"
  | "weather"
  | "reminder"
  | "timer"
  | "plugin";

export type LookAheadIconColor =
  | "accent"
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "mint"
  | "teal"
  | "cyan"
  | "blue"
  | "indigo"
  | "purple"
  | "pink"
  | "brown"
  | "gray"
  | "primary"
  | "secondary";

export type LookAheadItem = {
  id: string;
  title: string;
  subtitle?: string;
  icon?: string;
  iconColor?: LookAheadIconColor;
  kind: LookAheadItemKind;
  startDate?: string;
  endDate?: string;
  progress?: number;
  priority?: number;
  action?: PluginAction;
  dismissible?: boolean;
};
