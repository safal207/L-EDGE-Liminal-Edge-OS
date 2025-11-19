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
}
