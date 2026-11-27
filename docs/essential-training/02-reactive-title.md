---
name: '02. Make Now Playing reactive'
order: 22
title: 'Make Now Playing reactive | Markup Essential Training'
description: 'Switch recordings with state and keep track metadata current with a live getter.'
layout: document
---

<div lang="en">

## Lesson 2. Make Now Playing reactive

### Lesson narration

Click Next track and watch the heading. It changes from Harbor Lights to Slow Tide. Press Play and you hear the second recording. We have one audio element and several tracks. The selection determines which recording and which title appear.

Follow the selection through the example. We put the selected ID in `state` and take the first two functions from its result. One reads the ID. The other selects a new ID. The function named `current` looks up the track with that ID. When you press Next track, the handler finds the next ID in the queue and passes it to the setter. We don’t have to look up the heading or write its new text ourselves.

Here’s a useful way to see how that binding works. In a local copy, put `current().title` in the heading interpolation. Reload, pick the next track, and press Play. You hear the new recording while the heading is stuck on the first title. JavaScript read the title while it was constructing the template. Change the binding to `pick(current, 'title')` and try again. This time Markup receives a getter it can read after each selection. The heading and the recording move together again.

### Connect the selection

1. Store the first track’s ID in `state`. Have `current` look up the track with the selected ID.
2. Use `pick(current, 'title')` for the heading and `pick(current, 'src')` for the audio source. Pass each getter directly to its binding.
3. Connect **Next track** to a handler that selects the next ID with `select`.

```javascript
const [selectedId, select] = state(tracks[0].id)
const current = () => tracks.find((track) => track.id === selectedId())
const nextTrack = () => {
    const index = tracks.findIndex((track) => track.id === selectedId())
    select(tracks[(index + 1) % tracks.length].id)
}

html`
    <h2>${pick(current, 'title')}</h2>
    <audio controls src="${pick(current, 'src')}"></audio>
    <button type="button" onclick="${nextTrack}">Next track</button>
`
```

### Live result

<div data-training-step="02"><p><a href="/assets/training/example.html?step=02">Open the reactive title example in its own page</a> · <a href="/assets/training/steps/02.js">View the JavaScript for this example</a></p></div>

### Try it

In your copy, change only the heading to `${current().title}`. Select the next track twice and watch the heading. Restore the live getter. Find the same live binding for the artist.

Try a nested field and a formatter. Add `credits: { writer: 'Course Studio' }` to each track. Display `${pick(current, 'credits.writer', (name) => 'Written by ' + name)}` below the title. Change one track’s writer and select that track to see its credit.

**Expected result.** With the live binding, the heading follows each track selection. The same audio element takes the new source.

[Previous lesson. Play the first track](./01-first-track.md) · [Course outline](./index.md) · [Next lesson. Wire Play and Pause](./03-transport.md)

</div>
