export default class HTMLChatBoxElement extends HTMLElement {
	constructor() {
		super();
		this.contentEditable = true;

		this.addEventListener('keypress', event => {
			if (event.key === 'Enter' && ! event.ctrlKey && ! this.empty) {
				this.send();
			}
		});
	}

	send(text = this.textContent) {
		this.dispatchEvent(new CustomEvent('message', {
			detail: {
				text: text.trim(),
				time: new Date(),
			}
		}));
		this.textContent = '';
	}

	get text() {
		return this.textContent.trim();
	}

	get empty() {
		return this.text.length === 0;
	}
}

customElements.define('chat-box', HTMLChatBoxElement);
