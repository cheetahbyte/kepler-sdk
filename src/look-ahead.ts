import type { PluginIcon } from "./icons";
import type { PluginAction } from "./actions";

export type LookAheadItem = {
  id: string;
  title: string;
  subtitle?: string;
  startDate?: string;
  endDate?: string;
  icon?: PluginIcon;
  action?: PluginAction;
};
