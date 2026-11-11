# Test a mod

Three checks catch three kinds of problem: the package checker reads the file as the registry will, unit tests cover your own logic, and the game shows what players will see. Run them in that order.

## Check the file

Pack the mod and run the registry's checks on the result:

```sh
cargo horizon-mod build
cargo horizon-mod check target/horizon-mod/my_mod.hmod
```

`build` validates content with the same checks as the game, so a block file with an unknown key fails here and not in a player's log. `check` then reads the `.hmod` as the registry does: its size and SHA-256, its manifest, its content, and for code its pins. It runs nothing.

- `--json` prints the report as JSON, for scripts.
- `--key <public key> --signature <file>.minisig` also checks your signature ([Publish](/docs/publish-a-mod#sign-it)).

It reads `.hmod`, `.hpack`, resource pack `.zip` and `.hshader` files.

## Unit tests for your logic

Code that doesn't call the game (formatting, maths, parsing a command's arguments) is ordinary Rust. Keep it in plain functions, keep the hooks thin, and test it with `#[test]`:

```sh
cargo test
```

## In the game

**A content mod:**

```sh
cargo horizon-mod run
```

builds the `.hmod` and starts `horizon-client` with it turned on (`--game <path>` when the client isn't on your `PATH`). Arguments after `--` go to the game. The game reads content once at start: run it again after an edit.

Things to try:

- Each block: place it, mine it with and without the right tool, and look at what it drops.
- Each recipe in a crafting table or furnace, and in the recipe book.
- The names and textures, in the inventory and in the world.
- The log (`logs/latest.log` in the game folder): a file the game can't read is logged and skipped.

**A native mod:**

```sh
horizon-launcher native-build . --instance Development --trust-native-code --profile developer
```

then play that instance and trigger each hook and Part you wrote. Things to try:

- The **Mods** screen: your mod's row, its version and its Config page when it has one.
- Every command, with no arguments, with good ones and with wrong ones.
- A single-player world and a server. A `side = "both"` mod must match between them: join with and without it, and read the refusal.
- Quitting and starting again, for a mod that keeps settings.

A native mod runs inside the game, so a panic in your code stops the game. Use `Option` and `Result` for what can go wrong, as the host's methods do.

**A wasm mod:** build it with `cargo horizon-mod build --wasm` and test that file separately. It is the same source, but it crosses a sandbox boundary a native build doesn't have.

## On a server

A dedicated server runs native mods from a standalone engine export, not from an instance. The book's [developer acceptance workflow](/docs/modding/how-to/native-mods/developer-acceptance-workflow) sets up scratch folders and runs one, and [Standalone server export](/docs/modding/how-to/native-mods/standalone-server-export) explains the export.

## Against a game you built yourself

To test against game source you changed, install your checkout as a local unsigned developer base and pin an instance to it: [A local unsigned developer base](/docs/modding/how-to/native-mods/local-developer-builds).

Next: [publish it](/docs/publish-a-mod).
