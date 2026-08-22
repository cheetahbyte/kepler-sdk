import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { tmpdir } from "node:os";
import { join } from "node:path";

import plugin, { representativeValues } from "./fixtures/contract-plugin.mjs";

const fixtureURL = new URL("./fixtures/plugin-contract-v1.json", import.meta.url);
const entryURL = new URL("./fixtures/contract-plugin.mjs", import.meta.url);
const bundleEntryURL = new URL("./fixtures/bundle-plugin.ts", import.meta.url);
const cliURL = new URL("../dist/cli.js", import.meta.url);

test("public builders expose the 1.0 runtime shapes", () => {
  assert.deepEqual(representativeValues.toggle, { type: "toggle", value: true });
  assert.deepEqual(representativeValues.match, {
    kind: "match",
    confidence: 0.8,
    data: "contract",
  });
  assert.equal(plugin.lookAhead?.[0]?.run({
    locale: "en_US",
    now: "2026-07-18T12:00:00Z",
    settings: {},
    storage: { get: () => null, set: () => {}, delete: () => {} },
    appleScript: { run: async () => "" },
    notify: async () => {},
    notifications: { show: async () => {} },
  })[0]?.kind, "calendar");
});

test("CLI emits the versioned manifest contract with empty permission defaults", async () => {
  const result = spawnSync(process.execPath, [cliURL.pathname, "manifest", entryURL.pathname], {
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);

  const expected = JSON.parse(await readFile(fixtureURL, "utf8"));
  assert.deepEqual(JSON.parse(result.stdout), expected);
});

test("CLI requires match on providers and title on look-ahead", async () => {
  const missingMatch = new URL("./fixtures/missing-match-plugin.mjs", import.meta.url);
  const missingTitle = new URL("./fixtures/missing-lookahead-title-plugin.mjs", import.meta.url);
  const matchResult = spawnSync(process.execPath, [cliURL.pathname, "manifest", missingMatch.pathname], {
    encoding: "utf8",
  });
  const titleResult = spawnSync(process.execPath, [cliURL.pathname, "manifest", missingTitle.pathname], {
    encoding: "utf8",
  });
  assert.notEqual(matchResult.status, 0);
  assert.match(matchResult.stderr, /match is required/);
  assert.notEqual(titleResult.status, 0);
  assert.match(titleResult.stderr, /title must be a non-empty string/);
});

test("CLI no longer infers capabilities from legacy entry points", async () => {
  const legacyURL = new URL("./fixtures/legacy-plugin.mjs", import.meta.url);
  const result = spawnSync(process.execPath, [cliURL.pathname, "manifest", legacyURL.pathname], {
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout).capabilities, {
    hasSearchMode: false,
    isSearchProvider: false,
    hasWidget: false,
    lookAhead: false,
  });
});

test("CLI bundle output has the exact host filenames and global", async () => {
  const temporaryRoot = await mkdtemp(join(tmpdir(), "kepler-sdk-contract-"));
  const bundlePath = join(temporaryRoot, "contract.keplugin");
  try {
    const result = spawnSync(
      process.execPath,
      [cliURL.pathname, "bundle", bundleEntryURL.pathname, "--out", bundlePath],
      { encoding: "utf8" },
    );
    assert.equal(result.status, 0, result.stderr);
    await readFile(join(bundlePath, "manifest.json"));
    const script = await readFile(join(bundlePath, "index.js"), "utf8");
    assert.match(script, /KeplerPlugin/);
    assert.doesNotMatch(script, /@kepler-app\/plugin-sdk/);
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});
