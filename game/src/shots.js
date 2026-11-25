// Dapur Kilat — staged states for screenshots. Each shot builds a fixed,
// deterministic mid-game moment with the game's own logic, so the screenshots
// are real renders of the game's code: ?shot=cover, ?shot=play, ?shot=end.
import { DISHES } from './config.js';

function makeOrder(state, dishId, patience, maxPatience) {
  const dish = DISHES[dishId];
  return {
    id: state.nextOrderId++,
    dishId,
    need: dish.components.map((c) => ({ ...c })),
    patience,
    maxPatience,
    born: state.time,
  };
}

export function applyShot(state, name) {
  if (name === 'cover') {
    state.time = 58;
    state.coins = 145;
    state.combo = 2;
    state.bestCombo = 3;
    state.served = 5;
    state.orders = [
      makeOrder(state, 'burger', 30, 38),
      makeOrder(state, 'nasgor', 22, 40),
      makeOrder(state, 'mieayam', 35, 40),
    ];
    state.plate = [
      { id: 'roti', state: 'ready' },
      { id: 'daging', state: 'cooked' },
      { id: 'selada', state: 'chopped' },
    ];
    state.carrying = { id: 'tomat', state: 'chopped' };
    state.stove = [
      { item: { id: 'ayam', progress: 4, cookTime: 7, burnAfter: 6 } },
      { item: null },
    ];
    state.chop = { item: { id: 'selada' }, progress: 1.2, need: 2.2 };
    state.cook = { x: 900, y: 440, tx: 900, ty: 440 };
    state.message = 'Satu tomat lagi, burger siap disajikan!';
    state.messageT = 99;
  } else if (name === 'play') {
    state.time = 105;
    state.coins = 320;
    state.combo = 4;
    state.bestCombo = 5;
    state.served = 9;
    state.orders = [
      makeOrder(state, 'sate', 6, 30),
      makeOrder(state, 'burger', 18, 36),
      makeOrder(state, 'nasgor', 25, 38),
      makeOrder(state, 'burgerkeju', 30, 34),
    ];
    state.plate = [
      { id: 'nasi', state: 'cooked' },
      { id: 'telur', state: 'cooked' },
    ];
    state.carrying = { id: 'ayam', state: 'cooked' };
    state.stove = [
      { item: { id: 'mie', progress: 5.2, cookTime: 5, burnAfter: 7 } },
      { item: { id: 'daging', progress: 2, cookTime: 6, burnAfter: 6 } },
    ];
    state.chop = { item: null, progress: 0, need: 2.2 };
    state.cook = { x: 300, y: 440, tx: 300, ty: 440 };
    state.message = 'Sate hampir hangus! Cepat sajikan!';
    state.messageT = 99;
  } else if (name === 'end') {
    state.status = 'over';
    state.endReason = 'time';
    state.time = 150;
    state.coins = 540;
    state.combo = 0;
    state.bestCombo = 5;
    state.served = 12;
    state.failed = 2;
    state.strikes = 1;
    state.orders = [];
    state.plate = [];
    state.carrying = null;
    state.stove = [{ item: null }, { item: null }];
    state.chop = { item: null, progress: 0, need: 2.2 };
    state.cook = { x: 640, y: 440, tx: 640, ty: 440 };
  }
}
