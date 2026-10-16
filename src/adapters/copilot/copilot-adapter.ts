import * as fs from 'fs';
import { AgentAdapter } from '../base-adapter';
import { CopilotSessionScanner } from './copilot-scanner';
import { Session, ScanOptions } from '../../types';

export class CopilotAdapter implements AgentAdapter {
  public readonly agentId = 'copilot';
  public readonly agentName = 'GitHub Copilot';
  public readonly icon = '$(copilot)';
  public readonly badgeColor = '#6366f1';

  public getDefaultStoragePath(): string {
    return CopilotSessionScanner.getDefaultDbPath();
  }

  public isEnabled(config?: any): boolean {
    if (!config) return true;
    const enabledAgents: string[] = config.get?.('enabledAgents') || ['claude', 'gemini', 'cursor', 'codex', 'copilot'];
    return enabledAgents.includes('copilot');
  }

  public getWatchedDirectories(customPath?: string): string[] {
    return CopilotSessionScanner.getWatchedDirectories(customPath);
  }

  public async scanSessions(customPath?: string, options?: ScanOptions): Promise<Session[]> {
    return CopilotSessionScanner.scanSessions(customPath, options);
  }

  public deleteSession(sessionId: string, filePath: string): boolean {
    return CopilotSessionScanner.deleteSession(sessionId, filePath);
  }
}
