#!/usr/bin/env node
// L5-focused watcher: prints meaning, purpose, moral, and cosmic navigator cues from ontogenesis.
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

function colorize(num, goodHigh = true) {
  if (typeof num !== 'number') return 'n/a';
  const value = Number(num);
  const good = goodHigh ? value >= 0.7 : value <= 0.3;
  const warn = goodHigh ? value >= 0.4 && value < 0.7 : value > 0.3 && value <= 0.6;
  const danger = goodHigh ? value < 0.4 : value > 0.6;

  if (good) return `\x1b[32m${fmt(value)}\x1b[0m`; // green
  if (warn) return `\x1b[33m${fmt(value)}\x1b[0m`; // yellow
  if (danger) return `\x1b[31m${fmt(value)}\x1b[0m`; // red
  return fmt(value);
}

function renderHeader(snapshot) {
  const { assemblyPoint, socialAge, globalMode } = snapshot;
  return `AP=${assemblyPoint ?? '?'} | S=${socialAge ?? '?'} | mode=${globalMode ?? 'n/a'}`;
}

function renderMeaning(snapshot) {
  const { meaningCoherence, innerWhyStrength, selfReflectionDepth } = snapshot;
  if (
    meaningCoherence === undefined &&
    innerWhyStrength === undefined &&
    selfReflectionDepth === undefined
  ) {
    return 'meaning: (no L5 signals yet)';
  }
  return `meaning: coh=${colorize(meaningCoherence)} why=${colorize(innerWhyStrength)} self-ref=${colorize(selfReflectionDepth)}`;
}

function renderPurpose(snapshot) {
  const { purposeHorizon, trajectoryDiscipline, replanningFlexibility } = snapshot;
  if (
    purposeHorizon === undefined &&
    trajectoryDiscipline === undefined &&
    replanningFlexibility === undefined
  ) {
    return 'purpose: (n/a)';
  }
  return `purpose: horizon=${colorize(purposeHorizon)} discipline=${colorize(trajectoryDiscipline)} replanning=${colorize(
    replanningFlexibility,
    false,
  )}`;
}

function renderMoral(snapshot) {
  const { moralCare, moralIntegrity, moralCourage } = snapshot;
  if (moralCare === undefined && moralIntegrity === undefined && moralCourage === undefined) {
    return 'moral: (n/a)';
  }
  return `moral: care=${colorize(moralCare)} integrity=${colorize(moralIntegrity)} courage=${colorize(moralCourage)}`;
}

function renderCosmic(snapshot) {
  const { cosmicRole, missionAlignment, directionClarity } = snapshot;
  if (missionAlignment === undefined && directionClarity === undefined) {
    return `cosmic: role=${cosmicRole ?? 'n/a'}`;
  }
  return `cosmic: role=${cosmicRole ?? 'n/a'} dir=${colorize(directionClarity)} align=${colorize(missionAlignment)}`;
}

async function tick() {
  try {
    const snapshot = await fetchJson('/api/system/ontogenesis');
    console.log(
      `[${new Date().toISOString()}] ${renderHeader(snapshot)} | ${renderMeaning(snapshot)} | ${renderPurpose(snapshot)} | ${renderMoral(
        snapshot,
      )} | ${renderCosmic(snapshot)}`,
    );
  } catch (err) {
    console.error(`[${new Date().toISOString()}] error:`, err.message);
  }
}

console.log(`L5 watcher → ${BASE_URL} every ${INTERVAL_MS}ms (override with LIMINAL_API / LIMINAL_INTERVAL_MS)`);
void tick();
setInterval(tick, INTERVAL_MS);
