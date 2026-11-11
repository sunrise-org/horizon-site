# Add code to your mod

Give a mod behaviour with Rust: a hook that greets each player who joins. The code sits in the same folder as your blocks and items, and ships in the same `.hmod`.

## What you will make

A mod that, when a player joins, says in chat:

```text
sunrise_hello says hello, Steve!
```

On the way you meet the five ideas every code mod uses: **hooks, events, the host, handles and Parts.**

## Before you start

- You have done the [quickstart](/docs/make-a-mod): Rust and `cargo horizon-mod` are installed.
- You have **Ari's launcher**, built from [Ari's repository](https://github.com/arismoko/horizon): it compiles your code into the game. The book's [Installing and using mods](/docs/modding/start/installing) shows how to get it and prepare a game.
- You know a little Rust. If not, [the Rust book](https://doc.rust-lang.org/book/)'s first chapters are enough.

## Step 1: Make the project

In your terminal, in your projects folder:

```sh
cargo horizon-mod new sunrise_hello --template native
cd sunrise_hello
```

`--template native` adds the Rust files. The folder looks like this:

```text
sunrise_hello/
├── horizon-mod.toml   the manifest, with a [native] section
├── Cargo.toml         the Rust project
├── src/lib.rs         your code
├── assets/            empty, ready for models and textures
└── data/              empty, ready for blocks and items
```

> [!TIP] Already have a mod with blocks?
> Copy its `assets/` and `data/` folders into this one, and its `id`, `name` and `version` into this manifest. Now one mod has both.

## Step 2: Read the manifest

**File:** `horizon-mod.toml`

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

- The top is the same as for a mod with only data.
- `[native]` says "this mod has Rust code".
- `horizon` and `mixins` are **pins**: the exact game build the code is made for. The tool picked the newest prebuilt game, so the launcher can download it instead of building it.
- Your pins will differ: these are the ones the tool wrote on 2026-11-11.

The mod's id and version come from this file only, never from `Cargo.toml`.

## Step 3: Read Cargo.toml

**File:** `Cargo.toml`

```toml
[package]
name = "mod-sunrise_hello"
version = "0.1.0"
edition = "2024"

[dependencies]
horizon-mod-api = { git = "https://github.com/arismoko/horizon", rev = "<your horizon pin>" }
```

- It is an ordinary Rust project.
- Its one dependency is the mod API, at the same commit as your pin.
- You rarely edit it. To add a crate from crates.io, see [Use other crates](#use-other-crates) below.

## Step 4: Read the code

**File:** `src/lib.rs`

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

Line by line:

1. `struct Mod;` is your mod. It holds nothing yet.
2. `impl Hooks for Mod` lists the moments your mod reacts to. Each method is one **hook**.
3. `#[mod_api::horizon_mod]` subscribes the mod to exactly the hooks in that block, and no others.
4. `player_logged_in` is the hook for "a player joined".
5. `event` is the **event**: what happened. `event.name` is the player's name, `event.player` their id.
6. `host` is the **host**: your way to reach the game. A server hook gets a `ServerHost`.
7. `host.player(event.player)` turns the id into a **handle**, an object for that player. It returns `None` if the player is gone.
8. `player.tell(host, …)` sends them a chat message. `let _ =` ignores whether it worked.

## Step 5: Build it into a game

The launcher compiles your mod into the game, for one **instance** (one of the launcher's game setups).

1. Make a test instance once, so your other worlds stay untouched:

   ```sh
   horizon-launcher instance create Development
   ```

2. Build the mod into it, from your mod's folder:

   ```sh
   horizon-launcher native-build . --instance Development --trust-native-code --profile developer
   ```

What each part means:

- `.` is "the mod in this folder".
- `--instance Development` is the instance that will play the build. Your other instances never run it.
- `--trust-native-code` is your yes to the launcher's warning. Native code is not sandboxed: it can do anything you can on your computer. Build only code you trust.
- `--profile developer` builds the game unoptimized, so rebuilds are faster while you work. The launcher remembers it for that instance.

> [!NOTE] The first build is slow
> It may download a prebuilt game and Rust's tools first. After that, a change to your mod rebuilds in much less time.

> [!TIP] Command not found?
> `horizon-launcher` is the launcher program itself. If your terminal does not find it, run it by its full path, from the folder the launcher is installed in.

## Step 6: Try it

1. In the launcher, pick the **Development** instance and press **Play**.
2. Open a world.
3. Read the chat: `sunrise_hello says hello, <your name>!`

**Change it:** edit the text in `format!(...)`, run the `native-build` line again and replay. That loop, edit, build, play, is how you work on a code mod.

## Step 7: Pack it as one file

```sh
cargo horizon-mod build
cargo horizon-mod check target/horizon-mod/sunrise_hello.hmod
```

- `build` packs the manifest, `Cargo.toml`, `src/`, and `assets/`, `data/`, `Cargo.lock` and `icon.png` when they hold something.
- It does **not** compile: each player's launcher compiles the source.
- `check` reports a mod with code and prints its pins:

```text
sunrise_hello 0.1.0 (native-mod, format native-1/<horizon commit>/<mixins commit>, for 26.3)
  native source: unsandboxed; not executed by the registry check.
```

## The five ideas, in one place

- **Hooks:** the moments the game lets your code run. Each is a method of `Hooks`. Implement the ones you need.
- **Events:** what happened. A hook gets `&mut` to its event, and changing the event changes the outcome.
- **Host:** how a hook reaches the game. Server hooks get a `ServerHost`, client hooks a `ClientHost`, so the compiler stops a server hook from calling client-only code.
- **Handles:** names for game objects, such as a player, an entity or a level. Their methods take the host.
- **Parts:** behaviour attached to one block, item or fluid, beside the data that defines it. Next to them, **attachments** keep your own state on game objects, saved with the world.

The reference book explains each: [Trait mods, Parts and attachments](/docs/modding/concepts/trait-mods).

## Find the other hooks

In a checkout of Ari's repository, this opens the API's documentation, with every hook, event and host method:

```sh
cargo doc -p horizon-mod-api --open
```

The book's [mod API reference](/docs/modding/reference/api) says more. For a full example mod, read [horizon-machine-sample](https://github.com/arismoko/horizon-machine-sample).

## Use other crates

A mod may depend on crates from crates.io, with one rule: each one must be pinned in a `Cargo.lock` beside `Cargo.toml`.

1. Add the crate to `[dependencies]` in `Cargo.toml`.
2. Make the lock:

   ```sh
   horizon-launcher native-lock .
   ```

3. Keep `Cargo.lock` in the folder: it ships in the `.hmod`.

- `--update-lock` replaces pins you made before.
- Git and path dependencies are refused.
- The book's [The mod's crate](/docs/modding/how-to/native-mods/the-mods-crate) has the rules.

## Build it for the sandbox instead

```sh
cargo horizon-mod build --wasm
```

builds the same crate to `mod.wasm` and packs it with its source. A game with the same mod API runs it in its sandbox, with no rebuild of the game. Hooks and Parts mean the same: [Building a mod to mod.wasm](/docs/modding/how-to/wasm-mods).

## Keep it building

Your mod targets one exact game build. When the game moves on:

```sh
cargo horizon-mod update
```

- It repins the mod to the newest prebuilt game.
- It reports the hooks whose signatures changed before it writes anything.
- Then build again and fix what the compiler names.

[Native mod source revisions](/docs/modding/how-to/native-mods/native-mod-source-revisions) explains the pins.

## Where to go next

- Test it properly: [Test a mod](/docs/test-a-mod).
- Every manifest field: [The manifest](/docs/mod-manifest).
- Commands, config files, sounds and more: the [Native mods](/docs/modding/how-to/native-mods) chapters of the book.
- The rare moment no hook covers: [Injections](/docs/modding/injections).
