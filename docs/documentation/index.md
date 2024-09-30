---
name: Markup Documentation
path: /documentation
title: Documents - Markup by Before Semicolon
description: What is Markup?
layout: document
---

## What is Markup?

Markup is a JavaScript reactive templating system built to simplify how you build Web user interfaces using web standards with minimal enhancements to the native web APIs as possible.

It consists of 3 main APIs with additional utilities to simplify things even further:

- `html`: A JavaScript tagged function that allows you to represent the DOM using template literal string;
- `state`: A simple state tracking API that allows you to define and update data as you wish;
- `effect`: A `state` dependent function that allows you to write logic that needs to be execute whenever any state changes;

### Motivation

JavaScript with Web Standards and APIs give you everything you need to build any web project you want on the web. What is often painful to deal with is the DOM and reactivity especially as the project gets bigger or require multiple people collaboration.

Markup uses template literals and functions to do everything. 

- Functions: JavaScript functions are perfect for lazy evaluations and its used in the reactivity of it all from the `state`, `effect`, and any utility that evaluates things as needed.
- Template Literals: The template literal is used to represent HTML in JavaScript, and avoid to reinvent the wheel. Everything else is enforced by web standards.

Literally everything else is you know it to be in plain HTML, CSS and JavaScript.

We believe in a simple way to build the web without the jargon of a framework, complex project setups, all to spit out HTML, CSS and JavaScript at the end.

### Why Markup?

Markup focus on being intuitive by relying on whats familiar; on being small so you can confidently ship it to the client; and on enhancing the web by doing things well and in performant way. 

This philosophy can be further broken down into six points:

- **Reactive**:
    Markup uses JavaScript **[template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals)** and Functions to allow you to create reative DOM with state management, render lyfecycles, and side effects control.
- **Small**:
    Markup allows you to do a lot with **9Kb compressed** code (**_18Kb umcompressed_**. From prototyping to enterprise web applications, you can ship it to the client confidently!
- **Simple**:
    Markup is **[based on Web Standards](https://www.w3.org/standards/)** and exposes 3 simple APIs you can use to enhance Web Components APIs, working with DOM, and building any Web User Interface.
- **Plug & Play**:
    Markup requires no build, no parsing, no bundling. You can simply add it to your project and start using it. This is because it is based on web standards and looks super familiar.
- **Web Component**:
    Markup enhances Web Component APIs with reactivity and by eliminating the need to perform DOM manipulations when creating components for your projects.
- **Performance**:
    Markup is data aware and handles everything behind the scenes which allows the DOM to only be updated when ands where it is necessary.


