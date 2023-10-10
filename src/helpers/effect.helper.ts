import { helper } from '../helper'

export const effect = helper((...st: Array<unknown>) => st.at(-1))
