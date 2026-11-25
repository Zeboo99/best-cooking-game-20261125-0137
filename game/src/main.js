// Dapur Kilat — entry point. Wires the canvas, the game loop, input and the
// staged screenshot mode (?shot=cover|play|end freezes the state for a shot).
import { CANVAS_W, CANVAS_H } from './config.js';
import * as logic from './logic.js';
import { drawGame } from './render.js';
import { handleClick, handleKey } from './input.js';
import { applyShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const state = logic.createGame(7);
const params = new URLSearchParams(location.search);
const shot = params.get('shot');
let shotMode = false;
if (shot) {
  logic.startShift(state);
  applyShot(state, shot);
  shotMode = true;
}

// Surface script errors in the title so a headless check can see them.
window.addEventListener('error', (e) => {
  document.title = 'ERR: ' + e.message;
});

let audioCtx = null;
function ensureAudio() {
  if (state.muted) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') void audioCtx.resume();
  } catch {
    audioCtx = null;
  }
}

function beep(freq, dur) {
  if (!audioCtx || state.muted) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.value = freq;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + dur);
  } catch {
    // Sound is decoration; never break the game.
  }
}

canvas.addEventListener('pointerdown', (e) => {
  ensureAudio();
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (CANVAS_W / rect.width);
  const y = (e.clientY - rect.top) * (CANVAS_H / rect.height);
  const before = state.coins;
  handleClick(state, x, y);
  beep(state.coins > before ? 880 : 520, 0.06);
});

window.addEventListener('keydown', (e) => {
  if (e.key === ' ' || e.key.startsWith('Arrow')) e.preventDefault();
  handleKey(state, e.key);
});

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (!shotMode) logic.update(state, dt);
  drawGame(ctx, state);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
