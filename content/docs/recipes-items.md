# Recipes: items

Copy-paste items: a gem, a food, a sword, a pickaxe, a seed, a throwable, and items with code. Replace `my_mod` with your mod id.

Every item is a file in `data/my_mod/horizon/item/`. It **copies a vanilla item** (its `template`) and changes what differs. Your manifest needs `capabilities = ["registries"]`.

## How item data works

- An item keeps all of its template's **data components**: food, durability, damage, tool rules.
- `components` changes them, in vanilla 26.3's data component format: `"minecraft:<type>": value` sets one, `"!minecraft:<type>": {}` removes one.
- A component type no vanilla item has is refused, so a typo stops the mod from loading instead of doing nothing.

## A plain item

**Status:** Works today.

**You get:** `my_mod:ruby`, a gem with a blue name.

**File:** `data/my_mod/horizon/item/ruby.json`

```json
{ "template": "minecraft:diamond", "rarity": "uncommon", "max_stack_size": 64 }
```

**File:** `assets/my_mod/items/ruby.json`

```json
{ "model": { "type": "minecraft:model", "model": "my_mod:item/ruby" } }
```

**File:** `assets/my_mod/models/item/ruby.json`

```json
{ "parent": "minecraft:item/generated", "textures": { "layer0": "my_mod:item/ruby" } }
```

**File:** `assets/my_mod/textures/item/ruby.png`: a 16 × 16 picture.

**File:** `assets/my_mod/lang/en_us.json`

```json
{ "item.my_mod.ruby": "Ruby" }
```

- `rarity` is `common`, `uncommon`, `rare` or `epic`: the colour of the name.
- `max_stack_size` is 1 to 99.

**Try it:** `/give @s my_mod:ruby`.

**Common mistakes:**

- An item with no `assets/my_mod/items/<name>.json` shows as a missing texture. Since 1.21.4 every item needs this file.
- A tool or sword uses `minecraft:item/handheld` instead of `item/generated`, so it is held like a tool.

## A food

**Status:** Works today.

**You get:** a ruby apple: 6 hunger points, and Regeneration II for 5 seconds when eaten.

**File:** `data/my_mod/horizon/item/ruby_apple.json`

```json
{
  "template": "minecraft:golden_apple",
  "components": {
    "minecraft:food": { "nutrition": 6, "saturation": 9.6, "can_always_eat": true },
    "minecraft:consumable": {
      "on_consume_effects": [
        {
          "type": "minecraft:apply_effects",
          "effects": [{ "id": "minecraft:regeneration", "amplifier": 1, "duration": 100, "show_icon": true }]
        }
      ]
    }
  }
}
```

- `nutrition` is half-shanks of the hunger bar. `saturation` is how long it lasts.
- `duration` is in ticks: 20 a second.
- For a plain food, copy `minecraft:cooked_beef` and set only `minecraft:food`.

**Leave something behind**, like a bowl: add `"minecraft:use_remainder": { "id": "minecraft:bowl" }` to `components`.

## A sword

**Status:** Works today.

**You get:** a ruby sword: 900 uses and more damage than iron.

**File:** `data/my_mod/horizon/item/ruby_sword.json`

```json
{
  "template": "minecraft:iron_sword",
  "components": {
    "minecraft:max_damage": 900,
    "minecraft:attribute_modifiers": [
      { "type": "minecraft:attack_damage", "id": "minecraft:base_attack_damage",
        "amount": 7.0, "operation": "add_value", "slot": "mainhand" },
      { "type": "minecraft:attack_speed", "id": "minecraft:base_attack_speed",
        "amount": -2.4, "operation": "add_value", "slot": "mainhand" }
    ],
    "!minecraft:repairable": {}
  }
}
```

- `attribute_modifiers` replaces the whole list, so give attack speed as well as damage.
- `!minecraft:repairable` removes iron as its repair material. To repair it with rubies, set `"minecraft:repairable": { "items": "my_mod:ruby" }` instead.

## A pickaxe

**Status:** Works today.

**You get:** a pickaxe that mines what iron mines, faster, with 800 uses.

**File:** `data/my_mod/horizon/item/ruby_pickaxe.json`

```json
{
  "template": "minecraft:iron_pickaxe",
  "components": {
    "minecraft:max_damage": 800,
    "minecraft:tool": {
      "rules": [
        { "blocks": "#minecraft:incorrect_for_iron_tool", "correct_for_drops": false },
        { "blocks": "#minecraft:mineable/pickaxe", "correct_for_drops": true, "speed": 8.0 }
      ]
    }
  }
}
```

The rules are read in order: the first rule that matches a block wins. Iron's pickaxe has speed 6.0, diamond's 8.0.

Enchanting tables and anvils find tools by item tags. Add yours to `data/minecraft/tags/item/pickaxes.json`, as vanilla's are: `{ "values": ["my_mod:ruby_pickaxe"] }`. See [Tags](/docs/recipes-tags).

## A seed that plants a block

**Status:** Works today.

**You get:** seeds that place your crop block, as wheat seeds place wheat.

**File:** `data/my_mod/horizon/item/ruby_seeds.json`

```json
{ "template": "minecraft:wheat_seeds", "block": "my_mod:ruby_crop" }
```

- `block` is the block it places: yours or vanilla's. It keeps that block's placement rules, and is used up outside creative.
- For farmers to plant them, add them to `data/minecraft/tags/item/villager_plantable_seeds.json`.

For the crop itself, copy `minecraft:wheat` as its template, and see `random_ticks` in [Making a content mod](/docs/modding/how-to/content-mods#content-mods-api-0-2).

## A throwable item

**Status:** Partly. It works in single player and on LAN. Dispensers don't throw it yet, and dedicated servers are untested.

**You get:** an ember you throw like a snowball. It deals 2 damage to what it hits.

**File:** `data/my_mod/horizon/item/ember.json`

```json
{ "template": "minecraft:snowball" }
```

**File:** `data/my_mod/horizon/entity_type/ember.json`

```json
{ "template": "minecraft:snowball", "item": "my_mod:ember", "damage": 2.0 }
```

- The entity type `my_mod:ember` flies as a snowball and is drawn as its item.
- One entity type per item. `damage` is 0 by default.
- Name the entity in `en_us.json`: `"entity.my_mod.ember": "Ember"`.

From code, `host.spawn_projectile_from_rotation(...)` launches one without an item. See [Making a content mod](/docs/modding/how-to/content-mods#content-mods-api-0-2).

## An item that does something on right click

**Status:** Works today, with Rust code.

**You get:** a wand. Right-click a block with it: hearts appear above the block, and you hear a chime.

**File:** `data/my_mod/horizon/item/wand.json`

```json
{ "template": "minecraft:stick", "max_stack_size": 1 }
```

**File:** `src/lib.rs`

```rust
use mod_api::*;

#[derive(Default)]
struct Mod;

struct Wand {
    heart: ParticleKey, // looked up once, at startup
}

#[mod_api::horizon_part]
impl ItemPart for Wand {
    // The player right-clicks a block with the wand. Server-side.
    fn use_on(&self, host: &mut dyn ServerHost, event: &mut UseOnEvent<'_>) -> Flow {
        let [x, y, z] = event.pos;
        let above = [x as f64 + 0.5, y as f64 + 1.2, z as f64 + 0.5];
        let dimension = host.dimension();
        if let Some(level) = host.level(dimension) {
            let hearts = ParticleOptions::simple(self.heart);
            // options, block state, position, spread, speed, count
            level.send_particles(host, &hearts, None, above, [0.3, 0.3, 0.3], 0.0, 5);
        }
        if let Some(player) = host.player(event.player) {
            player.entity().play_sound(host, "minecraft:block.amethyst_block.chime", 1.0, 1.0);
        }
        // Cancel: the click is taken, and the item's own use doesn't run.
        Flow::Cancel
    }
}

#[mod_api::horizon_mod]
impl Hooks for Mod {
    fn register(&self, r: &mut dyn Registrar, _: &RegistrationContext) {
        let heart = r.particle_key("minecraft:heart");
        let wand = r.item_key("my_mod:wand");
        r.item_part(wand, Wand { heart });
    }
}
```

**Try it:** build into your test instance, `/give @s my_mod:wand`, right-click the ground.

Other `ItemPart` methods:

- `use_item`: right click in the air (it runs on both sides, so its host is a `HostSide`).
- `hurt_enemy`: the item hits a mob.
- `inventory_tick`: each tick while it is in an inventory.
- `use_duration`, `release_using`: items you hold down, like a bow.

All of them: [Item and tag Parts](/docs/modding/concepts/trait-mods/item-and-tag-parts). To attach a Part to every item in a tag, such as all axes, use `r.item_part_tag("minecraft:axes", Part)`.

## A tooltip line

**Status:** Works today, with Rust code.

**You get:** a grey line under the wand's name.

Add this method to the `ItemPart` above:

```rust
// Client-side, each frame the tooltip shows.
fn tooltip(&self, _: &dyn ClientHost, event: &mut TooltipEvent<'_>) {
    // (text, colour as 0xAARRGGBB); u32::MAX keeps the text's own colour.
    event.lines.push((Text::literal("Right-click a block"), 0xFFAAAAAA));
}
```

Use `Text::translate("tooltip.my_mod.wand", vec![])` and a line in `en_us.json` to translate it.

## What isn't here yet

- **Behaviour tied to a vanilla item's class.** **Not yet:** a copy of the trident doesn't throw, and a copy of the bow doesn't draw ([#3305](https://github.com/horizon-rust/horizon/issues/3305)). Components carry over; code-only behaviour doesn't. Fishing rods are the exception: a `minecraft:fishing_rod` copy works. **Workaround:** give the item `ItemPart` methods for the behaviour you need, as the wand does.
- **Putting your items in vanilla's creative tabs** needs code: the `build_creative_mode_tab_contents` hook. A tab of your own needs only a file, `data/my_mod/horizon/creative_tab/<name>.json`: `{ "title": "Ruby", "icon": "my_mod:ruby", "items": ["my_mod:ruby", "my_mod:ruby_block"] }`. Details: [Making a content mod](/docs/modding/how-to/content-mods#content-mods-api-0-2).
- More gaps: [API gaps: items](/api-gaps#items).
