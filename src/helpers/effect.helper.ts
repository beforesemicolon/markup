import { helper } from '../Helper'
import { val } from '../utils'

/**
 * renders the last param value based on the changes of any state provided before it
 */
export const effect = helper(<T>(...st: Array<unknown>) => val(st.at(-1)) as T)
