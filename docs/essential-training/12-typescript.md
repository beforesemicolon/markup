---
name: '12. Read the TypeScript API'
order: 32
title: 'Read the TypeScript API | Markup Essential Training'
description: 'Use the published Markup types to check player state, helpers, list keys, and cleanup at compile time.'
layout: document
---

<div lang="en">

## Lesson 12. Read the TypeScript API

### Lesson narration

Move the Volume slider all the way to the left. The preview says Muted. Move it to one quarter and you’ll see Quiet. At one half it changes to Audible. This preview displays the numeric value and its label. You can inspect each state without starting playback.

Follow the input handler. The browser exposes a range value as text through `value` and as a number through `valueAsNumber`. For this control, we want a number. The TypeScript exercise makes that choice explicit with a state getter and setter for `number`. The types describe how JavaScript functions can be called. They do their work when you run the compiler.

Open the volume model and deliberately pass the string `'0.5'` to its setter. Run the check. The compiler points to the mismatch before an audio element ever sees the value. Change it back to the number `0.5` and run the same command again.

Now follow that idea into the queue. A key function promises a particular key type. The compiler can check that promise too. Use the runtime preview to check what the listener sees. Use the terminal to check which values the component accepts.

### Check the contracts

1. Download the [TypeScript exercise](/assets/training/types/player-types.ts), [package manifest](/assets/training/types/package.json), and [compiler settings](/assets/training/types/tsconfig.json). Save them in one folder using their original file names.
2. Open a terminal in that folder. Run the commands below. The check uses `tsc --noEmit`.

```sh
npm install
npm run check
```

3. In the volume model, temporarily add `setVolume('0.5')` just after the state declaration. Run the check again. Change the string to `0.5` and repeat.
4. Inspect `RepeatOptions` for a keyed queue, `VisibleOptions` for lazy content, and `LifecycleCallback` for cleanup. The exercise uses all 16 type-only exports in the pinned package.

```typescript
import type { StateGetter, StateSetter } from '@beforesemicolon/markup'

function readPercent(volume: StateGetter<number>) {
    return Math.round(volume() * 100)
}

function setPercent(setVolume: StateSetter<number>, percent: number) {
    setVolume(percent / 100)
}
```

### Live result

<div data-training-step="12"><p><a href="/assets/training/example.html?step=12">Open the TypeScript volume model example in its own page</a> · <a href="/assets/training/steps/12.js">View the JavaScript for this example</a></p></div>

### Try it

Move the preview’s volume slider through zero, a low level, and a high level. Then change a track key from a string to a number in the local exercise and run the compiler.

**Expected result.** The preview changes its volume label immediately. In the terminal, the compiler reports a mismatch when a value has the wrong type. After you restore the declared types, the check completes successfully.

[Previous lesson. Export a printable playlist](./11-printable-playlist.md) · [Course outline](./index.md)

</div>
