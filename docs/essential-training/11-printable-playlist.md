---
name: '11. Export a printable playlist'
order: 31
title: 'Export a printable playlist | Markup Essential Training'
description: 'Generate a static HTML listening guide with Markup and open its track links without JavaScript.'
layout: document
---

<div lang="en">

## Lesson 11. Export a printable playlist

### Lesson narration

Open the printable playlist in its own tab. The three recordings have titles, artist credits, notes, and links. Open the page source and search for Harbor Lights. You can find the actual track title in the file before any browser script runs. That’s what we want from a listening guide that someone can print or read with JavaScript disabled.

Let’s follow one row back to its source. The Node script reads the same catalog as the interactive player. For each record, it builds a small template with a link and text. The outer template places the rows inside one ordered list. Calling `toString()` serializes that view. The script puts the result in an HTML document and writes it to disk.

Why is there a DOM provider at the top of this file? Markup uses DOM APIs when it creates and serializes its templates. Node needs those APIs available before the Markup runtime is imported. The short setup below supplies them.

Make a copy of the catalog, edit a track title, and run the export again. Refresh your generated file. You’ll see your edit, while the original interactive player still has its own catalog. You can verify the result by reading the generated source or opening the print preview.

### Generate the file

1. Save the [Node export script](/assets/training/print/print-playlist.mjs) and [track catalog](/assets/training/tracks.json) in the same working folder.
2. Open a terminal in that folder. Install the runtime and DOM provider, then run the export.

```sh
npm install @beforesemicolon/markup@1.21.0 global-jsdom@25.0.0 jsdom@25.0.1
node print-playlist.mjs tracks.json
```

3. Open `playlist.html`. View its source and search for **Harbor Lights**. Open the print preview to see how the same list looks on paper.

This is the part of the export that serializes a template.

```javascript
const trackLink = (track) =>
    html`<li><a href="${track.src}">${track.title}</a></li>`
const playlist = html`<ol>
    ${tracks.map(trackLink)}
</ol>`
const output = playlist.toString()
```

### Live result

<div data-training-step="11"><p><a href="/assets/training/example.html?step=11">Open the printable playlist example in its own page</a> · <a href="/assets/training/steps/11.js">View the JavaScript for this example</a></p></div>

### Try it

In a copy of the catalog, add `<Live>` to a track title. Run the script again. Compare that title in the rendered page with its representation in View Source.

**Expected result.** The title displays the angle brackets. The generated source escapes them. The list remains available when browser JavaScript is disabled.

[Previous lesson. Package the player as a Web Component](./10-reusable-player.md) · [Course outline](./index.md) · [Next lesson. Read the TypeScript API](./12-typescript.md)

</div>
