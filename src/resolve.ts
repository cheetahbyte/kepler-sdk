import type { PluginIcon } from "./icons";

export type PluginResolution = {
  confidence: number;
  reason?: string;
  view: PluginResolvedView;
};

export type PluginResolvedView =
  | PluginConversionView
  | PluginValueView
  | PluginMessageView;

export type PluginConversionView = {
  type: "conversion";
  sectionTitle: string;
  icon?: PluginIcon;
  leftMain: string;
  leftSub?: string;
  rightMain: string;
  rightSub?: string;
  centerLabel?: string;
};

export type PluginValueView = {
  type: "value";
  sectionTitle: string;
  icon?: PluginIcon;
  title: string;
  value: string;
  subtitle?: string;
};

export type PluginMessageView = {
  type: "message";
  sectionTitle: string;
  icon?: PluginIcon;
  title: string;
  message: string;
};

export const Confidence = {
  exact: 1.0,
  strong: 0.8,
  medium: 0.5,
  weak: 0.25,
} as const;
