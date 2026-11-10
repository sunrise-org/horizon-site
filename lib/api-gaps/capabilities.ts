// Curated rows, seeded once by scripts/api-gaps-extract.mjs from an api-gaps.html export; edit by hand.
import type { Curated } from "./types";

export const curated: Curated = {
  "eyebrow": "Horizon / Native mod API",
  "title": "Native mod API gaps",
  "lede": "Find which capabilities are on main, which have work in review, and where to start investigating a gap. Coverage describes the specific seam in each row. It does not certify end-to-end behavior or full NeoForge parity.",
  "reviewed": {
    "date": "2026-11-10",
    "commit": "cf0113879ebee600bff86070466f75b2db90b40a"
  },
  "docs": "NeoForge 26.1 docs and 26.3 release notes",
  "hub": [
    {
      "text": "Horizon repository",
      "href": "https://github.com/arismoko/horizon"
    },
    {
      "text": "Modding book",
      "href": "https://arismoko.github.io/horizon/"
    },
    {
      "text": "Xmilon’s open PRs",
      "href": "https://github.com/arismoko/horizon/pulls?q=is%3Apr+is%3Aopen+author%3AXmilon"
    },
    {
      "text": "Up for grabs",
      "href": "https://github.com/users/arismoko/projects/1/views/2"
    },
    {
      "text": "Project tracker",
      "href": "https://github.com/arismoko/horizon/issues/771"
    },
    {
      "text": "NeoForge guides",
      "href": "https://docs.neoforged.net/docs/concepts/registries/"
    },
    {
      "text": "26.3 changelog",
      "href": "https://maven.neoforged.net/releases/net/neoforged/neoforge/26.3.0.102/neoforge-26.3.0.102-changelog.txt"
    },
    {
      "text": "Browse capabilities",
      "href": "#comparison"
    },
    {
      "text": "Evidence inventory",
      "href": "#evidence"
    }
  ],
  "claimable": {
    "intro": [
      "Open issues with a public design or implementation outline, no public claim and no linked PR in the ",
      {
        "text": "Up for grabs board snapshot",
        "href": "https://github.com/users/arismoko/projects/1/views/2"
      },
      "."
    ],
    "items": [
      {
        "number": 2690,
        "title": "Let mods register configuration-phase tasks for a joining player",
        "note": [
          "The issue specifies the registrar, completion gate and timeout fixture. Typed payload work is a dependency. ",
          {
            "text": "#813",
            "href": "https://github.com/arismoko/horizon/issues/813"
          },
          " · open · no public claim found"
        ]
      },
      {
        "number": 2740,
        "title": "mob_submit can't read a mob's synced attachments",
        "note": [
          "The maintainer outlined a direct immutable existing-value lookup and asked for client-sync and stale-handle coverage."
        ]
      }
    ],
    "more": [
      [
        "Excluded from this list: ",
        {
          "text": "#815",
          "href": "https://github.com/arismoko/horizon/issues/815"
        },
        " · open · OlaHulleberg posted a claim before the maintainer reopened claiming (review the claim chronology and open evidence PR before taking this on), ",
        {
          "text": "#2554",
          "href": "https://github.com/arismoko/horizon/issues/2554"
        },
        " both scopes (claimed by Xmilon with PRs open), ",
        {
          "text": "#2640",
          "href": "https://github.com/arismoko/horizon/issues/2640"
        },
        " (reporter has a working fork implementation and offered to port it), and ",
        {
          "text": "#857",
          "href": "https://github.com/arismoko/horizon/issues/857"
        },
        " (the design still calls for approval of the worker contract)."
      ],
      [
        "Other candidates to investigate: ",
        {
          "text": "#860 non-mob entity renderers",
          "href": "https://github.com/arismoko/horizon/issues/860"
        },
        " and ",
        {
          "text": "#867 typed frame passes",
          "href": "https://github.com/arismoko/horizon/issues/867"
        },
        ". Both have written scope. Check for linked or overlapping PRs before claiming. ",
        {
          "text": "#897 entity render state",
          "href": "https://github.com/arismoko/horizon/issues/897"
        },
        " was reopened to claim after Ola’s comment and needs a shared render-preparation boundary."
      ]
    ]
  },
  "comparison": {
    "intro": [
      "Partial includes a narrower seam or an implementation in review. Missing means the reviewed surface has no implementation, including cases with a design or evidence PR."
    ]
  },
  "areas": [
    {
      "id": "blocks",
      "name": "Blocks"
    },
    {
      "id": "items",
      "name": "Items"
    },
    {
      "id": "entities",
      "name": "Entities"
    },
    {
      "id": "registries",
      "name": "Registries"
    },
    {
      "id": "datapack-registries",
      "name": "Datapack registries"
    },
    {
      "id": "events",
      "name": "Events"
    },
    {
      "id": "networking",
      "name": "Networking"
    },
    {
      "id": "capabilities",
      "name": "Capabilities"
    },
    {
      "id": "data-attachments",
      "name": "Data attachments"
    },
    {
      "id": "data-maps",
      "name": "Data maps"
    },
    {
      "id": "loot",
      "name": "Loot"
    },
    {
      "id": "worldgen",
      "name": "Worldgen"
    },
    {
      "id": "rendering",
      "name": "Rendering"
    },
    {
      "id": "gui",
      "name": "GUI"
    },
    {
      "id": "resources",
      "name": "Resources"
    },
    {
      "id": "data-generation",
      "name": "Data generation"
    },
    {
      "id": "commands",
      "name": "Commands"
    },
    {
      "id": "configuration",
      "name": "Configuration"
    },
    {
      "id": "sounds",
      "name": "Sounds"
    },
    {
      "id": "particles",
      "name": "Particles"
    },
    {
      "id": "tags",
      "name": "Tags"
    },
    {
      "id": "recipes",
      "name": "Recipes"
    },
    {
      "id": "advancements",
      "name": "Advancements"
    },
    {
      "id": "dimensions",
      "name": "Dimensions"
    },
    {
      "id": "biome-modifiers",
      "name": "Biome modifiers"
    },
    {
      "id": "structure-modifiers",
      "name": "Structure modifiers"
    },
    {
      "id": "fluids",
      "name": "Fluids"
    },
    {
      "id": "saved-data",
      "name": "Saved data"
    },
    {
      "id": "java-integration",
      "name": "Java integration"
    },
    {
      "id": "mod-tooling-and-runtime",
      "name": "Mod tooling and runtime"
    },
    {
      "id": "input-and-effects",
      "name": "Input and effects"
    },
    {
      "id": "world-and-player-services",
      "name": "World and player services"
    }
  ],
  "capabilities": [
    {
      "area": "blocks",
      "title": "Block declarations, states and placement",
      "status": "Covered",
      "note": "Block Parts expose declared content, state facts and placement callbacks.",
      "refs": [],
      "sources": [
        "crates/horizon-mod-vocab/src/parts/blocks.rs",
        "crates/horizon-mod-vocab/src/host/block_states.rs",
        "crates/horizon-mod-vocab/src/hooks/state_for_placement.rs"
      ],
      "counterpart": [
        [
          {
            "text": "26.1 docs",
            "href": "https://docs.neoforged.net/docs/blocks/"
          },
          " · 26.3 unverified"
        ]
      ]
    },
    {
      "area": "blocks",
      "title": "Ticks, neighbour notifications and redstone",
      "status": "Covered",
      "note": "Random and scheduled ticks, neighbour notifications and signal queries have dedicated seams.",
      "refs": [],
      "sources": [
        "crates/horizon-mod-vocab/src/hooks/random_tick.rs",
        "crates/horizon-mod-vocab/src/hooks/tick_block.rs",
        "crates/horizon-mod-vocab/src/hooks/neighbor_notify.rs",
        "crates/horizon-mod-vocab/src/hooks/block_signal.rs"
      ],
      "counterpart": [
        [
          {
            "text": "26.1 docs",
            "href": "https://docs.neoforged.net/docs/blocks/"
          },
          " · 26.3 unverified"
        ]
      ]
    },
    {
      "area": "blocks",
      "title": "Block entities, persistence and synchronization",
      "status": "Covered",
      "note": "Block-entity types, ticks and update tags have typed APIs.",
      "refs": [],
      "sources": [
        "crates/horizon-mod-vocab/src/parts/block_entities.rs",
        "crates/horizon-mod-vocab/src/hooks/block_entity_tick.rs",
        "crates/horizon-mod-vocab/src/hooks/block_entity_update_tag.rs",
        "docs/modding/src/how-to/block-entities.md"
      ],
      "counterpart": [
        [
          {
            "text": "26.1 docs",
            "href": "https://docs.neoforged.net/docs/blocks/"
          },
          " · 26.3 unverified"
        ]
      ]
    },
    {
      "area": "blocks",
      "title": "Block connections and item post-placement",
      "status": "Partial",
      "note": "Connection and placement seams exist. The precise post-placement contract is separate from the placement state callback.",
      "refs": [],
      "sources": [
        "crates/horizon-mod-vocab/src/hooks/connects_to.rs",
        "crates/horizon-mod-vocab/src/hooks/state_for_placement.rs"
      ],
      "counterpart": [
        [
          {
            "text": "26.1 docs",
            "href": "https://docs.neoforged.net/docs/blocks/"
          },
          " · 26.3 unverified"
        ],
        [
          {
            "text": "26.3 change notes",
            "href": "https://maven.neoforged.net/releases/net/neoforged/neoforge/26.3.0.102/neoforge-26.3.0.102-changelog.txt"
          },
          " ",
          {
            "text": "#3599",
            "href": "https://github.com/neoforged/NeoForge/pull/3599"
          },
          ", ",
          {
            "text": "#3598",
            "href": "https://github.com/neoforged/NeoForge/pull/3598"
          }
        ]
      ]
    },
    {
      "area": "items",
      "title": "Item declarations and behaviour",
      "status": "Covered",
      "note": "Item Parts handle use, tool modification and inventory ticks.",
      "refs": [],
      "sources": [
        "crates/horizon-mod-vocab/src/parts/items.rs",
        "crates/horizon-mod-vocab/src/hooks/inventory_tick.rs",
        "crates/horizon-mod-vocab/src/hooks/block_tool_modification.rs"
      ],
      "counterpart": [
        [
          {
            "text": "26.1 docs",
            "href": "https://docs.neoforged.net/docs/items/"
          },
          " · 26.3 unverified"
        ]
      ]
    },
    {
      "area": "items",
      "title": "Custom data components and defaults",
      "status": "Covered",
      "note": "The catalog exposes component type declarations and item-default changes alongside stack values.",
      "refs": [],
      "sources": [
        "crates/horizon-mod-vocab/src/hooks/component_types.rs",
        "crates/horizon-mod-vocab/src/hooks/modify_default_components.rs",
        "crates/horizon-mod-vocab/src/hooks/item_components.rs"
      ],
      "counterpart": [
        [
          {
            "text": "26.1 docs",
            "href": "https://docs.neoforged.net/docs/items/"
          },
          " · 26.3 unverified"
        ]
      ]
    },
    {
      "area": "items",
      "title": "Creative inventory contributions",
      "status": "Covered",
      "note": "The catalog provides a creative tab contents hook.",
      "refs": [],
      "sources": [
        "crates/horizon-mod-vocab/src/hooks/build_creative_mode_tab_contents.rs"
      ],
      "counterpart": [
        [
          {
            "text": "26.1 docs",
            "href": "https://docs.neoforged.net/docs/items/"
          },
          " · 26.3 unverified"
        ]
      ]
    },
    {
      "area": "items",
      "title": "Tools, consumables and held-use timing",
      "status": "Covered",
      "note": "Consumable effects and held-use timing are separate typed seams.",
      "refs": [],
      "sources": [
        "crates/horizon-mod-vocab/src/hooks/consume_effect.rs",
        "crates/horizon-mod-vocab/src/hooks/use_duration.rs",
        "crates/horizon-mod-vocab/src/hooks/use_animation.rs"
      ],
      "counterpart": [
        [
          {
            "text": "26.1 docs",
            "href": "https://docs.neoforged.net/docs/items/"
          },
          " · 26.3 unverified"
        ]
      ]
    },
    {
      "area": "entities",
      "title": "General mod entity types",
      "status": "Partial",
      "note": "Entity Parts and goals exist. The broader entity storage and lifecycle contract is still a proposal.",
      "refs": [
        {
          "number": 792,
          "state": "open"
        }
      ],
      "sources": [
        "crates/horizon-mod-vocab/src/parts/entities.rs",
        "docs/modding/src/concepts/general-entity-types.md"
      ],
      "counterpart": [
        [
          {
            "text": "26.1 docs",
            "href": "https://docs.neoforged.net/docs/entities/"
          },
          " · 26.3 unverified"
        ]
      ]
    },
    {
      "area": "entities",
      "title": "Entity attributes, goals and spawn checks",
      "status": "Covered",
      "note": "Existing Parts expose attributes, goals and spawn placement without depending on the general entity type proposal.",
      "refs": [],
      "sources": [
        "crates/horizon-mod-vocab/src/parts/entities.rs",
        "crates/horizon-mod-vocab/src/parts/entity_attributes.rs",
        "crates/horizon-mod-vocab/src/parts/spawn_placements.rs"
      ],
      "counterpart": [
        [
          {
            "text": "26.1 docs",
            "href": "https://docs.neoforged.net/docs/entities/"
          },
          " · 26.3 unverified"
        ]
      ]
    },
    {
      "area": "entities",
      "title": "Entity lifecycle, damage and interaction",
      "status": "Covered",
      "note": "The catalog has explicit join, leave, interaction, damage and death moments.",
      "refs": [],
      "sources": [
        "crates/horizon-mod-vocab/src/hooks/entity_join_level.rs",
        "crates/horizon-mod-vocab/src/hooks/entity_leave_level.rs",
        "crates/horizon-mod-vocab/src/hooks/entity_interact.rs",
        "crates/horizon-mod-vocab/src/hooks/living_damage_pre.rs",
        "crates/horizon-mod-vocab/src/hooks/living_death.rs"
      ],
      "counterpart": [
        [
          {
            "text": "26.1 docs",
            "href": "https://docs.neoforged.net/docs/entities/"
          },
          " · 26.3 unverified"
        ]
      ]
    },
    {
      "area": "entities",
      "title": "Entity rendering registration",
      "status": "Partial",
      "note": "Mob rendering callbacks are present. Custom non-mob renderers are tracked separately.",
      "refs": [
        {
          "number": 860,
          "state": "open"
        },
        {
          "number": 897,
          "state": "open",
          "claim": "OlaHulleberg posted a claim before the maintainer reopened claiming"
        }
      ],
      "sources": [
        "crates/horizon-mod-vocab/src/hooks/mob_submit.rs",
        "docs/modding/src/concepts/entity-render-state.md"
      ],
      "counterpart": [
        [
          {
            "text": "26.1 docs",
            "href": "https://docs.neoforged.net/docs/entities/"
          },
          " · 26.3 unverified"
        ]
      ]
    },
    {
      "area": "registries",
      "title": "Typed registration and registry lookups",
      "status": "Covered",
      "note": "Typed registry keys and game-owned registrars cover supported content families.",
      "refs": [],
      "sources": [
        "crates/horizon-mod-vocab/src/content/registry_keys.rs",
        "crates/horizon-mod-vocab/src/parts/shared.rs",
        "docs/modding/src/concepts/trait-mods/007-registry-keys.md"
      ],
      "counterpart": [
        [
          {
            "text": "26.1 docs",
            "href": "https://docs.neoforged.net/docs/concepts/registries/"
          },
          " · 26.3 unverified"
        ]
      ]
    },
    {
      "area": "registries",
      "title": "General-purpose extension registries",
      "status": "Partial",
      "note": "Existing registration is split into content and Parts. The extension design includes registries for mods to extend the API itself.",
      "refs": [
        {
          "number": 2339,
          "state": "open",
          "claim": "arismoko"
        }
      ],
      "sources": [
        "crates/horizon-mod-vocab/src/parts/shared.rs",
        "docs/modding/src/concepts/mod-extensions.md"
      ],
      "counterpart": [
        [
          {
            "text": "26.1 docs",
            "href": "https://docs.neoforged.net/docs/concepts/registries/"
          },
          " · 26.3 unverified"
        ]
      ]
    },
    {
      "area": "datapack-registries",
      "title": "Mod-owned datapack registry declarations and typed reads",
      "status": "Partial",
      "note": "The design is in main. Registration, candidate storage, world wiring and Host reads are tracked as separate slices. Check their merge states below.",
      "refs": [
        {
          "number": 811,
          "state": "open",
          "claim": "Xmilon"
        },
        {
          "number": 2549,
          "state": "open"
        },
        {
          "number": 2751,
          "state": "open"
        },
        {
          "number": 2756,
          "state": "open"
        },
        {
          "number": 2757,
          "state": "open"
        }
      ],
      "sources": [
        "docs/modding/src/concepts/mod-datapack-registries.md"
      ],
      "counterpart": [
        [
          {
            "text": "26.1 docs",
            "href": "https://docs.neoforged.net/docs/concepts/registries/"
          },
          " · 26.3 unverified"
        ],
        [
          {
            "text": "26.3 change notes",
            "href": "https://maven.neoforged.net/releases/net/neoforged/neoforge/26.3.0.102/neoforge-26.3.0.102-changelog.txt"
          },
          " ",
          {
            "text": "#3527",
            "href": "https://github.com/neoforged/NeoForge/pull/3527"
          },
          ", ",
          {
            "text": "#3572",
            "href": "https://github.com/neoforged/NeoForge/pull/3572"
          },
          ", ",
          {
            "text": "#3659",
            "href": "https://github.com/neoforged/NeoForge/pull/3659"
          }
        ]
      ]
    },
    {
      "area": "datapack-registries",
      "title": "Client snapshot negotiation and reload publication",
      "status": "Partial",
      "note": "The design covers generation-scoped reads, optional or required client sync and publication. Snapshot and join tests are in review. Play-traffic gating, required-registry reconfiguration and wasm client projection remain open.",
      "refs": [
        {
          "number": 811,
          "state": "open",
          "claim": "Xmilon"
        },
        {
          "number": 2769,
          "state": "open"
        },
        {
          "number": 2808,
          "state": "open"
        }
      ],
      "sources": [
        "docs/modding/src/concepts/mod-datapack-registries.md"
      ],
      "counterpart": [
        [
          {
            "text": "26.1 docs",
            "href": "https://docs.neoforged.net/docs/concepts/registries/"
          },
          " · 26.3 unverified"
        ],
        [
          {
            "text": "26.3 change notes",
            "href": "https://maven.neoforged.net/releases/net/neoforged/neoforge/26.3.0.102/neoforge-26.3.0.102-changelog.txt"
          },
          " ",
          {
            "text": "#3527",
            "href": "https://github.com/neoforged/NeoForge/pull/3527"
          },
          ", ",
          {
            "text": "#3659",
            "href": "https://github.com/neoforged/NeoForge/pull/3659"
          }
        ]
      ]
    },
    {
      "area": "events",
      "title": "Side-aware lifecycle and gameplay subscriptions",
      "status": "Covered",
      "note": "The catalog defines side and contract for typed callbacks. Its index includes named counterpart metadata where declared.",
      "refs": [],
      "sources": [
        "crates/horizon-mod-vocab/src/hooks/mod.rs",
        "crates/horizon-mod-vocab/src/hooks/server_started.rs",
        "crates/horizon-mod-vocab/src/hooks/client_setup.rs"
      ],
      "counterpart": [
        [
          {
            "text": "26.1 docs",
            "href": "https://docs.neoforged.net/docs/concepts/events/"
          },
          " · 26.3 unverified"
        ]
      ]
    },
    {
      "area": "events",
      "title": "Listener priorities and event-bus result semantics",
      "status": "Partial",
      "note": "Listen, cancel, collect and replace are explicit hook contracts. Per-event priority parity is unverified.",
      "refs": [],
      "sources": [
        "crates/horizon-mod-vocab/src/hooks/mod.rs",
        "docs/modding/src/concepts/trait-mods.md"
      ],
      "counterpart": [
        [
          {
            "text": "26.1 docs",
            "href": "https://docs.neoforged.net/docs/concepts/events/"
          },
          " · 26.3 unverified"
        ]
      ]
    },
    {
      "area": "networking",
      "title": "Typed payload registration, dispatch and send",
      "status": "Partial",
      "note": "Main exposes named channels and raw bytes. Typed registration, codec negotiation and owned dispatch remain tracked work.",
      "refs": [
        {
          "number": 813,
          "state": "open"
        }
      ],
      "sources": [
        "crates/horizon-mod-vocab/src/content/packets.rs",
        "crates/horizon-mod-vocab/src/host/network.rs",
        "docs/modding/src/concepts/typed-payloads.md"
      ],
      "counterpart": [
        [
          {
            "text": "26.1 docs",
            "href": "https://docs.neoforged.net/docs/networking/payload/"
          },
          " · 26.3 unverified"
        ]
      ]
    },
    {
      "area": "networking",
      "title": "Mod-defined configuration-phase tasks",
      "status": "Missing",
      "note": "Raw channel payloads are available. The join-time task registrar depends on the typed payload work.",
      "refs": [
        {
          "number": 2690,
          "state": "open"
        },
        {
          "number": 813,
          "state": "open"
        }
      ],
      "sources": [
        "docs/modding/src/concepts/typed-payloads.md"
      ],
      "counterpart": [
        [
          {
            "text": "26.1 docs",
            "href": "https://docs.neoforged.net/docs/networking/payload/"
          },
          " · 26.3 unverified"
        ]
      ]
    },
    {
      "area": "capabilities",
      "title": "Item, fluid and energy access",
      "status": "Covered",
      "note": "Parts and transactional providers expose storage and automation through typed handles.",
      "refs": [],
      "sources": [
        "crates/horizon-mod-vocab/src/parts/capabilities.rs",
        "crates/horizon-mod-vocab/src/host/fluids_energy.rs",
        "docs/modding/src/concepts/create-mekanism-capabilities.md"
      ],
      "counterpart": [
        [
          {
            "text": "26.1 docs",
            "href": "https://docs.neoforged.net/docs/inventories/capabilities/"
          },
          " · 26.3 unverified"
        ]
      ]
    },
    {
      "area": "capabilities",
      "title": "Custom capability providers",
      "status": "Covered",
      "note": "The book documents custom providers and limits on capability answers.",
      "refs": [],
      "sources": [
        "crates/horizon-mod-vocab/src/parts/capabilities.rs",
        "docs/modding/src/concepts/trait-mods/022-a-mods-own-capability.md"
      ],
      "counterpart": [
        [
          {
            "text": "26.1 docs",
            "href": "https://docs.neoforged.net/docs/inventories/capabilities/"
          },
          " · 26.3 unverified"
        ]
      ]
    },
    {
      "area": "data-attachments",
      "title": "Typed holder storage, persistence and client sync",
      "status": "Partial",
      "note": "Immutable Host queries can read synced client attachments. A direct per-holder lookup and worker disk callbacks remain separate gaps.",
      "refs": [
        {
          "number": 857,
          "state": "open"
        },
        {
          "number": 2740,
          "state": "open"
        }
      ],
      "sources": [
        "docs/modding/src/how-to/attachments.md",
        "docs/modding/src/concepts/chunk-attachment-disk.md",
        "crates/horizon-mod-vocab/src/hooks/mob_submit.rs"
      ],
      "counterpart": [
        [
          {
            "text": "26.1 docs",
            "href": "https://docs.neoforged.net/docs/datastorage/attachments/"
          },
          " · 26.3 unverified"
        ]
      ]
    },
    {
      "area": "data-attachments",
      "title": "Player copy on death",
      "status": "Covered",
      "note": "The runtime attachment policy includes copy on player death.",
      "refs": [],
      "sources": [
        "docs/modding/src/how-to/attachments.md",
        "crates/horizon-mod-runtime/src/attachments.rs",
        "crates/horizon-mod-vocab/src/hooks/player_clone.rs"
      ],
      "counterpart": [
        [
          {
            "text": "26.1 docs",
            "href": "https://docs.neoforged.net/docs/datastorage/attachments/"
          },
          " · 26.3 unverified"
        ]
      ]
    },
    {
      "area": "data-attachments",
      "title": "Game-session attachments",
      "status": "Partial",
      "note": "Horizon has holder-scoped attachment storage. A matching game-session lifetime and synchronization contract was not established.",
      "refs": [],
      "sources": [
        "docs/modding/src/how-to/attachments.md",
        "crates/horizon-mod-vocab/src/host/mod_state.rs"
      ],
      "counterpart": [
        [
          {
            "text": "26.1 docs",
            "href": "https://docs.neoforged.net/docs/datastorage/attachments/"
          },
          " · 26.3 unverified"
        ],
        [
          {
            "text": "26.3 change notes",
            "href": "https://maven.neoforged.net/releases/net/neoforged/neoforge/26.3.0.102/neoforge-26.3.0.102-changelog.txt"
          },
          " ",
          {
            "text": "#3679",
            "href": "https://github.com/neoforged/NeoForge/pull/3679"
          }
        ]
      ]
    },
    {
      "area": "data-maps",
      "title": "Reloadable registry annotations",
      "status": "Partial",
      "note": "Item and block maps load and reload. Public typed value reads are tracked separately.",
      "refs": [
        {
          "number": 2722,
          "state": "open",
          "claim": "Mayonesu0"
        }
      ],
      "sources": [
        "crates/horizon-mod-vocab/src/hooks/data_map_types.rs",
        "crates/horizon-mod-vocab/src/hooks/data_maps_updated.rs",
        "docs/modding/src/reference/neoforge-data.md"
      ],
      "counterpart": [
        [
          {
            "text": "26.1 docs",
            "href": "https://docs.neoforged.net/docs/resources/server/datamaps/"
          },
          " · 26.3 unverified"
        ],
        [
          {
            "text": "26.3 change notes",
            "href": "https://maven.neoforged.net/releases/net/neoforged/neoforge/26.3.0.102/neoforge-26.3.0.102-changelog.txt"
          },
          " ",
          {
            "text": "#3608",
            "href": "https://github.com/neoforged/NeoForge/pull/3608"
          }
        ]
      ]
    },
    {
      "area": "data-maps",
      "title": "Advanced mergers, removers and client projection",
      "status": "Partial",
      "note": "The audited load path handles pack merge and remove. General mod-defined merge callbacks and network projections were not established.",
      "refs": [
        {
          "number": 2722,
          "state": "open",
          "claim": "Mayonesu0"
        }
      ],
      "sources": [
        "docs/modding/src/reference/neoforge-data.md",
        "crates/horizon-mod-vocab/src/hooks/data_map_types.rs"
      ],
      "counterpart": [
        [
          {
            "text": "26.1 docs",
            "href": "https://docs.neoforged.net/docs/resources/server/datamaps/"
          },
          " · 26.3 unverified"
        ]
      ]
    },
    {
      "area": "loot",
      "title": "Loot tables, conditions and functions",
      "status": "Covered",
      "note": "Loot tables and typed mod condition and function callbacks have public seams.",
      "refs": [],
      "sources": [
        "crates/horizon-mod-vocab/src/hooks/loot_condition.rs",
        "crates/horizon-mod-vocab/src/hooks/loot_function.rs",
        "crates/horizon-mod-vocab/src/hooks/loot_table_load.rs"
      ],
      "counterpart": [
        [
          {
            "text": "26.1 docs",
            "href": "https://docs.neoforged.net/docs/resources/server/loottables/"
          },
          " · 26.3 unverified"
        ]
      ]
    },
    {
      "area": "loot",
      "title": "Global loot modifiers",
      "status": "Missing",
      "note": "The Horizon data audit found no reader or application path for the modifier list. Code-level drop hooks cover a separate path. The maintainer identified a shared top-level roll seam as a design prerequisite.",
      "refs": [
        {
          "number": 1270,
          "state": "open"
        }
      ],
      "sources": [
        "docs/modding/src/reference/neoforge-data.md",
        "crates/horizon-mod-vocab/src/hooks/loot_drops.rs"
      ],
      "counterpart": [
        [
          {
            "text": "26.1 docs",
            "href": "https://docs.neoforged.net/docs/resources/server/loottables/"
          },
          " · 26.3 unverified"
        ]
      ]
    },
    {
      "area": "loot",
      "title": "Typed loot evaluation context",
      "status": "Partial",
      "note": "The current context view and drop hooks cover narrower reads. A broader typed evaluation context is under design.",
      "refs": [
        {
          "number": 2647,
          "state": "open",
          "claim": "OlaHulleberg"
        }
      ],
      "sources": [
        "docs/modding/src/concepts/loot-context-view.md",
        "crates/horizon-mod-vocab/src/hooks/loot_drops.rs"
      ],
      "counterpart": [
        [
          {
            "text": "26.1 docs",
            "href": "https://docs.neoforged.net/docs/resources/server/loottables/"
          },
          " · 26.3 unverified"
        ],
        [
          {
            "text": "26.3 change notes",
            "href": "https://maven.neoforged.net/releases/net/neoforged/neoforge/26.3.0.102/neoforge-26.3.0.102-changelog.txt"
          },
          " ",
          {
            "text": "#3676",
            "href": "https://github.com/neoforged/NeoForge/pull/3676"
          },
          ", ",
          {
            "text": "#3620",
            "href": "https://github.com/neoforged/NeoForge/pull/3620"
          }
        ]
      ]
    },
    {
      "area": "worldgen",
      "title": "Custom worldgen features and placement modifiers",
      "status": "Missing",
      "note": "The Horizon design is merged. PR #2799 adds bytecode evidence and random oracle tests. It does not implement feature or placer callbacks. Ola’s claim predates the maintainer’s availability announcement.",
      "refs": [
        {
          "number": 815,
          "state": "open",
          "claim": "OlaHulleberg posted a claim before the maintainer reopened claiming"
        },
        {
          "number": 2799,
          "state": "open"
        }
      ],
      "sources": [
        "docs/modding/src/concepts/worldgen-features.md"
      ],
      "counterpart": [
        [
          {
            "text": "26.3 primer",
            "href": "https://docs.neoforged.net/primer/docs/26.3/"
          },
          " · exact API contract unverified"
        ]
      ]
    },
    {
      "area": "worldgen",
      "title": "Custom structure types and placement",
      "status": "Covered",
      "note": "Typed structure generation, pieces and placement are present. Structure modifiers are a separate row.",
      "refs": [],
      "sources": [
        "crates/horizon-mod-vocab/src/parts/structures.rs",
        "crates/horizon-mod-vocab/src/world/structure_type.rs"
      ],
      "counterpart": [
        [
          {
            "text": "26.3 primer",
            "href": "https://docs.neoforged.net/primer/docs/26.3/"
          },
          " · exact API contract unverified"
        ]
      ]
    },
    {
      "area": "worldgen",
      "title": "Custom carver types",
      "status": "Missing",
      "note": "Biome-list editing is separate from defining a new carver type. No typed carver-type registrar was found in the reviewed API surface.",
      "refs": [],
      "sources": [
        "crates/horizon-mod-vocab/src/parts/shared.rs",
        "docs/modding/src/concepts/worldgen-features.md"
      ],
      "counterpart": [
        [
          {
            "text": "26.3 primer",
            "href": "https://docs.neoforged.net/primer/docs/26.3/"
          },
          " · exact API contract unverified"
        ]
      ]
    },
    {
      "area": "rendering",
      "title": "Model geometry, tint sources and render-stage callbacks",
      "status": "Covered",
      "note": "The native surface exposes geometry submission, tint hooks and level render stages.",
      "refs": [],
      "sources": [
        "crates/horizon-mod-vocab/src/hooks/submit_custom_geometry.rs",
        "crates/horizon-mod-vocab/src/hooks/register_item_tint_sources.rs",
        "crates/horizon-mod-vocab/src/hooks/register_block_tint_sources.rs",
        "crates/horizon-mod-vocab/src/hooks/render_level_stage.rs",
        "docs/modding/src/how-to/model-drawing.md"
      ],
      "counterpart": [
        [
          {
            "text": "26.1 docs",
            "href": "https://docs.neoforged.net/docs/rendering/feature/"
          },
          " · 26.3 unverified"
        ]
      ]
    },
    {
      "area": "rendering",
      "title": "Custom render pipelines and passes",
      "status": "Partial",
      "note": "Model and geometry seams exist. Pipeline and frame-pass registration remain tracked.",
      "refs": [
        {
          "number": 884,
          "state": "open",
          "claim": "Hiuoy"
        },
        {
          "number": 867,
          "state": "open"
        }
      ],
      "sources": [
        "docs/modding/src/concepts/resource-renderers.md",
        "crates/horizon-mod-vocab/src/client/model_instance.rs"
      ],
      "counterpart": [
        [
          {
            "text": "26.1 docs",
            "href": "https://docs.neoforged.net/docs/rendering/feature/"
          },
          " · 26.3 unverified"
        ]
      ]
    },
    {
      "area": "gui",
      "title": "Screens, widgets, menu slots and HUD layers",
      "status": "Covered",
      "note": "Typed widgets, menu Parts, input hooks and GUI layers cover native UI contributions.",
      "refs": [],
      "sources": [
        "crates/horizon-mod-vocab/src/client/widgets.rs",
        "crates/horizon-mod-vocab/src/parts/menus.rs",
        "crates/horizon-mod-vocab/src/hooks/screen_draw.rs",
        "crates/horizon-mod-vocab/src/hooks/register_gui_layers.rs"
      ],
      "counterpart": [
        [
          {
            "text": "26.1 docs",
            "href": "https://docs.neoforged.net/docs/rendering/screens/"
          },
          " · 26.3 unverified"
        ]
      ]
    },
    {
      "area": "gui",
      "title": "Configuration screens and custom controls",
      "status": "Partial",
      "note": "Native settings and GUI building blocks exist. Game-rendered typed settings controls are tracked.",
      "refs": [
        {
          "number": 2059,
          "state": "open",
          "claim": "umbx-dot"
        }
      ],
      "sources": [
        "crates/horizon-mod-vocab/src/parts/settings.rs",
        "crates/horizon-mod-vocab/src/client/widgets.rs"
      ],
      "counterpart": [
        [
          {
            "text": "26.1 docs",
            "href": "https://docs.neoforged.net/docs/rendering/screens/"
          },
          " · 26.3 unverified"
        ]
      ]
    },
    {
      "area": "resources",
      "title": "Resource packs, pack finders and reload listeners",
      "status": "Covered",
      "note": "The catalog exposes pack discovery and distinct client and server reload listener hooks.",
      "refs": [],
      "sources": [
        "crates/horizon-mod-vocab/src/hooks/add_pack_finders.rs",
        "crates/horizon-mod-vocab/src/hooks/add_client_reload_listeners.rs",
        "crates/horizon-mod-vocab/src/hooks/add_server_reload_listeners.rs"
      ],
      "counterpart": [
        [
          {
            "text": "26.1 docs",
            "href": "https://docs.neoforged.net/docs/resources/"
          },
          " · 26.3 unverified"
        ]
      ]
    },
    {
      "area": "resources",
      "title": "Conditional pack data",
      "status": "Partial",
      "note": "The data audit lists supported condition kinds and paths. Other condition kinds are omitted by the loader.",
      "refs": [],
      "sources": [
        "docs/modding/src/reference/neoforge-data.md"
      ],
      "counterpart": [
        [
          {
            "text": "26.1 docs",
            "href": "https://docs.neoforged.net/docs/resources/"
          },
          " · 26.3 unverified"
        ]
      ]
    },
    {
      "area": "data-generation",
      "title": "Provider-based generation for models, recipes, tags and other data",
      "status": "Missing",
      "note": "Horizon documents packaged data and content declarations. A public equivalent for the provider-run pipeline was not found in the reviewed book or registrar surface.",
      "refs": [],
      "sources": [
        "docs/modding/src/how-to/content-mods.md",
        "crates/horizon-mod-vocab/src/content/content_declarations.rs"
      ],
      "counterpart": [
        [
          {
            "text": "26.1 docs",
            "href": "https://docs.neoforged.net/docs/resources/"
          },
          " · 26.3 unverified"
        ]
      ]
    },
    {
      "area": "commands",
      "title": "Server/client registration and typed arguments",
      "status": "Covered",
      "note": "The native API supports server and client command hooks and command argument registration.",
      "refs": [],
      "sources": [
        "crates/horizon-mod-vocab/src/hooks/register_commands.rs",
        "crates/horizon-mod-vocab/src/hooks/register_client_commands.rs",
        "crates/horizon-mod-vocab/src/parts/command_arguments.rs"
      ],
      "counterpart": [
        [
          {
            "text": "26.1 docs",
            "href": "https://docs.neoforged.net/docs/misc/commands/"
          },
          " · 26.3 unverified"
        ]
      ]
    },
    {
      "area": "configuration",
      "title": "Mod config files, settings and change events",
      "status": "Covered",
      "note": "Config files and setting hooks provide the core registration and update surface.",
      "refs": [],
      "sources": [
        "crates/horizon-mod-vocab/src/content/config_files.rs",
        "crates/horizon-mod-vocab/src/content/mod_settings.rs",
        "crates/horizon-mod-vocab/src/hooks/mod_configs.rs",
        "crates/horizon-mod-vocab/src/hooks/setting_changed.rs"
      ],
      "counterpart": [
        [
          {
            "text": "26.1 docs",
            "href": "https://docs.neoforged.net/docs/misc/config/"
          },
          " · 26.3 unverified"
        ]
      ]
    },
    {
      "area": "sounds",
      "title": "Pack-defined sounds and playback",
      "status": "Covered",
      "note": "The catalog exposes sound events and level playback seams.",
      "refs": [],
      "sources": [
        "crates/horizon-mod-vocab/src/hooks/sound_events.rs",
        "crates/horizon-mod-vocab/src/hooks/level_sounds.rs",
        "crates/horizon-mod-vocab/src/hooks/sound_play.rs"
      ],
      "counterpart": [
        [
          {
            "text": "26.1 docs",
            "href": "https://docs.neoforged.net/docs/resources/client/sounds/"
          },
          " · 26.3 unverified"
        ]
      ]
    },
    {
      "area": "sounds",
      "title": "Custom entity sound routing",
      "status": "Partial",
      "note": "Playback exists. Content-mod living types using their own sounds are a tracked gap.",
      "refs": [
        {
          "number": 2738,
          "state": "open",
          "claim": "OlaHulleberg"
        }
      ],
      "sources": [
        "crates/horizon-mod-vocab/src/hooks/level_sounds.rs",
        "crates/horizon-mod-vocab/src/parts/entities.rs"
      ],
      "counterpart": [
        [
          {
            "text": "26.1 docs",
            "href": "https://docs.neoforged.net/docs/resources/client/sounds/"
          },
          " · 26.3 unverified"
        ]
      ]
    },
    {
      "area": "particles",
      "title": "Particle types, providers and spawning",
      "status": "Covered",
      "note": "The particle registrar and provider hooks expose registration and effects.",
      "refs": [],
      "sources": [
        "crates/horizon-mod-vocab/src/parts/particles.rs",
        "crates/horizon-mod-vocab/src/hooks/register_particle_providers.rs",
        "crates/horizon-mod-vocab/src/host/item_particles.rs"
      ],
      "counterpart": [
        [
          {
            "text": "26.1 docs",
            "href": "https://docs.neoforged.net/docs/resources/client/particles/"
          },
          " · 26.3 unverified"
        ]
      ]
    },
    {
      "area": "tags",
      "title": "Tag load, membership queries and update hooks",
      "status": "Covered",
      "note": "Horizon loads convention tags, exposes typed membership queries and fires update hooks.",
      "refs": [],
      "sources": [
        "docs/modding/src/reference/neoforge-data.md",
        "crates/horizon-mod-vocab/src/host/tags.rs",
        "crates/horizon-mod-vocab/src/hooks/tags_updated.rs"
      ],
      "counterpart": [
        [
          {
            "text": "26.1 docs",
            "href": "https://docs.neoforged.net/docs/resources/server/tags/"
          },
          " · 26.3 unverified"
        ]
      ]
    },
    {
      "area": "tags",
      "title": "Biome tag and biome effect reads",
      "status": "Partial",
      "note": "Typed Host additions are in review. Vanilla pack tag processing is already available.",
      "refs": [
        {
          "number": 2733,
          "state": "open",
          "claim": "Xmilon"
        },
        {
          "number": 2742,
          "state": "open"
        },
        {
          "number": 2743,
          "state": "open"
        }
      ],
      "sources": [
        "crates/horizon-mod-vocab/src/host/levels.rs",
        "crates/horizon-mod-vocab/src/host/tags.rs"
      ],
      "counterpart": [
        [
          {
            "text": "26.1 docs",
            "href": "https://docs.neoforged.net/docs/resources/server/tags/"
          },
          " · 26.3 unverified"
        ]
      ]
    },
    {
      "area": "recipes",
      "title": "Pack recipes, ingredient codecs and reload",
      "status": "Covered",
      "note": "Typed ingredient tests, recipe queries, reload and recipe-book registration are present.",
      "refs": [],
      "sources": [
        "crates/horizon-mod-vocab/src/host/recipes.rs",
        "crates/horizon-mod-vocab/src/hooks/ingredient_test.rs",
        "crates/horizon-mod-vocab/src/parts/recipe_books.rs",
        "docs/modding/src/how-to/reload-recipes.md"
      ],
      "counterpart": [
        [
          {
            "text": "26.1 docs",
            "href": "https://docs.neoforged.net/docs/resources/server/recipes/"
          },
          " · 26.3 unverified"
        ]
      ]
    },
    {
      "area": "recipes",
      "title": "Recipe viewer transfer validation",
      "status": "Partial",
      "note": "Recipes and menus are queryable. A dry run explaining missing input for a mod crafting grid is tracked.",
      "refs": [
        {
          "number": 2640,
          "state": "open"
        }
      ],
      "sources": [
        "crates/horizon-mod-vocab/src/host/recipes.rs",
        "crates/horizon-mod-vocab/src/host/menus.rs"
      ],
      "counterpart": [
        [
          {
            "text": "26.1 docs",
            "href": "https://docs.neoforged.net/docs/resources/server/recipes/"
          },
          " · 26.3 unverified"
        ],
        [
          {
            "text": "26.3 change notes",
            "href": "https://maven.neoforged.net/releases/net/neoforged/neoforge/26.3.0.102/neoforge-26.3.0.102-changelog.txt"
          },
          " ",
          {
            "text": "#3687",
            "href": "https://github.com/neoforged/NeoForge/pull/3687"
          }
        ]
      ]
    },
    {
      "area": "advancements",
      "title": "Pack advancements, progress and criteria",
      "status": "Partial",
      "note": "The surface includes typed criterion tests and progress observation. Player recipe/advancement views and crafted triggers remain tracked.",
      "refs": [
        {
          "number": 950,
          "state": "open",
          "claim": "Xmilon"
        }
      ],
      "sources": [
        "crates/horizon-mod-vocab/src/world/advancement_progress.rs",
        "crates/horizon-mod-vocab/src/world/criteria.rs",
        "crates/horizon-mod-vocab/src/hooks/player_advancement_done.rs"
      ],
      "counterpart": [
        [
          {
            "text": "26.1 docs",
            "href": "https://docs.neoforged.net/docs/resources/server/advancements/"
          },
          " · 26.3 unverified"
        ]
      ]
    },
    {
      "area": "dimensions",
      "title": "Custom dimension declarations and generators",
      "status": "Covered",
      "note": "Dimension Parts can declare a dimension and use the chunk-generator interface.",
      "refs": [],
      "sources": [
        "crates/horizon-mod-vocab/src/parts/dimensions.rs",
        "crates/horizon-mod-vocab/src/world/dimension.rs",
        "crates/horizon-mod-vocab/src/world/chunk_generator.rs"
      ],
      "counterpart": [
        [
          {
            "text": "26.3 primer",
            "href": "https://docs.neoforged.net/primer/docs/26.3/"
          },
          " · exact API contract unverified"
        ]
      ]
    },
    {
      "area": "dimensions",
      "title": "Explicit multi-noise points in a mod's dimension",
      "status": "Partial",
      "note": "Dimension sources are present. Explicit climate-point declarations and selection coverage are tracked in the scope 1 PRs.",
      "refs": [
        {
          "number": 2554,
          "state": "open",
          "claim": "Xmilon (both scopes)"
        },
        {
          "number": 2730,
          "state": "open"
        },
        {
          "number": 2749,
          "state": "open"
        }
      ],
      "sources": [
        "crates/horizon-mod-vocab/src/world/dimension.rs"
      ],
      "counterpart": [
        [
          {
            "text": "26.3 primer",
            "href": "https://docs.neoforged.net/primer/docs/26.3/"
          },
          " · exact API contract unverified"
        ]
      ]
    },
    {
      "area": "dimensions",
      "title": "Weighted region injection in existing vanilla dimensions",
      "status": "Not applicable",
      "note": "The Horizon issue identifies this as a TerraBlender comparison outside NeoForge core. Horizon’s own scope 2 design is still in review.",
      "refs": [
        {
          "number": 2554,
          "state": "open",
          "claim": "Xmilon (both scopes)"
        },
        {
          "number": 2731,
          "state": "open"
        }
      ],
      "sources": [
        "crates/horizon-mod-vocab/src/world/dimension.rs"
      ],
      "counterpart": [
        [
          {
            "text": "26.3 primer",
            "href": "https://docs.neoforged.net/primer/docs/26.3/"
          },
          " · exact API contract unverified"
        ]
      ]
    },
    {
      "area": "biome-modifiers",
      "title": "JSON feature, spawn and spawn-cost edits",
      "status": "Covered",
      "note": "Horizon already applies additions and removals in order through the content-pack path.",
      "refs": [
        {
          "number": 2732,
          "state": "open",
          "claim": "Xmilon"
        }
      ],
      "sources": [
        "crates/horizon-client/src/mod_content_biomes.rs"
      ],
      "counterpart": [
        [
          {
            "text": "26.1 docs",
            "href": "https://docs.neoforged.net/docs/worldgen/biomemodifier/"
          },
          " · 26.3 unverified"
        ]
      ]
    },
    {
      "area": "biome-modifiers",
      "title": "Code registration, carvers and late modification",
      "status": "Partial",
      "note": "The JSON route is merged. The native declaration and added operations are on stacked PRs. The changelog mentions a registry-access argument and removal of the no-op modifier; exact setter signatures are unverified.",
      "refs": [
        {
          "number": 2732,
          "state": "open",
          "claim": "Xmilon"
        },
        {
          "number": 2744,
          "state": "open"
        },
        {
          "number": 2745,
          "state": "open"
        },
        {
          "number": 2788,
          "state": "open"
        },
        {
          "number": 2800,
          "state": "open"
        }
      ],
      "sources": [
        "crates/horizon-client/src/mod_content_biomes.rs",
        "crates/horizon-mod-vocab/src/host/levels.rs"
      ],
      "counterpart": [
        [
          {
            "text": "26.1 docs",
            "href": "https://docs.neoforged.net/docs/worldgen/biomemodifier/"
          },
          " · 26.3 unverified"
        ],
        [
          {
            "text": "26.3 change notes",
            "href": "https://maven.neoforged.net/releases/net/neoforged/neoforge/26.3.0.102/neoforge-26.3.0.102-changelog.txt"
          },
          " ",
          {
            "text": "#3546",
            "href": "https://github.com/neoforged/NeoForge/pull/3546"
          },
          ", ",
          {
            "text": "#3553",
            "href": "https://github.com/neoforged/NeoForge/pull/3553"
          }
        ]
      ]
    },
    {
      "area": "biome-modifiers",
      "title": "Per-biome visuals, audio and replacement sync",
      "status": "Partial",
      "note": "Pack effects and base biome sync already exist. Code declarations, effect edits and replacement acceptance are in review. The renderer has a pack-biome path. PR #2843 uses the active table for particles and adds fixture coverage for local loading, pack replacement and registry sync.",
      "refs": [
        {
          "number": 2734,
          "state": "open"
        },
        {
          "number": 2803,
          "state": "open"
        },
        {
          "number": 2811,
          "state": "open"
        },
        {
          "number": 2823,
          "state": "open"
        },
        {
          "number": 2843,
          "state": "open"
        }
      ],
      "sources": [
        "crates/horizon-client/src/animate_tick.rs",
        "crates/horizon-mod-vocab/src/world/biome.rs"
      ],
      "counterpart": [
        [
          {
            "text": "26.1 docs",
            "href": "https://docs.neoforged.net/docs/worldgen/biomemodifier/"
          },
          " · 26.3 unverified"
        ],
        [
          {
            "text": "26.3 change notes",
            "href": "https://maven.neoforged.net/releases/net/neoforged/neoforge/26.3.0.102/neoforge-26.3.0.102-changelog.txt"
          },
          " ",
          {
            "text": "#3528",
            "href": "https://github.com/neoforged/NeoForge/pull/3528"
          }
        ]
      ]
    },
    {
      "area": "structure-modifiers",
      "title": "Data-driven changes to existing structures",
      "status": "Partial",
      "note": "Main reads add, remove and clear spawn overrides. Other JSON types are skipped, and the public 26.3 contract could not be checked. PR #2140 merged and closed #1269.",
      "refs": [
        {
          "number": 1269,
          "state": "closed",
          "claim": "OlaHulleberg"
        },
        {
          "number": 2140,
          "state": "merged"
        }
      ],
      "sources": [
        "crates/horizon-client/src/mod_content_structures.rs",
        "crates/horizon-mod-vocab/src/parts/structures.rs"
      ],
      "counterpart": [
        [
          {
            "text": "26.3 Javadoc",
            "href": "https://aldak.netlify.app/javadoc/26.3.x/net/neoforged/neoforge/common/world/StructureModifiers.html"
          },
          " · unavailable, contract unverified"
        ]
      ]
    },
    {
      "area": "fluids",
      "title": "Fluid type, world flow and storage",
      "status": "Covered",
      "note": "Native fluid declarations, flow callbacks and fluid storage access are exposed.",
      "refs": [],
      "sources": [
        "crates/horizon-mod-vocab/src/parts/fluids.rs",
        "crates/horizon-mod-vocab/src/hooks/fluid_flow.rs",
        "crates/horizon-mod-vocab/src/host/fluids_energy.rs",
        "docs/modding/src/concepts/unified-fluid-declaration.md"
      ],
      "counterpart": [
        [
          {
            "text": "26.3 Javadoc",
            "href": "https://aldak.netlify.app/javadoc/26.3.x/net/neoforged/neoforge/common/world/StructureModifiers.html"
          },
          " · unavailable, contract unverified"
        ]
      ]
    },
    {
      "area": "fluids",
      "title": "Cauldron content for mod fluids",
      "status": "Partial",
      "note": "Fluid declaration and ticks exist. Mod-defined cauldron behavior has separate tracked work.",
      "refs": [
        {
          "number": 2694,
          "state": "open",
          "claim": "JuanLuci"
        },
        {
          "number": 1323,
          "state": "open",
          "claim": "arismoko"
        }
      ],
      "sources": [
        "crates/horizon-mod-vocab/src/parts/fluids.rs",
        "crates/horizon-mod-vocab/src/hooks/fluid_tick.rs"
      ],
      "counterpart": [
        [
          {
            "text": "26.3 Javadoc",
            "href": "https://aldak.netlify.app/javadoc/26.3.x/net/neoforged/neoforge/common/world/StructureModifiers.html"
          },
          " · unavailable, contract unverified"
        ]
      ]
    },
    {
      "area": "saved-data",
      "title": "Persistent level data",
      "status": "Partial",
      "note": "The attachment guide documents level-scoped persistence. A separate counterpart for keyed SavedData is unverified.",
      "refs": [],
      "sources": [
        "docs/modding/src/how-to/attachments.md",
        "crates/horizon-mod-vocab/src/host/mod_state.rs"
      ],
      "counterpart": [
        [
          {
            "text": "26.1 docs",
            "href": "https://docs.neoforged.net/docs/datastorage/saveddata/"
          },
          " · 26.3 unverified"
        ]
      ]
    },
    {
      "area": "java-integration",
      "title": "JVM access transformers and coremod field redirects",
      "status": "Not applicable",
      "note": "Horizon native mods use Rust interfaces and named injection points. JVM class transformations are specific to the Java loader.",
      "refs": [],
      "sources": [
        "docs/modding/src/concepts/design.md"
      ],
      "counterpart": [
        [
          {
            "text": "26.1 docs",
            "href": "https://docs.neoforged.net/docs/advanced/accesstransformers/"
          },
          " · 26.3 unverified"
        ],
        [
          {
            "text": "26.3 change notes",
            "href": "https://maven.neoforged.net/releases/net/neoforged/neoforge/26.3.0.102/neoforge-26.3.0.102-changelog.txt"
          },
          " ",
          {
            "text": "#3721",
            "href": "https://github.com/neoforged/NeoForge/pull/3721"
          }
        ]
      ]
    },
    {
      "area": "mod-tooling-and-runtime",
      "title": "Injection points and internal access",
      "status": "Partial",
      "note": "Named injection points are documented. Internal access has separate target admission rules and should be checked for the point and target in use.",
      "refs": [],
      "sources": [
        "docs/modding/src/injections.md",
        "docs/modding/src/concepts/design.md"
      ],
      "counterpart": [
        [
          "Horizon API surface"
        ]
      ]
    },
    {
      "area": "mod-tooling-and-runtime",
      "title": "Native and wasm targets, Wire and admission",
      "status": "Partial",
      "note": "The dependency model is shared. A native callback alone does not establish support across the wasm boundary.",
      "refs": [],
      "sources": [
        "docs/modding/src/how-to/wasm-mods.md",
        "docs/modding/src/concepts/design.md"
      ],
      "counterpart": [
        [
          "Horizon API surface"
        ]
      ]
    },
    {
      "area": "mod-tooling-and-runtime",
      "title": "Launcher builds, packages and dependencies",
      "status": "Covered",
      "note": "The native mod guide and manifest describe build and installation routes, packages and dependency declarations.",
      "refs": [],
      "sources": [
        "docs/modding/src/how-to/native-mods.md",
        "docs/modding/src/reference/manifest.md"
      ],
      "counterpart": [
        [
          "Horizon API surface"
        ]
      ]
    },
    {
      "area": "mod-tooling-and-runtime",
      "title": "Diagnostics and profiling",
      "status": "Covered",
      "note": "The native entry point documents diagnostics. The vocabulary exposes mod profiler controls.",
      "refs": [],
      "sources": [
        "docs/modding/src/concepts/trait-mods/003-native-entry-point-and-diagnostics.md",
        "crates/horizon-mod-vocab/src/profiler.rs"
      ],
      "counterpart": [
        [
          "Horizon API surface"
        ]
      ]
    },
    {
      "area": "input-and-effects",
      "title": "Key mappings and binding reads",
      "status": "Covered",
      "note": "Mods can register key mappings and read client input and bindings.",
      "refs": [],
      "sources": [
        "crates/horizon-mod-vocab/src/parts/key_mappings.rs",
        "crates/horizon-mod-vocab/src/host/client_input.rs",
        "crates/horizon-mod-vocab/src/hooks/input_key.rs"
      ],
      "counterpart": [
        [
          "Horizon API surface"
        ]
      ]
    },
    {
      "area": "input-and-effects",
      "title": "Status effects and attribute definitions",
      "status": "Covered",
      "note": "The Parts registrars expose custom definitions. Living handles provide runtime reads and writes.",
      "refs": [],
      "sources": [
        "crates/horizon-mod-vocab/src/parts/effects.rs",
        "crates/horizon-mod-vocab/src/parts/attributes.rs",
        "crates/horizon-mod-vocab/src/host/living.rs"
      ],
      "counterpart": [
        [
          "Horizon API surface"
        ]
      ]
    },
    {
      "area": "input-and-effects",
      "title": "Enchantment behavior and data-defined contracts",
      "status": "Partial",
      "note": "Enchanting and enchanted loot have hooks. The complete data-defined enchantment contract was not audited.",
      "refs": [],
      "sources": [
        "crates/horizon-mod-vocab/src/hooks/enchantment_level_set.rs",
        "crates/horizon-mod-vocab/src/hooks/enchanted_entity_loot.rs",
        "crates/horizon-mod-vocab/src/host/items.rs"
      ],
      "counterpart": [
        [
          "Horizon API surface"
        ]
      ]
    },
    {
      "area": "world-and-player-services",
      "title": "Typed game rules",
      "status": "Covered",
      "note": "Game-rule declarations, world reads and change hooks have dedicated seams.",
      "refs": [],
      "sources": [
        "crates/horizon-mod-vocab/src/parts/game_rules.rs",
        "crates/horizon-mod-vocab/src/host/levels.rs",
        "crates/horizon-mod-vocab/src/hooks/game_rule_changed.rs"
      ],
      "counterpart": [
        [
          "Horizon API surface"
        ]
      ]
    },
    {
      "area": "world-and-player-services",
      "title": "Player statistics",
      "status": "Covered",
      "note": "Player Host methods read and award statistics, and a dedicated hook intercepts awards.",
      "refs": [],
      "sources": [
        "crates/horizon-mod-vocab/src/host/players.rs",
        "crates/horizon-mod-vocab/src/hooks/player_stat_award.rs"
      ],
      "counterpart": [
        [
          "Horizon API surface"
        ]
      ]
    },
    {
      "area": "world-and-player-services",
      "title": "World borders",
      "status": "Covered",
      "note": "Level Host methods read and change border geometry, damage and warnings.",
      "refs": [],
      "sources": [
        "crates/horizon-mod-vocab/src/host/levels.rs",
        "crates/horizon-mod-vocab/src/hooks/world_border.rs"
      ],
      "counterpart": [
        [
          "Horizon API surface"
        ]
      ]
    },
    {
      "area": "world-and-player-services",
      "title": "Chunk tickets and ownership",
      "status": "Covered",
      "note": "Mods can register ticket controllers and manage forced chunks. Saved ticket validation has a dedicated hook.",
      "refs": [],
      "sources": [
        "crates/horizon-mod-vocab/src/parts/tickets.rs",
        "crates/horizon-mod-vocab/src/host/levels.rs",
        "crates/horizon-mod-vocab/src/hooks/validate_tickets.rs"
      ],
      "counterpart": [
        [
          "Horizon API surface"
        ]
      ]
    },
    {
      "area": "world-and-player-services",
      "title": "Fake players and simulated actions",
      "status": "Covered",
      "note": "The player Host exposes fake-player creation and actions through typed handles.",
      "refs": [],
      "sources": [
        "crates/horizon-mod-vocab/src/host/players.rs",
        "docs/modding/src/concepts/trait-mods/025-fake-players.md"
      ],
      "counterpart": [
        [
          "Horizon API surface"
        ]
      ]
    },
    {
      "area": "world-and-player-services",
      "title": "Permissions and authority",
      "status": "Partial",
      "note": "Vanilla permission levels and side-typed Host calls are available. A general provider or permission-node interface is unverified.",
      "refs": [],
      "sources": [
        "crates/horizon-mod-vocab/src/host/players.rs",
        "crates/horizon-mod-vocab/src/host/services.rs",
        "docs/modding/src/concepts/trait-mods.md"
      ],
      "counterpart": [
        [
          "Horizon API surface"
        ]
      ]
    },
    {
      "area": "world-and-player-services",
      "title": "Indexed attachments and transactions",
      "status": "Partial",
      "note": "Indexed snapshots and transactions are documented. Broader holder coverage and query work remain tracked.",
      "refs": [
        {
          "number": 1108,
          "state": "open",
          "claim": "claim history unverified"
        },
        {
          "number": 2497,
          "state": "open",
          "claim": "OlaHulleberg"
        }
      ],
      "sources": [
        "crates/horizon-mod-vocab/src/host/mod_state.rs",
        "docs/modding/src/how-to/attachments.md",
        "docs/modding/src/concepts/attachment-query-joins.md"
      ],
      "counterpart": [
        [
          "Horizon API surface"
        ]
      ]
    },
    {
      "area": "world-and-player-services",
      "title": "Scheduling and task lifetime",
      "status": "Covered",
      "note": "Mod code can schedule and cancel server tasks through the Host. Join-time tasks have their own row.",
      "refs": [],
      "sources": [
        "crates/horizon-mod-vocab/src/host/mod_state.rs",
        "crates/horizon-mod-vocab/src/hooks/scheduled_task.rs"
      ],
      "counterpart": [
        [
          "Horizon API surface"
        ]
      ]
    },
    {
      "area": "world-and-player-services",
      "title": "Cross-dimension world and entity visibility",
      "status": "Partial",
      "note": "Public level and entity handles provide reads and writes. The broader visibility contract is still tracked.",
      "refs": [
        {
          "number": 1606,
          "state": "open",
          "claim": "arismoko"
        }
      ],
      "sources": [
        "crates/horizon-mod-vocab/src/host/levels.rs",
        "crates/horizon-mod-vocab/src/host/entities.rs",
        "docs/modding/src/concepts/level-extracted-state.md"
      ],
      "counterpart": [
        [
          "Horizon API surface"
        ]
      ]
    }
  ],
  "foot": [
    "The older workspace RUST-API-STATUS.md is historical context. The sibling Horizon checkout’s docs/decompilation-status.md describes vanilla evidence coverage rather than native mod API coverage. NeoForge’s 26.1 guides are background for rows marked unverified. The 26.3 Javadoc returned HTTP 503. Source evidence is pinned to the stated Horizon revision. Public issue and board data reflect this sweep. Coverage is a source-level assessment."
  ]
};
