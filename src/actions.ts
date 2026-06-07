export type PluginAction =
  | { type: "open"; path: string }
  | { type: "copy"; value: string }
  | { type: "url"; url: string }
  | { type: "appleScript"; script: string }
  | { type: "copyImage"; fileURL: string };

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

  appleScript(script: string): PluginAction {
    return { type: "appleScript", script };
  },

  /**
   * Copy an image to the clipboard.
   * @param fileURL Absolute file path or file:// URL to the image.
   */
  copyImage(fileURL: string): PluginAction {
    return { type: "copyImage", fileURL };
  },
};
