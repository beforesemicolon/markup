const { html } = window.BFS.MARKUP

export default function mount(target) {
    const track = {
        title: 'Harbor Lights',
        artist: 'Course Studio',
        src: '/assets/training/media/harbor.mp3',
    }

    return html`
        <h2>${track.title}</h2>
        <p>${track.artist}</p>
        <audio controls preload="metadata" src="${track.src}"></audio>
    `.render(target)
}
