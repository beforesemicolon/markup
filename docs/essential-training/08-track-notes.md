---
name: '08. Reveal track notes and render an icon'
order: 28
title: 'Reveal track notes and render an icon | Markup Essential Training'
description: 'Render notes when they enter view and keep catalog text separate from trusted icon markup.'
layout: document
---

<div lang="en">

## Lesson 8. Reveal track notes and render an icon

### Lesson narration

Open Track notes and read the note for the current recording. Select a different track while the panel stays open. The note changes with the selection. We have two separate pieces of behavior here. One decides when to create the content. The other supplies the text after that content exists.

Look at the `visible` call. We pass a function that builds the notes, a small placeholder, and an observation margin. While the disclosure is closed, the note can wait. When its placeholder enters the observation area, Markup calls the factory. The factory returns a paragraph that reads the current track. That live binding keeps working when you move to another recording.

Take a closer look at the label beside the disclosure arrow. We use `element` to make a span with text. The music icon comes from a fixed SVG string in the module. We pass that string to `unsafeHTML` because we wrote and control every character in it. Track notes come from the catalog and belong in a standard text interpolation.

To see why that choice matters, put the characters `<em>Live</em>` in a note in your own copy. Open the notes. You’ll see the angle brackets and the word Live exactly as the author entered them.

### Build the notes panel

1. Create a label and a disclosure with native `details` and `summary` elements.
2. Pass a notes factory and a placeholder with height to `visible`. Try moving the reveal boundary by changing `rootMargin`.
3. Add a fixed icon and interpolate the active note as text.

```javascript
const label = element('span', { textContent: 'Track notes' })
const icon = unsafeHTML(
    '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16"><path fill="currentColor" d="M6 2h7v7a2 2 0 1 1-1-1.7V4H7v7a2 2 0 1 1-1-1.7z"/></svg>'
)
const panel = visible(
    () => html`<p>${pick(player.current, 'notes')}</p>`,
    html`<p>Loading notes…</p>`,
    { rootMargin: '32px' }
)
```

Place the icon and label inside the summary. Put the panel underneath it. Keeping the icon hidden from assistive technology leaves the label as the accessible name.

### Live result

<div data-training-step="08"><p><a href="/assets/training/example.html?step=08">Open the track notes example in its own page</a> · <a href="/assets/training/steps/08.js">View the JavaScript for this example</a></p></div>

### Try it

Open the track notes, then select another track. In your copy, add the literal text `<em>Live</em>` to a note.

Try `{ eager: true }` as the options argument to `visible`. Reload with the disclosure closed and inspect it in the browser’s Elements panel. The notes paragraph already exists. Opening the disclosure makes it visible on screen.

**Expected result.** The revealed note changes with the track. The markup characters in the note appear as text.

[Previous lesson. Load a catalog and recover from errors](./07-catalog.md) · [Course outline](./index.md) · [Next lesson. Inspect and move a live template](./09-template-lifecycle.md)

</div>
