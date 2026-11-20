// Install the three pinned dependencies listed in lesson 11, then run:
// node print-playlist.mjs tracks.json
import 'global-jsdom/register'
import { readFile, writeFile } from 'node:fs/promises'
import { html, repeat } from '@beforesemicolon/markup'

const [catalogPath = 'tracks.json', outputPath = 'playlist.html', siteRoot] =
    process.argv.slice(2)
const tracks = JSON.parse(await readFile(catalogPath, 'utf8'))
const defaultSite = 'https://markup.beforesemicolon.com'

function trackLink(track) {
    const url = new URL(
        track.src,
        siteRoot && siteRoot !== '.' ? siteRoot : defaultSite
    )
    // Build with "." to keep media links on the current documentation host.
    const href = siteRoot === '.' ? url.pathname : url.href
    return html`<li>
        <h2><a href="${href}">${track.title}</a></h2>
        <p>${track.artist}</p>
        <p>${track.notes}</p>
    </li>`
}

const list = html`<main>
    <h1>Listening guide</h1>
    <ol>
        ${repeat(tracks, trackLink, { key: (track) => track.id })}
    </ol>
</main>`

const page = `<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Listening guide</title>
</head>
<body>${list.toString()}</body>
</html>
`
await writeFile(outputPath, page)
console.log(`Wrote ${tracks.length} tracks to ${outputPath}.`)
