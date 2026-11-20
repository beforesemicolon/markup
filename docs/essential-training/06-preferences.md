---
name: '06. Remember the listener’s settings'
order: 26
title: 'Remember the listener’s settings | Markup Essential Training'
description: 'Persist volume with effect, restore a valid setting, and release subscriptions during cleanup.'
layout: document
---

<div lang="en">

## Lesson 6. Remember the listener’s settings

### Lesson narration

Turn the volume down to about one quarter. Reload the lesson. Before you press Play, look at the slider. If this browser allows local storage, the level you chose is already there. Start playback and listen. We saved one preference. We still let the listener decide when audio starts.

Open the preferences module. On mount, the player reads a string from storage. Check whether that value exists before you convert it to a number. This matters because converting a missing value with `Number(null)` gives zero. A first-time listener could end up with a silent player. We also check the range before applying a saved value to the audio element.

Next, follow the read inside `effect`. It reads the volume getter and writes that level back to storage. The getter tells Markup which change should run this work again. The effect returns a stop function. Returning that function from the mount callback ties the effect’s lifetime to this particular player.

Try Reset volume, then reload once more. The slider now shows full volume because Reset went through the same setter as a manual change. If storage is unavailable, you can still use the controls for this visit. Lesson nine lets you see what happens to a subscription when its owner leaves the page.

### Save and restore volume

1. On mount, read the saved value before starting the effect. Accept a finite number between zero and one. Use a default if the value is missing or invalid.
2. Let the existing volume control set the media level. In an effect, read the getter and write the level to local storage. Keep playback usable if the browser blocks storage.
3. Stop the effect during the player’s cleanup. Connect **Reset volume** to the same setter used by the range input.

```javascript
const stopSaving = effect(() => {
    const level = player.volume()
    try {
        localStorage.setItem('markup-training-volume', String(level))
    } catch {
        // The player can still use this level during the current visit.
    }
})
```

Return `stopSaving` from the player’s `onMount` callback if it is the only cleanup. If the callback owns several resources, return a function that releases each one.

### Live result

<div data-training-step="06"><p><a href="/assets/training/example.html?step=06">Open the saved volume example in its own page</a> · <a href="/assets/training/steps/06.js">View the JavaScript for this example</a></p></div>

### Try it

Set the volume near one quarter. Reload the lesson and listen again. Use **Reset volume** to return to the default.

**Expected result.** When local storage is available, the slider restores the saved level. The player waits for you to start playback.

[Previous lesson. Build a queue that keeps its place](./05-queue.md) · [Course outline](./index.md) · [Next lesson. Load a catalog and recover from errors](./07-catalog.md)

</div>
