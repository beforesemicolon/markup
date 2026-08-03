---
name: '{{t.pages.documentation.utilities.is_isnot.meta.is_isnot}}'
order: 8.5
title: '{{t.pages.documentation.utilities.is_isnot.meta.is_isnot_utility_markup_by_before_semicolon}}'
description: '{{t.pages.documentation.utilities.is_isnot.meta.use_the_markup_is_and_isnot_helpers_to_render_content_from_truthy_or_falsy_state_values_with_con}}'
layout: document
---

## {{t.pages.documentation.utilities.is_isnot.content.is_isnot_utilities}}

{{t.pages.documentation.utilities.is_isnot.content.the_is_and_isnot_are_one_of_the_simplest_utilities_that_allows_you_to_quickly_check_truthiness_a}}

```javascript
const [status, setStatus] = state('pending')

html`${when(is(status, 'pending'), html`<p>loading...</p>`, html`<p>done</p>`)}`
```

{{t.pages.documentation.utilities.is_isnot.content.both_the_is_and_isnot_take_two_arguments_a_state_or_some_data_and_a_value_or_a_checker_they_will}}

### {{t.pages.documentation.utilities.is_isnot.content.regexp}}

{{t.pages.documentation.utilities.is_isnot.content.you_can_also_use_is_and_isnot_with_regular_expressions_to_check_if_a_string_matches_a_pattern}}

```javascript
const [email, setEmail] = state('')

const isEmailValid = is(email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/)
const isEmailInvalid = isNot(email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/)
```

### {{t.pages.documentation.utilities.is_isnot.content.checker}}

{{t.pages.documentation.utilities.is_isnot.content.the_more_advance_way_to_use_the_is_and_isnot_utilities_is_by_providing_a_function_as_second_argu}}

{{t.pages.documentation.utilities.is_isnot.content.this_checker_allows_you_to_perform_custom_checks_instead_of_the_default_strict_equality}}

```javascript
const [count, setCount] = state(0)
const [status, setStatus] = state('loading')

const isGreaterThanTen = is(count, (n) => n > 10)
const isNotPending = isNot(status, (st) => st !== 'pending')
```

{{t.pages.documentation.utilities.is_isnot.content.when_they_consume_stategetter_as_first_argument_their_result_get_re_evaluated_with_every_change}}
