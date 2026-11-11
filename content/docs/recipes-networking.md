# Recipes: networking

Send data between your mod's server half and its client half: a message to a player, a request from a client, a struct instead of loose bytes, and a command that sends data. Both halves are the same mod, in the same `.hmod` and the same `src/lib.rs`.

Every recipe here needs the Rust part of a mod: start with `cargo horizon-mod new my_mod --template native`, or add code to a mod you have ([Add code to your mod](/docs/mod-code)).

> [!NOTE] Checked against `bfbda6a`
> Every hook, type and limit below was checked against Ari's repository at commit `bfbda6a`. The snippets were checked against the API's declarations, not compiled one by one.

## Before you start: one mod, two sides

- The **server** half runs in server hooks (`&mut dyn ServerHost`). The **client** half runs in client hooks (`&mut dyn ClientHost`). In single player both run, in the same game.
- Your manifest must say `side = "both"` ([The manifest](/docs/mod-manifest)). Then a server and its players must have the same version of your mod, or the player can't join.
- Messages travel on **channels** named `my_mod:name`. The name uses `a-z`, `0-9` and `_ . / -`, 1 to 64 characters.

> [!WARNING] Typed payloads are not there yet
> Java mods register a payload type once and send typed values. In Sunrise that design is accepted but not delivered: today a message is **bytes on a channel**. The recipes below are what works now, with the closest thing to typed payloads in [A struct instead of bytes](#a-struct-instead-of-bytes). Design: [Typed payloads](/docs/modding/concepts/typed-payloads).

## Send a message to a player

**Status:** Works today, for players on Sunrise (Horizon) clients. Vanilla clients get nothing.

**You get:** when a player joins, the server sends them a line, and their client shows it in chat.

**File:** `src/lib.rs`

```rust
use mod_api::*;

const HELLO: &str = "my_mod:hello";

#[derive(Default)]
struct Mod;

#[mod_api::horizon_mod]
impl Hooks for Mod {
    // Server: a player joined. Send them some bytes.
    fn player_logged_in(&self, host: &mut dyn ServerHost, event: &mut PlayerLoggedInEvent<'_>) {
        let text = format!("Welcome, {}!", event.name);
        let _ = host.net_send_to_player(event.player, HELLO, text.as_bytes());
    }

    // Client: a message from the server. Every mod hears every channel: check yours.
    fn net_from_server(&self, host: &mut dyn ClientHost, event: &mut NetFromServerEvent<'_>) {
        if event.channel != HELLO {
            return;
        }
        let Ok(text) = std::str::from_utf8(event.data) else {
            return; // not text: ignore it
        };
        let _ = host.chat_line(Text::literal(text)); // shown on this client only
    }
}
```

- `net_send_to_player` takes the player's UUID (`event.player` here, `player.uuid()` from a `PlayerRef`).
- The message leaves at the end of the server tick. You can send from any server hook.
- `Ok` means "accepted", not "delivered": a player who left, or who isn't on a Horizon client, doesn't get it.

**Try it:** build into your test instance, open a world: the welcome line appears in chat.

## Send a request from the client to the server

**Status:** Works today, to Sunrise (Horizon) servers. A vanilla server refuses it with an error.

**You get:** `/ping` typed on the client sends a request; the server answers in chat.

```rust
use mod_api::*;

const PING: &str = "my_mod:ping";

#[derive(Default)]
struct Mod;

#[mod_api::horizon_mod]
impl Hooks for Mod {
    // Client: a client-side command.
    fn register_client_commands(&self, _: &mut dyn ClientHost, event: &mut RegisterClientCommandsEvent<'_>) {
        event.commands.push(Command::new("ping"));
    }

    fn command(&self, host: &mut dyn ClientHost, event: &mut CommandEvent<'_>) -> Flow {
        if event.command != "ping" {
            return Flow::Continue;
        }
        if let Err(why) = host.net_send_to_server(PING, &[]) {
            let _ = host.chat_line(Text::literal(format!("Can't ping: {why}")));
        }
        Flow::Cancel // we ran it
    }

    // Server: a client's message. Treat it as untrusted player input.
    fn net_from_client(&self, host: &mut dyn ServerHost, event: &mut NetFromClientEvent<'_>) {
        if event.channel != PING {
            return;
        }
        if let Some(player) = host.player(event.player) {
            let _ = player.tell(host, Text::literal("Pong!"));
        }
    }
}
```

- `net_from_client` runs in the server tick **after** the message arrives.
- `event.player` is the UUID of the player whose client sent it. That part you can trust; `event.data` you can't.

**Try it:** open a world, type `/ping`.

**Common mistakes:**

- Not checking `event.channel`: your code runs for every mod's messages.
- Trusting `event.data`: a modified client can send anything. Check every value, as you would a command argument.
- Sending before the player has joined (on the title screen, while connecting): `net_send_to_server` returns an error.

## A struct instead of bytes

**Status:** Partly. Encoding and decoding a struct works today. Registering it as a payload type, so the game does it for you, is **Not yet**.

**Workaround:** derive `PayloadCodec` on your message, encode it yourself, send the bytes on a channel, decode them on the other side.

```rust
use mod_api::*;

const MANA: &str = "my_mod:mana";

// Vanilla's network encoding: fields in order, VarInt lengths, big-endian numbers.
#[derive(Debug, PayloadCodec)]
struct ManaUpdate {
    current: i32,
    max: i32,
    reason: String, // at most 4096 bytes by default
}

// Server side: encode, then send.
fn send_mana(host: &mut dyn ServerHost, player: u128, current: i32, max: i32) {
    let message = ManaUpdate { current, max, reason: "regen".into() };
    match encode_payload(&message, 30_000) {
        Ok(bytes) => {
            let _ = host.net_send_to_player(player, MANA, &bytes);
        }
        Err(error) => eprintln!("my_mod: can't encode mana: {error:?}"),
    }
}

// Client side, in `net_from_server`: decode, or drop what doesn't decode.
fn read_mana(event: &NetFromServerEvent<'_>) -> Option<ManaUpdate> {
    if event.channel != MANA {
        return None;
    }
    decode_payload::<ManaUpdate>(event.data).ok()
}
```

- `encode_payload(&value, limit)` refuses a body over `limit` bytes. Use 30 000 or less: that is the channel's cap.
- `decode_payload` refuses short, long or malformed bytes, with a `PayloadDecodeError`. It never panics.
- Field types: `bool`, `u8`, `i8`, `i16`, `u16`, `i32`, `i64`, `f32`, `f64`, `VarInt`, `VarLong`, `String`, `Vec<T>`, `Option<T>`, `Box<T>`, and your own types that derive `PayloadCodec`. An enum is sent as its variant's position.
- Both sides must use the same struct. Change a field and both must update, which `side = "both"` already ensures.

> [!TIP] Sending NBT
> For NBT, wrap it in a `Tag` (`Tag::Compound(compound)`): `tag.to_network_bytes()` writes vanilla's network NBT, and `Tag::from_network_bytes(&bytes, None)` reads it back, with the number of bytes it used. See [Maths and network NBT](/docs/modding/how-to/maths-and-network-nbt).

## A command that sends data to a player

**Status:** Works today.

**You get:** `/setmana <player> <amount>`, run by an operator, sends the new value to that player's client.

```rust
fn register_commands(&self, _: &mut dyn ServerHost, event: &mut RegisterCommandsEvent<'_>) {
    event.commands.push(Command::op("setmana <target:player> <amount:integer>", 2));
}

fn run_mod_command(&self, host: &mut dyn ServerHost, event: &mut RunModCommandEvent<'_>) -> Flow {
    if event.command.literals.first().map(String::as_str) != Some("setmana") {
        return Flow::Continue;
    }
    let (Some(CommandArgumentValue::Player(target)), Some(CommandArgumentValue::Integer(amount))) =
        (event.command.argument("target"), event.command.argument("amount"))
    else {
        return Flow::Continue;
    };
    send_mana(host, target.uuid(), *amount, 100); // from the recipe above
    let _ = host.commands().feedback(Text::literal(format!("Mana set to {amount}")));
    Flow::Cancel
}
```

More on commands: [Commands](/docs/recipes-commands), [Typed server commands](/docs/modding/how-to/native-mods/typed-server-commands).

> [!TIP] Keeping a value in step
> If the value lives on a player, an entity or a block and should always match on the client, don't send it by hand: store it in an attachment with `sync: true` and the game sends it for you. See [A value on the player that the HUD shows](/docs/recipes-saved-data#a-value-on-the-player-that-the-hud-shows).

## Limits to know

- At most **30 000 bytes** a message.
- At most **32 messages a tick** each way, per player.
- A message to a player leaves at the end of the tick; one from a client is handled in the next server tick.
- One player's messages arrive in the order they were sent. A client's messages run after that tick's other packets from the same player.

## What `Wire` is for

`#[derive(mod_api::Wire)]` sounds like networking but isn't: it is how values cross between native and sandboxed (wasm) mods. You need it only for types another mod reads through your public API. For network messages, use `PayloadCodec`. More: [Wire types](/docs/modding/how-to/wire-types).

## What isn't here yet

- **Registered typed payloads** (`ToClient<T>`, `ToServer<T>`, version negotiation, optional peers). **Workaround:** [A struct instead of bytes](#a-struct-instead-of-bytes).
- **Messages to and from vanilla clients or servers** on your channel: they never get them. A client can send a raw vanilla packet with `host.send_packet(...)`, but that is for talking to non-Horizon servers, not your own mod.
- **Configuration-phase messages** (before the player is in the world): not yet.
- More gaps: [API gaps: networking](/api-gaps#networking).
