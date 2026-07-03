import { buildDocs } from '@beforesemicolon/builder'
import fs from 'fs'
import path from 'path'

const docsOptions = {
    template: 'fading-citrus',
    siteUrl: 'https://markup.beforesemicolon.com',
    generatedFiles: {
        netlify: true,
    },
}

const legacyRedirects = [
    '/documentation/web-component https://web-component.beforesemicolon.com/ 301!',
    '/documentation/web-component/ https://web-component.beforesemicolon.com/ 301!',
    '/documentation/router https://router.beforesemicolon.com/ 301!',
    '/documentation/router/ https://router.beforesemicolon.com/ 301!',
]

const appendLegacyRedirects = () => {
    const redirectsPath = path.join(process.cwd(), 'website', '_redirects')
    const redirects = fs.existsSync(redirectsPath)
        ? fs.readFileSync(redirectsPath, 'utf8')
        : ''
    const nextRedirects = [
        ...new Set([...redirects.split('\n'), ...legacyRedirects]),
    ]
        .filter(Boolean)
        .join('\n')

    fs.writeFileSync(redirectsPath, `${nextRedirects}\n`)
}

const run = async () => {
    try {
        fs.rmSync(path.join(process.cwd(), 'website'), {
            recursive: true,
            force: true,
        })

        await buildDocs(docsOptions)
        // Wait for the unawaited async writeFile calls in builder's forEach to finish
        await new Promise((resolve) => setTimeout(resolve, 1000))
        appendLegacyRedirects()
    } catch (e) {
        console.error(e)
    }
}

run()
