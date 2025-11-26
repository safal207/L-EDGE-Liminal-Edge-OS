#!/usr/bin/env node
// Minimal watcher that polls the ontogenesis snapshot and timeline for a quick CLI pulse.
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

function renderSnapshot(snapshot) {
  if (!snapshot || snapshot.status) return 'no snapshot yet';
  const { assemblyPoint, socialAge, cosmicRole, globalMode } = snapshot;
  return `AP=${assemblyPoint} | S=${socialAge} | C=${cosmicRole} | mode=${globalMode ?? 'n/a'}`;
}

function renderTimeline(timeline) {
  if (!Array.isArray(timeline) || timeline.length === 0) return 'timeline: (empty)';
  const latest = timeline[timeline.length - 1];
  const first = timeline[0];
  return `timeline: ${timeline.length} pts | first=${new Date(first.timestamp).toISOString()} | latest=${new Date(
    latest.timestamp,
  ).toISOString()}`;
}

async function tick() {
  try {
    const snapshot = await fetchJson('/api/system/ontogenesis');
    const timelineRes = await fetchJson('/api/system/ontogenesis/timeline');
    const timeline = timelineRes.timeline;
    console.log(`[${new Date().toISOString()}] ${renderSnapshot(snapshot)} | ${renderTimeline(timeline)}`);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] error:`, err.message);
  }
}

console.log(`Watching ${BASE_URL} every ${INTERVAL_MS}ms (override with LIMINAL_API / LIMINAL_INTERVAL_MS)`);
void tick();
setInterval(tick, INTERVAL_MS);
