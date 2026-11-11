# Recipes: loot tables

Copy-paste drops: a block that drops itself, an ore with Fortune and Silk Touch, a chest's loot, and loot rules of your own in code. Replace `my_mod` with your mod id.

Loot tables are **vanilla 26.3 data pack files** in `data/my_mod/loot_table/`, inside your mod's folder and its one `.hmod`. The path gives the table's id: `data/my_mod/loot_table/blocks/ruby_block.json` is `my_mod:blocks/ruby_block`.

> [!NOTE] Checked against `bfbda6a`
> Every file format and API on this page was checked against the source of Ari's repository at commit `bfbda6a`.

## How loot files work

- A table has `pools`. Each pool rolls `rolls` times and picks from its `entries`.
- In 26.3, a single condition is `condition` and a list of changes is `modifier`. Each one names its `type`.
- A block's table is `<id>:blocks/<name>`, a mob's `<id>:entities/<name>`. The game finds them by that path.

> [!TIP] Start from a vanilla file
> When in doubt, copy the vanilla table closest to what you want from the game's prepared data, and change it.

## A block that drops itself

**Status:** Works today.

**You get:** `my_mod:ruby_block` drops itself when mined with the right tool, and sometimes not in an explosion.

**File:** `data/my_mod/loot_table/blocks/ruby_block.json`

```json
{
  "type": "minecraft:block",
  "pools": [
    {
      "rolls": 1,
      "condition": { "type": "minecraft:survives_explosion" },
      "entries": [{ "type": "minecraft:item", "name": "my_mod:ruby_block" }]
    }
  ],
  "random_sequence": "my_mod:blocks/ruby_block"
}
```

This is what `cargo horizon-mod new` writes for its sample block.

**Try it:** `cargo horizon-mod build`, start the game, place the block in survival and mine it.

**Common mistakes:**

- The block drops nothing: the file's path doesn't match the block's id, or the block has `requires_tool` and isn't in a `mineable/...` tag. See [A plain block](/docs/recipes-blocks#a-plain-block).
- The file sits in `loot_tables/` (old name). In 26.3 the folder is `loot_table/`.

## An ore with Fortune and Silk Touch

**Status:** Works today.

**You get:** ruby ore drops rubies, more with Fortune, and drops itself with Silk Touch.

**File:** `data/my_mod/loot_table/blocks/ruby_ore.json`

```json
{
  "type": "minecraft:block",
  "pools": [
    {
      "rolls": 1,
      "entries": [
        {
          "type": "minecraft:alternatives",
          "children": [
            {
              "type": "minecraft:item",
              "name": "my_mod:ruby_ore",
              "condition": {
                "type": "minecraft:match_tool",
                "predicate": {
                  "predicates": {
                    "minecraft:enchantments": [{ "enchantments": "minecraft:silk_touch", "levels": { "min": 1 } }]
                  }
                }
              }
            },
            {
              "type": "minecraft:item",
              "name": "my_mod:ruby",
              "modifier": [
                { "type": "minecraft:apply_bonus", "enchantment": "minecraft:fortune", "formula": "minecraft:ore_drops" },
                { "type": "minecraft:explosion_decay" }
              ]
            }
          ]
        }
      ]
    }
  ],
  "random_sequence": "my_mod:blocks/ruby_ore"
}
```

- `alternatives` takes the first child whose condition holds: Silk Touch first, then the gem.
- `apply_bonus` with `ore_drops` is vanilla's Fortune rule for ores.

To make the ore generate, see [An ore](/docs/recipes-worldgen#an-ore).

## A drop that is a matter of luck

**Status:** Works today.

**You get:** a block that drops a ruby one time in four, on top of itself.

Add this pool to the block's table, beside the pool that drops the block:

```json
{
  "rolls": 1,
  "condition": { "type": "minecraft:random_chance", "chance": 0.25 },
  "entries": [{ "type": "minecraft:item", "name": "my_mod:ruby" }]
}
```

`chance` is 0 to 1. To drop a range of items, add `"modifier": [{ "type": "minecraft:set_count", "count": { "type": "minecraft:uniform", "min": 1, "max": 3 } }]` to the entry.

## A mob's drops

**Status:** Works today.

A mob `my_mod:ghoul` drops from `data/my_mod/loot_table/entities/ghoul.json`. The full recipe is in [Mobs: what it drops](/docs/recipes-entities#what-it-drops).

## A chest's loot

**Status:** Works today.

**You get:** a table `my_mod:chests/ruby_cache` with rubies and bread, for a chest in your structure or for a command.

**File:** `data/my_mod/loot_table/chests/ruby_cache.json`

```json
{
  "type": "minecraft:chest",
  "pools": [
    {
      "rolls": { "type": "minecraft:uniform", "min": 2, "max": 4 },
      "entries": [
        {
          "type": "minecraft:item",
          "name": "my_mod:ruby",
          "weight": 1,
          "modifier": [{ "type": "minecraft:set_count", "count": { "type": "minecraft:uniform", "min": 1, "max": 3 } }]
        },
        { "type": "minecraft:item", "name": "minecraft:bread", "weight": 3 }
      ]
    }
  ],
  "random_sequence": "my_mod:chests/ruby_cache"
}
```

- `weight` is how likely an entry is against the others in its pool: bread here is three times as likely.
- `rolls` can be a number or a range.

**Try it:** `/loot give @s loot my_mod:chests/ruby_cache` puts one roll in your inventory.

## Add to a vanilla table

**Status:** Works today, with Rust code. A file for it is **not yet** read (see below).

**You get:** dungeon chests sometimes hold a ruby.

**File:** `src/lib.rs`

```rust
use mod_api::*;

#[derive(Default)]
struct Mod;

#[mod_api::horizon_mod]
impl Hooks for Mod {
    // Once per table, as the server loads its data. Change the table's JSON.
    fn loot_table_load(&self, _: &dyn DataLoadContext, event: &mut LootTableLoadEvent<'_>) {
        if event.id != "minecraft:chests/simple_dungeon" {
            return;
        }
        let pool = mod_api::serde_json::json!({
            "rolls": 1,
            "condition": { "type": "minecraft:random_chance", "chance": 0.25 },
            "entries": [{ "type": "minecraft:item", "name": "my_mod:ruby" }]
        });
        if let Some(pools) = event.table["pools"].as_array_mut() {
            pools.push(pool);
        }
    }
}
```

- It runs on the server, after the data packs, before anything rolls the table.
- Adding a pool is safer than replacing the table. If you replace a mob's table, keep its `random_sequence`: without one, the mob drops nothing.

**Try it:** build the code into a test instance (`horizon-launcher native-build . --instance Development --trust-native-code`), then `/loot give @s loot minecraft:chests/simple_dungeon` a few times.

> [!NOTE] NeoForge's global loot modifiers
> Files in `data/<ns>/loot_modifiers/` are **not yet** read: they are copied into the mod but nothing applies them ([#1270](https://github.com/arismoko/horizon/issues/1270)). **Workaround:** the `loot_table_load` hook above, or `loot_drops` to change the items as they drop. Details: [NeoForge data files](/docs/modding/reference/neoforge-data).

## A loot function of your own

**Status:** Works today, with Rust code.

**You get:** `my_mod:multiply`, a loot function that multiplies the count by its `factor`.

**In a loot table** (an entry's `modifier`):

```json
{
  "type": "minecraft:item",
  "name": "my_mod:ruby",
  "modifier": [{ "type": "my_mod:multiply", "factor": 3 }]
}
```

**File:** `src/lib.rs`

```rust
#[mod_api::horizon_mod]
impl Hooks for Mod {
    // Every function `type` outside `minecraft:` comes here: check the kind.
    fn loot_function(&self, event: &mut LootFunctionEvent<'_>) {
        if event.kind != "my_mod:multiply" {
            return;
        }
        // `event.data` is the function's JSON object.
        let factor = event.data["factor"].as_i64().unwrap_or(1) as i32;
        event.stack.count *= factor;
    }
}
```

- `event.stack` is the item about to drop: its `item`, `count`, `damage`, `enchantments`, `components` and more.
- `event.ctx` says what rolled it: the `tool`, the `block`, the `entity`, the `player`, `luck` and a `seed`.
- A count of 0 or less drops nothing.

## A loot condition of your own

**Status:** Works today, with Rust code.

**You get:** `my_mod:raining`, a condition that holds when it rains where the block broke or the mob died.

**In a loot table** (a pool's or an entry's `condition`):

```json
{
  "rolls": 1,
  "condition": { "type": "my_mod:raining" },
  "entries": [{ "type": "minecraft:item", "name": "my_mod:ruby" }]
}
```

**File:** `src/lib.rs`

```rust
#[mod_api::horizon_mod]
impl Hooks for Mod {
    // `holds` starts false: set it for your own kind.
    fn loot_condition(&self, event: &mut LootConditionEvent<'_>) {
        if event.kind != "my_mod:raining" {
            return;
        }
        // `place` is set for a block a player or an explosion breaks, and for a mob's death.
        event.holds = event
            .ctx
            .place
            .as_ref()
            .and_then(|place| place.level.as_ref())
            .is_some_and(|level| level.raining);
    }
}
```

**Common mistakes:**

- A function or condition type no mod answers: the function leaves the item as it is, and the condition fails.
- A type without a namespace (`"type": "raining"`) means `minecraft:raining`, not yours.
- Expecting every field of `event.ctx`: which ones are set depends on which part of the game rolls the table. Block drops have `tool` and `block`, but no `player` or `biome`. Always handle `None`.

Both hooks also get `event.tags`, to check an item against a tag: see [Tags](/docs/recipes-tags#inside-a-loot-function). Details: [A mod's own loot functions and conditions](/docs/modding/how-to/native-mods/a-mods-own-loot-functions-and-conditions).

## What isn't here yet

- **Global loot modifier files** (`loot_modifiers`). **Not yet** ([#1270](https://github.com/arismoko/horizon/issues/1270)). **Workaround:** `loot_table_load` or `loot_drops`, as above.
- **A full, typed view of the loot context** for every kind of roll. **Partly:** the fields above are there, some only for some rolls ([#2647](https://github.com/arismoko/horizon/issues/2647)).
- **Exploration maps from a custom function.** A function that asks for a map's structure search changes nothing in block and mob drops.
- More gaps by area: [API gaps](/api-gaps).
