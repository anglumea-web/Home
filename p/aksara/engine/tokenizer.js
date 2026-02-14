import { latinToJawa } from './engine/latin-to-jawa.js';
import { jawaToLatin } from './engine/jawa-to-latin.js';

const input = document.getElementById('input');
const output = document.getElementById('output');
const murdaToggle = document.getElementById('murdaToggle');
const swapBtn = document.getElementById('swapBtn');
const modeLabel = document.getElementById('modeLabel');
const copyBtn = document.getElementById('copyBtn');

let mode = 'latin-jawa';

function render(){
  output.textContent =
    mode === 'latin-jawa'
      ? latinToJawa(input.value, murdaToggle.checked)
      : jawaToLatin(input.value);
}

swapBtn.onclick = () => {
  mode = mode === 'latin-jawa' ? 'jawa-latin' : 'latin-jawa';
  modeLabel.textContent =
    mode === 'latin-jawa'
      ? 'Latin → Aksara Jawa'
      : 'Aksara Jawa → Latin';

  input.value = output.textContent;
  render();
};

copyBtn.onclick = () =>
  navigator.clipboard.writeText(output.textContent);

input.addEventListener('input', render);
murdaToggle.addEventListener('change', render);

render();