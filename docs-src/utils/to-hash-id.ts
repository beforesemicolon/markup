export const toHashId = (str: string) =>
    str
        .toLowerCase()
        .replace(/[^0-9a-z-\s]/gi, '')
        .replace(/\s+/g, '-')
