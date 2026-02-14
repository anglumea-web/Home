export const VOWELS = ['a','i','u','e','o','ê'];  
  
export const AKSARA = {  
  h:'ꦲ', n:'ꦤ', c:'ꦕ', r:'ꦫ', k:'ꦏ',  
  d:'ꦢ', t:'ꦠ', s:'ꦱ', w:'ꦮ',  
  l:'ꦭ', p:'ꦥ', j:'ꦗ', y:'ꦪ',  
  m:'ꦩ', g:'ꦒ', b:'ꦧ',  
  ng:'ꦔ', ny:'ꦚ', dh:'ꦝ', th:'ꦛ'  
};  
  
export const PASANGAN = Object.fromEntries(  
  Object.entries(AKSARA).map(([k,v]) => [k,'꧀'+v])  
);  
  
export const SANDHANGAN = {  
  i:'ꦶ', u:'ꦸ', e:'ꦺ', o:'ꦺꦴ', ê:'ꦼ'  
};  
  
export const SWARA = {  
  a:'ꦄ', i:'ꦆ', u:'ꦈ', e:'ꦌ', o:'ꦎ'  
};  
  
export const PANYIGEG = {  
  ng:'ꦁ', r:'ꦂ', h:'ꦃ'  
};  
  
export const PANGKON = '꧀';  
  
export const MURDA = {  
  n:'ꦟ', k:'ꦑ', t:'ꦡ', s:'ꦯ',  
  p:'ꦦ', b:'ꦨ', g:'ꦓ',  
  c:'ꦖ', j:'ꦙ', d:'ꦣ'  
};