# How a mod works

The few ideas behind every Sunrise mod: one file, ids and namespaces, registries, and when each part of a mod runs. Read this once and the rest of the guides make sense.

## A mod is one folder, then one file

While you work, your mod is a **folder**. When you share it, it is one **`.hmod` file**: a zip of that folder.

```text
my_mod/
├── horizon-mod.toml     the manifest: id, name, version
├── icon.png             optional: the picture on the Mods screen
├── assets/my_mod/       how things look: models, textures, names
├── data/my_mod/         what things are: blocks, items, recipes, loot
├── Cargo.toml           only if the mod has Rust code
└── src/lib.rs           only if the mod has Rust code
```

`cargo horizon-mod build` packs it into `target/horizon-mod/my_mod.hmod`. Inside, the file has the same layout as the folder.

## Data and code live in the same file

There is no "kind" of mod to choose. A mod holds the parts it needs:

- **Data and assets** (`data/`, `assets/`) add blocks, items, recipes and the rest. The game reads them when it starts. Nothing compiles.
- **Rust code** (`Cargo.toml`, `src/`) reacts to things that happen in the game: a player joins, a block breaks, a key is pressed.
- **Both together** is normal. A machine mod has its block in `data/` and its behaviour in `src/lib.rs`, in one folder, one manifest and one `.hmod`.

> [!NOTE] Before, these were two files
> Older Sunrise builds shipped data and code as two separate files, each with its own manifest and tool. That is gone: today one `.hmod` holds both. The old way is kept under [Legacy](/docs/what-changed) for people who maintain an old mod.

## Ids and namespaces

Everything in Minecraft has an **id** with two parts: `namespace:name`.

- `minecraft:stone` is vanilla's stone. Its namespace is `minecraft`.
- `my_mod:glowing_amethyst` is your block. Its namespace is your **mod id**, `my_mod`.

Your mod id is set in `horizon-mod.toml`:

```toml
id = "my_mod"
```

- It is 1 to 64 characters of `a-z`, `0-9` and `_`.
- It names your folders: `assets/my_mod/` and `data/my_mod/`.
- Keep it once you publish: changing it makes a different mod.

## What a registry is

A **registry** is one of the game's lists of things of one kind. There is a list of every block, one of every item, one of every entity type, and so on. Each entry in a list has an id.

When the game starts, it fills these lists: first with vanilla's entries, then with your mod's. That is how your block becomes a real block, with an id other files can point to.

**Your mod adds an entry with one file.** For a block, the file's path gives the id:

```text
data/my_mod/horizon/block/glowing_amethyst.json   →   the block my_mod:glowing_amethyst
```

and the file says what the block copies from vanilla:

```json
{ "template": "minecraft:amethyst_block", "properties": { "light": 7 } }
```

- `template` is a vanilla block. Yours behaves like it: same states, same shape.
- `properties` changes what differs. Here, it gives light.

**Your manifest asks for permission to do this:**

```toml
capabilities = ["registries"]
```

The game's Mods screen shows it to players as "May add blocks, items, mob effects and entity types to your worlds".

> [!TIP] "Registry" has a second meaning
> The **mod registry** is something else: the list of published mods at [playsunrise.net/mods](/mods), which the launcher installs from. When these pages say "the registry checks your file", they mean that one.

## Where each file goes

The path of a file says what it is. Replace `my_mod` with your mod id.

**Things that exist** (`data/`):

- A block: `data/my_mod/horizon/block/<name>.json`
- An item: `data/my_mod/horizon/item/<name>.json`
- A recipe: `data/my_mod/recipe/<name>.json`
- What a block drops: `data/my_mod/loot_table/blocks/<name>.json`
- Your own tags: `data/my_mod/tags/`
- Adding to vanilla's tags, such as "mineable with a pickaxe": `data/minecraft/tags/block/mineable/pickaxe.json`

**How they look** (`assets/`):

- A block's states: `assets/my_mod/blockstates/<name>.json`
- A model: `assets/my_mod/models/block/<name>.json`
- An item's look in the inventory: `assets/my_mod/items/<name>.json`
- A texture: `assets/my_mod/textures/block/<name>.png`
- The names players see: `assets/my_mod/lang/en_us.json`

Everything except the files under `horizon/` uses vanilla's data pack and resource pack formats. [Blocks, items and data files](/docs/mod-data) has every field.

## When each part runs

- **Data and assets** load once, when the game starts. After you change a file, start the game again.
- **Rust code** is compiled into the game by the launcher, for one instance only, after a warning: native code can do anything you can on your computer.
- **The same Rust built to `mod.wasm`** runs in the game's sandbox instead, with no rebuild of the game.

## Next

- Make one: [Build your first block](/docs/build-your-first-block).
- Add behaviour: [Add code to your mod](/docs/mod-code).
- Every manifest field: [The manifest](/docs/mod-manifest).
