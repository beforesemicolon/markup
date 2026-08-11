import { buildDocs } from '@beforesemicolon/site-builder'

const run = async () => {
    try {
        const isDev = process.env.NODE_ENV === 'development'
        await buildDocs({ prod: !isDev })
    } catch (e) {
        console.error(e)
    }
}

run()
