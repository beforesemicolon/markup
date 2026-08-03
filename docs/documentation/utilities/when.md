---
name: '{{t.pages.documentation.utilities.when.meta.when}}'
order: 8.3
title: '{{t.pages.documentation.utilities.when.meta.when_utility_markup_by_before_semicolon}}'
description: '{{t.pages.documentation.utilities.when.meta.use_the_markup_when_helper_for_conditional_rendering_with_state_getters_fallback_templates_lazy}}'
layout: document
---

## {{t.pages.documentation.utilities.when.content.when_utility}}

{{t.pages.documentation.utilities.when.content.the_when_helper_is_markup_out_of_the_box_utility_to_do_conditional_rendering_in_or_outside_templ}}

{{t.pages.documentation.utilities.when.content.it_mimics_an_if_and_else_statement_with_the_else_being_conditional}}

```javascript
const visible = true

html` <p>${when(visible, `visible`, `hidden`)}</p> `
```

### {{t.pages.documentation.utilities.when.content.condition}}

{{t.pages.documentation.utilities.when.content.the_condition_is_the_first_argument_and_it_can_be_a_static_value_or_a_function_for_something_tha}}

```javascript
const [visible, updateVisible] = state(true)

html` ${when(visible, html`<p>visible</p>`, html`<p>hidden</p>`)} `
```

{{t.pages.documentation.utilities.when.content.the_when_helper_will_re_evaluate_whenever_the_condition_changes_for_an_accurate_render}}

### {{t.pages.documentation.utilities.when.content.then_else}}

{{t.pages.documentation.utilities.when.content.the_second_argument_is_required_and_represent_the_then_value_while_the_third_argument_is_optiona}}

```javascript
const [visible, updateVisible] = state(true)

html`${when(visible, html`<p>visible</p>`)}`
```
