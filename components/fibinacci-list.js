class HTMLFibinacciListElement extends HTMLElement {
	constructor() {
		super();
		const shadow = this.attachShadow({mode: 'closed'});
		this.list = shadow.appendChild(document.createElement('ol'));
	}

	get terms() {
		if (this.hasAttribute('terms')) {
			const val = this.getAttribute('terms');
			return val === 'Infinity' ? Infinity : parseInt(val);
		} else {
			return NaN;
		}
	}

	set terms(terms) {
		if (typeof terms === 'string') {
			terms = terms === 'Infinity' ? Infinity : parseInt(terms);
		}

		if (typeof terms === 'number' && ! Number.isNaN(terms)) {
			this.setAttribute('terms', terms);
		} else {
			throw new TypeError('Expected terms to be a Number');
		}
	}

	get items() {
		return [...this.list.children].map(i => parseInt(i.textContent));
	}

	static get observedAttributes() {
		return ['terms'];
	}

	attributeChangedCallback(name/*, oldValue, newValue*/) {
		/* eslint no-case-declarations: "off" */
		switch (name) {
		case 'terms':
			[...this.list.children].forEach(child => child.remove());

			for (const term of HTMLFibinacciListElement.sequence(this.terms)) {
				const li = document.createElement('li');
				li.textContent = term;
				this.list.append(li);
			}
			this.dispatchEvent(new Event('generated'));
			break;
		default:
			throw new Error(`Unhandled attribute change: ${name}`);
		}
	}

	async generated() {
		if (this.items.length === 0) {
			await new Promise(resolve => this.addEventListener('generated', resolve, {once: true}));
		}
	}

	static *sequence(terms = Infinity) {
		let current = 1, prev = 1;
		yield prev;

		while (--terms > 0 && Number.isSafeInteger(current)) {
			yield current;
			[current, prev] = [prev + current, current];
		}
	}
}

customElements.define('fibinacci-list', HTMLFibinacciListElement);
