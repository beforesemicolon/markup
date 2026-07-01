import { buildModules, buildBrowser, buildDocs } from '@beforesemicolon/builder'

const docsOptions = {
    template: 'fading-citrus',
    siteUrl: 'https://markup.beforesemicolon.com',
    generatedFiles: {
        netlify: true,
    },
}

const run = async () => {
    try {
        await Promise.all([
            buildBrowser(),
            buildModules(),
            buildDocs(docsOptions),
        ])
        // Wait for the unawaited async writeFile calls in builder's forEach to finish
        await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (e) {
        console.error(e)
    }
}

run()
