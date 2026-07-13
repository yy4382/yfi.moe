# Astro 7.0.3 content-loader cache and reconciliation semantics

> [!WARNING]
> This is version-bound research for the repository's installed Astro **7.0.3** only. Do not apply these implementation findings to another Astro version without re-reading that version's official documentation and installed loader source.

## Scope

This note describes the build-time Content Loader API in the repository's installed Astro version, **7.0.3**. Its findings expire when Astro changes version. It focuses on what Astro 7.0.3 persists, how its built-in `glob()` and `file()` loaders reconcile that persisted state, and which observable semantics a remote loader can match at this version.

Primary sources:

- [Astro Content Loader API reference](https://docs.astro.build/en/reference/content-loader-reference/)
- Installed Astro 7.0.3 implementation: [`content-layer.js`](../../app/blog-astro/node_modules/astro/dist/content/content-layer.js), [`mutable-data-store.js`](../../app/blog-astro/node_modules/astro/dist/content/mutable-data-store.js), [`glob.js`](../../app/blog-astro/node_modules/astro/dist/content/loaders/glob.js), and [`file.js`](../../app/blog-astro/node_modules/astro/dist/content/loaders/file.js)
- Installed version declaration: [`app/blog-astro/package.json`](../../app/blog-astro/package.json) and [`pnpm-lock.yaml`](../../pnpm-lock.yaml)

## Executive findings

1. **Astro persists loader-managed collection entries and collection-scoped metadata.** The content store is restored before loaders run, so a loader can compare newly acquired content with entries and sync tokens from a previous run. In development the file is `.astro/data-store.json`; outside development it is under Astro's configured cache directory. Astro also persists framework-level metadata used to invalidate all content when the content config, relevant Astro config, or Astro version changes. [API: `LoaderContext.store` and `LoaderContext.meta`](https://docs.astro.build/en/reference/content-loader-reference/#loadercontext); installed implementation: [`content-layer.js`](../../app/blog-astro/node_modules/astro/dist/content/content-layer.js), [`mutable-data-store.js`](../../app/blog-astro/node_modules/astro/dist/content/mutable-data-store.js).

2. **Astro does not decide whether an object loader replaces a whole collection or updates it incrementally.** The installed `ContentLayer` says this is the loader's responsibility. Astro calls `load(context)`, supplies the persisted scoped store, serializes mutations, and saves the resulting store. A simple function loader is the exception: Astro automatically clears and repopulates its collection. [API: build-time loaders and function loaders](https://docs.astro.build/en/reference/content-loader-reference/#build-time-loaders); installed implementation: [`content-layer.js`](../../app/blog-astro/node_modules/astro/dist/content/content-layer.js).

3. **`glob()` reconciles per entry.** On initial load it enumerates matching files, computes a digest of each file's raw contents, and skips parsing/rendering/store replacement when the existing entry has the same digest. It removes persisted entries not encountered in the new enumeration. In development, `add` and `change` only resync the affected file; `unlink` only deletes that file's mapped entry. [`glob.js`](../../app/blog-astro/node_modules/astro/dist/content/loaders/glob.js); [API: `glob()`](https://docs.astro.build/en/reference/content-loader-reference/#glob-loader).

4. **`file()` reconciles as a whole-file collection.** It first reads and parses the JSON/YAML/TOML file; after successful source parsing it clears the collection and parses/stores each item. A development `change` reruns that same whole-file operation. It does not use entry digests or `meta`. [`file.js`](../../app/blog-astro/node_modules/astro/dist/content/loaders/file.js); [API: `file()`](https://docs.astro.build/en/reference/content-loader-reference/#file-loader).

5. **A digest is an entry-level update optimization, not source freshness and not a transaction marker.** `generateDigest()` creates a non-cryptographic digest; when `store.set()` receives a digest matching the existing entry with the same ID, it returns `false` and leaves the entry untouched. `meta` is the intended home for collection-scoped sync tokens or last-modified values. [API: `LoaderContext.generateDigest`, `LoaderContext.meta`, `DataStore.set`, and `DataEntry.digest`](https://docs.astro.build/en/reference/content-loader-reference/); installed implementation: [`mutable-data-store.js`](../../app/blog-astro/node_modules/astro/dist/content/mutable-data-store.js).

6. **The store API is mutable, not transactional.** Neither the public API nor the installed content layer provides begin/commit/rollback or an isolated replacement store. Mutations schedule persistence as they occur. Therefore, “behaves like a built-in loader” does not imply all-or-nothing collection replacement. This is an inference from the documented `DataStore` API and installed mutation/save implementation, not an explicit Astro guarantee. [API: `DataStore`](https://docs.astro.build/en/reference/content-loader-reference/#datastore); installed implementation: [`mutable-data-store.js`](../../app/blog-astro/node_modules/astro/dist/content/mutable-data-store.js).

## What Astro itself caches and persists

Astro constructs a `MutableDataStore` from the data-store file before running content synchronization. Each loader receives two views scoped to its collection:

- `store`: entry data (`id`, parsed `data`, optional `body`, `filePath`, `digest`, rendered content, and asset/module bookkeeping);
- `meta`: arbitrary loader-only key/value metadata, documented for sync tokens and last-modified times.

Both are serialized in the same persisted store. The runtime can read collection entries, but collection-scoped `meta` is only exposed to the loader. [API reference](https://docs.astro.build/en/reference/content-loader-reference/#loadercontextmeta); installed [`content-layer.js`](../../app/blog-astro/node_modules/astro/dist/content/content-layer.js) and [`mutable-data-store.js`](../../app/blog-astro/node_modules/astro/dist/content/mutable-data-store.js).

The data-store location is selected by execution mode:

- development: the project's `.astro/data-store.json`;
- non-development sync/build: `data-store.json` under `config.cacheDir`.

The store writes are debounced and use a temporary file plus rename for atomic **file writing**. That protects the serialized file from a torn filesystem write, but it does not make a sequence of loader mutations a transactional unit. [`content-layer.js`](../../app/blog-astro/node_modules/astro/dist/content/content-layer.js), [`mutable-data-store.js`](../../app/blog-astro/node_modules/astro/dist/content/mutable-data-store.js).

Astro stores global metadata for the content-config digest, a serialized relevant Astro-config digest, and Astro version. When a previously stored value differs, Astro clears the entire store before invoking loaders. This invalidation is framework/config cache invalidation; it is separate from source revision/freshness logic owned by a custom loader. [`content-layer.js`](../../app/blog-astro/node_modules/astro/dist/content/content-layer.js).

## Exact `glob()` behavior in Astro 7.0.3

### Initial load or build sync

`glob()` starts with `untouchedEntries = new Set(store.keys())`, so the existing persisted collection is its reconciliation base. It enumerates matching files and processes up to ten concurrently. For each file it:

1. reads raw text and gets the entry type's body/frontmatter data;
2. generates the entry ID;
3. removes that ID from `untouchedEntries`;
4. computes `generateDigest(contents)`;
5. if an existing entry has that digest and a `filePath`, avoids schema parsing and rendering, while restoring module/asset import bookkeeping;
6. otherwise runs `parseData()`, renders or marks deferred rendering as appropriate, and calls `store.set()` with the digest.

After all enumerated files complete, it deletes every ID still in `untouchedEntries`. Thus the final collection mirrors the current glob result while unchanged entries reuse the persisted representation. [`glob.js`](../../app/blog-astro/node_modules/astro/dist/content/loaders/glob.js).

One edge case in the installed implementation: if the base directory exists but the glob matches zero files, `glob()` warns and returns before deleting untouched entries. This means that particular path does **not** reconcile the collection to empty. [`glob.js`](../../app/blog-astro/node_modules/astro/dist/content/loaders/glob.js).

### Development watch behavior

After initial reconciliation, `glob()` watches the base directory and keeps an in-memory file-path-to-ID map:

- `change`: resync only that matching path;
- `add`: same path as `change`, adding or replacing only that entry;
- `unlink`: look up the old ID and delete only that entry.

If a changed file generates a different ID, it deletes the old ID before setting the new entry. Errors from `add`/`change` resync are logged and caught rather than rethrown. [`glob.js`](../../app/blog-astro/node_modules/astro/dist/content/loaders/glob.js).

The built-in behavior is therefore entry-oriented and incremental during watch. It is not a “directory snapshot replacement” on every filesystem event.

## Exact `file()` behavior in Astro 7.0.3

`file()` represents one structured source file whose array elements or object values become many collection entries. Its `syncData()`:

1. reads and parses the entire source file;
2. returns without clearing the existing store when reading or source-format parsing fails;
3. for a parsed array or object, clears the collection;
4. validates each entry with `parseData()` and stores it.

The development watcher subscribes only to `change` for that exact file and reruns the same whole-file synchronization. The installed loader does not handle `add` or `unlink`, does not compute digests, and does not use `meta`. [`file.js`](../../app/blog-astro/node_modules/astro/dist/content/loaders/file.js).

Because validation occurs after `store.clear()`, a later `parseData()` failure can leave a cleared or partially repopulated collection. Again, Astro supplies no transaction around this code. This is an inference from the installed implementation, not a stated public guarantee.

## Intended roles of `store`, `meta`, and `digest`

| Mechanism | Scope                               | Intended use                                                                                | What it does not provide                                         |
| --------- | ----------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `store`   | One content collection              | Persistent authoritative entries and incremental mutation (`get`, `set`, `delete`, `clear`) | Transactional snapshot commit/rollback                           |
| `meta`    | One content collection, loader-only | Persistent sync tokens, ETags/SHAs, last-modified values, cursors                           | Entry content or automatic freshness behavior                    |
| `digest`  | One entry ID                        | Avoid replacing an entry when its meaningful content has not changed                        | Source-level freshness, deletion discovery, collection atomicity |

Sources: [Astro Content Loader API reference](https://docs.astro.build/en/reference/content-loader-reference/#loadercontext), installed [`types.d.ts`](../../app/blog-astro/node_modules/astro/dist/content/loaders/types.d.ts), and installed [`mutable-data-store.js`](../../app/blog-astro/node_modules/astro/dist/content/mutable-data-store.js).

## Semantics for a GitHub-capable loader to emulate

The following are behavioral facts implied by “work like Astro's built-in loaders,” without prescribing an internal architecture:

- Load into Astro's supplied persistent `store`; do not create a parallel cache for entry data that Astro already persists.
- Use `meta` for a remote source revision or conditional-fetch token when one is useful. Astro does not infer or manage remote freshness.
- Use per-entry digests when the loader wants `glob()`-style reuse of unchanged parsed/rendered entries.
- Reconcile deletions explicitly. Astro never infers which remote entries disappeared.
- Choose reconciliation by source shape: directory-like sources naturally match `glob()`'s enumerate/update/delete behavior; one structured file containing a collection naturally matches `file()`'s whole-file behavior.
- In development, local filesystem sources can use `watcher`; a remote GitHub source needs an explicit refresh trigger or a fresh build/sync because Astro's filesystem watcher cannot observe remote changes.
- Do not assume Astro wraps loader execution in a transaction. If stronger failure atomicity is desired, it must be implemented by loader logic and should be treated as an intentional enhancement beyond the guarantees demonstrated by the built-ins.

These points follow from the [official loader-building guidance](https://docs.astro.build/en/reference/content-loader-reference/#building-a-loader) and the installed Astro 7.0.3 built-in implementations cited above.
