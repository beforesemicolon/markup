import { buildModules, buildBrowser } from '@beforesemicolon/builder'
import { buildDocs } from '@beforesemicolon/site-builder'

const run = async () => {
    try {
        await Promise.all([buildBrowser(), buildModules(), buildDocs()])
    } catch (e) {
        console.error(e)
    }
}

run()
