export type PluginShortcutKind = "searchPrefix" | "globalHotkey";

export type PluginShortcutAction = {
  type: "activateSearchMode";
  searchModeID?: string;
};

export type PluginShortcutDefaultValue =
  | string
  | { key: string; modifiers: string[] };

export type PluginShortcutDefinition = {
  id: string;
  title: string;
  description?: string;
  kind: PluginShortcutKind;
  defaultValue?: PluginShortcutDefaultValue;
  action?: PluginShortcutAction;
  /** When true, the host only fires the shortcut if there is selected text,
   *  passing it to the activated search mode. Defaults to false. */
  requiresSelectedText?: boolean;
};

export const Shortcut = {
  searchPrefix(id: string, title: string, prefix: string): PluginShortcutDefinition {
    return { id, title, kind: "searchPrefix", defaultValue: prefix };
  },

  globalHotkey(
    id: string,
    title: string,
    key: string,
    modifiers: string[],
    opts?: { description?: string }
  ): PluginShortcutDefinition {
    return {
      id,
      title,
      description: opts?.description,
      kind: "globalHotkey",
      defaultValue: { key, modifiers },
    };
  },

  activateSearchMode(
    shortcut: PluginShortcutDefinition,
    searchModeID?: string,
    opts?: { requiresSelectedText?: boolean }
  ): PluginShortcutDefinition {
    return {
      ...shortcut,
      action: { type: "activateSearchMode", searchModeID },
      ...(opts?.requiresSelectedText != null
        ? { requiresSelectedText: opts.requiresSelectedText }
        : {}),
    };
  },
};
