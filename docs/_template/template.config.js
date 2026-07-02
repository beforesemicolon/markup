const renderGoogleAnalyticsScript = () => `
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-N3MXGDP5PS"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-N3MXGDP5PS');
</script>`

export default {
    meta: {
        siteName: 'Markup',
        title: 'Markup by Before Semicolon',
        description:
            'Markup is a tiny reactive HTML templating system for building JavaScript user interfaces with web standards, no JSX, and no build step.',
        image: '/assets/markup-banner.jpg',
    },
    site: {
        name: 'Markup',
        packageName: '@beforesemicolon/markup',
        repositoryUrl: 'https://github.com/beforesemicolon/markup',
        repositoryLabel: 'Markup GitHub repository',
        docsEditUrl: 'https://github.com/beforesemicolon/markup/tree/main/docs',
        footerDescription:
            'A reactive HTML templating system for building dynamic UIs with pure JavaScript. No build step. No virtual DOM.',
        footerGroups: [
            {
                title: 'Learning Resources',
                links: [
                    { label: 'Documentation', href: '/documentation' },
                    {
                        label: 'Essentials Training',
                        href: 'https://www.youtube.com/watch?v=mIr2XglV5nQ&list=PLpWvGP6yhJUgWNiz25vj__CArY9Z0O6ke&index=1',
                    },
                ],
            },
            {
                title: 'About Before Semicolon',
                links: [
                    {
                        label: 'Open Source',
                        href: 'https://github.com/beforesemicolon',
                    },
                    {
                        label: 'Website',
                        href: 'https://beforesemicolon.com/',
                    },
                    {
                        label: 'Blog',
                        href: 'https://medium.com/before-semicolon',
                    },
                    {
                        label: 'YouTube Channel',
                        href: 'https://www.youtube.com/channel/UCrU33aw1k9BqTIq2yKXrmBw',
                    },
                ],
            },
        ],
        socialLinks: [
            {
                name: 'Medium blog',
                href: 'https://medium.com/before-semicolon',
                icon: '/assets/medium2.svg',
            },
            {
                name: 'Facebook',
                href: 'https://www.facebook.com/beforesemicolon/',
                icon: '/assets/facebook.svg',
            },
            {
                name: 'Instagram',
                href: 'https://www.instagram.com/before_semicolon_/',
                icon: '/assets/instagram.svg',
            },
            {
                name: 'Reddit',
                href: 'https://www.reddit.com/r/beforesemicolon/',
                icon: '/assets/reddit.svg',
            },
            {
                name: 'Twitter',
                href: 'https://twitter.com/BeforeSemicolon',
                icon: '/assets/twitter.svg',
            },
            {
                name: 'YouTube',
                href: 'https://www.youtube.com/channel/UCrU33aw1k9BqTIq2yKXrmBw',
                icon: '/assets/youtube.svg',
            },
        ],
        copyright: `Copyright &copy; ${new Date().getFullYear()} Before Semicolon. All rights reserved.`,
    },
    headScripts: {
        analytics: renderGoogleAnalyticsScript,
    },
}
