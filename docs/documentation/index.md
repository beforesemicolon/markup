---
name: '{{t.pages.documentation.index.meta.what_is_markup}}'
order: 1
path: /documentation
title: '{{t.pages.documentation.index.meta.markup_documentation_reactive_html_templating_for_javascript}}'
description: '{{t.pages.documentation.index.meta.learn_what_markup_is_why_it_exists_and_how_it_uses_javascript_template_literals_functions_and_we}}'
layout: document
---

## {{t.pages.documentation.index.content.what_is_markup}}

{{t.pages.documentation.index.content.markup_is_a_javascript_reactive_templating_system_built_to_simplify_how_you_build_web_user_inter}}

{{t.pages.documentation.index.content.it_consists_of_3_main_apis_with_additional_utilities_to_simplify_things_even_further}}

-   {{t.pages.documentation.index.content.html_a_javascript_tagged_function_that_allows_you_to_represent_the_dom_using_template_literal_st}}
-   {{t.pages.documentation.index.content.state_a_simple_state_tracking_api_that_lets_you_define_reactive_data_however_you_want}}
-   {{t.pages.documentation.index.content.effect_a_straightforward_way_to_define_things_that_need_to_happen_when_certain_states_change}}

### {{t.pages.documentation.index.content.why_do_we_need_another_tool}}

{{t.pages.documentation.index.content.modern_web_development_has_become_heavily_reliant_on_complex_build_steps_compiler_configuration}}

{{t.pages.documentation.index.content.markup_exists_to_solve_this_pain_point_it_bridges_the_gap_between_raw_tedious_dom_manipulation_a}}

{{t.pages.documentation.index.content.compare_how_you_build_a_simple_counter}}

#### {{t.pages.documentation.index.content.the_tedious_vanilla_way}}

```javascript
let count = 0

// tedious DOM definition and manipulation
const p = document.createElement('p')
p.textContent = `count: ${count}`

const btn = document.createElement('button')
btn.type = 'button'
btn.textContent = 'count up'

// limiting event driven
btn.addEventListener('onclick', () => {
    count += 1
    p.textContent = `count: ${count}`

    if (count > 10) {
        alert('You counted passed 10!')
    }
})

document.body.append(p, btn)
```

#### {{t.pages.documentation.index.content.the_markup_way_simple_reactive}}

```javascript
// reactive data
const [count, updateCount] = state(0)

// data driven
effect(() => {
    if (count() > 10) {
        alert('You counted passed 10!')
    }
})

const countUp = () => {
    updateCount((prev) => prev + 1)
}

// reactive DOM/templates
html`
    <p>count: ${count}</p>
    <button type="button" onclick="${countUp}">count up</button>
`.render(document.body)
```

### {{t.pages.documentation.index.content.core_concepts}}

#### {{t.pages.documentation.index.content.text_1_functions_for_lazy_evaluation}}

{{t.pages.documentation.index.content.reactivity_in_markup_is_powered_by_native_javascript_functions_since_functions_represent_lazy_ev}}

#### {{t.pages.documentation.index.content.text_2_tagged_template_literals}}

{{t.pages.documentation.index.content.markup_uses_the_standard_html_tagged_template_literal_to_represent_the_dom_no_jsx_parser_no_prop}}

### {{t.pages.documentation.index.content.key_benefits}}

-   {{t.pages.documentation.index.content.zero_build_step_no_compilers_no_bundlers_no_npm_install_required_to_get_started_drop_the_cdn_lin}}
-   {{t.pages.documentation.index.content.surgical_dom_updates_no_virtual_dom_diffing_markup_target_updates_only_the_specific_nodes_and_at}}
-   {{t.pages.documentation.index.content.cdn_build_size_benefit}}
-   {{t.pages.documentation.index.content.standard_web_components_easily_integrates_with_web_components_to_provide_reactive_rendering_and}}
