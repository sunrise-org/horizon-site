# Recipes: menus, screens and the HUD

Put things on the player's screen: a container menu, a screen you draw yourself with buttons, and your own piece of the HUD. Everything goes into the same mod: the menu's JSON in `data/`, its textures in `assets/`, the code in `src/lib.rs`.

Every recipe here needs the Rust part of a mod: start with `cargo horizon-mod new my_mod --template native`, or add code to a mod you have ([Add code to your mod](/docs/mod-code)).

> [!NOTE] Checked against `bfbda6a`
> Every hook, type and file path below was checked against Ari's repository at commit `bfbda6a`. The snippets were checked against the API's declarations, not compiled one by one.

## Where menus come from

In Sunrise a menu belongs to a **block entity**. There are two kinds:

- **A vanilla menu** (chest, dispenser, hopper, furnace): you pick it, the game draws it.
- **A menu type of your own**: you say how many slots it has, and you draw its screen.

Both start from a block with a block entity. If you haven't made one, read [Block entities](/docs/recipes-block-entities) first.

## A chest-style storage menu

**Status:** Works today.

**You get:** a block that opens vanilla's 3 × 3 dispenser menu, with 9 slots saved in the world.

This is the [storage block recipe](/docs/recipes-block-entities#a-storage-block-with-a-menu). The short version: answer `block_entity_container` with a `ModContainer` whose `menu` is a vanilla menu id, such as `"minecraft:generic_9x3"`, and whose `slots` matches that menu.

## A machine with its own screen, a progress bar and a button

**Status:** Partly. It works for players on Sunrise (Horizon) clients. Other clients get nothing when they open it, and clicks are not predicted on the client yet.

**You get:** a "press" block with 2 slots. Its screen draws a progress bar that fills as the block ticks, and a red square you click to reset it.

**File:** `data/my_mod/horizon/block/press.json`

```json
{ "template": "minecraft:chest" }
```

Give it a full-cube model, as in [A plain block](/docs/recipes-blocks#a-plain-block). The template must be a block that opens a menu.

**File:** `data/my_mod/horizon/menu/press.json`

```json
{ "slots": 2, "data_slots": 1, "results": [1] }
```

- `slots`: how many slots the block has (1 to 256). The player's 36 come after them.
- `data_slots`: numbers the server sends to the screen (0 to 256). Here, one: the progress.
- `results`: slots players can only take from, like a furnace's output.

This makes the menu type `my_mod:press`.

**File:** `src/lib.rs`

```rust
use mod_api::*;

const PRESS: &str = "my_mod:press";

#[derive(Default)]
struct Mod;

struct Press;

#[mod_api::horizon_part]
impl BlockPart for Press {}

#[mod_api::horizon_part]
impl BlockEntityPart for Press {
    // Tick on the server.
    fn block_entity_ticks(&self, _: &dyn Host, event: &mut BlockEntityTicksEvent<'_>) {
        event.ticks = true;
    }

    // Each tick: move the progress on, and copy it into the menu's data slot.
    fn block_entity_tick(&self, _: &mut dyn ServerHost, event: &mut BlockEntityTickEvent<'_>) {
        let progress = match event.entity.nbt.get(&"progress".into()) {
            Some(Tag::Int(n)) => (*n + 1).min(100),
            _ => 0,
        };
        event.entity.nbt.insert("progress".into(), Tag::Int(progress));
        // `data` is what the screen reads. It is not saved: refill it each tick.
        event.entity.data = vec![progress];
    }

    // Client and server: the screen's size and where each slot sits.
    fn screen(&self, _: &dyn Host, _: &mut ScreenEvent<'_>) -> Option<Screen> {
        Some(Screen {
            width: 176.0,
            height: 166.0,
            slots: vec![Some([44.0, 35.0]), Some([116.0, 35.0])],
            inventory_x: 8.0,
            inventory_y: 84.0,
            ..Screen::default()
        })
    }

    // Client, each frame: draw over the plain panel.
    fn screen_draw(&self, _: &dyn ClientHost, event: &mut ScreenDrawEvent<'_>) {
        let [x, y] = event.origin; // the screen's top left, in GUI pixels
        // `data` is empty until the server's first values arrive: use `get`.
        let progress = event.data.first().copied().unwrap_or(0) as f32;
        event.draw.fill([x + 66.0, y + 38.0, 44.0, 6.0], 0xFF373737); // the bar's track
        event.draw.fill([x + 66.0, y + 38.0, 44.0 * progress / 100.0, 6.0], 0xFF55FF55);
        event.draw.fill([x + 152.0, y + 6.0, 16.0, 16.0], 0xFFAA0000); // the reset button
    }

    // Client: a click on no slot. Return a button id to send it to the server.
    fn screen_click(&self, _: &dyn ClientHost, event: &mut ScreenClickEvent<'_>) -> Option<i32> {
        let [cx, cy] = event.at; // relative to the screen's top left
        let on_button = (152.0..168.0).contains(&cx) && (6.0..22.0).contains(&cy);
        on_button.then_some(0) // button id 0
    }

    // Server: a player pressed a button. Check the id, then change the block entity.
    fn menu_button(&self, _: &mut dyn ServerHost, event: &mut MenuButtonEvent<'_>) {
        if event.context.id == 0 {
            event.entity.nbt.insert("progress".into(), Tag::Int(0));
        }
    }
}

#[mod_api::horizon_mod]
impl Hooks for Mod {
    fn register(&self, r: &mut dyn Registrar, _: &RegistrationContext) {
        let kind = r.block_entity_type("press").blocks(&[PRESS]).build();
        r.block_entity_part(&kind, Press).expect("native block entity type");
    }

    // The block's slots, and the menu type that shows them.
    fn block_entity_container(
        &self,
        _: &dyn Host,
        event: &mut BlockEntityContainerEvent<'_>,
    ) -> Option<ModContainer> {
        (event.block == PRESS).then(|| ModContainer {
            slots: 2,
            faces: std::array::from_fn(|_| vec![0, 1]),
            inputs: vec![0],
            outputs: vec![1],
            menu: Some("my_mod:press".into()),
        })
    }
}
```

What runs where:

- `block_entity_tick` and `menu_button` run on the **server**. They own the data.
- `screen_draw` and `screen_click` run on the **client**. They only draw and ask.
- `screen` runs on **both**: the server uses it to know which slots exist.

**Try it:** build into your test instance, place the press, right-click it. The bar fills over 5 seconds. Click the red square: it empties.

**Common mistakes:**

- `slots` in `ModContainer` differs from `slots` in `menu/press.json`: the menu won't open.
- Changing data in `screen_click`. The client can't: send a button id and change it in `menu_button`.
- Reading `event.data[0]`: it panics on the first frames, before the server's values arrive.
- A data slot holds 16 bits on the wire, as in vanilla. A bigger number wraps.
- Trusting the button id: any client can send any id. Check it in `menu_button`.

> [!TIP] Draw a texture instead of boxes
> `event.draw.sprite("my_mod:gui/press", src, dst, None)` draws part of a GUI sprite. Set `own_background: true` in `Screen` to draw the whole background yourself. The complete working example is the machine in [horizon-machine-sample](https://github.com/arismoko/horizon-machine-sample).

More: [Menu types](/docs/modding/how-to/content-mods#menu-types), [A menu's slots](/docs/modding/concepts/trait-mods/a-menus-slots), [Declaring a machine's menu data](/docs/modding/how-to/block-entities).

## A HUD element of your own

**Status:** Works today.

**You get:** a line of text and a bar drawn just above the hotbar, as its own HUD layer. Other mods can hide it or draw around it, as they do vanilla's layers.

**File:** `src/lib.rs`

```rust
use mod_api::*;

const LAYER: &str = "my_mod:mana_bar";

#[derive(Default)]
struct Mod;

#[mod_api::horizon_mod]
impl Hooks for Mod {
    // Client, once at start: add the layer and say where it goes.
    fn register_gui_layers(&self, _: &RegistrationContext, event: &mut RegisterGuiLayersEvent<'_>) {
        event.layers.push(GuiLayer {
            id: LAYER.into(),
            placement: GuiLayerPlacement::Above("minecraft:hotbar".into()),
        });
    }

    // Client, each frame: every mod is asked about every layer. Draw only yours.
    fn gui_layer_draw(&self, _: &dyn ClientHost, event: &mut GuiLayerDrawEvent<'_>) {
        if event.layer != LAYER {
            return;
        }
        let [width, height] = event.draw.size(); // the GUI's size, in GUI pixels
        let x = width / 2.0 - 40.0;
        let y = height - 52.0;
        event.draw.fill([x, y, 80.0, 5.0], 0xFF202040); // background
        event.draw.fill([x, y, 50.0, 5.0], 0xFF4060FF); // filled part
        event.draw.text("Mana", [x, y - 10.0], 0xFFFFFFFF, true);
    }
}
```

- Colours are `0xAARRGGBB`. `0xFF` at the front means opaque.
- Rectangles are `[x, y, width, height]` in GUI pixels.
- `GuiLayerPlacement` is `BelowAll`, `Below(id)`, `Above(id)` or `AboveAll`. Vanilla's layer ids: `minecraft:crosshair`, `hotbar`, `effects`, `boss_overlay`, `vehicle_health`, `contextual_info_bar`, `player_health`, `selected_item_name`, `sleep_overlay`, `overlay_message`, `title`, `scoreboard_sidebar`, `subtitle_overlay`, `chat`, `tab_list`.

**Try it:** build, open a world: the bar sits above the hotbar. Press F1: it hides with the rest of the HUD.

**Common mistakes:**

- Forgetting the `if event.layer != LAYER` check: your bar is drawn once per layer, every frame.
- An id in the `minecraft` namespace, or one registered twice: it is logged and left out.
- Placing it `Above` a mod layer that isn't registered yet: it is left out. Place against vanilla's layers, or your own pushed earlier.

> [!TIP] Show a real value
> The 50 above is fixed. To show a number the server keeps, such as mana, store it in a synced attachment and read it here: see [A value on the player that the HUD shows](/docs/recipes-saved-data#a-value-on-the-player-that-the-hud-shows).

## Hide or wrap a vanilla HUD part

**Status:** Works today.

**You get:** no vanilla health, armor and food rows. Draw your own in their place if you like.

```rust
fn gui_layer_pre(&self, _: &dyn ClientHost, event: &mut GuiLayerPreEvent<'_>) -> Flow {
    if event.layer == "minecraft:player_health" {
        return Flow::Cancel; // hide this layer this frame
    }
    Flow::Continue
}
```

- Draw in `gui_layer_pre` to put something **under** a layer, in `gui_layer_post` to put it **over**.
- To replace a vanilla layer: cancel it here and draw your own in a layer of your own.

## A box in a corner of the HUD

**Status:** Works today.

`render_gui_post` runs after the whole HUD is drawn, with `event.draw` and `event.corners`, which stacks boxes so several mods don't overlap in the same corner. Use it for an info box; use a GUI layer (above) for anything that must sit among vanilla's layers. Details: [the hook notes](/docs/modding/reference/hook-notes).

## A screen with no block behind it

**Status:** Works today, on the client only. It has no slots and no server menu: for items, use a block entity's menu (above) or [a server chest menu](#a-chest-menu-of-buttons-opened-by-the-server).

**You get:** `/mymenu` opens a screen of your own over the world. Clicking its button plays a click. Escape closes it.

**File:** `src/lib.rs`

```rust
use mod_api::*;

const MOD_ID: &str = "my_mod";
const BUTTON: [f32; 4] = [0.0, 0.0, 80.0, 20.0]; // x, y, w, h from the panel's centre

#[derive(Default)]
struct Mod;

// The button's rectangle, centred in the window.
fn button_rect(screen: &ScreenView<'_>) -> [f32; 4] {
    let [_, _, w, h] = screen.rect; // a screen with no panel: the whole window
    [w / 2.0 - 40.0 + BUTTON[0], h / 2.0 - 10.0 + BUTTON[1], BUTTON[2], BUTTON[3]]
}

#[mod_api::horizon_mod]
impl Hooks for Mod {
    // A client command, so the player can open it.
    fn register_client_commands(&self, _: &mut dyn ClientHost, event: &mut RegisterClientCommandsEvent<'_>) {
        event.commands.push(Command::new("mymenu"));
    }

    fn command(&self, host: &mut dyn ClientHost, event: &mut CommandEvent<'_>) -> Flow {
        if event.command != "mymenu" {
            return Flow::Continue;
        }
        host.mod_screen_open(MOD_ID); // false if another screen is open
        Flow::Cancel // we ran it
    }

    // Every screen fires this: draw only on your own.
    fn screen_render_post(&self, host: &dyn ClientHost, event: &mut ScreenRenderPostEvent<'_>) {
        if host.mod_screen() != Some(MOD_ID) {
            return;
        }
        let [x, y, w, h] = button_rect(event.screen);
        event.draw.fill([x, y, w, h], 0xFF3C3C8C);
        event.draw.text("Click me", [x + 18.0, y + 6.0], 0xFFFFFFFF, true);
    }

    fn screen_mouse_button_pressed_pre(
        &self,
        host: &dyn ClientHost,
        event: &mut ScreenMouseButtonPressedPreEvent<'_>,
    ) -> Flow {
        if host.mod_screen() != Some(MOD_ID) || event.button != 0 {
            return Flow::Continue;
        }
        let [x, y, w, h] = button_rect(event.screen);
        let [mx, my] = event.screen.mouse; // the pointer, in GUI pixels
        if mx >= x && mx < x + w && my >= y && my < y + h {
            host.play_local_sound(&SoundPlay::ui("minecraft:ui.button.click"), 0);
            return Flow::Cancel; // the press goes no further
        }
        Flow::Continue
    }
}
```

- Every mod's own screen reports the screen id `mod`. Check `host.mod_screen()` before drawing or taking clicks, or you draw on other mods' screens.
- The screen doesn't pause a single-player game, as the inventory doesn't.
- Keys, scrolling and typing have their own `screen_*_pre` hooks, with the same check.

**Try it:** build, open a world, type `/mymenu`, click the button, press Escape.

**Common mistakes:**

- Forgetting the `mod_screen()` check in one of the hooks.
- Changing world state from a click: this runs on the client. Send a message to the server instead ([Networking](/docs/recipes-networking)).
- A gamepad can close the screen but not click on it.

## A chest menu of buttons, opened by the server

**Status:** Works today. It works for every client, vanilla ones too: it is a vanilla chest menu.

**You get:** `/warps` opens a one-row chest. Clicking the diamond says so and closes the menu. Items can't be taken out.

**File:** `src/lib.rs`

```rust
use mod_api::*;
use std::sync::OnceLock;

static DIAMOND: OnceLock<ItemKey> = OnceLock::new();

#[derive(Default)]
struct Mod;

#[mod_api::horizon_mod]
impl Hooks for Mod {
    fn register(&self, r: &mut dyn Registrar, _: &RegistrationContext) {
        let _ = DIAMOND.set(r.item_key("minecraft:diamond")); // ask for item keys once, at start
    }

    fn register_commands(&self, _: &mut dyn ServerHost, event: &mut RegisterCommandsEvent<'_>) {
        event.commands.push(Command::new("warps"));
    }

    fn run_mod_command(&self, host: &mut dyn ServerHost, event: &mut RunModCommandEvent<'_>) -> Flow {
        if event.command.literals.first().map(String::as_str) != Some("warps") {
            return Flow::Continue;
        }
        let CommandSource::Player { player, .. } = event.source else {
            return Flow::Cancel; // not a player: nothing to open
        };
        let uuid = player.uuid();
        let items = vec![None, None, None, None, DIAMOND.get().map(|key| ItemStack::of(*key))];
        // 1 row, a title, the items by slot.
        let _ = host.open_menu(uuid, 1, Text::literal("Warps"), items);
        Flow::Cancel
    }

    // A click in a menu a mod opened. It moves nothing: you decide what happens.
    fn menu_clicked(&self, host: &mut dyn ServerHost, event: &mut MenuClickedEvent) {
        if event.slot == 4 {
            if let Some(player) = host.player(event.uuid) {
                let _ = player.tell(host, Text::literal("You picked the diamond"));
            }
            host.close_menu(event.uuid);
        }
    }
}
```

**Try it:** `/warps`, click the diamond.

**Common mistakes:**

- Assuming `menu_clicked` is only for your menu: it fires for every menu any mod opened. Remember the window id `open_menu` returns if you open more than one.
- `rows` must be 1 to 6. Missing slots are padded with empty ones.

## What isn't here yet

- **Screens on non-Horizon clients.** A mod menu type shows nothing on them.
- **Client-predicted clicks** in mod menus: each click waits for the server.
- **A Java-style `Screen` class** with widgets. You draw with `fill`, `sprite`, `text` and `item`, and handle clicks yourself.
- More gaps: [API gaps: GUI](/api-gaps#gui).
