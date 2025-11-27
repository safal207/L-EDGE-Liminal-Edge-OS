#!/usr/bin/env node
// L0 orientation watcher: prints balance of L/S/C axes from ontogenesis snapshot.
// Requires Node.js 18+ for native fetch.

const BASE_URL = process.env.LIMINAL_API || 'http://localhost:3000';
const INTERVAL_MS = Number(process.env.LIMINAL_INTERVAL_MS || 5000);

async function fetchJson(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) {
    throw new Error(`Request failed ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

function fmt(num, digits = 2) {
  return typeof num === 'number' ? num.toFixed(digits) : 'n/a';
}

function colorByBalance(value) {
  if (typeof value !== 'number') return 'n/a';
  const reset = '\x1b[0m';
  const green = '\x1b[32m';
  const yellow = '\x1b[33m';
  const red = '\x1b[31m';

  if (value >= 0.8) return `${green}${fmt(value)}${reset}`;
  if (value >= 0.6) return `${yellow}${fmt(value)}${reset}`;
  return `${red}${fmt(value)}${reset}`;
}

function colorAxis(value) {
  if (typeof value !== 'number') return 'n/a';
  const reset = '\x1b[0m';
  const green = '\x1b[32m';
  const yellow = '\x1b[33m';
  const red = '\x1b[31m';

  if (value >= 0.65) return `${green}${fmt(value)}${reset}`;
  if (value >= 0.45) return `${yellow}${fmt(value)}${reset}`;
  return `${red}${fmt(value)}${reset}`;
}

function renderOrientation(snapshot) {
  const orientation = snapshot.orientation;
  if (!orientation) return 'L0-center: (no data yet)';

  const { L_level, S_level, C_level, balanceIndex, mode, dominantAxis, starvedAxis, note } = orientation;

  const header = `L0-center: L=${colorAxis(L_level)} S=${colorAxis(S_level)} C=${colorAxis(
    C_level,
  )} balance=${colorByBalance(balanceIndex)} mode=${mode ?? 'n/a'}`;
  const axes = `  dominant=${dominantAxis ?? 'none'} starved=${starvedAxis ?? 'none'}`;
  const noteLine = note ? `  note: ${note}` : '';
  return [header, axes, noteLine].filter(Boolean).join('\n');
}

async function tick() {
  try {
    const snapshot = await fetchJson('/api/system/ontogenesis');
    console.log(`[${new Date().toISOString()}]\n${renderOrientation(snapshot)}`);
    console.log('-----------------------------------------------------');
  } catch (err) {
    console.error(`[${new Date().toISOString()}] error:`, err.message);
  }
}

console.log(`L0 orientation watcher → ${BASE_URL} every ${INTERVAL_MS}ms (override with LIMINAL_API / LIMINAL_INTERVAL_MS)`);
void tick();
setInterval(tick, INTERVAL_MS);
