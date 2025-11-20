export type NodeId = string;
export type ServiceId = string;
export type CorrelationId = string;
export type TraceId = string;

export interface Metadata {
  correlationId: CorrelationId;
  traceId: TraceId;
  createdAt: string;
  [key: string]: unknown;
}

export type EdgeEventType =
  | 'EDGE_REQUEST_RECEIVED'
  | 'EDGE_RESPONSE_SENT'
  | 'EDGE_ANOMALY'
  | 'EDGE_METRIC';

export interface EdgeEvent {
  id: string;
  sequence?: number;
  nodeId: NodeId;
  service: ServiceId;
  type: EdgeEventType;
  payload: Record<string, unknown>;
  metadata: Metadata;
}

export type RuntimeEventType = 'PROCESS_START' | 'PROCESS_STOP' | 'PROCESS_FAILURE';

export interface RuntimeEvent {
  id: string;
  runtimeNode: NodeId;
  type: RuntimeEventType;
  payload: Record<string, unknown>;
  metadata: Metadata;
}

export type ResonanceEventType = 'SOMA_SIGNAL' | 'SOMA_ALERT';

export interface ResonanceEvent {
  id: string;
  channel: string;
  type: ResonanceEventType;
  payload: Record<string, unknown>;
  metadata: Metadata;
}

export interface PolicyDecision {
  id: string;
  targetNode: NodeId;
  policy: string;
  issuedAt: string;
  metadata: Metadata;
}

export interface RoutingPolicy {
  id: string;
  name: string;
  version: string;
  rules: Array<{ pattern: string; action: string }>;
}

export interface EdgeEventFilter {
  limit?: number;
  type?: EdgeEventType;
  nodeId?: NodeId;
  fromTimestamp?: string;
  toTimestamp?: string;
  correlationId?: CorrelationId;
}

export interface LtpEnvelope {
  id: string;
  sessionId: string;
  metadata: Metadata;
  payload: Payload;
  type: LtpMessageType;
}

export interface Payload {
  topic: string;
  data: unknown;
}

export enum LtpMessageType {
  Event = 'event',
  Decision = 'decision',
  Control = 'control',
  Telemetry = 'telemetry',
}

export interface LtpSession {
  id: string;
  peerNode: NodeId;
  establishedAt: string;
}

export interface LtpCommand {
  id: string;
  command: string;
  parameters: Record<string, unknown>;
}

export interface ProcessSpec {
  image: string;
  args?: string[];
  env?: Record<string, string>;
}

export type ProcessId = string;

export interface RuntimeHandle {
  id: ProcessId;
  createdAt: string;
}

export type RuntimeState = 'running' | 'stopped' | 'failed';

export interface RuntimeProcessInfo extends RuntimeHandle {
  spec: ProcessSpec;
  state: RuntimeState;
  metadata: Metadata;
  reference?: string;
}

export interface RuntimeStateSummary {
  totalProcesses: number;
  running: number;
  stopped: number;
  failed: number;
  updatedAt: string;
  processes: RuntimeProcessInfo[];
}

export type AwarenessSignalType = 'start-process' | 'update-process' | 'stop-process';

export interface AwarenessSignal {
  id: string;
  decisionId: string;
  type: AwarenessSignalType;
  targetProcessRef: string;
  spec?: ProcessSpec;
  issuedAt: string;
}

export interface HeartbeatState {
  timestamp: string;
  edgeStatus: string;
  storageSize: number;
  resonancePending: number;
  decisionsGenerated: number;
  awarenessDecisions: number;
  runtimeActive: number;
  circulation?: HeartbeatCirculation;
  transmutation?: HeartbeatTransmutation;
  sleep?: HeartbeatSleep;
  homeostasis?: HeartbeatHomeostasis;
  reflex?: HeartbeatReflex;
  perception?: HeartbeatPerception;
  memory?: HeartbeatMemory;
  replay?: HeartbeatReplay;
  intent?: HeartbeatIntent;
  meta?: HeartbeatMeta;
}

export type PulsationPhase = 'compression' | 'expansion';

export interface HeartbeatCirculation {
  flowSpeedMs: number;
  resonanceTemperature: number;
  pressure: number;
  pulsation: PulsationPhase;
  degradationRate: number;
}

export interface CirculationSnapshot extends HeartbeatCirculation {
  timestamp: string;
  loopsCompleted: number;
  saturation: number;
  direction: string;
  lastDecisionId?: string;
}

export interface HeartbeatTransmutation {
  lastMutation: number;
  purified: number;
  entropy: number;
  signalStrength: number;
}

export interface HeartbeatSleep {
  lastSleep: number;
  noiseCleared: number;
  dreamIterations?: number;
}

export interface HeartbeatHomeostasis {
  stressScore: number;
  loadLevel: string;
}

export interface HeartbeatReflex {
  lastActionSeverity: string | null;
  lastActionReason?: string;
  actionsCount: number;
}

export interface HeartbeatPerception {
  noiseLevel: number;
  signalLevel: number;
  anomalies: number;
  status: string;
}

export interface HeartbeatMemory {
  shortTerm: number;
  longTerm: number;
  lastConsolidatedAt: number;
  status: string;
}

export interface HeartbeatReplay {
  lastRunAt: number;
  episodes: number;
  avgIntegrationScore: number;
  reliefScore: number;
  status: string;
}

export interface HeartbeatIntent {
  mode: string;
  allowHeavyTasks: boolean;
  throttleNonCritical: boolean;
  forceSleepSoon: boolean;
  degradedMode: boolean;
}

export interface HeartbeatMeta {
  coherence: number;
  stressTrend: string;
  adaptationPhase: string;
  dominantIntent: string;
  anomalies: string[];
}
