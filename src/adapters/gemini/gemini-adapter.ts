import * as os from 'os';
import * as path from 'path';
import { AgentAdapter } from '../base-adapter';
import { GeminiSessionScanner } from './gemini-scanner';
import { Session, ScanOptions } from '../../types';

export class GeminiAdapter implements AgentAdapter {
  public readonly agentId = 'gemini';
  public readonly agentName = 'Gemini / Antigravity';
  public readonly icon = '$(sparkle)';
  public readonly badgeColor = '#4285F4';

  public getDefaultStoragePath(): string {
    const homedir = os.homedir();
    const ideBrain = path.join(homedir, '.gemini', 'antigravity-ide', 'brain');
    if (require('fs').existsSync(ideBrain)) {
      return ideBrain;
    }
    return path.join(homedir, '.gemini', 'antigravity', 'brain');
  }

  public isEnabled(config?: any): boolean {
    if (!config) return true;
    const enabledAgents: string[] = config.get?.('enabledAgents') || ['claude', 'gemini'];
    return enabledAgents.includes('gemini');
  }

  public getWatchedDirectories(customPath?: string): string[] {
    return GeminiSessionScanner.getWatchedDirectories(customPath);
  }

  public async scanSessions(customPath?: string, options?: ScanOptions): Promise<Session[]> {
    return GeminiSessionScanner.scanSessions(customPath, options);
  }

  public deleteSession(sessionId: string, filePath: string): boolean {
    return GeminiSessionScanner.deleteSession(sessionId, filePath);
  }
}
