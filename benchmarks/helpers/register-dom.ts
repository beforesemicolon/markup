import { JSDOM } from 'jsdom'

// Benchmarks run in Node, outside Jest's jsdom environment. Install only missing
// browser globals so Node's timers, performance and other built-ins stay intact.
const { window } = new JSDOM('<!doctype html><html><body></body></html>', {
    url: 'http://localhost/',
    pretendToBeVisual: true,
})

for (const key of Object.getOwnPropertyNames(window)) {
    if (key in globalThis || key.startsWith('_')) continue
    Object.defineProperty(globalThis, key, {
        configurable: true,
        writable: true,
        value: window[key as keyof typeof window],
    })
}
