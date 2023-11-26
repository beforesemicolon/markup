import { html } from '../../src'
import { DocPageLayout } from '../partials/doc-page-layout'
import { Heading } from '../partials/heading'
import { CodeSnippet } from '../partials/code-snippet'
import { PageComponentProps } from '../type'

export default ({ page, nextPage, prevPage, docsMenu }: PageComponentProps) =>
    DocPageLayout({
        page,
        prevPage,
        nextPage,
        docsMenu,
        content: html`
        ${Heading(page.name)}
        <p>
            The <code>element</code> utility exists solely to help you create DOM elements easily.
        </p>
        <p>It takes two arguments and only the first one is required.</p>
        <p>
            <code>element(TAG_NAME, OPTIONS)</code>
        </p>
        <ul>
            <li>
                <strong>TAG_NAME</strong>: The name of the tag you want to create.
                It can be native tag names or custom web components.
            </li>
            <li>
                <strong>OPTIONS</strong> (optional):
                <ul>
                  <li><strong>attributes</strong>: an object keyed by attribute name and value can be any valid value. It also supports inline event listeners.</li>
                  <li><strong>htmlContent</strong>: an HTML string to be parsed as content.</li>
                  <li><strong>textContent</strong>: a text to be used as plain text content.</li>
                  <li><strong>ns</strong>: the <a href="https://developer.mozilla.org/en-US/docs/Web/API/Element/namespaceURI">namespace URI</a> of the element.</li>
                </ul>
            </li>
        </ul>
        ${Heading('Why use this', 'h3')}
        <p>Creating DOM element the native way is a multiline experience, especially with events or if you
        want to handle web components.</p>
        ${CodeSnippet(
            "const button = document.createElement('button');\n" +
                '\n' +
                'button.type = "button";\n' +
                'button.disabled = true;\n' +
                'button.textContent = "click me";\n' +
                'button.onclick = () => {\n' +
                '  // handle click\n' +
                '}',
            'typescript'
        )}
        <p>With <code>element</code> it looks like this:</p>
        ${CodeSnippet(
            "const button = element('button', {\n" +
                "  textContent: 'click me',\n" +
                '  attributes: {\n' +
                "    type: 'button',\n" +
                '    disabled: true,\n' +
                '    onclick: () => {\n' +
                '      // handle click\n' +
                '    }\n' +
                '  }\n' +
                '})',
            'typescript'
        )}
        <p>Doing it all in one call is not the only reason. There are other advantages:</p>
        <ul>
          <li><strong>Event listener</strong>: It will convert inline event handlers to
            <a href="https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener">event listeners</a> for you.
            Which means the event attribute will not be placed on the element.</li>
          <li><strong>Web component properties</strong>: If you create a web component instance that maps attributes
          to internal setters it will automatically provide them as properties as well.</li
        </ul>
    `,
    })
