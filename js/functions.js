import {prompt} from './std-js/asyncDialog.js';
import {wait} from './std-js/functions.js';

export async function attachChat({
	endpoint = 'ws://localhost',
	port     = NaN,
	name     = '',
	parent   = document.body,
	promises = [],
	classes  = [
		'fixed',
		'bottom',
		'right',
		'block',
		'shadow-dark',
	],
} = {}) {
	[...parent.querySelectorAll('chat-app')].forEach(el => el.remove());
	await customElements.whenDefined('chat-app');
	await Promise.all(promises);
	const HTMLChatAppElement = customElements.get('chat-app');
	const chat = new HTMLChatAppElement();
	const src = new URL(endpoint);
	const btns = document.getElementById('chat-btns-template').content;
	chat.append(btns.cloneNode(true));

	(async chat => {
		while (name === '') {
			name = await prompt('Enter your name');
		}

		while (Number.isNaN(port)) {
			port = parseInt(await prompt('Enter port #', navigator.vendor === '' ? 3000 : 3001));
		}

		src.port = port;
		chat.src = src.href;
		chat.classList.add(...classes);

		chat.name = name;
		chat.label = 'Waiting for connection';
		chat.disabled = true;
		parent.append(chat);
		await chat.paired();
		chat.disabled = false;
		chat.open = true;
		chat.addEventListener('disconnect', event => wait(300).then(() => event.target.remove()));
	})(chat);

	return chat;
}

export async function sleep(t) {
	await new Promise(resolve => setTimeout(() => resolve(), t));
}

export function* fibinacci(terms = Infinity) {
	let current = 1, prev = 1;
	yield prev;

	while (--terms > 0 && current <= Number.MAX_SAFE_INTEGER) {
		yield current;
		[current, prev] = [prev + current, current];
	}
}
