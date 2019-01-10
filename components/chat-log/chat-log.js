import {importLink} from '../../js/std-js/functions.js';

export default class HTMLChatLogElement extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({mode: 'open'});
		importLink('chat-log-template').then(link => {
			[...link.head.children].forEach(child => this.shadowRoot.append(child.cloneNode(true)));
			[...link.body.children].forEach(child => this.shadowRoot.append(child.cloneNode(true)));
		});
	}

	get messages() {
		return [...this.shadowRoot.querySelector('slot[name="messages"]').assignedNodes()];
	}

	async addMessage({
		text = '',
		action = 'received',
		contentType = 'text/plain',
		date = new Date(),
	} = {}) {
		const el = document.createElement('div');
		const p = document.createElement('p');
		const time = document.createElement('time');
		switch (contentType) {
		case 'text/plain':
			p.textContent = text;
			break;
		case 'text/html':
			p.innerHTML = text;
			break;
		default:
			console.error(`Unhandled Content-Type: "${contentType}"`);
		}
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

	async addAttachment({size, contentType, time, data, name, message = '', action = 'received'} = {}) {
		if (! contentType.startsWith('image/')) {
			throw new TypeError(`Expected Content-Type to match image but got "${contentType}"`);
		}
		const a = document.createElement('a');
		const img = document.createElement('img');
		const figure = document.createElement('figure');
		const timeEl = document.createElement('time');
		const figCap = document.createElement('figcaption');
		a.classList.add('inline-block', 'btn');
		a.download = name;
		a.dataset.size = size;
		time = new Date(time);
		img.src = `data:${contentType};base64,${btoa(data)}`;
		a.href = img.src;
		a.role = 'button';
		a.textContent = `Download "${name}"`;
		img.alt = name;
		timeEl.textContent = time.toLocaleString();
		timeEl.dateTime = time.toISOString();
		timeEl.hidden = true;
		figure.addEventListener('click', () => timeEl.hidden = ! timeEl.hidden);
		figure.slot = 'messages';
		figure.classList.add('message', action);
		if (message !== '') {
			const p = document.createElement('p');
			p.textContent = message;
			figCap.append(p);
		}
		figCap.animate([{
			opacity: 0,
		}, {
			opacity: 1,
		}], {
			duration: 350,
			easing: 'ease-in-out',
			fill: 'both',
		});
		figCap.append(timeEl, a);
		img.addEventListener('load', () => {
			img.addEventListener('dblclick', () => open(img.src));
			img.classList.add('cursor-pointer');
			URL.revokeObjectURL(img.src);
			figure.append(img, figCap);
			figure.scrollIntoView({block: 'start', behavior: 'smooth'});
		}, {once: true});
		img.addEventListener('error', console.error);
		this.append(figure);
	}
}

customElements.define('chat-log', HTMLChatLogElement);
