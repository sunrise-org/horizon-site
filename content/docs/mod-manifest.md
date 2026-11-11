# The manifest and the .hmod file

Every field of `horizon-mod.toml`, and what goes into the `.hmod`. The book's [Mod files](/docs/modding/reference/manifest) reference has the complete rules.

## One manifest per mod

- **Where:** `horizon-mod.toml`, at the root of the mod's folder.
- **What:** the mod's id, version and name, for data and code alike. `Cargo.toml`'s version is ignored.
- **Strict:** an unknown key is an error, so a typo never goes unnoticed.

## What goes in the .hmod

`cargo horizon-mod build` zips the folder into `target/horizon-mod/<id>.hmod`. The file has the same flat layout:

```text
my_mod.hmod
├── horizon-mod.toml
├── icon.png         optional
├── assets/my_mod/   when the mod has assets
├── data/my_mod/     when the mod has data
├── Cargo.toml       when the mod has Rust code
├── Cargo.lock       when that code uses crates.io crates
├── src/lib.rs       when the mod has Rust code
└── mod.wasm         when the code is built for the sandbox
```

The file holds what the mod has, and its manifest must agree with it:

- Rust code needs both `Cargo.toml` and a `[native]` section.
- `mod.wasm` needs a `[wasm]` section that names it.
- Anything else that runs is refused.

There is no folder named after the mod inside the file, and no second manifest.

## The fields every mod has

```toml
id = "my_mod"
name = "My mod"
version = "0.1.0"
description = "One or two sentences."
authors = ["You"]
license = "MIT"
homepage = "https://example.com"
issues = "https://example.com/issues"
api = "0.2"
side = "both"
capabilities = ["registries"]
```

| Field | Rule |
| --- | --- |
| `id` | 1 to 64 characters of `a-z`, `0-9` and `_`. Also the namespace of everything the mod adds. Keep it once published. |
| `name` | The name on the Mods screen. |
| `version` | Each published version needs a new one. |
| `description` | One or two sentences for the Mods screen. |
| `authors` | A list of names. |
| `api` | Exactly `"0.2"`. |
| `side` | `"client"`, the default, or `"both"`. |
| `capabilities` | `["registries"]`. |

**`side`:** a mod that adds blocks or runs on servers says `"both"`. Its id and version must then match between a server and its players.

**Optional fields:**

- `license`, `license_url`, `credits`, `homepage`, `issues` fill the Mods screen. Links must be `http` or `https`.
- `namespaces` lists more namespaces the mod's files use ([Namespaces](/docs/mod-data#namespaces)).

## Rust code: [native]

`cargo horizon-mod new --template native` writes this section. `cargo horizon-mod update` moves it to a newer game.

```toml
[native]
game = "26.3"
horizon = "<40-character Horizon commit>"
mixins = "<40-character horizon-mixins commit>"
```

| Field | Rule |
| --- | --- |
| `game` | The Minecraft version: `"26.3"`. |
| `horizon` | The exact game commit the mod builds against: 40 lowercase hex characters. |
| `mixins` | The exact horizon-mixins commit: 40 lowercase hex characters. |

- `[[native.module]]` adds optional support modules: an `id`, the game `file` that receives it, a module `name`, and a `source` file under `src/`.
- Raw injections, for the moment no hook covers, are top-level `[[inject]]` tables in the same manifest: [Injections](/docs/modding/injections).

## Sandboxed code: [wasm]

`cargo horizon-mod build --wasm` writes this section. Don't write it by hand.

| Field | Rule |
| --- | --- |
| `sha512` | The SHA-512 of `mod.wasm`. The game refuses a file that doesn't match. |
| `toolchain` | The Rust toolchain it was built with. |
| `linked` | Optional: each dependency's id and the hash of the `mod.wasm` it was linked against. |

`mod.wasm` is at most 64 MiB.

## Dependencies on other mods

```toml
[dependencies]
base = "^1.2"
extra = { version = "^2", optional = true }
```

- Each key is another mod's id.
- Each version is a semver requirement on that mod's `version`.
- A missing required mod, a wrong version or a cycle stops the game from starting, and says why.
- A missing optional mod is ignored.
- Data loads after the data it depends on.

## The icon

`icon.png` at the root, optional, with no manifest key: a square PNG, at most 512 × 512 pixels and 256 KiB.

## Limits

| What | Limit |
| --- | --- |
| A registry file, as downloaded | 64 MiB |
| Rust source files | 511 files, 64 MiB unpacked |
| Data and asset files | 65,536 files, 16 MiB each, 512 MiB in total |
| `icon.png` | 256 KiB, 512 × 512 pixels |

Next: [test your mod](/docs/test-a-mod).
