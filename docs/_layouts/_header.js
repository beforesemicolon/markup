import logo from './_logo.js'
import pkg from '../../package.json' with { type: 'json' }

export default () => `
<header class="wrapper">
    <h1>
        <a href="/" aria-label="markup logo home link"
            >${logo()}</a
        >
    </h1>
    <nav>
        <a href="https://www.npmjs.com/package/@beforesemicolon/markup"
            >v<em>${pkg.version}</em></a
        >
    </nav>
</header>
`
