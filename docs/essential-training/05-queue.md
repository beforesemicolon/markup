---
name: '05. Build a queue that keeps its place'
order: 25
title: 'Build a queue that keeps its place | Markup Essential Training'
description: 'Render a playlist with repeat and use stable keys to preserve track identity during reordering.'
layout: document
---

<div lang="en">

## Lesson 5. Build a queue that keeps its place

### Lesson narration

Select Slow Tide, press Play, and reverse the queue. Listen while the rows move. The same melody continues, and the title at the top still says Slow Tide. Now select the first track, reverse the queue again, and notice that the selection follows the title to its new position.

The trick is giving each recording an identity of its own. An array index tells us where a row sits right now. Move that row, and the index changes. Our recordings already have stable IDs. We use the ID to identify the selected track and give the same ID to `repeat` as its key. Markup can match a track to its previous row when the new list arrives.

Look at the reverse handler. It gives the state setter a new array in reverse order. It does not ask the audio element to reload or change the selected track. That is why playback can continue through the edit.

Finally, clear the queue. There is no track to keep selected this time, so the player pauses and the list displays its empty message. Restore the queue and you’ll see the same set of titles again. You can check both behaviors without adding a second list or rebuilding the transport.

### Render and reorder the queue

1. Give each track a unique, stable `id`. Store the selected track separately from its position in the queue.
2. Bind the queue getter to `repeat`. Provide a row factory, a key function, and an empty view.
3. Return a new array from the state updater when reversing the order. Keep the selected track and the audio element in place.

```javascript
const [queue, setQueue] = state(tracks)

const rows = repeat(queue, (track) => html`<li>${track.title}</li>`, {
    key: (track) => track.id,
    empty: () => html`<li>The queue is empty.</li>`,
})

const reverseQueue = () => setQueue((previous) => [...previous].reverse())
```

Render `rows` inside an ordered list. Add the track selection handler to a button in each row.

### Live result

<div data-training-step="05"><p><a href="/assets/training/example.html?step=05">Open the queue example in its own page</a> · <a href="/assets/training/steps/05.js">View the JavaScript for this example</a></p></div>

### Try it

Select a track, start playback, then reverse the queue. Clear the queue and restore it.

**Expected result.** Reversing changes the row order and keeps the active recording. Clearing shows the empty view. Restoring brings the three tracks back.

[Previous lesson. Seek and change volume](./04-seek-volume.md) · [Course outline](./index.md) · [Next lesson. Remember the listener’s settings](./06-preferences.md)

</div>
