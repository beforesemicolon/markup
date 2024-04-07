import { DynamicValue, DynamicValueType } from '../types'
import { handleAttributeDynamicValue } from './handle-attribute-dynamic-value'
import { handleDirectiveDynamicValue } from './handle-directive-dynamic-value'
import { handleEventDynamicValue } from './handle-event-dynamic-value'
import { handleContentDynamicValue } from './handle-content-dynamic-value'

export const handleDynamicValue = (
    dv: DynamicValue,
    refs: Record<string, Set<Element>>
) => {
    switch (dv.type) {
        case DynamicValueType.Content:
            return handleContentDynamicValue(dv, refs)
        case DynamicValueType.Attribute:
            return handleAttributeDynamicValue(
                dv as DynamicValue<Array<unknown>>
            )
        case DynamicValueType.Directive:
            return handleDirectiveDynamicValue(
                dv as DynamicValue<Array<unknown>, string>
            )
        case DynamicValueType.Event:
            return handleEventDynamicValue(dv as DynamicValue<Array<unknown>>)
    }
}
