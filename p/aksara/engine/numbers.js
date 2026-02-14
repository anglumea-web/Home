export const ANGKA_JAWA = {  
  0:'꧐',1:'꧑',2:'꧒',3:'꧓',4:'꧔',  
  5:'꧕',6:'꧖',7:'꧗',8:'꧘',9:'꧙'  
};  
  
export const PADA_PANGKAT = '꧇';  
  
export function latinNumberToJawa(num){  
  return PADA_PANGKAT +  
    num.split('').map(n=>ANGKA_JAWA[n]).join('')  
    + PADA_PANGKAT;  
}  