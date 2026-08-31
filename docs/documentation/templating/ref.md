---
name: '{{t.pages.documentation.templating.ref.meta.references}}'
order: 6.4
title: '{{t.pages.documentation.templating.ref.meta.template_dom_references_markup_by_before_semicolon}}'
description: '{{t.pages.documentation.templating.ref.meta.use_the_markup_ref_attribute_to_capture_dom_element_references_from_rendered_templates_and_safel}}'
layout: document
---

## {{t.pages.documentation.templating.ref.content.ref}}

{{t.pages.documentation.templating.ref.content.markup_templates_will_handle_all_dom_elements_rendering_for_you_but_if_you_really_need_to_access}}

```javascript
html`<button ref="btn">click me</button>`
```

### {{t.pages.documentation.templating.ref.content.multiple_references}}

{{t.pages.documentation.templating.ref.content.the_ref_attribute_always_return_an_array_therefore_you_can_use_the_same_key_to_grab_multiple_ite}}

```javascript
const temp = html`
    <li ref="item">item 1</li>
    <li ref="item">item 2</li>
    <li ref="item">item 3</li>
`.render(document.body)
```

{{t.pages.documentation.templating.ref.content.references_are_not_created_until_the_template_is_rendered_this_is_because_creating_a_template_si}}

### {{t.pages.documentation.templating.ref.content.access_references}}

{{t.pages.documentation.templating.ref.content.to_access_these_reference_elements_you_can_read_the_refs_property_in_the_template_instance}}

```javascript
const temp = html`
    <li ref="item">item 1</li>
    <li ref="item">item 2</li>
    <li ref="item">item 3</li>
`.render(document.body)

console.log(
    temp.refs['item'] // (3) [li, li, li]
)
```

{{t.pages.documentation.templating.ref.content.the_refs_property_returns_an_object_literal_with_array_of_elements_keyed_by_the_value_you_provid}}

### {{t.pages.documentation.templating.ref.content.nested_references}}

{{t.pages.documentation.templating.ref.content.you_can_access_any_reference_via_the_template_instance_including_its_child_templates}}

```javascript
const items = [
    html`<li ref="item">Buy groceries</li>`,
    html`<li ref="item">Go to gym</li>`,
    html`<li ref="item">Write a blog</li>`,
]

const temp = html`
    <ul ref="list">
        ${items}
    </ul>
`.render(document.body)

console.log(
    temp.refs // {item: Array(3), list: Array(1)}
)
```

{{t.pages.documentation.templating.ref.content.this_capability_allows_you_to_focus_on_your_top_template_and_work_everything_from_there_this_doe}}

```javascript
items[0].refs['item'] // [li]
temp.refs['list'] // [ul]
temp.refs['item'] // [li, li, li]
```

### {{t.pages.documentation.templating.ref.content.dynamic_references}}

{{t.pages.documentation.templating.ref.content.all_references_are_dynamic_and_this_means_that_as_things_render_or_unmount_from_the_template_ref}}

{{t.pages.documentation.templating.ref.content.refs_only_contains_currently_mounted_elements_inactive_conditional_branches_are_excluded_until_rendered}}

```javascript
const items = [
    html`<li ref="item">Buy groceries</li>`,
    html`<li ref="item">Go to gym</li>`,
    html`<li ref="item">Write a blog</li>`,
]

const temp = html`
    <ul ref="list">
        ${items}
    </ul>
`.render(document.body)

console.log(
    temp.refs // {item: Array(3), list: Array(1)}
)

items[0].unmount()
items[2].unmount()

console.log(
    temp.refs // {item: Array(1), list: Array(1)}
)
```

{{t.pages.documentation.templating.ref.content.for_this_reason_you_should_always_check_for_the_reference_being_there_before_doing_anything_this}}
