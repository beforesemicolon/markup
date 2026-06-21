import logo from './_logo.js'

const social = [
    {
        link: 'https://medium.com/before-semicolon',
        icon: 'assets/medium2.svg',
        name: 'Medium blog',
    },
    {
        link: 'https://www.facebook.com/beforesemicolon/',
        icon: 'assets/facebook.svg',
        name: 'Facebook',
    },
    {
        link: 'https://www.instagram.com/before_semicolon_/',
        icon: 'assets/instagram.svg',
        name: 'Instagram',
    },
    {
        link: 'https://www.reddit.com/r/beforesemicolon/',
        icon: 'assets/reddit.svg',
        name: 'Reddit',
    },
    {
        link: 'https://twitter.com/BeforeSemicolon',
        icon: 'assets/twitter.svg',
        name: 'Twitter',
    },
    {
        link: 'https://www.youtube.com/channel/UCrU33aw1k9BqTIq2yKXrmBw',
        icon: 'assets/youtube.svg',
        name: 'YouTube',
    },
]

export default () => `
<footer class="site-footer">
    <div class="footer-inner wrapper">
        <div class="footer-brand">
            ${logo({ fill: 'currentColor', width: '100px' })}
            <p>A reactive HTML templating system for building dynamic UIs with pure JavaScript. No build step. No virtual DOM.</p>
        </div>
        <ul class="footer-links">
            <li><h4>Learning Resources</h4></li>
            <li><a href="/documentation">Documentation</a></li>
            <li><a target="_blank" rel="noopener" href="https://www.youtube.com/watch?v=mIr2XglV5nQ&list=PLpWvGP6yhJUgWNiz25vj__CArY9Z0O6ke&index=1">Essentials Training</a></li>
        </ul>
        <ul class="footer-links">
            <li><h4>About <em>Before Semicolon</em></h4></li>
            <li><a href="https://github.com/beforesemicolon" rel="noopener" target="_blank">Open Source</a></li>
            <li><a href="https://beforesemicolon.com/" rel="noopener" target="_blank">Website</a></li>
            <li><a href="https://medium.com/before-semicolon" rel="noopener" target="_blank">Blog</a></li>
            <li><a href="https://www.youtube.com/channel/UCrU33aw1k9BqTIq2yKXrmBw" rel="noopener" target="_blank">YouTube Channel</a></li>
        </ul>
        <div class="footer-social" aria-label="social-media">
            ${social
                .map(
                    (s) => `
                    <a href="${s.link}" rel="noopener" target="_blank" aria-label="${s.name}">
                        <img src="/${s.icon}" alt="${s.name}" width="16" height="16" />
                    </a>
                `
                )
                .join('')}
        </div>
        <div class="footer-credit">
            <img width="20" height="20" src="/assets/before-semicolon-logo.png" alt="Before Semicolon logo" />
            <span>Copyright &copy; ${new Date().getFullYear()} Before Semicolon. All rights reserved.</span>
        </div>
    </div>
</footer>
`
