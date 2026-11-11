# Legacy native mods (.hnmod)

> **Legacy.** This is the mixin-bundle workflow of released Sunrise. New mods use one `.hmod` and the typed API: start at [Make a mod](/docs/make-a-mod). To move an old mod over, see [Migrating](/docs/what-changed#migrating-an-hnmod-mod).

A released Sunrise native mod is a bundle for horizon-mixins, shipped as a `.hnmod` file. This page keeps its setup, test and packaging steps for people who maintain one.

## Two kinds of mod

| | Content mod | Native mod |
| --- | --- | --- |
| **What it is** | Data and assets: blocks, items, recipes, loot tables, tags, models, textures, names, structures | Rust code that hooks into the game: a HUD, keys, commands, settings, new behaviour |
| **File** | `.hmod` | `.hnmod` |
| **Code** | None | Rust, compiled into the game |
| **How players get it** | The game reads it when it starts | The launcher compiles a game with it, for the instance it is installed in |
| **Safety** | Data only: it can't run anything | Not sandboxed: it can do anything the player can on their computer |

**Pick a content mod** when what you add is a block, an item, a recipe or a structure: no compiler, and it works on every computer as it is. [Content mods](/docs/content-mods) has the whole guide.

**Pick a native mod** when the mod has to do something: draw on the screen, react to a key, add a command, change how the game plays. The rest of this page and the two after it are about native mods.

A Sunrise mod is not a Java mod. Fabric, NeoForge and Forge jars don't run in Sunrise, and Sunrise mods don't run in Java Minecraft. What carries over from a Java mod is its data and assets ([modpacks](/docs/modpacks)).

## How a native mod works

A native mod is a **bundle** for [horizon-mixins](https://github.com/sunrise-org/horizon-mixins), a tool made for Sunrise: a manifest, `horizon-mixin.toml`, and a few `.rs` files. Before the game is compiled, horizon-mixins adds your code to Sunrise's own source and calls it from the places the manifest names. The result is an ordinary Sunrise game with your mod built in.

Sunrise keeps a set of **hook points** for this: empty functions the game calls at fixed places (every tick, every frame, when it draws the HUD, when a key goes down, when the player types a command, when Options > Mods lists the mods), and helpers to read the player, draw text and keep settings. A mod that hooks only these builds on every later version of Sunrise too, so it doesn't need a new release for each Nightly. Sunrise's own Zoom, FPS Counter, Keystrokes and Minimap are made this way.

There is a second way to write the code, the [typed API](/docs/legacy-hook-points#the-typed-api): one Rust crate that implements a trait, with a method for each hook point and a typed event for each. Nightlies since 2026-11-03 have it. This guide's example uses helpers, which work on every release.

Players never compile anything by hand. They install the mod from the launcher's Mods page, and the launcher compiles the game with it, with its own copy of Rust ([below](#what-players-see)).

## The path

1. **Set up** (this page): the tools, the files of a native mod, and your mod in the game.
2. **[The bundle](/docs/legacy-bundle)**: the manifest, what a mod builds on, and the `.hnmod` file.
3. **[Hook points and helpers](/docs/legacy-hook-points)**: what your code can hook and call, and a worked example.
4. **[Content mods](/docs/content-mods)**: blocks, items, recipes and textures from data files, with no code at all.
5. **[Test it](/docs/test-a-mod)**: unit tests, a check against Sunrise's source, and the game with your mod in it.
6. **[Publish it](/docs/publish-a-mod)**: package it and submit it to the registry.

## Install the tools

For a native mod you need:

- **[Rust](https://rustup.rs)**, the stable toolchain, and **Git**.
- **Python 3.11** or later, and `rsync` (on Windows, use WSL for the checks below).
- **[sunrise-org/horizon-mods](https://github.com/sunrise-org/horizon-mods)**, the registry's repository. Its `native/tools/native.py` applies your bundle to Sunrise's source, checks and builds the game with it, and packages the `.hnmod`. It is what Sunrise's own native mods use.
- **The launcher**, a current one ([Install](/docs/install)): 0.2.37 or later builds [typed mods](/docs/legacy-hook-points#the-typed-api) too. Prepare the game at least once, to play with your mod.

```sh
git clone https://github.com/sunrise-org/horizon-mods
```

## The files of a native mod

The guide's example, [Playtime](/docs/legacy-hook-points#a-worked-example-playtime), shows how long you have played in a corner of the screen. Its folder:

```
playtime/
├── Cargo.toml                  runs the mod's unit tests: cargo test
├── compatibility.json          the hook points it needs, and the commits it was tested on
└── mixins/playtime/
    ├── horizon-mixin.toml      the manifest: its id, its version, what it hooks
    ├── runtime.rs              the mod's own code: becomes the module crate::game::playtime
    ├── tick.rs                 one small helper for each hook it uses
    ├── hud.rs
    └── …
```

Start from the example, or copy one of Sunrise's own mods from [horizon-mods' `native/` folder](https://github.com/sunrise-org/horizon-mods/tree/main/native): `fps-overlay` is the smallest. [horizon-native-mod-template](https://github.com/sunrise-org/horizon-native-mod-template) shows the other way, a mod that hooks one of the game's own functions instead of a hook point ([the bundle](/docs/legacy-bundle#hook-points-or-a-pinned-commit) says what that costs).

## Check it against Sunrise

From your clone of horizon-mods, give `native.py` the path to your mod's folder:

```sh
cd horizon-mods
python3 native/tools/native.py check /path/to/playtime
```

It downloads Sunrise's source at the commit your `compatibility.json` names (once), applies your bundle with horizon-mixins, and runs `cargo check` on the game. A mistake in your manifest is a horizon-mixins error; a mistake in your code is an ordinary Rust error, with the file and line. The first run compiles Sunrise's dependencies and takes several minutes; later ones take seconds to a minute.

## See it in the game

The launcher builds a game with your mod from its folder:

```sh
horizon-launcher native-build /path/to/playtime/mixins/playtime --trust-native-code
```

It compiles the game with the launcher's own Rust, for the instance picked in the launcher (`--instance NAME` picks another), and that instance then plays the built game: press **Play**. The first build downloads Rust and takes 20 to 30 minutes; after a change to your mod, the next build compiles only what changed, a few minutes.

**While you work on a mod**, run `horizon-launcher settings native-profile dev` once, or pick **Dev build** in the Mods page's native build row. It compiles the game unoptimized: a change to your mod rebuilds about six times faster, and the game runs up to about twice as slow. Switch back to `performance` to play.

`--trust-native-code` is the same decision the launcher asks players for in red: the mods run with full access to the computer. Build only code you trust.

## What players see

A player installs a native mod from the launcher's Mods page into the instance picked on the left. The first time, the launcher says once that native mods aren't sandboxed and compile into a game of their own (the first build downloads Rust and can take 20 to 30 minutes). The Mods page then has a **Native build of {instance}** row: the player presses **Build**, reads the red warning that names the mods, and builds with **I trust these mods: build**. That instance then plays the built game. Native mods are always on in the launcher: there is no setting to turn them on.

In the game, **Options > Mods** lists the mod with a switch and, when the mod has some, a **Settings** page and keys to rebind. A mod's settings live in `horizon-mods/.horizon-mod-data/<id>/` in the game folder, one file per setting.

## Test a bundle


### Unit tests for your logic

Code that doesn't call the game (formatting, maths, parsing a command's arguments) is ordinary Rust in your module. Keep it there, keep the helpers thin, and test it with `#[test]`, as [Playtime](/docs/legacy-hook-points#a-worked-example-playtime) does with its `format` function. The mod's `Cargo.toml` makes the module a library, so the tests run on your computer, with no game:

```sh
cargo test
```

### Check it against Sunrise

From your clone of [horizon-mods](https://github.com/sunrise-org/horizon-mods):

```sh
python3 native/tools/native.py check /path/to/playtime
python3 native/tools/native.py check /path/to/playtime --horizon latest
```

`check` downloads Sunrise's source at the commit in your `compatibility.json`, applies your bundle with horizon-mixins and runs `cargo check` on the game, with warnings as errors. It fails when the source has fewer hook points than your mod needs, when horizon-mixins refuses the bundle (a wrong target or binding, with the reason in one line), and on any Rust error in your code. `--horizon latest` does the same on the newest Nightly, and `--horizon <commit>` on any commit: run it when a Nightly comes out, to know your mod still builds before players find out.

Several mods at once, as a player's set is built:

```sh
python3 native/tools/native.py check /path/to/playtime zoom fps-overlay
```

### In the game

```sh
python3 native/tools/native.py build /path/to/playtime
```

builds the game with your mod (Sunrise's `fast` profile) and prints where it is. Start it with `--resources` pointing at prepared game files: each version the launcher installed has them in its `.local/horizon-client/26.3` folder. Or build with the launcher, as players do, and play the instance it builds for (the one picked in the launcher, or `--instance NAME`):

```sh
horizon-launcher native-build /path/to/playtime/mixins/playtime --trust-native-code
```

Things to try each time:

- **Options > Mods**: your row, its switch and its settings page. Turn the mod off: it must do nothing until it is on again.
- Every command, with no arguments, with good ones and with wrong ones.
- The title screen and a world, single player and a server: `native_player()` is `None` outside a world, and in single player the server's game ticks too.
- Quitting and starting again, for a mod that keeps settings.
- F1 (no HUD) and F3 (the debug screen takes the top-left corner).

A native mod runs inside the game, so a panic in your code stops the game. Use `Option` and `Result` for what can go wrong, as the helpers do.

## Package a native mod

From your clone of [horizon-mods](https://github.com/sunrise-org/horizon-mods):

```sh
python3 native/tools/native.py check /path/to/playtime
python3 native/tools/native.py package /path/to/playtime
```

`package` writes `native/target/<id>-<version>.hnmod` and prints its size and SHA-256. It holds `horizon-native.json`, made from your `compatibility.json`, and your bundle's `.rs` and `.toml` files. `horizon-mixin.toml` and `compatibility.json` must name the same Sunrise commit: `package` refuses the mod when they don't. The same files always give the same `.hnmod`, so anyone can make it again from your source and compare.

Before you submit a native mod, build it on the Sunrise players play: `native.py check --horizon latest` for the newest Nightly ([Test a mod](/docs/legacy-native-mods#check-it-against-sunrise-2)).

Next: [the bundle](/docs/legacy-bundle).
