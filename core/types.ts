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
