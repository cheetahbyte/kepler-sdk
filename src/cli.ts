import { createJiti } from "jiti";
import { cpSync, existsSync, mkdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

type ManifestObject = Record<string, unknown>;

function main(): Promise<void> {
  const args = process.argv.slice(2);
  const subcommand = args[0];

  if (subcommand === "manifest") {
    return handleManifest(args);
  }

  if (subcommand === "bundle") {
    return handleBundle(args);
  }

  console.error("Usage:");
  console.error("  kepler-plugin bundle <entry.ts> --out <bundle.keplugin> [--assets <dir>]");
  console.error("  kepler-plugin manifest <entry.ts> [--out <path>]");
  process.exit(1);
}

// MARK: - Manifest

async function handleManifest(args: string[]): Promise<void> {
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

  const manifestObj = await buildManifestObject(entry);
  const text = JSON.stringify(manifestObj, null, 2) + "\n";

  if (outPath) {
    writeFileSync(outPath, text, "utf-8");
  } else {
    process.stdout.write(text);
  }
}

// MARK: - Bundle

async function handleBundle(args: string[]): Promise<void> {
  const outIndex = args.indexOf("--out");
  let outDir: string | undefined;

  if (outIndex !== -1 && args[outIndex + 1]) {
    outDir = resolve(process.cwd(), args[outIndex + 1]);
    args.splice(outIndex, 2);
  }

  const assetsIndex = args.indexOf("--assets");
  let assetsDir: string | undefined;

  if (assetsIndex !== -1 && args[assetsIndex + 1]) {
    assetsDir = resolve(process.cwd(), args[assetsIndex + 1]);
    args.splice(assetsIndex, 2);
  }

  const entryArg = args[1];
  if (!entryArg || !outDir) {
    console.error("Usage: kepler-plugin bundle <entry.ts> --out <bundle.keplugin> [--assets <dir>]");
    process.exit(1);
  }

  const entry = resolve(process.cwd(), entryArg);
  if (!existsSync(entry)) {
    console.error(`File not found: ${entry}`);
    process.exit(1);
  }

  // Ensure output directory exists.
  mkdirSync(outDir, { recursive: true });

  // Bundle via tsup (from the project's local install).
  const tsupBin = resolve(process.cwd(), "node_modules", ".bin", "tsup");
  const hasLocalTsup = existsSync(tsupBin);
  const tsup = hasLocalTsup ? tsupBin : "npx";

  const bundleArgs = [
    "--entry.index", entry,
    "--no-config",
    "--format", "iife",
    "--globalName", "KeplerPlugin",
    "--outDir", outDir,
    "--platform", "neutral",
    "--target", "es2022",
    "--no-splitting",
  ];

  const result = spawnSync(tsup, hasLocalTsup ? bundleArgs : ["tsup", ...bundleArgs], {
    cwd: process.cwd(),
    stdio: "inherit",
    shell: false,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }

  // tsup suffixes IIFE entries with `.global.js`; the host contract is the
  // stable filename `index.js` regardless of the source entry's name.
  const generatedEntry = join(outDir, "index.global.js");
  const hostEntry = join(outDir, "index.js");
  if (!existsSync(generatedEntry)) {
    console.error(`Bundler did not produce the expected entry: ${generatedEntry}`);
    process.exit(1);
  }
  if (existsSync(hostEntry)) rmSync(hostEntry);
  renameSync(generatedEntry, hostEntry);

  // Write manifest.
  const manifestObj = await buildManifestObject(entry);
  const manifestText = JSON.stringify(manifestObj, null, 2) + "\n";
  writeFileSync(join(outDir, "manifest.json"), manifestText, "utf-8");

  // Copy assets.
  if (assetsDir) {
    const resolvedAssets = resolve(assetsDir);
    if (existsSync(resolvedAssets)) {
      copyAssets(resolvedAssets, outDir);
    } else {
      console.warn(`\nWarning: assets directory not found: ${assetsDir}`);
    }
  }

  console.log(`\nWrote plugin to ${outDir}`);
}

function copyAssets(src: string, dst: string): void {
  const resolvedSrc = resolve(src);
  const resolvedDst = resolve(dst);

  if (resolvedSrc === resolvedDst) {
    console.error("Assets directory must differ from output directory");
    process.exit(1);
  }
  if (resolvedDst.startsWith(resolvedSrc + "/")) {
    console.error("Output directory must not be inside the assets directory");
    process.exit(1);
  }

  cpSync(resolvedSrc, resolvedDst, {
    recursive: true,
    filter: (srcPath) => {
      const name = srcPath.split("/").pop()?.split("\\").pop() ?? "";
      return !name.startsWith(".");
    },
  });
}

// MARK: - Manifest object building (shared)

async function buildManifestObject(entry: string): Promise<ManifestObject> {
  const jiti = createJiti(import.meta.url);
  const mod = await jiti.import(entry);
  const plugin = (mod as Record<string, unknown>).default ?? mod;

  if (!plugin || typeof plugin !== "object") {
    console.error("Plugin entry must have a default export (definePlugin({...}))");
    process.exit(1);
  }

  const obj = plugin as Record<string, unknown>;
  const meta = (obj.metadata ?? {}) as Record<string, unknown>;

  const required = ["id", "name", "version", "author"] as const;
  for (const key of required) {
    if (!meta[key]) {
      console.error(`metadata.${key} is required`);
      process.exit(1);
    }
  }

  const permissions = validatePermissions(meta);
  const networkUrls = validateNetworkUrls(meta, permissions);

  const searchModesArr = validateContributions(obj.searchModes, "searchModes", true);
  const searchProvidersArr = validateContributions(obj.searchProviders, "searchProviders", false);
  const widgetsArr = validateContributions(obj.widgets, "widgets", false);
  const lookAheadArr = validateContributions(obj.lookAhead, "lookAhead", false);

  const hasSearchModes = Array.isArray(searchModesArr) && searchModesArr.length > 0;
  const hasSearchProviders = Array.isArray(searchProvidersArr) && searchProvidersArr.length > 0;
  const hasWidgets = Array.isArray(widgetsArr) && widgetsArr.length > 0;
  const hasLookAhead = Array.isArray(lookAheadArr) && lookAheadArr.length > 0;

  const capabilities: Record<string, boolean> = {
    hasSearchMode: hasSearchModes,
    isSearchProvider: hasSearchProviders,
    hasWidget: hasWidgets,
    lookAhead: hasLookAhead,
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
    ...(c.placeholder != null ? { placeholder: c.placeholder } : {}),
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
    ...(l.subtitle != null ? { subtitle: l.subtitle } : {}),
    ...(Array.isArray(l.keywords) && l.keywords.length > 0
      ? { keywords: l.keywords }
      : {}),
    ...(l.icon != null ? { icon: l.icon } : {}),
    ...(l.shortcutPrefix != null ? { shortcutPrefix: l.shortcutPrefix } : {}),
    ...(l.placeholder != null ? { placeholder: l.placeholder } : {}),
  }));

  const hasAnyContribution =
    searchModesDesc.length > 0 ||
    searchProvidersDesc.length > 0 ||
    widgetsDesc.length > 0 ||
    lookAheadDesc.length > 0;

  const output: ManifestObject = {
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

  const shortcuts = validateShortcuts(meta);
  if (shortcuts.length > 0) {
    output.shortcuts = shortcuts;
  }

  return output;
}

// MARK: - Validation

const VALID_PERMISSIONS = new Set(["network", "appleScript"]);

function validateContributions(
  raw: unknown,
  collection: string,
  requiresTitle: boolean
): Array<Record<string, unknown>> {
  if (raw == null) return [];
  if (!Array.isArray(raw)) {
    console.error(`${collection} must be an array`);
    process.exit(1);
  }
  return raw.map((entry, index) => {
    if (!entry || typeof entry !== "object") {
      console.error(`${collection}[${index}] must be an object`);
      process.exit(1);
    }
    const contribution = entry as Record<string, unknown>;
    if (typeof contribution.id !== "string" || !contribution.id.trim()) {
      console.error(`${collection}[${index}].id must be a non-empty string`);
      process.exit(1);
    }
    if (requiresTitle && (typeof contribution.title !== "string" || !contribution.title.trim())) {
      console.error(`${collection}[${index}].title must be a non-empty string`);
      process.exit(1);
    }
    if (contribution.title != null && typeof contribution.title !== "string") {
      console.error(`${collection}[${index}].title must be a string when provided`);
      process.exit(1);
    }
    return contribution;
  });
}

function validatePermissions(meta: Record<string, unknown>): string[] {
  const raw = meta.permissions;
  if (raw == null) return [];
  if (!Array.isArray(raw)) {
    console.error("metadata.permissions must be an array");
    process.exit(1);
  }
  for (const p of raw) {
    if (typeof p !== "string" || !VALID_PERMISSIONS.has(p)) {
      console.error(`metadata.permissions contains invalid value: "${String(p)}". Allowed: network, appleScript`);
      process.exit(1);
    }
  }
  return raw as string[];
}

function normalizeDomain(raw: string): string | null {
  let domain = raw.trim().toLowerCase();
  if (!domain) return null;
  const protoIdx = domain.indexOf("://");
  if (protoIdx !== -1) domain = domain.slice(protoIdx + 3);
  const slashIdx = domain.indexOf("/");
  if (slashIdx !== -1) domain = domain.slice(0, slashIdx);
  const colonIdx = domain.indexOf(":");
  if (colonIdx !== -1) domain = domain.slice(0, colonIdx);
  domain = domain.replace(/\.+$/, "");
  if (!/^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/.test(domain) && !/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(domain)) {
    return null;
  }
  return domain;
}

function validateShortcuts(meta: Record<string, unknown>): Record<string, unknown>[] {
  const raw = meta.shortcuts;
  if (!Array.isArray(raw)) return [];
  const validKinds = new Set(["searchPrefix", "globalHotkey"]);
  return raw.map((s, index): Record<string, unknown> => {
    if (!s || typeof s !== "object") {
      console.error(`metadata.shortcuts[${index}] must be an object`);
      process.exit(1);
    }
    const obj = s as Record<string, unknown>;
    if (typeof obj.id !== "string" || !obj.id) {
      console.error(`metadata.shortcuts[${index}].id must be a non-empty string`);
      process.exit(1);
    }
    if (typeof obj.title !== "string" || !obj.title) {
      console.error(`shortcut "${obj.id}": title must be a non-empty string`);
      process.exit(1);
    }
    if (typeof obj.kind !== "string" || !validKinds.has(obj.kind)) {
      console.error(`shortcut "${obj.id}": kind must be "searchPrefix" or "globalHotkey"`);
      process.exit(1);
    }
    if (obj.defaultValue != null) {
      if (obj.kind === "searchPrefix" && typeof obj.defaultValue !== "string") {
        console.error(`shortcut "${obj.id}": searchPrefix defaultValue must be a string`);
        process.exit(1);
      }
      if (obj.kind === "globalHotkey") {
        if (typeof obj.defaultValue !== "object" || obj.defaultValue == null) {
          console.error(`shortcut "${obj.id}": globalHotkey defaultValue must be an object with key and modifiers`);
          process.exit(1);
        }
        const dv = obj.defaultValue as Record<string, unknown>;
        if (typeof dv.key !== "string" || !Array.isArray(dv.modifiers) || !dv.modifiers.every(m => typeof m === "string")) {
          console.error(`shortcut "${obj.id}": globalHotkey defaultValue requires key (string) and modifiers (string[])`);
          process.exit(1);
        }
      }
    }
    return obj;
  });
}

function validateNetworkUrls(meta: Record<string, unknown>, permissions: string[]): string[] {
  const raw = meta.networkUrls;
  if (!Array.isArray(raw)) {
    if (permissions.includes("network")) {
      console.error('metadata.networkUrls must be an array (required when permissions includes "network")');
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
