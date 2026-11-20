---
name: '07. Load a catalog and recover from errors'
order: 27
title: 'Load a catalog and recover from errors | Markup Essential Training'
description: 'Use suspense to render a loading state, the fetched playlist, and a retry action.'
layout: document
---

<div lang="en">

## Lesson 7. Load a catalog and recover from errors

### Lesson narration

Reload the catalog and watch the status beneath the queue. The page fetches a JSON file, reads three records, and reports how many tracks it loaded. Now select Test failed request. You get a message and a Retry button. Use Retry, then choose Test empty catalog. This time the request completes and the catalog reports zero tracks. Those are two different outcomes, and the listener can see which one happened.

Look at the boundary around that work. The transport stays mounted. A `suspense` helper manages the region that reports on this request. Its first argument starts the fetch. The second gives us a loading view. The third produces the message and the button to use if the request fails. Once the response passes the status check, the async function reads its JSON and replaces the queue with those records.

There’s one more detail worth trying. Start a new request before an earlier one finishes. The load handler aborts the previous request. Before applying the result, the async function also checks that its request is still active and the player is still mounted. An old response from a slow connection should never put yesterday’s selection back on the screen.

Reload the catalog to finish with the three playable tracks.

### Load the queue

1. Fetch the catalog from a served JSON file. Inspect `response.ok` before parsing its body.
2. Replace the queue with the resolved records. Return a status view with the count. The queue’s existing `repeat` shows the empty state for zero tracks.
3. Pass this work to `suspense`. Bind a retry button to a new request. To cancel network work, pass an `AbortController` signal to `fetch` and abort the previous request.

```javascript
async function loadQueue() {
    const response = await fetch('/assets/training/tracks.json')
    if (!response.ok) throw new Error('Catalog unavailable')
    const tracks = await response.json()
    player.replaceQueue(tracks)
    return html`<p role="status">${tracks.length} tracks loaded.</p>`
}

const region = suspense(loadQueue, loadingView, failureView)
```

In the live source, each attempt creates its own abort controller. The `failureView` callback returns a message and a retry button.

### Live result

<div data-training-step="07"><p><a href="/assets/training/example.html?step=07">Open the catalog example in its own page</a> · <a href="/assets/training/steps/07.js">View the JavaScript for this example</a></p></div>

### Try it

Use the failed-request test, then Retry. Use the empty-catalog test and reload the catalog.

**Expected result.** A failure offers a retry. An empty response shows an empty queue. A successful reload restores the tracks.

[Previous lesson. Remember the listener’s settings](./06-preferences.md) · [Course outline](./index.md) · [Next lesson. Reveal track notes and render an icon](./08-track-notes.md)

</div>
