import type { PluginIcon } from "./icons";

export type LookAheadItem = {
  id: string;
  title: string;
  subtitle?: string;
  icon?: PluginIcon;
  kind: "event" | "reminder" | "generic";
};
