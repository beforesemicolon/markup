jest.mock('./html.ts', () => jest.requireActual('./html-v2.ts'))

require('./html.spec.ts')
