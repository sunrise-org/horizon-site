# Publish a mod

Take your `.hmod` from your computer to the mod registry, where players find it at [playsunrise.net/mods](/mods) and on the launcher's Mods page. A person reviews every project before it is published.

## Step 1: Get the file ready

1. **Set a new version.** Change `version` in [`horizon-mod.toml`](/docs/mod-manifest). Each published version needs a new one, and a published file never changes.
2. **Build it:**

   ```sh
   cargo horizon-mod build
   ```

   This writes `target/horizon-mod/<id>.hmod`, whatever the mod holds. Add `--wasm` for a sandboxed build.

3. **Rename it** to `<id>-<version>.hmod`, such as `ruby-1.0.0.hmod`. The form reads the id and version from the name.
4. **Check it:**

   ```sh
   cargo horizon-mod check ruby-1.0.0.hmod
   ```

   It must pass. See [Test a mod](/docs/test-a-mod#check-1-the-file).

5. **Publish the source.** Put it in a public repository, under a licence players may use: MIT, Apache-2.0, GPL and so on, as an [SPDX](https://spdx.org/licenses/) name. Reviewers read it, and the file must be built from it.

> [!TIP] Shader packs
> A shader pack in Sunrise's own format is packed with `horizon-shader pack <folder>`, which writes `<id>-<version>.hshader` ([the format](/docs/api/shaders)). The rest of this page is the same.

## What the registry accepts today

- **A mod with data only:** yes, through the form below.
- **A mod with Rust code:** not through the form yet. The form only knows code mods in their [legacy format](/docs/legacy-native-mods#package-a-native-mod).

Until the form learns the single `.hmod`, publish a code mod as a release of your own repository, and say in its README which game commit it pins. Ari's registry already takes them: [Publishing your mod](/docs/modding/how-to/publish) in the reference book.

## Step 2: Sign it (optional, recommended)

A signature proves a file is yours. Once your project has a public key, every later version must be signed with it, so nobody else can publish an update in your name, even with your GitHub account.

Sunrise uses [minisign](https://jedisct1.github.io/minisign/).

1. **Install minisign:** `brew install minisign` on macOS, `scoop install minisign` on Windows, or your Linux distribution's package.
2. **Make a key pair, once:**

   ```sh
   minisign -G -p horizon-mods.pub -s horizon-mods.key
   ```

   Your public key is the last line of `horizon-mods.pub`. It starts with `RW`.

3. **Sign each file you publish, and check it:**

   ```sh
   minisign -S -s horizon-mods.key -m ruby-1.0.0.hmod
   cargo horizon-mod check ruby-1.0.0.hmod --key "RW…your public key…" --signature ruby-1.0.0.hmod.minisig
   ```

   The report then says "signature verified".

> [!WARNING] Keep the secret key safe
> Keep `horizon-mods.key` and its password private and backed up. If you lose it, the project's key can only be changed by hand, through the registry's maintainers.

## Step 3: Fill in the form

Open [playsunrise.net/mods/submit](/mods/submit) and sign in with GitHub. The page reads only your public profile.

- **The file:** the kind (mod or shader pack), the file, its id and version, the Minecraft version (26.3) and what changed.
- **Its page:** the name, a one-line summary, a description in Markdown, the authors, the licence, the source address and, optionally, a square PNG icon of at most 256 KiB.
- **Signature:** your public key, for a new project, and the file's `.minisig`.

Press **Submit for review**. It checks the file again and opens a pull request in [sunrise-org/horizon-mods](https://github.com/sunrise-org/horizon-mods) that adds `mods/<id>.toml`, with you as the project's owner. The repository's checks run `cargo horizon-mod check` again and post the report.

## Step 4: Review

- A reviewer reads the pull request, your source and the report.
- Questions come as comments on the pull request. Answer them there.
- If the file must change, submit a new version from the form.
- Code is read line by line, since it runs with the player's rights. Say in the description what the mod does and what it doesn't.

When the pull request is merged, the file becomes a release of horizon-mods within minutes. Your project gets a page at `playsunrise.net/mods/<id>` with its source, licence and SHA-256, and shows in the launcher.

## Updates

- Use the same form with a new version.
- The project's owners publish updates of a mod with data only without another review. Every version of a mod with code is read again.
- If the project has a key, the new file must be signed with it.

Without the form, you can open the pull request by hand: the [horizon-mods README](https://github.com/sunrise-org/horizon-mods) says how. The registry's file formats are in [the mod index reference](/docs/api/mod-index).

## Reports and takedowns

Anyone can report a project from its page, with **Report it**. A project that does harm is taken down: the launcher then refuses its files and turns installed copies off, telling players why.
