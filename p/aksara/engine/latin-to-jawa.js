import {  
  AKSARA, SANDHANGAN, SWARA,  
  PANYIGEG, PANGKON, MURDA, VOWELS  
} from './constants.js';  
  
import { latinNumberToJawa } from './numbers.js';  
  
const DIGRAF = ['ny','dh','th'];  
  
/* === DAFTAR JEBakan NG (WAJIB) === */  
const NG_CECAK_BEFORE = ['g','k','c','j','d','t','s','b','p'];  
  
export function latinToJawa(text, useMurda = true){  
  return text  
    .split(/(\s+|[.,!?;:])/)  
    .map(part=>{  
      if (/^\d+$/.test(part)) return latinNumberToJawa(part);  
      if (/^[\s.,!?;:]+$/.test(part)) return part;  
      return wordToJawa(part, useMurda);  
    })  
    .join('');  
}  
  
function wordToJawa(word, useMurda){
  if (!word) return '';

  const raw = word;
  word = word.toLowerCase();

  let out = '';
  let buffer = null; // simpan konsonan nunggu keputusan
  let i = 0;

  const flushDead = () => {
  if (!buffer) return;

  if (buffer === AKSARA.r) {
    out += PANYIGEG.r;     // layar
  } else if (buffer === AKSARA.h) {
    out += PANYIGEG.h;     // wignyan
  } else if (buffer === AKSARA.ng) {
    out += PANYIGEG.ng;    // cecak
  } else {
    out += buffer + PANGKON;
  }

  buffer = null;
};

  while (i < word.length){
    const two = word.slice(i,i+2);
    const one = word[i];
    const next = word[i+1];

    /* === NG === */
    if (two === 'ng'){
      flushDead();
      if (VOWELS.includes(word[i+2])){
        out += AKSARA.ng;
        if (word[i+2] !== 'a') out += SANDHANGAN[word[i+2]];
        i += 3;
      } else {
        out += PANYIGEG.ng;
        i += 2;
      }
      continue;
    }

    /* === DIGRAF === */
    if (DIGRAF.includes(two)){
      flushDead();
      buffer = AKSARA[two];
      i += 2;
      continue;
    }

    /* === KONSONAN === */
    if (AKSARA[one]){
      flushDead();

      buffer =
        useMurda &&
        i === 0 &&
        raw[0] === raw[0].toUpperCase() &&
        MURDA[one]
          ? MURDA[one]
          : AKSARA[one];

      i++;
      continue;
    }

    /* === VOKAL === */
    if (VOWELS.includes(one)){
      if (buffer){
        out += buffer;
        if (one !== 'a') out += SANDHANGAN[one];
        buffer = null;
      } else {
        out += SWARA[one];
      }
      i++;
      continue;
    }

    /* === KARAKTER LAIN === */
    flushDead();
    out += one;
    i++;
  }

  flushDead();
  return out;
}