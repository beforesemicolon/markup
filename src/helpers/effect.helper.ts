import { helper } from '../Helper'

/**
 * renders the last param value based on the changes of any state provided before it
 */
export const effect = helper((...st: Array<unknown>) => st.at(-1))
