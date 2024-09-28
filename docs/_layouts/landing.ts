import { PageProps } from '../../build-scripts/docs/types'
import meta from './_head-meta'
import header from './_header'
import footer from './_footer'

export default (props: PageProps) => `
<!doctype html>
<html lang="en">
    <head>
        ${meta(props)}
        <link rel="stylesheet" href="./stylesheets/landing.css">
        <link rel="stylesheet" href="./stylesheets/github-dark.hightlighter.css">
    </head>
    <body>
        ${header()}
        
        <main class="wrapper">
            ${props.content}
        </main>
        
        ${footer()}
        
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
    </body>
</html>
`
