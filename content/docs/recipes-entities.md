# Recipes: mobs and entities

A mob of your own, what it drops, where it spawns, and how to spawn one from code. Replace `my_mod` with your mod id.

> [!NOTE] Mobs are the youngest part of the API
> A mod mob today is a **copy of a vanilla mob** under its own id, with its own stats, sounds and drops. Its own model and its own Java-style class are not there yet. Each recipe says what works.

## A mob of your own

**Status:** Partly. It has its template's model, texture and behaviour. Unit tests check it; it hasn't been tried much in a running game yet.

**You get:** `my_mod:ghoul`, a zombie with 40 health that walks a little faster.

**File:** `data/my_mod/horizon/entity_type/ghoul.json`

```json
{
  "template": "minecraft:zombie",
  "attributes": { "minecraft:max_health": 40.0, "minecraft:movement_speed": 0.3 }
}
```

**File:** `assets/my_mod/lang/en_us.json`

```json
{ "entity.my_mod.ghoul": "Ghoul" }
```

- `template` is the vanilla mob it copies, such as `minecraft:zombie` or `minecraft:villager`.
- `attributes` change its defaults, by attribute id. Only attributes the template has: naming one it lacks stops the mod from loading.
- It saves and loads as itself, with what its template's class saves.
- It is in none of vanilla's entity tags (`#minecraft:undead`, ...). Add it yourself in `data/minecraft/tags/entity_type/`.

**Try it:** `/summon my_mod:ghoul`.

## Its own sounds

**Status:** Works today.

Add `sounds` to the same file:

```json
{
  "template": "minecraft:zombie",
  "sounds": {
    "ambient": "my_mod:entity.ghoul.ambient",
    "hurt": "minecraft:entity.husk.hurt",
    "death": "minecraft:entity.husk.death",
    "step": "none"
  }
}
```

- A slot you leave out keeps the template's sound. `"none"` mutes that slot.
- Your own sound ids come from `assets/my_mod/sounds.json`, in vanilla's resource pack format. See [Sounds and particles](/docs/recipes-sounds-particles).

## What it drops

**Status:** Works today.

**File:** `data/my_mod/loot_table/entities/ghoul.json`

```json
{
  "type": "minecraft:entity",
  "pools": [
    {
      "rolls": 1,
      "entries": [
        {
          "type": "minecraft:item",
          "name": "my_mod:ruby",
          "modifier": [
            { "type": "minecraft:set_count", "count": { "type": "minecraft:uniform", "min": 0, "max": 2 } }
          ]
        }
      ]
    }
  ],
  "random_sequence": "my_mod:entities/ghoul"
}
```

The path gives the table: a mob `my_mod:ghoul` drops from `my_mod:entities/ghoul`, as vanilla's `getDefaultLootTable` does.

> [!TIP] 26.3's loot format
> In 26.3, an entry's list of changes is `modifier` and a single condition is `condition`. When in doubt, copy a vanilla file from the game's prepared data and change it.

## Spawning naturally

**Status:** Works today.

**You get:** ghouls spawn in Overworld biomes, in groups of 1 to 3.

**File:** `data/my_mod/neoforge/biome_modifier/ghoul_spawns.json`

```json
{
  "type": "neoforge:add_spawns",
  "biomes": "#minecraft:is_overworld",
  "spawners": { "type": "my_mod:ghoul", "weight": 20, "minCount": 1, "maxCount": 3 }
}
```

- This is NeoForge's biome modifier format, which Sunrise reads from mods.
- `biomes` is an id, a `#tag` or a list. `spawners` is one object or a list.
- The mob joins its template's spawn category: a zombie copy spawns as a monster, at night or in the dark.

**Where exactly it may stand** (on what block, in what light) is set in code, with `Registrar::declare_spawn_placement`:

```rust
fn register(&self, r: &mut dyn Registrar, _: &RegistrationContext) {
    r.declare_spawn_placement("ghoul", SpawnPlacementRule {
        placement: SpawnPlacementType::OnGround,
        heightmap: Heightmap::MotionBlockingNoLeaves,
        spawnable_on: None,         // or Some("my_mod:ghoul_ground"): a block tag, no #
        light: SpawnLight::Dark,    // Any, Dark (a monster's) or Bright (an animal's)
        biome_tag: None,            // or Some("my_mod:haunted"): a biome tag
    }).unwrap();
}
```

Without it, the mob keeps its template's rules. More hooks to allow, stop or change spawns: [Controlling spawns](/docs/modding/how-to/spawning).

## Spawning one from code

**Status:** Works today.

`LevelRef::spawn_mob` spawns a mob as `/summon` would, and returns its handle:

```rust
// Inside any server hook, with `host: &mut dyn ServerHost`.
let dimension = host.dimension();
if let Some(level) = host.level(dimension) {
    let ghoul = level.spawn_mob(host, "my_mod:ghoul", [0.5, 70.0, 0.5], SpawnReason::Command);
    // None: nothing spawned (not a mob, unloaded chunk, a mod cancelled it...).
}
```

For a complete hook to put it in, see [A command that spawns a mob](/docs/recipes-commands#a-command-that-spawns-a-mob).

Spawn rules and limits don't apply to `spawn_mob`, as they don't to `/summon`.

## A throwable entity

A snowball-like projectile with its own item: [A throwable item](/docs/recipes-items#a-throwable-item).

## Its own AI

**Status:** Partly. Native mods only: entity Parts don't reach the sandbox (`mod.wasm`) yet.

An `EntityPart` adds goals to a mob type, yours or vanilla's, beside the template's own:

```rust
struct GhoulGoals;

#[mod_api::horizon_part]
impl EntityPart for GhoulGoals {
    fn register_goals(&self, goals: &mut GoalRegistrar<'_>) {
        // goals.add_goal(priority, YourGoal::default());
        // goals.add_target_goal(priority, YourTargetGoal::default());
    }
}

// In register:
r.entity_part("my_mod:ghoul", GhoulGoals);
```

You write each goal as a type that implements `Goal`. How goals run, what they may read and write, and brain behaviours: [Entity parts and mob goals](/docs/modding/concepts/trait-mods/entity-parts-and-mob-goals).

## Its own model and texture

**Status:** Not yet. A mod mob draws as its template.

- What is missing: declaring an entity model and texture in data, as a resource pack would for a new mob.
- **Workaround:** a client hook can draw extra geometry for a mob each frame (`mob_submit`), and [Model drawing](/docs/modding/how-to/model-drawing) shows how to draw a model. Keyframe animations: [Entity keyframe animations](/docs/modding/how-to/entity-keyframe-animations).

## What isn't here yet

- **A mob class of your own** (Java's `extends Monster`). **Not yet.** **Workaround:** copy the closest vanilla mob, then change it with attributes, sounds, goals and hooks such as `entity_tick_post` or `living_damage_pre`.
- **A spawn egg.** Not covered by these recipes. **Workaround:** `/summon`, a command of your own, or natural spawning.
- More gaps: [API gaps: entities](/api-gaps#entities).
