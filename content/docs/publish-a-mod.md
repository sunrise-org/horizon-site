# Publish a mod

Sunrise's registry lists mods, modpacks, resource packs and shader packs made for Sunrise. Players find them at [playsunrise.net/mods](/mods) and on the launcher's Mods page, which checks every file before it installs it. Each project is reviewed by a person before it is published. This page takes your mod from a file on your computer to the registry.

## Before you submit

1. **Choose a version.** Set `version` in [`horizon-mod.toml`](/docs/mod-manifest). Every version you publish needs a new one, and a published file never changes.
2. **Make the file.** `cargo horizon-mod build` writes `target/horizon-mod/<id>.hmod`. It is the same command and the same kind of file for a content mod, a native mod and a wasm mod (`--wasm`). A shader pack in Sunrise's own format: `horizon-shader pack <folder>` writes `<id>-<version>.hshader` ([the format](/docs/api/shaders)).
3. **Name it.** The form reads the id and version from the file name: rename the file to `<id>-<version>.hmod`, such as `ruby-1.0.0.hmod`.
4. **Check it.** `cargo horizon-mod check <file>` must pass ([Test a mod](/docs/test-a-mod#check-the-file)).
5. **Publish the source.** Put the mod's source in a public repository, under a licence that lets players use it (MIT, Apache-2.0, GPL and so on, as an [SPDX](https://spdx.org/licenses/) name). Reviewers read it, and the file must be made from it.

## What the registry accepts today

- **Content mods** as `.hmod`: yes.
- **Mods with code** as `.hmod`: not through this form yet. It files every `.hmod` as a content mod, and files only the older `.hnmod` bundle as a native mod ([Legacy](/docs/legacy-native-mods#package-a-native-mod)). Until the form learns the unified file, publish the `.hmod` as a release of your own repository and say in its README which game commit it pins. Ari's registry takes native `.hmod` files: [Publishing your mod](/docs/modding/how-to/publish) in the book.

## Sign it

Signing is optional and recommended. When your project has a public key, every later version must be signed with the matching secret key, so nobody else can publish an update in your name, even with access to your GitHub account.

Sunrise uses [minisign](https://jedisct1.github.io/minisign/) signatures. Install minisign (`brew install minisign`, `scoop install minisign`, or your Linux distribution's package), then make a key pair once:

```sh
minisign -G -p horizon-mods.pub -s horizon-mods.key
```

Keep `horizon-mods.key` and its password private and backed up: losing it means changing the project's key by hand, through the registry's maintainers. The public key is the last line of `horizon-mods.pub` (it starts with `RW`).

Sign each file you publish, and check the signature as the registry will:

```sh
minisign -S -s horizon-mods.key -m ruby-1.0.0.hmod
cargo horizon-mod check ruby-1.0.0.hmod --key "RW…your public key…" --signature ruby-1.0.0.hmod.minisig
```

The report then says "signature verified".

## Submit it

Open [playsunrise.net/mods/submit](/mods/submit) and sign in with GitHub. The page reads only your public profile. Then fill in:

- **The file**: the kind (mod or shader pack), the `.hmod` or `.hshader`, its id (the manifest's `id`), its version, the Minecraft version (26.3) and what changed.
- **Its page**: the name, a one-line summary for the list, a description (Markdown), the authors, the licence, the source address and, optionally, a square PNG icon (at most 256 KiB).
- **Signature**: your public key (for a new project) and the file's `.minisig`.

**Submit for review** checks the file again and opens a pull request in [sunrise-org/horizon-mods](https://github.com/sunrise-org/horizon-mods). It adds `mods/<id>.toml`, with you as the project's owner. The repository's checks run `cargo horizon-mod check` on the file again and post their report on the pull request.

## Review and publication

A reviewer reads the pull request, your source and the checks' report. Questions and requests for changes come as comments on the pull request: answer them there, and submit a new version from the form when the file must change. A mod with code is read line by line, since native code runs with the player's rights: its description should say what it does and what it doesn't.

When the reviewer merges it, the file becomes a release of horizon-mods within minutes, and the project gets its page at `playsunrise.net/mods/<id>` and shows in the launcher. The page shows your source, licence and the file's SHA-256.

## Updates

An update is the same form with a new version: it adds the version to your project's entry. The project's owners publish updates of a content mod without a reviewer's extra look; every version of a mod with code is read again. If the project has a key, the new file must be signed with it.

Without the form, you can open the pull request by hand: the [horizon-mods README](https://github.com/sunrise-org/horizon-mods) says how. The registry's file formats are in [the mod index reference](/docs/api/mod-index).

## Reports and takedowns

Anyone can report a project from its page (**Report it**). A project that does harm is taken down: the launcher then refuses its files and turns installed copies off, telling players why.
