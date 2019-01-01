import {importLink} from '../../js/functions.js';

export default class HTMLRegistrationFormElement extends HTMLElement {
	constructor() {
		super();
		importLink('registration-form-template').then(async form => {
			const nodes = [...form.content.querySelectorAll('body > *')].map(node => node.cloneNode(true));
			this.attachShadow({mode: 'open'}).append(...nodes);
			this.form.addEventListener('submit', async event => {
				event.preventDefault();
				try {
					const data = Object.fromEntries(new FormData(event.target).entries());
					console.log(data);
					this.form.reset();
				} catch (error) {
					console.error(error);
				}
			});
			this.form.addEventListener('reset', () => this.dispatchEvent(new Event('reset')), {passive: true});
		});
	}

	get method() {
		return this.hasAttribute('method') ? this.getAttribute('method').toUpperCase() : 'POST' ;
	}

	set method(method) {
		this.setAttribute('method', method);
	}

	get action() {
		return new URL(this.getAttribute('method'), document.baseURI);
	}

	get form() {
		return this.shadowRoot.querySelector('form');
	}
}

customElements.define('registration-form', HTMLRegistrationFormElement);
