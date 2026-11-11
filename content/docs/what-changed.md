# What changed in modding

Sunrise has had several mod systems. This page says which one your mod uses, what replaced it, and how to move an old mod to the single `.hmod`.

## The short version

- **Today:** one `.hmod` per mod, holding data and Rust code together, built by `cargo horizon-mod`. Code uses Ari's typed API.
- **Before:** data in a `.hmod`, code in a separate `.hnmod` bundle, each with its own manifest and tool.
- **Long before:** a WebAssembly SDK in upstream Horizon, since removed.

## One file instead of two

Released Sunrise had two kinds of file:

- `.hmod` for data, with the manifest `horizon-mod.toml`.
- `.hnmod` for a native mixin bundle, with the manifest `horizon-mixin.toml` and its own tool.

Ari's build has one:

- One flat folder, one `horizon-mod.toml`.
- `cargo horizon-mod build` packs it into one `.hmod`, whether it holds data, Rust, or both.
- `horizon-native.json`, `compatibility.json`, a hand-written `horizon-mixin.toml`, and the `native/` and `mixins/<id>/` folders are gone.

## Typed hooks instead of mixin helpers

**Before:** Sunrise's mixin workflow injected Rust into the game's source, and the launcher built the modified game. Named hook points made those patches easier to keep working, but raw injections still depended on the shape of the code they targeted.

**Now:** start with typed hooks and Parts.

- They give common changes a defined place in the game's lifecycle.
- The compiler checks which calls are allowed on each side, server or client.
- With a matching prebuilt game, the launcher compiles just the mod.
- For a moment the API lacks, declare an `[[inject]]` in the same manifest, or ask for a hook: [Injections](/docs/modding/injections).

## Migrating an .hnmod mod

**What moves where:**

| Old bundle | Now |
| --- | --- |
| `mixins/<id>/horizon-mixin.toml` | `horizon-mod.toml`, with `[native]` |
| `compatibility.json`, `horizon-native.json` | The commits under `[native]` |
| `runtime.rs`, one helper file per hook | `Cargo.toml` and `src/lib.rs`, with `impl Hooks` |
| `native_tick`, `native_hud`, `native_key`… | Methods of `mod_api::Hooks`, with typed events |
| `native.py check`, `native.py package` | `horizon-launcher native-build`, `cargo horizon-mod build` |
| `<id>-<version>.hnmod` | `<id>.hmod` |
| A separate data `.hmod` beside it | `assets/` and `data/` in the same folder |

**Steps:**

1. Make a new project, keeping your mod's id:

   ```sh
   cargo horizon-mod new <id> --template native
   ```

2. Copy your data's `assets/` and `data/` folders into it.
3. Move the logic of `runtime.rs` into `src/lib.rs`. For each helper file, find the `Hooks` method for the same moment and move its body there. `cargo doc -p horizon-mod-api` lists them, with their NeoForge counterparts.
4. Build with `horizon-launcher native-build` and fix what the compiler names.
5. Pack it with `cargo horizon-mod build` and [test it](/docs/test-a-mod).

The old pages stay for people who maintain a bundle: [setup](/docs/legacy-native-mods), [the bundle](/docs/legacy-bundle) and [hook points](/docs/legacy-hook-points).

## Crates from crates.io

Since Ari's commit [`514ecf9`](https://github.com/arismoko/horizon/tree/514ecf9a966cdf2bc4f81f091827d81767756fd9) (November 2026):

- A mod may use crates.io packages the game doesn't, or other versions of ones it does.
- Each mod keeps its own `Cargo.lock` beside `Cargo.toml`, made with `horizon-launcher native-lock .`.
- The launcher refuses a registry dependency that lock doesn't pin.
- The template's greeting now writes `let _ = player.tell(...)`.

See [The mod's crate](/docs/modding/how-to/native-mods/the-mods-crate).

## One hook per game moment

Ari's API keeps one hook per moment in the game.

- When an older hook and its successor run at the same point, the older one is removed.
- A check before an action and a notice after it can still be two hooks.
- The catalog defines each hook once, and the Rust traits and dispatch are generated from it.

**To move an older typed mod forward:** run `cargo horizon-mod update`. It repins the mod and reports the hook signatures that changed. Then compile and fix each affected hook and host call. Expect renamed or removed methods while the API is in development. [API design](/docs/modding/concepts/design) · [Modding roadmap](https://github.com/arismoko/horizon/issues/771)

## The old WebAssembly SDK

Upstream Horizon's first code mods used a capability-based SDK, with a WIT interface and a Wasmtime runtime.

- When the five official mods moved to native Rust, upstream removed that runtime and the hooks that served it: about 9,900 lines, including four SDK examples.
- Data-only mods and the registry stayed. The launcher kept old entries so modpack dependencies still resolve, but their code needs a native port.
- Links: [game changes](https://github.com/horizon-rust/horizon/pull/3350) · [runtime removal](https://github.com/horizon-rust/horizon/pull/3351) · [launcher migration](https://github.com/horizon-rust/horizon/pull/3353)

If your mod uses that SDK, keep its data and assets, then port the code to typed hooks. Ari's WebAssembly target is different: it uses the typed Rust API, so rebuild from source for it.

Next: the [quickstart](/docs/make-a-mod) for the current way.
