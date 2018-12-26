export default class HTMLChatBoxElement extends HTMLElement {
	constructor() {
		super();
		this.contentEditable = true;

		this.addEventListener('keypress', event => {
			if (event.key === 'Enter') {
				this.dispatchEvent(new CustomEvent('message', {detail: {text: this.textContent, time: new Date()}}));
				this.textContent = '';
			}
		});
	}
}

customElements.define('chat-box', HTMLChatBoxElement);
