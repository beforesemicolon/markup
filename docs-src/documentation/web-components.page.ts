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
                Before Semicolon offers a Web Component package built on top of
                <strong>Markup</strong> that simplifies and extends native API
                with new capabilities and reactivity.
            </p>
            ${CodeSnippet(
                "import { WebComponent, html } from '@beforesemicolon/web-component'\n" +
                    "import stylesheet from './counter-app.css' assert { type: 'css' }\n" +
                    '\n' +
                    'interface Props {\n' +
                    '    label: string\n' +
                    '}\n' +
                    '\n' +
                    'interface State {\n' +
                    '    count: number\n' +
                    '}\n' +
                    '\n' +
                    'class CounterApp extends WebComponent<Props, State> {\n' +
                    "    static observedAttributes = ['label']\n" +
                    "    label = '+' // defined props default value\n" +
                    '    initialState = {\n' +
                    '        // declare initial state\n' +
                    '        count: 0,\n' +
                    '    }\n' +
                    '    stylesheet = stylesheet\n' +
                    '\n' +
                    '    countUp(e: Event) {\n' +
                    '        e.stopPropagation()\n' +
                    '        e.preventDefault()\n' +
                    '\n' +
                    '        this.setState(({ count }) => ({ count: count + 1 }))\n' +
                    "        this.dispatch('click')\n" +
                    '    }\n' +
                    '\n' +
                    '    render() {\n' +
                    '        return html`\n' +
                    '            <p>${this.state.count}</p>\n' +
                    '            <button type="button" onclick="${this.countUp.bind(this)}">\n' +
                    '                ${this.props.label}\n' +
                    '            </button>\n' +
                    '        `\n' +
                    '    }\n' +
                    '}\n' +
                    '\n' +
                    "customElements.define('counter-app', CounterApp)",
                'typescript'
            )}
            <p>In your HTML you can simply use the tag normally.</p>
            ${CodeSnippet(
                '<counter-app label="count up"></counter-app>',
                'html'
            )}
            ${Heading('Installation', 'h3')}
            <p>Via npm:</p>
            ${CodeSnippet('npm install @beforesemicolon/web-component', 'vim')}
            <p>Via yarn:</p>
            ${CodeSnippet('yarn add @beforesemicolon/web-component', 'vim')}
            <p>Via CDN:</p>
            ${CodeSnippet(
                '<!-- use the latest version -->\n' +
                    '<script src="https://unpkg.com/@beforesemicolon/web-component/dist/client.js"></script>\n' +
                    '\n' +
                    '<!-- use a specific version -->\n' +
                    '<script src="https://unpkg.com/@beforesemicolon/web-component@0.0.4/dist/client.js"></script>\n' +
                    '\n' +
                    '<!-- link you app script after -->\n' +
                    '<script>\n' +
                    '    const { WebComponent } = BFS\n' +
                    '    const { html, state } = BFS.MARKUP\n' +
                    '</script>',
                'html'
            )}
            ${Heading('Create component', 'h3')}
            <p>
                To create a component, all you need to do is create a class that
                extends WebComponent then define it.
            </p>
            ${CodeSnippet(
                'class MyButton extends WebComponent {\n' +
                    '...\n' +
                    '}\n' +
                    '\n' +
                    "customElements.define('my-button', MyButton)",
                'javascript'
            )}
            ${Heading('ShadowRoot', 'h4')}
            <p>
                By default, all components you create add a
                <a
                    href="https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot"
                    target="_blank"
                    >ShadowRoot</a
                >
                in open mode.
            </p>
            <p>
                If you don't want <code>ShadowRoot</code> in your components,
                you can set the <code>shadow</code> property to
                <code>false</code>.
            </p>
            ${CodeSnippet(
                'class MyButton extends WebComponent {\n' +
                    '    config = {\n' +
                    '        shadow: false,\n' +
                    '    }\n' +
                    '}\n' +
                    '\n' +
                    "customElements.define('my-button', MyButton)",
                'javascript'
            )}
            ${Heading('mode', 'h5')}
            <p>
                You can set the mode your <code>ShadowRoot</code> should be
                created with by setting the mode property. By default, it is set
                to <code>open</code>.
            </p>
            ${CodeSnippet(
                'class MyButton extends WebComponent {\n' +
                    '    config = {\n' +
                    "        mode: 'closed',\n" +
                    '    }\n' +
                    '}\n' +
                    '\n' +
                    "customElements.define('my-button', MyButton)",
                'javascript'
            )}
            ${Heading('delegatesFocus', 'h5')}
            <p>
                You may also set whether the <code>ShadowRoot</code> delegates
                focus by setting the delegatesFocus. By default, it is set to
                <code>false</code>.
            </p>
            ${CodeSnippet(
                'class MyButton extends WebComponent {\n' +
                    '    config = {\n' +
                    '        delegatesFocus: \false,\n' +
                    '    }\n' +
                    '}\n' +
                    '\n' +
                    "customElements.define('my-button', MyButton)",
                'javascript'
            )}
            ${Heading('Internals', 'h3')}
            <p>
                WebComponent exposes the
                <a
                    href="https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals"
                    target="_blank"
                    >ElementInternals</a
                >
                via the <code>internals</code> property that you can access for
                accessibility purposes.
            </p>
            ${CodeSnippet(
                'class TextField extends WebComponent {\n' +
                    '    static formAssociated = true // add this to form-related components\n' +
                    "    static observedAttributes = ['disabled', 'placeholder']\n" +
                    '    disabled = false\n' +
                    "    placeholder = ''\n" +
                    '\n' +
                    '    render() {\n' +
                    '        return html`\n' +
                    '            <input\n' +
                    '                type="text"\n' +
                    '                placeholder="${this.props.placeholder}"\n' +
                    '                disabled="${this.props.disabled}"\n' +
                    '            />\n' +
                    '        `\n' +
                    '    }\n' +
                    '}\n' +
                    '\n' +
                    'const field = new TextField()\n' +
                    '\n' +
                    'field.internals // ElementInternals object',
                'javascript'
            )}
            ${Heading('Content Root', 'h3')}
            <p>
                WebComponent exposes the root of the component via the
                contentRoot property. If the component has a
                <code>shadowRoot</code>, it will expose it here regardless of
                the mode. If not, it will be the component itself.
            </p>
            ${CodeSnippet(
                'const field = new TextField()\n' +
                    '\n' +
                    'field.contentRoot // ShadowRoot object',
                'javascript'
            )}
            <p>
                This is not to be confused with the Node returned by calling the
                <a
                    href="https://developer.mozilla.org/en-US/docs/Web/API/Node/getRootNode"
                    target="_blank"
                    >getRootNode()</a
                >
                on an element. The getRootNode will return the element context
                root node and <code>contentRoot</code> will contain the node
                where the template was rendered to.
            </p>
            ${Heading('Root', 'h3')}
            <p>
                The root is about where the component was rendered at. It can
                either be the document itself, or the ancestor element shadow
                root.
            </p>
            ${Heading('Props', 'h3')}
            <p>
                If your component expects props (inputs), you can set the
                <code>observedAttributes</code> static array with all the
                attribute names.
            </p>
            ${CodeSnippet(
                'class MyButton extends WebComponent {\n' +
                    "    static observedAttributes = ['type', 'disabled', 'label']\n" +
                    '}\n' +
                    '\n' +
                    "customElements.define('my-button', MyButton)",
                'javascript'
            )}
            <p>
                To define the default values for your props, simply define a
                property in the class with same name and provide the value.
            </p>
            ${CodeSnippet(
                'class MyButton extends WebComponent {\n' +
                    "    static observedAttributes = ['type', 'disabled', 'label']\n" +
                    "    type = 'button'\n" +
                    '    disabled = false\n' +
                    "    label = ''\n" +
                    '}\n' +
                    '\n' +
                    "customElements.define('my-button', MyButton)",
                'javascript'
            )}
            <p>
                To read your reactive props you can access the props property in
                the class. This is what it is recommended to be used in the
                template if you want the template to react to prop changes.
                Check the templating section for more.
            </p>
            ${CodeSnippet(
                'interface Props {\n' +
                    "    type: 'button' | 'reset' | 'submit'\n" +
                    '    disabled: boolean\n' +
                    '    label: string\n' +
                    '}\n' +
                    '\n' +
                    'class MyButton extends WebComponent<Props, {}> {\n' +
                    "    static observedAttributes = ['type', 'disabled', 'label']\n" +
                    "    type = 'button'\n" +
                    '    disabled = false\n' +
                    "    label = ''\n" +
                    '\n' +
                    '    constructor() {\n' +
                    '        super()\n' +
                    '\n' +
                    '        console.log(this.props) // contains all props as getter functions\n' +
                    '        this.props.disabled() // will return the value\n' +
                    '    }\n' +
                    '}\n' +
                    '\n' +
                    "customElements.define('my-button', MyButton)",
                'javascript'
            )}
            ${Heading('State', 'h3')}
            <p>
                The state is based on
                <a
                    href="https://markup.beforesemicolon.com/documentation/state-values"
                    target="_blank"
                    >Markup state</a
                >
                which means it will pair up with your template just fine.
            </p>
            ${Heading('initialState', 'h4')}
            <p>
                To start using state in your component simply define the initial
                state with the <code>initialState</code> property.
            </p>
            ${CodeSnippet(
                'interface State {\n' +
                    '    loading: boolean\n' +
                    '}\n' +
                    '\n' +
                    'class MyButton extends WebComponent<{}, State> {\n' +
                    '    initialState = {\n' +
                    '        loading: false,\n' +
                    '    }\n' +
                    '}\n' +
                    '\n' +
                    "customElements.define('my-button', MyButton)",
                'javascript'
            )}
            ${Heading('setState', 'h4')}
            <p>
                If you have state, you will need to update it. To do that you
                can call the <code>setState</code> method with a whole or
                partially new state object or simply a callback function that
                returns the state.
            </p>
            ${CodeSnippet(
                'interface State {\n' +
                    '    loading: boolean\n' +
                    '}\n' +
                    '\n' +
                    'class MyButton extends WebComponent<{}, State> {\n' +
                    '    initialState = {\n' +
                    '        loading: false,\n' +
                    '    }\n' +
                    '\n' +
                    '    constructor() {\n' +
                    '        super()\n' +
                    '\n' +
                    '        this.setState({\n' +
                    '            loading: true,\n' +
                    '        })\n' +
                    '    }\n' +
                    '}\n' +
                    '\n' +
                    "customElements.define('my-button', MyButton)",
                'javascript'
            )}
            <p>
                if you provide a partial state object it will be merged with the
                current state object. No need to spread state when updating it.
            </p>
            ${Heading('Render', 'h3')}
            <p>
                Not all components need an HTML body but in case you need one,
                you can use the <code>render</code> method to return either a
                <a
                    href="https://markup.beforesemicolon.com/documentation/creating-and-rendering"
                    target="_blank"
                    >Markup template</a
                >, a string, or a DOM element.
            </p>
            ${CodeSnippet(
                "import { WebComponent, html } from '@beforesemicolon/web-component'\n" +
                    '\n' +
                    'class MyButton extends WebComponent {\n' +
                    '    render() {\n' +
                    '        return html`\n' +
                    '            <button type="button">\n' +
                    '                <slot></slot>\n' +
                    '            </button>\n' +
                    '        `\n' +
                    '    }\n' +
                    '}\n' +
                    '\n' +
                    "customElements.define('my-button', MyButton)",
                'javascript'
            )}
            ${Heading('Templating', 'h4')}
            <p>
                In the <code>render</code> method you can return a string, a DOM
                element or a
                <a
                    href="https://markup.beforesemicolon.com/documentation/creating-and-rendering"
                    target="_blank"
                    >Markup template</a
                >.
            </p>
            ${Heading('Stylesheet', 'h3')}
            <p>
                You have the ability to specify a style for your component
                either by providing a CSS string or a
                <a
                    href="https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet"
                    target="_blank"
                    >CSSStyleSheet</a
                >.
            </p>
            ${CodeSnippet(
                "import { WebComponent, html } from '@beforesemicolon/web-component'\n" +
                    "import buttonStyle from './my-button.css' assert { type: 'css' }\n" +
                    '\n' +
                    'class MyButton extends WebComponent {\n' +
                    '    stylesheet = buttonStyle\n' +
                    '}\n' +
                    '\n' +
                    "customElements.define('my-button', MyButton)",
                'javascript'
            )}
            <p>
                Where the style is added will depend on whether the shadow
                option is true or false. If the component has shadow style will
                be added to its own
                <a href="./web-components/#content-root">content root</a>.
                Otherwise, style will be added to the closest
                <a href="./web-components/#root">root</a> node the component was
                rendered in. It can be the document itself or root of an
                ancestor web component.
            </p>
            ${Heading('css', 'h4')}
            <p>
                you can use the <code>css</code> utility to define your style
                inside the component as well.
            </p>
            ${CodeSnippet(
                'class MyButton extends WebComponent {\n' +
                    '    stylesheet = css`\n' +
                    '        :host {\n' +
                    '            display: inline-block;\n' +
                    '        }\n' +
                    '        button {\n' +
                    '            color: blue;\n' +
                    '        }\n' +
                    '    `\n' +
                    '}\n' +
                    '\n' +
                    "customElements.define('my-button', MyButton)",
                'javascript'
            )}
            <p>
                It helps your IDE give you better CSS syntax highlight and
                autocompletion but it does not perform any computation to your
                CSS at this point.
            </p>
            ${Heading('updateStylesheet', 'h4')}
            <p>
                You can always manipulate the stylesheet property according to
                the <code>CSSStyleSheet</code> properties. For when you want to
                replace the stylesheet completely with another, you can use the
                <code>updateStylesheet</code> method and provide either a string
                or a new instance of <code>CSSStyleSheet</code>.
            </p>
            ${Heading('Events', 'h3')}
            <p>
                Components can <code>dispatch</code> custom events of any name
                and include data. For that, you can use the dispatch method.
            </p>
            ${CodeSnippet(
                'class MyButton extends WebComponent {\n' +
                    '    handleClick = (e: Event) => {\n' +
                    '        e.stopPropagation()\n' +
                    '        e.preventDefault()\n' +
                    '\n' +
                    "        this.dispatch('click')\n" +
                    '    }\n' +
                    '\n' +
                    '    render() {\n' +
                    '        return html`\n' +
                    '            <button type="button" onclick="${this.handleClick}">\n' +
                    '                <slot></slot>\n' +
                    '            </button>\n' +
                    '        `\n' +
                    '    }\n' +
                    '}\n' +
                    '\n' +
                    "customElements.define('my-button', MyButton)",
                'javascript'
            )}
            ${Heading('Lifecycles', 'h3')}
            <p>
                You could consider the constructor and render method as some
                type of "lifecycle" where anything inside the constructor happen
                when the component is instantiated and everything in the
                <code>render</code> method happens before the
                <a href="./web-components#onmount">onMount</a>.
            </p>
            ${Heading('onMount', 'h4')}
            <p>
                The <code>onMount</code> method is called whenever the component
                is added to the DOM.
            </p>
            ${CodeSnippet(
                'class MyButton extends WebComponent {\n' +
                    '    onMount() {\n' +
                    '        console.log(this.mounted)\n' +
                    '    }\n' +
                    '}\n' +
                    '\n' +
                    "customElements.define('my-button', MyButton)",
                'javascript'
            )}
            <p>
                You may always use the <code>mounted</code> property to check if
                the component is in the DOM or not.
            </p>
            <p>
                You have the option to return a function to perform cleanups
                which is executed like
                <a href="./web-components#ondestroy">onDestroy</a>.
            </p>
            ${CodeSnippet(
                'class MyButton extends WebComponent {\n' +
                    '    onMount() {\n' +
                    '        return () => {\n' +
                    '           // handle cleanup\n' +
                    '        }\n' +
                    '    }\n' +
                    '}\n' +
                    '\n' +
                    "customElements.define('my-button', MyButton)",
                'javascript'
            )}
            ${Heading('onUpdate', 'h4')}
            <p>
                The <code>onUpdate</code> method is called whenever the
                component props are updated via the <code>setAttribute</code> or
                changing the props property on the element instance directly.
            </p>
            ${CodeSnippet(
                'class MyButton extends WebComponent {\n' +
                    '    onUpdate(name: string, newValue: unknown, oldValue: unknown) {\n' +
                    '        console.log(`prop ${name} updated from ${oldValue} to ${newValue}`)\n' +
                    '    }\n' +
                    '}\n' +
                    '\n' +
                    "customElements.define('my-button', MyButton)",
                'javascript'
            )}
            <p>
                The method will always tell you, which prop and its new and old
                value.
            </p>
            ${Heading('onDestroy', 'h4')}
            <p>
                The <code>onDestroy</code> method is called whenever the
                component is removed from the DOM.
            </p>
            ${CodeSnippet(
                'class MyButton extends WebComponent {\n' +
                    '    onDestroy() {\n' +
                    '        console.log(this.mounted)\n' +
                    '    }\n' +
                    '}\n' +
                    '\n' +
                    "customElements.define('my-button', MyButton)",
                'javascript'
            )}
            ${Heading('onAdoption', 'h4')}
            <p>
                The <code>onAdoption</code> method is called whenever the
                component is moved from one document to another. For example,
                when you move a component from an iframe to the main document.
            </p>
            ${CodeSnippet(
                'class MyButton extends WebComponent {\n' +
                    '    onAdoption() {\n' +
                    '        console.log(document)\n' +
                    '    }\n' +
                    '}\n' +
                    '\n' +
                    "customElements.define('my-button', MyButton)",
                'javascript'
            )}
            ${Heading('onError', 'h4')}
            <p>
                The <code>onError</code> method is called whenever the component
                fails to perform internal actions. These action can also be
                related to code executed inside any lifecycle methods, render,
                state or style update.
            </p>
            ${CodeSnippet(
                'class MyButton extends WebComponent {\n' +
                    '    onError(error: Error) {\n' +
                    '        console.log(document)\n' +
                    '    }\n' +
                    '}\n' +
                    '\n' +
                    "customElements.define('my-button', MyButton)",
                'javascript'
            )}
            <p>
                You may also use this method as a single place to expose and
                handle all the errors.
            </p>
            ${CodeSnippet(
                'class MyButton extends WebComponent {\n' +
                    '    onClick() {\n' +
                    '        execAsyncAction().catch(this.onErrror)\n' +
                    '    }\n' +
                    '\n' +
                    '    onError(error) {\n' +
                    '        // handle error\n' +
                    '    }\n' +
                    '}\n' +
                    '\n' +
                    "customElements.define('my-button', MyButton)",
                'javascript'
            )}
            <p>
                You can also enhance components so all errors are handled in the
                same place.
            </p>
            ${CodeSnippet(
                '// have your global componenent that extends WebComponent\n' +
                    '// and that you can use to handle all global related things, for example, error tracking\n' +
                    'class Component extends WebComponent {\n' +
                    '    onError(error: Error) {\n' +
                    '        trackError(error)\n' +
                    '        console.error(error)\n' +
                    '    }\n' +
                    '}\n' +
                    '\n' +
                    'class MyButton extends Component {\n' +
                    '    onClick() {\n' +
                    '        execAsyncAction().catch(this.onErrror)\n' +
                    '    }\n' +
                    '}\n' +
                    '\n' +
                    "customElements.define('my-button', MyButton)",
                'javascript'
            )}
        `,
    })
