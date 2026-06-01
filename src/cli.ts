import { createJiti } from "jiti";
import { existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

function main(): Promise<void> {
  const args = process.argv.slice(2);
  const subcommand = args[0];

  if (subcommand !== "manifest") {
    console.error("Usage: kepler-plugin manifest <entry.ts> [--out <path>]");
    process.exit(1);
  }

  const outIndex = args.indexOf("--out");
  let outPath: string | undefined;

  if (outIndex !== -1 && args[outIndex + 1]) {
    outPath = resolve(process.cwd(), args[outIndex + 1]);
    args.splice(outIndex, 2);
  }

  const entryArg = args[1];
  if (!entryArg) {
    console.error("Usage: kepler-plugin manifest <entry.ts> [--out <path>]");
    process.exit(1);
  }

  const entry = resolve(process.cwd(), entryArg);
  if (!existsSync(entry)) {
    console.error(`File not found: ${entry}`);
    process.exit(1);
  }

  return manifest(entry, outPath);
}

async function manifest(entry: string, outPath: string | undefined): Promise<void> {
  const jiti = createJiti(import.meta.url);
  const mod = await jiti.import(entry);
  const plugin = (mod as Record<string, unknown>).default ?? mod;

  if (!plugin || typeof plugin !== "object") {
    console.error("Plugin entry must have a default export (definePlugin({...}))");
    process.exit(1);
  }

  const obj = plugin as Record<string, unknown>;
  const meta = (obj.metadata ?? obj.manifest ?? {}) as Record<string, unknown>;

  const required = ["id", "name", "version", "author"] as const;
  for (const key of required) {
    if (!meta[key]) {
      console.error(`metadata.${key} is required`);
      process.exit(1);
    }
  }

  const permissions = validatePermissions(meta);
  const networkUrls = validateNetworkUrls(meta, permissions);

  const searchModesArr = obj.searchModes as Array<Record<string, unknown>> | undefined;
  const searchProvidersArr = obj.searchProviders as Array<Record<string, unknown>> | undefined;
  const widgetsArr = obj.widgets as Array<Record<string, unknown>> | undefined;
  const lookAheadArr = obj.lookAhead as Array<Record<string, unknown>> | undefined;

  const hasSearchModes = Array.isArray(searchModesArr) && searchModesArr.length > 0;
  const hasSearchProviders = Array.isArray(searchProvidersArr) && searchProvidersArr.length > 0;
  const hasWidgets = Array.isArray(widgetsArr) && widgetsArr.length > 0;
  const hasLookAhead = Array.isArray(lookAheadArr) && lookAheadArr.length > 0;

  const hasLegacySearch = typeof obj.search === "function";
  const hasLegacyCanHandle = typeof obj.canHandle === "function";
  const hasLegacySearchGlobal = typeof obj.searchGlobal === "function";
  const hasLegacyResolve = typeof obj.resolve === "function";
  const hasLegacyLookAhead = typeof obj.lookAheadItems === "function";

  const capabilities: Record<string, boolean> = {
    hasSearchMode: hasSearchModes || hasLegacySearch,
    isSearchProvider: hasSearchProviders || (hasLegacyCanHandle && hasLegacySearchGlobal),
    hasWidget: hasWidgets || hasLegacyResolve,
    lookAhead: hasLookAhead || hasLegacyLookAhead,
  };

  const explicitCaps = meta.capabilities as Record<string, boolean> | undefined;
  const mergedCaps = { ...capabilities, ...explicitCaps };

  const searchModesDesc = (searchModesArr ?? []).map((c) => ({
    id: c.id,
    title: c.title,
    ...(c.subtitle != null ? { subtitle: c.subtitle } : {}),
    ...(Array.isArray(c.keywords) && c.keywords.length > 0
      ? { keywords: c.keywords }
      : {}),
    ...(c.icon != null ? { icon: c.icon } : {}),
    ...(c.shortcutPrefix != null ? { shortcutPrefix: c.shortcutPrefix } : {}),
  }));

  const searchProvidersDesc = (searchProvidersArr ?? []).map((p) => ({
    id: p.id,
    title: p.title,
  }));

  const widgetsDesc = (widgetsArr ?? []).map((r) => ({
    id: r.id,
    ...(r.title != null ? { title: r.title } : {}),
    ...(typeof r.priorityBias === "number"
      ? { priorityBias: r.priorityBias }
      : {}),
  }));

  const lookAheadDesc = (lookAheadArr ?? []).map((l) => ({
    id: l.id,
    ...(l.title != null ? { title: l.title } : {}),
  }));

  const hasAnyContribution =
    searchModesDesc.length > 0 ||
    searchProvidersDesc.length > 0 ||
    widgetsDesc.length > 0 ||
    lookAheadDesc.length > 0;

  const output: Record<string, unknown> = {
    id: meta.id,
    name: meta.name,
    version: meta.version,
    author: meta.author,
    capabilities: mergedCaps,
    permissions,
    networkUrls,
  };

  if (meta.description) output.description = meta.description;
  if (meta.icon) output.icon = meta.icon;

  if (hasAnyContribution) {
    output.contributions = {
      searchModes: searchModesDesc,
      searchProviders: searchProvidersDesc,
      widgets: widgetsDesc,
      lookAhead: lookAheadDesc,
    };
  }

  if (Array.isArray(meta.settings) && meta.settings.length > 0) {
    output.settings = meta.settings;
  }

  const text = JSON.stringify(output, null, 2) + "\n";

  if (outPath) {
    writeFileSync(outPath, text, "utf-8");
  } else {
    process.stdout.write(text);
  }
}

const VALID_PERMISSIONS = new Set(["network", "maps"]);

function validatePermissions(meta: Record<string, unknown>): string[] {
  const raw = meta.permissions;
  if (!Array.isArray(raw)) {
    console.error("metadata.permissions must be an array");
    process.exit(1);
  }
  for (const p of raw) {
    if (typeof p !== "string" || !VALID_PERMISSIONS.has(p)) {
      console.error(`metadata.permissions contains invalid value: "${String(p)}". Allowed: network, maps`);
      process.exit(1);
    }
  }
  return raw as string[];
}

function normalizeDomain(raw: string): string | null {
  let domain = raw.trim().toLowerCase();
  if (!domain) return null;
  // Strip protocol if present
  const protoIdx = domain.indexOf("://");
  if (protoIdx !== -1) domain = domain.slice(protoIdx + 3);
  // Strip path, port, query
  const slashIdx = domain.indexOf("/");
  if (slashIdx !== -1) domain = domain.slice(0, slashIdx);
  const colonIdx = domain.indexOf(":");
  if (colonIdx !== -1) domain = domain.slice(0, colonIdx);
  // Remove trailing dot
  domain = domain.replace(/\.+$/, "");
  // Basic hostname validation
  if (!/^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/.test(domain) && !/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(domain)) {
    return null;
  }
  return domain;
}

function validateNetworkUrls(meta: Record<string, unknown>, permissions: string[]): string[] {
  const raw = meta.networkUrls;
  if (!Array.isArray(raw)) {
    if (permissions.includes("network")) {
      console.error("metadata.networkUrls must be an array (required when permissions includes \"network\")");
      process.exit(1);
    }
    return [];
  }
  const urls: string[] = [];
  for (const u of raw) {
    if (typeof u !== "string") {
      console.error(`metadata.networkUrls contains non-string value: ${String(u)}`);
      process.exit(1);
    }
    const normalized = normalizeDomain(u);
    if (!normalized) {
      console.error(`metadata.networkUrls contains invalid domain: "${u}"`);
      process.exit(1);
    }
    urls.push(normalized);
  }
  if (urls.length > 0 && !permissions.includes("network")) {
    console.error('metadata.networkUrls is set but permissions does not include "network"');
    process.exit(1);
  }
  if (permissions.includes("network") && urls.length === 0) {
    console.error('metadata.permissions includes "network" but networkUrls is empty');
    process.exit(1);
  }
  return urls;
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
