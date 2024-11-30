import {suspense} from "./suspense.ts";
import {html} from "../html.ts";

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
	
	it('should unmounted suspense render content', (done) => {
		const unmountMock = jest.fn();
		
		const temp = html`${suspense(() => new Promise((res, rej) => {
			res(html`done`.onMount(() => unmountMock))
			setTimeout(() => {
				expect(document.body.innerHTML).toBe('done')
				temp.unmount()
				expect(unmountMock).toHaveBeenCalledTimes(2)
				done()
			}, 1000)
		}))}`
			.onMount(() => unmountMock)
			.render(document.body)
		
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
	
	it('should take anything', (done) => {
		html`${suspense(() => new Promise((res, rej) => {
			res(null)
			setTimeout(() => {
				expect(document.body.innerHTML).toBe('null')
				done()
			}, 0)
		}))}`.render(document.body)
		
		expect(document.body.innerHTML).toBe('<p>loading...</p>')
	})
})
