import {importLink} from '../../js/functions.js';

export default class HTMLChatLogElement extends HTMLElement {
	constructor() {
		super();
		const shadow = this.attachShadow({mode: 'open'});
		importLink('chat-log-template').then(link => {
			[...link.content.body.querySelectorAll('body > *')].forEach(el => shadow.append(el));
		});
	}

	get messages() {
		return [...this.shadowRoot.querySelector('slot[name="messages"]').assignedNodes()];
	}

	async addMessage({
		text = '',
		action = 'received',
		date = new Date(),
	} = {}) {
		const el = document.createElement('div');
		const p = document.createElement('p');
		const time = document.createElement('time');
		p.textContent = text;
		time.textContent = date.toLocaleString();
		time.dateTime = date.toISOString();
		time.hidden = true;
		el.addEventListener('click', () => time.toggleAttribute('hidden'), {passive: true});
		el.slot = 'messages';
		el.append(p, time);
		el.classList.add('message', action);

		el.animate([{
			opacity: 0,
		}, {
			opacity: 1,
		}], {
			duration: 350,
			easing: 'ease-in-out',
			fill: 'both',
		});
		this.append(el);
		el.scrollIntoView({block: 'end', behavior: 'smooth',});
		return el;
	}
}

customElements.define('chat-log', HTMLChatLogElement);
