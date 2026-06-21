---
name: What's possible?
order: 6
title: Capabilities - Markup by Before Semicolon
description: Explore what you can build with Markup, including function components, Web Components, form controls, routing, state stores, and server-rendered templates.
layout: document
---

## Capabilities

Markup is a highly flexible, performant, and lightweight templating system that can serve as the core of anything from quick single-file widgets to large-scale, enterprise-ready systems.

### From Tiny Solutions to Enterprise Systems

Because Markup requires **no compile or build step** and is only **7.6KB gzip**, it has zero package friction. This makes it a perfect fit for a wide spectrum of applications:

#### 1. Lightweight & Specialized Environments

Modern web frameworks often carry a heavy penalty in bundle size and setup complexity. Markup's footprint is small enough that it simplifies development in resource-constrained or specialized environments:

-   **Browser Extensions**: Build Manifest V3 content scripts, side panels, and popups without packaging a massive runtime or fighting complex bundler settings.
-   **Embeddable Widgets**: Create chat widgets, calculators, feedback forms, or interactive cards that can be injected into any client website without bloating their page load times.
-   **CMS Plugins & Themes**: Add rich reactivity to Shopify, WordPress, or custom headless CMS templates seamlessly.
-   **Micro-frontends**: Ship independent, highly isolated components that initialize instantly and share almost zero overhead.

#### 2. Large‑Scale & Enterprise Applications

At the other end of the spectrum, Markup’s simplicity and flexibility scale cleanly to large-scale codebases. Because it relies entirely on native JavaScript primitives and standard APIs, it integrates naturally with professional architecture patterns:

-   **Composition**: Build scalable UI using [Function Components](./function-component.md) or standard [Web Components](./web-component.md).
-   **State Management**: Create robust, predictable unidirectional data flows using [State Stores](./state-store.md).
-   **Declarative Routing**: Power complex Single Page Applications (SPAs) using the `@beforesemicolon/router` [Router](./router.md).
-   **Performance**: Surgical DOM reconciliation ensures that enterprise dashboards, complex forms, and data-heavy tables remain extremely fast and responsive.
-   **Server-Side Rendering (SSR)**: Boost SEO and initial load times for massive web apps with native [Server Side Rendering](./server-side-rendering.md) capabilities.

---

Before Semicolon offers additional libraries built on top of Markup to provide full framework-like capabilities:

-   [Web Components Integration](./web-component.md) — Enhance custom elements with automatic reactive rendering.
-   [SPA Router](./router.md) — Manage path matching, query state, and route-aware template switches.

Additionally, here are examples of architecture patterns you can build using only core Markup APIs:

-   [Function Components](./function-component.md)
-   [State Management Stores](./state-store.md)
-   [Server-Side Rendering (SSR)](./server-side-rendering.md)

### Examples

Here are more examples you can draw inspiration from:

-   [Node SSR website](https://stackblitz.com/edit/stackblitz-starters-a6rvq7)
-   [ToDo App with Localstorage](https://codepen.io/beforesemicolon/pen/BaXJxwx?editors=0010)
-   [ToDo App with State Management](https://stackblitz.com/edit/web-platform-lvonxr)
-   [Tic Tac Toe app](https://codepen.io/beforesemicolon/pen/eYqyreO?editors=0010)
-   [Calculator app](https://codepen.io/beforesemicolon/pen/abeEGMB)
-   [SPA (Router) app](https://stackblitz.com/edit/vitejs-vite-4jvsfp?file=index.html)
-   [Counter App](https://stackblitz.com/edit/web-platform-ixypdh)
-   [Timer App](https://codepen.io/beforesemicolon/pen/yLQzQZV)
