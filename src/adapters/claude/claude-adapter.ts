import * as os from 'os';
import * as path from 'path';
import { AgentAdapter } from '../base-adapter';
import { ClaudeSessionScanner } from './claude-scanner';
import { Session, ScanOptions } from '../../types';

export class ClaudeAdapter implements AgentAdapter {
  public readonly agentId = 'claude';
  public readonly agentName = 'Claude Code';
  public readonly icon = '$(hubot)';
  public readonly badgeColor = '#D97706';

  public getDefaultStoragePath(): string {
    return path.join(os.homedir(), '.claude', 'projects');
  }

  public isEnabled(config?: any): boolean {
    if (!config) return true;
    const enabledAgents: string[] = config.get?.('enabledAgents') || ['claude'];
    return enabledAgents.includes('claude');
  }

  public getWatchedDirectories(customPath?: string): string[] {
    return ClaudeSessionScanner.getWatchedDirectories(customPath);
  }

  public async scanSessions(customPath?: string, options?: ScanOptions): Promise<Session[]> {
    return ClaudeSessionScanner.scanSessions(customPath, options);
  }

  public deleteSession(sessionId: string, filePath: string): boolean {
    return ClaudeSessionScanner.deleteSession(sessionId, filePath);
  }

  public getActiveSessionsMap(): Map<string, { status: string; pid: number }> {
    return ClaudeSessionScanner.getActiveSessionsMap();
  }
}
