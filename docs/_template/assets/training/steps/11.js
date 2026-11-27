const { html } = window.BFS.MARKUP

export default async function mount(target) {
    const url = '/assets/training/print/playlist.html'
    const response = await fetch(url)
    if (!response.ok) throw new Error('The printable playlist could not load.')
    const page = new DOMParser().parseFromString(
        await response.text(),
        'text/html'
    )
    const list = page.querySelector('main ol')
    if (!list)
        throw new Error('The printable playlist is missing its track list.')

    // This list came from the Node export. The linked HTML also works with JS off.
    return html`
        <h3>Listening guide</h3>
        ${document.importNode(list, true)}
        <p>
            <a href="${url}" target="_blank" rel="noopener"
                >Open printable playlist</a
            >
        </p>
    `.render(target)
}
