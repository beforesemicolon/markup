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
                A Markup helper is simply a function, which the main purpose is
                to help with some render logic or value in the template.
            </p>
            <p>
                It can be used to check data, wrap or render templates,
                manipulate data, etc. You can create simple functions and use
                the template
                <code>update</code> method to trigger them all or wrap functions
                in <code>helper</code> call to make it work with template
                states.
            </p>
            ${Heading('Simple helper', 'h3')}
            <p>
                Bellow is a simple example of a helper. For this case this code
                is using the template <code>update</code> method to trigger
                updates on the DOM. In this case, any function in the template
                will get called with every update.
            </p>
            ${CodeSnippet(
                'let count = 0;\n' +
                    '\n' +
                    '// simple count helper function to display "even" or "odd" \n' +
                    "const evenOddCountLabel = () => count % 2 === 0 ? 'even' : 'odd';\n" +
                    '\n' +
                    'const counter = html`\n' +
                    '  <p>${() => count}</p>\n' +
                    '  <p>${evenOddCountLabel} count</p>\n' +
                    '  <button type="button" onclick="${countUp}">+</button>\n' +
                    '`;\n' +
                    '\n' +
                    'function countUp() {\n' +
                    '  count += 1;\n' +
                    '  counter.update()\n' +
                    '}\n' +
                    '\n' +
                    'counter.render(document.body)',
                'typescript'
            )}
            <p>
                As you can see, a helper is simply a function that does a
                particular calculation and returns something for a part of the
                template. This can be an attribute value or a template content.
            </p>
            <p>
                For contrast, this is how it would look like if I was using
                <a href="./state-values">state</a> count instead.
            </p>
            ${CodeSnippet(
                'let [count, setCount] = state(0);\n' +
                    '\n' +
                    "const evenOddCountLabel = () => count() % 2 === 0 ? 'even' : 'odd';\n" +
                    '\n' +
                    'const counter = html`\n' +
                    '  <p>${count}</p>\n' +
                    '  <p>${effect(count, evenOddCountLabel)} count</p>\n' +
                    '  <button type="button" onclick="${countUp}">+</button>\n' +
                    '`;\n' +
                    '\n' +
                    'function countUp() {\n' +
                    '  setCount(prev => prev + 1)\n' +
                    '}\n' +
                    '\n' +
                    'counter.render(document.body)',
                'typescript'
            )}
            <p>
                The difference is the usage of the <code>effect</code> helper to
                tell the template to execute the helper whenever the
                <code>count</code> changes since this particular helper uses the
                <code>count</code> state inside.
            </p>
            ${Heading('Helper wrapper', 'h3')}
            <p>
                We can simplify the helper above with the
                <code>helper</code> wrapper and remove the need for the
                <a href="./effect-helper">effect</a> helper when using it in the
                template.
            </p>
            <p>
                To use the <code>helper</code> wrapper, all you need to do is
                wrap a function with it.
            </p>
            ${CodeSnippet(
                'const evenOddLabel = helper((x: StateGetter<number>) => x() % 2 === 0 \n' +
                    "   ? 'even' \n" +
                    "   : 'odd');",
                'typescript'
            )}
            <p>
                Notice that now it is a pure function that takes the
                <code>x</code> input which must be a <code>StateGetter</code>.
                What this mean is that, whenever the state changes, the helper
                will tell the template to update that specific part of the DOM
                where it is used.
            </p>
            <p>Here is the full result:</p>
            ${CodeSnippet(
                'let [count, setCount] = state(0);\n' +
                    '\n' +
                    'const evenOddLabel = helper((x: StateGetter<number>) => x() % 2 === 0 \n' +
                    "   ? 'even' \n" +
                    "   : 'odd');\n" +
                    '\n' +
                    'const counter = html`\n' +
                    '  <p>${count}</p>\n' +
                    '  <p>${evenOddLabel(count)} count</p>\n' +
                    '  <button type="button" onclick="${countUp}">+</button>\n' +
                    '`;\n' +
                    '\n' +
                    'function countUp() {\n' +
                    '  setCount(prev => prev + 1)\n' +
                    '}\n' +
                    '\n' +
                    'counter.render(document.body)',
                'typescript'
            )}
            <p>
                You can learn to improve it further by checking
                <a href="./custom-helper">how to create your custom helpers</a>.
            </p>
            ${Heading('Helper value and arguments', 'h4')}
            <p>
                The <code>helper</code> wrapper returns an instance of
                <code>Helper</code> that the template itself knows how to handle
                by accessing the <code>value</code> and
                <code>args</code> properties.
            </p>
            ${CodeSnippet(
                'evenOddLabel(count).value;\nevenOddLabel(count).args;\n',
                'typescript'
            )}
            <p>
                By knowing these two properties, you can use them anywhere in
                your code for any type of functionality you want to create.
            </p>
            ${Heading('Working with helpers', 'h4')}
            <p>
                Helpers are just functions, and you can do anything you would
                with functions including returning or passing them around.
            </p>
            <p>
                Below is a simple example of nesting helpers, in this case the
                <code>is</code>, <code>when</code>, and
                <code>repeat</code> helpers.
            </p>
            ${CodeSnippet(
                'html`${repeat(\n' +
                    "  when(is(userType, 'user'), ['name', 'status'], ['name', 'role']), \n" +
                    '  part => html`<strong>${part}</strong>`)\n' +
                    '}`',
                'typescript'
            )}
            <p>
                What this is illustrating is the
                <a href="https://en.wikipedia.org/wiki/Functional_programming"
                    >functional oriented</a
                >
                nature of Markup, specifically the ability to compose simple
                functions to create complex renders and logic handlers.
            </p>
            ${Heading('Helper scope state', 'h3')}
            <p>
                Helpers can also keep internal state through
                <a
                    href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures"
                    >JavaScript closures</a
                >, and it should not be a problem. Your helper function can be
                up to one level nested function.
            </p>
            <p>
                The following filter use the outer function to "cache" the
                condition, and the filtered list results, so it can save
                unnecessary computation. The inner returned function is used as
                the handler.
            </p>
            ${CodeSnippet(
                'const filterList = helper((list, filterer, condition = () => null) => {\n' +
                    '  let val = [];\n' +
                    '  let cond;\n' +
                    '  \n' +
                    '  return () => {\n' +
                    '    if(condition() !== cond) {\n' +
                    '      val = list().filter(filterer);\n' +
                    '      cond = condition();\n' +
                    '    }\n' +
                    '    \n' +
                    '    return val;\n' +
                    '  }\n' +
                    '})',
                'typescript'
            )}
            <p>
                This is just a simple example, but it shows that you can nest
                functions up to one level (outer and inner) and the helper would
                still function well.
            </p>
            <p>
                This capability will allow helpers to keep data between
                calculations, and you to build more powerful helpers to support
                your project.
            </p>
        `,
    })
