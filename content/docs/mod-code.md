# The typed mod API

Code in a mod is one Rust crate that implements `mod_api::Hooks`. The same source builds two ways: native, compiled into the game by the launcher, or to `mod.wasm`, which the game runs in its sandbox. This page explains the pieces and walks through a first native mod.

## How the typed API fits together

- **`Hooks`** tells the game which moments your mod handles. Each method is one hook point. Implement the ones you need and mark the block with `#[mod_api::horizon_mod]`: the mod is subscribed to exactly those methods.
- **`Host`** is how a hook reaches the game. Server hooks get a `ServerHost`, client hooks a `ClientHost`, so the compiler stops a server hook from calling something only the client has.
- **Events** carry what happened. A hook takes `&mut` to its event and changes it to change the outcome.
- **Handles** name game objects such as players, entities and levels. Their methods take the host.
- **Parts** attach behaviour to one block, item, fluid or other registered thing, beside the content it belongs to.
- **Attachments** keep your mod's own state on game objects, saved with the world when you give them a codec.

The book has the full account: [Trait mods, Parts and attachments](/docs/modding/concepts/trait-mods), [where the API is going](/docs/modding/concepts/design), and [Injections](/docs/modding/injections) for the rare moment no hook covers.

## Your first typed hook

Install the tool from the [quickstart](/docs/make-a-mod#install-the-tool), then make a native mod:

```sh
cargo horizon-mod new sunrise_hello --template native
cd sunrise_hello
```

The folder is flat. There is one manifest and one crate, and `assets/` and `data/` sit beside the code, ready for content:

```text
sunrise_hello/
├── horizon-mod.toml
├── Cargo.toml
├── src/lib.rs
├── assets/
└── data/
```

`horizon-mod.toml` has the same fields as a content mod's, plus `[native]`. The tool fills in the pins: the newest prebuilt game's commit, so the launcher downloads that game instead of building it.

```toml
id = "sunrise_hello"
name = "sunrise hello"
version = "0.1.0"
description = ""
authors = []
api = "0.2"
side = "both"
capabilities = ["registries"]

[native]
game = "26.3"
horizon = "f30cdea0606740b4915f51e70b61d066130694b8"
mixins = "5a64af938ec86b00d53d16a408aabc0038fb3e57"
```

Your commits will differ: these are the ones the tool wrote on 2026-11-11. The mod's id and version come from this file only, never from `Cargo.toml`.

`src/lib.rs` is the whole mod. It greets a player who joins:

```rust
use mod_api::{self, Hooks, PlayerLoggedInEvent, ServerHost, Text};

#[derive(Default)]
struct Mod;

#[mod_api::horizon_mod]
impl Hooks for Mod {
    /// A player joined the server (NeoForge's `PlayerLoggedInEvent`): greet them.
    fn player_logged_in(&self, host: &mut dyn ServerHost, event: &mut PlayerLoggedInEvent<'_>) {
        let line = format!("sunrise_hello says hello, {}!", event.name);
        if let Some(player) = host.player(event.player) {
            let _ = player.tell(host, Text::literal(line));
        }
    }
}
```

`host.player` turns the event's player id into a handle, and `tell` sends the message through the host. The greeting ignores what `tell` returns.

## Build it into a game

The launcher compiles the mod into the game of one instance:

```sh
horizon-launcher native-build . --instance Development --trust-native-code --profile developer
```

- `--instance` names the instance that will play the built game. The others are untouched.
- `--trust-native-code` is the decision the launcher asks players for in red: native code is not sandboxed and runs with full access to the computer. Build only code you trust.
- `--profile developer` compiles the game crate unoptimized, for faster rebuilds while you work. The choice is remembered for that instance.

**Crates from crates.io.** A mod may depend on registry crates of its own, but each one must be pinned in a `Cargo.lock` beside `Cargo.toml` before the launcher builds it. Make that lock with `horizon-launcher native-lock .` (`--update-lock` replaces existing pins), keep it in version control and ship it in the mod. Git and path dependencies are refused. The starter uses only the mod API, so it needs no lock until you add a crate: [The mod's crate](/docs/modding/how-to/native-mods/the-mods-crate) in the book has the rules.

Play that instance, join a world and read the greeting in chat. [What the launcher does](/docs/modding/how-to/native-mods/what-the-launcher-does) in the book describes the build step by step.

## Pack it as one file

```sh
cargo horizon-mod build
cargo horizon-mod check target/horizon-mod/sunrise_hello.hmod
```

`build` packs `horizon-mod.toml`, `Cargo.toml` and `src/` (and `Cargo.lock`, `assets/`, `data/` and `icon.png` when they hold something) into `target/horizon-mod/sunrise_hello.hmod`. It does not compile: the player's launcher does that. `check` reports it as a native mod and prints its pins:

```text
sunrise_hello 0.1.0 (native-mod, format native-1/<horizon commit>/<mixins commit>, for 26.3)
  native source: unsandboxed; not executed by the registry check.
```

## The same code as WebAssembly

`cargo horizon-mod build --wasm` builds the crate to `mod.wasm` and packs it in the `.hmod` with its source. A game with the same mod API runs it with no rebuild. Hooks, Parts and `[dependencies]` mean the same in both: [Building a mod to mod.wasm](/docs/modding/how-to/wasm-mods).

## Keep it building

A native mod targets one exact game commit. When the game moves on:

```sh
cargo horizon-mod update
```

repins the mod to the newest prebuilt game and reports hook signatures that changed before it writes anything. Fix what the compiler names, then build again. [Native mod source revisions](/docs/modding/how-to/native-mods/native-mod-source-revisions) explains the pins.

## Where to go next

- **Every hook, event and host method:** `cargo doc -p horizon-mod-api --open` in a checkout of the game, described in [the mod API reference](/docs/modding/reference/api).
- **A full example mod:** [horizon-machine-sample](https://github.com/arismoko/horizon-machine-sample).
- **Commands, config files, data files, sounds:** the [Native mods](/docs/modding/how-to/native-mods) chapters of the book.
- **An older mod built on `native_*` hook points:** [Legacy hook points](/docs/legacy-hook-points).

Next: [the manifest](/docs/mod-manifest).
