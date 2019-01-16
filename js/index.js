import './std-js/deprefixer.js';
import './std-js/shims.js';
import '../components/current-year.js';
import '../components/chat-app/chat-app.js';
import '../components/login-form/login-form.js';
import '../components/registration-form/registration-form.js';
import '../components/gravatar-img.js';
// import '../components/chat-btn.js';
import '../components/fibinacci-list.js';
import {registerServiceWorker} from './std-js/functions.js';

if (document.documentElement.dataset.hasOwnProperty('serviceWorker')) {
	registerServiceWorker(document.documentElement.dataset.serviceWorker).catch(console.error);
}

document.documentElement.classList.replace('no-js', 'js');
document.documentElement.classList.toggle('no-dialog', document.createElement('dialog') instanceof HTMLUnknownElement);

customElements.whenDefined('login-form').then(() => {
	document.querySelector('login-form').addEventListener('reset', event => event.target.closest('dialog').close());
});

customElements.whenDefined('registration-form').then(() => {
	document.querySelector('registration-form').addEventListener('reset', event => event.target.closest('dialog').close());
});
