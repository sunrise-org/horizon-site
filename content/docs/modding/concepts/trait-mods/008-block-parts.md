<!-- chapter: Block Parts -->
<!-- separator: 1 -->

`BlockPart::clone_item_stack` answers on the server when a player picks the block. It receives the
level, position, block state and `include_data`, true when a creative player picks with Ctrl. Return
`None` to keep the game's item.

`BlockPart::fall_on` runs at vanilla's landing moment on a read-only level random host.
Request a deferred write with `event.request(LandingWrite::SetBlock(state))`, where `state`
is an API `BlockState`, or `LandingWrite::DestroyBlock { drop }`. The game checks the
complete write batch before queuing it. An invalid block key or ordinal refuses that
callback's writes and other outputs, including damage; it never applies a valid prefix.
After the entity batch ticks, writes apply in request order if the block still matches
its original landed state. That guard runs once, so a first write can change the state
without suppressing the next write. SetBlock notifies neighbors and clients; DestroyBlock
preserves the requested resource-drop flag.

`BlockPart::contents_changed(host, event)` observes a world block's storage at `setChanged`,
with a `ServerHost`, typed `event.level`, `event.pos: BlockPos` and `event.state`. Attach it to the specific
blocks you observe, including vanilla containers; it has no global `Hooks` counterpart. The backing
contents are already written, before dirty/comparator updates. Native transactions notify once per
backing block at root commit, never on abort or simulation. An explicit `BlockEntityRef::set_changed`
notifies even if contents are unchanged. A double container notifies each component, not once again
for the other half's comparator refresh. A listener's writes still apply, but a nested notice for that
same backing block does not re-enter the listener; writes to a different backing block notify normally.
Entity/menu placeholder coordinates are not block notices.
This replaces Create's positional `contents_changed` mixin for depot/package/schematic storage; there is no
NeoForge bus event. A compiled listener that reads the committed items through the typed level (the game's
own test, so it cannot drift):

```rust,ignore
#[derive(Clone, Debug, PartialEq, Eq)]
struct Notice {
    level: LevelRef,
    pos: [i32; 3],
    amount: u32,
    version: Option<i32>,
}

#[derive(Clone, Default)]
struct Changes(Arc<Mutex<Vec<Notice>>>);

#[mod_api::horizon_part]
impl BlockPart for Changes {
    fn contents_changed(&self, host: &mut dyn ServerHost, event: &mut ContentsChangedEvent) {
        let pos = [event.pos.x, event.pos.y, event.pos.z];
        let amount = event
            .level
            .capability(host, &ITEMS, pos, None)
            .map_or(0, |items| {
                (0..items.size(host))
                    .map(|slot| items.amount(host, slot))
                    .sum()
            });
        let version = host
            .block_entity(event.level, pos)
            .and_then(|entity| entity.data(host))
            .and_then(|data| match data.get(&"Version".into()) {
                Some(Tag::Int(value)) => Some(*value),
                _ => None,
            });
        self.0.lock().unwrap().push(Notice {
            level: event.level,
            pos,
            amount,
            version,
        });
    }
}
```
