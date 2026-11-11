# Recipes: block entities

A **block entity** is extra data that lives in one placed block: a chest's items, a furnace's progress, a sign's text. Java modders call these "entity blocks". In Sunrise you add one with a little Rust beside your block's JSON, all in the same mod.

Every recipe here needs the Rust part of a mod: start with `cargo horizon-mod new my_mod --template native`, or add the code to a mod you have ([Add code to your mod](/docs/mod-code)).

## The three steps every block entity takes

1. **Declare the block** in JSON, as any block ([Blocks](/docs/recipes-blocks)).
2. **Declare a block entity type** in `register`, and name the blocks that carry it.
3. **Attach a Part** to that type: the code that reads and changes its data.

```rust
let kind = r.block_entity_type("counter")   // the type my_mod:counter
    .blocks(&["my_mod:counter"])            // the blocks that carry it
    .build();
r.block_entity_part(&kind, Counter).expect("native block entity type");
```

- The type's id gets your mod's namespace: `"counter"` becomes `my_mod:counter`.
- A type can't own a `minecraft:` block, and two types can't share a block. The game refuses it when it starts.
- The Part implements **both** `BlockPart` and `BlockEntityPart`, each with `#[mod_api::horizon_part]`, even when one is empty.

More: [Block entity types](/docs/modding/concepts/trait-mods/block-entity-types).

## A block that remembers a number

**Status:** Works today.

**You get:** a counter block. Each right click adds one and tells you the total. The number is saved with the world.

**File:** `data/my_mod/horizon/block/counter.json`

```json
{ "template": "minecraft:stone" }
```

Add its blockstate, model and name as in [A plain block](/docs/recipes-blocks#a-plain-block).

**File:** `src/lib.rs`

```rust
use mod_api::*;

#[derive(Default)]
struct Mod;

struct Counter;

#[mod_api::horizon_part]
impl BlockPart for Counter {
    fn use_without_item(
        &self,
        host: &mut dyn ServerHost,
        event: &mut UseWithoutItemEvent<'_>,
    ) -> Option<InteractionResult> {
        // Find this block's block entity.
        let dimension = host.dimension();
        let level = host.level(dimension)?;
        let entity = host.block_entity(level, event.click.pos)?;

        // Read the saved number, add one, write it back.
        let data = entity.data(host).unwrap_or_default();
        let presses = match data.get(&"presses".into()) {
            Some(Tag::Int(n)) => *n + 1,
            _ => 1,
        };
        let mut update = Compound::new();
        update.insert("presses".into(), Tag::Int(presses));
        let _ = entity.merge_data(host, update);

        if let Some(player) = host.player(event.click.player) {
            let _ = player.tell(host, Text::literal(format!("Pressed {presses} times")));
        }
        Some(InteractionResult::Success)
    }
}

// Empty, but needed: it makes Counter a block entity Part.
#[mod_api::horizon_part]
impl BlockEntityPart for Counter {}

#[mod_api::horizon_mod]
impl Hooks for Mod {
    fn register(&self, r: &mut dyn Registrar, _: &RegistrationContext) {
        let kind = r.block_entity_type("counter").blocks(&["my_mod:counter"]).build();
        r.block_entity_part(&kind, Counter).expect("native block entity type");
    }
}
```

**Try it:** build into your test instance, place the block, right-click it a few times, leave the world and come back: the count goes on.

**Common mistakes:**

- Writing `entity.data` every tick to "save" it: the data is already saved with the chunk.
- `merge_data` keeps the keys you don't send. `replace_data` clears them.
- Holding a handle (`entity`) for later: it goes stale when the block is broken or its chunk unloads. Look it up again each time.

## A block entity that ticks

**Status:** Works today.

**You get:** a generator that gains one `energy` each tick, up to 1000, saved with the world.

**File:** `data/my_mod/horizon/block/generator.json`

```json
{ "template": "minecraft:stone" }
```

**File:** `src/lib.rs`

```rust
use mod_api::*;

#[derive(Default)]
struct Mod;

struct Generator;

#[mod_api::horizon_part]
impl BlockPart for Generator {}

#[mod_api::horizon_part]
impl BlockEntityPart for Generator {
    // Say that this block entity ticks. Asked once per state when a world opens.
    fn block_entity_ticks(&self, _: &dyn Host, event: &mut BlockEntityTicksEvent<'_>) {
        event.ticks = true;
    }

    // Each server tick: read and change the saved compound.
    fn block_entity_tick(&self, _: &mut dyn ServerHost, event: &mut BlockEntityTickEvent<'_>) {
        let energy = match event.entity.nbt.get(&"energy".into()) {
            Some(Tag::Int(n)) => *n,
            _ => 0,
        };
        event.entity.nbt.insert("energy".into(), Tag::Int((energy + 1).min(1000)));
    }
}

#[mod_api::horizon_mod]
impl Hooks for Mod {
    fn register(&self, r: &mut dyn Registrar, _: &RegistrationContext) {
        let kind = r.block_entity_type("generator").blocks(&["my_mod:generator"]).build();
        r.block_entity_part(&kind, Generator).expect("native block entity type");
    }
}
```

In `block_entity_tick`, `event.entity` has three things you can change:

- `nbt`: the saved compound.
- `items`: its item slots, if it has a container. Keep the count the same.
- `data`: numbers its menu shows, such as a progress arrow. Not saved.

**Try it:** give `Generator` the `use_without_item` from [the counter](#a-block-that-remembers-a-number), reading `energy` instead of `presses`, and right-click it now and then: the number grows.

> [!WARNING] Don't set `ticks` to false
> `ticks` may already be true from another mod. Set it to true for your blocks; never clear it.

## A storage block with a menu

**Status:** Works today. Its template must be a block that opens a menu, such as a chest.

**You get:** a crate with 9 slots, shown in vanilla's 3 × 3 dispenser menu. Hoppers can fill and empty it.

**File:** `data/my_mod/horizon/block/crate.json`

```json
{ "template": "minecraft:chest" }
```

Give it a full-cube model, as in [A plain block](/docs/recipes-blocks#a-plain-block).

**File:** `src/lib.rs`

```rust
use mod_api::*;

const CRATE: &str = "my_mod:crate";

#[derive(Default)]
struct Mod;

struct Crate;

#[mod_api::horizon_part]
impl BlockPart for Crate {}

#[mod_api::horizon_part]
impl BlockEntityPart for Crate {}

#[mod_api::horizon_mod]
impl Hooks for Mod {
    fn register(&self, r: &mut dyn Registrar, _: &RegistrationContext) {
        let kind = r.block_entity_type("crate").blocks(&[CRATE]).build();
        r.block_entity_part(&kind, Crate).expect("native block entity type");
    }

    // The block's slots, and the vanilla menu that shows them.
    fn block_entity_container(
        &self,
        _: &dyn Host,
        event: &mut BlockEntityContainerEvent<'_>,
    ) -> Option<ModContainer> {
        (event.block == CRATE).then(|| ModContainer {
            slots: 9,
            // Slots each face reaches: down, up, north, south, west, east.
            faces: std::array::from_fn(|_| (0..9).collect()),
            inputs: (0..9).collect(),  // slots hoppers may put into
            outputs: (0..9).collect(), // slots hoppers may take from
            menu: Some("minecraft:generic_3x3".into()),
        })
    }
}
```

The vanilla menus a mod container can open, with their slot counts:

- `minecraft:generic_9x1` to `minecraft:generic_9x6`: 9 to 54 slots, as a chest.
- `minecraft:generic_3x3`: 9, as a dispenser.
- `minecraft:hopper`: 5.
- `minecraft:furnace`, `minecraft:blast_furnace`, `minecraft:smoker`: 3 (input, fuel, result).

The slot count must match the menu's. Breaking the block drops its items, as a chest does.

**Try it:** place it, right-click it, put items in, break it.

## Your own menu and screen

More menu recipes: [Menus and screens](/docs/recipes-menus).

**Status:** Partly. It works on Horizon clients. Other clients get nothing when they open it, and clicks are not predicted on the client yet.

**You get:** a menu type of your own, and a screen you draw.

**File:** `data/my_mod/horizon/menu/press.json`

```json
{ "slots": 2, "data_slots": 2, "results": [1] }
```

- `slots`: 1 to 256. The player's 36 slots come after them.
- `data_slots`: numbers the server sends to the screen, such as progress. They come from `event.entity.data` in `block_entity_tick`.
- `results`: slots players can only take from, like a furnace's result.

Then:

1. Return `menu: Some("my_mod:press".into())` from `block_entity_container`, with `slots: 2`.
2. On the same Part, answer `screen` with the size of your screen and where each slot is drawn:

```rust
fn screen(&self, _: &dyn Host, _: &mut ScreenEvent<'_>) -> Option<Screen> {
    Some(Screen {
        width: 176.0,
        height: 166.0,
        slots: vec![Some([44.0, 35.0]), Some([116.0, 35.0])], // x, y of each slot
        inventory_x: 8.0,
        inventory_y: 84.0,
        own_labels: false,
        own_background: false,
        ..Screen::default()
    })
}
```

3. Draw on it with `screen_draw`, and turn clicks into buttons with `screen_click` and `menu_button`.

The complete, working example is the machine in [horizon-machine-sample](https://github.com/arismoko/horizon-machine-sample) (`src/machine.rs`): a progress bar, a button and two slots. Rules for menu types: [Menu types](/docs/modding/how-to/content-mods#menu-types).

## Sending a block entity's data to players

**Status:** Works today.

The saved compound stays on the server. To show something on the client (a level, a colour), answer `block_entity_update_tag` on the `BlockEntityPart` with the fields players should get. For a one-off effect, such as a burst of particles, see [One-shot client effects](/docs/modding/how-to/block-entities#one-shot-client-effects).

## Drawing a block entity

**Status:** Partly. You can draw extra geometry for it; it is draw calls in Rust, not a Java-style renderer class.

The `block_entity_submit` method of a `BlockEntityPart` draws each frame. For a block drawn only this way, set `"render_shape": "ENTITYBLOCK_ANIMATED"` in its JSON so the chunk doesn't draw its model too. See [Model drawing](/docs/modding/how-to/model-drawing).

## Go deeper

- Menu data, internal slots, retained handles: [Declaring a machine's menu data](/docs/modding/how-to/block-entities).
- Items, fluids and energy for pipes and machines: [Capability providers](/docs/modding/concepts/trait-mods/capability-providers).
- Gaps: [API gaps: blocks](/api-gaps#blocks) and [GUI](/api-gaps#gui).
