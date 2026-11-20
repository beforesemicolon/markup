---
name: '04. Seek and change volume'
order: 24
title: 'Seek and change volume | Markup Essential Training'
description: 'Use media events, state, and Markup condition helpers to control time and volume.'
layout: document
---

<div lang="en">

## Lesson 4. Seek and change volume

### Lesson narration

Press Play, wait a second, and move the Playback position slider. The melody jumps, and the elapsed time catches up. Move the Volume slider next. You’ll hear a change in level while the playhead continues on its way. These two controls act on different properties of the same media element.

Start with the seek range. Its maximum comes from the recording’s duration. Before the metadata arrives, the browser may give us an unknown duration. We convert that to zero and keep the control disabled. The `is` helper tests for a positive, finite duration. The `and` helper combines that test with the presence of a selected track. Once both are true, we can enable seeking.

Trace one seek in the code. The input event reads `valueAsNumber` and writes the new time to the media element. The media element reports its position through `timeupdate`. A getter formats the display, using `val` to read the position and duration. We don’t have to guess how far playback advanced between updates.

Now try Restart track while paused at zero. That condition uses `or` and `oneOf` to avoid offering a restart when the playhead is already at the beginning. Move forward a few seconds and try again. The control returns the recording to the start.

### Build the controls

1. Add labeled range inputs for playback position and volume. When the listener seeks, write the input’s numeric value to `audio.currentTime`.
2. Use a predicate to check the duration. Combine it with the current track to control the seek input’s `disabled` attribute.
3. Bind the volume input to `audio.volume`. Format elapsed and total seconds as minutes and seconds.

```javascript
const validDuration = (value) => Number.isFinite(value) && value > 0
const canSeek = and(player.current, is(duration, validDuration))
const seekLocked = isNot(canSeek)

const clock = (source) => {
    const seconds = Math.floor(val(source) || 0)
    return (
        Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0')
    )
}
```

Use `${() => clock(position)}` for a live display. Use `${seekLocked}` for the boolean attribute.

For the restart button, `oneOf(player.status, ['paused', 'ended'])` checks both stopped states. Compare `is(player.current)()` before and after clearing the queue in the next lesson. It tests whether a track is selected. To test a specific value, `isNot(player.status, 'playing')()` is true whenever the status differs from `playing`.

### Live result

<div data-training-step="04"><p><a href="/assets/training/example.html?step=04">Open the seek and volume example in its own page</a> · <a href="/assets/training/steps/04.js">View the JavaScript for this example</a></p></div>

### Try it

Play the track. Use Tab to reach the seek bar and the arrow keys to move the playhead. Change the volume and check the position again.

**Expected result.** Seeking changes what you hear and the clock follows. A volume change keeps the current playback position.

[Previous lesson. Wire Play and Pause](./03-transport.md) · [Course outline](./index.md) · [Next lesson. Build a queue that keeps its place](./05-queue.md)

</div>
