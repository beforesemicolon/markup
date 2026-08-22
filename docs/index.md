---
name: '{{t.pages.home.meta.markup}}'
order: 0
title: '{{t.pages.home.meta.markup_by_before_semicolon}}'
description: '{{t.pages.home.meta.compact_reactive_html_templating_system}}'
layout: landing
---

::: layout landing-hero version=v1.18.3 title="{{t.pages.home.content.reactive_dom}}" title2="{{t.pages.home.content.zero_build}}" primaryLabel="{{t.common.content.get_started}}" secondaryLabel="npm i @beforesemicolon/markup"

=== copy

{{t.pages.home.content.a_tiny_web_standards_first_templating_system_that_brings_reactivity_state_and_components_to_vani}}

=== stat

## {{t.pages.home.content.cdn_gzip_size}}

{{t.pages.home.content.cdn_gzip}}

=== stat

## 0

{{t.pages.home.content.third_party_deps}}

=== stat

## 100%

{{t.pages.home.content.web_standards}}

=== code filename=counter.js lang=javascript

```javascript
import { html, state, effect } from '@beforesemicolon/markup'

const [count, updateCount] = state(0)

const doubleCount = () => count() * 2

effect(() => {
    console.log(count())
})

const countUp = () => updateCount((prev) => prev + 1)
const countDown = () => updateCount((prev) => prev - 1)

const App = html`
    <h1>Conunter</h1>
    <p><strong>Current count</strong>: ${count}</p>
    <p><strong>Double count</strong>: ${doubleCount}</p>
    <button type="button" onclick="${countDown}">-</button>
    <button type="button" onclick="${countUp}">+</button>
`

App.render(document.getElementById('app'))
```

:::

::: layout landing-ecosystem

=== header

{{t.pages.home.content.the_ecosystem}}

## {{t.pages.home.content.extend_the_way_you_build}}

{{t.pages.home.content.use_markup_on_its_own_for_reactive_templates_or_add_focused_companion_packages_when_your_app_nee}}

=== product title="{{t.pages.home.content.web_components}}" package=@beforesemicolon/web-component color=orange icon=webComponents href=https://web-component.beforesemicolon.com/

{{t.pages.home.content.a_reactive_layer_over_the_native_web_components_api_keep_markup_s_template_model_while_adding_pr}}

=== product title=Router package=@beforesemicolon/router color=cyan icon=router href=https://router.beforesemicolon.com/

{{t.pages.home.content.declarative_routing_as_web_component_tags_compose_pages_nested_layouts_query_routes_and_lazy_loa}}

=== product title=Intl package=@beforesemicolon/intl color=primary icon=reactive href=https://intl.beforesemicolon.com/

{{t.pages.home.content.localization_for_component_first_interfaces_add_locale_scopes_translated_messages_and_formatter}}

:::

::: layout landing-features

=== header

{{t.pages.home.content.why_markup}}

## {{t.pages.home.content.the_platform_is_the_framework}}

{{t.pages.home.content.web_standards_web_apis_and_modern_javascript_are_all_you_need_markup_just_adds_the_reactivity}}

=== feature icon=reactive

### {{t.pages.home.content.reactive}}

{{t.pages.home.content.template_literals_and_functions_create_reactive_dom_with_state_lifecycles_and_side_effects}}

=== feature icon=tiny

### {{t.pages.home.content.tiny_cdn_build}}

{{t.pages.home.content.cdn_browser_build_size}}

=== feature icon=standards

### {{t.pages.home.content.web_standards_2}}

{{t.pages.home.content.three_simple_apis_that_extend_the_platform_you_already_know_no_proprietary_abstractions}}

=== feature icon=plug

### {{t.pages.home.content.plug_play}}

{{t.pages.home.content.drop_in_a_script_tag_and_go_no_build_step_no_jsx_no_configuration_files}}

=== feature icon=webComponents

### {{t.pages.home.content.web_components}}

{{t.pages.home.content.supercharge_native_web_components_with_reactivity_skip_manual_dom_manipulation}}

=== feature icon=surgical

### {{t.pages.home.content.surgical_updates}}

{{t.pages.home.content.data_driven_rendering_means_the_dom_updates_only_where_and_when_it_actually_needs_to}}

:::

::: layout landing-showcase

=== header

{{t.pages.home.content.see_it_in_action}}

## {{t.pages.home.content.looks_like_html_feels_like_magic}}

{{t.pages.home.content.reactive_state_component_composition_and_lifecycle_all_from_the_javascript_primitives_you_alread}}

=== example label="{{t.pages.home.content.todos_localstorage}}" color=orange filename=todos.js lang=javascript

```javascript
import { html, state, effect, repeat } from '@beforesemicolon/markup'

const [todos, setTodos] = state(
    JSON.parse(localStorage.getItem('todos') ?? '[]')
)

effect(() => {
    localStorage.setItem('todos', JSON.stringify(todos()))
})

const addTodo = () => {
    const text = window.prompt('What needs doing?')?.trim()

    if (text) setTodos((prev) => [...prev, { text, done: false }])
}

const toggle = (i) =>
    setTodos(todos().map((t, idx) => (idx === i ? { ...t, done: !t.done } : t)))

html`
    <button type="button" onclick="${addTodo}">Add</button>
    <ul>
        ${repeat(
            todos,
            (todo, i) => html`
                <li
                    class="${todo.done ? 'done' : ''}"
                    onclick="${() => toggle(i)}"
                >
                    ${todo.text}
                </li>
            `
        )}
    </ul>
`.render(document.querySelector('#app'))
```

=== example label="{{t.pages.home.content.button_component_using_webcomponent}}" color=cyan filename=button-component.js lang=javascript

```javascript
import { WebComponent, html } from '@beforesemicolon/web-component'
import stylesheet from './button.css' with { type: 'css' }

class Button extends WebComponent {
    static observedAttributes = ['disabled', 'type']

    type = 'button'
    disabled = false

    stylesheet = stylesheet

    handleClick = (evt) => {
        evt.stopPropagation()
        this.dispatch('click')
    }

    render = () => {
        return html`
            <button ${this.props} class="btn" onclick="${this.handleClick}">
                <slot></slot>
            </button>
        `
    }
}

customElements.define('bfs-button', Button)
```

=== example label="{{t.pages.home.content.suspense_async}}" color=orange filename=profile.js lang=javascript

```javascript
import { html, suspense } from '@beforesemicolon/markup'

const loadUser = async () => {
    const res = await fetch('/api/me')
    return res.json()
}

const renderUser = async () => {
    const user = await loadUser()
    return html`
        <article>
            <h2>${user.name}</h2>
            <p>${user.bio}</p>
        </article>
    `
}

html`
    <h1>Profile</h1>

    ${suspense(
        renderUser,
        html`<p>Loading profile...</p>`, // fallback
        (err) => html`<p>Failed: ${err.message}</p>` // catch
    )}
`.render(document.querySelector('#app'))
```

=== example label="{{t.pages.home.content.page_routing}}" color=cyan filename=app.html lang=html

```html
<!-- in <head>:
<script src="https://unpkg.com/@beforesemicolon/router/dist/client.js"></script>
-->

<nav>
    <page-link path="/">Home</page-link>
    <page-link path="/about">About</page-link>
    <page-link path="/users">Users</page-link>
</nav>

<page-route path="/">
    <h1>Welcome home</h1>
</page-route>

<page-route path="/about" src="./pages/about.js"></page-route>

<page-route path="/users" exact="false">
    <page-route src="./pages/users.js"></page-route>
    <page-route path="/:userId" src="./pages/user.js"></page-route>
</page-route>

<page-route path="/404"> 404 - Page not found! </page-route>

<page-redirect path="/404" title="404 - Page not found!"></page-redirect>
```

=== example label="{{t.pages.home.content.template_lifecycles}}" color=orange filename=timer.js lang=javascript

```javascript
import { html, state } from '@beforesemicolon/markup'

const [seconds, setSeconds] = state(0)

html` <p>Elapsed: ${seconds}s</p> `
    .onMount(() => {
        // runs once when attached to the DOM
        const id = setInterval(() => setSeconds(seconds() + 1), 1000)
        return () => clearInterval(id)
    })
    .onUpdate(() => {
        // runs every time a tracked value changes
        console.log('tick', seconds())
    })
    .render(document.querySelector('#app'))
```

:::

::: layout landing-install

=== header

{{t.pages.home.content.quick_start}}

## {{t.pages.home.content.install_in_seconds}}

{{t.pages.home.content.pick_your_weapon_markup_works_everywhere_javascript_runs}}

=== tab key=cdn label=CDN command="<script src=&quot;https://unpkg.com/@beforesemicolon/markup/dist/client.js&quot;></script>"

=== tab key=npm label=npm command="npm install @beforesemicolon/markup"

=== tab key=yarn label=yarn command="yarn add @beforesemicolon/markup"

=== tab key=pnpm label=pnpm command="pnpm add @beforesemicolon/markup"

:::

::: layout landing-cta title="{{t.pages.home.content.build_the_web}}" title2="{{t.pages.home.content.your_way}}"

=== copy

{{t.pages.home.content.join_developers_shipping_faster_with_a_framework_that_respects_the_platform_and_your_time}}

:::
