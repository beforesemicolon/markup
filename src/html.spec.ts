import {html} from "./html";
import {Template} from "./types";
import {when, repeat} from "./helpers";

describe("html", () => {
	beforeEach(() => {
		document.body.innerHTML = "";
	})

	it('should render static text', () => {
		const temp = html`sample`;

		temp.render(document.body);

		expect(document.body.innerHTML).toBe('sample');
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
		let list: Template[] = [];
		
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
		const val = html`${() => edit ? `<input type="text" value="${value}"/>` : html`<p>${value}</p>`}`;

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
		const list = html`<ul>${() => items.map(i => `<li>item-${i}</li>`).join('&nbsp;')}}</ul>`;

		list.render(document.body);

		expect(document.body.innerHTML).toBe('<ul><li>item-1</li>&nbsp;<li>item-2</li>&nbsp;<li>item-3</li></ul>');

		items = [1];

		list.update();

		expect(document.body.innerHTML).toBe('<ul><li>item-1</li></ul>');

		items = [1, 2];

		list.update();

		expect(document.body.innerHTML).toBe('<ul><li>item-1</li>&nbsp;<li>item-2</li></ul>');

		items = [];

		list.update();

		expect(document.body.innerHTML).toBe('<ul></ul>');

		items = [1, 2, 3];

		list.update();

		expect(document.body.innerHTML).toBe('<ul><li>item-1</li>&nbsp;<li>item-2</li>&nbsp;<li>item-3</li></ul>');
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

		const btnElement = btn.refs["btn"];
		const spanElement = btn.refs["span"];
		const divElement = btn.refs["div"];

		expect(btnElement).toBeInstanceOf(HTMLButtonElement)
		expect(spanElement).toBeInstanceOf(HTMLSpanElement)
		expect(divElement).toBeInstanceOf(HTMLDivElement)
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
			const btn = html`<button attr.style="cursor: pointer, ${() => pointer}">click me</button>`;
			
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
	
	it('should work with "when" helper', () => {
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
	})
	
})
