import { v4 as uuid } from 'uuid';
import { AwarenessSignal, ProcessId, ProcessSpec, RuntimeHandle, RuntimeProcessInfo, RuntimeState, RuntimeStateSummary } from '../core';
import { IntentDecision } from '../intent/types';

export interface RuntimeAdapter {
  startProcess(spec: ProcessSpec, reference?: string): Promise<RuntimeHandle>;
  stopProcess(id: ProcessId): Promise<void>;
  getProcessState(id: ProcessId): Promise<RuntimeState>;
  getSystemState(): Promise<RuntimeStateSummary>;
  applyAwarenessSignal(signal: AwarenessSignal): Promise<void>;
  applyIntentDecision(decision: IntentDecision): Promise<void>;
}

interface StoredProcess extends RuntimeProcessInfo {}

export class InMemoryRuntimeAdapter implements RuntimeAdapter {
  private readonly processes = new Map<ProcessId, StoredProcess>();
  private currentIntent?: IntentDecision;

  async startProcess(spec: ProcessSpec, reference?: string): Promise<RuntimeHandle> {
    const handle: StoredProcess = {
      id: uuid(),
      createdAt: new Date().toISOString(),
      spec,
      state: 'running',
      metadata: {
        correlationId: uuid(),
        traceId: uuid(),
        createdAt: new Date().toISOString(),
      },
      reference,
    };
    this.processes.set(handle.id, handle);
    console.info('[runtime] start', handle.id, spec.image, reference ?? 'no-ref');
    return handle;
  }

  async stopProcess(id: ProcessId): Promise<void> {
    const proc = this.processes.get(id);
    if (proc) {
      proc.state = 'stopped';
      console.info('[runtime] stop', id);
    }
  }

  async getProcessState(id: ProcessId): Promise<RuntimeState> {
    return this.processes.get(id)?.state ?? 'failed';
  }

  async getSystemState(): Promise<RuntimeStateSummary> {
    const processes = Array.from(this.processes.values());
    const running = processes.filter((p) => p.state === 'running').length;
    const stopped = processes.filter((p) => p.state === 'stopped').length;
    const failed = processes.filter((p) => p.state === 'failed').length;
    return {
      totalProcesses: processes.length,
      running,
      stopped,
      failed,
      updatedAt: new Date().toISOString(),
      processes,
    };
  }

  async applyAwarenessSignal(signal: AwarenessSignal): Promise<void> {
    const existing = this.findProcessByRef(signal.targetProcessRef);
    if (signal.type === 'start-process' && signal.spec) {
      if (!existing) {
        await this.startProcess(signal.spec, signal.targetProcessRef);
        return;
      }
      existing.state = 'running';
      existing.spec = signal.spec;
      return;
    }

    if (signal.type === 'update-process' && signal.spec) {
      if (existing) {
        existing.spec = signal.spec;
        console.info('[runtime] update process', existing.id, signal.decisionId);
        return;
      }
      await this.startProcess(signal.spec, signal.targetProcessRef);
      return;
    }

    if (signal.type === 'stop-process' && existing) {
      await this.stopProcess(existing.id);
    }
  }

  async applyIntentDecision(decision: IntentDecision): Promise<void> {
    this.currentIntent = decision;
    if (decision.degradedMode || decision.throttleNonCritical) {
      console.info('[runtime] intent decision applied: energy-save/throttle enabled');
    }
    if (decision.forceSleepSoon) {
      console.info('[runtime] intent decision suggests upcoming sleep');
    }
  }

  private findProcessByRef(reference: string): StoredProcess | undefined {
    return Array.from(this.processes.values()).find((proc) => proc.reference === reference);
  }
}
