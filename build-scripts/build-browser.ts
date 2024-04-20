import esbuild, { Plugin } from 'esbuild'

const emptyParserDoc = {
    name: 'empty-parser-Doc-plugin',
    setup(build) {
        build.onResolve({ filter: /Doc$/ }, (args) => {
            if (args.importer.includes('@beforesemicolon/html-parser')) {
                return {
                    path: args.path,
                    namespace: 'empty-Doc',
                }
            }
        })
        build.onLoad({ filter: /.*/, namespace: 'empty-Doc' }, () => {
            return {
                contents: '',
            }
        })
    },
} as Plugin

await esbuild.build({
    entryPoints: ['src/client.ts'],
    outfile: 'dist/client.js',
    bundle: true,
    keepNames: true,
    sourcemap: true,
    target: 'esnext',
    minify: true,
    plugins: [emptyParserDoc],
})
