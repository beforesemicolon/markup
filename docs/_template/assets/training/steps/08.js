import { createCatalog } from './07.js'

const { html, element, unsafeHTML, visible, pick, when } = window.BFS.MARKUP

export function createNotesPlayer() {
    const player = createCatalog()
    const label = element('span', { textContent: 'Track notes' })
    // The icon is authored here. Track notes from the catalog remain text.
    const icon = unsafeHTML(
        '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16">' +
            '<path fill="currentColor" d="M6 2h7v7a2 2 0 1 1-1-1.7V4H7v7a2 2 0 1 1-1-1.7z"/>' +
            '</svg>'
    )
    const notes = () => html`
        <p>
            ${when(player.current, pick(player.current, 'notes'), 'Select a track to read its notes.')}
        </p>
    `
    return html`
        ${player.view}
        <details>
            <summary>${icon} ${label}</summary>
            ${visible(notes, html`<p>Loading notes…</p>`, { rootMargin: '32px' })}
        </details>
    `
}

export default function mount(target) {
    return createNotesPlayer().render(target)
}
