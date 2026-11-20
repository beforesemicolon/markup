import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { basename, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { Script, runInNewContext } from 'node:vm'
import ts from 'typescript'

const root = process.cwd()
const json = async (path) => JSON.parse(await readFile(path, 'utf8'))
const writeJson = (path, value) =>
    writeFile(path, `${JSON.stringify(value, null, 4)}\n`)
const flags =
    ts.TypeFormatFlags.NoTruncation |
    ts.TypeFormatFlags.WriteArrowStyleSignature

function readDeclarations(entry) {
    const program = ts.createProgram([entry], {
        module: ts.ModuleKind.NodeNext,
        moduleResolution: ts.ModuleResolutionKind.NodeNext,
        skipLibCheck: true,
        types: [],
        target: ts.ScriptTarget.ESNext,
    })
    const checker = program.getTypeChecker()
    const source = program.getSourceFile(entry)
    assert(source, `Declaration entry missing: ${entry}`)
    const module = checker.getSymbolAtLocation(source)
    assert(module, 'Expected declarations for a public module')
    const printer = ts.createPrinter({ removeComments: true })

    return new Map(
        checker.getExportsOfModule(module).map((exported) => {
            const symbol =
                exported.flags & ts.SymbolFlags.Alias
                    ? checker.getAliasedSymbol(exported)
                    : exported
            const name = exported.getName()
            const declaration = symbol.declarations?.[0]
            const ownerFile = declaration?.getSourceFile().fileName
            assert(declaration && ownerFile, `No declaration for ${name}`)
            const print = (node) =>
                printer
                    .printNode(
                        ts.EmitHint.Unspecified,
                        node,
                        declaration.getSourceFile()
                    )
                    .trim()
            const classOrEnum =
                ts.isClassDeclaration(declaration) ||
                ts.isEnumDeclaration(declaration)
            const members = ts.isClassDeclaration(declaration)
                ? declaration.members
                      .filter(
                          (member) =>
                              !member.modifiers?.some(
                                  (mod) =>
                                      mod.kind === ts.SyntaxKind.PrivateKeyword
                              ) &&
                              member.name?.kind !==
                                  ts.SyntaxKind.PrivateIdentifier &&
                              !member.name?.getText().startsWith('__')
                      )
                      .map(print)
                : undefined
            const classDeclaration =
                ts.isClassDeclaration(declaration) &&
                print(declaration).split('{')[0].trim()
            const declarations = symbol.declarations.filter(
                (node) =>
                    ts.isFunctionDeclaration(node) ||
                    ts.isTypeAliasDeclaration(node) ||
                    ts.isInterfaceDeclaration(node)
            )
            const signature = classDeclaration
                ? classDeclaration
                : declarations.length
                  ? declarations.map(print).join('\n')
                  : classOrEnum
                    ? print(declaration)
                    : `${name}: ${checker.typeToString(
                          checker.getTypeOfSymbolAtLocation(
                              symbol,
                              declaration
                          ),
                          declaration,
                          flags
                      )}`
            return [name, { signature, members, ownerFile }]
        })
    )
}

function symbolPaths(namespace, roots) {
    return Object.fromEntries(
        Object.entries(roots).flatMap(([path, kind]) =>
            kind === 'namespace'
                ? Object.keys(namespace[path]).map((name) => [
                      name,
                      `BFS.${path}.${name}`,
                  ])
                : [[path, `BFS.${path}`]]
        )
    )
}

function validateExampleImports(code, acceptedExports, npmPackage, label) {
    const ast = ts.createSourceFile(
        'example.ts',
        code,
        ts.ScriptTarget.ESNext,
        true
    )
    assert.equal(ast.parseDiagnostics.length, 0, `Invalid example: ${label}`)
    for (const node of ast.statements) {
        if (
            ts.isImportDeclaration(node) &&
            node.moduleSpecifier.text === npmPackage
        ) {
            assert(
                !node.importClause?.name,
                `Unsupported default import: ${label}`
            )
            const bindings = node.importClause?.namedBindings
            assert(
                bindings && ts.isNamedImports(bindings),
                `Expected named imports: ${label}`
            )
            for (const element of bindings.elements) {
                const name = (element.propertyName ?? element.name).text
                assert(
                    acceptedExports.has(name),
                    `Unknown example import: ${label}/${name}`
                )
                if (acceptedExports.get(name).typeOnly) {
                    assert(
                        node.importClause.isTypeOnly || element.isTypeOnly,
                        `Type-only import used as a value: ${label}/${name}`
                    )
                }
            }
        }
    }
}

const browserCode = (names, paths, body) =>
    `${names.map((name) => `const ${name} = window.${paths[name]}`).join('\n')}\n\n${body}`

const npmImport = (names, specifier, typeOnly = false) =>
    `import ${typeOnly ? 'type ' : ''}{ ${names.join(', ')} } from '${specifier}'`

const pinned = (packageName, version, path) =>
    `https://cdn.jsdelivr.net/npm/${packageName}@${version}/${path}`

export async function generateReference({
    slug,
    documentation,
    browserRoots,
    browserAbsent = [],
    guidance,
    reexportGuidance,
    examples,
}) {
    const pkg = await json('package.json')
    let sourceRef
    try {
        const git = (...args) =>
            execFileSync('git', args, {
                cwd: root,
                encoding: 'utf8',
                stdio: ['ignore', 'pipe', 'ignore'],
            }).trim()
        if (resolve(git('rev-parse', '--show-toplevel')) === root) {
            sourceRef = git('rev-parse', 'HEAD')
        }
    } catch {
        // The source archive can be built without Git.
    }
    const paths = pkg.exports
    const declarations = readDeclarations(resolve(paths.types))
    const hadElement = 'HTMLElement' in globalThis
    const priorElement = globalThis.HTMLElement
    globalThis.HTMLElement ??= class HTMLElement {}
    let esm, cjs
    try {
        esm = await import(pathToFileURL(resolve(paths.import)).href)
        cjs = createRequire(import.meta.url)(resolve(paths.require))
    } finally {
        if (hadElement) globalThis.HTMLElement = priorElement
        else delete globalThis.HTMLElement
    }
    assert.deepEqual(
        Object.keys(esm).sort(),
        Object.keys(cjs).sort(),
        'ESM and CJS exports differ'
    )
    const runtime = new Set(Object.keys(esm))
    const win = { BFS: { untouched: true } }
    const scriptPath = 'dist/client.js'
    runInNewContext(await readFile(scriptPath, 'utf8'), {
        window: win,
        HTMLElement: class HTMLElement {},
    })
    assert.equal(
        win.BFS.untouched,
        true,
        'The client replaced other BFS namespaces'
    )
    const globals = symbolPaths(win.BFS, browserRoots)
    assert.deepEqual(
        Object.keys(globals).sort(),
        [...runtime].filter((name) => !browserAbsent.includes(name)).sort(),
        'Unexpected browser omissions or exports'
    )
    const accepted = new Map(
        [...declarations].map(([name, entry]) => [
            name,
            { ...entry, typeOnly: !runtime.has(name) },
        ])
    )
    assert(
        [...runtime].every((name) => accepted.has(name)),
        'Runtime export missing declarations'
    )

    const script = {
        package: pkg.name,
        version: pkg.version,
        path: scriptPath,
    }
    const routes = new Set(
        Object.values((await json('docs/locale/en.json'))._routes)
    )
    const referenceBase = pinned(pkg.name, pkg.version, 'ai/')
    const repository = pkg.repository.url.replace(/\.git$/, '')
    const out = resolve('ai')
    await rm(out, { recursive: true, force: true })
    await mkdir(join(out, 'records'), { recursive: true })
    await mkdir(join(out, 'examples'), { recursive: true })

    const catalog = Object.keys(guidance)
    for (const name of catalog) {
        assert(accepted.has(name), `Stale editorial guidance for ${name}`)
    }
    for (const [name, descriptor] of Object.entries(examples)) {
        const { body, names, markup } = descriptor
        assert(
            names.every((key) => globals[key]),
            `Invalid classic names: ${name}`
        )
        const npm = `${npmImport(names, pkg.name)}\n\n${body}`
        validateExampleImports(npm, accepted, pkg.name, name)
        const classic = browserCode(names, globals, body)
        new Script(classic, { filename: `${name}.js` })
        await writeFile(join(out, 'examples', `${name}.js`), npm)
        await writeFile(
            join(out, 'examples', `${name}.html`),
            `<!doctype html>
<html lang="en">
    <meta charset="utf-8" />
    <title>${descriptor.title}</title>
    <script src="${pinned(pkg.name, pkg.version, scriptPath)}"></script>
    ${markup}
    <script>
${classic}
    </script>
</html>
`
        )
    }

    const index = {
        schemaVersion: 1,
        package: pkg.name,
        version: pkg.version,
        repository,
        ...(sourceRef && { sourceRef }),
        referenceUrl: `${referenceBase}index.json`,
        exports: { [pkg.name]: [...accepted.keys()].sort() },
        runtimeExports: [...runtime].sort(),
        classic: { scripts: [script], globals: Object.values(globals).sort() },
        records: [],
    }
    for (const [name, facts] of [...accepted].sort(([a], [b]) =>
        a.localeCompare(b)
    )) {
        const authored = guidance[name] ?? reexportGuidance?.(name, facts)
        assert(authored, `Missing editorial guidance for ${name}`)
        const { typeOnly, ownerFile, ...publicFacts } = facts
        const id = `${slug}/${name}`
        const path = `records/${name}.json`
        const {
            summary,
            notes,
            keywords = [],
            docs,
            fixture,
            body,
            reexportOf,
        } = authored
        const names = fixture
            ? examples[fixture]?.names
            : (authored.names ?? [name])
        assert(names?.includes(name), `Example must use ${name}: ${id}`)
        assert(
            names.every((key) => accepted.has(key)),
            `Invalid or missing names: ${id}`
        )
        const npm = {
            import: npmImport(names, pkg.name, typeOnly),
            specifier: pkg.name,
            names,
            ...(typeOnly && { typeOnly }),
        }
        const hasClassic = names.every((key) => globals[key])
        const classic = hasClassic
            ? { scripts: [script], globals: names.map((key) => globals[key]) }
            : undefined
        const example = {}
        if (fixture) {
            const npmPath = `examples/${fixture}.js`
            const classicPath = `examples/${fixture}.html`
            await readFile(join(out, npmPath))
            await readFile(join(out, classicPath))
            example.npm = { path: npmPath, markup: examples[fixture].markup }
            example.classic = { path: classicPath }
        } else {
            assert(body, `Missing minimal example: ${id}`)
            example.npm = `${npm.import}\n\n${body}`
            validateExampleImports(example.npm, accepted, pkg.name, id)
            if (classic) {
                example.classic = browserCode(names, globals, body)
                new Script(example.classic, { filename: `${name}.js` })
            }
        }

        const links = [
            {
                label: 'Release declaration',
                url: pinned(
                    reexportOf?.package ?? pkg.name,
                    reexportOf?.version ?? pkg.version,
                    reexportOf
                        ? ownerFile
                              .split('/node_modules/')
                              .at(-1)
                              .replace(`${reexportOf.package}/`, '')
                        : `dist/types/${ownerFile.split('/dist/types/').at(-1) ?? basename(ownerFile)}`
                ),
            },
        ]
        if (docs) {
            assert(
                routes.has(docs),
                `Unresolved documentation route: ${id} (${docs})`
            )
            links.push({
                label: 'Documentation',
                url: `${documentation}${docs}`,
            })
        }
        if (reexportOf) {
            links.push({
                label: 'Markup guide',
                url: 'https://markup.beforesemicolon.com/documentation/guide',
            })
        }

        await writeJson(join(out, path), {
            schemaVersion: 1,
            id,
            package: pkg.name,
            version: pkg.version,
            name,
            summary,
            setup: { npm, ...(classic && { classic }) },
            api: {
                ...publicFacts,
                ...(notes && { notes }),
                ...(reexportOf && { reexportOf }),
            },
            example,
            links,
        })
        index.records.push({ id, name, summary, path, keywords })
    }
    assert.equal(index.records.length, accepted.size)
    await writeJson(join(out, 'index.json'), index)
}
