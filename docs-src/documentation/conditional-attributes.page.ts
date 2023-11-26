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
        nextPage,
        prevPage,
        docsMenu,
        content: html`
        ${Heading(page.name)}
        <p>
            You cannot use template literal value to define attributes directly on the
            tag.
        </p>
        ${CodeSnippet(
            'const disabledAttr = "disabled=\'\'";\n\n' +
                '// will not render the disabled attribute\n' +
                'html`<button ${disabledAttr}>click me</button>`;\n' +
                '// renders <button>click me</button>',
            'typescript'
        )}
        <p>
            This means that you need another way to dynamically render
            attributes and that way is the Markup <code>attr</code> attribute's name prefixer.
        </p>
        ${CodeSnippet(
            'const disabled = true;\n' +
                '\n' +
                'html`<button attr.disabled="${disabled}">click me</button>`;',
            'typescript'
        )}
        <p>
            In the above example the <code>disabled</code> attribute
            was prefixed with <code>attr.</code> then provided the condition(boolean) as
            value to whether include that attribute.
        </p>
        ${Heading('Boolean attributes', 'h3')}
        <p>
            <a
                href="https://developer.mozilla.org/en-US/docs/Glossary/Boolean/HTML"
                >Boolean attributes</a
            >
            are attributes that affect the element by
            simply being on the tag or whether they have value of
            <code>true</code> or <code>false</code>. HTML natively have these.
        </p>
        <p>
            The boolean attribute pattern is simple:
            <code>attr.NAME="CONDITION"</code>
        </p>
        ${CodeSnippet(
            'html`<input type="checkbox" attr.checked="true"/>`;',
            'typescript'
        )}
        <p>
            You may directly set the value as <code>true</code> or
            <code>false</code> string values or add a variable.
        </p>
        ${CodeSnippet(
            'const checked = false;\n\n' +
                'html`<input type="checkbox" attr.checked="${checked}"/>`;',
            'typescript'
        )}
        <p>The <code>attr</code> prefix understands this and will only add these attributes when the value is <code>truthy</code>.</p>
        ${Heading('The class attribute', 'h3')}
        <p>
            The class attribute has a special handle that allows you to
            dynamically set classes more elegantly.
        </p>
        <p>
                The class attribute pattern can be a key-value type
                <code>attr.class="CLASS_STRING | CONDITION"</code> or a specific class <code>attr.class.NAME="CONDITION"</code
        </p>
        ${CodeSnippet(
            'html`<button attr.class="disabled btn | true">click me</button>`;\n' +
                '// renders: <button class="disabled btn">click me</button>\n\n' +
                'const primary = true;\n' +
                'html`<button class="btn" attr.class.primary="${primary}">click me</button>\n`;' +
                '// renders: <button class="primary btn">click me</button>\n',
            'typescript'
        )}
        <div class="info">You need to use the <code>|</code> (pipe symbol) to separate the value from the condition.</div>
        ${Heading('The style attribute', 'h3')}
        <p>
            The style attribute also have a special handling that allows you to
            target specific CSS properties and set their values dynamically.
        </p>
        <p>
                The style attribute pattern can be a key-value type
                <code>attr.style="CSS_STRING | CONDITION"</code> or a specific style property <code>attr.style.CSS_PROPERTY="CSS_VALUE | CONDITION"</code
        </p>
        ${CodeSnippet(
            'html`<button attr.style="opacity: 0.5; | true">click me</button>`;\n' +
                '// renders: <button style="opacity: 0.5;">click me</button>\n\n' +
                'const primary = true;\n' +
                'html`<button attr.style.color="orange | ${primary}">click me</button>\n`;' +
                '// renders: <button style="color: orange">click me</button>\n',
            'typescript'
        )}
        ${Heading('The data attribute', 'h3')}
        <p>
            The data attribute is a special attribute in HTML and the
            <code>attr</code> simplifies it further.
        </p>
        <p>Data attributes follow the pattern: <code>attr-data-NAME="VALUE | CONDITION"</code> and
           can also be <code>attr-data-NAME="CONDITION"</code>  if value is same as the condition value.
           The template will evaluate if the value is truthy or falsy to decide
           whether the attribute should be set.</p>
        ${CodeSnippet(
            'const loading = true;\n\n' +
                'html`<button attr.data.loading="${loading}" attr.data.btn="true">click me</button>`',
            'typescript'
        )}
        ${Heading('Other attributes', 'h3')}
        <p>
            Everything else will fall into the category of a key-value attribute
            which is a collection of attributes that require specific values or
            work as "prop" for a tag to pass data or set configurations.
        </p>
        <p>All other attributes follow the pattern: <code>attr-NAME="VALUE | CONDITION"</code> or
            <code>attr-NAME="CONDITION"</code> if value is same as the condition value.
           The template will evaluate if the value is truthy or falsy to decide
           whether the attribute should be set.</p>
        ${CodeSnippet(
            'const label = "action button";\n\n' +
                '// will not render if label is an empty string\n' +
                'html`<button attr.aria-label="${label}">click me</button>`',
            'typescript'
        )}
    `,
    })
