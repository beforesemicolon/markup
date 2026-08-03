---
name: '{{t.pages.documentation.utilities.element.meta.element}}'
order: 8.1
title: '{{t.pages.documentation.utilities.element.meta.element_utility_markup_by_before_semicolon}}'
description: '{{t.pages.documentation.utilities.element.meta.use_the_markup_element_utility_to_create_dom_elements_programmatically_with_attributes_children}}'
layout: document
---

## {{t.pages.documentation.utilities.element.content.element_utility}}

```typescript
interface ElementOptions<A> {
    attributes?: A
    textContent?: string
    htmlContent?: string
    childNodes?: Node[]
    ns?: 'http://www.w3.org/1999/xhtml' | 'http://www.w3.org/2000/svg'
}

type element = <A>(tagName: string, options?: ElementOptions<A>) => Element
```

{{t.pages.documentation.utilities.element.content.the_element_attribute_is_simply_a_function_that_allows_you_to_create_dom_elements_in_one_call}}

{{t.pages.documentation.utilities.element.content.normally_when_working_with_dom_elements_we_create_and_piece_them_together_after}}

```javascript
const button = document.createElement('button')
button.type = 'button'
button.textContent = 'click me'

button.addEventListener('click', () => {
    console.log('clicked')
})
```

{{t.pages.documentation.utilities.element.content.this_is_a_lot_of_steps_to_create_a_simple_button_here_is_the_same_thing_using_element}}

```javascript
const button = element('button', {
    textContent: 'click me',
    attributes: {
        type: 'button',
        onclick: () => {
            console.log('clicked')
        },
    },
})
```

{{t.pages.documentation.utilities.element.content.the_element_uses_addeventlistener_behind_the_scenes_and_handles_non_primitive_values_for_you_by}}

### {{t.pages.documentation.utilities.element.content.childnodes_and_htmlcontent}}

{{t.pages.documentation.utilities.element.content.the_childnodes_and_htmlcontent_options_allows_you_to_component_more_complex_elements_easily_depe}}

{{t.pages.documentation.utilities.element.content.here_is_a_example_using_the_childnodes_option}}

```javascript
element('ul', {
    attributes: { id: 'items-list' },
    childNodes: [
        element('li', {
            attributes: { class: 'list-item' },
            textContent: 'item 1',
        }),
        element('li', {
            attributes: { class: 'list-item' },
            textContent: 'item 2',
        }),
        element('li', {
            attributes: { class: 'list-item' },
            textContent: 'item 3',
        }),
    ],
})
```

{{t.pages.documentation.utilities.element.content.now_an_example_of_the_same_thing_using_the_htmlcontent_option}}

```javascript
element('ul', {
    attributes: { id: 'items-list' },
    htmlContent:
        '<li class="list-item">item 1</li>' +
        '<li class="list-item">item 2</li>' +
        '<li class="list-item">item 3</li>',
})
```

{{t.pages.documentation.utilities.element.content.the_main_difference_here_is_the_fact_the_using_childnodes_you_can_specify_function_and_property}}

### {{t.pages.documentation.utilities.element.content.web_components}}

{{t.pages.documentation.utilities.element.content.the_best_part_of_working_with_element_is_with_web_components_it_will_handle_all_non_primitive_pr}}

```javascript
const item = element('todo-item', {
    attributes: {
        data: {
            id: crypto.randomUUID(),
            name: 'buy groceries',
            status: 'pending',
            dateCreated: new Date(),
        },
    },
})
```

### {{t.pages.documentation.utilities.element.content.svg_elements}}

{{t.pages.documentation.utilities.element.content.to_create_svg_elements_you_can_specify_the_ns_option_with_the_value_of_http_www_w3_org_2000_svg}}

```javascript
const rect = element('rect', {
    ns: 'http://www.w3.org/2000/svg',
    attributes: {
        x: 10,
        y: 10,
        width: 100,
        height: 100,
    },
})
```
