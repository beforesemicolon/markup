import { html } from '../../src'
import pkg from '../../package.json'

interface HeaderProps {
    basePath?: string
}

export const Header = ({ basePath = './' }: HeaderProps = {}) => html`
    <header class="wrapper">
        <h1>
            <a href="${basePath}"
                ><em>@beforesemicolon</em>/<strong>HTML</strong></a
            >
        </h1>
        <nav>
            <a href="https://www.npmjs.com/package/@beforesemicolon/html"
                >v<em>${pkg.version}</em></a
            >
        </nav>
    </header>
`
