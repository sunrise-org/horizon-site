# Test a mod

Three checks, in order: the file checker, your own unit tests, then the game. Each one catches a different kind of mistake.

## Check 1: the file

Pack the mod and read it the way the mod registry will:

```sh
cargo horizon-mod build
cargo horizon-mod check target/horizon-mod/my_mod.hmod
```

- **`build`** checks your data with the game's own rules. A block file with an unknown key fails here, not in a player's log.
- **`check`** reads the `.hmod`: its size and SHA-256, its manifest, its data and, for code, its pins. It runs nothing.

Useful options for `check`:

- `--json` prints the report as JSON, for scripts.
- `--key <public key> --signature <file>.minisig` also checks your signature ([Publish](/docs/publish-a-mod#step-2-sign-it-optional-recommended)).

It also reads `.hpack`, resource pack `.zip` and `.hshader` files.

## Check 2: unit tests

Code that doesn't call the game, such as formatting, maths or parsing a command's arguments, is ordinary Rust.

- Keep that logic in plain functions.
- Keep your hooks thin: they call those functions.
- Test them with `#[test]` and run:

```sh
cargo test
```

## Check 3: the game

### A mod with data only

```sh
cargo horizon-mod run
```

- It packs the mod and starts `horizon-client` with it turned on.
- Add `--game <path>` when `horizon-client` isn't on your `PATH`.
- Arguments after `--` go to the game.
- Using the launcher instead? See [Try it in the game](/docs/build-your-first-block#step-9-try-it-in-the-game).

**Try each of these:**

- Place each block, mine it with and without the right tool, and look at what drops.
- Make each recipe in a crafting table or furnace, and find it in the recipe book.
- Look at names and textures, in the inventory and in the world.
- Read the log, `logs/latest.log` in the game folder: a file the game can't read is logged and skipped.

> [!NOTE] Restart after each change
> The game reads mod files once, when it starts.

### A mod with Rust code

`cargo horizon-mod run` refuses a mod with code. Build it into a test instance instead:

```sh
horizon-launcher native-build . --instance Development --trust-native-code --profile developer
```

Then play that instance and trigger each hook and Part you wrote.

**Try each of these:**

- The **Mods** screen: your mod's row, its version, and its Config page if it has one.
- Every command: with no arguments, with good ones and with wrong ones.
- A single-player world and a server. A `side = "both"` mod must match on both: join with and without it, and read the refusal.
- Quit and start again, for a mod that keeps settings.

> [!WARNING] A panic stops the game
> Native code runs inside the game, so a panic in your code crashes it. Use `Option` and `Result` for what can go wrong, as the host's methods do.

### The same code in the sandbox

Build it with `cargo horizon-mod build --wasm` and test that file on its own. It is the same source, but it crosses a sandbox boundary the native build doesn't have.

## On a dedicated server

A dedicated server runs native code from a standalone engine export, not from an instance.

- [Developer acceptance workflow](/docs/modding/how-to/native-mods/developer-acceptance-workflow) sets up scratch folders and runs one.
- [Standalone server export](/docs/modding/how-to/native-mods/standalone-server-export) explains the export.

## Against a game you built yourself

To test against game source you changed, install your checkout as a local unsigned developer base and pin an instance to it: [A local unsigned developer base](/docs/modding/how-to/native-mods/local-developer-builds).

Next: [publish it](/docs/publish-a-mod).
