import { DynamicValue } from '../types'
import { val } from './val'
import { setElementAttribute } from './set-element-attribute'

export function handleAttributeDynamicValue(dv: DynamicValue<Array<unknown>>) {
    const newData = val(dv.value[0])

    if (newData !== dv.data) {
        dv.data = newData

        setElementAttribute(dv.renderedNodes[0] as Element, dv.name, newData)
    }
}
