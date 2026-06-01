export type PluginQuery = {
  raw: string;
  normalized: string;
  tokens: string[];
  source: "global" | "command" | "resolver" | "lookAhead";
  locale?: string;
};

export function createQuery(raw: string, source: PluginQuery["source"] = "global"): PluginQuery {
  return {
    raw,
    normalized: raw.trim().toLowerCase(),
    tokens: raw.trim().toLowerCase().split(/\s+/).filter(Boolean),
    source,
  };
}
