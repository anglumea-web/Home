import { latinToJawa } from './engine/latin-to-jawa.js';
import { jawaToLatin } from './engine/jawa-to-latin.js';

/* ===================== */
/* CORE ELEMENTS */
/* ===================== */

const input = document.getElementById('input');
const output = document.getElementById('output');
const murdaToggle = document.getElementById('murdaToggle');
const swapBtn = document.getElementById('swapBtn');
const modeLabel = document.getElementById('modeLabel');
const copyBtn = document.getElementById('copyBtn');

/* ===================== */
/* MODE STATE */
/* ===================== */

let mode = 'latin-jawa';

/* ===================== */
/* RENDER */
/* ===================== */

function render() {
  const value = input.value;

  output.textContent =
    mode === 'latin-jawa'
      ? latinToJawa(value, murdaToggle.checked)
      : jawaToLatin(value);
}

/* ===================== */
/* MODE SWITCH */
/* ===================== */

swapBtn.onclick = () => {
  mode = mode === 'latin-jawa' ? 'jawa-latin' : 'latin-jawa';

  modeLabel.textContent =
    mode === 'latin-jawa'
      ? 'Latin → Aksara Jawa'
      : 'Aksara Jawa → Latin';

  input.value = output.textContent;
  render();
};

/* ===================== */
/* COPY */
/* ===================== */

copyBtn.onclick = async () => {
  try {
    await navigator.clipboard.writeText(output.textContent);
  } catch (e) {
    console.warn('Clipboard gagal:', e);
  }
};

/* ===================== */
/* INPUT EVENTS */
/* ===================== */

input.addEventListener('input', render);
murdaToggle.addEventListener('change', render);

/* ===================== */
/* INITIAL RENDER */
/* ===================== */

render();

/* ===================== */
/* DONATE MODAL */
/* ===================== */

const donateBtn = document.getElementById('donateBtn');
const donateModal = document.getElementById('donateModal');
const closeDonate = document.getElementById('closeDonate');
const btcBtn = document.getElementById('btcBtn');
const btcAddress = document.getElementById('btcAddress');

donateBtn.onclick = () => donateModal.classList.remove('hidden');
closeDonate.onclick = () => donateModal.classList.add('hidden');

donateModal.onclick = e => {
  if (e.target === donateModal)
    donateModal.classList.add('hidden');
};

btcBtn.onclick = () => {
  navigator.clipboard.writeText(btcAddress.textContent);
  btcBtn.innerHTML = '✔ Bitcoin address copied';
};

const drawer = document.getElementById('bottomDrawer');
const handle = document.getElementById('drawerHandle');

handle.onclick = () => drawer.classList.toggle('open');

/* ===================== */
/* ABOUT & SHARE MODAL */
/* ===================== */

const aboutBtn = document.getElementById('aboutBtn');
const aboutModal = document.getElementById('aboutModal');

const shareBtn = document.getElementById('shareBtn');
const shareModal = document.getElementById('shareModal');

/* OPEN */
aboutBtn.onclick = () => aboutModal.classList.remove('hidden');
shareBtn.onclick = () => shareModal.classList.remove('hidden');

/* CLOSE (SEMUA BUTTON TUTUP) */
document.querySelectorAll('.closeBtn').forEach(btn=>{
  btn.onclick = () => {
    aboutModal.classList.add('hidden');
    shareModal.classList.add('hidden');
  };
});

/* CLICK OUTSIDE TO CLOSE */
[aboutModal, shareModal].forEach(modal=>{
  modal.onclick = e => {
    if (e.target === modal)
      modal.classList.add('hidden');
  };
});