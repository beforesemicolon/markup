import { DynamicValueResolver } from './DynamicValueResolver'
import { setElementAttribute, val } from '../utils'

export class AttributeDynamicValueResolver extends DynamicValueResolver<
    unknown[],
    unknown
> {
    resolve() {
        const newData = val(this.value[0])

        if (newData !== this.data) {
            this.data = newData

            setElementAttribute(
                this.renderedNodes[0] as Element,
                this.name,
                newData
            )
        }
    }
}
