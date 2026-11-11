# Modding recipes

Short, copy-paste answers to "how do I make X?": a block, a food, a mob, an ore, a command. Each recipe gives the files, the code and how to try it. The tutorials teach; these pages are for looking things up.

## How to use a recipe

1. Make a mod once:
   - Only data (blocks, items, recipes): `cargo horizon-mod new my_mod`
   - Data and Rust code: `cargo horizon-mod new my_mod --template native`
2. Find the recipe below and copy its files into your mod folder.
3. Replace `my_mod` with your mod id everywhere: in paths, ids and names.
4. Build and try it, as the recipe says.

Everything goes into **one mod folder and one `.hmod` file**. A recipe with code puts its Rust in `src/lib.rs`, beside the `data/` and `assets/` of the same mod. New to this? Read [How a mod works](/docs/how-mods-work) first.

## What the status line means

Every recipe starts with one of these:

- **Works today:** the API or file format is in the game, and the recipe uses it as documented.
- **Partly:** it works, with a limit the recipe names.
- **Not yet:** the game can't do it. The recipe says what is missing and shows the closest thing that works, marked **Workaround**.

> [!NOTE] Checked against one commit
> These recipes were checked against the source of Ari's repository at commit `bfbda6a` ([arismoko/horizon](https://github.com/arismoko/horizon)): every type, hook, field and file path. The Rust snippets were checked against the API's declarations, not compiled one by one. If the compiler disagrees after you update, `cargo doc -p horizon-mod-api --open` shows the current API.

## The recipes

**Blocks and items**

- [Blocks](/docs/recipes-blocks): a plain block, a light, your own texture and model, a custom shape, state properties, a pipe, a fluid, and a block that does something when right-clicked.
- [Block entities](/docs/recipes-block-entities): "entity blocks" that remember things: a counter, a ticking machine, a storage block with a menu.
- [Items](/docs/recipes-items): a plain item, food, a sword, a pickaxe, a seed that places a block, a throwable, an item with code, a tooltip.
- [Mobs and entities](/docs/recipes-entities): a mob of your own, its sounds and drops, natural spawning, spawning from code, its own AI.

**Data**

- [Crafting and smelting](/docs/recipes-crafting): shaped, shapeless and furnace recipes.
- [Loot tables](/docs/recipes-loot): what blocks and mobs drop.
- [Tags](/docs/recipes-tags): which tool mines a block, groups of items, adding to vanilla's tags.
- [World generation](/docs/recipes-worldgen): ores, biome changes, structures.

**Code**

- [Events and hooks](/docs/recipes-events): a player joins, a block breaks, a mob dies, every tick.
- [Commands](/docs/recipes-commands): a reply, arguments, operator-only commands, a command that spawns a mob.
- [Menus and screens](/docs/recipes-menus): a container with a menu, a screen of your own.
- [Sounds and particles](/docs/recipes-sounds-particles): play a sound, show particles, add your own sound files.
- [Networking](/docs/recipes-networking): send data between the client and the server.
- [Saving data](/docs/recipes-saved-data): remember things on players, blocks, chunks and the world.

## When something is missing

- The [API gaps](/api-gaps) page lists what the mod API can't do yet, by area.
- The reference book's [How-to chapters](/docs/modding/how-to/content-mods) go deeper than these recipes.
- The [mod API reference](/docs/modding/reference/api) explains how to read every hook and type.
