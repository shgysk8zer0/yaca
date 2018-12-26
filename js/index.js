import './std-js/deprefixer.js';
import './std-js/shims.js';
import '../components/current-year.js';
import '../components/chat-app/chat-app.js';
import {ready} from './std-js/functions.js';

ready().then(async () => {
  document.documentElement.classList.replace('no-js', 'js');
  document.documentElement.classList.toggle('no-dialog', document.createElement('dialog') instanceof HTMLUnknownElement);
});
