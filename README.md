# Kepler Plugin SDK

Build plugins for [Kepler](https://github.com/cheetahbyte/kepler), a native macOS launcher. Your plugin runs as JavaScriptCore: no DOM, no Node, just a bundled script the app hands to JSC. The host gives you `fetch` and `console`. Everything else is on you.
## Example Projects
- [Their Time Plugin](https://github.com/orbiq-one/kepler-their-time/)
- [Github Issue Plugin](https://github.com/orbiq-one/kepler-github-issues/)
## Quick start

Scaffold a new project and install the SDK:

```bash
mkdir my-plugin && cd my-plugin
pnpm init
pnpm add @kepler-app/plugin-sdk
pnpm add -D tsup typescript
```

Drop in a minimal `src/index.ts`:

```ts
import { definePlugin, Command, Icon, Action } from "@kepler-app/plugin-sdk";

export default definePlugin({
  metadata: {
    id: "com.example.hello",
    name: "Hello World",
    version: "1.0.0",
    author: "Your Name",
    icon: Icon.sfSymbol("hand.wave"),
  },
  searchModes: [
    Command.search({
      id: "greet",
      title: "Say Hello",
      keywords: ["greeting", "hi"],
      shortcutPrefix: "h",
      run(query, ctx) {
        const name = query.raw || "World";
        return [{ id: "hello", title: `Hello, ${name}!`, action: Action.copy(`Hello, ${name}!`) }];
      },
    }),
  ],
});
```

Your `tsconfig.json` needs no DOM types since you're in a JSC host:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "types": [],
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true
  },
  "include": ["src", "node_modules/@kepler-app/plugin-sdk/runtime.d.ts"]
}
```

Bundling to IIFE is mandatory. Kepler expects a global `KeplerPlugin` object:

```ts
// tsup.config.ts
import { defineConfig } from "tsup";
export default defineConfig({
  entry: ["src/index.ts"],
  format: ["iife"],
  globalName: "KeplerPlugin",
  outDir: `${process.env.HOME}/Library/Application Support/Kepler/Plugins/my-plugin.keplugin`,
  dts: false,
  clean: true,
  bundle: true,
  noExternal: [/@kepler-app\/plugin-sdk/],
});
```

Build the script and generate a manifest:

```bash
pnpm exec tsup
pnpm exec kepler-plugin manifest src/index.ts --out "$HOME/Library/Application Support/Kepler/Plugins/my-plugin.keplugin/manifest.json"
```

That's it. Kepler picks up plugins from `~/Library/Application Support/Kepler/Plugins/` by scanning for `.keplugin` bundles that contain both `manifest.json` and `index.js`.

## How a plugin is structured

A plugin is a default-exported object from `definePlugin()`. It has two layers:

**Metadata** is the static description. `id`, `name`, `version`, `author`, `icon`, capabilities the CLI infers from your contributions, `settings`, `permissions`, and `networkUrls`. This gets serialized into `manifest.json` and tells Kepler who you are and what you need.

**Contributions** are the four things your plugin actually does: `searchModes`, `searchProviders`, `widgets`, and `lookAhead`. Each is an array of objects with `id`, `title`, and a `run()` function. These are what Kepler calls at runtime.

The CLI reads your TypeScript source, detects which contributions you've defined, and writes a `manifest.json` with the right `capabilities` flags. You don't manually set `hasSearchMode: true`. If you have `searchModes`, it's on.

## Metadata

Everything the app needs before it runs your code:

```ts
metadata: {
  id: "com.example.myplugin",     // reverse-DNS, must be unique
  name: "My Plugin",              // shown in settings and the plugin list
  version: "1.0.0",              // semver
  author: "Your Name",
  description: "Does a thing",   // optional, shown in settings
  icon: Icon.sfSymbol("star"),   // SF Symbol, emoji, or HTTPS URL. Omit for default.
  permissions: ["network"],      // what the plugin may access
  networkUrls: ["api.example.com"], // domains fetch() is allowed to reach
  settings: [ ... ],             // user-configurable values, see settings section
}
```

Capabilities are inferred by the CLI. You can override them explicitly by setting `capabilities` inside `metadata`, but you almost never need to:

```ts
capabilities: {
  hasSearchMode: true,     // inferred from searchModes
  isSearchProvider: true,  // inferred from searchProviders
  hasWidget: true,         // inferred from widgets
  lookAhead: true,         // inferred from lookAhead
}
```

## Search modes

A search mode is an explicit activation surface. Users type a slash-prefix like `/tz ` or pick the mode from the search mode list. Once activated, your plugin owns the launcher until the user dismisses it.

Each search mode can declare a `shortcutPrefix`, a word the user types after `/` to jump straight into that mode. The space is required after the prefix, so `/tz ` activates but `/tz` with no space doesn't. This means short prefixes like `f` don't collide with plugins that start with `foobar`.

```ts
searchModes: [
  Command.search({
    id: "files",
    title: "Files",
    keywords: ["find", "search"],
    shortcutPrefix: "f",
    run(query, ctx) {
      // query.raw   - the text the user typed
      // query.tokens - lowercase whitespace-split tokens
      // ctx.now     - ISO 8601 timestamp
      // ctx.locale  - e.g. "en_US"
      // ctx.settings - resolved setting values keyed by setting id
      return results;
    },
  }),
]
```

A single plugin can expose multiple search modes with different shortcut prefixes. `Command.search()` is just an identity helper. It returns whatever you pass in, giving you autocomplete.

## Search providers

Global search providers contribute results to Kepler's unfiltered results list. They run in the background and should only return items when they're confident the query is relevant.

The match function lets you skip expensive work. If `match` returns `null` or `Match.none`, your provider's `run` isn't called at all.

```ts
import { Provider, Match } from "@kepler-app/plugin-sdk";

searchProviders: [
  Provider.results({
    id: "docs",
    title: "Docs Search",
    match(query, ctx) {
      if (query.raw.length < 3) return Match.none;
      if (query.raw.match(/^doc|^wiki/i)) return Match.strong;
      return Match.none;
    },
    async run(query, ctx, match) {
      const docs = await fetch(`https://docs.example.com/search?q=${encodeURIComponent(query.raw)}`)
        .then(r => r.json());
      return docs.map(doc => ({
        id: doc.url,
        title: doc.title,
        subtitle: doc.snippet,
        action: Action.url(doc.url),
      }));
    },
  }),
],
```

`Match` is a simple helper:

```ts
Match.none           // skip this provider entirely
Match.weak           // low confidence, results appear below stronger matches
Match.medium         // moderate confidence
Match.strong         // high confidence, results rank near the top
Match.exact(1.0)     // explicit confidence value
```

## Widgets

Widgets are inline resolved views drawn below the search bar. If Kepler detects your plugin can resolve the query, it calls your widget's `match()`, then `run()`, and renders the result inline. The widget with the highest `confidence + priorityBias` wins.

```ts
import { Widget, Confidence } from "@kepler-app/plugin-sdk";

widgets: [
  Widget.inline({
    id: "convert",
    title: "Unit Converter",
    priorityBias: 0.1,
    match(query, ctx) {
      if (query.raw.match(/^\d+\s*(usd|eur|cm|in)/i)) return Match.exact(1.0);
      return Match.none;
    },
    run(query, ctx, match) {
      const result = convert(query.raw);
      return {
        confidence: Confidence.exact,
        view: {
          type: "conversion",
          sectionTitle: "Unit Conversion",
          leftMain: "100 USD",
          leftSub: "US Dollar",
          rightMain: "92 EUR",
          rightSub: "Euro",
          centerLabel: "→",
        },
      };
    },
  }),
],
```

Three view types are supported:

A **conversion** shows two labeled values with an arrow between them. Good for currency, units, timezone conversions.

```ts
{ type: "conversion", sectionTitle, icon?, leftMain, leftSub?, rightMain, rightSub?, centerLabel? }
```

A **value** shows a title/value pair. Good for lookups, calculations, status displays.

```ts
{ type: "value", sectionTitle, icon?, title, value, subtitle? }
```

A **message** shows freeform text. Good for status, tips, or when nothing else fits.

```ts
{ type: "message", sectionTitle, icon?, title, message }
```

Confidence constants:

```ts
Confidence.exact   // 1.0 - the query unambiguously matches this widget
Confidence.strong  // 0.8 - highly likely match
Confidence.medium  // 0.5 - reasonable match
Confidence.weak    // 0.25 - plausible but not certain
```

## Look ahead

Not yet wired for JS plugins. The type is defined so you can start building now. When the native side gets a look-ahead bridge, existing plugins won't need changes.

```ts
import { LookAhead } from "@kepler-app/plugin-sdk";

lookAhead: [
  LookAhead.items({
    id: "upcoming",
    title: "Upcoming",
    run(ctx) {
      return [{ id: "ev1", title: "Meeting at 2pm", subtitle: "in 30 min", icon: Icon.sfSymbol("calendar"), kind: "event" }];
    },
  }),
]
```

## Context

Every `run()` and `match()` receives a context object:

```ts
ctx.locale    // string, e.g. "en_US"
ctx.now       // string, ISO 8601 timestamp of current time
ctx.settings  // Record<string, string | number | boolean | Array<Record<string, string>>>
              // resolved setting values, keyed by setting id. Falls back to each setting's defaultValue
ctx.storage   // PluginStorage, see the Storage section below
```

`fetch()` is available as a global. No import needed. It's a polyfill provided by the host, not the browser version. It returns a `KeplerResponse` with `ok`, `status`, `headers` (as a plain object), `.text()`, and `.json()`. No `Blob`, no `FormData`, no streaming. Text/JSON bodies only.

## Settings

Plugins can declare user-configurable settings. Values are readable in `ctx.settings.<id>` at runtime and fall back to each setting's `defaultValue` when the user hasn't changed them.

```ts
settings: [
  { id: "apiKey", title: "API Key", description: "Your service API key.", kind: "secureText", defaultValue: "" },
  { id: "maxResults", title: "Max Results", kind: "number", defaultValue: 10, min: 1, max: 100, step: 1 },
  { id: "theme", title: "Theme", kind: "picker", defaultValue: "auto", options: [
    { id: "auto", title: "System" },
    { id: "light", title: "Light" },
    { id: "dark", title: "Dark" },
  ]},
  { id: "enabled", title: "Enabled", kind: "toggle", defaultValue: true },
  { id: "endpoint", title: "Endpoint", kind: "text", defaultValue: "https://api.example.com" },
  { id: "people", title: "People", kind: "objectList", itemTitle: "Person", defaultValue: [], fields: [
    { id: "name", title: "Name", kind: "text", placeholder: "Laura", required: true },
    { id: "location", title: "Location", kind: "place", placeholder: "Berlin, Germany", required: true },
  ]},
]
```

The `place` field kind is special. When the user picks a location, Kepler resolves it through MapKit and enriches the stored object with `City`, `Country`, `CountryCode`, and `TimeZone` suffixes on the field ID. So if your field is `location`, you get `locationCity`, `locationCountry`, `locationCountryCode`, and `locationTimeZone` alongside the raw `location` value.

## Storage

Plugins have a private key-value store that persists across launches. Each plugin only sees its own keys. Values are JSON only: strings, numbers, booleans, null, arrays, and plain objects. Functions, Dates, and circular references are not supported.

Use it for caches, auth tokens, recent selections, or anything else your plugin needs to remember:

```ts
run(query, ctx) {
  const cached = ctx.storage.get<{ updatedAt: string; items: string[] }>("cache");
  if (cached && cached.updatedAt === ctx.now.slice(0, 10)) {
    return cached.items.map(id => ({ id, title: id, action: Action.open(id) }));
  }

  const items = fetchItems(query.raw);
  ctx.storage.set("cache", { updatedAt: ctx.now.slice(0, 10), items });
  return items.map(id => ({ id, title: id, action: Action.open(id) }));
}
```

The API is intentionally small:

```ts
ctx.storage.get(key: string): T | null     // read a value, null if missing
ctx.storage.set(key: string, value: T)      // write a value, overwrites existing
ctx.storage.delete(key: string)             // remove a key, no-op if missing
```

Storage is not the same as `settings`. Settings are user-controlled values that appear in Kepler's preferences UI. Storage is plugin-controlled state that the user never sees. Do not store secrets in plain text; the store is not encrypted.

## Icons

Icons can be SF Symbols, emoji, HTTPS image URLs, bundle-local assets, or composites:

```ts
import { Icon } from "@kepler-app/plugin-sdk";

Icon.sfSymbol("magnifyingglass")           // any SF Symbol name
Icon.emoji("🔌")                           // single emoji character
Icon.url("https://example.com/icon.png")   // remote image, cached by Kepler
Icon.asset("icons/github.png")             // image bundled in the .keplugin directory
Icon.rounded(Icon.url("https://..."))      // clip the icon to a circle
Icon.withBadge(                             // overlay a badge icon on the bottom-right
  Icon.url("https://unavatar.io/x/laura"),
  Icon.emoji("🇩🇪"),
)
```

`Icon.asset` paths are relative to the `.keplugin` bundle. The image file must exist in the output directory next to `index.js` and `manifest.json`. Absolute paths and `../` traversal are rejected for security. Supported formats: PNG, JPEG, TIFF, GIF, HEIC.

## Actions and results

Everything your plugin returns is a `PluginListItem`:

```ts
import { Action, Accessory } from "@kepler-app/plugin-sdk";

{
  id: "unique-id",          // stable identifier, used for ranking and dedup
  title: "Result Title",    // primary line
  subtitle: "Context info", // secondary line, optional
  icon: Icon.sfSymbol("star"),
  action: Action.open("/Applications/Safari.app"),  // open a file or app
  accessory: Accessory.text("42"),                  // right-aligned label
}
```

Four action types:

```ts
Action.open("/path/to/file")                       // open a file or application
Action.copy("text to copy")                        // copy to clipboard
Action.url("https://...")                          // open in default browser
Action.appleScript('tell app "Music" to playpause') // run AppleScript
```

`Action.appleScript` requires `metadata.permissions: ["appleScript"]`. Without it, the action is ignored. macOS may show an Automation permission prompt the first time the script targets a specific app.

Three accessory types:

```ts
Accessory.text("42")                   // plain text
Accessory.keyboardShortcut("⌘K")       // shows as a keyboard shortcut badge
Accessory.badge("Enter")               // shows as a small badge
```

## Networking

Plugins that make HTTP requests must declare the `network` permission and list allowed domains:

```ts
metadata: {
  permissions: ["network"],
  networkUrls: ["api.example.com", "cdn.example.com"],
}
```

Domains are validated by the CLI. Only bare hostnames, no protocols or paths. Subdomains are automatically allowed, so listing `github.com` covers `api.github.com` too.

The host `fetch` has a 10-second timeout. It rejects on network, DNS, or TLS failure. HTTP responses that aren't in the 200-299 range still resolve, so check `res.ok`. The function signature matches what you'd expect, but the returned object is a host-provided `KeplerResponse`, not the browser `Response`. Headers are a plain object (`res.headers["content-type"]`), not a `Headers` instance.

## Runtime limitations

Your plugin runs inside JavaScriptCore, not a browser and not Node. Specifically:

- **No DOM:** no `document`, no `window`. `localStorage` doesn't exist; use `ctx.storage` instead
- **No Node APIs:** no `require`, no `fs`, no `process`, no `Buffer`
- **No timers:** no `setTimeout`, no `setInterval`. Async work must use Promises and `fetch`
- **No module system:** your script is bundled to a single IIFE that assigns `window.KeplerPlugin` (well, the JSC global equivalent). Kepler looks for that global after evaluating your script
- **JSON only:** all values crossing the XPC bridge must be JSON-serializable. `undefined` becomes absent. `Date` must be an ISO 8601 string. Circular references are a runtime error
- **`fetch` is host-provided:** it handles HTTPS only, text/JSON bodies only, and has a 10-second timeout

## CLI reference

The SDK ships a `kepler-plugin` binary with one subcommand:

```bash
kepler-plugin manifest <entry.ts> [--out <path>]
```

It reads your plugin's default export, inspects which contributions you've defined, validates permissions and network URLs, and writes a `manifest.json`. If `--out` is omitted, it prints to stdout.

What gets written:

| Field | Source |
|-------|--------|
| `id`, `name`, `version`, `author` | From `metadata` (required) |
| `description`, `icon` | From `metadata` (optional) |
| `capabilities` | Inferred from contributions; overridable via `metadata.capabilities` |
| `permissions` | From `metadata.permissions` (validated) |
| `networkUrls` | From `metadata.networkUrls` (validated, normalized to bare hostnames) |
| `settings` | From `metadata.settings` (optional) |
| `contributions.searchModes[]` | From `searchModes` array, each with `id`, `title`, `keywords`, `icon`, `shortcutPrefix` |
| `contributions.searchProviders[]` | From `searchProviders` array |
| `contributions.widgets[]` | From `widgets` array, with `id`, `title`, `priorityBias` |
| `contributions.lookAhead[]` | From `lookAhead` array |

## Common mistakes

**Using the old manifest field instead of metadata.** `manifest` is deprecated. Use `metadata`.

**Putting shortcutPrefix on the plugin instead of the search mode.** Each search mode has its own prefix. The plugin itself doesn't have one.

**Forgetting networkUrls when using fetch.** If you add `permissions: ["network"]`, you need `networkUrls` too. At least one domain. The CLI enforces this.

**Relying on browser or Node globals.** `setTimeout` doesn't exist. `localStorage` doesn't exist; use `ctx.storage` instead. `process.env` doesn't exist. If you need async delays, use Promise chains.

**Not bundling to IIFE.** Kepler evaluates your script and looks for a global `KeplerPlugin` object. If you emit ESM or CJS, it won't find anything.

**Returning non-serializable values.** `undefined`, functions, Symbols, circular objects: these either vanish or crash. Stick to plain objects, arrays, strings, numbers, and booleans.

**Colliding shortcut prefixes.** If two enabled search modes share the same `shortcutPrefix`, only the first one will activate. Keep prefixes unique across all installed plugins.
