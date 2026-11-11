# Recipes: sounds and particles

Add your own sounds, play them for everyone or for one player, and spawn particles: vanilla's or your own. Sound and texture files go in `assets/`, the code in `src/lib.rs`, all in the same mod.

> [!NOTE] Checked against `bfbda6a`
> Every hook, type and file path below was checked against Ari's repository at commit `bfbda6a`. The snippets were checked against the API's declarations, not compiled one by one.

## Who hears it: server or client

- **Server code** (block clicks, commands, ticks) plays a sound or sends particles **to the players near it**. Use this for anything that happens in the world.
- **Client code** (screens, HUD, keys) plays a sound or adds particles **for this player only**. Nothing goes to the server.

Pick the side first. A sound played on the client is never heard by other players.

## A sound of your own

**Status:** Works today.

**You get:** the sound event `my_mod:block.chime.ring`, usable anywhere a sound id is: your code, `/playsound`, a mob's `sounds`.

**File:** `assets/my_mod/sounds.json`

```json
{
  "block.chime.ring": {
    "subtitle": "subtitles.my_mod.chime",
    "sounds": ["my_mod:chime_1", "my_mod:chime_2"]
  }
}
```

**Files:** `assets/my_mod/sounds/chime_1.ogg` and `assets/my_mod/sounds/chime_2.ogg`

- This is vanilla's resource pack format. The key is the sound event's path; your mod id is its namespace.
- `"my_mod:chime_1"` means the file `assets/my_mod/sounds/chime_1.ogg`. With two files, one is picked at random each time.
- Sounds must be **Ogg Vorbis** (`.ogg`). Mono files fade with distance; stereo files don't.

Add the subtitle's text to `assets/my_mod/lang/en_us.json`:

```json
{ "subtitles.my_mod.chime": "Chime rings" }
```

**Try it:** `/playsound my_mod:block.chime.ring master @s`.

**Common mistakes:**

- An `.mp3` or `.wav` file: it won't play. Convert it to `.ogg`.
- Writing `"my_mod:block.chime.ring"` as the key in `sounds.json`: the key has no namespace.
- Expecting other players to hear it without the mod: the sound lives in your mod's assets, so players need the mod.

## Play a sound in the world

**Status:** Works today.

**You get:** a block that plays your chime when right-clicked, heard by everyone nearby.

**File:** `data/my_mod/horizon/block/chime.json`

```json
{ "template": "minecraft:stone" }
```

Add its blockstate, model and name as in [A plain block](/docs/recipes-blocks#a-plain-block).

**File:** `src/lib.rs`

```rust
use mod_api::*;

#[derive(Default)]
struct Mod;

struct Chime;

#[mod_api::horizon_part]
impl BlockPart for Chime {
    fn use_without_item(
        &self,
        host: &mut dyn ServerHost,
        event: &mut UseWithoutItemEvent<'_>,
    ) -> Option<InteractionResult> {
        let level = host.level(host.dimension())?;
        let [x, y, z] = event.click.pos;
        let centre = [x as f64 + 0.5, y as f64 + 0.5, z as f64 + 0.5];
        // Heard within 16 blocks (more if volume is above 1), on the Blocks slider.
        level.play_sound(host, "my_mod:block.chime.ring", centre, SoundSource::Blocks, 1.0, 1.0);
        Some(InteractionResult::Success)
    }
}

#[mod_api::horizon_mod]
impl Hooks for Mod {
    fn register(&self, r: &mut dyn Registrar, _: &RegistrationContext) {
        let chime = r.block_key("my_mod:chime");
        r.block_part(chime, Chime);
    }
}
```

Other ways to play a sound from server code:

- `entity.play_sound(host, sound, volume, pitch)`: at an entity, on its own sound source. A player doesn't hear their own.
- `entity.play_bound_sound(host, sound, source, volume, pitch)`: follows the entity as it moves.
- `player.play_sound(host, sound, source, volume, pitch)`: for that one player only.
- `player.stop_sound(host, Some(sound), None)`: stops it for that player, as `/stopsound`.

All of them return `true` for "queued", not "heard".

**Try it:** place the block, right-click it.

**Common mistakes:**

- Passing block coordinates without `+ 0.5`: the sound comes from the block's corner.
- A `minecraft:` id that doesn't exist: refused. A mod's own id is sent by name and plays where the resources have it.

## A sound only this player hears

**Status:** Works today.

**You get:** an interface click from a client hook, such as a screen button.

```rust
// In any client hook: `host` is a `ClientHost`.
host.play_local_sound(&SoundPlay::ui("minecraft:ui.button.click"), 0);

// At a place in the world, fading with distance, 20 ticks later:
let thunder = SoundPlay::at("my_mod:block.chime.ring", SoundSource::Blocks, [0.5, 64.0, 0.5])
    .with_volume(2.0)
    .with_pitch(0.8);
let playing = host.play_local_sound(&thunder, 20);
```

- `play_local_sound` returns a `SoundRef` you can `stop` or `fade` later. `None` means it was refused.
- It takes `&self`, so a screen or HUD hook can call it.
- `.looping(delay)` repeats the sound, `delay` ticks apart.

A full example in a screen: [A screen with no block behind it](/docs/recipes-menus#a-screen-with-no-block-behind-it).

## Change or silence any sound

**Status:** Works today.

`play_level_sound_at_position` and `play_level_sound_at_entity` see every level sound before it is sent (server) or played (client). Change its volume or pitch, or return `Flow::Cancel` to drop it. To dull every sound for a moment (ears ringing after a blast), a client calls `host.muffle_sounds(amount, lowpass, ticks, &["my_mod:ear.ringing"])`.

Details: [Level sounds](/docs/modding/how-to/native-mods/level-sounds) and [Temporary client sound effects](/docs/modding/how-to/client-effects).

## Particles in the world, for everyone

**Status:** Works today.

**You get:** a burst of flame particles around a block when it's right-clicked, seen by players within 32 blocks.

**File:** `src/lib.rs`

```rust
use mod_api::*;
use std::sync::OnceLock;

// A particle is named by a key, asked for once at start.
static FLAME: OnceLock<ParticleKey> = OnceLock::new();

#[derive(Default)]
struct Mod;

struct Burner;

#[mod_api::horizon_part]
impl BlockPart for Burner {
    fn use_without_item(
        &self,
        host: &mut dyn ServerHost,
        event: &mut UseWithoutItemEvent<'_>,
    ) -> Option<InteractionResult> {
        let level = host.level(host.dimension())?;
        let key = *FLAME.get()?;
        let [x, y, z] = event.click.pos;
        level.send_particles(
            host,
            &ParticleOptions::simple(key),
            None,                                        // a block state, for block particles only
            [x as f64 + 0.5, y as f64 + 1.1, z as f64 + 0.5], // where
            [0.3, 0.1, 0.3],                             // random spread on each axis
            0.02,                                        // speed
            20,                                          // how many
        );
        Some(InteractionResult::Success)
    }
}

#[mod_api::horizon_mod]
impl Hooks for Mod {
    fn register(&self, r: &mut dyn Registrar, _: &RegistrationContext) {
        let _ = FLAME.set(r.particle_key("minecraft:flame"));
        let burner = r.block_key("my_mod:burner");
        r.block_part(burner, Burner);
    }
}
```

Give `my_mod:burner` its block JSON as in [the chime](#play-a-sound-in-the-world).

- `particle_key` takes any vanilla particle id (`minecraft:smoke`, `minecraft:heart`...). An unknown id is reported when the game loads.
- Block particles (`minecraft:block`, `falling_dust`...) need a block state in place of `None`.
- Item particles: `ParticleOptions::item_stack(item_key, stack)`. See [Server item particles](/docs/modding/how-to/native-mods/server-item-particles).
- `true` means queued, not drawn: players' particle settings still apply.

**Try it:** place it, right-click it.

**Common mistakes:**

- Calling `particle_key` inside a hook. Ask once in `register` and keep the key.
- `count` 0: it sends one particle that moves along `spread`, as vanilla does.
- Trail and vibration particles: the server refuses them.

## Particles only this player sees

**Status:** Works today.

```rust
// In a client hook with `host: &mut dyn ClientHost`:
if let Some(key) = FLAME.get() {
    host.add_particle(&ParticleOptions::simple(*key), [0.5, 65.0, 0.5], [0.0, 0.05, 0.0]);
}
```

- Position, then velocity, in blocks.
- It needs a loaded world: `false` on the title screen.
- Limit how often you call it: once per frame adds up fast.
- Breaking or eating particles of an item: `host.item_particle_options(&stack)` gives the options.

More: [Client particles](/docs/modding/how-to/native-mods/particles-and-bot-movement).

## A particle of your own

**Status:** Works today, as a sprite particle with declared movement. Only players who have your mod see it.

**You get:** `my_mod:spark`, drawn with your own texture.

**File:** `assets/my_mod/particles/spark.json`

```json
{
  "textures": ["my_mod:spark_0", "my_mod:spark_1", "my_mod:spark_2"],
  "horizon:behaviour": {
    "velocity": [0, 0.05, 0],
    "velocity_jitter": [0.02, 0, 0.02],
    "gravity": 0.1,
    "friction": 0.96,
    "lifetime": 20,
    "size": [0.2, 0.05],
    "alpha": [1, 0],
    "animation": "age"
  }
}
```

**Files:** `assets/my_mod/textures/particle/spark_0.png`, `spark_1.png`, `spark_2.png`

Then ask for its key, as for a vanilla one:

```rust
let _ = SPARK.set(r.particle_key("my_mod:spark"));
```

- The file's path names the particle: `assets/my_mod/particles/spark.json` is `my_mod:spark`. There is no registry file to add.
- Use it with `send_particles` (server) or `add_particle` (client) like any other key.
- `horizon:behaviour` is optional, and every key in it too. It is Sunrise's own addition to vanilla's format:
  - `velocity`, `velocity_jitter`: blocks per tick, added to the velocity the spawn call gives (each axis up to 16).
  - `gravity`, `friction` (0 to 1), `lifetime` (1 to 12000 ticks).
  - `size` and `alpha` (0 to 1): from the first number to the second over its life.
  - `animation`: `age` (first to last sprite over its life), `loop` (with `frame_ticks`), `random` or `first`.
- A value out of range or an unknown key: the whole `horizon:behaviour` is ignored, with a warning in the log.
- Movement beyond these keys (a Java `Particle` subclass): **Not yet**.

**Try it:** spawn it with the burner above, using `SPARK` in place of `FLAME`.

## What isn't here yet

- **A particle class of your own** with code for its movement or rendering. **Workaround:** the `horizon:behaviour` keys above, or many particles spawned from code, each with its own velocity.
- **Custom block sound sets.** A block's `"sounds"` property takes a vanilla block's set, such as `"minecraft:amethyst_block"`. **Workaround:** play your own sound from a `BlockPart`, as in [the chime](#play-a-sound-in-the-world).
- More gaps: [API gaps: sounds](/api-gaps#sounds) and [particles](/api-gaps#particles).
