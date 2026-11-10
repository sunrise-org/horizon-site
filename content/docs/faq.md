# FAQ

Short answers, with a link when there is more to say.

## Do I need to buy Minecraft?

Yes. Sunrise contains no Minecraft code, assets or data. It builds its game files from your own copy of Minecraft: Java Edition 26.3, on your computer. See [Install](/docs/install).

## Is Sunrise official?

No. It is not an official Minecraft product, and it is not approved by or associated with Mojang or Microsoft. It is open source, under the MIT licence.

## Is Sunrise the same as Minecraft Rust Edition?

"Minecraft Rust Edition" is a name some players use for Sunrise, because Sunrise is Minecraft: Java Edition rewritten in Rust. It is not an edition made by Mojang or Microsoft. Other projects use the name too, including a fork of Sunrise. The original is the one on this site, with its source at [sunrise-org/horizon](https://github.com/sunrise-org/horizon). See [What Sunrise is](/docs/).

## Will my Forge, NeoForge or Fabric mods work?

No. Java mod jars do not run in Sunrise. Sunrise has its own mod system, and the launcher can carry over the data-and-assets part of some Java mods. See [Modpacks](/docs/modpacks) and [Mods and data packs](/docs/mods).

## Can I join public servers?

Yes. Signed in with a Microsoft account that owns Minecraft: Java Edition, Sunrise joins servers that check accounts as vanilla does, secure chat included. Realms does not work yet. See [Multiplayer](/docs/multiplayer).

## Do I need a Microsoft account?

Yes, one that owns Minecraft: Java Edition. Like other launchers, Sunrise's launcher starts the game only while such an account is signed in. You can then also play under an offline name. If you played without an account before, your worlds, offline names and settings stay where they are.

## Can vanilla players join my Sunrise world or server?

Yes. A vanilla 26.3 client can join a Sunrise server and a Sunrise LAN world. See [Multiplayer](/docs/multiplayer) and [Host a server](/docs/hosting).

## Can I use my existing worlds?

Yes. Worlds from Minecraft 1.8 to 26.2 are upgraded the way vanilla upgrades them, and saves use vanilla's format. Copy your world into the game folder's `saves` folder, and make a backup first, as you would before opening a world in any new version.

## Where are my worlds and settings?

In the game folder: `~/.local/share/horizon` on Linux, `~/Library/Application Support/horizon` on macOS and `%APPDATA%\horizon` on Windows. Updating the game never touches it.

## Does it change my normal Minecraft install?

No. Sunrise only reads your Minecraft files when it prepares, and keeps what it needs in its own folder.

## Why does preparing need Java 25?

Preparation runs vanilla's own data generator on your copy of the game, to read data such as every item's default components, and that is Java. It is needed for the preparation only. The game and the server themselves run without Java.

## How close is Sunrise to vanilla?

The harnesses compare Sunrise with the real game on the same inputs, subsystem by subsystem; [the status table](/#parity) shows what they covered when the project started. Passing them is not proof that nothing else differs, and players still find differences. Parity work targets 26.3, redstone first. See [What Sunrise is](/docs/).

## Which systems does it run on?

Linux x86-64, macOS on Apple Silicon or Intel, and Windows x64 or ARM64. See [supported systems](/docs/#supported-systems).

## Are shader packs supported?

Yes. Sunrise's own `.hshader` packs and Iris/OptiFine packs both load from the `shaderpacks` folder; pick one in Options > Sunrise Settings > Shader Packs. See [Settings](/docs/settings#shader-packs).

## Does Sunrise collect data?

Only if you say yes, and each kind has its own switch. Everything is off by default. The one thing sent without asking is an anonymous "I'm playing" ping, for the count of how many play right now: it holds a random number made each time the game starts, the version, your OS and whether a world is open to LAN, and nothing about you. See [Privacy](/privacy).

## How often does it update?

Often. Every change players can see is released automatically after it is merged, so new versions can come out several times a day. Each one is tested before it goes out (the game has to start and draw a world), and the launcher installs it as soon as it is out. There is one version for everyone. See [Install](/docs/install#updating).

## What do the version numbers mean?

Since 0.2, every release has a number: 0.2.0, then 0.2.1, 0.2.2 and so on, one for each release. The game and the launcher are both on 0.2 and count on their own, so you can play Sunrise 0.2.7 with launcher 0.2.3. A bigger step, such as 0.3, is announced when it comes. Releases before 0.2 were named after the day they came out (2026.10.19.15); every 0.2 release is newer than all of them.

## How do I report a bug?

See [Logs, crashes and bug reports](/docs/troubleshooting).

## How can I help?

See [Contribute](/docs/contributing).
