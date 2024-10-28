import esbuild from 'esbuild'
import path from 'path'
import fs from 'fs'
import { transformExtPlugin } from '@gjsify/esbuild-plugin-transform-ext'

function readFilesRecursively(directoryPath) {
    const files = []

    function readDirectory(currentPath) {
        const entries = fs.readdirSync(currentPath, { withFileTypes: true })

        for (const entry of entries) {
            const fullPath = path.join(currentPath, entry.name)

            if (entry.isDirectory()) {
                readDirectory(fullPath)
            } else {
                files.push(fullPath)
            }
        }
    }

    readDirectory(directoryPath)
    return files
}

const directoryPath = path.join(process.cwd(), 'src')
const allFiles = readFilesRecursively(directoryPath).filter(
    (file) => !file.endsWith('.spec.ts') && !file.endsWith('/client.ts')
)

Promise.all([
    esbuild.build({
        entryPoints: allFiles,
        outdir: 'dist/esm',
        target: 'esnext',
        minify: true,
        format: 'esm',
        platform: 'node',
        keepNames: true,
        plugins: [transformExtPlugin({ outExtension: { '.ts': '.js' } })],
    }),
    esbuild.build({
        entryPoints: allFiles,
        outdir: 'dist/cjs',
        target: 'esnext',
        minify: true,
        format: 'cjs',
        platform: 'node',
        keepNames: true,
        plugins: [transformExtPlugin({ outExtension: { '.ts': '.js' } })],
    }),
]).catch(console.error)
