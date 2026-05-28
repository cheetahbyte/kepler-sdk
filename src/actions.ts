export type PluginAction =
  | { type: "open"; path: string }
  | { type: "copy"; value: string }
  | { type: "url"; url: string };

export const Action = {
  open(path: string): PluginAction {
    return { type: "open", path };
  },

  copy(value: string): PluginAction {
    return { type: "copy", value };
  },

  url(url: string): PluginAction {
    return { type: "url", url };
  },
};
