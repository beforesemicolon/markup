import { html } from '../../src'
import { DocPageLayout } from '../partials/doc-page-layout'
import { HelpersGroup, TemplatingGroup } from '../data/documents'
import { Heading } from '../partials/heading'
import { CodeSnippet } from '../partials/code-snippet'
import { DocPrevNextNav } from '../partials/doc-prev-next-nav'

const page = HelpersGroup.list[0]

export default DocPageLayout(
    page.name,
    page.path,
    html`
        ${Heading(page.name)}
        <p>
            A helper is simply a function. A function that main purpose is to
            help with some logic in the template.
        </p>
        <p>
            It can be used to check data, wrap or render templates, manipulate
            data, etc. You can create simple functions and use the template
            <code>update</code> method to trigger them all or wrap functions in
            <code>Helper</code> call to make it work with template states.
        </p>
        ${Heading('Simple helper', 'h3')}
        <p>
            Bellow is a simple example of a helper. For this case this code is
            using the template <code>update</code> method to trigger updates on
            the DOM. In this case, any function in the template will get called
            with every update.
        </p>
        ${CodeSnippet(
            'let count = 0;\n' +
                '\n' +
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
            As you can see, a helper is simply a function that does a particular
            calculation and returns something for a part of the template. This
            can be an attribute value or a template content.
        </p>
        <p>
            For contrast, this is how it would look like if I was using
            <a href="./state-values">state</a> instead.
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
            <code>helper</code> wrapper.
        </p>

        <p>
            To use the <code>helper</code> wrapper, all you need to do is wrap a
            function with it. If that function takes as
            <code>StateGetter</code> directly as argument, the template will
            know to recalculate the result of that helper when the states it
            depends on changes.
        </p>
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
        ${Heading('Helper value', 'h4')}
        <p>
            The <code>helper</code> wrapper returns an instance of
            <code>Helper</code> which the template itself knows how to handle.
            All it does is call it and get the <code>value</code>.
        </p>
        ${CodeSnippet('evenOddLabel(() => 12).value', 'typescript')}
        ${Heading('Working with helpers', 'h4')}
        <p>
            Helpers are just functions, and you can do anything you would with
            functions including returning or passing them around.
        </p>
        <p>
            Below is a simple example of nesting helpers, in this case the
            <code>is</code>, <code>when</code>, and <code>repeat</code> helpers.
        </p>
        ${CodeSnippet(
            'html`${repeat(\n' +
                "  when(is(userType, 'user'), ['name', 'status'], ['name', 'role']), \n" +
                '  part => html`<strong>${part}</strong>`)\n' +
                '}`',
            'typescript'
        )}
        <p>
            Ofcourse you can simplify this by moving them into a new helper
            altogether to make it easier to read, but it should give you enough
            idea of what is possible.
        </p>
        ${Heading('Helper scope state', 'h3')}
        <p>
            The best way to introduce internal state to the helper functions is
            to use
            <a
                href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures"
                >JavaScript closure</a
            >
            and the helper would still work just fine.
        </p>
        <p>
            The following filter use the outer function to "cache" the condition
            and the filtered list results, so it can save unnecessary
            computation.
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
            This is just an example and not something you will need with this
            library if using state, but it shows that you can freely nest
            functions up to one two levels (outer and inner) and the helper
            would still function well.
        </p>
        <p>
            This capability will allow helpers to keep data in between
            calculations and you to build more powerful helpers to support your
            project.
        </p>
        ${DocPrevNextNav({
            prev: {
                label: TemplatingGroup.list[7].name,
                link: TemplatingGroup.list[7].path,
            },
            next: {
                label: HelpersGroup.list[1].name,
                link: HelpersGroup.list[1].path,
            },
        })}
    `
)
