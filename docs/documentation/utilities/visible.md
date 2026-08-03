---
name: '{{t.pages.documentation.utilities.visible.meta.visible}}'
order: 8.5
title: '{{t.pages.documentation.utilities.visible.meta.visible_utility_markup_by_before_semicolon}}'
description: '{{t.pages.documentation.utilities.visible.meta.use_the_markup_visible_utility_to_defer_rendering_until_content_enters_the_viewport_with_interse}}'
layout: document
---

## {{t.pages.documentation.utilities.visible.content.visible_utility}}

{{t.pages.documentation.utilities.visible.content.the_visible_utility_allows_you_to_defer_the_rendering_of_content_until_its_placeholder_element_e}}

{{t.pages.documentation.utilities.visible.content.this_is_incredibly_useful_for_improving_page_load_speed_and_memory_consumption_when_rendering_la}}

```javascript
import { html, visible } from '@beforesemicolon/markup'

html`
    <div class="card-grid">
        ${visible(
            () => html`<heavy-card></heavy-card>`,
            html`<div class="card-placeholder">Loading...</div>`
        )}
    </div>
`.render(document.body)
```

### {{t.pages.documentation.utilities.visible.content.options}}

{{t.pages.documentation.utilities.visible.content.the_third_argument_is_an_optional_options_object_which_supports_standard_intersectionobserver_op}}

-   {{t.pages.documentation.utilities.visible.content.eager_boolean_when_set_to_true_the_content_will_render_immediately_upon_mount_completely_bypassi}}
-   {{t.pages.documentation.utilities.visible.content.root_element_document_null_the_element_that_is_used_as_the_viewport_for_checking_visibility_of_t}}
-   {{t.pages.documentation.utilities.visible.content.rootmargin_string_margin_around_the_root}}
-   {{t.pages.documentation.utilities.visible.content.threshold_number_number_numeric_value_or_array_of_values_indicating_what_percentage_of_the_targe}}

```javascript
html`
    ${visible(
        () => html`<heavy-card></heavy-card>`,
        html`<div class="placeholder"></div>`,
        {
            eager: false,
            rootMargin: '600px 0px',
            threshold: 0,
        }
    )}
`
```

### {{t.pages.documentation.utilities.visible.content.observer_deduplication}}

{{t.pages.documentation.utilities.visible.content.to_ensure_maximum_performance_and_minimal_browser_overhead_the_visible_utility_maintains_a_modul}}

### {{t.pages.documentation.utilities.visible.content.automatic_cleanup}}

{{t.pages.documentation.utilities.visible.content.when_the_wrapping_template_is_unmounted_from_the_dom_the_visible_utility_automatically_unobserve}}
