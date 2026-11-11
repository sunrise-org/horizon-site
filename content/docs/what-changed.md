# What changed in Horizon modding

Horizon has used several modding systems. The current developer guides follow Ari’s typed API work. Use this page to figure out which instructions and build match the mod you have.

## The old WebAssembly SDK

Upstream Horizon’s first code mods used a capability-based SDK with a WIT interface and a Wasmtime runtime. When the five official mods moved to native Rust, upstream removed the separate runtime and the game hooks that served it. The runtime and SDK removal alone covered about 9,900 lines, including four SDK examples. Content-only mods and the registry remained. The launcher kept old entries so modpack dependencies could still resolve, but required a native port to run their code. [Game changes](https://github.com/horizon-rust/horizon/pull/3350) · [Runtime removal](https://github.com/horizon-rust/horizon/pull/3351) · [Launcher migration](https://github.com/horizon-rust/horizon/pull/3353)

If your mod uses the old SDK, keep the data and assets that still apply, then port the code to the hooks supported by your target build. Ari’s sandboxed WebAssembly target uses the typed Rust API and a different runtime contract. Rebuild from source for it.

## One file instead of two

Released Sunrise has two kinds of file: `.hmod` for content and `.hnmod` for a native mixin bundle, each with its own manifest (`horizon-mod.toml`, `horizon-mixin.toml`) and its own tool. Ari's build has one. A mod is one flat folder with one `horizon-mod.toml`, and `cargo horizon-mod build` packs it into one `.hmod`, whether it holds content, Rust, or both. `horizon-native.json`, `compatibility.json`, hand-written `horizon-mixin.toml` and the `native/` and `mixins/<id>/` folders are gone.

## Native mixins and helpers

Sunrise's mixin workflow injects Rust into game source and the launcher builds the modified game. Named hook points made those patches easier to keep working across releases, but raw injections still depend on the shape of the code they target.

On Ari's build, start with typed hooks and Parts. They give common changes a defined place in the game lifecycle and let the compiler check which operations are available on each side. With a compatible prebuilt game, the launcher compiles just the mod. If you need a moment the API lacks, declare an `[[inject]]` in the same manifest or request a hook: [Injections](/docs/modding/injections).

## Migrating an .hnmod mod

| Legacy bundle | Now |
| --- | --- |
| `mixins/<id>/horizon-mixin.toml` | `horizon-mod.toml` at the root, with `[native]` |
| `compatibility.json`, `horizon-native.json` | The `horizon` and `mixins` commits under `[native]` |
| `runtime.rs` and one helper file per hook | One crate: `Cargo.toml` and `src/lib.rs` with `impl Hooks` |
| `native_tick`, `native_hud`, `native_key`… helpers | Methods of `mod_api::Hooks`, with typed events |
| `native.py check`, `native.py package` | `horizon-launcher native-build`, `cargo horizon-mod build` |
| `<id>-<version>.hnmod` | `<id>.hmod` |
| A separate content `.hmod` beside it | `assets/` and `data/` in the same folder |

1. Make a new project with `cargo horizon-mod new <id> --template native`, keeping your mod's id.
2. Copy your content's `assets/` and `data/` into it.
3. Move the logic of `runtime.rs` into `src/lib.rs`. For each helper file, find the `Hooks` method for the same moment and move its body there: `cargo doc -p horizon-mod-api` lists them with their NeoForge counterparts.
4. Build with `horizon-launcher native-build` and fix what the compiler names.
5. Pack it with `cargo horizon-mod build` and [test it](/docs/test-a-mod).

The legacy pages stay for people who maintain a bundle for released Sunrise: [setup](/docs/legacy-native-mods), [the bundle](/docs/legacy-bundle) and [hook points](/docs/legacy-hook-points).

## Registry crates in native mods

Since Ari's commit [`514ecf9`](https://github.com/arismoko/horizon/tree/514ecf9a966cdf2bc4f81f091827d81767756fd9) (November 2026), a native mod may use crates.io packages the game doesn't, or other versions of ones it does. They no longer have to be in Horizon's own `Cargo.lock`. Instead each mod keeps a `Cargo.lock` of its own beside `Cargo.toml`, made with `horizon-launcher native-lock .`, and the launcher refuses to build a registry dependency that lock doesn't pin. The native template's greeting now writes `let _ = player.tell(...)`. [The mod's crate](/docs/modding/how-to/native-mods/the-mods-crate)

## One typed API

Ari’s fork keeps one hook per game moment. When an older hook and its successor run at the same point, the older entry is removed. A check before an action and a notification after it can still be separate hooks. The catalog defines each hook’s contract once, and generated Rust traits and dispatch use that definition.

Port an older typed mod with `cargo horizon-mod update`: it repins the mod and reports the hook signatures that changed. Then compile and update each affected hook and host call. Expect renamed or removed methods while the API is under development. [API design](/docs/modding/concepts/design) · [Modding roadmap](https://github.com/arismoko/horizon/issues/771)

Next, follow the [developer quickstart](/docs/make-a-mod) or read the [typed API guide](/docs/mod-code).

