import fs from 'fs/promises'
import * as path from 'path'
import { toStatic } from '../src/to-static'

const docsSrcDir = path.resolve(process.cwd(), 'docs-src')
const docsDir = path.resolve(process.cwd(), 'docs')

fs.mkdir(docsDir, { recursive: true }).then(() =>
    fs.readdir(docsSrcDir).then((content) => {
        content
            .filter((c) => c.endsWith('page.ts'))
            .forEach((page) => {
                const pageName = page.replace('.page.ts', '.html')

                import(path.join(docsSrcDir, page)).then(
                    ({ default: temp }) => {
                        return fs.writeFile(
                            path.join(docsDir, pageName),
                            toStatic(temp)
                        )
                    }
                )
            })
    })
)
