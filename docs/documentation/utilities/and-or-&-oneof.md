---
name: '{{t.pages.documentation.utilities.and_or_oneof.meta.oneof_and_or}}'
order: 8.6
title: '{{t.pages.documentation.utilities.and_or_oneof.meta.oneof_and_or_utility_markup_by_before_semicolon}}'
description: '{{t.pages.documentation.utilities.and_or_oneof.meta.use_the_markup_and_or_and_oneof_helpers_to_combine_reactive_boolean_conditions_and_render_templa}}'
layout: document
---

## {{t.pages.documentation.utilities.and_or_oneof.content.oneof_and_or_utilities}}

{{t.pages.documentation.utilities.and_or_oneof.content.markup_comes_with_additional_utilities_that_work_as_operators_and_allows_you_to_check_a_value_fr}}

### {{t.pages.documentation.utilities.and_or_oneof.content.oneof}}

{{t.pages.documentation.utilities.and_or_oneof.content.the_oneof_works_like_the_is_and_isnot_is_isnot_md_utilities_but_instead_of_checking_a_one_value}}

```javascript
const [status, setStatus] = state('pending')

html`${when(
    oneOf(status, ['pending', 'idle']),
    html`<p>loading...</p>`,
    html`<p>done</p>`
)}`
```

{{t.pages.documentation.utilities.and_or_oneof.content.it_takes_the_value_state_you_want_to_check_and_an_array_of_values_to_check_against_the_utility_s}}

### {{t.pages.documentation.utilities.and_or_oneof.content.and}}

{{t.pages.documentation.utilities.and_or_oneof.content.the_and_utility_works_like_the_logical_and_https_developer_mozilla_org_en_us_docs_web_javascript}}

```javascript
html`${when(
    and(loadingTodos, noTodos),
    html`<p>loading...</p>`,
    html`<p>done</p>`
)}`
```

{{t.pages.documentation.utilities.and_or_oneof.content.you_can_list_any_amount_of_values_for_the_check}}

{{t.pages.documentation.utilities.and_or_oneof.content.and_value1_value2_valuen}}

### {{t.pages.documentation.utilities.and_or_oneof.content.or}}

{{t.pages.documentation.utilities.and_or_oneof.content.the_or_utility_works_like_the_logical_or_https_developer_mozilla_org_en_us_docs_web_javascript_r}}

```javascript
html`${when(
    or(loadingTodos, noTodos),
    html`<p>loading...</p>`,
    html`<p>done</p>`
)}`
```

{{t.pages.documentation.utilities.and_or_oneof.content.you_can_list_any_amount_of_values_for_the_check}}

{{t.pages.documentation.utilities.and_or_oneof.content.or_value1_value2_valuen}}
