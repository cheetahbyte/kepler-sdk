export type PluginMatch =
  | { kind: "none" }
  | { kind: "match"; confidence: number; data?: unknown; reason?: string };

export const Match = {
  none(): PluginMatch {
    return { kind: "none" };
  },

  weak(data?: unknown): PluginMatch {
    return { kind: "match", confidence: 0.25, data };
  },

  medium(data?: unknown): PluginMatch {
    return { kind: "match", confidence: 0.5, data };
  },

  strong(data?: unknown): PluginMatch {
    return { kind: "match", confidence: 0.8, data };
  },

  exact(data?: unknown): PluginMatch {
    return { kind: "match", confidence: 1.0, data };
  },
};
