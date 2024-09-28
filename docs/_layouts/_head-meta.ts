import { PageProps } from '../../build-scripts/docs/types'

export default ({ title, description, name, path }: PageProps) => `
<meta charset="UTF-8" />
<meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
/>
<meta name="description" content="${description}" />
<title>${title}</title>
<meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
/>
<meta http-equiv="X-UA-Compatible" content="ie=edge" />
<title>${title}</title>
<meta name="description" content="${description}" />
<meta property="og:title" content="${title}" />
<meta property="og:type" content="website" />
<meta property="og:description" content="${description}" />
<meta
    property="og:image"
    content="https://markup.beforesemicolon.com/assets/markup-banner.jpg"
/>
<meta
    property="og:url"
    content="https://markup.beforesemicolon.com${path}"
/>
<meta property="og:site_name" content="${name}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@MarkupJs" />
<meta name="twitter:title" content="${title}" />
<meta
    name="twitter:image"
    content="https://markup.beforesemicolon.com/assets/markup-banner.jpg"
/>
<meta name="twitter:description" content="${description}" />
<meta name="twitter:image:alt" content="${title}" />
<link
    rel="apple-touch-icon"
    sizes="180x180"
    href="/assets/favicon/apple-touch-icon.png"
/>
<link
    rel="icon"
    type="image/png"
    sizes="32x32"
    href="/assets/favicon/favicon-32x32.png"
/>
<link
    rel="icon"
    type="image/png"
    sizes="16x16"
    href="/assets/favicon/favicon-16x16.png"
/>
<link
    rel="manifest"
    href="/assets/favicon/site.webmanifest"
/>
<link
    rel="icon"
    type="image/x-icon"
    href="/assets/favicon/favicon.ico"
/>

`
