// Dapur Kilat — pure game logic. No DOM, no canvas: the state machine runs in a
// browser or in Node, so a full playthrough can be tested headlessly.
import {
  SHIFT_LENGTH,
  MAX_STRIKES,
  MAX_ORDERS,
  INGREDIENTS,
  DISHES,
  DISH_ORDER,
} from './config.js';
import { makeRng, pick } from './rng.js';

export function createGame(seed = 7) {
  return {
    seed,
    rng: makeRng(seed),
    status: 'title',
    time: 0,
    coins: 0,
    served: 0,
    failed: 0,
    strikes: 0,
    combo: 0,
    bestCombo: 0,
    carrying: null,
    plate: [],
    chop: { item: null, progress: 0, need: 2.2 },
    stove: [{ item: null }, { item: null }],
    orders: [],
    nextOrderId: 1,
    orderTimer: 0.5,
    cook: { x: 640, y: 440, tx: 640, ty: 440 },
    message: 'Klik MULAI atau tekan Enter untuk buka warung!',
    messageT: 0,
    muted: false,
    endReason: '',
  };
}

export function unlockedDishes(state) {
  return DISH_ORDER.filter((id) => (DISHES[id].unlockAt ?? 0) <= state.time);
}

export function dishOf(order) {
  return DISHES[order.dishId];
}

export function spawnOrder(state) {
  const dishId = pick(state.rng, unlockedDishes(state));
  const dish = DISHES[dishId];
  const maxPatience = 42 - Math.min(12, state.time * 0.06);
  state.orders.push({
    id: state.nextOrderId++,
    dishId,
    need: dish.components.map((c) => ({ ...c })),
    patience: maxPatience,
    maxPatience,
    born: state.time,
  });
}

export function startShift(state) {
  state.status = 'playing';
  state.time = 0;
  state.coins = 0;
  state.served = 0;
  state.failed = 0;
  state.strikes = 0;
  state.combo = 0;
  state.bestCombo = 0;
  state.carrying = null;
  state.plate = [];
  state.chop = { item: null, progress: 0, need: 2.2 };
  state.stove = [{ item: null }, { item: null }];
  state.orders = [];
  state.nextOrderId = 1;
  state.orderTimer = 0.5;
  state.cook = { x: 640, y: 440, tx: 640, ty: 440 };
  state.message = 'Shift dimulai! Layani pelanggan secepatnya!';
  state.messageT = 2.5;
  state.endReason = '';
}

export function endShift(state, reason) {
  state.status = 'over';
  state.endReason = reason;
  state.message = '';
}

export function setMessage(state, text) {
  state.message = text;
  state.messageT = 2.5;
}

export function setCookTarget(state, x, y) {
  state.cook.tx = x;
  state.cook.ty = y;
}

export function takeIngredient(state, id) {
  if (state.status !== 'playing') return false;
  if (state.carrying) {
    setMessage(state, 'Tangan penuh! Letakkan dulu.');
    return false;
  }
  const ing = INGREDIENTS[id];
  if (!ing) return false;
  state.carrying = { id, state: ing.kind === 'ready' ? 'ready' : 'raw' };
  setCookTarget(state, 640, 520);
  return true;
}

export function placeOnStove(state, slotIndex) {
  if (state.status !== 'playing') return false;
  const slot = state.stove[slotIndex];
  if (!slot || slot.item) {
    setMessage(state, 'Kompor penuh!');
    return false;
  }
  const c = state.carrying;
  if (!c || c.state !== 'raw') {
    setMessage(state, 'Bawa bahan mentah dulu.');
    return false;
  }
  const ing = INGREDIENTS[c.id];
  if (ing.kind !== 'cook') {
    setMessage(state, ing.name + ' tidak perlu dimasak.');
    return false;
  }
  slot.item = { id: c.id, progress: 0, cookTime: ing.cookTime, burnAfter: ing.burnAfter };
  state.carrying = null;
  return true;
}

export function takeFromStove(state, slotIndex) {
  if (state.status !== 'playing') return false;
  const slot = state.stove[slotIndex];
  if (!slot || !slot.item) return false;
  if (state.carrying) {
    setMessage(state, 'Tangan penuh!');
    return false;
  }
  const item = slot.item;
  if (item.progress >= item.cookTime + item.burnAfter) {
    slot.item = null;
    setMessage(state, 'Gosong! Dibuang ke tempat sampah.');
    return true;
  }
  if (item.progress < item.cookTime) {
    setMessage(state, 'Belum matang!');
    return false;
  }
  state.carrying = { id: item.id, state: 'cooked' };
  slot.item = null;
  return true;
}

export function startChop(state) {
  if (state.status !== 'playing') return false;
  if (state.chop.item) {
    setMessage(state, 'Talenan sedang dipakai!');
    return false;
  }
  const c = state.carrying;
  if (!c || c.state !== 'raw') {
    setMessage(state, 'Bawa bahan mentah dulu.');
    return false;
  }
  const ing = INGREDIENTS[c.id];
  if (ing.kind !== 'chop') {
    setMessage(state, ing.name + ' tidak perlu dipotong.');
    return false;
  }
  state.chop.item = { id: c.id };
  state.chop.progress = 0;
  state.carrying = null;
  return true;
}

export function chopBoost(state) {
  if (state.status !== 'playing' || !state.chop.item) return false;
  state.chop.progress += 0.6;
  return true;
}

export function takeFromBoard(state) {
  if (state.status !== 'playing') return false;
  if (!state.chop.item) return false;
  if (state.carrying) {
    setMessage(state, 'Tangan penuh!');
    return false;
  }
  if (state.chop.progress < state.chop.need) {
    setMessage(state, 'Belum selesai dipotong!');
    return false;
  }
  state.carrying = { id: state.chop.item.id, state: 'chopped' };
  state.chop.item = null;
  state.chop.progress = 0;
  return true;
}

export function addToPlate(state) {
  if (state.status !== 'playing') return false;
  const c = state.carrying;
  if (!c) {
    setMessage(state, 'Tidak ada yang dibawa.');
    return false;
  }
  if (c.state === 'raw') {
    setMessage(state, 'Bahan mentah tidak bisa disajikan!');
    return false;
  }
  if (state.plate.length >= 4) {
    setMessage(state, 'Piring penuh!');
    return false;
  }
  state.plate.push({ id: c.id, state: c.state });
  state.carrying = null;
  return true;
}

function componentKey(c) {
  return c.id + ':' + c.state;
}

export function plateMatches(plate, dish) {
  if (plate.length !== dish.components.length) return false;
  const have = plate.map(componentKey).sort();
  const want = dish.components.map(componentKey).sort();
  return have.every((k, i) => k === want[i]);
}

export function serveOrder(state, orderId) {
  if (state.status !== 'playing') return false;
  const order = state.orders.find((o) => o.id === orderId);
  if (!order) return false;
  const dish = dishOf(order);
  if (!plateMatches(state.plate, dish)) {
    setMessage(state, 'Piring belum cocok dengan pesanan!');
    return false;
  }
  const tip = Math.round((order.patience / order.maxPatience) * 10);
  const earned = dish.price + tip + state.combo * 2;
  state.coins += earned;
  state.served += 1;
  state.combo += 1;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  state.orders = state.orders.filter((o) => o.id !== orderId);
  state.plate = [];
  setMessage(state, `Mantap! ${dish.name} tersaji, +${earned} koin!`);
  return true;
}

export function serveFirstMatch(state) {
  if (state.status !== 'playing') return false;
  for (const order of state.orders) {
    if (plateMatches(state.plate, dishOf(order))) return serveOrder(state, order.id);
  }
  setMessage(state, 'Tidak ada pesanan yang cocok dengan piring.');
  return false;
}

export function trashPlate(state) {
  if (state.status !== 'playing') return false;
  if (state.plate.length === 0 && !state.carrying) return false;
  state.plate = [];
  state.carrying = null;
  setMessage(state, 'Piring dikosongkan.');
  return true;
}

export function update(state, dt) {
  if (state.status !== 'playing') return;
  state.time += dt;
  if (state.messageT > 0) state.messageT -= dt;

  const c = state.cook;
  const dx = c.tx - c.x;
  const dy = c.ty - c.y;
  const dist = Math.hypot(dx, dy);
  if (dist > 2) {
    const step = Math.min(dist, 340 * dt);
    c.x += (dx / dist) * step;
    c.y += (dy / dist) * step;
  }

  for (const slot of state.stove) {
    if (slot.item) slot.item.progress += dt;
  }
  if (state.chop.item) state.chop.progress += dt;

  state.orderTimer -= dt;
  if (state.orderTimer <= 0 && state.orders.length < MAX_ORDERS) {
    spawnOrder(state);
    state.orderTimer = Math.max(9, 14 - state.time * 0.02);
  }

  for (const order of [...state.orders]) {
    order.patience -= dt;
    if (order.patience <= 0) {
      state.orders = state.orders.filter((o) => o.id !== order.id);
      state.failed += 1;
      state.strikes += 1;
      state.combo = 0;
      setMessage(state, `Pesanan ${dishOf(order).name} hangus! Pelanggan pergi.`);
      if (state.strikes >= MAX_STRIKES) {
        endShift(state, 'strike');
        return;
      }
    }
  }

  if (state.time >= SHIFT_LENGTH) endShift(state, 'time');
}

export function tipFor(order) {
  return Math.round((order.patience / order.maxPatience) * 10);
}

export function rankFor(coins) {
  if (coins >= 600) return 'Koki Bintang 5';
  if (coins >= 450) return 'Koki Bintang 4';
  if (coins >= 300) return 'Koki Bintang 3';
  if (coins >= 150) return 'Koki Bintang 2';
  return 'Koki Bintang 1';
}

export function timeLeft(state) {
  return Math.max(0, SHIFT_LENGTH - state.time);
}
