const HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml'
const TEXT_ELEMENTS = new Set([
    'script',
    'style',
    'xmp',
    'iframe',
    'noembed',
    'noframes',
    'noscript',
    'textarea',
    'title',
])

const assertSerializable = (root: Node) => {
    const walker = root.ownerDocument!.createTreeWalker(
        root,
        NodeFilter.SHOW_ELEMENT |
            NodeFilter.SHOW_COMMENT |
            NodeFilter.SHOW_PROCESSING_INSTRUCTION
    )

    for (let node: Node | null = root; node; node = walker.nextNode()) {
        if (node.nodeType === Node.PROCESSING_INSTRUCTION_NODE) {
            throw new Error('Cannot serialize processing instructions as HTML.')
        }
        if (node.nodeType === Node.COMMENT_NODE) {
            // DOM-created comments can contain delimiters that the HTML parser
            // would interpret as the end of the comment on a subsequent parse.
            if (/^>|^->|<!--|-->|--!>|<!-$/.test(node.nodeValue ?? '')) {
                throw new Error('Cannot serialize an invalid HTML comment.')
            }
            continue
        }
        if (node.nodeType !== Node.ELEMENT_NODE) continue

        const element = node as Element
        if (element.namespaceURI !== HTML_NAMESPACE) continue
        const name = element.localName
        if (name === 'plaintext') {
            throw new Error(
                'Cannot serialize <plaintext>: it has no closing tag.'
            )
        }
        if (TEXT_ELEMENTS.has(name)) {
            // Native HTML serialization emits raw-text contents verbatim, and
            // RCDATA elements can contain DOM-inserted comments/elements. Validate
            // the complete serialized contents so adjacent nodes cannot split
            // a closing tag, and do not clone or modify live custom elements.
            const content = element.innerHTML
            if (
                content.toLowerCase().includes(`</${name}`) ||
                (name === 'script' && /<!--|<script/i.test(content))
            ) {
                throw new Error(
                    `Cannot serialize unsafe content inside <${name}>. ` +
                        'For JSON data, escape "<" as "\\u003c" after JSON.stringify().'
                )
            }
        }
        if (name === 'template') {
            assertSerializable((element as HTMLTemplateElement).content)
        }
    }
}

const escapeText = (text: string) =>
    text
        .replace(/&/g, '&amp;')
        .replace(/\u00a0/g, '&nbsp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')

export const serializeHTML = (nodes: Iterable<Node>): string => {
    const output: string[] = []
    for (const node of nodes) {
        assertSerializable(node)
        switch (node.nodeType) {
            case Node.ELEMENT_NODE:
                output.push((node as Element).outerHTML)
                break
            case Node.TEXT_NODE:
            case Node.CDATA_SECTION_NODE:
                output.push(escapeText(node.nodeValue ?? ''))
                break
            case Node.COMMENT_NODE:
                output.push(`<!--${node.nodeValue ?? ''}-->`)
                break
            default:
                throw new Error(`Cannot serialize node type ${node.nodeType}.`)
        }
    }
    return output.join('')
}
