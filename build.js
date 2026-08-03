import { buildModules, buildBrowser } from '@beforesemicolon/builder'
import { buildDocs } from '@beforesemicolon/site-builder'
import fs from 'fs'
import path from 'path'

const legacyRedirects = [
    '/documentation/capabilities/web-component https://web-component.beforesemicolon.com/ 301!',
    '/documentation/capabilities/web-component/ https://web-component.beforesemicolon.com/ 301!',
    '/documentation/capabilities/router https://router.beforesemicolon.com/ 301!',
    '/documentation/capabilities/router/ https://router.beforesemicolon.com/ 301!',
    '/documentation/capabilities/form-controls https://web-component.beforesemicolon.com/documentation/advanced/form-integration 301!',
    '/documentation/capabilities/form-controls/ https://web-component.beforesemicolon.com/documentation/advanced/form-integration 301!',
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
        await Promise.all([buildBrowser(), buildModules(), buildDocs()])
        appendLegacyRedirects()
    } catch (e) {
        console.error(e)
    }
}

run()
