---
name: '09. Inspect and move a live template'
order: 29
title: 'Inspect and move a live template | Markup Essential Training'
description: 'Observe template mounting, updates, movement, serialization, and cleanup in the interactive workbench.'
layout: document
---

<div lang="en">

## Lesson 9. Inspect and move a live template

### Lesson narration

Look at the Main player and Mini player areas. They start empty. Before you run each step, make a prediction about where the track card will be. Run the first step to mount a marker. Run the next one to replace the marker with the card. The inspection now reports a parent, a mounted state, and a named ref. The event log shows that the card mounted.

Advance to insert the queue label, then move the card to the mini player. Watch which thing moves. The queue label stays in the main player. The card changes parents and its move callback runs. We are still holding the same template instance, so a move does not release its resources.

Next start the two effects. Change the current track. One effect carries the previous title into its next run. The other releases the resource it created for the old title. Unsubscribe the optional state subscriber and change tracks again. Look at what still updates. The title and the effects have their own connections to the state.

Advance until the card unmounts. The cleanup you returned from `onMount` now appears in the log. Check the parent and refs one last time. Restart the lab and see if you can predict each change before it appears.

### Run the workbench

1. Select **Run next step** to render the marker. Continue to replace it with the track card and insert the queue label after it.
2. Move the card to the second host. Inspect `mounted`, `parentNode`, `childNodes`, and `refs`. Compare the serialized card with its current text.
3. Continue through the state and effect steps. Predict what will log after you unsubscribe one listener, stop the effects, and finally unmount the card.

```javascript
const card = html`<p ref="title">Now playing</p>`
    .onMount(() => {
        console.log('Mounted')
        return () => console.log('Released')
    })
    .onMove(() => console.log('Moved'))

card.render(firstHost)
card.render(secondHost)
card.unmount()
```

### Live result

<div data-training-step="09"><p><a href="/assets/training/example.html?step=09">Open the template lifecycle example in its own page</a> · <a href="/assets/training/steps/09.js">View the JavaScript for this example</a></p></div>

### Try it

Restart the lab. Before each step, name the current parent and predict whether the mount cleanup will run. Check the four binding categories in `DynamicValueType`.

Use this example to identify all four bindings on one button. The attribute object is a directive, `aria-pressed` is an attribute, `onclick` is an event, and the label is content. Click the button twice. Inspect `aria-pressed` as the label changes.

```javascript
const [pinned, setPinned] = state(false)
const attributes = { title: 'Pin this track' }
html`<button
    ${attributes}
    type="button"
    aria-pressed="${() => String(pinned())}"
    onclick="${() => setPinned((previous) => !previous)}"
>
    ${() => (pinned() ? 'Unpin track' : 'Pin track')}
</button>`.render(document.body)
```

**Expected result.** The second render moves the same card. The final unmount clears its mounted refs and runs its cleanup. Stopping a subscriber leaves other active bindings able to update.

[Previous lesson. Reveal track notes and render an icon](./08-track-notes.md) · [Course outline](./index.md) · [Next lesson. Package the player as a Web Component](./10-reusable-player.md)

</div>
