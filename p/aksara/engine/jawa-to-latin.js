import {
  AKSARA,
  SANDHANGAN,
  PANGKON,
  PANYIGEG,
  SWARA
} from './constants.js';

import { ANGKA_JAWA, PADA_PANGKAT } from './numbers.js';

const REVERSE_AKSARA = Object.fromEntries(
  Object.entries(AKSARA).map(([k, v]) => [v, k])
);

const REVERSE_SANDHANGAN = Object.fromEntries(
  Object.entries(SANDHANGAN).map(([k, v]) => [v, k])
);

const REVERSE_ANGKA = Object.fromEntries(
  Object.entries(ANGKA_JAWA).map(([k, v]) => [v, k])
);

const REVERSE_PANYIGEG = {
  'ꦁ': 'ng',
  'ꦂ': 'r',
  'ꦃ': 'h'
};

const SANDHANGAN_KEYS = Object.keys(REVERSE_SANDHANGAN)
  .sort((a, b) => b.length - a.length);

export function jawaToLatin(text){
  let out = '';
  let i = 0;

  while (i < text.length){
    const c = text[i];

    /* === ANGKA === */
    if (c === PADA_PANGKAT){
      i++;
      while (i < text.length && text[i] !== PADA_PANGKAT){
        out += REVERSE_ANGKA[text[i]] ?? '';
        i++;
      }
      i++;
      continue;
    }

    /* === PANYIGEG === */
    if (REVERSE_PANYIGEG[c]){
      out += REVERSE_PANYIGEG[c];
      i++;
      continue;
    }

    /* === PASANGAN === */
    if (c === PANGKON && REVERSE_AKSARA[text[i+1]]){
      out += REVERSE_AKSARA[text[i+1]];
      i += 2;
      continue;
    }

    /* === AKSARA LEGENA === */
    if (REVERSE_AKSARA[c]){
      const next = text[i+1];

      if (next === PANGKON){
        out += REVERSE_AKSARA[c];
        i++;
        continue;
      }

      let found = null;
      for (const key of SANDHANGAN_KEYS){
        if (text.slice(i+1, i+1+key.length) === key){
          found = key;
          break;
        }
      }

      out += REVERSE_AKSARA[c];

      if (found){
        out += REVERSE_SANDHANGAN[found];
        i += 1 + found.length;
      } else {
        out += 'a';
        i++;
      }
      continue;
    }

    /* === SPASI / SIMBOL === */
    if (/\s/.test(c)) out += ' ';
    else out += c;

    i++;
  }

  return out.replace(/\s+/g,' ').trim();
}