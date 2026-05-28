export type PluginAction =
  | { type: "copy"; value: string }
  | { type: "openURL"; url: string }
  | { type: "openFile"; path: string }
  | { type: "activateApp"; path: string };

export const Action = {
  copy(value: string): PluginAction {
    return { type: "copy", value };
  },

  openURL(url: string): PluginAction {
    return { type: "openURL", url };
  },

  openFile(path: string): PluginAction {
    return { type: "openFile", path };
  },

  activateApp(path: string): PluginAction {
    return { type: "activateApp", path };
  },
};
