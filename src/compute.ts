export const compute = <T>(cb: T) => {
    if (typeof cb !== 'function') {
        throw new Error('compute value must be a function')
    }
    
    return ((...args: unknown[]) => {
        return () => cb(...args)
    })
}

