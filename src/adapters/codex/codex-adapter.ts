import * as os from 'os';
import * as path from 'path';
import { AgentAdapter } from '../base-adapter';
import { CodexSessionScanner } from './codex-scanner';
import { Session, ScanOptions } from '../../types';

export class CodexAdapter implements AgentAdapter {
  public readonly agentId = 'codex';
  public readonly agentName = 'Codex';
  public readonly icon = '$(terminal)';
  public readonly badgeColor = '#10a37f';

  public getDefaultStoragePath(): string {
    return CodexSessionScanner.getDefaultStoragePath();
  }

  public isEnabled(config?: any): boolean {
    if (!config) return true;
    const enabledAgents: string[] = config.get?.('enabledAgents') || ['claude', 'gemini', 'cursor', 'codex'];
    return enabledAgents.includes('codex');
  }

  public getWatchedDirectories(customPath?: string): string[] {
    return CodexSessionScanner.getWatchedDirectories(customPath);
  }

  public async scanSessions(customPath?: string, options?: ScanOptions): Promise<Session[]> {
    return CodexSessionScanner.scanSessions(customPath, options);
  }

  public deleteSession(sessionId: string, filePath: string): boolean {
    return CodexSessionScanner.deleteSession(sessionId, filePath);
  }
}
