import logo from './_logo'
import pkg from '../../package.json'
import { PageProps } from '../../build-scripts/docs/types'

export default ({ path }: PageProps) => `
<header class="wrapper">
    <h1>
        <a href="/" aria-label="markup logo home link"
            >${logo()}</a
        >
    </h1>
    <nav>
        <a href="/documents/web-component" ${
            path === '/documents/web-component' ? 'class="active"' : ''
        }>Web Component</a>
        <a href="/documents/router" ${
            path === '/documents/router' ? 'class="active"' : ''
        }>Router</a>
        <a href="https://www.npmjs.com/package/@beforesemicolon/markup"
            >v<em>${pkg.version}</em></a
        >
    </nav>
</header>
`
