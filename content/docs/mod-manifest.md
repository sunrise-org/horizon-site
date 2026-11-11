# The manifest and the .hmod file

Every mod has one manifest, `horizon-mod.toml`, at the root of its folder. It is the only source of the mod's id and version, for content and code alike. This page lists its fields and what the packed `.hmod` holds. The complete rules are in the book's [Mod files](/docs/modding/reference/manifest) reference.

## The folder and the file

The project folder and the `.hmod` have the same flat layout. `cargo horizon-mod build` zips the folder's mod files into `target/horizon-mod/<id>.hmod`:

```text
my_mod.hmod
├── horizon-mod.toml
├── icon.png                # optional
├── assets/my_mod/
├── data/my_mod/
├── Cargo.toml              # code mods only
├── Cargo.lock              # code mods with crates.io dependencies
├── src/lib.rs              # code mods only
└── mod.wasm                # wasm mods only
```

- **Content only:** no `Cargo.toml` and no `[native]`. Nothing compiles.
- **Native code:** `Cargo.toml` and `src/` at the root, and `[native]` in the manifest. The launcher builds it into the game.
- **Wasm code:** `mod.wasm` at the root, declared by `[wasm]`, beside the source it was built from.

There is no folder named after the mod inside the file, no `native/` or `rust/` folder, and no second manifest. A file whose code and declarations disagree is refused: `Cargo.toml` without `[native]`, `mod.wasm` that `[wasm]` doesn't declare, or any other executable.

## Shared fields

```toml
id = "my_mod"
name = "My mod"
version = "0.1.0"
description = "..."
authors = ["..."]
license = "MIT"
homepage = "https://..."
issues = "https://..."
api = "0.2"
side = "both"
capabilities = ["registries"]
```

| Field | Rule |
| --- | --- |
| `id` | 1 to 64 characters of `a-z`, `0-9` and `_`. It is also the namespace of the mod's blocks, items and files. Keep it once you have published. |
| `name`, `description`, `authors` | What the game's Mods screen shows. |
| `version` | The mod's version. Each published version needs a new one. Cargo's version is ignored. |
| `license`, `license_url`, `credits`, `homepage`, `issues` | Optional. They fill the Mods screen. Links must be `http` or `https`. |
| `api` | Exactly `"0.2"`. |
| `side` | `"client"` (the default) or `"both"`. A mod that adds blocks or runs on servers says `"both"`: its id and version must then match between a server and its players. |
| `capabilities` | `["registries"]`. |
| `namespaces` | Optional: more namespaces the mod's files use. |

Unknown keys are refused, so a typo is an error and not a silently ignored setting.

## Native code: [native]

`cargo horizon-mod new --template native` writes this section, and `cargo horizon-mod update` moves it to a newer game:

```toml
[native]
game = "26.3"
horizon = "<40-character Horizon commit>"
mixins = "<40-character horizon-mixins commit>"
```

| Field | Rule |
| --- | --- |
| `game` | The Minecraft version, `"26.3"`. |
| `horizon` | The exact Horizon commit the mod builds against: 40 lowercase hex characters. |
| `mixins` | The exact horizon-mixins commit: 40 lowercase hex characters. |
| `[[native.module]]` | Optional support modules: an `id`, the game `file` that receives it, a module `name`, and a `source` file under `src/`. |

Raw injections, for the moment no hook covers, are top-level `[[inject]]` tables in the same manifest: [Injections](/docs/modding/injections).

## Wasm code: [wasm]

`cargo horizon-mod build --wasm` writes this section. Don't write it by hand:

| Field | Rule |
| --- | --- |
| `sha512` | The SHA-512 of `mod.wasm`. The game refuses a file that doesn't match. |
| `toolchain` | The Rust toolchain it was built with. |
| `linked` | Optional: each dependency's id and the hash of the `mod.wasm` it was linked against. |

`mod.wasm` is at most 64 MiB.

## Dependencies

```toml
[dependencies]
base = "^1.2"
extra = { version = "^2", optional = true }
```

Each key is another mod's id, and each version a semver requirement on that mod's `horizon-mod.toml` version. A missing required dependency, an incompatible version or a cycle stops the game from starting, with the reason. An absent optional dependency is ignored. Content loads after the content it depends on.

## Java jars as a source of assets

A mod can use the assets and data of an original Java mod's jar without copying them:

```sh
cargo horizon-mod use-jar /path/to/original-mod.jar
```

adds a `[[jar]]` table with the jar's id, version and SHA-512. The jar stays outside the `.hmod`, and only its `assets/` and `data/` are read: no Java code runs. [Java jars as external assets](/docs/modding/how-to/content-mods#java-jars-as-external-assets) has the details.

## The icon

`icon.png` at the root is optional and has no manifest key: a square PNG, at most 512 × 512 pixels and 256 KiB.

## Limits

| What | Limit |
| --- | --- |
| A registry file, as downloaded | 64 MiB |
| Native source files | 511 files, 64 MiB unpacked |
| Content files | 65,536 files, 16 MiB each, 512 MiB in total |
| `icon.png` | 256 KiB, 512 × 512 pixels |

Next: [test it](/docs/test-a-mod).
