import { html } from '../../src'
import { DocPageLayout } from '../partials/doc-page-layout'
import { Heading } from '../partials/heading'
import { PageComponentProps } from '../type'
import { CodeSnippet } from '../partials/code-snippet'

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
                Markup templates offer a convenient way to tap into its
                lifecycles, so you can perform setup and teardown actions.
            </p>
            ${Heading('onMount', 'h3')}
            <p>
                The <code>onMount</code> lifecycle allows you to react to when
                the template is rendered. This is triggered whenever the
                <code>render</code> and <code>replace</code>
                methods successfully render the nodes in the provided target.
            </p>
            ${CodeSnippet(
                'const temp = html`\n' +
                    '  <p>sample</p>\n' +
                    '`;\n' +
                    '\n' +
                    'temp.onMount(() => {\n' +
                    '  // handle mount\n' +
                    '})\n' +
                    '\n' +
                    'temp.render(document.body)',
                'typescript'
            )}
            <p>
                You can always check if the place the template was rendered is
                in the DOM by checking the <code>isConnected</code> on the
                <code>renderTarget</code>.
            </p>
            ${CodeSnippet('temp.renderTarget.isConnected;', 'typescript')}
            ${Heading('onUnmount', 'h3')}
            <p>
                The <code>onUnmount</code> lifecycle allows you to react to when
                the template is removed from the element it was rendered. This
                is triggered whenever the <code>unmount</code> method
                successfully unmounts the template.
            </p>
            ${CodeSnippet(
                'const temp = html`\n' +
                    '  <p>sample</p>\n' +
                    '`;\n' +
                    '\n' +
                    'temp.onUnmount(() => {\n' +
                    '  // handle unmount\n' +
                    '})\n' +
                    '\n' +
                    'temp.render(document.body)',
                'typescript'
            )}
            <p>
                You can call the <code>unmount</code> method directly in the
                code but Markup also tracks templates behind the scenes
                individually.
            </p>
            <p>
                Whenever templates are no longer needed, the
                <code>unmount</code> method is called to remove them. Thus, all
                the cleanup for the template is performed.
            </p>
            ${Heading('onUpdate', 'h3')}
            <p>
                The <code>onUpdate</code> lifecycle allows you to react to when
                an update is requested for the template. This can be by calling
                the <code>update</code> method or automatically is you are using
                <a href="./state-values">state</a>.
            </p>
            ${CodeSnippet(
                'const [count, setCount] = state(0);\n\n' +
                    'const temp = html`\n' +
                    '  <p>${count}</p>\n' +
                    '`;\n' +
                    '\n' +
                    'temp.onUpdate(() => {\n' +
                    '  // handle update\n' +
                    '})\n' +
                    '\n' +
                    'temp.render(document.body)',
                'typescript'
            )}
            ${Heading('Chainable methods', 'h3')}
            <p>
                Markup allows you to chain the following methods:
                <code>render</code>, <code>replace</code>, <code>onMount</code>,
                <code>onUnmount</code>, and <code>onUpdate</code>.
            </p>
            ${CodeSnippet(
                'html`<p>sample</p>`\n' +
                    ' .onMount(() => {\n' +
                    '   // handle mount\n' +
                    ' })\n' +
                    ' .onUnmount(() => {\n' +
                    '   // handle unmount\n' +
                    ' })\n' +
                    ' .onUpdate(() => {\n' +
                    '   // handle update\n' +
                    ' })\n' +
                    ' .render(document.body)',
                'typescript'
            )}
            <p>
                This makes it easy to handle things in a function where you need
                to return the template.
            </p>
            ${CodeSnippet(
                'const Button = ({content, type, disabled}) => {\n' +
                    '  \n' +
                    '  return html`\n' +
                    '    <button\n' +
                    '      type="${type}"\n' +
                    '      disabled="${disabled}"\n' +
                    '    >\n' +
                    '      ${content}\n' +
                    '    </button>\n' +
                    '  `\n' +
                    '     .onUpdate(() => {\n' +
                    '       // handle update\n' +
                    '     })\n' +
                    '}',
                'typescript'
            )}
        `,
    })
