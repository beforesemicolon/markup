export const escapeHTML = (value) =>
    value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')

export const highlightLine = (line) => {
    const tokens = []
    const regex =
        /(\/\/.*$)|(`[^`]*`|'[^']*'|"[^"]*")|(<\/?[a-zA-Z][\w-]*)|(\b(?:const|let|var|function|return|import|from|export|new|class|if|else|extends|static|async|await|try|catch)\b|=>)|(\$\{[^}]*\}|\{[^{}]*\})|([a-zA-Z-]+)(?==)/g
    let lastIndex = 0
    let match

    while ((match = regex.exec(line)) !== null) {
        if (match.index > lastIndex) {
            tokens.push(escapeHTML(line.slice(lastIndex, match.index)))
        }

        const value = escapeHTML(match[0])

        if (match[1]) {
            tokens.push(`<span class="syntax-comment">${value}</span>`)
        } else if (match[2]) {
            tokens.push(`<span class="syntax-string">${value}</span>`)
        } else if (match[3]) {
            tokens.push(`<span class="syntax-tag">${value}</span>`)
        } else if (match[4]) {
            tokens.push(`<span class="syntax-keyword">${value}</span>`)
        } else if (match[5]) {
            tokens.push(`<span class="syntax-expression">${value}</span>`)
        } else if (match[6]) {
            tokens.push(`<span class="syntax-attr">${value}</span>`)
        }

        lastIndex = match.index + match[0].length
    }

    if (lastIndex < line.length) {
        tokens.push(escapeHTML(line.slice(lastIndex)))
    }

    return tokens.join('')
}

export const renderCodeBlock = (filename, code, lang = 'javascript') => {
    const lines = code
        .replace(/\n$/, '')
        .split('\n')
        .map((line, index) => {
            const highlightedLine = line ? highlightLine(line) : ' '

            return `<span class="code-line"><span class="line-number">${index + 1}</span><span class="line-code">${highlightedLine}</span></span>`
        })
        .join('')

    return `
    <div class="code-snippet" data-code="${escapeHTML(code.replace(/\n$/, ''))}">
        <div class="header">
            <div class="mac-dots">
                <span class="dot-red"></span>
                <span class="dot-yellow"></span>
                <span class="dot-green"></span>
            </div>
            <div class="filename">${filename}</div>
            <div class="label">${lang}</div>
            <button class="code-copy-btn" aria-label="Copy code">copy</button>
        </div>
        <div class="content">
            <pre><code class="hljs language-${lang}">${lines}</code></pre>
        </div>
    </div>
    `
}
