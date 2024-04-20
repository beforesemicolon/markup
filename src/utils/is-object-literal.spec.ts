import { isObjectLiteral } from './is-object-literal'
import { html } from '../html'
import { when } from "../helpers";

describe('isObjectLiteral', () => {
    it('should be object', () => {
        expect(isObjectLiteral({})).toBeTruthy()
        expect(isObjectLiteral(new Object({}))).toBeTruthy()
        expect(isObjectLiteral(Object.create(null))).toBeTruthy()
        expect(isObjectLiteral(Object.create({sample: 12}))).toBeTruthy()
    })

    it('should NOT be object', () => {
        expect(isObjectLiteral(null)).toBeFalsy()
        expect(isObjectLiteral(html`sample`)).toBeFalsy()
        expect(isObjectLiteral(when(true, 12))).toBeFalsy()
        expect(isObjectLiteral(new Map())).toBeFalsy()
        expect(isObjectLiteral(new Set())).toBeFalsy()
        expect(isObjectLiteral(String(''))).toBeFalsy()
        expect(isObjectLiteral(Number(1))).toBeFalsy()
        expect(isObjectLiteral([])).toBeFalsy()
        expect(isObjectLiteral(new Function())).toBeFalsy()
        expect(isObjectLiteral(Symbol())).toBeFalsy()
        expect(isObjectLiteral(new (class Sample{}))).toBeFalsy()
    })
})
