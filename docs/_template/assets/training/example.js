const target = document.getElementById('example')
const step = new URLSearchParams(location.search).get('step')

async function start() {
    if (!/^(0[1-9]|1[0-2])$/.test(step)) {
        target.textContent = 'Open a lesson to run its example.'
        return
    }
    try {
        const { default: mount } = await import(`./steps/${step}.js`)
        target.replaceChildren()
        await mount(target)
    } catch {
        target.textContent =
            'The example could not load. Reload this page to try again.'
    }
}

start()
