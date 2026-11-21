---
name: 'Essential Training'
order: 20
title: 'Markup Essential Training | Build an audio player'
description: 'Build an audio player in 12 lessons. Read the narration, follow the instructions, and try each change in a working player.'
layout: document
---

<div lang="en">

## Markup Essential Training

Build an audio player with JavaScript and Markup. Start with one playable track. Finish with a reusable player, a printable playlist, and a typed volume control. You can start if you know HTML and JavaScript. The lessons and examples are in English.

Each lesson includes the recording script, build instructions, code, and a live result. You can work through the course now, ahead of the video release.

**[Start lesson 1. Play the first track](./01-first-track.md)**

### Lessons

1. [Play the first track](./01-first-track.md) — Render a track and use the browser’s audio controls.
2. [Make Now Playing reactive](./02-reactive-title.md) — Switch tracks and update the title with state.
3. [Wire Play and Pause](./03-transport.md) — Keep a custom button in sync with the audio element.
4. [Seek and change volume](./04-seek-volume.md) — Connect two sliders to the current track.
5. [Build a queue that keeps its place](./05-queue.md) — Reorder tracks while keeping each row’s identity.
6. [Remember the listener’s settings](./06-preferences.md) — Restore the volume after a page reload.
7. [Load a catalog and recover from errors](./07-catalog.md) — Show a loading message, an empty queue, and a retry button.
8. [Reveal track notes and render an icon](./08-track-notes.md) — Show notes on demand and render an SVG icon.
9. [Inspect and move a live template](./09-template-lifecycle.md) — Watch what happens when you update, move, and unmount a view.
10. [Package the player as a Web Component](./10-reusable-player.md) — Run two players and remove one during playback.
11. [Export a printable playlist](./11-printable-playlist.md) — Generate a listening guide in Node and open the finished HTML.
12. [Read the TypeScript API](./12-typescript.md) — Check the types behind state, helpers, and queue keys.

### Try the finished player

Press Play, switch tracks, and open the track notes. Select **Add second player** to try two independent instances.

<div data-training-step="10"><p><a href="/assets/training/example.html?step=10">Open the reusable player example in its own page</a> · <a href="/assets/training/steps/10.js">View the JavaScript for this example</a></p></div>

### Edit the examples on your computer

Use Node.js 22.13 or later. From a terminal, run these commands.

```sh
git clone https://github.com/beforesemicolon/markup.git
cd markup
npm ci
node build-docs.js
npm run local:serve:en
```

Open `http://localhost:8080/assets/training/example.html?step=01`. Change the step number for later lessons. Edit the matching file in `docs/_template/assets/training/steps/`. Run `node build-docs.js` again and reload the example to see your change. The three audio files are included in `docs/_template/assets/training/media/`.

### Earlier video course

The [original Markup Essentials Training playlist](https://www.youtube.com/playlist?list=PLpWvGP6yhJUgWNiz25vj__CArY9Z0O6ke) is available on the Before Semicolon YouTube channel.

</div>
