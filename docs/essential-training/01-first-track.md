---
name: '01. Play the first track'
order: 21
title: 'Play the first track | Markup Essential Training'
description: 'Render one playable audio track with the Markup html tag and native browser controls.'
layout: document
---

<div lang="en">

## Lesson 1. Play the first track

### Lesson narration

Press Play on Harbor Lights. You hear a short melody, and the playhead begins to move. Pause it halfway through, drag the playhead back, and start it again. Take a look at the source. There is no timer counting seconds, and we haven’t written a Play button. Those controls come with the browser’s audio element.

Let’s build that screen from one track object. It has three fields. The title tells the listener what is playing. The artist gives credit. The source tells the browser where to find the recording. Look at the two places where the template reads those fields. A title between heading tags becomes text. A file path inside the source attribute tells the media element what to load.

The `html` tag gives us a template. Call `render` with a container to put it on the page. Now try a small edit in your own copy. Change the title to Slow Tide and point the file path at that track. After you reload, the heading changes and you hear a slower phrase. The template and the controls can stay exactly as they are. In the next lesson we’ll let the listener make that switch without reloading.

### Build the first view

1. Load the Markup browser bundle and create a container with `id="app"`.
2. Define the track. Use the `html` tag to bind its fields to the view.
3. Render the template once. Play the track, pause it, then seek with the native controls.

```javascript
const { html } = BFS.MARKUP
const track = {
    title: 'Harbor Lights',
    artist: 'Course Studio',
    src: '/assets/training/media/harbor.mp3',
}

html`
    <h2>${track.title}</h2>
    <p>${track.artist}</p>
    <audio controls preload="metadata" src="${track.src}"></audio>
`.render(document.getElementById('app'))
```

### Live result

<div data-training-step="01"><p><a href="/assets/training/example.html?step=01">Open the first track example in its own page</a> · <a href="/assets/training/steps/01.js">View the JavaScript for this example</a></p></div>

### Try it

In your copy, change the title to `Slow Tide` and the file name to `tide.mp3`. Reload and press Play.

**Expected result.** The heading changes, a different melody plays, and the browser supplies the same controls for both tracks.

[Course outline](./index.md) · [Next lesson. Make Now Playing reactive](./02-reactive-title.md)

</div>
