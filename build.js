import { buildModules, buildBrowser } from '@beforesemicolon/builder'
import { buildDocs } from '@beforesemicolon/site-builder'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'

const reportDistSize = (dir = 'dist') => {
    if (!existsSync(dir)) return

    const walk = (path) => {
        for (const name of readdirSync(path)) {
            const file = join(path, name)
            const stat = statSync(file)
            if (stat.isDirectory()) walk(file)
            else if (/\.(m?js|cjs)$/.test(name)) {
                const content = readFileSync(file)
                console.log(`[bundle-size] ${file}: ${content.length} bytes raw, ${gzipSync(content).length} bytes gzip`)
            }
        }
    }

    walk(dir)
}

const run = async () => {
    try {
        await Promise.all([buildBrowser(), buildModules(), buildDocs()])
        reportDistSize()
    } catch (e) {
        console.error(e)
    }
}

run()
