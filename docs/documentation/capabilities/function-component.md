---
name: '{{t.pages.documentation.capabilities.function_component.meta.function_component}}'
order: 5.1
title: '{{t.pages.documentation.capabilities.function_component.meta.function_components_with_markup_javascript_template_factories}}'
description: '{{t.pages.documentation.capabilities.function_component.meta.learn_how_to_build_reusable_markup_components_as_plain_javascript_functions_that_return_html_tem}}'
layout: document
---

## {{t.pages.documentation.capabilities.function_component.content.function_component}}

{{t.pages.documentation.capabilities.function_component.content.markup_does_not_ship_with_a_dedicated_component_api_components_are_simply_functions_that_return}}

```javascript
const MyButton = () => {
    return html` <button type="button">click me</button> `
}
```

{{t.pages.documentation.capabilities.function_component.content.it_is_totally_up_to_you_what_these_functions_can_do_or_look_like_from_the_example_above_you_can}}

```javascript
MyButton().render(document.body)
```

### {{t.pages.documentation.capabilities.function_component.content.inputs_props}}

{{t.pages.documentation.capabilities.function_component.content.since_its_functions_you_can_take_arguments_and_inject_them_directly_into_the_template_with_prope}}

```javascript
const Button = ({ content = '', disabled = false, type = 'button' }) => {
    return html` <button type="${type}" disabled="${disabled}">
        ${content}
    </button>`
}
```

{{t.pages.documentation.capabilities.function_component.content.templates_can_take_raw_values_or_functions_that_returns_some_value_which_can_be_a_state_or_simpl}}

```typescript
enum MyButtonType {
    Button = 'button',
    Reset = 'reset',
    Submit = 'submit',
}

interface MyButtonProps {
    content: unknown
    disabled: boolean | StateGetter<boolean>
    type: MyButtonType | StateGetter<MyButtonType>
}
```

{{t.pages.documentation.capabilities.function_component.content.the_stategetter_allows_you_to_communicate_that_your_component_takes_function_values_as_input_whi}}

### {{t.common.content.lifecycles}}

{{t.pages.documentation.capabilities.function_component.content.you_can_take_advantage_of_both_effect_state_effect_md_and_html_lifecycles_templating_lifecycles}}

```javascript
const ChatMessages = () => {
    const [messages, updateMessages] = state([])

    onUpdate(() => {
        // todo: scroll to the bottom to show latest msg
    })

    const onMount = () => {
        const controller = new AbortController();
        const signal = controller.signal;

        fetch('...', { signal })
            .then((res) => {
                if(!res.ok) throw new Error(res.statusText)

                return res.json()
            })
            .then((res) => updateMessages(res.messages))
            .catch(console.error);

        // return a function to be called on unmount
        // where you can perform any clean ups
        return () => {
            controller.abort();
        }
    }

    return html`
        <ul>
            ${repeat(messages, msg => html`<li>${msg}</li>
        </ul>
    `)}
        .onMount(onMount)
        .onUpdate(onUpdate)
}
```

{{t.pages.documentation.capabilities.function_component.content.markup_template_has_powerful_lifecycles_and_because_a_function_is_called_once_and_with_power_of}}
