export function createAndRenderTextNode(
    value: unknown,
    parentNode: HTMLElement | DocumentFragment | Element
) {
    const node = document.createTextNode(String(value))
    parentNode.appendChild(node)
    return node
}
