/** SF Symbol name, single emoji, HTTPS URL, bundle-local asset, or composite icon. Passed over XPC bridge. */
export type PluginIcon =
  | string
  | PluginBadgedIcon
  | PluginRoundedIcon
  | PluginAssetIcon;

export type PluginBadgedIcon = {
  type: "badge";
  base: PluginIcon;
  badge: PluginIcon;
};

export type PluginRoundedIcon = {
  type: "rounded";
  base: PluginIcon;
};

export type PluginAssetIcon = {
  type: "asset";
  path: string;
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

  rounded(base: PluginIcon): PluginIcon {
    return { type: "rounded", base };
  },

  /**
   * Reference an image file inside the plugin bundle.
   * The path is relative to the .keplugin directory and may contain subdirectories.
   * Supported formats: PNG, JPEG, TIFF, GIF, HEIC.
   * Absolute paths and path traversal (`../`) are rejected by the host.
   */
  asset(path: string): PluginIcon {
    return { type: "asset", path };
  },
};
