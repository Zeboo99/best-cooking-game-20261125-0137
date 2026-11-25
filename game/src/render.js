// Dapur Kilat — canvas renderer. Draws the kitchen, the order board, the
// stations, the cook, the ingredient counter and the HUD from game state.
import {
  CANVAS_W,
  CANVAS_H,
  INGREDIENTS,
  KIND_LABEL,
  TILE_ORDER,
  LAYOUT,
  SHIFT_LENGTH,
} from './config.js';
import * as logic from './logic.js';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, s, x, y, size, color, align = 'left', weight = '600') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px system-ui, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(s, x, y);
}

function bar(ctx, x, y, w, h, frac, color, bg = '#3a2a1a') {
  rr(ctx, x, y, w, h, h / 2);
  ctx.fillStyle = bg;
  ctx.fill();
  if (frac > 0) {
    rr(ctx, x, y, Math.max(h, w * Math.min(1, frac)), h, h / 2);
    ctx.fillStyle = color;
    ctx.fill();
  }
}

// One distinctive drawn shape per ingredient, so every item reads at a glance.
export function drawIngredientIcon(ctx, id, x, y, r) {
  const ing = INGREDIENTS[id];
  if (!ing) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = ing.color;
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 2;
  switch (id) {
    case 'roti':
      ctx.beginPath();
      ctx.arc(0, 2, r, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(-r, 2, r * 2, r * 0.45);
      break;
    case 'daging':
      rr(ctx, -r, -r * 0.55, r * 2, r * 1.1, r * 0.4);
      ctx.fill();
      ctx.strokeStyle = '#5d2f14';
      ctx.beginPath();
      ctx.moveTo(-r * 0.6, -r * 0.2);
      ctx.lineTo(r * 0.6, -r * 0.2);
      ctx.moveTo(-r * 0.6, r * 0.25);
      ctx.lineTo(r * 0.6, r * 0.25);
      ctx.stroke();
      break;
    case 'selada':
    case 'sayur':
      ctx.beginPath();
      ctx.arc(-r * 0.4, 0, r * 0.55, 0, Math.PI * 2);
      ctx.arc(r * 0.4, -r * 0.2, r * 0.55, 0, Math.PI * 2);
      ctx.arc(0, r * 0.35, r * 0.55, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'tomat':
      ctx.beginPath();
      ctx.arc(0, r * 0.1, r * 0.85, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4da24a';
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.7);
      ctx.lineTo(-r * 0.4, -r * 0.15);
      ctx.lineTo(r * 0.4, -r * 0.15);
      ctx.closePath();
      ctx.fill();
      break;
    case 'nasi':
      ctx.beginPath();
      ctx.arc(0, r * 0.3, r * 0.9, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#d9cba6';
      ctx.beginPath();
      ctx.arc(-r * 0.3, -r * 0.1, r * 0.12, 0, Math.PI * 2);
      ctx.arc(r * 0.25, -r * 0.25, r * 0.12, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'telur':
      ctx.beginPath();
      ctx.ellipse(0, 0, r, r * 0.75, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f0a52e';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.45, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'ayam':
      ctx.beginPath();
      ctx.arc(-r * 0.15, -r * 0.1, r * 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f2ead8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(r * 0.35, r * 0.35);
      ctx.lineTo(r * 0.85, r * 0.85);
      ctx.stroke();
      ctx.fillStyle = '#f2ead8';
      ctx.beginPath();
      ctx.arc(r * 0.9, r * 0.7, r * 0.22, 0, Math.PI * 2);
      ctx.arc(r * 0.7, r * 0.95, r * 0.22, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'mie':
      ctx.strokeStyle = ing.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        const yy = -r * 0.5 + i * r * 0.5;
        ctx.moveTo(-r * 0.8, yy);
        ctx.quadraticCurveTo(0, yy + r * 0.35, r * 0.8, yy);
      }
      ctx.stroke();
      break;
    case 'saus':
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.quadraticCurveTo(r * 0.8, r * 0.1, r * 0.55, r * 0.6);
      ctx.quadraticCurveTo(0, r * 1.05, -r * 0.55, r * 0.6);
      ctx.quadraticCurveTo(-r * 0.8, r * 0.1, 0, -r);
      ctx.fill();
      break;
    case 'lontong':
      rr(ctx, -r * 0.9, -r * 0.5, r * 1.8, r, r * 0.3);
      ctx.fill();
      ctx.strokeStyle = '#4da24a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-r * 0.9, 0);
      ctx.lineTo(r * 0.9, 0);
      ctx.stroke();
      break;
    case 'keju':
      ctx.beginPath();
      ctx.moveTo(-r, r * 0.7);
      ctx.lineTo(r, r * 0.7);
      ctx.lineTo(0, -r * 0.8);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#c98f2e';
      ctx.beginPath();
      ctx.arc(-r * 0.25, r * 0.3, r * 0.14, 0, Math.PI * 2);
      ctx.arc(r * 0.3, r * 0.35, r * 0.14, 0, Math.PI * 2);
      ctx.fill();
      break;
    default:
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.8, 0, Math.PI * 2);
      ctx.fill();
  }
  ctx.restore();
}

function stateWord(state) {
  if (state === 'cooked') return 'matang';
  if (state === 'chopped') return 'potong';
  if (state === 'ready') return 'siap';
  return 'mentah';
}

function drawTicket(ctx, order, x, y, w, h, now) {
  const dish = logic.dishOf(order);
  const urgent = order.patience < 8;
  const flash = urgent && Math.floor(now * 3) % 2 === 0;
  rr(ctx, x, y, w, h, 10);
  ctx.fillStyle = flash ? '#ffd9c9' : '#fff3d6';
  ctx.fill();
  ctx.strokeStyle = urgent ? '#c22f2f' : '#b98d4f';
  ctx.lineWidth = urgent ? 3 : 2;
  ctx.stroke();
  text(ctx, `#${order.id} ${dish.name}`, x + 12, y + 26, 19, '#2b1d12', 'left', '800');
  text(ctx, `Rp ${dish.price}`, x + w - 12, y + 26, 17, '#8a5a1d', 'right', '800');
  order.need.forEach((comp, i) => {
    const cx = x + 26 + i * 68;
    drawIngredientIcon(ctx, comp.id, cx, y + 52, 15);
    text(ctx, stateWord(comp.state), cx, y + 82, 11, '#5d4a2f', 'center', '600');
  });
  const frac = order.patience / order.maxPatience;
  const color = frac > 0.5 ? '#4da24a' : frac > 0.25 ? '#e8a13a' : '#c22f2f';
  bar(ctx, x + 12, y + h - 16, w - 24, 8, frac, color);
}

function drawStoveSlot(ctx, slot, x, y, w, h, label) {
  rr(ctx, x, y, w, h, 10);
  ctx.fillStyle = '#241a12';
  ctx.fill();
  ctx.strokeStyle = '#5d4a2f';
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, label, x + w / 2, y + 18, 13, '#c9a86a', 'center', '700');
  const item = slot.item;
  if (!item) {
    text(ctx, 'kosong', x + w / 2, y + h / 2 + 6, 14, '#7a6a55', 'center');
    return;
  }
  drawIngredientIcon(ctx, item.id, x + w / 2, y + 44, 17);
  const burnt = item.progress >= item.cookTime + item.burnAfter;
  const done = item.progress >= item.cookTime;
  const frac = Math.min(1, item.progress / item.cookTime);
  bar(ctx, x + 12, y + h - 22, w - 24, 8, frac, burnt ? '#c22f2f' : done ? '#4da24a' : '#e8a13a');
  text(
    ctx,
    burnt ? 'GOSONG! klik buang' : done ? 'MATANG — klik ambil' : 'Memasak...',
    x + w / 2, y + h - 28, 12, burnt ? '#ff8a7a' : done ? '#9be28a' : '#e8c98a', 'center', '700',
  );
}

function drawStations(ctx, state) {
  const s = LAYOUT.stove;
  rr(ctx, s.x, s.y, s.w, s.h, 12);
  ctx.fillStyle = '#6b4423';
  ctx.fill();
  text(ctx, 'KOMPOR', s.x + 14, s.y + 24, 16, '#ffd9a0', 'left', '800');
  drawStoveSlot(ctx, state.stove[0], s.x + 16, s.y + 36, 128, 100, 'Kompor 1');
  drawStoveSlot(ctx, state.stove[1], s.x + 156, s.y + 36, 128, 100, 'Kompor 2');

  const c = LAYOUT.chop;
  rr(ctx, c.x, c.y, c.w, c.h, 12);
  ctx.fillStyle = '#8a5a2b';
  ctx.fill();
  text(ctx, 'TALENAN', c.x + 14, c.y + 24, 16, '#ffe1b0', 'left', '800');
  rr(ctx, c.x + 16, c.y + 36, c.w - 32, 100, 8);
  ctx.fillStyle = '#c9a86a';
  ctx.fill();
  const chop = state.chop;
  if (chop.item) {
    drawIngredientIcon(ctx, chop.item.id, c.x + 70, c.y + 86, 20);
    const done = chop.progress >= chop.need;
    bar(ctx, c.x + 110, c.y + 80, 150, 10, chop.progress / chop.need, done ? '#4da24a' : '#e8a13a');
    text(ctx, done ? 'Siap diambil!' : 'Potong... klik untuk cepat!', c.x + 110, c.y + 106, 13, '#3a2a1a', 'left', '700');
  } else {
    text(ctx, 'Bawa bahan, klik untuk memotong', c.x + c.w / 2, c.y + 88, 14, '#5d4a2f', 'center');
  }

  const p = LAYOUT.plate;
  rr(ctx, p.x, p.y, p.w, p.h, 12);
  ctx.fillStyle = '#5d3a1e';
  ctx.fill();
  text(ctx, 'PIRING SAJI — klik untuk menambah', p.x + 14, p.y + 24, 15, '#ffd9a0', 'left', '800');
  ctx.beginPath();
  ctx.ellipse(p.x + 150, p.y + 96, 120, 38, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#f2ead8';
  ctx.fill();
  ctx.strokeStyle = '#b98d4f';
  ctx.lineWidth = 3;
  ctx.stroke();
  if (state.plate.length === 0) {
    text(ctx, 'piring kosong', p.x + 150, p.y + 102, 14, '#8a7a5f', 'center');
  } else {
    state.plate.forEach((comp, i) => {
      drawIngredientIcon(ctx, comp.id, p.x + 70 + i * 52, p.y + 96, 16);
    });
  }
  rr(ctx, p.x + 330, p.y + 56, 110, 60, 10);
  ctx.fillStyle = '#c22f2f';
  ctx.fill();
  text(ctx, 'SAMPAH', p.x + 385, p.y + 82, 15, '#fff', 'center', '800');
  text(ctx, 'kosongkan piring', p.x + 385, p.y + 100, 11, '#ffd9c9', 'center');
}

function drawTiles(ctx, state) {
  const t = LAYOUT.tiles;
  text(ctx, 'BAHAN DI MEJA — klik untuk mengambil (tombol 1-9, 0, -, =)', t.x, t.y - 12, 15, '#ffd9a0', 'left', '800');
  TILE_ORDER.forEach((id, i) => {
    const x = t.x + i * (t.w + t.gap);
    const y = t.y;
    const ing = INGREDIENTS[id];
    const held = state.carrying && state.carrying.id === id;
    rr(ctx, x, y, t.w, t.h, 10);
    ctx.fillStyle = held ? '#ffe9b0' : '#fff3d6';
    ctx.fill();
    ctx.strokeStyle = held ? '#e8a13a' : '#b98d4f';
    ctx.lineWidth = held ? 3 : 2;
    ctx.stroke();
    drawIngredientIcon(ctx, id, x + t.w / 2, y + 38, 20);
    text(ctx, ing.name, x + t.w / 2, y + 76, 14, '#2b1d12', 'center', '700');
    text(ctx, KIND_LABEL[ing.kind], x + t.w / 2, y + 94, 11, '#8a5a1d', 'center');
    const key = i < 9 ? String(i + 1) : i === 9 ? '0' : i === 10 ? '-' : '=';
    text(ctx, key, x + 10, y + 18, 12, '#b98d4f', 'left', '700');
  });
}

function drawCook(ctx, state) {
  const { x, y } = state.cook;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#3f6fb5';
  rr(ctx, -16, -6, 32, 34, 8);
  ctx.fill();
  ctx.fillStyle = '#f2ead8';
  rr(ctx, -13, -2, 26, 26, 6);
  ctx.fill();
  ctx.fillStyle = '#f0c49a';
  ctx.beginPath();
  ctx.arc(0, -16, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-6, -28, 8, 0, Math.PI * 2);
  ctx.arc(6, -28, 8, 0, Math.PI * 2);
  ctx.arc(0, -32, 9, 0, Math.PI * 2);
  ctx.fill();
  if (state.carrying) {
    drawIngredientIcon(ctx, state.carrying.id, 0, -52, 14);
    text(ctx, INGREDIENTS[state.carrying.id].name, 0, -72, 12, '#fff', 'center', '700');
  }
  ctx.restore();
}

function drawHud(ctx, state) {
  const left = logic.timeLeft(state);
  const mm = Math.floor(left / 60);
  const ss = String(Math.floor(left % 60)).padStart(2, '0');
  text(ctx, 'DAPUR KILAT', 24, 40, 30, '#ffd9a0', 'left', '900');
  text(ctx, 'warung cepat saji', 24, 66, 14, '#c9a86a', 'left');
  const timerColor = state.status === 'playing' && left <= 30 ? '#ff8a7a' : '#fff3d6';
  text(ctx, `${mm}:${ss}`, 640, 52, 44, timerColor, 'center', '900');
  text(ctx, 'SISA SHIFT', 640, 74, 12, '#c9a86a', 'center', '700');
  text(ctx, `Koin ${state.coins}`, 1000, 40, 24, '#ffd94d', 'left', '800');
  text(ctx, `Combo x${state.combo}`, 1000, 66, 16, '#9be28a', 'left', '700');
  text(ctx, `Gagal ${state.strikes}/3`, 1160, 40, 16, state.strikes > 0 ? '#ff8a7a' : '#c9a86a', 'left', '700');
  rr(ctx, 1180, 56, 76, 26, 6);
  ctx.fillStyle = '#4a3620';
  ctx.fill();
  text(ctx, state.status === 'paused' ? 'LANJUT' : 'JEDA (P)', 1218, 74, 12, '#ffd9a0', 'center', '700');
}

function drawTitle(ctx) {
  ctx.fillStyle = 'rgba(20,12,6,0.82)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  text(ctx, 'DAPUR KILAT', 640, 200, 72, '#ffd9a0', 'center', '900');
  text(ctx, 'Warung cepat saji — masak, sajikan, jangan sampai pelanggan kabur!', 640, 250, 22, '#fff3d6', 'center');
  const lines = [
    '1. Klik bahan di meja bawah untuk mengambilnya.',
    '2. Bahan mentah: masak di KOMPOR atau potong di TALENAN.',
    '3. Klik PIRING SAJI untuk merangkai, lalu klik tiket pesanan untuk menyajikan.',
    '4. Sajikan sebelum sabar pelanggan habis. 3 pesanan hangus = shift berakhir!',
  ];
  lines.forEach((line, i) => text(ctx, line, 640, 290 + i * 30, 18, '#e8c98a', 'center'));
  text(ctx, 'Klik di mana saja atau tekan Enter untuk mulai', 640, 420, 22, '#9be28a', 'center', '800');
  text(ctx, 'Tombol: 1-9, 0, -, = ambil bahan · Spasi sajikan · T buang piring · P jeda · M suara', 640, 452, 15, '#c9a86a', 'center');
}

function drawGameOver(ctx, state) {
  ctx.fillStyle = 'rgba(20,12,6,0.85)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  text(ctx, 'SHIFT SELESAI', 640, 190, 64, '#ffd9a0', 'center', '900');
  const reason = state.endReason === 'strike'
    ? 'Tiga pesanan hangus — pelanggan kecewa dan pulang.'
    : 'Waktu shift habis. Dapur tutup!';
  text(ctx, reason, 640, 236, 20, '#fff3d6', 'center');
  text(ctx, `Koin: ${state.coins}`, 640, 310, 30, '#ffd94d', 'center', '800');
  text(ctx, `Disajikan: ${state.served}   Hangus: ${state.failed}   Combo terbaik: x${state.bestCombo}`, 640, 352, 20, '#e8c98a', 'center');
  text(ctx, logic.rankFor(state.coins), 640, 410, 30, '#9be28a', 'center', '900');
  text(ctx, 'Tekan Enter atau klik untuk main lagi', 640, 460, 20, '#fff3d6', 'center', '800');
}

export function drawGame(ctx, state) {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  const bg = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  bg.addColorStop(0, '#3a2a1a');
  bg.addColorStop(1, '#241a12');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  drawHud(ctx, state);
  text(ctx, 'PAPAN PESANAN — klik tiket untuk menyajikan piring yang cocok', 24, 96, 14, '#c9a86a', 'left', '700');
  const tw = (LAYOUT.orders.w - 3 * 12) / 4;
  for (let i = 0; i < 4; i++) {
    const order = state.orders[i];
    const x = LAYOUT.orders.x + i * (tw + 12);
    if (order) {
      drawTicket(ctx, order, x, LAYOUT.orders.y, tw, LAYOUT.orders.h, state.time);
    } else {
      rr(ctx, x, LAYOUT.orders.y, tw, LAYOUT.orders.h, 10);
      ctx.fillStyle = 'rgba(255,243,214,0.08)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,243,214,0.25)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.stroke();
      ctx.setLineDash([]);
      text(ctx, 'menunggu pelanggan...', x + tw / 2, LAYOUT.orders.y + 56, 14, '#8a7a5f', 'center');
    }
  }
  drawStations(ctx, state);
  text(ctx, 'KOKI — klik stasiun untuk bergerak ke sana', 24, 396, 14, '#c9a86a', 'left', '700');
  drawCook(ctx, state);
  drawTiles(ctx, state);

  const hint = LAYOUT.hint;
  rr(ctx, hint.x, hint.y, hint.w, hint.h, 10);
  ctx.fillStyle = '#17100a';
  ctx.fill();
  const msg = state.messageT > 0 || state.status !== 'playing' ? state.message : '';
  text(ctx, msg || 'Klik bahan → masak/potong → piring → tiket pesanan. Cepat, pelanggan menunggu!', hint.x + 16, hint.y + 34, 17, '#ffd9a0', 'left', '600');

  if (state.status === 'title') drawTitle(ctx);
  if (state.status === 'over') drawGameOver(ctx, state);
  if (state.status === 'paused') {
    ctx.fillStyle = 'rgba(20,12,6,0.7)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    text(ctx, 'JEDA — tekan P untuk lanjut', 640, 360, 36, '#fff3d6', 'center', '800');
  }
}
