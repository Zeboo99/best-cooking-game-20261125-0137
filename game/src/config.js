// Dapur Kilat — configuration: ingredients, dishes, stations, palette.
// A fast-paced Indonesian warung time-management cooking game.
export const CANVAS_W = 1280;
export const CANVAS_H = 720;
export const SHIFT_LENGTH = 150;
export const MAX_STRIKES = 3;
export const MAX_ORDERS = 4;

export const INGREDIENTS = {
  roti: { id: 'roti', name: 'Roti', kind: 'ready', color: '#e8b04b' },
  daging: { id: 'daging', name: 'Daging', kind: 'cook', color: '#b5542d', cookTime: 6, burnAfter: 6 },
  selada: { id: 'selada', name: 'Selada', kind: 'chop', color: '#7dc24a' },
  tomat: { id: 'tomat', name: 'Tomat', kind: 'chop', color: '#e14b32' },
  nasi: { id: 'nasi', name: 'Nasi', kind: 'cook', color: '#f2ead8', cookTime: 5, burnAfter: 7 },
  telur: { id: 'telur', name: 'Telur', kind: 'cook', color: '#f7d774', cookTime: 4, burnAfter: 6 },
  ayam: { id: 'ayam', name: 'Ayam', kind: 'cook', color: '#d98a3d', cookTime: 7, burnAfter: 6 },
  mie: { id: 'mie', name: 'Mie', kind: 'cook', color: '#f0c93f', cookTime: 5, burnAfter: 7 },
  sayur: { id: 'sayur', name: 'Sayur', kind: 'chop', color: '#4da24a' },
  saus: { id: 'saus', name: 'Saus', kind: 'ready', color: '#c22f2f' },
  lontong: { id: 'lontong', name: 'Lontong', kind: 'ready', color: '#efe6c8' },
  keju: { id: 'keju', name: 'Keju', kind: 'ready', color: '#ffd94d' },
};

export const TILE_ORDER = [
  'roti', 'daging', 'selada', 'tomat',
  'nasi', 'telur', 'ayam', 'mie',
  'sayur', 'saus', 'lontong', 'keju',
];

export const KIND_LABEL = { ready: 'siap', cook: 'masak', chop: 'potong' };

export const DISHES = {
  burger: {
    id: 'burger', name: 'Burger Kilat', price: 25,
    components: [
      { id: 'roti', state: 'ready' },
      { id: 'daging', state: 'cooked' },
      { id: 'selada', state: 'chopped' },
      { id: 'tomat', state: 'chopped' },
    ],
  },
  nasgor: {
    id: 'nasgor', name: 'Nasi Goreng', price: 30,
    components: [
      { id: 'nasi', state: 'cooked' },
      { id: 'telur', state: 'cooked' },
      { id: 'ayam', state: 'cooked' },
      { id: 'sayur', state: 'chopped' },
    ],
  },
  mieayam: {
    id: 'mieayam', name: 'Mie Ayam', price: 28,
    components: [
      { id: 'mie', state: 'cooked' },
      { id: 'ayam', state: 'cooked' },
      { id: 'sayur', state: 'chopped' },
      { id: 'telur', state: 'cooked' },
    ],
  },
  sate: {
    id: 'sate', name: 'Sate Kilat', price: 22,
    components: [
      { id: 'ayam', state: 'cooked' },
      { id: 'saus', state: 'ready' },
      { id: 'lontong', state: 'ready' },
    ],
  },
  burgerkeju: {
    id: 'burgerkeju', name: 'Burger Keju', price: 32, unlockAt: 60,
    components: [
      { id: 'roti', state: 'ready' },
      { id: 'daging', state: 'cooked' },
      { id: 'keju', state: 'ready' },
      { id: 'selada', state: 'chopped' },
    ],
  },
  nasiayam: {
    id: 'nasiayam', name: 'Nasi Ayam', price: 30, unlockAt: 60,
    components: [
      { id: 'nasi', state: 'cooked' },
      { id: 'ayam', state: 'cooked' },
      { id: 'telur', state: 'cooked' },
      { id: 'saus', state: 'ready' },
    ],
  },
};

export const DISH_ORDER = ['burger', 'nasgor', 'mieayam', 'sate', 'burgerkeju', 'nasiayam'];

// Fixed layout, shared by the renderer and the click handling.
export const LAYOUT = {
  hud: { x: 0, y: 0, w: 1280, h: 88 },
  orders: { x: 20, y: 100, w: 1240, h: 100 },
  stove: { x: 40, y: 224, w: 300, h: 150 },
  chop: { x: 400, y: 224, w: 300, h: 150 },
  plate: { x: 760, y: 224, w: 460, h: 150 },
  tiles: { x: 40, y: 500, w: 92, h: 112, gap: 10 },
  hint: { x: 40, y: 640, w: 1200, h: 56 },
};
