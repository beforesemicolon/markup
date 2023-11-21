import { html } from '../../src'
import pkg from '../../package.json'
import { MarkupLogo } from './markup-logo'

interface HeaderProps {
    basePath?: string
}

export const Header = ({ basePath = './' }: HeaderProps = {}) => html`
    <header class="wrapper">
        <h1>
            <a href="${basePath}" aria-label="markup logo home link"
                >${MarkupLogo()}</a
            >
        </h1>
        <nav>
            <a href="https://www.npmjs.com/package/@beforesemicolon/markup"
                >v<em>${pkg.version}</em></a
            >
        </nav>
    </header>
`
