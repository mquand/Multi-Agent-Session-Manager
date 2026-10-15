import { ClaudeSessionScanner } from './adapters/claude/claude-scanner';

export const SessionScanner = ClaudeSessionScanner;
export type SessionScannerType = typeof ClaudeSessionScanner;
