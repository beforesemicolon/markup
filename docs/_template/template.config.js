import { readFileSync } from 'node:fs'

const { version } = JSON.parse(
    readFileSync(new URL('../../package.json', import.meta.url), 'utf8')
)

export default {
    markedOptions: {
        walkTokens(token) {
            if (
                token.type === 'markdownLayout' &&
                token.layoutType === 'landing-hero'
            ) {
                token.options.version = `v${version}`
            }
        },
    },
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
                i18n: 'common.navigation.learningResources',
                links: [
                    {
                        label: 'Documentation',
                        i18n: 'common.navigation.documentation',
                        routeId: 'documentation/index',
                        href: '/documentation',
                    },
                    {
                        label: 'Essentials Training',
                        i18n: 'common.navigation.essentialsTraining',
                        href: 'https://www.youtube.com/watch?v=mIr2XglV5nQ&list=PLpWvGP6yhJUgWNiz25vj__CArY9Z0O6ke&index=1',
                    },
                ],
            },
            {
                title: 'About Before Semicolon',
                i18n: 'common.navigation.aboutBeforeSemicolon',
                links: [
                    {
                        label: 'Open Source',
                        i18n: 'common.navigation.openSource',
                        href: 'https://github.com/beforesemicolon',
                    },
                    {
                        label: 'Website',
                        i18n: 'common.navigation.website',
                        href: 'https://beforesemicolon.com/',
                    },
                    {
                        label: 'Blog',
                        i18n: 'common.navigation.blog',
                        href: 'https://medium.com/before-semicolon',
                    },
                    {
                        label: 'YouTube Channel',
                        i18n: 'common.navigation.youtubeChannel',
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
}
