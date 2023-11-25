import { html } from '../../src'
import { DocPageLayout } from '../partials/doc-page-layout'
import { Heading } from '../partials/heading'
import { CodeSnippet } from '../partials/code-snippet'
import { DocPrevNextNav } from '../partials/doc-prev-next-nav'
import { PageComponentProps } from '../type'

export default ({ page, nextPage, prevPage, docsMenu }: PageComponentProps) =>
    DocPageLayout(
        page.title,
        page.description,
        page.path,
        docsMenu,
        html`
            ${Heading(page.name, 'h2')}
            <p>
                A Markup template is simply a
                <a
                    href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals"
                    >JavaScript template literal</a
                >, which means you can inject any value anywhere in the
                template.
            </p>
            ${CodeSnippet(
                'const type = "button";\n' +
                    'const label = "click me";\n\n' +
                    'html`<button type="${type}">${label}</button>`;\n' +
                    '// renders <button type="button">click me</button>',
                'typescript'
            )}
            <p>
                You can place values anywhere before, after and inside tags as
                well as inside attribute value quotes. However, the template
                will ignore any value placed on the tag body.
            </p>
            ${CodeSnippet(
                'const type = "type=\'button\'";\n\n' +
                    '// will not render the type attribute\n' +
                    'html`<button ${type}>click me</button>`;\n' +
                    '// renders <button>click me</button>',
                'typescript'
            )}
            <p>
                This is because Markup parses the HTML string into nodes and
                will not allow dynamic tag or attribute names.
            </p>
            ${CodeSnippet(
                'const tag = "button";\n\n' +
                    'html`<${tag}>click me</${tag}>`;\n' +
                    '// renders &lt;button&gt;click me&lt;/button&gt;',
                'typescript'
            )}
            <p>
                If you need dynamic elements, you can create one using
                <a href="./element-util">element utility</a> and add it to the
                template.
            </p>
            ${Heading('Different values handling', 'h3')}
            <p>
                Markup templates handle certain values in a unique way so lets
                explore all possible value you might use.
            </p>
            ${Heading('Primitive JavaScript values', 'h4')}
            <p>
                Any primitive value will be kept as is in it string format.
                Primitives is the simplest values you can use and have no
                special handling by the template.
            </p>
            ${CodeSnippet('true => "true"\n' + '12 => "12"\n', 'vim')}
            ${Heading('Array', 'h4')}
            <p>
                <code>Array</code> has special handling by the template. When
                you provide an array to the template to render, as long as it is
                not inside an attribute value quotes, it will have each item
                rendered separately on the DOM.
            </p>
            ${CodeSnippet(
                'const arr = [1, 2, 3, 2]\n' +
                    '\n' +
                    'html`${arr}`;\n// renders: 1232',
                'typescript'
            )}
            <p>How each item in the array gets rendered depend on its type.</p>
            <p>
                This simple capability makes it pretty easy to render list of
                anything, including smaller template elements.
            </p>
            ${CodeSnippet(
                'const arr = [1, 2, 3, 2].map(n => html`<strong>item ${n}</strong>`)\n' +
                    '\n' +
                    'html`${arr}`',
                'typescript'
            )}
            <p>
                Markup will update each "sub-template" according to the data in
                the array changes. Depending on the data change, Markup will
                re-order, add or remove nodes matching the data in the array.
            </p>
            ${Heading('Non-Primitive JavaScript values', 'h4')}
            <p>
                With the exception of <code>Array</code>, every JavaScript
                object will be changed to its string equivalent. If the object
                contains a <code>toString</code> method the result of that will
                be displayed otherwise it falls back to default JavaScript
                handling:
            </p>
            ${CodeSnippet(
                '{} => [object Object]\n' +
                    'Map => [object Map]\n' +
                    'Set => [object Set]\n',
                'vim'
            )}
            ${Heading('Nesting templates', 'h4')}
            <p>
                Naturally, you can also place other
                <code>HTMLTemplate</code> instances inside your template which
                results in nested templates. It will be handled as expected and
                rendered just fine.
            </p>
            ${CodeSnippet(
                'const button = html`<button type="button">click me</button>`;\n' +
                    '\n' +
                    'let count = 0;\n' +
                    'const countUp = html`count: ${count} ${button}`;\n' +
                    '// renders:\n' +
                    '// count: 0 <button type="button">click me</button>',
                'typescript'
            )}
            <p>
                One important thing to know is that even if you nest template,
                each one is tracked separately.
            </p>
            <p>
                This means that if there is a change, only the template
                dependent on the change will get update which makes composing
                complex views really performant. This will make more sense once
                you start working with <a href="./state-values">state</a> and
                <a href="./dynamic-values-and-update">dynamic values</a>.
            </p>
            ${Heading('DOM Elements', 'h4')}
            <p>
                Any
                <a
                    href="https://developer.mozilla.org/en-US/docs/Web/API/Element"
                    >DOM element</a
                >
                placed in the template will be rendered normally.
            </p>
            ${CodeSnippet(
                "const button = document.createElement('button');\n" +
                    '\n' +
                    'button.textContent = "click me"\n' +
                    '\n' +
                    'let count = 0;\n' +
                    'const countUp = html`count: ${count} ${button}`;\n' +
                    '// renders:\n' +
                    '// count: 0 <button>click me</button>',
                'typescript'
            )}
            ${Heading('HTML string', 'h4')}
            <p>
                If you just want to render raw HTML string in the DOM so people
                can see the tags, simply add them.
            </p>
            ${CodeSnippet(
                "const htmlCode = '<span>HTML span tag</span>'\n" +
                    '\n' +
                    'html`${htmlCode}`',
                'typescript'
            )}
            <p>
                The above html code will not get parsed and will display as is
                as text.
            </p>
            <p>
                The only way to render HTML is to use the <code>html</code> to
                create <code>HTMLTemplates</code>. Everything else defaults to
                being just string.
            </p>
            <p>
                If you want to render an HTML string inside the template you can
                use
                <code>html</code> in a different way. Simply call it and provide
                an array of string values.
            </p>
            ${CodeSnippet(
                "const htmlCode = '<span>HTML span tag</span>'\n" +
                    '\n' +
                    'html`${html([htmlCode])}`',
                'typescript'
            )}
            <p>The above example will parse the HTML string into DOM Nodes.</p>
            <div class="warning">
                Please do NOT do this with HTML strings from untrusted sources
                like user input or third-party API call response. It can lead to
                <a
                    href="https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/11-Client-side_Testing/03-Testing_for_HTML_Injection"
                    >HTML Injection Attack</a
                >
                which is a security risk.
            </div>
            ${Heading('Nil values', 'h4')}
            <p>
                Any nil value (null or undefined) will be rendered as string.
                This means that you should change them to empty string if you
                dont want to render any nil value
            </p>
            ${CodeSnippet(
                'html`${null}` // renders "null"\n' +
                    'html`${undefined}` // renders "undefined"',
                'typescript'
            )}
            ${Heading('Functions', 'h3')}
            <p>
                Functions in the template also receive special treatment.
                Basically, there are two reasons to add functions to the
                template.
            </p>
            <ol>
                <li>
                    <a href="./event-handling">Event handlers</a>: To listen to
                    events on tags.
                </li>
                <li>
                    <a href="./dynamic-values-and-update">Dynamic values</a>: To
                    react to value changes anywhere in the DOM.
                </li>
            </ol>
            <p>Please explore those two topics to understand more.</p>
            ${Heading('Web Components', 'h3')}
            <p>
                Template values are handled differently when used with web
                component attributes.
            </p>
            <p>
                If you use
                <a
                    href="https://developer.mozilla.org/en-US/docs/Web/API/Web_components"
                    >Web Components</a
                >
                tag in your template the <em>Markup</em> will automatically
                detect it and try to pass the values directly to the component
                as is in case the component itself has a property or setter for
                that value.
            </p>
            <p>
                Let's take for example the following <code>TodoItem</code> web
                component:
            </p>
            ${CodeSnippet(
                'class TodoItem extends HTMLElement {\n' +
                    '  static observedAttributes = ["todo"];\n' +
                    '  todo: Todo = null; // will be updated by the template\n' +
                    '}\n\n' +
                    "customElements.define('todo-item', TodoItem)",
                'typescript'
            )}
            <p>
                When you try to pass data as props to a web component, the data
                will be passes as is directly to the property of the component
                and the attribute value will be JSON stringified.
            </p>
            ${CodeSnippet(
                'const todo = {name: "go to gym"};\n\n' +
                    'html`<todo-item todo="${todo}"/>`\n' +
                    '// renders: \n' +
                    '// <todo-item todo="{&quot;name&quot;:&quot;go to gym&quot;}"></todo-item>',
                'typescript'
            )}
            <p>
                This is what makes this library perfect to work with web
                components as it enhances the developer experience and makes
                native web component much more appealing.
                <a href="./web-components"
                    >learn more about working with Web Components</a
                >
            </p>
            ${DocPrevNextNav({
                prev: prevPage,
                next: nextPage,
            })}
        `
    )
