import * as os from 'os';
import * as path from 'path';
import { AgentAdapter } from '../base-adapter';
import { CursorSessionScanner } from './cursor-scanner';
import { Session, ScanOptions } from '../../types';

export class CursorAdapter implements AgentAdapter {
  public readonly agentId = 'cursor';
  public readonly agentName = 'Cursor AI';
  public readonly icon = '$(code)';
  public readonly badgeColor = '#10B981';

  public getDefaultStoragePath(): string {
    return path.join(os.homedir(), '.cursor', 'projects');
  }

  public isEnabled(config?: any): boolean {
    if (!config) return true;
    const enabledAgents: string[] = config.get?.('enabledAgents') || ['claude', 'gemini', 'cursor'];
    return enabledAgents.includes('cursor');
  }

  public getWatchedDirectories(customPath?: string): string[] {
    return CursorSessionScanner.getWatchedDirectories(customPath);
  }

  public async scanSessions(customPath?: string, options?: ScanOptions): Promise<Session[]> {
    return CursorSessionScanner.scanSessions(customPath, options);
  }

  public deleteSession(sessionId: string, filePath: string): boolean {
    return CursorSessionScanner.deleteSession(sessionId, filePath);
  }
}
