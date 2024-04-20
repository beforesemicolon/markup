import { isObjectLiteral } from './is-object-literal'
import { ObjectLiteral } from '../types'

export const shallowCopyArrayOrObjectLiteral = (obj: unknown) => {
    if (Array.isArray(obj)) {
        return [...obj]
    }

    if (isObjectLiteral(obj)) {
        return { ...(obj as ObjectLiteral) }
    }

    return obj
}
