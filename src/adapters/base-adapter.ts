import { Session, ScanOptions } from '../types';

export interface AgentAdapter {
  readonly agentId: string;
  readonly agentName: string;
  readonly icon: string;
  readonly badgeColor: string;

  getDefaultStoragePath(): string;
  isEnabled(config?: any): boolean;
  getWatchedDirectories?(customPath?: string): string[];
  scanSessions(customPath?: string, options?: ScanOptions): Promise<Session[]>;
  deleteSession?(sessionId: string, filePath: string): boolean;
  getActiveSessionsMap?(): Map<string, { status: string; pid: number }>;
}
