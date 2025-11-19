import { v4 as uuid } from 'uuid';
import { Metadata } from '../core';

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

export interface RuntimeAdapter {
  startProcess(spec: ProcessSpec): Promise<RuntimeHandle>;
  stopProcess(id: ProcessId): Promise<void>;
  getProcessState(id: ProcessId): Promise<RuntimeState>;
}

interface StoredProcess extends RuntimeHandle {
  spec: ProcessSpec;
  state: RuntimeState;
  metadata: Metadata;
}

export class InMemoryRuntimeAdapter implements RuntimeAdapter {
  private readonly processes = new Map<ProcessId, StoredProcess>();

  async startProcess(spec: ProcessSpec): Promise<RuntimeHandle> {
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
    };
    this.processes.set(handle.id, handle);
    console.info('[runtime] start', handle.id, spec.image);
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
}
