import * as fs from 'fs';
import { AgentAdapter } from '../base-adapter';
import { WindsurfSessionScanner } from './windsurf-scanner';
import { Session, ScanOptions } from '../../types';

export class WindsurfAdapter implements AgentAdapter {
  public readonly agentId = 'windsurf';
  public readonly agentName = 'Windsurf';
  public readonly icon = '$(terminal-powershell)';
  public readonly badgeColor = '#0284c7';

  public getDefaultStoragePath(): string {
    return WindsurfSessionScanner.getDefaultCascadeDir();
  }

  public isEnabled(config?: any): boolean {
    if (!config) return true;
    const enabledAgents: string[] = config.get?.('enabledAgents') || ['claude', 'gemini', 'cursor', 'codex', 'copilot', 'windsurf'];
    return enabledAgents.includes('windsurf');
  }

  public getWatchedDirectories(customPath?: string): string[] {
    return WindsurfSessionScanner.getWatchedDirectories(customPath);
  }

  public async scanSessions(customPath?: string, options?: ScanOptions): Promise<Session[]> {
    return WindsurfSessionScanner.scanSessions(customPath, options);
  }

  public deleteSession(sessionId: string, filePath: string): boolean {
    return WindsurfSessionScanner.deleteSession(sessionId, filePath);
  }
}
