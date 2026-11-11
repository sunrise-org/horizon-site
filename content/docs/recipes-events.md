# Recipes: events and hooks

React to what happens in the game: a player joins, a block breaks, a mob dies, a second passes. Each recipe is a method you add to your mod's `impl Hooks`.

Every recipe here needs the Rust part of a mod: start with `cargo horizon-mod new my_mod --template native`, or add code to a mod you have ([Add code to your mod](/docs/mod-code)). The snippets are for a mod the launcher builds into the game.

## How a hook works

Your mod has **one** `impl Hooks` block, marked `#[mod_api::horizon_mod]`. Each method you write in it is a hook the game calls. You only write the ones you need.

```rust
use mod_api::*;

#[derive(Default)]
struct Mod;

#[mod_api::horizon_mod]
impl Hooks for Mod {
    // Paste hook methods here. Every recipe below is one or two of them.
}
```

Hooks come in a few shapes. The return type tells you which:

- **Nothing returned:** you are told something happened. You can't stop it.
- **`Flow`:** return `Flow::Cancel` to stop what is happening, or `Flow::Continue` to let it go on.
- **`Option<...>`:** return `Some(answer)` to decide, or `None` to leave it to the next mod and then the game.

Each hook runs on one side. A **server** hook gets `host: &mut dyn ServerHost`, a **client** hook a `ClientHost`, and a hook that runs on **both** a `HostSide` you `match` on. The compiler stops a server hook from calling client-only code.

> [!TIP] One hook, several mods
> Many mods can listen to the same hook. `#[listener(priority = 10)]` above a method runs it before the default 0. `#[listener(receive_cancelled)]` lets it see events an earlier mod cancelled.

## Greet a player who joins

**Status:** Works today.

**You get:** a chat line for each player who joins, and one for everyone when they leave.

```rust
// A player joined. Server-side.
fn player_logged_in(&self, host: &mut dyn ServerHost, event: &mut PlayerLoggedInEvent<'_>) {
    if let Some(player) = host.player(event.player) {
        let _ = player.tell(host, Text::literal(format!("Welcome, {}!", event.name)));
    }
}

// A player left, by any path. Server-side.
fn player_logged_out(&self, host: &mut dyn ServerHost, event: &mut PlayerLoggedOutEvent<'_>) {
    let _ = host.messages().broadcast(Text::literal(format!("{} left.", event.name)));
}
```

- `event.player` is the player's UUID. `host.player(...)` turns it into a handle, or `None` if they are gone.
- `player.tell` writes to one player. `host.messages().broadcast` writes to everyone and the server log.

**Try it:** build into your test instance and open a world: the welcome is in the chat.

**To remember things about the player** between joins, such as "first join", store it on them: see [Saving data](/docs/recipes-saved-data).

## Stop a block from being broken

**Status:** Works today.

**You get:** your block `my_mod:ward_stone` can't be broken, except by players in creative mode.

```rust
use std::sync::OnceLock;

#[derive(Default)]
struct Mod {
    ward_stone: OnceLock<BlockKey>, // filled once, in register
}

#[mod_api::horizon_mod]
impl Hooks for Mod {
    fn register(&self, r: &mut dyn Registrar, _: &RegistrationContext) {
        let _ = self.ward_stone.set(r.block_key("my_mod:ward_stone"));
    }

    // A player breaks a block. Server-side. Cancel to keep the block.
    fn break_block(&self, host: &mut dyn ServerHost, event: &mut BreakBlockEvent<'_>) -> Flow {
        if Some(&event.state.block()) != self.ward_stone.get() {
            return Flow::Continue;
        }
        // The player breaking it.
        let Some(player) = host.players().acting_player() else { return Flow::Continue };
        if player.is_creative(host) == Some(true) {
            return Flow::Continue;
        }
        let _ = player.action_bar(host, Text::literal("This stone is warded."));
        Flow::Cancel // nothing breaks, nothing drops
    }
}
```

- Look block ids up **once**, in `register`, and compare keys: a `BlockKey` comparison is cheap, a string is not.
- `event.exp_to_drop` changes the experience the block drops: `*event.exp_to_drop = Some(10);`.
- The block's own Part can answer instead: `BlockPart` has `can_harvest_block` and `exp_drop`. See [Blocks](/docs/recipes-blocks#a-block-that-does-something-when-right-clicked).

**Common mistake:** returning `Flow::Cancel` by accident for every block. Return `Flow::Continue` as soon as the block is not yours.

## Do something every second

**Status:** Works today.

**You get:** once a second, a message in the server log and every player's chat.

```rust
use std::sync::atomic::{AtomicU32, Ordering};

#[derive(Default)]
struct Mod {
    ticks: AtomicU32,
}

#[mod_api::horizon_mod]
impl Hooks for Mod {
    // Twice per server tick: at its start and at its end. 20 ticks a second.
    fn server_tick(&self, host: &mut dyn ServerHost, event: &mut ServerTickEvent<'_>) {
        if !matches!(event.phase, ServerTickPhase::ServerTickEnd { .. }) {
            return;
        }
        let ticks = self.ticks.fetch_add(1, Ordering::Relaxed) + 1;
        if ticks % 20 == 0 {
            let _ = host.messages().broadcast(Text::literal(format!("{} seconds", ticks / 20)));
        }
    }
}
```

- The hook takes `&self`, so a counter you change lives in an atomic or a `Mutex`.
- Keep tick hooks cheap: they run 20 times a second, or 40 with both phases.
- `event.phase` also says whether the world is running: `ServerTickStart { world_running }`.

**Other ticks:**

- **One level's tick:** `level_tick_post`.
- **A player's tick:** `player_tick_post`, with `event.player`.
- **A block's random tick**, as crops grow: the block's `BlockPart` answers `random_tick`, and its JSON sets `"random_ticks": true`. See [Making a content mod](/docs/modding/how-to/content-mods#content-mods-api-0-2).
- **A block entity's tick:** [A block entity that ticks](/docs/recipes-block-entities#a-block-entity-that-ticks).

## Announce a mob's death

**Status:** Works today.

**You get:** a chat line for everyone when a zombie dies.

```rust
// A mob or player is about to die. Server-side. Cancel to keep it alive.
fn living_death(&self, host: &mut dyn ServerHost, event: &mut LivingDeathEvent<'_>) -> Flow {
    if event.kind == "minecraft:zombie" {
        let line = format!("A zombie fell to {}", event.damage_type);
        let _ = host.messages().broadcast(Text::literal(line));
    }
    Flow::Continue
}
```

- `event.kind` is the entity type, such as `minecraft:zombie` or `my_mod:ghoul`.
- `event.damage_type` names the last blow, such as `minecraft:player_attack`.
- `event.attacker` is the mob that dealt it, `0` for none or a player.
- `Flow::Cancel` keeps it alive at 1 health, as a totem would.

**What it drops** is data: [Loot tables](/docs/recipes-loot). To change drops from code, use `living_drops`.

## Keep an entity out of the world

**Status:** Works today.

**You get:** no phantoms, ever.

```rust
// An entity joins a level: spawned, summoned, dropped, or loaded with its chunk.
fn entity_join_level(&self, _: &mut dyn ServerHost, event: &mut EntityJoinLevelEvent<'_>) -> Flow {
    if event.kind == "minecraft:phantom" && !event.loaded_from_disk {
        return Flow::Cancel; // never added; a /summon of it fails
    }
    Flow::Continue
}
```

- It tells you about every kind: items, orbs, arrows, boats. Always check `event.kind`.
- `loaded_from_disk` is true when the entity comes back with its chunk.
- For spawning rules rather than a hard no, see [Controlling spawns](/docs/modding/how-to/spawning).

## A right click on any block

**Status:** Works today.

`right_click_block` hears every right click on every block, on the client and on the server, before the block's own use. For **your own** block, a `BlockPart` is simpler: [A block that does something when right-clicked](/docs/recipes-blocks#a-block-that-does-something-when-right-clicked). Use the global hook for rules across all blocks, such as keeping players out of a protected area: set `*event.cancellation_result = InteractionResult::Fail;` and return `Flow::Cancel`.

## Find the hook you need

There are more than 600 hooks. To find one:

- **Search by the NeoForge or Fabric event you know:** most hooks name their counterpart in their documentation, and [NeoForge extension coverage](/docs/modding/reference/neoforge-extensions) maps the extension methods.
- **Read every hook with its fields:** in a checkout of Ari's repository, `cargo doc -p horizon-mod-api --open`, then open the `Hooks` trait.
- **Read how hooks fit together:** [Hook dispatch and level hosts](/docs/modding/concepts/trait-mods/hook-dispatch-and-level-hosts).
- **Nothing fits?** [API gaps: events](/api-gaps#events) lists what is missing. [Injections](/docs/modding/injections) are the rare last resort.
