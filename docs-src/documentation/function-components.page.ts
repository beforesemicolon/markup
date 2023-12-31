import { html } from '../../src'
import { DocPageLayout } from '../partials/doc-page-layout'
import { Heading } from '../partials/heading'
import { CodeSnippet } from '../partials/code-snippet'
import { PageComponentProps } from '../type'

export default ({
    name,
    page,
    nextPage,
    prevPage,
    docsMenu,
}: PageComponentProps) =>
    DocPageLayout({
        name,
        page,
        prevPage,
        nextPage,
        docsMenu,
        content: html`
            ${Heading(page.name)}
            <p>
                The concept of component is not native to this library. However,
                because it is powerful, you can mimic the component pattern.
                This is all due to how the functions are treated in the
                template.
            </p>
            <p>
                Let's define a component as a function that returns something to
                be rendered and might or might not take an input to help with
                what needs to be rendered.
            </p>
            <p>
                With that definition, we can create a simple component like so:
            </p>
            ${CodeSnippet(
                'const Button = ({\n' +
                    '  content = "", \n' +
                    '  disabled = false, \n' +
                    '  type = "button"\n' +
                    '}) => {\n' +
                    '  return html`\n' +
                    '    <button \n' +
                    '      type="${type}"\n' +
                    '      disabled="${disabled}"\n' +
                    '      >\n' +
                    '      ${content}\n' +
                    '    </button>`;\n' +
                    '}',
                'typescript'
            )}
            <p>
                To use it, simply call it as a function. This can happen
                directly in the template or outside in a variable:
            </p>
            ${CodeSnippet(
                "html`${Button({content: 'click me'})}`",
                'typescript'
            )}
            <p>
                Because you have a function, you can put all the logic related
                to the component inside. This pattern allows you to reuse
                template anywhere with flexibility the inputs give you.
            </p>
            <p>
                In addition, you can consider passing state around as props.
                This will allow you to affect the template directly when there
                is a change.
            </p>
            ${CodeSnippet(
                'const TextInput = ({value = "", onChange} = "") => {\n' +
                    '  return html`\n' +
                    '    <input \n' +
                    '      type="text" \n' +
                    '      value="${value}" \n' +
                    '      onchange="${e => onChange?.(e.target.value)}"\n' +
                    '      />\n' +
                    '  `\n' +
                    '}\n' +
                    '\n' +
                    'const [name, updateName] = state("")\n' +
                    '\n' +
                    'html`${TextInput({value: name, onChange: updateName})}`',
                'typescript'
            )}
        `,
    })
