---
name: '{{t.pages.documentation.templating.index.meta.create_render}}'
order: 6
title: '{{t.pages.documentation.templating.index.meta.markup_templating_create_render_replace_and_nest_templates}}'
description: '{{t.pages.documentation.templating.index.meta.learn_how_the_markup_html_tagged_template_creates_templates_renders_dom_replaces_content_nests_t}}'
layout: document
---

## {{t.pages.documentation.templating.index.content.templating}}

{{t.pages.documentation.templating.index.content.markup_uses_tagged_template_literals_https_developer_mozilla_org_en_us_docs_web_javascript_refer}}

```javascript
const temp = html`<h1>Hello World</h1>`
```

{{t.pages.documentation.templating.index.content.the_html_returns_an_htmltemplate_instance_containing_methods_and_properties_you_can_use_to_acces}}

### {{t.pages.documentation.templating.index.content.rendering}}

{{t.pages.documentation.templating.index.content.there_are_few_ways_to_render_a_template_after_you_define_it}}

-   {{t.pages.documentation.templating.index.content.render_takes_a_htmlelement_to_append_the_template_to}}
-   {{t.pages.documentation.templating.index.content.replace_takes_any_node_or_another_htmltemplate_instance_to_replace_in_the_dom}}
-   {{t.pages.documentation.templating.index.content.insertafter_takes_any_node_or_another_htmltemplate_instance_to_insert_the_template_after}}

#### {{t.pages.documentation.templating.index.content.render}}

{{t.pages.documentation.templating.index.content.the_render_method_will_take_either_a_shadowroot_htmlelement_or_documentfragment_to_append_the_co}}

```javascript
temp.render(document.body)
```

{{t.pages.documentation.templating.index.content.the_parsing_of_the_template_happens_at_render_time_and_will_only_happen_once_this_is_also_true_f}}

{{t.pages.documentation.templating.index.content.calling_the_render_method_with_same_target_repeatedly_will_only_work_once_you_can_call_it_with_a}}

```javascript
temp.render(document.body) // will parse and append to document.body
temp.render(document.body) // will be ignored
temp.render(document.body) // will be ignored
temp.render(document.getElementById('app')) // will move content to #app
```

#### {{t.pages.documentation.templating.index.content.replace}}

{{t.pages.documentation.templating.index.content.the_replace_method_takes_any_htmltemplate_or_node_https_developer_mozilla_org_en_us_docs_web_api}}

```javascript
temp.replace(document.getElementById('app'))
```

{{t.pages.documentation.templating.index.content.similar_to_render_method_it_will_only_parse_content_once}}

```javascript
const loading = html`<p>loading...</p>`

html`${loading}`.render(document.body)

doSomethingAsync().then(() => {
    const done = html`<p>Done</p>`

    done.replace(loading)
})
```

{{t.pages.documentation.templating.index.content.the_replace_method_is_powerful_especially_when_working_with_asynchronous_rendering_you_can_rende}}

#### {{t.pages.documentation.templating.index.content.insertafter}}

{{t.pages.documentation.templating.index.content.the_insertafter_method_works_exactly_like_the_render_method_the_only_difference_is_that_it_adds}}

```javascript
temp.insertAfter(document.getElementById('app'))
```

{{t.pages.documentation.templating.index.content.another_difference_is_that_it_can_also_take_a_htmltemplate_instance_as_target_allowing_to_render}}

```typescript
const items = [
    html`<li>Buy groceries</li>`,
    html`<li>Go to gym</li>`,
    html`<li>Write a blog</li>`,
]

html`<ul>
    ${items}
</ul>`.render(document.body)

html`<li>Read a book</li>`.insertAfter(items[1])
```

#### {{t.pages.documentation.templating.index.content.parentnode}}

{{t.pages.documentation.templating.index.content.the_parentnode_property_will_tell_you_where_the_template_was_rendered_it_will_return_the_element}}

#### {{t.pages.documentation.templating.index.content.mounted}}

{{t.pages.documentation.templating.index.content.after_you_render_your_template_you_can_use_the_mounted_property_to_check_if_your_template_was_ad}}

{{t.pages.documentation.templating.index.content.the_mounted_property_will_not_tell_you_if_the_template_is_actually_attached_to_a_document_for_th}}

```javascript
const temp1 = html`one`.render(document.createDocumentFragment())
const temp2 = html`two`.render(document.body)

console.log(
    temp1.mounted, // true
    temp1.parentNode?.isConnected // false
)

console.log(
    temp2.mounted, // true
    temp2.parentNode?.isConnected // true
)
```

#### {{t.pages.documentation.templating.index.content.childnodes}}

{{t.pages.documentation.templating.index.content.the_childnodes_will_give_you_an_array_of_top_level_nodes_rendered_by_the_template}}

```javascript
const temp = html`
    Loose text
    <p>a paragraph</p>
    <button>click me</button>
    ending
`.render(document.body)

console.log(temp.childNodes) // [text, p, text, button, text]
```

#### {{t.pages.documentation.templating.index.content.unmount}}

{{t.pages.documentation.templating.index.content.to_remove_your_template_from_the_target_you_can_use_the_unmount_method}}

```javascript
temp.unmount()
```

{{t.pages.documentation.templating.index.content.the_unmount_should_be_the_only_way_you_go_about_removing_the_template_from_the_dom_this_is_becau}}

{{t.pages.documentation.templating.index.content.directly_manipulating_the_dom_may_have_undesired_results}}

#### {{t.pages.documentation.templating.index.content.tostring}}

{{t.pages.documentation.templating.index.content.conveniently_you_can_get_a_string_representation_of_your_template_in_its_current_rendered_state}}

```javascript
const temp = html`
    Loose text
    <p>a paragraph</p>
    <button>click me</button>
    ending
`.render(document.body)

console.log(temp.toString())
/* 
Loose text
<p>a paragraph</p>
<button> click me</button>
ending
 */
```

#### {{t.pages.documentation.templating.index.content.livecycles}}

{{t.pages.documentation.templating.index.content.there_are_additional_methods_available_for_lifecycle_purpose_you_can_learn_more_by_checking_the}}
