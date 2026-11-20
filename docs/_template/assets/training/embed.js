for (const example of document.querySelectorAll('[data-training-step]')) {
    const link = example.querySelector('a')
    const frame = document.createElement('iframe')
    frame.src = link.href
    frame.title = link.textContent.trim()
    frame.width = '100%'
    frame.height = '240'
    frame.loading = 'lazy'
    frame.setAttribute('frameborder', '0')

    // Keep the live result in the article's reading flow as controls and queues change.
    frame.addEventListener('load', () => {
        const content = frame.contentDocument?.body
        if (!content) return
        const fit = () => {
            frame.height = String(
                Math.ceil(content.getBoundingClientRect().height) + 2
            )
        }
        fit()
        const observer = new ResizeObserver(fit)
        observer.observe(content)
        frame.contentWindow.addEventListener(
            'pagehide',
            () => observer.disconnect(),
            { once: true }
        )
    })
    example.prepend(frame)
}
