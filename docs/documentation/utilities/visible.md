---
name: Visible
order: 8.5
title: Visible Utility - Markup by Before Semicolon
description: Use the Markup visible utility to defer rendering until content enters the viewport with IntersectionObserver-powered lazy UI.
layout: document
---

## Visible Utility

The `visible` utility allows you to defer the rendering of content until its placeholder element enters or is about to enter the viewport (using `IntersectionObserver` under the hood).

This is incredibly useful for improving page load speed and memory consumption when rendering large lists of complex items, rendering content below the fold, or lazy-loading offscreen components.

```javascript
import { html, visible } from '@beforesemicolon/markup'

html`
    <div class="card-grid">
        ${visible(
            () => html`<heavy-card></heavy-card>`,
            html`<div class="card-placeholder">Loading...</div>`
        )}
    </div>
`.render(document.body)
```

### Options

The third argument is an optional options object which supports standard `IntersectionObserver` options, plus an `eager` flag:

-   `eager` (boolean): When set to `true`, the content will render immediately upon mount, completely bypassing the observer setup.
-   `root` (Element | Document | null): The element that is used as the viewport for checking visibility of the target.
-   `rootMargin` (string): Margin around the root.
-   `threshold` (number | number[]): Numeric value or array of values indicating what percentage of the target's visibility the observer's callback should be executed.

```javascript
html`
    ${visible(
        () => html`<heavy-card></heavy-card>`,
        html`<div class="placeholder"></div>`,
        {
            eager: false,
            rootMargin: '600px 0px',
            threshold: 0,
        }
    )}
`
```

### Observer Deduplication

To ensure maximum performance and minimal browser overhead, the `visible` utility maintains a module-level registry of active `IntersectionObserver` instances. If multiple `visible` elements share identical options (e.g. they all use `rootMargin: '600px 0px'`), they will share a single, global `IntersectionObserver` instance under the hood.

### Automatic Cleanup

When the wrapping template is unmounted from the DOM, the `visible` utility automatically unobserves the elements and cleans up any references in the observer registry, preventing memory leaks.
