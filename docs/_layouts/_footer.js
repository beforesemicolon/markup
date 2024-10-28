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
<footer class="wrapper">
    <img
        id="footer-markup-logo"
        src="/assets/markup-logo-name.svg"
        alt="Markup logo"
        width="auto"
        height="30"
    />
    <ul class="learning-resources">
        <li><h4>Learning Resources</h4></li>
        <li><a href="/documentation">Documentation</a></li>
        <li>
            <a
                target="_blank"
                href="https://www.youtube.com/watch?v=mIr2XglV5nQ&list=PLpWvGP6yhJUgWNiz25vj__CArY9Z0O6ke&index=1"
                >Essentials Training</a
            >
        </li>
    </ul>
    <ul class="about-bfs">
        <li>
            <h4>About <em>Before Semicolon</em></h4>
        </li>
        <li>
            <a
                href="https://github.com/beforesemicolon"
                rel="noopener"
                target="_blank"
                >Open Source</a
            >
        </li>
        <li>
            <a
                href="https://beforesemicolon.com/"
                rel="noopener"
                target="_blank"
                >Website</a
            >
        </li>
        <li>
            <a
                href="https://medium.com/before-semicolon"
                rel="noopener"
                target="_blank"
                >Blog</a
            >
        </li>
        <li>
            <a
                href="https://www.youtube.com/channel/UCrU33aw1k9BqTIq2yKXrmBw"
                rel="noopener"
                target="_blank"
                >YouTube Channel</a
            >
        </li>
        <li>
            <address aria-label="social-media">
                ${social
                    .map(
                        (s) => `
                        <a href="${s.link}" rel="noopener" target="_blank">
                            <img src="/${s.icon}" alt="${s.name}" width="20" />
                        </a>
                    `
                    )
                    .join('')}
            </address>
        </li>
    </ul>
    <div class="copyright">
        <img
            width="20"
            height="20"
            src="/assets/before-semicolon-logo.png"
            alt="Before Semicolon logo"
        />
        <p>
            <small>
                Copyright © ${new Date().getFullYear()} Before
                Semicolon. All rights reserved.
            </small>
        </p>
    </div>
</footer>
`
