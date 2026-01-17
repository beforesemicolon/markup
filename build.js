import { buildModules, buildBrowser, buildDocs } from '@beforesemicolon/builder'

Promise.all([buildBrowser(), buildModules(), buildDocs()]).catch(console.error)
