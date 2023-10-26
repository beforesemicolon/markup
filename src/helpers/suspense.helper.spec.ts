import {suspense} from "./suspense.helper";
import {html} from "../html";

describe('suspense', () => { // @ts-ignore
	
	beforeEach(() => {
		document.body.innerHTML = ''
	})
	
	it('should handle suspense with defaults', (done) => {
		html`${suspense(() => new Promise((res, rej) => {
			res(html`done`)
			setTimeout(() => {
				expect(document.body.innerHTML).toBe('done')
				done()
			}, 0)
		}))}`.render(document.body)
		
		expect(document.body.innerHTML).toBe('<p>loading...</p>')
	})
	
	it('should throw error if action failed', (done) => {
		html`${suspense(() => new Promise((res, rej) => {
			rej(new Error('failed'))
			setTimeout(() => {
				expect(document.body.innerHTML).toBe('<p style="color: red">failed</p>')
				done()
			}, 0)
		}))}`.render(document.body)
		
		expect(document.body.innerHTML).toBe('<p>loading...</p>')
	})
	
	it('should throw error return non-html result', (done) => {
		html`${suspense(() => new Promise((res, rej) => {
			// @ts-ignore
			res(null)
			setTimeout(() => {
				expect(document.body.innerHTML).toBe('<p style="color: red">async action did not return a "html`...`" instance</p>')
				done()
			}, 0)
		}))}`.render(document.body)
		
		expect(document.body.innerHTML).toBe('<p>loading...</p>')
	})
})
