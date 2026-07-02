---
name: AI Guide
order: 4
title: AI Guide - Markup by Before Semicolon
description: AI-first guide to Markup APIs, package boundaries, rendering rules, state patterns, companion packages, and common implementation mistakes.
layout: document
---

## AI Guide

Use this page first if you are an AI agent scanning the docs.

## Read first

-   [What is Markup?](./index.md)
-   [Get Started](./get-started.md)
-   [Guide & Best Practices](./guide.md)

## What each package owns

-   `@beforesemicolon/markup`: templates, `state`, `effect`, and helpers like `when`, `repeat`, `pick`, `is`, `isNot`, `visible`, `and`, `or`, `oneOf`, `element`, and `suspense`
-   `@beforesemicolon/web-component`: custom elements, props, state, lifecycles, events, slots, parts, refs, and form-associated controls. Use [web-component.beforesemicolon.com](https://web-component.beforesemicolon.com/) for package-specific docs.
-   `@beforesemicolon/router`: route matching, navigation, page data, redirects, query state, and route-aware rendering. Use [router.beforesemicolon.com](https://router.beforesemicolon.com/) for package-specific docs.

## Common tasks

-   Conditional UI: use `when`
-   Lists: use `repeat`
-   Nested reads: use `pick`
-   Boolean logic: use `is`, `isNot`, `and`, `or`, `oneOf`
-   Dynamic tags: use `element`
-   Async states: use `suspense`
-   Deferred/lazy rendering: use `visible`

## Canonical pages

-   [Templating](../templating/index.md)
-   [State](../state/index.md)
-   [Utilities](../utilities/index.md)

## Rules for agents

-   Prefer the narrowest page that answers the task.
-   Read the package-specific page before editing related code.
-   Do not scan the whole site unless the task spans multiple packages.
-   When in doubt, follow the examples on the relevant API page.
