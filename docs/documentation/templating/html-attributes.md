---
name: '{{t.pages.documentation.templating.html_attributes.meta.attributes}}'
order: 6.3
title: '{{t.pages.documentation.templating.html_attributes.meta.html_attributes_markup_by_before_semicolon}}'
description: '{{t.pages.documentation.templating.html_attributes.meta.work_with_markup_template_attributes_boolean_attributes_dynamic_values_object_attributes_refs_cl}}'
layout: document
---

## {{t.pages.documentation.templating.html_attributes.content.html_attributes}}

{{t.pages.documentation.templating.html_attributes.content.html_attributes_in_markup_templates_are_just_html_attributes_one_specific_behavior_change_is_rel}}

### {{t.pages.documentation.templating.html_attributes.content.boolean_attributes}}

{{t.pages.documentation.templating.html_attributes.content.boolean_attributes_in_html_are_attributes_that_represent_true_or_false_values}}

```javascript
html`
    <p hidden="false">hidden text</p>
    <button disabled>click me</button>
    <input type="checkbox" checked="false" />
`.render(document.body)
// <p hidden="false">hidden text</p>        <- still hidden
// <button disabled="">click me</button>
// <input type="checkbox" checked="false">  <- still checked
```

{{t.pages.documentation.templating.html_attributes.content.the_issue_with_boolean_attributes_in_html_is_that_giving_them_the_value_of_false_does_not_stop_t}}

{{t.pages.documentation.templating.html_attributes.content.markup_honors_the_true_or_false_values_and_allows_you_to_add_or_remove_these_attributes_just_by}}

```javascript
const hidden = false
const disabled = true
const checked = false

html`
    <p hidden="${hidden}">hidden text</p>
    <button disabled="${disabled}">click me</button>
    <input type="checkbox" checked="${checked}" />
`.render(document.body)
// <p>hidden text</p>
// <button disabled="true">click me</button>
// <input type="checkbox">
```

{{t.pages.documentation.templating.html_attributes.content.setting_an_attribute_value_to_false_as_string_or_boolean_or_nil_undefined_or_null_will_remove_th}}

```
const disabled = false
const checked = null

html`
    <p hidden="false">hidden text</p>
    <button disabled="${disabled}">click me</button>
    <input type="checkbox" checked="${checked}" />
`.render(document.body)
// <p>hidden text</p>
// <button>click me</button>
// <input type="checkbox">
```

### {{t.pages.documentation.templating.html_attributes.content.value_attributes}}

{{t.pages.documentation.templating.html_attributes.content.markup_is_aware_of_value_you_inject_in_the_template_as_attribute_values_and_will_track_and_updat}}

```javascript
const type = 'button'
const active = 'active'
const style = 'color: white; background: black'

html`
    <button
        type="${type}"
        class="btn ${active} common"
        style="border: none; ${style}"
    >
        click me
    </button>
`.render(document.body)
// <button type="button" class="btn active common" style="border: none; color: white; background: black">click me</button>
```

### {{t.pages.documentation.templating.html_attributes.content.event_attributes}}

{{t.pages.documentation.templating.html_attributes.content.html_allows_you_to_declare_inline_event_attributes_and_they_work_the_same_with_markup_no_extra_s}}

```javascript
const handleClick = (event) => {
    console.log(event)
}

html`<button onclick="${handleClick}">click me</button>`
```

### {{t.pages.documentation.templating.html_attributes.content.reference_attribute}}

{{t.pages.documentation.templating.html_attributes.content.one_thing_that_exists_in_markup_and_not_in_html_is_the_ref_attribute_that_allows_you_to_create_a}}

```javascript
html`<button ref="btn">click me</button>`
```

### {{t.pages.documentation.templating.html_attributes.content.attributes_as_object}}

{{t.pages.documentation.templating.html_attributes.content.it_is_good_to_know_all_the_possible_attributes_in_advance_but_sometimes_that_s_not_possible_for}}

```javascript
const [count, setCount] = state(0)

const btn = ({ text = 'click me', ...props }) =>
    html` <button ${props} type="button">${text}</button>`

const countUp = () => {
    setCount((prev) => prev + 1)
}

const temp = html`
    <p>${count}</p>
    ${button({ text: '+', ariaLabel: 'count up button', onClick: countUp })}
`
/* renders:
<p>0</p>
<button type="button" aria-label="count up button">+</button>
*/

temp.render(document.body)
```

{{t.pages.documentation.templating.html_attributes.content.any_attribute_you_set_after_injecting_the_attribute_object_will_override_the_object_attribute_na}}

{{t.pages.documentation.templating.html_attributes.content.also_you_can_use_camelcase_attribute_name_to_changed_to_kebab_case_in_the_example_above_arialabe}}
