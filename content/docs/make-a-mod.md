# Make a mod

A mod is one project folder with one manifest, `horizon-mod.toml`, and it ships as one file, `<id>.hmod`. That is true whether it adds a block from data files, runs Rust code in the game, or both. This page gets the tool installed and points you at the first thing to build.

## One mod, one file

| Kind | What the folder holds | How it runs |
| --- | --- | --- |
| **Content** | `horizon-mod.toml`, `assets/`, `data/` | The game reads it when it starts. Nothing compiles. |
| **Native** | The same, plus `Cargo.toml` and `src/lib.rs` | The launcher compiles the Rust into the game for one instance. |
| **WebAssembly** | The same source, built to `mod.wasm` | The game runs it in its sandbox, with no rebuild of the game. |

Native and WebAssembly mods are written against the same API, `mod_api`. A mod with code can carry blocks and items in the same folder: there is no second file for the code and no second manifest. The older split between `.hmod` content and `.hnmod` native bundles is [legacy](/docs/what-changed#migrating-an-hnmod-mod).

A Sunrise mod is not a Java mod. Fabric, NeoForge and Forge jars don't run, and Sunrise mods don't run in Java Minecraft. What carries over from a jar is its data and assets ([modpacks](/docs/modpacks)).

## Which build these guides follow

The guides follow the mod API on [Ari's Horizon](https://github.com/arismoko/horizon), where it is developed. They were checked against commit [`514ecf9`](https://github.com/arismoko/horizon/tree/514ecf9a966cdf2bc4f81f091827d81767756fd9) on 2026-11-11: the templates, commands and launcher steps were compared with that commit's source and documentation. `new`, `build` and `check` were last run for both examples at [`8fbf4ba`](https://github.com/arismoko/horizon/tree/8fbf4ba61b5a4676b606337ead882e4a003d447d), and their output is quoted as printed then; the tool's commands and output did not change between the two. The API is still moving: [What changed](/docs/what-changed) keeps track, and the [modding book](/docs/modding) is that repository's own documentation, copied at the same commit.

Released Sunrise is older and still installs `.hnmod` bundles. If you maintain one, its pages are under [Legacy](/docs/legacy-native-mods).

## Install the tool

You need [Rust](https://rustup.rs) and Git. `cargo horizon-mod` makes, packs and checks mods:

```sh
cargo install --locked --git https://github.com/arismoko/horizon cargo-horizon-mod
```

It builds from source in a few minutes. Run the same command again later to update it. To get exactly the tool these pages were checked with, add `--rev 514ecf9a966cdf2bc4f81f091827d81767756fd9`.

A content mod needs nothing else to build. To play it, and to build a native mod, you also need Ari's launcher and a prepared game: [Installing and using mods](/docs/modding/start/installing) in the book covers both.

## Pick a first mod

- **[Build your first block](/docs/build-your-first-block)**: a content mod. Data and assets only, about ten minutes.
- **[Your first typed hook](/docs/mod-code#your-first-typed-hook)**: a native mod. One Rust file that greets a player.

## The commands

All of them run in the mod's folder.

| Command | What it does |
| --- | --- |
| `cargo horizon-mod new <path> [--name "Name"]` | A content mod from the template: a manifest and one block with its model, loot table and recipe. |
| `cargo horizon-mod new <path> --template native` | A native mod: `horizon-mod.toml` with `[native]`, `Cargo.toml` and `src/lib.rs`. It pins the newest prebuilt game, so the launcher downloads the game instead of building it. `--horizon <commit>` pins another. |
| `cargo horizon-mod build` | Checks the project and packs it into `target/horizon-mod/<id>.hmod`. It does not compile code. `--wasm` builds the Rust to `mod.wasm` first. |
| `cargo horizon-mod run [--game <horizon-client>]` | Builds, then starts the game with the mod turned on. |
| `cargo horizon-mod check <file>` | Runs the registry's checks on a `.hmod`. `--json` prints JSON. |
| `cargo horizon-mod update [--horizon <commit>]` | Moves a native mod's pins to a newer game. |

## The path

1. **[Build your first block](/docs/build-your-first-block)**: the content tutorial.
2. **[The typed mod API](/docs/mod-code)**: hooks, the host, Parts and a first native mod.
3. **[The manifest](/docs/mod-manifest)**: every field of `horizon-mod.toml` and what goes in the `.hmod`.
4. **[Test a mod](/docs/test-a-mod)**: the checker, unit tests and the game.
5. **[Publish a mod](/docs/publish-a-mod)**: sign it and submit it.

Next: [build your first block](/docs/build-your-first-block).
