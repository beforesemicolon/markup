type MovingParent = Node & {
    moveBefore?: (node: Node, reference: Node | null) => void
}

const activeElement = (document: Document): Element | null => {
    let active = document.activeElement
    while (active?.shadowRoot?.activeElement) {
        active = active.shadowRoot.activeElement
    }
    return active
}

const contains = (nodes: readonly Node[], target: Node | null): boolean => {
    while (target) {
        if (nodes.some((node) => node.contains(target))) return true
        const root = target.getRootNode()
        target = root instanceof ShadowRoot ? root.host : null
    }
    return false
}

const preserveInteraction = (nodes: readonly Node[], parent: Node) => {
    const document = parent.ownerDocument
    if (
        !document ||
        !parent.isConnected ||
        !nodes.some(
            (node) => node.isConnected && node.ownerDocument === document
        )
    )
        return

    const focused = activeElement(document)
    const active = contains(nodes, focused) ? focused : null
    const input = active as HTMLInputElement | HTMLTextAreaElement | null
    const inputSelection =
        input &&
        typeof input.setSelectionRange === 'function' &&
        input.selectionStart !== null
            ? ([
                  input.selectionStart,
                  input.selectionEnd,
                  input.selectionDirection ?? undefined,
              ] as const)
            : null
    const focusedRoot = focused?.getRootNode() as
        (Node & { getSelection?: () => Selection | null }) | undefined
    const selection = focusedRoot?.getSelection?.() ?? document.getSelection()
    const selected =
        selection?.anchorNode &&
        selection.focusNode &&
        (contains(nodes, selection.anchorNode) ||
            contains(nodes, selection.focusNode))
            ? {
                  anchor: selection.anchorNode,
                  anchorOffset: selection.anchorOffset,
                  focus: selection.focusNode,
                  focusOffset: selection.focusOffset,
              }
            : null

    if (!active && !selected) return

    return () => {
        if (active?.isConnected) {
            const current = activeElement(document)
            if (current !== active) {
                // A lifecycle callback may intentionally focus another control.
                // Only repair the browser's focus reset caused by detachment.
                if (
                    current &&
                    current !== document.body &&
                    current !== document.documentElement
                )
                    return
                if ('focus' in active && typeof active.focus === 'function') {
                    active.focus({ preventScroll: true })
                }
                if (activeElement(document) !== active) return
            }
            if (inputSelection) {
                if (input && input.selectionStart !== null) {
                    input.setSelectionRange(...inputSelection)
                }
                // Document Selection can include the input's containing row.
                // Restoring it would overwrite the control's own selection.
                return
            }
        }

        if (selected?.anchor.isConnected && selected.focus.isConnected) {
            selection?.setBaseAndExtent(
                selected.anchor,
                Math.min(
                    selected.anchorOffset,
                    selected.anchor instanceof CharacterData
                        ? selected.anchor.length
                        : selected.anchor.childNodes.length
                ),
                selected.focus,
                Math.min(
                    selected.focusOffset,
                    selected.focus instanceof CharacterData
                        ? selected.focus.length
                        : selected.focus.childNodes.length
                )
            )
        }
    }
}

/** Move an existing range without staging connected nodes in a fragment. */
export const moveNodesBefore = (
    nodes: readonly Node[],
    parent: Node,
    reference: Node | null
): void => {
    if (
        !nodes.length ||
        nodes.includes(reference as Node) ||
        nodes.every(
            (node, index) =>
                node.parentNode === parent &&
                node.nextSibling === (nodes[index + 1] ?? reference)
        )
    )
        return

    const target = parent as MovingParent
    const root = parent.getRootNode({ composed: true })
    const canMove = (node: Node) =>
        typeof target.moveBefore === 'function' &&
        node.parentNode !== null &&
        (node.nodeType === Node.ELEMENT_NODE ||
            node instanceof CharacterData) &&
        node.getRootNode({ composed: true }) === root
    // Native moves preserve focus, but live Range endpoints can still change.
    const restore = preserveInteraction(nodes, parent)

    try {
        for (const node of nodes) {
            if (node.parentNode === parent && node.nextSibling === reference)
                continue
            if (canMove(node)) target.moveBefore!(node, reference)
            else parent.insertBefore(node, reference)
        }
    } finally {
        try {
            restore?.()
        } catch {
            // Reconnection/focus callbacks can change selection or focusability.
            // Best-effort restoration must not interrupt DOM reconciliation or
            // hide an exception from the move itself.
        }
    }
}
