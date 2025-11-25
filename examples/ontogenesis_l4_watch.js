#!/usr/bin/env node
// L4-focused watcher: prints mastery, skills, sequence, and cosmic apprentice signals from ontogenesis.
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

function renderMastery(snapshot) {
  const { microMasteryScore, focusStability, actionConsistency, frustrationTolerance } = snapshot;
  if (
    microMasteryScore === undefined &&
    focusStability === undefined &&
    actionConsistency === undefined &&
    frustrationTolerance === undefined
  ) {
    return 'mastery: (no L4 signals yet)';
  }
  return `mastery: micro=${colorize(microMasteryScore)} focus=${colorize(
    focusStability,
  )} action=${colorize(actionConsistency)} frustration=${colorize(frustrationTolerance)}`;
}

function renderSkills(snapshot) {
  const { skillCluster, skillClusterPrimary, skillClusterRichness } = snapshot;
  if (!skillCluster?.length && skillClusterPrimary == null && skillClusterRichness === undefined) {
    return 'skills: (none yet)';
  }
  const list = skillCluster?.length ? skillCluster.join(',') : 'none';
  return `skills: primary=${skillClusterPrimary ?? 'n/a'} | richness=${colorize(
    skillClusterRichness,
  )} | all=[${list}]`;
}

function renderTaskSequence(snapshot) {
  const seq = snapshot.taskSequence;
  if (!seq) return 'sequence: (n/a)';
  return `sequence: reliable=${seq.reliableSteps ?? '?'} / max=${seq.maxSteps ?? '?'} | dropoff=${colorize(
    seq.dropoffRate,
    false,
  )}`;
}

function renderCosmic(snapshot) {
  const { cosmicRole, cosmicApprenticeRole, cosmicApprenticeAlignment, cosmicApprenticeReadiness } = snapshot;
  if (!cosmicApprenticeRole && cosmicApprenticeAlignment === undefined && cosmicApprenticeReadiness === undefined) {
    return `cosmic: role=${cosmicRole ?? 'n/a'}`;
  }
  return `cosmic: role=${cosmicRole ?? 'n/a'} | apprentice=${cosmicApprenticeRole ?? 'n/a'} | align=${colorize(
    cosmicApprenticeAlignment,
  )} | ready=${colorize(cosmicApprenticeReadiness)}`;
}

function renderHeader(snapshot) {
  const { assemblyPoint, socialAge, globalMode } = snapshot;
  return `AP=${assemblyPoint ?? '?'} | S=${socialAge ?? '?'} | mode=${globalMode ?? 'n/a'}`;
}

async function tick() {
  try {
    const snapshot = await fetchJson('/api/system/ontogenesis');
    console.log(
      `[${new Date().toISOString()}] ${renderHeader(snapshot)} | ${renderMastery(snapshot)} | ${renderSkills(
        snapshot,
      )} | ${renderTaskSequence(snapshot)} | ${renderCosmic(snapshot)}`,
    );
  } catch (err) {
    console.error(`[${new Date().toISOString()}] error:`, err.message);
  }
}

console.log(`L4 watcher → ${BASE_URL} every ${INTERVAL_MS}ms (override with LIMINAL_API / LIMINAL_INTERVAL_MS)`);
void tick();
setInterval(tick, INTERVAL_MS);
