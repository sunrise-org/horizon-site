# Build your first block

Build a Glowing Amethyst block that gives light, has an item, and drops when mined with a pickaxe. It is a content mod: one folder of data and assets, packed into one `.hmod`, with no code. Every file below is what the tool writes at the commit these guides were [checked against](/docs/make-a-mod#which-build-these-guides-follow).

## Create the project

Install `cargo horizon-mod` from the [quickstart](/docs/make-a-mod#install-the-tool), then run:

```sh
cargo horizon-mod new sunrise_example --name "Sunrise Example"
cd sunrise_example
```

The generator writes these files. Paths inside `assets/` and `data/` use the mod’s namespace, `sunrise_example`, except for the vanilla pickaxe tag.

```text
sunrise_example/
├── horizon-mod.toml
├── assets/sunrise_example/
│   ├── blockstates/glowing_amethyst.json
│   ├── items/glowing_amethyst.json
│   ├── lang/en_us.json
│   └── models/block/glowing_amethyst.json
└── data/
    ├── minecraft/tags/block/mineable/pickaxe.json
    └── sunrise_example/
        ├── horizon/block/glowing_amethyst.json
        ├── loot_table/blocks/glowing_amethyst.json
        └── recipe/glowing_amethyst.json
```

## Declare the mod and block

`horizon-mod.toml` identifies the mod. The `registries` capability allows it to add content.

```toml
id = "sunrise_example"
name = "Sunrise Example"
version = "0.1.0"
description = ""
authors = []
api = "0.2"
side = "both"
capabilities = ["registries"]
```

In `data/sunrise_example/horizon/block/glowing_amethyst.json`, copy the vanilla amethyst block and override its hardness and light level.

```json
{
  "template": "minecraft:amethyst_block",
  "properties": { "hardness": 2.0, "light": 7 }
}
```

## Give it a model and a name

`assets/sunrise_example/blockstates/glowing_amethyst.json` maps the block’s default state to its model.

```json
{
  "variants": {
    "": { "model": "sunrise_example:block/glowing_amethyst" }
  }
}
```

`assets/sunrise_example/models/block/glowing_amethyst.json` uses the vanilla amethyst texture on every face.

```json
{
  "parent": "minecraft:block/cube_all",
  "textures": { "all": "minecraft:block/amethyst_block" }
}
```

`assets/sunrise_example/items/glowing_amethyst.json` uses the same model for the inventory item.

```json
{
  "model": {
    "type": "minecraft:model",
    "model": "sunrise_example:block/glowing_amethyst"
  }
}
```

`assets/sunrise_example/lang/en_us.json` gives the block its display name.

```json
{
  "block.sunrise_example.glowing_amethyst": "Glowing Amethyst"
}
```

## Set its drop and recipe

`data/sunrise_example/loot_table/blocks/glowing_amethyst.json` makes the block drop itself.

```json
{
  "type": "minecraft:block",
  "pools": [
    {
      "condition": { "type": "minecraft:survives_explosion" },
      "entries": [{ "type": "minecraft:item", "name": "sunrise_example:glowing_amethyst" }],
      "rolls": 1
    }
  ],
  "random_sequence": "sunrise_example:blocks/glowing_amethyst"
}
```

The pickaxe tag at `data/minecraft/tags/block/mineable/pickaxe.json` marks the block as mineable with that tool.

```json
{
  "values": ["sunrise_example:glowing_amethyst"]
}
```

`data/sunrise_example/recipe/glowing_amethyst.json` combines an amethyst block and glowstone dust.

```json
{
  "type": "minecraft:crafting_shapeless",
  "category": "building",
  "ingredients": ["minecraft:amethyst_block", "minecraft:glowstone_dust"],
  "result": { "id": "sunrise_example:glowing_amethyst" }
}
```

## Build and try it

From the project folder, pack the mod and run the registry's checks on the file:

```sh
cargo horizon-mod build
cargo horizon-mod check target/horizon-mod/sunrise_example.hmod
```

`build` writes one file, `target/horizon-mod/sunrise_example.hmod`: a zip of the manifest and the eight files above. `check` answers:

```text
sunrise_example 0.1.0 (mod, API 0.2, both)
  2524 bytes, SHA-256 15c72c05…, unsigned
  may add blocks, items, mob effects and entity types to your worlds
  no code: content only, nothing to run
```

Then play it. `run` builds again and starts the game with the mod turned on. It finds `horizon-client` on your `PATH`, or takes it from `--game`:

```sh
cargo horizon-mod run --game /path/to/horizon-client
```

Open a test world with commands enabled. Give yourself the block, place it in a dark spot, then switch to Survival and break it with a pickaxe to check its drop.

```text
/give @s sunrise_example:glowing_amethyst
```

The game reads content once when it starts: after a change to a file, run it again.

## Where to go next

- More blocks, items, creative tabs and fluids: [Making a content mod](/docs/modding/how-to/content-mods) in the book.
- Behaviour, such as a response when a player uses the block: [the typed mod API](/docs/mod-code#your-first-typed-hook). The Rust goes in this same folder.
- Sharing it: [test](/docs/test-a-mod), then [publish](/docs/publish-a-mod).
