// Dapur Kilat — input handling. Maps mouse clicks and keyboard keys to game
// actions, using the same layout the renderer draws.
import { LAYOUT, TILE_ORDER } from './config.js';
import * as logic from './logic.js';

export function tileRect(i) {
  const t = LAYOUT.tiles;
  return { x: t.x + i * (t.w + t.gap), y: t.y, w: t.w, h: t.h };
}

export function ticketRect(i) {
  const tw = (LAYOUT.orders.w - 3 * 12) / 4;
  return { x: LAYOUT.orders.x + i * (tw + 12), y: LAYOUT.orders.y, w: tw, h: LAYOUT.orders.h };
}

function inside(x, y, r) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

export function handleClick(state, x, y) {
  if (state.status === 'title' || state.status === 'over') {
    logic.startShift(state);
    return;
  }
  if (state.status === 'paused') {
    state.status = 'playing';
    return;
  }

  // Pause button, top right of the HUD.
  if (inside(x, y, { x: 1180, y: 56, w: 76, h: 26 })) {
    state.status = 'paused';
    return;
  }

  // Ingredient tiles along the bottom.
  for (let i = 0; i < TILE_ORDER.length; i++) {
    const r = tileRect(i);
    if (inside(x, y, r)) {
      logic.takeIngredient(state, TILE_ORDER[i]);
      logic.setCookTarget(state, r.x + r.w / 2, r.y - 40);
      return;
    }
  }

  // Stove slots.
  const stove = LAYOUT.stove;
  const slot0 = { x: stove.x + 16, y: stove.y + 36, w: 128, h: 100 };
  const slot1 = { x: stove.x + 156, y: stove.y + 36, w: 128, h: 100 };
  if (inside(x, y, slot0)) {
    logic.setCookTarget(state, slot0.x + 64, slot0.y + 130);
    if (state.stove[0].item) logic.takeFromStove(state, 0);
    else logic.placeOnStove(state, 0);
    return;
  }
  if (inside(x, y, slot1)) {
    logic.setCookTarget(state, slot1.x + 64, slot1.y + 130);
    if (state.stove[1].item) logic.takeFromStove(state, 1);
    else logic.placeOnStove(state, 1);
    return;
  }

  // Chopping board.
  const chop = LAYOUT.chop;
  if (inside(x, y, { x: chop.x + 16, y: chop.y + 36, w: chop.w - 32, h: 100 })) {
    logic.setCookTarget(state, chop.x + chop.w / 2, chop.y + 130);
    if (state.chop.item && state.chop.progress >= state.chop.need) logic.takeFromBoard(state);
    else if (state.chop.item) logic.chopBoost(state);
    else logic.startChop(state);
    return;
  }

  // Plate counter: plate area adds the carried item, trash button empties it.
  const plate = LAYOUT.plate;
  if (inside(x, y, { x: plate.x + 330, y: plate.y + 56, w: 110, h: 60 })) {
    logic.trashPlate(state);
    return;
  }
  if (inside(x, y, { x: plate.x, y: plate.y + 36, w: 300, h: 100 })) {
    logic.setCookTarget(state, plate.x + 150, plate.y + 130);
    logic.addToPlate(state);
    return;
  }

  // Order tickets: serve the plate to the clicked order.
  for (let i = 0; i < 4; i++) {
    if (inside(x, y, ticketRect(i))) {
      const order = state.orders[i];
      if (order) logic.serveOrder(state, order.id);
      return;
    }
  }
}

const TILE_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='];

export function handleKey(state, key) {
  if (key === 'Enter') {
    if (state.status === 'title' || state.status === 'over') logic.startShift(state);
    else if (state.status === 'playing') logic.serveFirstMatch(state);
    return;
  }
  if (state.status === 'title' || state.status === 'over') return;
  if (key === 'p' || key === 'P') {
    state.status = state.status === 'paused' ? 'playing' : 'paused';
    return;
  }
  if (key === 'm' || key === 'M') {
    state.muted = !state.muted;
    return;
  }
  if (state.status !== 'playing') return;
  if (key === ' ') {
    logic.serveFirstMatch(state);
    return;
  }
  if (key === 't' || key === 'T') {
    logic.trashPlate(state);
    return;
  }
  if (key === 'c' || key === 'C') {
    logic.chopBoost(state);
    return;
  }
  const tileIndex = TILE_KEYS.indexOf(key);
  if (tileIndex >= 0) logic.takeIngredient(state, TILE_ORDER[tileIndex]);
}
