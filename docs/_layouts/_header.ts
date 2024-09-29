import logo from './_logo'
import pkg from '../../package.json'

export default () => `
<header class="wrapper">
    <h1>
        <a href="/" aria-label="markup logo home link"
            >${logo()}</a
        >
    </h1>
    <nav>
        <a href="/documents/web-component">Web Component</a>
        <a href="/documents/router">Router</a>
        <a href="https://www.npmjs.com/package/@beforesemicolon/markup"
            >v<em>${pkg.version}</em></a
        >
    </nav>
</header>
`
