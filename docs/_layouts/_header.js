import logo from './_logo.js'
import pkg from '../../package.json' with { type: 'json' }

export default ({ path }) => `
<header class="wrapper">
    <h1>
        <a href="/" aria-label="markup logo home link"
            >${logo()}</a
        >
    </h1>
    <nav>
        <a href="/documentation/capabilities/web-component" ${
            path === '/documentation/capabilities/web-component'
                ? 'class="active"'
                : ''
        }>Web Component</a>
        <a href="/documentation/capabilities/router" ${
            path === '/documentation/capabilities/router'
                ? 'class="active"'
                : ''
        }>Router</a>
        <a href="https://www.npmjs.com/package/@beforesemicolon/markup"
            >v<em>${pkg.version}</em></a
        >
    </nav>
</header>
`
