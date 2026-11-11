# Recipes: commands

Add slash commands to the game: a reply, arguments, operator-only commands, and a command that spawns a mob. The server checks permissions and parses the arguments for you; your code gets typed values.

Every recipe here needs the Rust part of a mod: start with `cargo horizon-mod new my_mod --template native`, or add code to a mod you have ([Add code to your mod](/docs/mod-code)).

## Add a command

**Status:** Works today.

**You get:** `/hello`, which answers "Hello from my_mod!".

**File:** `src/lib.rs`

```rust
use mod_api::*;

#[derive(Default)]
struct Mod;

#[mod_api::horizon_mod]
impl Hooks for Mod {
    // 1. Say which commands exist. Server-side.
    fn register_commands(&self, _: &mut dyn ServerHost, event: &mut RegisterCommandsEvent<'_>) {
        event.commands.push(Command::new("hello"));
    }

    // 2. Run them. Called for every mod's commands: check the name first.
    fn run_mod_command(&self, host: &mut dyn ServerHost, event: &mut RunModCommandEvent<'_>) -> Flow {
        match event.command.literals.first().map(String::as_str) {
            Some("hello") => {
                let _ = host.commands().feedback(Text::literal("Hello from my_mod!"));
                Flow::Cancel // handled
            }
            _ => Flow::Continue, // not ours
        }
    }
}
```

- `register_commands` lists your commands. `run_mod_command` runs them.
- `event.command.literals` holds the command's words, without the arguments: `["hello"]`.
- `host.commands().feedback(...)` answers whoever ran it: a player, the console or a command block. It follows vanilla's rules for silent command blocks.
- Return `Flow::Cancel` when you handled it, `Flow::Continue` when it isn't yours.

**Try it:** build into your test instance, open a world, type `/hello`. The game suggests it as you type.

**Common mistakes:**

- Returning `Flow::Cancel` for every command: other mods' commands stop working.
- Splitting a text line yourself: there is none. Read typed values, as below.

## A command with arguments

**Status:** Works today.

**You get:** `/heal <targets> [amount]`. `/heal @a` heals every player fully; `/heal Steve 4` heals 2 hearts.

```rust
fn register_commands(&self, _: &mut dyn ServerHost, event: &mut RegisterCommandsEvent<'_>) {
    // <required:kind>, then [optional:kind] last.
    event.commands.push(Command::new("heal <targets:players> [amount:number]"));
}

fn run_mod_command(&self, host: &mut dyn ServerHost, event: &mut RunModCommandEvent<'_>) -> Flow {
    if event.command.literals.first().map(String::as_str) != Some("heal") {
        return Flow::Continue;
    }
    // Selectors arrive already resolved: one call for @a, not one per player.
    let Some(CommandArgumentValue::Players(players)) = event.command.argument("targets") else {
        return Flow::Continue;
    };
    let amount = match event.command.argument("amount") {
        Some(CommandArgumentValue::Number(n)) => *n as f32,
        _ => 20.0, // left out: full health
    };
    let players = players.clone();
    for player in &players {
        if let Some(living) = host.living(player.entity()) {
            let _ = living.heal(host, amount);
        }
    }
    let _ = host.commands().feedback(Text::literal(format!("Healed {} players", players.len())));
    Flow::Cancel
}
```

The argument kinds, and what `argument(name)` gives you:

- `integer`: `CommandArgumentValue::Integer(i32)`.
- `number`: `Number(f64)`, always finite.
- `boolean`: `Boolean(bool)`.
- `word`: `String`, one word. `text`: `String`, the rest of the line, so it must be last.
- `player`: `Player(PlayerRef)`, exactly one online player. `players`: `Players(Vec<PlayerRef>)`, one or more.
- `entity`: `Entity(EntityRef)`, exactly one. `entities`: `Entities(Vec<EntityRef>)`, one or more.
- `item`: `Item(ItemStack)`, one item with its components.
- `block_pos`: `BlockPos([i32; 3])`, relative `~` and local `^` coordinates already resolved.

- A left-out optional argument is simply absent. It never quietly becomes "the player who ran it".
- An empty selector, or two players for a `player` argument, gets vanilla's error. Your code isn't called.
- Usages of one command share their words: `Command::new("eco give <player:player> <amount:integer>")` and `Command::new("eco take <player:player> <amount:integer>")` make one `/eco` with two branches. Match the second word with `literals.get(1)`.

## A command only operators can run

**Status:** Works today.

```rust
event.commands.push(Command::op("ghoul", 2));
```

`Command::op(usage, level)` needs operator level `level`: 2 is what `/give` and `/summon` need, 4 the server owner. `Command::new` is level 0, for everyone.

Inside the command, `event.source.permission()` gives the runner's level, if you need finer checks.

## A command that spawns a mob

**Status:** Works today.

**You get:** `/ghoul` spawns a `my_mod:ghoul` where the player stands. Make the mob first: [A mob of your own](/docs/recipes-entities#a-mob-of-your-own).

```rust
fn register_commands(&self, _: &mut dyn ServerHost, event: &mut RegisterCommandsEvent<'_>) {
    event.commands.push(Command::op("ghoul", 2));
}

fn run_mod_command(&self, host: &mut dyn ServerHost, event: &mut RunModCommandEvent<'_>) -> Flow {
    if event.command.literals.first().map(String::as_str) != Some("ghoul") {
        return Flow::Continue;
    }
    // Only a player has a place to spawn it.
    let CommandSource::Player { player, .. } = event.source else {
        let _ = host.commands().feedback(Text::literal("Run this as a player."));
        return Flow::Cancel;
    };
    let player = *player;
    let (Some(level), Some(pos)) = (player.level(host), player.entity().position(host)) else {
        return Flow::Cancel;
    };
    let text = match level.spawn_mob(host, "my_mod:ghoul", pos, SpawnReason::Command) {
        Some(_) => "A ghoul rises.",
        None => "Nothing spawned.", // not a mob, unloaded chunk, or a mod refused it
    };
    let _ = host.commands().feedback(Text::literal(text));
    Flow::Cancel
}
```

## Who ran the command

`event.source` says who:

- `CommandSource::Player { player, .. }`: a player, with their `PlayerRef`.
- `CommandSource::Console { .. }`: the server console. It has no position, so `@s` can't resolve there.
- `CommandSource::CommandBlock { position, level, .. }` and `CommandBlockMinecart { entity, .. }`.
- `CommandSource::Function { id, .. }`: a data pack function.

During the command, `host.players().acting_player()` also names the player who ran it, or `None`.

## Your own argument type

**Status:** Works today.

A value only your mod knows, such as a machine name, with its own suggestions: implement `CommandArgumentType` (`kind`, `parse`, `suggest`), register it in `register` with `r.register_command_argument("machine", Machine)`, and use it as `<machine:my_mod:machine>`. The complete example: [Custom argument types](/docs/modding/how-to/native-mods/typed-server-commands#custom-argument-types).

Players whose client doesn't know your type can still type and complete the command.

## Client-side commands

**Status:** Works today.

A command that runs only on the player's own client (a HUD toggle, a local setting) is registered with the client hook `register_client_commands`, not `register_commands`. It never reaches the server.

## Commands that change while the game runs

If the commands you register depend on a setting that changes, call `host.commands().refresh_commands()`. At the start of the next tick, every mod is asked again, and players get the new list.

## Go deeper

- Selectors, sources and permissions in full: [Typed server commands](/docs/modding/how-to/native-mods/typed-server-commands).
- Running a vanilla command from code: `host.commands().run_command("time set day")` runs it as the console, with no output.
- Gaps: [API gaps: commands](/api-gaps#commands).
