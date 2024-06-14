export const waitFor = async <T>(
    cb: () => Promise<T> | T,
    timeout = 0
): Promise<T> => {
    return new Promise((res) =>
        setTimeout(async () => {
            const result = await cb()
            await new Promise(process.nextTick)
            res(result)
        }, timeout)
    )
}
export const wait = async (ms = 0) => {
    await waitFor(
        () =>
            new Promise((res) => {
                setTimeout(res, ms)
            })
    )
}

export const act = async (cb: () => void) => {
    cb()
    await wait()
}
