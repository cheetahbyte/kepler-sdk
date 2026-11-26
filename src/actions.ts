export interface ActionOptions {
  /** Keep Kepler open. Refresh results if this plugin's search mode is active. */
  keepOpen?: boolean;
}

export type PluginAction = ActionOptions & (
  | { type: "open"; path: string }
  | { type: "copy"; value: string }
  | { type: "url"; url: string }
  | { type: "appleScript"; script: string }
  | { type: "copyImage"; fileURL: string }
  | { type: "searchMode"; searchModeID?: string; query?: string }
);

export const Action = {
  open(path: string, options: ActionOptions = {}): PluginAction {
    return { type: "open", path, ...options };
  },

  copy(value: string, options: ActionOptions = {}): PluginAction {
    return { type: "copy", value, ...options };
  },

  url(url: string, options: ActionOptions = {}): PluginAction {
    return { type: "url", url, ...options };
  },

  appleScript(script: string, options: ActionOptions = {}): PluginAction {
    return { type: "appleScript", script, ...options };
  },

  copyImage(fileURL: string, options: ActionOptions = {}): PluginAction {
    return { type: "copyImage", fileURL, ...options };
  },

  searchMode(
    searchModeID?: string,
    options: { query?: string } = {}
  ): PluginAction {
    return {
      type: "searchMode",
      ...(searchModeID != null ? { searchModeID } : {}),
      ...(options.query != null ? { query: options.query } : {}),
    };
  },
};
