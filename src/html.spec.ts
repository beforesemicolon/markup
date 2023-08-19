import {html, HtmlTemplate} from "./html";
import {when, repeat} from "./helpers";

describe("html", () => {
	beforeEach(() => {
		document.body.innerHTML = "";
	})

	it('should parse text injected inside element', () => {
		const count = 12;
		const temp = html`<h1>sample (${count})</h1>`;

		temp.render(document.body);

		expect(document.body.innerHTML).toBe('<h1>sample (12)</h1>');
	});
	
	it('should render static text', () => {
		const temp = html`sample`;

		temp.render(document.body);

		expect(document.body.innerHTML).toBe('sample');
	});
	
	it('should render html as text', () => {
		const htmlString = '<p>sample</p>'
		const temp = html`${htmlString}`;
		
		temp.render(document.body);
		
		expect(document.body.innerHTML).toBe('&lt;p&gt;sample&lt;/p&gt;');
	});
	
	it('should render html as HTML', () => {
		// @ts-ignore
		const htmlString = html(['<p>sample</p>'])
		const temp = html`${htmlString}`;
		
		temp.render(document.body);
		
		expect(document.body.innerHTML).toBe('<p>sample</p>');
	});

	it('should render dynamic text and update', () => {
		let x = 15;

		const temp = html`${() => x > 10 ? "more than 10" : "less than 10"}`;

		temp.render(document.body);

		expect(document.body.innerHTML).toBe('more than 10');

		x = 5;

		temp.update();

		expect(document.body.innerHTML).toBe('less than 10');
	});
	
	it('should render a growing list of items', () => {
		let list: HtmlTemplate[] = [];
		
		const app = html`${() => list}`;
		
		app.render(document.body);
		
		expect(document.body.innerHTML).toBe("");
		
		list.push(html`<div>one</div>`)

		app.update();

		expect(document.body.innerHTML).toBe("<div>one</div>");

		list.push(html`<div>two</div>`)

		app.update();
		
		expect(document.body.innerHTML).toBe("<div>one</div><div>two</div>");
	});
	
	it('should force to render in a different place', () => {
		const page = html`
		  <h1>Page Title</h1>
		  <p>Page description</p>
		  <button>Page CTA Action</button>
		`;
		
		page.render(document.body);
		
		expect(document.body.innerHTML).toBe('<h1>Page Title</h1>\n' +
			'\t\t  <p>Page description</p>\n' +
			'\t\t  <button>Page CTA Action</button>')
		
		const wrapper = document.createElement('div');
		wrapper.className = "wrapper"
		document.body.appendChild(wrapper);
		
		page.render(wrapper);
		
		expect(document.body.innerHTML).toBe('<h1>Page Title</h1>\n' +
			'\t\t  <p>Page description</p>\n' +
			'\t\t  <button>Page CTA Action</button><div class="wrapper"></div>')
		
		page.render(wrapper, true);
		
		expect(document.body.innerHTML).toBe('<div class="wrapper"><h1>Page Title</h1>\n' +
			'\t\t  <p>Page description</p>\n' +
			'\t\t  <button>Page CTA Action</button></div>')
	});
	
	it('should render src', () => {
		const button = html`<button>click me</button>`;

		button.render(document.body);

		expect(document.body.innerHTML).toBe('<button>click me</button>');
	});

	it('should render src with dynamic attr value', () => {
		let type = "button"
		const button = html`<button type="${() => type}">click me</button>`;

		button.render(document.body);

		expect(document.body.innerHTML).toBe('<button type="button">click me</button>');

		type = "submit";

		button.update();

		expect(document.body.innerHTML).toBe('<button type="submit">click me</button>');
	});

	it('should render dynamic src', () => {
		let value = "sample";
		let edit = false;
		const val = html`${() => edit ? html`<input type="text" value="${value}"/>` : html`<p>${value}</p>`}`;

		val.render(document.body);

		expect(document.body.innerHTML).toBe('<p>sample</p>');

		edit = true;

		val.update();

		expect(document.body.innerHTML).toBe('<input type="text" value="sample">');
	});

	it('should render nested from values', () => {
		const button = html`
	    <button>
	      click me
	    </button>
	  `;
		const app = html`
			<h2>App</h2>
			${button}
		`;
		
		app.render(document.body);

		expect(document.body.innerHTML).toBe('<h2>App</h2><button>\n' +
			'\t      click me\n' +
			'\t    </button>')
	});

	it('should render nested src 2 levels with dynamic inner level', () => {
		let items = [1, 2, 3];
		const list = html`<ul>${() => items.map(i => html`<li>item-${i}</li>`)}</ul>`;

		list.render(document.body);

		expect(document.body.innerHTML).toBe('<ul><li>item-1</li><li>item-2</li><li>item-3</li></ul>');

		items = [1];

		list.update();

		expect(document.body.innerHTML).toBe('<ul><li>item-1</li></ul>');

		items = [1, 2];

		list.update();

		expect(document.body.innerHTML).toBe('<ul><li>item-1</li><li>item-2</li></ul>');

		items = [];

		list.update();

		expect(document.body.innerHTML).toBe('<ul></ul>');

		items = [1, 2, 3];

		list.update();

		expect(document.body.innerHTML).toBe('<ul><li>item-1</li><li>item-2</li><li>item-3</li></ul>');
	});

	it('should render nested src 3 levels', () => {
		const deep = html`<ul>${html`<li>${html`<span>${html`sample`}</span>`}</li>`}</ul>`;

		deep.render(document.body);

		expect(document.body.innerHTML).toBe('<ul><li><span>sample</span></li></ul>')
	});

	it('should handle event attribute with fn value and event options', () => {
		const clickMock = jest.fn();

		const btn = html`<button onclick="${clickMock}, true">click me</button>`;

		btn.render(document.body);

		const btnElement = btn.nodes[0] as HTMLButtonElement;

		expect(document.body.innerHTML).toBe('<button>click me</button>');

		btnElement.click();

		expect(clickMock).toHaveBeenCalled()
	});

	it('should trow error if handle event attribute is not a function', () => {
		const btn = html`<button onclick="${2}">click me</button>`;

		expect(() => btn.render(document.body))
			.toThrowError('handler for event "onclick" is not a function. Found "2".');
	});

	it('should handle ref directive', () => {
		const btn = html`<button ref="btn">${html`<div ref="div">${html`<span ref="span">click me</span>`}</div>`}</button>`;

		const btnElement = btn.refs["btn"][0];
		const spanElement = btn.refs["span"][0];
		const divElement = btn.refs["div"][0];

		expect(btnElement).toBeInstanceOf(HTMLButtonElement)
		expect(spanElement).toBeInstanceOf(HTMLSpanElement)
		expect(divElement).toBeInstanceOf(HTMLDivElement)
	});
	
	it('should handle ref directive on dynamic elements', () => {
		let x = 15;
		const label = html`${when(() => x > 10, html`<span ref="greater">greater than 10</span>`, html`<span ref="less">less than 10</span>`)}`;
		const btn = html`<button ref="btn">${label}</button>`;
		
		expect(btn.refs["btn"][0]).toBeInstanceOf(HTMLButtonElement)
		expect(btn.refs["greater"][0]).toBeInstanceOf(HTMLSpanElement)
		expect(btn.refs["less"]).toBeUndefined()
		
		btn.render(document.body);

		x = 5;

		btn.update()

		expect(btn.refs["btn"][0]).toBeInstanceOf(HTMLButtonElement)
		expect(btn.refs["greater"][0]).toBeInstanceOf(HTMLSpanElement)
		expect(btn.refs["less"][0]).toBeInstanceOf(HTMLSpanElement)
	});
	
	describe("should handle attr directive", () => {
		it('class name as property', () => {
			let loading = true;
			const btn = html`<button attr.class.loading="${() => loading}" attr.class.btn="true">click me</button>`;
			
			btn.render(document.body);
			
			expect(document.body.innerHTML).toBe('<button class="loading btn">click me</button>');
			
			loading = false;
			
			btn.update();
			
			expect(document.body.innerHTML).toBe('<button class="btn">click me</button>');
		});
		
		it('class name as property', () => {
			let loading = true;
			const btn = html`<button attr.class.loading="${() => loading}" attr.class.btn="true">click me</button>`;
			
			btn.render(document.body);
			
			expect(document.body.innerHTML).toBe('<button class="loading btn">click me</button>');
			
			loading = false;
			
			btn.update();
			
			expect(document.body.innerHTML).toBe('<button class="btn">click me</button>');
		});
		
		it('class name as value', () => {
			let loading = true;
			const btn = html`<button attr.class="loading, ${() => loading}">click me</button>`;
			
			btn.render(document.body);
			
			expect(document.body.innerHTML).toBe('<button class="loading">click me</button>');
			
			loading = false;
			
			btn.update();
			
			expect(document.body.innerHTML).toBe('<button>click me</button>');
		});
		
		it('data name as property', () => {
			let loading = true;
			const btn = html`<button attr.data.loading="${() => loading}" attr.data.btn="true">click me</button>`;
			
			btn.render(document.body);
			
			expect(document.body.innerHTML).toBe('<button data-loading="true" data-btn="true">click me</button>');
			
			loading = false;
			
			btn.update();
			
			expect(document.body.innerHTML).toBe('<button data-btn="true">click me</button>');
		});
		
		it('data name as value wont work', () => {
			let loading = true;
			const btn = html`<button attr.data="loading, ${() => loading}">click me</button>`;
			
			btn.render(document.body);
			
			expect(document.body.innerHTML).toBe('<button>click me</button>');
		});
		
		it('style property without flag', () => {
			const btn = html`<button attr.style.cursor="pointer">click me</button>`;
			
			btn.render(document.body);
			
			expect(document.body.innerHTML).toBe('<button style="cursor: pointer;">click me</button>');
		});
		
		it('style value without flag', () => {
			const btn = html`<button attr.style="cursor: pointer">click me</button>`;
			
			btn.render(document.body);
			
			expect(document.body.innerHTML).toBe('<button style="cursor: pointer;">click me</button>');
		});
		
		it('style property with flag', () => {
			let pointer = false;
			const btn = html`<button attr.style.cursor="pointer, ${() => pointer}">click me</button>`;
			
			btn.render(document.body);
			
			expect(document.body.innerHTML).toBe('<button>click me</button>');
			
			pointer = true;
			
			btn.update();
			
			expect(document.body.innerHTML).toBe('<button style="cursor: pointer;">click me</button>');
		});
		
		it('style value with flag', () => {
			let pointer = false;
			const btn = html`<button attr.style="cursor: pointer | ${() => pointer}">click me</button>`;
			
			btn.render(document.body);
			
			expect(document.body.innerHTML).toBe('<button>click me</button>');
			
			pointer = true;
			
			btn.update();
			
			expect(document.body.innerHTML).toBe('<button style="cursor: pointer;">click me</button>');
		});
		
		it('any boolean attr', () => {
			let disabled = true;
			const btn = html`<button attr.disabled="${() => disabled}">click me</button>`;
			
			btn.render(document.body);
			
			expect(document.body.innerHTML).toBe('<button disabled="">click me</button>');
			
			disabled = false;
			
			btn.update();
			
			expect(document.body.innerHTML).toBe('<button>click me</button>');
		});
		
		it('any boolean attr with possible values', () => {
			let hidden = true;
			const btn = html`<button attr.hidden="until-found, ${() => hidden}">click me</button>`;
			
			btn.render(document.body);
			
			expect(document.body.innerHTML).toBe('<button hidden="until-found">click me</button>');
			
			hidden = false;
			
			btn.update();
			
			expect(document.body.innerHTML).toBe('<button>click me</button>');
		});
		
		it('any non-boolean attr', () => {
			let disabled = true;
			const btn = html`<button attr.aria-disabled="${() => disabled}">click me</button>`;
			
			btn.render(document.body);
			
			expect(document.body.innerHTML).toBe('<button aria-disabled="true">click me</button>');
			
			disabled = false;
			
			btn.update();
			
			expect(document.body.innerHTML).toBe('<button aria-disabled="false">click me</button>');
		});
	})
	
	it('should handle primitive attribute value', () => {
		const val = 12;
		const href = "/sample";
		const el = html`<a href="${href}" data-test-val="${val}"></a>`;
		
		el.render(document.body);
		
		expect(document.body.innerHTML).toBe('<a href="/sample" data-test-val="12"></a>')
	});
	
	it('should handle non-primitive attribute value', () => {
		const val = {val: 12};
		const map = new Map();
		const el = html`<div data-test-map="${map}" data-test-val="${val}"></div>`;
		
		el.render(document.body);
		
		expect(document.body.innerHTML).toBe('<div data-test-map="{}" data-test-val="{&quot;val&quot;:12}"></div>')
	});
	
	it('should handle non-primitive attribute value in WC', () => {
		const updateMock = jest.fn();
		const mapMock = jest.fn();
		const valMock = jest.fn();
		
		class SampleComp extends HTMLElement {
			static observedAttributes = ["map", "val"];
			
			set map(val: any) {
				mapMock(val)
			}
			
			set val(val: any) {
				valMock(val)
			}
			
			attributeChangedCallback(...args: any[]) {
				updateMock(...args)
			}
		}
		
		customElements.define("sample-comp", SampleComp)
		
		const val = {val: 12};
		const map = new Map();
		const el = html`<sample-comp map="${map}" val="${val}"></sample-comp>`;
		
		el.render(document.body);
		
		expect(document.body.innerHTML).toBe('<sample-comp map="{}" val="{&quot;val&quot;:12}"></sample-comp>')
		expect(mapMock).toHaveBeenCalledWith(expect.any(Map))
		expect(valMock).toHaveBeenCalledWith({"val": 12})
		
		const calls = updateMock.mock.calls;
		
		expect(calls).toHaveLength(4);
		expect(calls[0]).toEqual(["map", null, "{{val0}}", null]);
		expect(calls[1]).toEqual(["val", null, "{{val1}}", null]);
		expect(calls[2]).toEqual(["map", "{{val0}}", "{}", null]);
		expect(calls[3]).toEqual(["val", "{{val1}}", '{"val":12}', null]);
		
	});
	
	describe('should work with "repeat" helper', () => {
		it('with number value and primitive return', () => {
			const el = html`${repeat(2, (n) => n)}`;
			
			el.render(document.body);
			
			expect(document.body.innerHTML).toBe('12')
		});
		
		it('with number value and node return', () => {
			let count = 2;
			const el = html`${repeat(() => count, (n) => html`<span>${n}</span>`)}`;
			
			el.render(document.body);
			
			expect(document.body.innerHTML).toBe('<span>1</span><span>2</span>')

			count = 3;

			el.update();

			expect(document.body.innerHTML).toBe('<span>1</span><span>2</span><span>3</span>')
		});
		
		it('with object value and node return', () => {
			let items = [{name: "one"}, {name: "two"}];
			const el = html`${repeat(() => items, (n) => html`<span>${n.name}</span>`)}`;
			
			el.render(document.body);
			
			expect(document.body.innerHTML).toBe('<span>one</span><span>two</span>')
			const n1 = document.body.children[0];
			const n2 = document.body.children[1];
			
			items[0] = {name: "first"};
			
			el.update();
			
			expect(document.body.innerHTML).toBe('<span>first</span><span>two</span>')
			expect(n1).not.toEqual(document.body.children[0])
			
			items.push({name: "last"});

			el.update();

			expect(document.body.innerHTML).toBe('<span>first</span><span>two</span><span>last</span>')
			expect(n2).toEqual(document.body.children[1])
		});
		
		it('with object value and WC return', () => {
			const valMock = jest.fn();
			class TestComponent extends HTMLElement {
				set val(newVal: any) {
					valMock(newVal)
				}
			}
			
			customElements.define("test-component", TestComponent)
			
			let items = [{name: "one"}, {name: "two"}];
			const el = html`${repeat(() => items, (n) => html`<test-component val="${n}"></test-component>`)}`;
			
			el.render(document.body);
			
			expect(document.body.innerHTML).toBe('<test-component val="{&quot;name&quot;:&quot;one&quot;}"></test-component><test-component val="{&quot;name&quot;:&quot;two&quot;}"></test-component>')
			
			expect(valMock).toHaveBeenCalledTimes(2)
			expect(valMock).toHaveBeenCalledWith({name: "one"})
			expect(valMock).toHaveBeenCalledWith({name: "two"})
			
			items[0] = {name: "first"};

			el.update();
			
			expect(valMock).toHaveBeenCalledWith({name: "first"})

			items.push({name: "last"});

			el.update();

			expect(valMock).toHaveBeenCalledWith({name: "last"})
		});
	})
	
	describe('should work with "when" helper', () => {
		it('when both sides provided as static', () => {
			let shouldRender = true;
			let yes = html`<span>true</span>`;
			let no = html`<span>false</span>`;
			
			const el = html`${when(() => shouldRender, yes, no)}`;
			
			el.render(document.body);
			
			expect(document.body.innerHTML).toBe('<span>true</span>')
			let n = document.body.children[0];
			
			shouldRender = false;
			
			el.update();
			
			expect(document.body.innerHTML).toBe('<span>false</span>')
			
			shouldRender = true;
			
			el.update();
			
			expect(document.body.innerHTML).toBe('<span>true</span>')
			expect(document.body.children[0]).toEqual(n) // same node should be rendered
		});
		
		it('when both sides provided as static with dynamic values', () => {
			let x = 10;
			let total = () => x;
			let yes = html`<span>Non Zero: ${total}</span>`;
			let no = html`<span>Zero: ${total}</span>`;
			
			const el = html`${when(total, yes, no)}`;
			
			el.render(document.body);
			
			expect(document.body.innerHTML).toBe('<span>Non Zero: 10</span>')
			let n = document.body.children[0];
			
			x = 0;

			el.update();

			expect(document.body.innerHTML).toBe('<span>Zero: 0</span>')
			
			x = 20;

			el.update();

			expect(document.body.innerHTML).toBe('<span>Non Zero: 20</span>')
			expect(document.body.children[0]).toEqual(n) // same node should be rendered
		});
	})
	
})
