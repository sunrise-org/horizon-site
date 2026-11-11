# Mods and data packs

Sunrise has its own mods, made for Sunrise. Java mods don't run, but their data can carry over, and data packs work in part. This page says what you can use today and how.

## Sunrise mods

A Sunrise mod is **one `.hmod` file**. What it can do depends on what is inside:

- **Data and assets only:** new blocks, items, recipes, loot tables, tags, models, textures and structures. Nothing runs: the game just reads the files. This is also what the launcher's [modpack](/docs/modpacks) carry-over makes.
- **Rust code as well:** a HUD, keys, commands, settings, new behaviour. Sunrise's own Zoom, FPS Counter, Keystrokes and Minimap are mods with code.

Reviewed mods are listed at [playsunrise.net/mods](/mods) and on the launcher's Mods page.

> [!NOTE] Older mods with code
> Released Sunrise still installs mods with code in the older, separate format. [Legacy](/docs/legacy-native-mods) explains it; new mods use the single `.hmod`.

### Install a mod

1. Install it from the launcher's **Mods** page (pick **Sunrise** beside Modrinth). Or put its `.hmod` in the `horizon-mods` folder of the game folder ([where that is](/docs/install#first-launch)).
2. Open **Options, Mods...**. Each mod is listed with what it may do, such as "May add blocks and items to your worlds", and a switch. Mods start off.
3. Start the game again after you switch one on: mod data loads when the game starts.

A mod that failed to load says why, in red, on its row.

### A mod with code: what to expect

Code is not sandboxed: it can do anything you can on your computer. So the launcher builds it into a game of its own, for one instance, and only when you say so.

1. Pick an instance on the left of the launcher and install the mod from its **Mods** page. The first time, the launcher explains what code mods are.
2. In the **Native build of {instance}** row, press **Build**. The launcher names the mods and warns you in red. **I trust these mods: build** starts it.
3. Wait. The first build downloads Rust and takes 20 to 30 minutes and a few GB of disk. Later builds take a few minutes.
4. Play that instance. Your other instances never run the mods.
5. In the game, **Options > Mods** lists each mod with a switch and, when it has them, a **Settings** page and keys to rebind. Turn one off and the next build leaves it out.

> [!WARNING] Install code only from people you trust
> The registry lists a mod with code only after a maintainer has read its source, and each one's page links it. Sunrise's own mods say "Made by Sunrise"; every other mod's page says who made it.

### Make your own

[Make a mod](/docs/make-a-mod) takes you from nothing to a `.hmod` in fifteen minutes.

### Why Java mods don't run

Java mod jars call and patch Minecraft's Java classes, and Sunrise has none. What carries over is the data and assets inside a jar: see [modpacks](/docs/modpacks).

## Finding resource packs and modpacks

The launcher's **Mods** page (launcher 0.17 and newer) searches [Modrinth](https://modrinth.com) for what Sunrise can load: resource packs and modpacks.

- Each result says how well it runs: **Works**, **Partly** or **Doesn't run**. By default the page shows only what runs.
- **Install** downloads the file, checks it against Modrinth's checksum, refuses anything that doesn't match, and puts it in the right folder with the packs it needs.
- **Update** and **Remove** are there too.

After installing:

- A **resource pack** still has to be turned on in the game's Resource Packs screen.
- A **modpack** is imported on the [Modpacks page](/docs/modpacks).

CurseForge is coming soon: the page shows it, but doesn't search it yet. The same things work from a terminal: `horizon-launcher mods search`, `install`, `update` and `remove`.

## Java mods from the Mods page (next launcher release)

Java code doesn't run in Sunrise, but much of what a Java mod adds is data: blocks, items, recipes, loot tables, tags, worldgen, textures.

From the next launcher release, the Mods page also lists Fabric, NeoForge and Forge mods made for 26.3. Before offering one, it downloads the jar, checks Modrinth's checksum and reads it, without running it, to say what Sunrise can use:

- **Works:** the mod is only data, and all of it carries over.
- **Partly:** its data carries over. The row lists what doesn't, such as machines, mobs, blocks with behaviour of their own, or Mixins.
- **Doesn't run:** there is nothing to carry over, as with performance mods, libraries and mods that are all code. It is not offered.

**Install** brings the mod over into `horizon-mods` and turns it on. Start the game again to load it.

> [!NOTE] Carried-over blocks are close, not exact
> They take the closest vanilla block's shape, hardness and sounds, so one can break faster or slower than in Java. Most popular mods today are **Partly** or **Doesn't run**: the verdict is the honest answer for each.

## Data packs

A world's data packs go in its `datapacks` folder, as folders or `.zip` files with a `pack.mcmeta`, as in vanilla.

**Works today, in single player and open-to-LAN worlds:**

- **Functions** (`.mcfunction`, with macros and line continuation) and **function tags**, such as `minecraft:load` and `minecraft:tick`.
- **Predicates** and **item modifiers**.
- The `/function`, `/datapack` and `/reload` commands, and the choice of which packs are on, kept with the world.

**Not applied from data packs yet:** custom recipes, loot tables, advancements and world generation. Sunrise reads those from the vanilla data it prepared, and from mods.

Vanilla's own data is always on, and it matches vanilla: commands run as vanilla's do, and recipes, loot and world generation are checked against the real game.
