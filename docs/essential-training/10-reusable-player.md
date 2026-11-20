---
name: '10. Package the player as a Web Component'
order: 30
title: 'Package the player as a Web Component | Markup Essential Training'
description: 'Mount and release independent Markup views from the lifecycle of a native playlist-player element.'
layout: document
---

<div lang="en">

## Lesson 10. Package the player as a Web Component

### Lesson narration

Play a few seconds of audio in Player 1, pause, and leave it on Slow Tide. Now add the second player. It has its own audio element, queue, and selection. Choose Night Signal in Player 2. Look back at Player 1. Its heading still says Slow Tide. Being on the same page does not force those two players to share a track.

Follow the code from `connectedCallback`. Each time a new custom element connects, its factory creates fresh state and returns a view for that element. The element keeps a reference to the view. On disconnect, it unmounts the view and clears its reference. The component’s cleanup then has a chance to pause audio, stop its effects, and release pending work.

Here’s a test that you can hear. Keep Player 1 paused. Press Play in Player 2 and remove Player 2 while its recording is still playing. The sound should stop when its owner leaves the page. Add the second player again and click Play once. It should respond once.

That gives us a native `playlist-player` element we can use anywhere the component is registered. The track queue belongs to the instance. A preference such as saved volume can deliberately use one storage key across visits.

### Create the custom element

1. Move the per-player state into a factory. Have that factory return a fresh template each time you call it.
2. Mount one instance in `connectedCallback` and keep a reference to it. Guard against a second mount.
3. In `disconnectedCallback`, unmount the view and clear the reference so a later connection can create a fresh instance.

```javascript
class PlaylistPlayer extends HTMLElement {
    connectedCallback() {
        if (!this.view) this.view = createNotesPlayer().render(this)
    }

    disconnectedCallback() {
        this.view?.unmount()
        this.view = null
    }
}

customElements.define('playlist-player', PlaylistPlayer)
```

In this pattern, `createNotesPlayer` creates the template and registers the mount cleanup. You can now place `<playlist-player></playlist-player>` anywhere in a document that loads the component.

### Live result

<div data-training-step="10"><p><a href="/assets/training/example.html?step=10">Open the reusable player example in its own page</a> · <a href="/assets/training/steps/10.js">View the JavaScript for this example</a></p></div>

### Try it

Add the second player. Choose a different track in each player. Start the second one, remove it, and add it again.

**Expected result.** Each player keeps its own selection. Removing the second player stops its audio. On reconnect, one click produces one action.

[Previous lesson. Inspect and move a live template](./09-template-lifecycle.md) · [Course outline](./index.md) · [Next lesson. Export a printable playlist](./11-printable-playlist.md)

</div>
