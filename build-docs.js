import { buildDocumentation } from './scripts/build-documentation.js'

await buildDocumentation({ prod: process.env.NODE_ENV !== 'development' })
