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

  /**
   * Copy an image to the clipboard.
   * @param fileURL Absolute file path or file:// URL to the image.
   */
  copyImage(fileURL: string, options: ActionOptions = {}): PluginAction {
    return { type: "copyImage", fileURL, ...options };
  },
};
