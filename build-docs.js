import { buildDocs } from '@beforesemicolon/site-builder'
import fs from 'fs'
import path from 'path'

const googleAnalyticsCspSources = {
    'script-src': [
        'https://www.googletagmanager.com',
        'https://www.google-analytics.com',
        'https://ssl.google-analytics.com',
    ],
    'connect-src': [
        'https://www.google-analytics.com',
        'https://analytics.google.com',
        'https://stats.g.doubleclick.net',
        'https://region1.google-analytics.com',
        'https://www.google.com',
    ],
    'img-src': [
        'https://www.google-analytics.com',
        'https://www.googletagmanager.com',
        'https://stats.g.doubleclick.net',
        'https://www.google.com',
    ],
}

const extendContentSecurityPolicy = (policy) => {
    const directives = policy
        .split(';')
        .map((value) => value.trim())
        .filter(Boolean)
        .map((value) => value.split(/\s+/))
    const directiveSources = new Map(
        directives.map(([directive, ...sources]) => [directive, sources])
    )

    Object.entries(googleAnalyticsCspSources).forEach(
        ([directive, sources]) => {
            const currentSources = directiveSources.get(directive) || []
            directiveSources.set(directive, [
                ...new Set([...currentSources, ...sources]),
            ])
        }
    )

    return [...directiveSources]
        .map(([directive, sources]) => [directive, ...sources].join(' '))
        .join('; ')
}

const allowGoogleAnalyticsInGeneratedPages = (directory) => {
    fs.readdirSync(directory, { withFileTypes: true }).forEach((entry) => {
        const filePath = path.join(directory, entry.name)

        if (entry.isDirectory()) {
            allowGoogleAnalyticsInGeneratedPages(filePath)
            return
        }

        if (!entry.isFile() || path.extname(entry.name) !== '.html') return

        const html = fs.readFileSync(filePath, 'utf8')
        if (!html.includes('https://www.googletagmanager.com/gtag/js')) return

        let policyFound = false
        const updatedHtml = html.replace(
            /(<meta http-equiv=Content-Security-Policy content=")([^"]*)(">)/i,
            (_, before, policy, after) => {
                policyFound = true
                return `${before}${extendContentSecurityPolicy(policy)}${after}`
            }
        )

        if (!policyFound) {
            throw new Error(
                `Google Analytics CSP could not be updated in ${filePath}`
            )
        }

        fs.writeFileSync(filePath, updatedHtml)
    })
}

const run = async () => {
    try {
        const isDev = process.env.NODE_ENV === 'development'
        const websiteDirectory = path.join(process.cwd(), 'website')
        fs.rmSync(websiteDirectory, {
            recursive: true,
            force: true,
        })

        await buildDocs({ prod: !isDev })
        allowGoogleAnalyticsInGeneratedPages(websiteDirectory)
    } catch (e) {
        console.error(e)
    }
}

run()
