---
name: '{{t.pages.documentation.templating.events.meta.events}}'
order: 6.5
title: '{{t.pages.documentation.templating.events.meta.html_events_markup_by_before_semicolon}}'
description: '{{t.pages.documentation.templating.events.meta.attach_native_event_handlers_in_markup_templates_with_inline_on_attributes_pass_listener_options}}'
layout: document
---

## {{t.pages.documentation.templating.events.content.events}}

{{t.pages.documentation.templating.events.content.html_allows_you_set_inline_event_listeners_using_on_attributes_this_is_pretty_much_how_you_set_e}}

```javascript
const handleClick = (event) => {
    console.log(event)
}

html`<button onclick="${handleClick}">click me</button>`
```

{{t.pages.documentation.templating.events.content.the_big_difference_with_markup_is_that_these_attributes_are_not_rendered_and_behind_the_scenes_m}}

```javascript
html`<button onclick="${handleClick}">click me</button>`.render(document.body)

// renders: <button>click me</button>
```

{{t.pages.documentation.templating.events.content.this_allows_your_html_to_have_event_listeners_and_be_safe_by_not_allowing_unsafe_inline_event_li}}

### {{t.pages.documentation.templating.events.content.event_options}}

{{t.pages.documentation.templating.events.content.because_markup_is_using_addeventlistener_behind_the_scenes_it_offers_a_special_syntax_that_allow}}

```javascript
const handleClick = (event) => {
    console.log(event)
}

html`<button onclick="${[handleClick, { once: true }]}">
    click me
</button>`.render(document.body)
```

{{t.pages.documentation.templating.events.content.by_providing_a_tuple_array_with_two_values_you_can_specify_the_handler_and_its_options_to_be_use}}

{{t.pages.documentation.templating.events.content.these_options_are_just_addeventlistener_options_https_developer_mozilla_org_en_us_docs_web_api_e}}

```javascript
const controller = new AbortController()
const signal = controller.signal

const handleClick = (event) => {
    controller.abort()
    console.log('clicked')
}

html`<button onclick="${[handleClick, { signal }]}">click me</button>`.render(
    document.body
)
```
