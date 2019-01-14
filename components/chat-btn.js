import {attachChat} from '../../js/functions.js';

export default class HTMLChatButtonELement extends HTMLButtonElement {
	constructor() {
		super();
		this.addEventListener('click', async () => {
			const chat = await attachChat({endpoint: this.endpoint, port: this.port});
			console.log(chat);
			this.disabled = true;
			chat.addEventListener('disconnect', () => this.disabled = false);
			chat.addEventListener('connect',    () => this.disabled = true);
		});
	}

	get endpoint() {
		return this.getAttribute('endpoint') || document.baseURI;
	}

	get port() {
		return parseInt(this.getAttribute('port'));
	}
}

customElements.define('chat-btn', HTMLChatButtonELement, {extends: 'button'});
