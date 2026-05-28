/** SF Symbol name, single emoji, or HTTPS URL — passed as plain string over XPC bridge. */
export type PluginIcon = string;

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
};
