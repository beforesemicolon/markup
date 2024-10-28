export default () => `
<script type="application/javascript">
    // handle all possible copy snippet code button on the page
    // this implementation is in sync with CodeSnippet partial
    document.querySelectorAll('.code-copy-btn').forEach((copyBtn) => {
        let timer
        if (copyBtn) {
            // the code is inside the "pre" tag right before the button
            const code = copyBtn.previousElementSibling.textContent

            // no code, no copy button
            if (code.trim().length) {
                copyBtn.style.visibility = 'visible'
                copyBtn.addEventListener('click', () => {
                    clearTimeout(timer)
                    navigator.clipboard.writeText(code.trim())
                    copyBtn.textContent = 'copied'
                    copyBtn.classList.add('copied')
                    timer = setTimeout(() => {
                        copyBtn.textContent = 'copy'
                        copyBtn.classList.remove('copied')
                    }, 1000)
                })
            }
        }
    })
</script>
`
