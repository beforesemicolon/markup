export default () => `
<script type="application/javascript">
    // handle all possible copy snippet code button on the page
    // this implementation is in sync with CodeSnippet partial
    document.querySelectorAll('.code-copy-btn').forEach((copyBtn) => {
        const snippet = copyBtn.closest('.code-snippet')
        const hasCode = snippet?.dataset.code || snippet?.querySelector('code') || snippet?.querySelector('.content')
        if (hasCode) {
            copyBtn.style.visibility = 'visible'
        }
    })

    document.addEventListener('click', (e) => {
        const copyBtn = e.target.closest('.code-copy-btn')
        if (!copyBtn) return

        const snippet = copyBtn.closest('.code-snippet')
        if (!snippet) return

        let code = snippet.dataset.code ?? ''

        if (!code) {
            const codeEl = snippet.querySelector('code')
            if (codeEl) {
                const clone = codeEl.cloneNode(true)
                clone.querySelectorAll('.line-number').forEach(el => el.remove())
                code = clone.textContent ?? ''
            }
        }

        if (!code) {
            code = snippet.querySelector('.content')?.textContent ?? ''
        }

        // no code, no copy button
        if (code.trim().length) {
            clearTimeout(copyBtn._timer)
            navigator.clipboard.writeText(code.trim())
            copyBtn.textContent = 'copied'
            copyBtn.classList.add('copied')
            copyBtn._timer = setTimeout(() => {
                copyBtn.textContent = 'copy'
                copyBtn.classList.remove('copied')
            }, 1000)
        }
    })
</script>
`
