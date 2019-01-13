import './std-js/deprefixer.js';
import './std-js/shims.js';
import '../components/current-year.js';
import '../components/chat-app/chat-app.js';
import '../components/login-form/login-form.js';
import '../components/registration-form/registration-form.js';
import {registerServiceWorker} from './std-js/functions.js';
import {prompt} from './std-js/asyncDialog.js';

if (document.documentElement.dataset.hasOwnProperty('serviceWorker')) {
	registerServiceWorker(document.documentElement.dataset.serviceWorker).catch(console.error);
}

document.documentElement.classList.replace('no-js', 'js');
document.documentElement.classList.toggle('no-dialog', document.createElement('dialog') instanceof HTMLUnknownElement);

customElements.whenDefined('login-form').then(() => {
	document.querySelector('login-form').addEventListener('reset', event => event.target.closest('dialog').close());
});

customElements.whenDefined('registration-form').then(() => {
	// document.getElementById('registration-form-dialog').showModal();
	document.querySelector('registration-form').addEventListener('reset', event => event.target.closest('dialog').close());
});

customElements.whenDefined('chat-app').then(async () => {
	const HTMLChatAppElement = customElements.get('chat-app');
	const chat = new HTMLChatAppElement();
	const src = new URL('ws://localhost');
	const btns = document.getElementById('chat-btns-template').content;
	let port = NaN;
	let name = '';
	chat.append(btns.cloneNode(true));

	while (Number.isNaN(port)) {
		port = parseInt(await prompt('Enter port #', navigator.vendor === '' ? 3000 : 3001));
	}

	src.port = port;
	chat.src = src.href;
	chat.classList.add('fixed', 'bottom', 'right', 'block', 'shadow-dark');

	while (name === '') {
		name = await prompt('Enter your name');
	}
	chat.name = name;
	chat.label = 'Waiting for connection';
	chat.disabled = true;
	document.body.append(chat);
	await chat.paired();
	chat.disabled = false;
	chat.open = true;
});
