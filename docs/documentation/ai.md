---
name: AI Guide
order: 4
title: AI Guide - Markup by Before Semicolon
description: AI-first overview of Markup, Web Component, and Router usage.
layout: document
---

# AI Guide

Use this page first if you are an AI agent scanning the docs.

## Read first

-   [What is Markup?](./index.md)
-   [Get Started](./get-started.md)
-   [Guide & Best Practices](./guide.md)
-   [Web Component](./capabilities/web-component.md)
-   [Router](./capabilities/router.md)

## What each package owns

-   `@beforesemicolon/markup`: templates, `state`, `effect`, and helpers like `when`, `repeat`, `pick`, `is`, `and`, `or`, `oneOf`, `element`, and `suspense`
-   `@beforesemicolon/web-component`: custom elements, props, state, lifecycles, events, slots, parts, refs, and form-associated controls
-   `@beforesemicolon/router`: route matching, navigation, page data, redirects, query state, and route-aware rendering

## Common tasks

-   Conditional UI: use `when`
-   Lists: use `repeat`
-   Nested reads: use `pick`
-   Boolean logic: use `is`, `isNot`, `and`, `or`, `oneOf`
-   Dynamic tags: use `element`
-   Async states: use `suspense`
-   Custom element UI: use `WebComponent` plus `html`
-   Component communication: use custom events, not callback props

## Canonical pages

-   [Templating](../templating/index.md)
-   [State](../state/index.md)
-   [Utilities](../utilities/index.md)
-   [Web Component](./capabilities/web-component.md)
-   [Form Controls](./capabilities/form-controls.md)
-   [Router](./capabilities/router.md)

## Rules for agents

-   Prefer the narrowest page that answers the task.
-   Read the package-specific page before editing related code.
-   Do not scan the whole site unless the task spans multiple packages.
-   When in doubt, follow the examples on the relevant API page.
