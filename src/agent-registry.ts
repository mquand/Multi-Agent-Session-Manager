import { AgentAdapter } from './adapters/base-adapter';
import { Session, ScanOptions } from './types';

export class AgentRegistry {
  private static adapters: Map<string, AgentAdapter> = new Map();

  public static registerAdapter(adapter: AgentAdapter): void {
    this.adapters.set(adapter.agentId, adapter);
  }

  public static getAdapter(agentId: string): AgentAdapter | undefined {
    return this.adapters.get(agentId);
  }

  public static getAllAdapters(): AgentAdapter[] {
    return Array.from(this.adapters.values());
  }

  public static getAll(): AgentAdapter[] {
    return this.getAllAdapters();
  }

  public static getEnabledAdapters(enabledAgentIds?: string[]): AgentAdapter[] {
    const all = this.getAllAdapters();
    if (!enabledAgentIds || enabledAgentIds.length === 0) {
      return all;
    }
    return all.filter(a => enabledAgentIds.includes(a.agentId));
  }

  public static async scanAll(
    enabledAgentIds?: string[],
    storagePaths?: Record<string, string>,
    options?: ScanOptions
  ): Promise<Session[]> {
    const activeAdapters = this.getEnabledAdapters(enabledAgentIds);
    const results = await Promise.allSettled(
      activeAdapters.map(adapter => {
        const customPath = storagePaths ? storagePaths[adapter.agentId] : undefined;
        return adapter.scanSessions(customPath, options);
      })
    );

    const allSessions: Session[] = [];
    for (const res of results) {
      if (res.status === 'fulfilled' && Array.isArray(res.value)) {
        allSessions.push(...res.value);
      }
    }

    return allSessions.sort((a, b) => {
      const score = (s: Session) => (s.status === 'running' ? 3 : s.status === 'need_accept' ? 2 : 1);
      if (score(b) !== score(a)) {
        return score(b) - score(a);
      }
      return b.updatedAt - a.updatedAt;
    });
  }

  public static getAllWatchedDirectories(
    enabledAgentIds?: string[],
    storagePaths?: Record<string, string>
  ): string[] {
    const activeAdapters = this.getEnabledAdapters(enabledAgentIds);
    const dirs: string[] = [];
    for (const adapter of activeAdapters) {
      if (adapter.getWatchedDirectories) {
        const customPath = storagePaths ? storagePaths[adapter.agentId] : undefined;
        dirs.push(...adapter.getWatchedDirectories(customPath));
      }
    }
    return Array.from(new Set(dirs));
  }
}
