export type PluginIcon =
  | { type: "sfSymbol"; value: string }
  | { type: "emoji"; value: string }
  | { type: "appIcon"; path: string };

export const Icon = {
  sfSymbol(value: string): PluginIcon {
    return { type: "sfSymbol", value };
  },

  emoji(value: string): PluginIcon {
    return { type: "emoji", value };
  },

  appIcon(path: string): PluginIcon {
    return { type: "appIcon", path };
  },
};
