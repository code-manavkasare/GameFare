export default {
  primary: '#5499E9',
  primary2: '#5499E9',
  primaryLight: '#88BEFD',

  transparent: 'transparent',

  secondary: '#FEDA66',
  terciary: '#5A5E74',
  title: '#222222',
  subtitle: '#656565',
  subtitleLight: '#4A4A4A',
  subtitleCard: '#AFAFAF',
  footerOff: '#3C3C3C',
  backdropModal: '#3C3C3C',

  placeHolder1: '#eaeaea',
  placeHolder2: '#f6f6f6',

  red: '#F66259',
  red2: '#FE725E',
  redLight: '#F78F80',

  green: '#1DD1A1',
  greenClick: '#28D9AA',
  greenStrong: '#32C759',
  greenLight: '#28D9AA',
  greenLight2: '#3ED665',
  greenUltraLight: '#ECFCF8',
  greenConfirm: '#71D66A',

  off: '#eaeaea',
  off2: '#FAFAFA',
  white: '#FFFFFF',
  black: '#000000',

  inputOff: '#C4C4C6',

  borderColor: '#A7A7AA',
  grey: '#D8D8D8',
  greyLight: '#EDEDED',
  greyDark: '#AEAEAE',
  greyMidDark: '#C2C2C2',
  transparentGrey: 'rgba(0,0,0,0.5)',

  blue: '#4998FA',
  blueLight: '#5499E9',

  hexToRGB: (hex) => {
    var c;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
      c = hex.substring(1).split('');
      if (c.length === 3) {
        c = [c[0], c[0], c[1], c[1], c[2], c[2]];
      }
      c = '0x' + c.join('');
      return (c >> 16) & 255, (c >> 8) & 255, c & 255;
    }
    throw new Error('Bad Hex');
  },
};
