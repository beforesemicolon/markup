import { html } from '../../src'
import { DocPageLayout } from '../partials/doc-page-layout'
import { TemplatingGroup } from '../data/documents'
import { CodeSnippet } from '../partials/code-snippet'
import { Heading } from '../partials/heading'

const page = TemplatingGroup.list[3]

export default DocPageLayout(
    page.path,
    html`
        ${Heading(page.name)}
        <p>
            There could be instances where you also want to grab reference of
            the DOM Element that was rendered. This is also an easy task that
            will give you control over the DOM when you feel limited somehow.
        </p>
        <p>
            There is a special attribute you can use to create DOM references.
            The <code>ref</code> attribute.
        </p>
        ${CodeSnippet(
            'const button = html`<button ref="btn">click me</button>`\n' +
                '\n' +
                'button.render(document.body)\n' +
                '\n' +
                "button.refs.btn[0].style.setProperty('color', 'red')",
            'typescript'
        )}
        <p>
            The example above sets a <code>ref</code> with value of
            <code>btn</code> which is the name for your reference.
        </p>
        <p>
            To access the reference it reads the <code>refs</code> property on
            the template which is an object literal keyed by the name of
            reference you created.
        </p>
        <p>
            Each <code>ref</code> will be an array of elements, that's why it's
            accessing the first item in that array to set the color to red.
        </p>
        ${Heading('Grouping references', 'h3')}
        <p>
            By default, all references are grouped because every reference
            returns an array of elements.
        </p>
        <p>
            What this means is that you can use the same <code>ref</code> value
            for multiple elements and this will include all of them.
        </p>
        ${CodeSnippet(
            'const todos = [\n' +
                "  'Go to gym',\n" +
                "  'Buy groceries',\n" +
                "  'Pick up the kids'\n" +
                '].map(todo => html`<div class="todo-item" ref="todo">${todo}</div>`)\n' +
                '\n' +
                'const todoList = html`${todos}`;\n' +
                '\n' +
                'todoList.render(document.body)\n' +
                '\n' +
                'todoList.refs.todo // contains 3 DIVs',
            'typescript'
        )}
        <p>
            The above example simple how this ability is a quick way to collect
            a list of DOM elements to do whatever you want.
        </p>
        ${Heading('Nested references', 'h3')}
        <p>
            In case you nest templates and a deep template contain references,
            you may collect those reference in the parent most template.
        </p>
        ${CodeSnippet(
            'const button = html`<button ref="btn">+</button>`;\n' +
                '\n' +
                'let count = 0;\n' +
                '\n' +
                'const countUp = html`<span>${count}</span> ${button}`;\n' +
                '\n' +
                'countUp.render(document.body);\n' +
                '\n' +
                'button.refs.btn // [HTMLButtonElement]\n' +
                'countUp.refs.btn // [HTMLButtonElement]',
            'typescript'
        )}
        <p>
            Feel free to collect those reference from whatever template but this
            feature will make it convenient to consume your references in one
            place.
        </p>
        ${Heading('Dynamic references', 'h3')}
        <p>
            You can only collect references from templates that are rendered.
            Just trying to access a reference from a template that was never
            rendered will not work.
        </p>
        <p>
            This affects references when you dynamically render templates.
            Because template must be rendered to produce a DOM reference,
            conditionally rendering templates will dynamically change based on
            the condition they were rendered.
        </p>
        ${CodeSnippet(
            'let loading = false;\n' +
                '\n' +
                'const sample = html`${\n' +
                '  loading \n' +
                '    ? html`<p ref="loading">loading</p>` \n' +
                '    : html`<p ref="loaded">loaded</p>`}`\n' +
                '\n' +
                'sample.render(document.body);\n' +
                '\n' +
                '// refs object will not contain the "loaded" ref\n' +
                '// because it was never rendered\n' +
                'sample.refs // {loading: [P]}',
            'typescript'
        )}
    `
)
