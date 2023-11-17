import { html, repeat } from '../../src'
import { toHashId } from '../utils/to-hash-id'

interface Group {
    name: string
    titles: {
        title: string
        thumbnail: string
        link: string
        description: string
    }[]
}

export const PlaylistContent = (list: Group[]) => {
    return html`
        <div class="content-player">
            ${repeat(list, (g) => {
                return html`
                    ${repeat(
                        g.titles,
                        (t) =>
                            html`<div
                                class="current-content"
                                id="${toHashId(t.title)}"
                            >
                                ${t.title}
                            </div>`
                    )}
                `
            })}
            <ol>
                ${repeat(list, (g) => {
                    return html`<li>
                        <strong>${g.name}</strong>
                        <ul>
                            ${repeat(
                                g.titles,
                                (t) =>
                                    html`<li>
                                        <a href="#${toHashId(t.title)}"
                                            >${t.title}</a
                                        >
                                    </li>`
                            )}
                        </ul>
                    </li>`
                })}
            </ol>
        </div>
    `
}
