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
                Native
                <a
                    href="https://developer.mozilla.org/en-US/docs/Web/API/Web_components"
                    >Web Components</a
                >
                are powerful but the API is a bit complex to scale. The good
                news is that this library can enhance and simplify that
                experience in a way the API is approachable.
            </p>
            <p>
                Below is an example of a simple input field web component with
                only two props and small template.
            </p>
            ${CodeSnippet(
                'class TextField extends HTMLElement {\n' +
                    '  static observedAttributes = ["value", "disabled"];\n' +
                    '  value = "";\n' +
                    '  disabled = false;\n' +
                    '  \n' +
                    '  connectedCallback() {\n' +
                    '    this.innerHTML = `<input type="text"/>`;\n' +
                    '    \n' +
                    '    this.updateField()\n' +
                    '  }\n' +
                    '  \n' +
                    '  attributeChangedCallback(name, oldValue, newValue) {\n' +
                    '    // parse the new value\n' +
                    '    try {\n' +
                    '      this[name] = JSON.parse(newValue)\n' +
                    '      this.updateField();\n' +
                    '    } catch(e) {\n' +
                    '      console.warn(`invalid "${name}" value`, newValue)\n' +
                    '    }\n' +
                    '  }\n' +
                    '  \n' +
                    '  updateField() {\n' +
                    "    const input = this.querySelector('input');\n" +
                    '    \n' +
                    '    input.value = this.value;\n' +
                    '    input.disabled = this.disabled;\n' +
                    '  }\n' +
                    '}\n' +
                    '\n' +
                    'customElements.define("text-field", TextField)',
                'typescript'
            )}
            <p>
                You can see that it is a little complex for a simple input field
                component. Now imagine if we had a component with more props and
                with complex values as well as a more elaborated template.
            </p>
            <p>
                We can simplify it a little by introducing this library
                capabilities so no need for DOM manipulations and tracking is
                needed.
            </p>
            ${CodeSnippet(
                'class TextField extends HTMLElement {\n' +
                    '  static observedAttributes = ["value", "disabled"];\n' +
                    '  value = "";\n' +
                    '  disabled = false;\n' +
                    '  template = html`\n' +
                    '    <input \n' +
                    '      type="text" \n' +
                    '      value="${() => this.value}"\n' +
                    '      attr.disabled="${() => this.disabled}"\n' +
                    '      />\n' +
                    '  `\n' +
                    '  \n' +
                    '  connectedCallback() {\n' +
                    '    this.template.render(this); // render template\n' +
                    '  }\n' +
                    '  \n' +
                    '  attributeChangedCallback(name, oldValue, newValue) {\n' +
                    '    // parse the new value\n' +
                    '    try {\n' +
                    '      this[name] = JSON.parse(newValue)\n' +
                    '      this.template.update(); // update template\n' +
                    '    } catch(e) {\n' +
                    '      console.warn(`invalid "${name}" value`, newValue)\n' +
                    '    }\n' +
                    '  }\n' +
                    '}\n' +
                    '\n' +
                    'customElements.define("text-field", TextField)',
                'typescript'
            )}
        `,
    })
