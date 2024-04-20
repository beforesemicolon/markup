import { ObjectLiteral } from '../types'

export const isObjectLiteral = (val: unknown) => {
    return (
        val &&
        Object.prototype.toString.call(val) === '[object Object]' &&
        ((val as ObjectLiteral).constructor === Object ||
            Object.getPrototypeOf(val) === null)
    )
}
