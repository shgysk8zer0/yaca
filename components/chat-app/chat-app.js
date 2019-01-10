// import {importLink} from '../../js/functions.js';
import {notify, importLink} from '../../js/std-js/functions.js';
import '../chat-log/chat-log.js';

export default class HTMLChatAppElement extends HTMLElement {

	constructor() {
		super();
		this.socket = undefined;
		const shadow = this.attachShadow({mode: 'closed'});
		importLink('chat-app-template').then(async link => {
			await customElements.whenDefined('chat-log');
			[...link.head.children].forEach(child => shadow.append(child.cloneNode(true)));
			[...link.body.children].forEach(child => shadow.append(child.cloneNode(true)));
			this.header = shadow.querySelector('chat-header');
			this.messageContainer = shadow.querySelector('chat-log');
			shadow.querySelector('form').addEventListener('submit', async event => {
				event.preventDefault();
				await this.connected;
				const form = new FormData(event.target);
				const data = Object.fromEntries(form.entries());
				event.target.reset();
				if (data.attachment instanceof File) {
					await this.attach(data);
				} else {
					data.time = new Date();
					await this.messageContainer.addMessage({text: data.text, action: 'sent', date: data.time});
					await this.send(data);
					this.dispatchEvent(new CustomEvent('message-sent', {detail: data}));
				}
			});
			this.body = shadow.querySelector('.chat-body');
			this.dispatchEvent(new Event('load'));
			this.header.addEventListener('click', () => this.toggleAttribute('open'));
		});

		this.addEventListener('message-received', async event => {
			await this.connected;
			this.messageContainer.addMessage({text: event.detail.text, action: 'received'});
			if (document.visibilityState !== 'visible' || ! this.open) {
				const notification = await notify('Message Received', {
					body: event.detail.text,
					icon: new URL('img/chat.svg', document.baseURI),
				});
				notification.addEventListener('click', () => this.open = true);
			}
		});

		this.addEventListener('attachment', async event => {
			await this.connected;
			this.messageContainer.addAttachment(event.detail);
			if (document.visibilityState !== 'visible' || ! this.open) {
				const notification = await notify('Attachment Received', {
					body: event.detail.text,
					icon: new URL('img/chat.svg', document.baseURI),
				});
				notification.addEventListener('click', () => this.open = true);
			}
		});
	}

	connectedCallback() {
		this.connect();
	}

	disconnectedCallback() {
		if (this.socket instanceof WebSocket) {
			this.socket.close();
			this.socket = undefined;
		}
	}

	async connect() {
		await new Promise((resolve, reject) => {
			if (! (this.socket instanceof WebSocket)) {
				this.socket = new WebSocket(this.src);

				this.socket.addEventListener('close', event => {
					this.remove();
					this.socket = undefined;
					notify('Connection closed', {
						body: event.reason || 'Try refreshing the page to reconnect',
					});
				});

				this.socket.addEventListener('message', msg => {
					const json = JSON.parse(msg.data);
					switch (json.event) {
					case 'message':
						let {message, contentType = 'text/plain', time = new Date()} = JSON.parse(msg.data);
						this.dispatchEvent(new CustomEvent('message-received', {detail: {
							text: message,
							contentType,
							time,
						}}));
						break;
					case 'attachment':
						try {
							let {size, contentType, time, data, name, message = '', action = 'received'} = json;
							this.dispatchEvent(new CustomEvent('attachment', {detail: {size, contentType, time, data, name, message, action}}));
						} catch (err) {
							console.error(err);
						}
						break;
					default: throw new Error(`Unhandled event: "${json.event}"`);
					}
				});

				this.socket.addEventListener('connect', () => resolve(this.socket));
				this.socket.addEventListener('error', event => {
					this.socket.close();
					reject(event);
				});
			} else {
				resolve(this.socket);
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

	get messages() {
		return this.messageContainer.messages;
	}

	get ready() {
		return new Promise(resolve => {
			if (this.body instanceof Node) {
				resolve();
			} else {
				this.addEventListener('load', () => resolve(), {once: true});
			}
		});
	}

	get connected() {
		return new Promise(async (resolve, reject) => {
			await this.ready;
			if (this.socket === undefined) {
				this.addEventListener('connected', () => resolve());
				this.addEventListener('error', reject);
			} else {
				resolve();
			}
		});
	}

	get port() {
		return parseInt(this.getAttribute('port')) || parseInt(location.port);
	}

	set port(num) {
		this.setAttribute('port', num);
	}

	get src() {
		const url = new URL(this.getAttribute('src'), document.baseURI);
		if (this.hasAttribute('port')) {
			url.port = this.port;
		}
		if (! url.protocol.startsWith('ws')) {
			url.protocol = this.secure ? 'wss:' : 'ws:';
		}
		return url;
	}

	set src(src) {
		this.setAttribute('src', src);
	}

	get secure() {
		return this.hasAttribute('secure') || location.protocol === 'https:';
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
				if (newValue === '') {
					this.body.querySelector('[name="text"]').focus();
				}
				break;
			case 'header-background':
				this.headerBackground = newValue;
				break;
			case 'header-color':
				this.headercolor = newValue;
				break;
			default:
				throw new Error(`Unhandled attribute change: ${JSON.stringify({name, oldValue, newValue})}`);
			}
		});
	}

	async send({text = '', contentType = 'text/plain', event = 'message', time = new Date()}) {
		this.socket.send(JSON.stringify({message: text, contentType, event, time: time.toISOString()}));
	}

	async attach({attachment, time = new Date(), message = ''}) {
		const msg = await new Promise((resolve, reject) => {
			if (! (attachment instanceof File)) {
				reject(new TypeError('Attachment must be a File'));
			} else {
				const reader = new FileReader();
				reader.addEventListener('load', event => resolve({
					event: 'attachment',
					size: attachment.size,
					contentType: attachment.type,
					name: attachment.name,
					data: event.target.result,
					time,
					message,
				}));
				reader.addEventListener('error', reject);
				reader.readAsBinaryString(attachment);
			}
		});
		this.socket.send(JSON.stringify(msg));
		msg.action = 'sent';
		this.dispatchEvent(new CustomEvent('attachment', {detail: msg}));
	}

	clearMessages() {
		this.messages.forEach(m => m.remove());
	}
}

customElements.define('chat-app', HTMLChatAppElement);
