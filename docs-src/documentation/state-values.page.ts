import { html } from '../../src'
import { DocPageLayout } from '../partials/doc-page-layout'
import { TemplatingGroup } from '../data/documents'
import { Heading } from '../partials/heading'
import { CodeSnippet } from '../partials/code-snippet'

const page = TemplatingGroup.list[7]

export default DocPageLayout(
    page.path,
    html`
        ${Heading(page.name)}
        <p>
            The concept of state is related to
            <a href="./dynamic-values-and-update.html">dynamic values</a>, and
            it is an optimal way to work with template values that you expect to
            change and that the template should react to.
        </p>
        ${CodeSnippet(
            'const [count, setCount] = state(0);\n' +
                '\n' +
                'const counter = html`\n' +
                '  <p>${count}</p>\n' +
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
        ${Heading('state', 'h3')}
        <p>
            State is a core API much like <code>html</code> and unlike any state
            concept you might have heard of. It is part of the template system
            rather than some specific utility.
        </p>
        <p>
            You create a state by calling the <code>state</code> function and
            providing it with an initial value.
        </p>
        ${CodeSnippet(
            'const [count, setCount] = state<number>(0);',
            'typescript'
        )}
        <p>
            You can also provide an optional <code>StateSubscriber</code> as
            second argument if you want to react to the state update to perform
            some side effects for example.
        </p>
        ${CodeSnippet(
            'const [count, setCount] = state(0, () => {\n' +
                "  console.log('count changed')\n" +
                '});',
            'typescript'
        )}
        <p>The <code>state</code> call returns an array of 3 functions:</p>
        <ul>
            <li>
                <strong>StateGetter</strong>: a function (dynamic value) that
                returns the latest value
            </li>
            <li>
                <strong>StateSetter</strong>: a function to update the value
            </li>
            <li>
                <strong>StateUnSubscriber</strong>: a function to unsubscribe
                from the state in case you provided a
                <code>StateSubscriber</code> to the <code>state</code> call.
            </li>
        </ul>
        ${CodeSnippet(
            'const [count, setCount, unsubscribeFromCount] = state(0, () => {\n' +
                "  console.log('count changed')\n" +
                '});',
            'typescript'
        )}
        <p>
            The <code>StateSetter</code> can either take a new value or a
            callback that gets called with current value and must return an
            updated one.
        </p>
        ${CodeSnippet(
            'setCount(count() + 1)\n' + 'setCount(prev => prev + 1)',
            'typescript'
        )}
        ${Heading('How does state works?', 'h3')}
        <p>
            The state is simply an observable the <code>html</code> template can
            subscribe to. This means that the template will know exactly what
            state changed and where in the template that state was used to
            update exactly the part of the DOM that depends on that data.
        </p>
        <p>
            It provides an optimal way to react to dynamic value changes in
            comparison to the
            <a href="./dynamic-values-and-update.html#update-template"
                >update</a
            >
            function.
        </p>
        <p>
            A state must be used directly in the template to work. Using a
            function that uses that state inside will not get called when that
            state changes because the template cannot see state inside your
            function.
        </p>
        ${CodeSnippet(
            'const counter = html`\n' +
                '  <p>${count}</p> <-- will react to changes\n' +
                '  <p>${() => count() * 2}</p> <-- will NOT react to changes\n' +
                '`;'
        )}
        ${Heading('effect', 'h3')}
        <p>
            The <code>effect</code> helper was introduced for cases where you
            have places in the template that depends on a specific state, but
            you are doing some <strong>side effect</strong> calculation with
            that state
        </p>
        ${CodeSnippet(
            'const counter = html`\n' +
                '  <p>${count}</p>\n' +
                '  <p>${effect(count, () => count() * 2)}</p>\n' +
                '`;'
        )}
        <p>
            Simply wrap your calculation in <code>effect</code> and comma
            separate all the states it depends on before your side effect
        </p>
        <p><code>effect(...STATE, SIDE_EFFECT_ACTION)</code></p>
        <p>
            The <code>effect</code> is simply a type of <code>Helper</code> and
            you can learn more about
            <a href="./what-is-a-helper.html">helpers</a> in the next section of
            the doc.
        </p>
    `
)
