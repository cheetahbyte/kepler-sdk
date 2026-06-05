export type PluginMatch =
  | { kind: "none" }
  | { kind: "match"; confidence: number; data?: string; reason?: string };

export const Match = {
  none(): PluginMatch {
    return { kind: "none" };
  },

  weak(data?: string): PluginMatch {
    return { kind: "match", confidence: 0.25, data };
  },

  medium(data?: string): PluginMatch {
    return { kind: "match", confidence: 0.5, data };
  },

  strong(data?: string): PluginMatch {
    return { kind: "match", confidence: 0.8, data };
  },

  exact(data?: string): PluginMatch {
    return { kind: "match", confidence: 1.0, data };
  },
};
