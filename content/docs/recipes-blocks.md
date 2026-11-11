# Recipes: blocks

Copy-paste blocks, from a plain cube to one that answers a right click. Replace `my_mod` with your mod id. New to blocks? [Build your first block](/docs/build-your-first-block) explains each file step by step.

Every block here is a file in `data/my_mod/horizon/block/`. It **copies a vanilla block** (its `template`) and changes what differs. Your manifest needs `capabilities = ["registries"]`.

## A plain block

**Status:** Works today.

**You get:** `my_mod:ruby_block`, a block you can place, mine with a pickaxe, and craft.

**File:** `data/my_mod/horizon/block/ruby_block.json`

```json
{
  "template": "minecraft:iron_block",
  "properties": { "hardness": 5.0, "explosion_resistance": 6.0, "requires_tool": true }
}
```

**File:** `assets/my_mod/blockstates/ruby_block.json`

```json
{ "variants": { "": { "model": "my_mod:block/ruby_block" } } }
```

**File:** `assets/my_mod/models/block/ruby_block.json`

```json
{ "parent": "minecraft:block/cube_all", "textures": { "all": "my_mod:block/ruby_block" } }
```

**File:** `assets/my_mod/items/ruby_block.json` (the block's item, in your hand)

```json
{ "model": { "type": "minecraft:model", "model": "my_mod:block/ruby_block" } }
```

**File:** `assets/my_mod/textures/block/ruby_block.png`: a 16 × 16 picture.

**File:** `assets/my_mod/lang/en_us.json`

```json
{ "block.my_mod.ruby_block": "Block of Ruby" }
```

**File:** `data/minecraft/tags/block/mineable/pickaxe.json` (a pickaxe mines it fast)

```json
{ "values": ["my_mod:ruby_block"] }
```

**File:** `data/minecraft/tags/block/needs_iron_tool.json` (only iron or better drops it, with `requires_tool`)

```json
{ "values": ["my_mod:ruby_block"] }
```

It still needs a loot table to drop itself: see [A block that drops itself](/docs/recipes-loot).

**Try it:** `cargo horizon-mod build`, start the game with the mod, then `/give @s my_mod:ruby_block`.

**Common mistakes:**

- A purple and black cube: the texture path is wrong. `my_mod:block/ruby_block` means `assets/my_mod/textures/block/ruby_block.png`.
- The block breaks slowly and drops nothing: it is missing from `mineable/pickaxe.json`, or has no loot table.
- The name shows as `block.my_mod.ruby_block`: the key in `en_us.json` doesn't match the block's id.

## A block that gives light

**Status:** Works today.

**You get:** a block that lights up the dark, like glowstone.

**File:** `data/my_mod/horizon/block/glow_ruby.json`

```json
{ "template": "minecraft:glowstone", "properties": { "light": 15, "sounds": "minecraft:amethyst_block" } }
```

- `light` is 0 to 15. 15 is a torch's or glowstone's brightness.
- `sounds` names a vanilla block whose sounds it uses.

Add its blockstate, model, item model and name as in [A plain block](#a-plain-block).

## Different textures on each side

**Status:** Works today.

**You get:** a block with one texture on top and bottom and another on the sides, like a log.

**File:** `assets/my_mod/models/block/ruby_pillar.json`

```json
{
  "parent": "minecraft:block/cube_column",
  "textures": { "end": "my_mod:block/ruby_pillar_top", "side": "my_mod:block/ruby_pillar_side" }
}
```

Vanilla parents to start from:

- `minecraft:block/cube_all`: one texture on every face.
- `minecraft:block/cube_column`: `end` and `side`.
- `minecraft:block/cube_bottom_top`: `top`, `bottom` and `side`.
- `minecraft:block/orientable`: a front face, like a furnace.

Models use vanilla's resource pack format, so any model a resource pack can draw, with `elements`, works here.

## A block with its own shape

**Status:** Works today.

**You get:** a half-height block: the outline you aim at and what you walk on are half a block tall.

**File:** `data/my_mod/horizon/block/ruby_step.json`

```json
{
  "template": "minecraft:stone",
  "shapes": { "default": [[0, 0, 0, 1, 0.5, 1]] },
  "occludes": false
}
```

- A box is `[minX, minY, minZ, maxX, maxY, maxZ]`, where 1 is a whole block. Up to 16 boxes.
- `shapes` sets the outline. Collision follows it unless you also set `collision_shapes`.
- `occludes: false` stops the block from hiding the faces beside it, so there is no hole in the floor next to it.

Give it a model of the same shape: the shape doesn't change how it is drawn.

**Common mistake:** a box with a minimum above its maximum, or more than 16 boxes, stops the mod from loading. The reason is in the log.

## A block with states of its own

**Status:** Works today. Changing the state when something happens needs code.

**You get:** a block with a `lit` state and a `facing` state its template doesn't have.

**File:** `data/my_mod/horizon/block/ruby_lamp.json`

```json
{
  "template": "minecraft:stone",
  "state_properties": {
    "facing": { "type": "enum", "values": ["north", "south", "east", "west"] },
    "lit": { "type": "boolean" }
  },
  "default_state": { "lit": "false", "facing": "north" }
}
```

Your blockstate file then picks a model per state, in vanilla's format:

```json
{
  "variants": {
    "lit=false": { "model": "my_mod:block/ruby_lamp" },
    "lit=true": { "model": "my_mod:block/ruby_lamp_on" }
  }
}
```

- Names and values are lower case letters, digits and `_`.
- A name the template already has is refused.
- All combinations together must stay under about a million states.

## A pipe or cable that connects

**Status:** Works today.

**You get:** a thin block that joins its neighbours on all six sides, like a pipe.

**File:** `data/my_mod/horizon/block/ruby_cable.json`

```json
{ "template": "minecraft:chorus_plant", "connects_to": "#my_mod:cable_connects", "thickness": 4 }
```

**File:** `data/my_mod/tags/block/cable_connects.json` (what else it joins, besides itself)

```json
{ "values": ["minecraft:iron_block"] }
```

`thickness` is 2 to 14 pixels. Without it, it is the chorus plant's 10.

To make a post join fences instead, add it to `data/minecraft/tags/block/fences.json` and `wooden_fences.json`. [Connecting to fences, walls or panes](/docs/modding/how-to/content-mods#namespaces-and-limits) has the rules.

## A fluid

**Status:** Partly. It flows, and has a bucket. Entities don't swim in it, and far terrain (LOD) doesn't draw it yet.

**You get:** the block `my_mod:oil`, a copy of water with your texture, and the item `my_mod:oil_bucket`.

**File:** `data/my_mod/horizon/fluid/oil.json`

```json
{ "sprite": "my_mod:block/oil", "world": { "tick_delay": 10 } }
```

- `sprite` is a block texture: `assets/my_mod/textures/block/oil.png`.
- `world` makes it exist in the world. Inside it: `tick_delay` (default 5), `drop_off` (1 to 7), `slope_find_distance` (1 to 4), `source_conversion` (default false) and `bucket` (default true).
- The bucket needs an item model, `assets/my_mod/items/oil_bucket.json`, as any item does.

Details: [Making a content mod](/docs/modding/how-to/content-mods#content-mods-api-0-2).

## A block that does something when right-clicked

**Status:** Works today, with Rust code.

**You get:** a bell block. Right-click it with an empty hand: it rings and tells you so.

**File:** `data/my_mod/horizon/block/ruby_bell.json`

```json
{ "template": "minecraft:stone" }
```

Add its blockstate, model and name as in [A plain block](#a-plain-block).

**File:** `src/lib.rs`

```rust
use mod_api::*;

#[derive(Default)]
struct Mod;

// The behaviour, attached to one block.
struct Bell;

#[mod_api::horizon_part]
impl BlockPart for Bell {
    // Right click with an empty main hand. Runs on the server.
    fn use_without_item(
        &self,
        host: &mut dyn ServerHost,
        event: &mut UseWithoutItemEvent<'_>,
    ) -> Option<InteractionResult> {
        let player = host.player(event.click.player)?;
        player.entity().play_sound(host, "minecraft:block.bell.use", 1.0, 1.0);
        let _ = player.tell(host, Text::literal("Ding!"));
        // Some(...) answers the click; None lets the template's own use run.
        Some(InteractionResult::Success)
    }
}

#[mod_api::horizon_mod]
impl Hooks for Mod {
    // Once, at startup: attach the behaviour to the block.
    fn register(&self, r: &mut dyn Registrar, _: &RegistrationContext) {
        let bell = r.block_key("my_mod:ruby_bell");
        r.block_part(bell, Bell);
    }
}
```

**Try it:** build the code into a test instance (`horizon-launcher native-build . --instance Development --trust-native-code`), place the block and right-click it.

**Common mistakes:**

- Forgetting `#[mod_api::horizon_part]` on the `impl`: the method is never called.
- Holding an item: `use_without_item` is for an empty hand. For a click with an item, use `use_item_on` on the same `BlockPart`.
- The same works on a vanilla block: `r.block_key("minecraft:note_block")`.

Other things a `BlockPart` can answer: redstone output, random ticks, neighbour changes, what stands on it, what it drops as experience. The list is in [Parts](/docs/modding/concepts/trait-mods/parts) and [Block Parts](/docs/modding/concepts/trait-mods/block-parts).

## A block that remembers something

That needs a block entity. See [Block entities](/docs/recipes-block-entities).

## What isn't here yet

- **A block class of your own** (Java's `extends Block`). **Not yet:** a block is always a copy of a vanilla template. **Workaround:** pick the closest template, then add behaviour with a `BlockPart`, as in the bell above.
- **Every block property in code.** Blocks can also be declared from Rust with `Block::new(id, template)` in the `blocks` hook. The JSON files above are simpler and do the same: [Making a content mod](/docs/modding/how-to/content-mods).
- More gaps by area: [API gaps: blocks](/api-gaps#blocks).
