---
name: '{{t.pages.documentation.templating.values.meta.values}}'
order: 6.2
title: '{{t.pages.documentation.templating.values.meta.template_values_markup_by_before_semicolon}}'
description: '{{t.pages.documentation.templating.values.meta.understand_how_markup_renders_template_values_including_strings_numbers_dom_nodes_arrays_functio}}'
layout: document
---

## {{t.pages.documentation.templating.values.content.values}}

{{t.pages.documentation.templating.values.content.if_you_ever_worked_with_javascript_template_literals_https_developer_mozilla_org_en_us_docs_web}}

### {{t.pages.documentation.templating.values.content.parsing}}

{{t.pages.documentation.templating.values.content.before_we_jump_into_specific_values_lets_talk_about_how_markup_parses_the_html_string_in_the_tem}}

{{t.pages.documentation.templating.values.content.just_because_you_can_inject_values_anywhere_in_the_string_does_not_mean_it_will_be_parsed_the_wa}}

{{t.pages.documentation.templating.values.content.this_means_you_can_only_inject_values_around_tags_openings_or_as_attribute_value_for_example_inj}}

```javascript
const tag = 'p'

const temp = html`<${tag}>hello world</${tag}>`.render(document.body)

temp.render(document.getElementById('app'))
// renders <p>hello world</p> as string
```

{{t.pages.documentation.templating.values.content.the_above_will_simply_result_in_hello_world_string_and_not_the_paragraph_element_with_hello_worl}}

{{t.pages.documentation.templating.values.content.similarly_you_cannot_have_a_string_representation_of_attribute_key_value_and_inject_it_in_the_bo}}

```javascript
const attrs = 'id="sample"'

const temp = html`<p ${attrs}>hello world</p>`.render(document.body)

temp.render(document.getElementById('app'))
// throws: Invalid attribute object provided: id="sample"
```

{{t.pages.documentation.templating.values.content.there_is_a_way_to_inject_attribute_objects_you_can_learn_about_by_reading_the_attributes_html_at}}

{{t.pages.documentation.templating.values.content.to_conclude_write_html_as_you_know_and_inject_value_where_you_would_write_values_in_html_those_a}}

```javascript
const label = 'click me'
const type = 'button'

html`<button type="${type}">${label}</button>`
```

### {{t.pages.documentation.templating.values.content.node}}

{{t.pages.documentation.templating.values.content.markup_templates_work_seamlessly_with_dom_nodes_and_this_ability_is_what_allows_you_to_migrate_a}}

{{t.pages.documentation.templating.values.content.you_can_inject_any_node_directly_in_the_template_and_they_will_be_rendered_as_so}}

```javascript
const button = document.createElement('button')
button.textContent = 'click me'
button.type = 'button'

html`${button}`.render(document.body)
```

{{t.pages.documentation.templating.values.content.if_you_want_a_better_and_quicker_way_to_create_htmlelement_we_suggest_taking_a_look_at_the_eleme}}

### {{t.pages.documentation.templating.values.content.htmltemplate}}

{{t.pages.documentation.templating.values.content.the_best_thing_about_markup_templates_is_the_ability_to_nest_them_to_compose_more_complex_views}}

```javascript
const fieldLabel = html`<span>Enter name</span>`
const field = html`<input type="text" placeholder="name" />`

html` <label aria-label="name field"> ${fieldLabel} ${field} </label> `.render(
    document.body
)
```

{{t.pages.documentation.templating.values.content.this_capability_resembles_the_native_dom_node_instead_the_difference_is_instead_of_tracking_indi}}

### {{t.pages.documentation.templating.values.content.arrays}}

{{t.pages.documentation.templating.values.content.injecting_arrays_in_templates_is_a_powerful_way_to_quickly_render_a_collection_of_things_quickly}}

```javascript
const fruits = ['apple', 'banana', 'orange', 'peach']

html`Fruits: ${fruits}`.render(document.body)
// Fruits: applebananaorangepeach
```

{{t.pages.documentation.templating.values.content.the_list_is_rendered_without_space_or_commas_you_can_also_collect_a_list_of_templates_to_render}}

```javascript
const fruits = [
    html`<li>apple</li>`,
    html`<li>banana</li>`,
    html`<li>orange</li>`,
    html`<li>peach</li>`,
]

html`Fruits:
    <ul>
        ${fruits}
    </ul> `.render(document.body)
// Fruits: <ul><li>apple</li><li>banana</li><li>orange</li><li>peach</li></ul>
```

{{t.pages.documentation.templating.values.content.this_parsing_only_happens_up_to_one_level_though_if_what_you_wish_to_render_is_one_level_deeper}}

```javascript
const fruits = [
    [
        html`<li>apple</li>`,
        html`<li>banana</li>`,
        html`<li>orange</li>`,
        html`<li>peach</li>`,
    ],
]

html`Fruits:
    <ul>
        ${fruits}
    </ul> `.render(document.body)

// Fruits: <ul>&lt;li&gt;apple&lt;/li&gt;,&lt;li&gt;banana&lt;/li&gt;,&lt;li&gt;orange&lt;/li&gt;,&lt;li&gt;peach&lt;/li&gt;</ul>
```

### {{t.pages.documentation.templating.values.content.functions}}

{{t.pages.documentation.templating.values.content.functions_are_first_class_citizens_in_markup_it_is_used_for_reactivity_and_lazy_evaluations_and}}

{{t.pages.documentation.templating.values.content.every_function_injected_in_the_template_is_called_and_its_value_is_rendered_and_tracked_accordin}}

```javascript
const greeting = () => 'Hello World'

html`<p>${greeting}</p>`.render(document.body)
// <p>Hello World</p>
```

{{t.pages.documentation.templating.values.content.when_you_learn_about_state_state_index_md_and_effect_state_effect_md_you_will_notice_that_its_al}}

```javascript
const [count, setCount] = state(1)

const evenOddCount = () => (count() % 2 === 0 ? 'Even' : 'Odd')

html`
    <p>${evenOddCount}</p>
    <button type="button" onclick="${() => setCount((prev) => prev + 1)}">
        +
    </button>
`.render(document.body)
```

{{t.pages.documentation.templating.values.content.markup_understands_that_functions_may_contain_states_that_change_and_will_evaluate_them_whenever}}

### {{t.pages.documentation.templating.values.content.primitives}}

{{t.pages.documentation.templating.values.content.when_you_inject_primitive_value_they_will_all_be_rendered_as_their_string_version}}

```javascript
html`
    ${0} ${true} ${false} ${34n} ${'sample'} ${undefined} ${null}
    ${Symbol('sample')}
`.render(document.body)
// 0 true false 34 sample undefined null Symbol(sample)
```

{{t.pages.documentation.templating.values.content.you_need_to_be_specifically_careful_with_nil_values_like_undefined_and_null_resulting_of_accessi}}

### {{t.pages.documentation.templating.values.content.non_primitives}}

{{t.pages.documentation.templating.values.content.array_functions_nodes_and_htmltemplate_are_the_only_non_primitive_values_that_do_not_receive_a_s}}

```javascript
html`${{}} ${new Object()} ${new Map()} ${new Set()} ${new Date()}`.render(
    document.body
)
// [object Object]
// [object Object]
// [object Map]
// [object Set]
// Wed Oct 16 2024 18:55:38 GMT-0400 (Eastern Daylight Time)
```
