import logo from './_logo.js'
import pkg from '../../package.json' with { type: 'json' }

export default (props = {}) => {
    const isDocs = props.path?.startsWith('/documentation')

    return `
<header class="site-header">
    <div class="header-inner wrapper">
        <h1>
            <a href="/" aria-label="Markup home">
                ${logo({ fill: 'currentColor', width: '90px' })}
            </a>
        </h1>
        ${
            isDocs
                ? `
        <nav class="nav-actions docs-actions">
            <a href="https://github.com/beforesemicolon/markup" target="_blank" rel="noopener" aria-label="Markup GitHub repository" class="github-link docs-github-link">
                <span>v${pkg.version}</span>
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
            </a>
        </nav>
        `
                : `
        <nav class="nav-links">
            <a href="/#features">Features</a>
            <a href="/#code">Code</a>
            <a href="/#install">Install</a>
        </nav>
        <nav class="nav-actions">
            <a href="https://github.com/beforesemicolon/markup" target="_blank" rel="noopener" aria-label="GitHub" class="github-link">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
            </a>
            <a href="/documentation/index.html?v=20260621exact" class="btn-primary">Documentation</a>
        </nav>
        `
        }
    </div>
</header>
`
}
