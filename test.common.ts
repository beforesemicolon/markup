beforeEach(() => {
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
        const id = Math.random()
        cb(id)
        return id
    })
    document.body.innerHTML = ''
})

afterEach(() => {
    ;(window.requestAnimationFrame as jest.Mock)?.mockRestore?.()
    jest.clearAllMocks()
})
