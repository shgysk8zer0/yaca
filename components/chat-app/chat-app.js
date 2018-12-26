import {importLink} from '../../js/functions.js';
import {notify, wait} from '../../js/std-js/functions.js';
import '../chat-log/chat-log.js';
import '../chat-box/chat-box.js';

export default class HTMLChatAppElement extends HTMLElement {
	constructor() {
		super();
		this.socket = undefined;
		const shadow = this.attachShadow({mode: 'open'});
		importLink('chat-app-template').then(async link => {
			await customElements.whenDefined('chat-log');
			const nodes = [...link.content.querySelectorAll('body > *')].map(node => node.cloneNode(true));
			shadow.append(...nodes);
			this.header = shadow.querySelector('chat-header');
			this.messageContainer = shadow.querySelector('chat-log');
			this.messageBox = shadow.querySelector('chat-box');
			this.body = shadow.querySelector('.chat-body');
			this.dispatchEvent(new Event('load'));
			this.header.addEventListener('click', () => this.toggleAttribute('open'));
			this.messageBox.addEventListener('message', async event => {
				await this.messageContainer.addMessage({text: event.detail.text, action: 'sent', date: event.detail.time});
				await this.send(event.detail);
				this.dispatchEvent(new CustomEvent('message-sent', {detail: event.detail}));
			});
		});

		this.addEventListener('message-received', async event => {
			this.messageContainer.addMessage({text: event.detail.text, action: 'received'});
			if (document.visibilityState !== 'visible') {
				const notification = await notify('Message Received', {
					body: event.detail.text,
					icon: new URL('img/octicons/comment.svg', document.baseURI),
				});
				notification.addEventListener('click', () => this.open = true);
			}
		});
	}

	get headerBackground() {
		return this.style.getPropertyValue('--chat-header-background');
	}

	set headerBackground(color) {
		this.style.setProperty('--chat-header-background', color);
	}

	get headercolor() {
		return this.style.getPropertyValue('--chat-header-color');
	}

	set headercolor(color) {
		this.style.setProperty('--chat-header-color', color);
	}

	get ready() {
		return new Promise(resolve => {
			if (this.shadowRoot instanceof Node) {
				resolve();
			} else {
				this.addEventListener('load', () => resolve(), {once: true});
			}
		});
	}

	get connected() {
		return new Promise((resolve, reject) => {
			if (this.socket === undefined) {
				this.addEventListener('connected', () => resolve());
				this.addEventListener('error', reject);
			} else {
				resolve();
			}
		});
	}

	get port() {
		return parseInt(this.getAttribute('port'));
	}

	set port(num) {
		this.setAttribute('port', num);
	}

	get src() {
		return this.getAttribute('src');
	}

	set src(src) {
		this.setAttribute('src', src);
	}

	get secure() {
		return this.hasAttribute('secure');
	}

	set secure(secure) {
		this.toggleAttribute('secure', secure);
	}

	get open() {
		return this.hasAttribute('open');
	}

	set open(open) {
		this.toggleAttribute('open', open);
	}

	get label() {
		return this.getAttribute('label');
	}

	set label(label) {
		this.setAttribute('label', label);
	}

	static get observedAttributes() {
		return [
			'open',
			'label',
			'header-background',
			'header-color',
		];
	}

	attributeChangedCallback(name, oldValue, newValue) {
		/*eslint no-case-declarations: 0*/
		this.ready.then(async () => {
			switch(name) {
			case 'label':
				const el = document.createElement('span');
				el.slot = 'label';
				el.textContent = newValue;
				[...this.querySelectorAll('[slot="label"]')].forEach(el => el.remove());
				this.append(el);
				break;
			case 'open':
				this.body.classList.toggle('open', newValue === '');
				break;
			case 'header-background':
				this.headerBackground = newValue;
				break;
			case 'header-color':
				this.headercolor = newValue;
				break;
			default:
				throw new Error(`Unhandled attribute change: {name: ${name}, oldValue: ${oldValue}, newValue: ${newValue}}`);
			}
		});
	}

	async send({text = '', date = new Date()}) {
		await wait(300);
		return Promise.resolve({text, date});
	}
}

customElements.define('chat-app', HTMLChatAppElement);
