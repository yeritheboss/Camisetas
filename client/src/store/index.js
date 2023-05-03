import { proxy } from 'valtio';

const state = proxy({
  intro: true,
  color: 'black',
  isLogoTexture: true,
  isFullTexture: false,
  logoDecal: './yolo.png',
  fullDecal: './yolo.png',
});

export default state;