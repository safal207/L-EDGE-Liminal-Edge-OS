import { v4 as uuidv4 } from 'uuid';
import { clamp } from '../meta/patternDetector';
import {
  FieldResonance,
  PeerResonance,
  PeerSnapshotInput,
  SelfResonance,
  SocialRecommendation,
  SocialResonanceContext,
  SocialResonanceEngineOptions,
  SocialResonanceState,
  SocialResonanceSummary,
} from './contracts';

export class SocialResonanceEngine {
  private readonly maxHistory: number;
  private readonly maxPeers: number;
  private state: SocialResonanceState;

  constructor(options?: SocialResonanceEngineOptions) {
    this.maxHistory = options?.maxHistory ?? 100;
    this.maxPeers = options?.maxPeers ?? 80;
    const baseline = this.buildSummary({});
    this.state = { summary: baseline, peers: [], history: [baseline] };
  }

  evaluate(context: SocialResonanceContext): SocialResonanceState {
    this.mergePeers(context.peers ?? []);
    const summary = this.buildSummary({ ...context, peers: this.state.peers });
    const history = this.trimHistory([...this.state.history, summary]);

    this.state = { summary, peers: this.state.peers, history };
    return this.state;
  }

  upsertPeer(peer: PeerSnapshotInput): void {
    this.mergePeers([peer]);
  }

  listPeers(limit: number): PeerResonance[] {
    return this.state.peers.slice(-limit).reverse();
  }

  listHistory(limit: number): SocialResonanceSummary[] {
    return this.state.history.slice(-limit).reverse();
  }

  getState(): SocialResonanceState {
    return this.state;
  }

  clear(): void {
    const baseline = this.buildSummary({});
    this.state = { summary: baseline, peers: [], history: [baseline] };
  }

  private buildSummary(context: SocialResonanceContext): SocialResonanceSummary {
    const selfResonance = this.computeSelfResonance(context);
    const fieldResonance = this.computeFieldResonance(context);
    const peers = this.computePeerResonance(context.peers ?? []);
    const recommendation = this.computeRecommendation(selfResonance, fieldResonance, peers, context);

    return {
      selfResonance,
      peerResonance: peers,
      fieldResonance,
      recommendation,
      lastUpdated: Date.now(),
    } satisfies SocialResonanceSummary;
  }

  private computeSelfResonance(context: SocialResonanceContext): SelfResonance {
    const metaCoherence = context.meta?.summary.coherence ?? 0.5;
    const tension = clamp(
      (context.homeostasis?.stressScore ?? 0) * 0.5 +
        (context.interoception?.tension ?? 0) * 0.3 +
        (context.emotion?.contributors.tension ?? 0) * 0.2,
    );
    const coherence = clamp(metaCoherence * 0.6 + (1 - (context.interoception?.entropyPressure ?? 0)) * 0.2 + (1 - tension) * 0.2);
    const score = clamp(coherence * 0.7 + (1 - tension) * 0.3);

    const annotations: string[] = [];
    if (tension > 0.75) annotations.push('self.tension-high');
    if (coherence < 0.4) annotations.push('self.coherence-low');
    if (score > 0.75) annotations.push('self.resonant');
    if (score < 0.35) annotations.push('self.fragmented');

    return { score, coherence, tension, annotations } satisfies SelfResonance;
  }

  private computeFieldResonance(context: SocialResonanceContext): FieldResonance {
    const pressure = clamp((context.perception?.pressure ?? 0) * 0.6 + (context.homeostasis?.stressScore ?? 0) * 0.4);
    const opportunity = clamp((context.perception?.opportunityScore ?? 0) * 0.8 + (1 - (context.interoception?.fatigue ?? 0)) * 0.2);
    const dissonance = clamp((context.perception?.threatScore ?? 0) * 0.6 + (context.interoception?.entropyPressure ?? 0) * 0.4);
    const status: FieldResonance['status'] =
      dissonance > 0.85 || pressure > 0.9 ? 'overloaded' : dissonance > 0.55 || pressure > 0.6 ? 'charged' : 'calm';

    return { pressure, opportunity, dissonance, status } satisfies FieldResonance;
  }

  private computePeerResonance(peers: PeerSnapshotInput[]): PeerResonance[] {
    return this.trimPeers(
      peers.map((peer) => ({
        id: peer.id || uuidv4(),
        alignment: clamp(peer.alignment ?? 0.5),
        syncPotential: clamp(peer.syncPotential ?? 0.5),
        tension: clamp(peer.tension ?? 0.3),
        lastSeen: peer.lastSeen ?? Date.now(),
        tags: peer.tags ?? [],
      })),
    );
  }

  private computeRecommendation(
    selfResonance: SelfResonance,
    fieldResonance: FieldResonance,
    peers: PeerResonance[],
    context: SocialResonanceContext,
  ): SocialRecommendation {
    const highestPeer = peers.reduce<PeerResonance | undefined>((best, peer) => {
      if (!best) return peer;
      return peer.syncPotential + peer.alignment > best.syncPotential + best.alignment ? peer : best;
    }, undefined);

    if (fieldResonance.status === 'overloaded' || selfResonance.tension > 0.85) {
      return {
        action: 'shield',
        priority: 1,
        reason: 'field-overloaded',
        targetPeerId: highestPeer?.id,
      } satisfies SocialRecommendation;
    }

    if (fieldResonance.status === 'charged' && (selfResonance.tension > 0.65 || (context.intent?.mode === 'DEGRADED' || context.intent?.mode === 'CRITICAL'))) {
      return {
        action: 'detach',
        priority: 0.85,
        reason: 'high-tension',
        targetPeerId: highestPeer?.id,
      } satisfies SocialRecommendation;
    }

    if (highestPeer && highestPeer.alignment > 0.65 && highestPeer.syncPotential > 0.6 && fieldResonance.opportunity >= fieldResonance.pressure) {
      return {
        action: 'align',
        priority: 0.75,
        reason: 'peer-alignment',
        targetPeerId: highestPeer.id,
      } satisfies SocialRecommendation;
    }

    if (fieldResonance.opportunity > 0.6) {
      return {
        action: 'amplify',
        priority: 0.6,
        reason: 'opportunity-window',
      } satisfies SocialRecommendation;
    }

    if (selfResonance.score < 0.45 || peers.every((peer) => peer.alignment < 0.4)) {
      return { action: 'observe', priority: 0.4, reason: 'low-alignment' } satisfies SocialRecommendation;
    }

    return { action: 'observe', priority: 0.2, reason: 'steady' } satisfies SocialRecommendation;
  }

  private mergePeers(peers: PeerSnapshotInput[]): void {
    if (!peers.length) return;
    const merged = [...this.state.peers];
    peers.forEach((incoming) => {
      const index = merged.findIndex((peer) => peer.id === incoming.id);
      const normalized: PeerResonance = {
        id: incoming.id || uuidv4(),
        alignment: clamp(incoming.alignment ?? 0.5),
        syncPotential: clamp(incoming.syncPotential ?? 0.5),
        tension: clamp(incoming.tension ?? 0.3),
        lastSeen: incoming.lastSeen ?? Date.now(),
        tags: incoming.tags ?? [],
      };
      if (index >= 0) {
        merged[index] = { ...merged[index], ...normalized };
      } else {
        merged.push(normalized);
      }
    });
    this.state.peers = this.trimPeers(merged);
  }

  private trimHistory(history: SocialResonanceSummary[]): SocialResonanceSummary[] {
    if (history.length <= this.maxHistory) return history;
    return history.slice(history.length - this.maxHistory);
  }

  private trimPeers<T extends PeerResonance>(peers: T[]): T[] {
    if (peers.length <= this.maxPeers) return peers;
    return peers.slice(peers.length - this.maxPeers);
  }
}
