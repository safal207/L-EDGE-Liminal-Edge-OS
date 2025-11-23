#!/usr/bin/env node
// Quick metrics sampler for ontogenesis timeline
// Requires Node 18+ (built-in fetch)

const API = process.env.LIMINAL_API || 'http://localhost:3000';
const LIMIT = Number.parseInt(process.env.LIMINAL_TIMELINE_LIMIT || '128', 10);
const INTERVAL_MS = Number.parseInt(process.env.LIMINAL_INTERVAL_MS || '10000', 10);

function stddev(values) {
  if (values.length <= 1) return 0;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance =
    values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function computeMetrics(timeline) {
  if (!timeline.length) {
    return { L_volatility: 0, S_growth: 0, C_switches: 0 };
  }

  const assemblyPoints = timeline
    .map((item) => item.assemblyPoint)
    .filter((val) => typeof val === 'number');
  const socialAges = timeline
    .map((item) => item.socialAge)
    .filter((val) => typeof val === 'number');
  const roles = timeline.map((item) => item.cosmicRole).filter(Boolean);

  const L_volatility = assemblyPoints.length ? stddev(assemblyPoints) : 0;

  let S_growth = 0;
  if (socialAges.length >= 2) {
    const first = socialAges[0];
    const last = socialAges[socialAges.length - 1];
    S_growth = (last - first) / (socialAges.length - 1);
  }

  let C_switches = 0;
  for (let i = 1; i < roles.length; i += 1) {
    if (roles[i] !== roles[i - 1]) C_switches += 1;
  }

  return { L_volatility, S_growth, C_switches };
}

async function fetchJson(path) {
  const res = await fetch(`${API}${path}`);
  if (!res.ok) {
    throw new Error(`Request failed ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

async function sampleOnce() {
  const [snapshot, timelineResponse] = await Promise.all([
    fetchJson('/api/system/ontogenesis'),
    fetchJson(`/api/system/ontogenesis/timeline?limit=${LIMIT}`),
  ]);

  const timeline = Array.isArray(timelineResponse.timeline)
    ? timelineResponse.timeline
    : [];
  const metrics = computeMetrics(timeline);
  const lastPoint = timeline[timeline.length - 1];

  const line = [
    new Date().toISOString(),
    `AP=${snapshot.assemblyPoint ?? 'n/a'}`,
    `S=${snapshot.socialAge ?? 'n/a'}`,
    `C=${snapshot.cosmicRole ?? 'n/a'}`,
    snapshot.globalMode ? `mode=${snapshot.globalMode}` : 'mode=?',
    `timeline=${timeline.length} pts`,
    `L_volatility=${metrics.L_volatility.toFixed(2)}`,
    `S_growth=${metrics.S_growth.toFixed(2)}`,
    `C_switches=${metrics.C_switches}`,
  ];

  if (lastPoint?.timestamp) {
    line.push(`last_ts=${new Date(lastPoint.timestamp).toISOString()}`);
  }

  console.log(line.join(' | '));
}

async function main() {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      await sampleOnce();
    } catch (err) {
      console.error(`ontogenesis_metrics error: ${err.message}`);
    }
    await new Promise((resolve) => setTimeout(resolve, INTERVAL_MS));
  }
}

main();
