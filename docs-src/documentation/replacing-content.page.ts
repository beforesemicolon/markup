import { html } from '../../src'
import { DocPageLayout } from '../partials/doc-page-layout'
import { TemplatingGroup } from '../data/documents'
import { CodeSnippet } from '../partials/code-snippet'
import { Heading } from '../partials/heading'

const page = TemplatingGroup.list[2]

export default DocPageLayout(
    page.path,
    html`
        <h2>${page.name}</h2>
        <p>
            One special thing about templates is that you can treat it like a
            DOM element for few things. One of these things is the ability to
            replace one template with the another.
        </p>
        <p>
            Let's take for example an async scenario where you render a loading
            indicator then need to replace this loading indicator with content.
        </p>
        ${CodeSnippet(
            'const loadingIndicator = html`<p>loading...</p>`;\n' +
                '\n' +
                'const fetchContent = () => {\n' +
                '  setTimeout(() => {\n' +
                '    const content = html`<p>loaded content</p>`;\n' +
                '    \n' +
                '    content.replace(loadingIndicator)\n' +
                '  }, 2500)\n' +
                '}\n' +
                '\n' +
                'html`${loadingIndicator}`\n' +
                '  .render(document.body);\n' +
                '\n' +
                'fetchContent();',
            'typescript'
        )}
        <p>
            The above example will initially render the
            <code>loading</code> message and after 2.5 seconds it will replace
            it with the new template content.
        </p>
        <p>
            The replace method will insert the not yet rendered template nodes
            in the place in the DOM the target template was rendered. This means
            that you can have multiple tags and it will just replace them all.
        </p>
        ${Heading('Replacing a DOM Element', 'h3')}
        <p>
            You may also target a specific DOM Element. Here is the sample
            example but with the loading indicator as an Element instead of a
            template.
        </p>
        ${CodeSnippet(
            '// using a P Element instead\n' +
                "const loadingIndicator = document.createElement('p');\n" +
                "loadingIndicator.textContent = 'Loading...'\n" +
                '\n' +
                'const fetchContent = () => {\n' +
                '  setTimeout(() => {\n' +
                '    const content = html`<p>loaded content</p>`;\n' +
                '    \n' +
                '    content.replace(loadingIndicator)\n' +
                '  }, 2500)\n' +
                '}\n' +
                '\n' +
                'html`${loadingIndicator}`\n' +
                '  .render(document.body);\n' +
                '\n' +
                'fetchContent();',
            'typescript'
        )}
        <p>This will have the same effect as an element.</p>
    `
)
