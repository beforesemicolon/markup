---
name: '03. Wire Play and Pause'
order: 23
title: 'Wire Play and Pause | Markup Essential Training'
description: 'Connect custom buttons to the media element and update their labels from actual playback events.'
layout: document
---

<div lang="en">

## Lesson 3. Wire Play and Pause

### Lesson narration

Click Play and watch the button change to Pause. Let the track run to the end. Nobody clicked the button a second time, yet its label returns to Play. That tells us the control is following the media element.

Start with the click handler. We read the mounted audio element through `view.refs.audio[0]`. In the playing case, we can call `pause()`. In the paused case, we call `play()` and wait for the promise. The browser can reject that request. If it does, the handler can show a message and leave a way to try again.

Now look at the other direction. When sound starts, the audio element emits `playing`. We set the status to playing, and a Markup condition chooses the Pause label. When the track pauses or ends, a media event updates the status again. We can hear the result and see how the label got there.

Try switching tracks while Harbor Lights is playing. The handler pauses the old track before it selects the next one. The title changes, and Play is available for the new selection. Finally, use Tab and Space to do the same thing from the keyboard. Native buttons give us that interaction without a second set of handlers.

### Connect the transport

1. Put a named ref on the audio element. Call `audio.play()` from a button click and handle its rejected promise. Use `audio.pause()` when it is playing.
2. Update the status from the media events. Bind the label with `when(is(status, 'playing'), 'Pause', 'Play')`.
3. Press Play, wait for sound, then press Pause. Switch tracks and check the label again.

```javascript
const [status, setStatus] = state('paused')

const media = html`
    <audio
        ref="audio"
        onplaying="${() => setStatus('playing')}"
        onpause="${() => setStatus('paused')}"
        onended="${() => setStatus('ended')}"
        src="${pick(current, 'src')}"
    ></audio>
`
```

After rendering `media`, read the element with `const [audio] = media.refs.audio`. The handler can then call its media methods.

To log the first play once per mount, add `onplay="${[() => console.log('First play'), { once: true }]}"` to the audio tag. Play, pause, and play again. The console shows one message. The `onplaying` handler still updates the button each time.

### Live result

<div data-training-step="03"><p><a href="/assets/training/example.html?step=03">Open the play and pause example in its own page</a> · <a href="/assets/training/steps/03.js">View the JavaScript for this example</a></p></div>

### Try it

Activate the Play button with the keyboard. Let the short recording reach its end.

**Expected result.** The button reads Pause during playback and returns to Play when the recording ends.

[Previous lesson. Make Now Playing reactive](./02-reactive-title.md) · [Course outline](./index.md) · [Next lesson. Seek and change volume](./04-seek-volume.md)

</div>
