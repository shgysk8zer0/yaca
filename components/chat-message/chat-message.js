import {importLink} from '../../js/std-js/functions.js';
export default class HTMLChatMessageElement extends HTMLElement {
	constructor({text, timestamp}) {
		super();
		this.attachShadow({mode: 'open'});
		importLink('chat-message-template').then(async link => {
			[...link.head.children].forEach(child => this.shadowRoot.append(child.cloneNode(true)));
			[...link.body.children].forEach(child => this.shadowRoot.append(child.cloneNode(true)));
			this.addEventListener('click', () => this.getNodes('timestamp').forEach(el => el.toggleAttribute('hidden')));
			if (text) {
				this.text = text;
			}
			if (timestamp) {
				this.timestamp = timestamp;
			}
		});
	}

	toJSON() {
		const {text, attachment, timestamp, attachments} = this;
		return {text, attachment, timestamp, attachments};
	}

	get text() {
		const nodes = this.getNodes('text');
		if (nodes.length === 1) {
			return nodes[0].textContent;
		} else {
			return '';
		}
	}

	set text(text) {
		const p = document.createElement('p');
		p.textContent = text;
		p.slot = 'text';
		this.getNodes('text').forEach(el => el.remove());
		this.append(p);
	}

	set attachments(attachment) {
		if (attachment instanceof HTMLElement) {
			attachment.slot = 'attachment';
		} else {
			throw new TypeError(`Expected attachment to be an HTMLElement but got a ${typeof attachment}`);
		}
	}

	get attachments() {
		const nodes = this.getNodes('attachment');
		if (nodes.length !== 0) {
			return nodes;
		} else {
			return [];
		}
	}

	set timestamp(date = new Date()) {
		if (typeof date === 'string') {
			date = new Date(date);
		}
		const time = document.createElement('time');
		time.textContent = date.toLocaleString();
		time.dateTime = date.toISOString();
		time.slot = 'timestamp';
		time.hidden = true;
		this.getNodes('timestamp').forEach(el => el.remove());
		this.append(time);
	}

	get timestamp() {
		const nodes = this.getNodes('timestamp');
		if (nodes.length === 1) {
			return new Date(nodes[0].dateTime);
		} else {
			return null;
		}
	}

	getSlot(name) {
		return this.shadowRoot.querySelector(`slot[name="${name}"]`);
	}

	getNodes(name) {
		const slot = this.getSlot(name);
		if (slot instanceof HTMLSlotElement) {
			return [...slot.assignedNodes()];
		} else {
			return [];
		}
	}
}

customElements.define('chat-message', HTMLChatMessageElement);