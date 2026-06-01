/** SF Symbol name, single emoji, HTTPS URL, or composite icon — passed over XPC bridge. */
export type PluginIcon = string | PluginBadgedIcon | PluginRoundedIcon;

export type PluginBadgedIcon = {
  type: "badge";
  base: PluginIcon;
  badge: PluginIcon;
};

export type PluginRoundedIcon = {
  type: "rounded";
  base: PluginIcon;
};

export const Icon = {
  sfSymbol(name: string): PluginIcon {
    return name;
  },

  emoji(char: string): PluginIcon {
    return char;
  },

  url(httpsUrl: string): PluginIcon {
    return httpsUrl;
  },

  withBadge(base: PluginIcon, badge: PluginIcon): PluginIcon {
    return { type: "badge", base, badge };
  },

  /** Clip the icon to a circle. Works with any icon type. */
  rounded(base: PluginIcon): PluginIcon {
    return { type: "rounded", base };
  },
};
