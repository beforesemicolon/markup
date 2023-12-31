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
		        Markup does not allow you to use template literal value to define attributes directly on the
		        tag.
	        </p>
	        ${CodeSnippet(
                'const disabledAttr = "disabled=\'\'";\n\n' +
                    '// will not render the disabled attribute\n' +
                    'html`<button ${disabledAttr}>click me</button>`;\n' +
                    '// renders <button>click me</button>',
                'typescript'
            )}
          <p>There is a different way to go about conditionally set attributes.</p>
	        ${Heading('Boolean attributes', 'h3')}
          <p>
           By default, Markup handles all boolean attributes based on value.
          </p>
          ${CodeSnippet(
              'const disabled = true;\n' +
                  '\n' +
                  'html`<button disabled="${disabled}">click me</button>`;',
              'typescript'
          )}
          <p><a
            href="https://developer.mozilla.org/en-US/docs/Glossary/Boolean/HTML"
          >Boolean attributes</a
          > values in native HTML does not matter in whether the attribute
             should have an effect or be included. In Markup, if you set boolean attribute values
            to <code>FALSY</code> it will not be included.</p>
	        <p>
		        The boolean attribute pattern is simply: <code>NAME="CONDITION"</code>.
	        </p>
	        ${CodeSnippet(
                'html`<input type="checkbox" checked="true"/>`;',
                'typescript'
            )}
	        <p>
		        You may directly set the value as <code>true</code> or
		        <code>false</code> string or inject a variable.
	        </p>
	        ${CodeSnippet(
                'const checked = false;\n\n' +
                    'html`<input type="checkbox" checked="${checked}"/>`;',
                'typescript'
            )}
	        ${Heading('The class attribute', 'h3')}
	        <p>
		        The class attribute has a special handle that allows you to
		        dynamically target single classes to be conditionally set.
	        </p>
	        <p>
		        The class attribute pattern can be a key-value type
		        <code>class="CLASS_STRING | CONDITION"</code> or a specific class
		        <code>class.NAME="CONDITION"</code>.
	        </p>
	        ${CodeSnippet(
                'html`<button class="disabled btn | true">click me</button>`;\n' +
                    '// renders: <button class="disabled btn">click me</button>\n\n' +
                    'const primary = true;\n' +
                    'html`<button class="btn" class.primary="${primary}">click me</button>\n`;' +
                    '// renders: <button class="primary btn">click me</button>\n',
                'typescript'
            )}
	        <div class="info">You need to use the <code>|</code> (pipe) to separate the value from the condition.
	        </div>
	        ${Heading('The style attribute', 'h3')}
	        <p>
		        The style attribute also have a special handling that allows you to
		        target specific CSS properties and set their values dynamically.
	        </p>
	        <p>
		        The style attribute pattern can be a key-value type
		        <code>style="CSS_STRING | CONDITION"</code> or a specific style property <code>style.CSS_PROPERTY="CSS_VALUE
		                                                                                       | CONDITION"</code
	        </p>
	        ${CodeSnippet(
                'html`<button style="opacity: 0.5; | true">click me</button>`;\n' +
                    '// renders: <button style="opacity: 0.5;">click me</button>\n\n' +
                    'const primary = true;\n' +
                    'html`<button style.color="orange | ${primary}">click me</button>\n`;' +
                    '// renders: <button style="color: orange">click me</button>\n',
                'typescript'
            )}
	        ${Heading('The data attribute', 'h3')}
	        <p>Data attributes follow the pattern: <code>data.NAME="VALUE | CONDITION"</code> and
	           can also be <code>data.NAME="CONDITION"</code> if value is same as the condition value.
	           The template will evaluate if the value is truthy or falsy to decide
	           whether the attribute should be set.</p>
	        ${CodeSnippet(
                'const loading = true;\n\n' +
                    'html`<button data.loading="${loading}" data.btn="true">click me</button>`',
                'typescript'
            )}
	        ${Heading('Other attributes', 'h3')}
          <p>For any other attribute you will need to either prefix the attribute with <code>attr.</code> or <code>|</code>(pipe) the value to a condition.</p>
	        <p>These follow the pattern: <code>NAME="VALUE | CONDITION"</code> or <code>attr.NAME="VALUE_SAME_AS_CONDITION"</code>.
	           The template will evaluate if the condition is truthy or falsy to decide
	           whether the attribute should be set.</p>
	        ${CodeSnippet(
                'const label = "action button";\n\n' +
                    '// will not render if label is an empty string\n' +
                    'html`<button attr.aria-label="${label}" formenctype="multipart/form-data | ${isFormData}">click me</button>`',
                'typescript'
            )}
        `,
    })
