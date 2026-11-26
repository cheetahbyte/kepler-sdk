# Changelog

## 1.3.0

- Add `ctx.process.exec` (`PluginProcessExecRequest`, `PluginProcessExecResult`) for one-shot CLI execution under the `process` permission.
- Add `Action.searchMode(searchModeID?, { query? })` to activate a search mode belonging to the same plugin.
- Add `iconColor` (`LookAheadIconColor`), `action`, and `dismissible` to `LookAheadItem`.

## 1.2.0

Aligned with Kepler 0.11.x.

- Add optional `fileSearchProviders` contributions (`FileSearch.provider(...)`), `FileSearchResponse`, manifest descriptors, and `isFileSearchProvider` capability inference.
- Add the `process` permission and typed `ctx.process.request` / `ctx.process.close` persistent subprocess session APIs.
- Add optional `{ keepOpen?: boolean }` to all `Action.*` helpers so actions can keep Kepler open and refresh the active search mode.
- Add optional `priorityBias` and `supportsTabResults` on `searchProviders` (`PluginProvider`, `PluginProviderDescriptor`, and CLI manifest output).
- Document the 10 MiB per-plugin `ctx.storage` quota, registrable-domain `networkUrls` rules, advisory widget matching, and multi-contribution provider/widget support.
