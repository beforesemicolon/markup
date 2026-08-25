# Native SSR and Hydration Plan

## Objective

Render `HtmlTemplate` values on a server without DOM globals, then attach the
normal Markup runtime to that existing HTML in a browser without recreating the
DOM. Keep `HtmlTemplate` as the single public template abstraction and keep all
server code out of the browser bundle.

## Non-goals

-   Do not serialize JavaScript closures, effects, or the application state graph.
-   Do not run `onMount`, `onMove`, or browser effects on the server.
-   Do not require a compiler or application build transform.
-   Do not add streaming until synchronous rendering and hydration are stable.
-   Do not change the current browser `HtmlTemplate.toString()` behavior in v1.

## Public entry points

```ts
// @beforesemicolon/markup/server
renderToString(template: HtmlTemplate): string
renderToStringAsync(template: HtmlTemplate): Promise<string>

// @beforesemicolon/markup/client
hydrate(
    template: HtmlTemplate,
    target: Element | ShadowRoot | DocumentFragment
): HtmlTemplate
```

The root package remains the normal universal authoring API. The server entry
must not import modules that access `document`, `Node`, `customElements`, or
other browser globals during module initialization.

## Internal architecture

`HtmlTemplate` continues to own the environment-neutral template record:

```ts
type TemplateSource = {
    parts: TemplateStringsArray | string[]
    values: readonly TemplateValue[]
}
```

Private adapters consume that record:

-   Client compiler: produces cached DOM definitions and mounted runtime parts.
-   Server compiler: produces cached serialization descriptors.
-   Hydrator: binds client runtime parts to server-created nodes.

Use private symbols or module-private `WeakMap` storage. Do not introduce new
public `HtmlTemplate.__*` cooperation methods.

## Server serialization rules

The server compiler must identify interpolation context and apply matching
rules:

-   Text: escape `&`, `<`, and `>`.
-   Attributes: also escape quotes and follow client boolean-attribute rules.
-   Properties without an HTML representation: omit unless an explicit adapter
    exists.
-   Events: emit no inline JavaScript.
-   Refs: emit only compact hydration metadata when hydration is requested.
-   Arrays and nested templates: serialize recursively.
-   State getters and computed functions: evaluate synchronously as a snapshot.
-   `unsafeHTML`: emit raw source exactly as provided.
-   DOM nodes: reject in the DOM-free renderer with a clear error.
-   Custom elements: serialize their tag and attributes without instantiating the
    custom-element class.

Use a standards-aware server-only parser/tokenizer for context detection,
including table, SVG, MathML, and malformed-but-browser-valid HTML behavior.
Its weight must not enter `dist/client.js`.

## Hydration protocol

Server output includes deterministic, compact part metadata:

-   Comment boundaries for dynamic child ranges.
-   Element metadata for dynamic attributes, properties, events, spreads, and
    refs.
-   A stable template-shape identifier derived from the static template strings.

Hydration performs these steps:

1. Compile the same static template strings with the client compiler.
2. Validate the template-shape identifier.
3. Locate dynamic ranges and elements without recreating static nodes.
4. Attach event listeners and refs.
5. Create normal render effects for reactive parts.
6. Run `onMount` only after all parts are attached.
7. Remove hydration-only metadata when safe.
8. On mismatch, warn in development and replace only the mismatched template
   range.

Hydration must preserve element identity, user-entered form values, selection,
focus, and custom-element instances whenever the static shape matches.

## Data bootstrapping

Applications recreate their state graph on the client from explicit bootstrap
data. Recommend inert JSON rather than executable inline state:

```html
<script id="app-data" type="application/json">
    ...
</script>
```

State serialization is not part of the first SSR release. A later API may
support explicitly named serializable signals, but it must never attempt to
serialize closures implicitly.

## Delivery phases

### Phase 1: DOM-free synchronous renderer

-   Add environment-neutral template access through a private protocol.
-   Add server-only contextual compilation and escaping.
-   Implement `renderToString`.
-   Add parity fixtures against browser serialization.
-   Keep current `.toString()` unchanged.

### Phase 2: Hydration

-   Define and version the marker format.
-   Implement client binding to existing DOM.
-   Cover events, refs, attributes, spreads, nested templates, repeat output,
    custom elements, and lifecycle timing.
-   Add mismatch recovery and development diagnostics.

### Phase 3: Async rendering

-   Implement `renderToStringAsync` for async boundaries.
-   Define timeout, rejection, and abort behavior.
-   Keep synchronous rendering as the small default server path.

### Phase 4: Optional streaming

-   Add `renderToStream` only after async ordering and hydration boundaries are
    proven.
-   Ensure streamed boundaries cannot apply stale or out-of-order content.

## Verification gates

-   Server entry imports successfully when no DOM globals exist.
-   Server HTML matches browser HTML for a shared fixture suite.
-   All text and attribute escaping has adversarial security coverage.
-   Hydration performs zero static-node replacements for matching templates.
-   Hydration preserves form values, focus, and custom-element identity.
-   Browser bundle size does not increase from server-only implementation.
-   Client mount/update benchmarks do not regress.
-   SSR and hydration APIs have ESM, CJS, and TypeScript export-contract tests.

## Open decisions

-   Choose the server-only HTML parser/tokenizer.
-   Decide whether hydration metadata is always emitted or enabled through
    renderer options.
-   Choose the template-shape hash and marker-version format.
-   Define property serialization adapters for form controls and custom elements.
-   Decide whether `renderToStringAsync` waits for all suspense boundaries or
    supports explicit fallback output.
