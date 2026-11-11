# How Sunrise is built

Who writes Sunrise, how each change is checked, and why it is safe to run. You can check every claim on this page in the repository.

## Who writes the code

- **Horizon**, the project Sunrise is forked from, was founded by Ludovic Marie.
- **Sunrise** is made by its team: Umut, Xmilon, Juan Luci, Ari, levzzz, Isloka and others, with outside contributors.
- **Much of the code is written with AI agents.** Some contributors write their code by hand.

Agents always say what they are:

- A pull request opened by an agent starts with "🤖 Opened by <login>'s AI agent (<tool, model>), not by <login> personally."
- Its comments start with "🤖 Agent:".
- Its commits name the agent in a `Co-Authored-By` line.

## How a change is checked

Not every line is read by a person. Instead, every change is checked against the real game, automatically.

### Harnesses

- A **harness** is a test that gives the same inputs to Sunrise and to the real Minecraft 26.3, then compares the results.
- There are {{HARNESSES}} of them, from world generation to mobs, redstone and commands.
- The [status table](/#parity) shows what they cover. Passing them all does not prove that nothing else differs.

### Checks on every pull request

- **`verify`** runs on GitHub's machines for every pull request and every change to main: formatting, lints with warnings treated as errors, the tests, and the check that no Minecraft files are committed. Main takes no change without it.
- **`parity`** runs the harnesses a change can affect, on a machine that holds a copy of Minecraft. For a pull request from a fork, it runs only once a maintainer has read the change.

### Releases

A release is published only when:

1. its smoke test passes: the game starts and draws a world, and
2. no issue is labelled `release-blocker`.

## Why it is safe to run

- **Open source.** All of the code is public on [GitHub](https://github.com/sunrise-org/horizon), under the MIT licence.
- **Built from the public code.** Releases are built by GitHub Actions from the public source. Every build log is [public](https://github.com/sunrise-org/horizon/actions/workflows/release.yml).
- **Signed checksums.** Every release has `SHA256SUMS`, a fingerprint of each download, and `SHA256SUMS.sig`, a signature of that list made with Sunrise's release key. The launcher and `horizon-server update` check both before they install anything.
- **Mods are off until you choose them.** A mod with code can do anything you can on your computer, so the launcher builds it only after a warning that names it, into a game of its own. See [Mods](/docs/mods).
- **Nothing collected unless you say yes.** Each kind of data has its own switch, all off by default. The one exception is an anonymous "I'm playing" ping for the player count. See [Privacy](/privacy).

> [!WARNING] Not signed by Apple or Microsoft yet
> The macOS app is not notarized and the Windows programs are not code-signed, so both systems may warn you the first time. [Install](/docs/install#download-the-launcher) shows what to click.

## What it does not contain

- **No Minecraft files.** Sunrise never ships or downloads Minecraft code, assets or data. The launcher builds the game files on your computer from your own copy of 26.3. A check on every pull request (`tools/check_public_tree.py`) keeps game files out of the repository.
- **No code from other mods.** Since 24 October 2026, the code may only be written from Minecraft 26.3 itself and public documentation, never from another mod, loader or renderer ([the rule](https://github.com/sunrise-org/horizon/blob/main/CONTRIBUTING.md#only-original-code)). That day shader packs were removed ([#1561](https://github.com/sunrise-org/horizon/pull/1561)) after a developer of Iris showed the code had been written from Iris's source. They are being written again from a description of the pack format only.

## Check it yourself

1. **Read the code.** [The source](https://github.com/sunrise-org/horizon), [the checks on every pull request](https://github.com/sunrise-org/horizon/actions/workflows/ci.yml) and [the release builds](https://github.com/sunrise-org/horizon/actions/workflows/release.yml).
2. **Compare the fingerprints.** Put a release's files and its `SHA256SUMS` in one folder, open a terminal there and run the line for your system. Each file should say `OK`.

   ```sh
   # Linux
   sha256sum -c SHA256SUMS --ignore-missing
   # macOS
   shasum -a 256 -c SHA256SUMS --ignore-missing
   ```

   On Windows, run `Get-FileHash <file>` in PowerShell and compare the result with the line in `SHA256SUMS`.

3. **Check the signature.** Download a whole release into a folder. Then, in a clone of the repository, run:

   ```sh
   cargo run -p horizon-release-sign -- verify --tag <tag> <folder>
   ```

   The public key is in `crates/horizon-release-sign/release-keys.txt`.

4. **Build it yourself.** The README explains how to [build from source](https://github.com/sunrise-org/horizon#build-from-source).
