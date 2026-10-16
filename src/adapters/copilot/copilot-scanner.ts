import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { Session, SessionStatus, ScanOptions } from '../../types';

export class CopilotSessionScanner {
  private static readonly CACHE_VERSION = 1;
  private static sessionCache = new Map<string, { session: Session; mtimeMs: number; cacheVersion?: number }>();

  public static resolveHomePath(p: string): string {
    if (p.startsWith('~/') || p === '~') {
      return path.join(os.homedir(), p.slice(1));
    }
    return p;
  }

  /**
   * Thư mục mặc định chứa session-store.db của GitHub Copilot Chat
   */
  public static getDefaultDbPath(): string {
    const homedir = os.homedir();
    if (process.platform === 'win32') {
      const appData = process.env.APPDATA || path.join(homedir, 'AppData', 'Roaming');
      return path.join(appData, 'Code', 'User', 'globalStorage', 'github.copilot-chat', 'session-store.db');
    } else if (process.platform === 'darwin') {
      return path.join(homedir, 'Library', 'Application Support', 'Code', 'User', 'globalStorage', 'github.copilot-chat', 'session-store.db');
    } else {
      return path.join(homedir, '.config', 'Code', 'User', 'globalStorage', 'github.copilot-chat', 'session-store.db');
    }
  }

  public static getWatchedDirectories(customPath?: string): string[] {
    const dbPath = customPath ? this.resolveHomePath(customPath) : this.getDefaultDbPath();
    const parentDir = path.dirname(dbPath);
    if (fs.existsSync(parentDir)) {
      return [parentDir];
    }
    return [];
  }

  public static deleteSession(sessionId: string, dbPath?: string): boolean {
    const targetDb = dbPath ? this.resolveHomePath(dbPath) : this.getDefaultDbPath();
    if (!fs.existsSync(targetDb)) return false;

    try {
      // Sử dụng node:sqlite để xoá phiên khỏi database
      const { DatabaseSync } = require('node:sqlite');
      const db = new DatabaseSync(targetDb);
      try {
        db.prepare('DELETE FROM turns WHERE session_id = ?').run(sessionId);
        db.prepare('DELETE FROM session_files WHERE session_id = ?').run(sessionId);
        db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
      } finally {
        try { db.close(); } catch {}
      }
      this.sessionCache.delete(sessionId);
      return true;
    } catch (err) {
      console.error('Lỗi khi xoá session Copilot:', err);
      return false;
    }
  }

  private static formatTokens(tokens: number): string {
    if (tokens >= 1_000_000_000) return (tokens / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
    if (tokens >= 1_000_000) return (tokens / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (tokens >= 1_000) return (tokens / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
    return tokens.toLocaleString();
  }

  public static async scanSessions(customPath?: string, options?: ScanOptions): Promise<Session[]> {
    const dbPath = customPath ? this.resolveHomePath(customPath) : this.getDefaultDbPath();
    if (!fs.existsSync(dbPath)) return [];

    let dbStat: fs.Stats;
    try {
      dbStat = fs.statSync(dbPath);
    } catch {
      return [];
    }

    try {
      const { DatabaseSync } = require('node:sqlite');
      const db = new DatabaseSync(dbPath, { readOnly: true });
      let rows: any[] = [];
      try {
        rows = db.prepare(
          'SELECT id, cwd, repository, branch, summary, agent_name, created_at, updated_at FROM sessions ORDER BY updated_at DESC LIMIT 50'
        ).all();
      } finally {
        try { db.close(); } catch {}
      }

      const sessions: Session[] = [];
      const now = Date.now();

      for (const row of rows) {
        const id: string = row.id;
        const updatedAtTime = row.updated_at ? new Date(row.updated_at).getTime() : dbStat.mtimeMs;
        const mtimeMs = isNaN(updatedAtTime) ? dbStat.mtimeMs : updatedAtTime;

        // Kiểm tra cache
        const cached = this.sessionCache.get(id);
        if (cached && cached.cacheVersion === this.CACHE_VERSION && cached.mtimeMs === mtimeMs) {
          const diffMinutes = Math.floor((now - mtimeMs) / (60 * 1000));
          if (diffMinutes < 1) {
            cached.session.statusMessage = 'vừa xong';
          } else if (diffMinutes < 60) {
            cached.session.statusMessage = `${diffMinutes} phút trước`;
          } else if (diffMinutes < 1440) {
            cached.session.statusMessage = `${Math.floor(diffMinutes / 60)} giờ trước`;
          } else {
            cached.session.statusMessage = `${Math.floor(diffMinutes / 1440)} ngày trước`;
          }
          sessions.push(cached.session);
          continue;
        }

        // Lấy turns chi tiết nếu cần
        let turnCount = 0;
        let lastUserPrompt = '';
        let lastAssistantResponse = '';

        try {
          const db2 = new DatabaseSync(dbPath, { readOnly: true });
          try {
            const countRow = db2.prepare('SELECT count(*) as cnt FROM turns WHERE session_id = ?').get(id) as any;
            if (countRow) turnCount = countRow.cnt || 0;

            const lastTurn = db2.prepare(
              'SELECT user_message, assistant_response FROM turns WHERE session_id = ? ORDER BY turn_index DESC LIMIT 1'
            ).get(id) as any;

            if (lastTurn) {
              if (lastTurn.user_message) {
                lastUserPrompt = String(lastTurn.user_message).trim();
              }
              if (lastTurn.assistant_response) {
                lastAssistantResponse = String(lastTurn.assistant_response).trim();
              }
            }
          } finally {
            try { db2.close(); } catch {}
          }
        } catch {}

        // Trích xuất Repo
        let repo = '';
        if (row.repository) {
          const matchGit = String(row.repository).match(/\/([^\/\s\x00"\.]+)(?:\.git)?$/);
          if (matchGit) {
            repo = matchGit[1];
          } else {
            repo = path.basename(String(row.repository));
          }
        }
        if (!repo && row.cwd) {
          repo = path.basename(row.cwd);
        }
        if (!repo) {
          repo = options?.defaultRepo || 'copilot-workspace';
        }

        const branch = row.branch || '';
        const title = row.summary || (lastUserPrompt ? lastUserPrompt.replace(/\r?\n.*/s, '').substring(0, 70) : `Copilot Session ${id.substring(0, 8)}`);

        const diffMinutes = Math.floor((now - mtimeMs) / (60 * 1000));
        let status: SessionStatus = 'done';
        if (diffMinutes < 5) {
          status = 'running';
        }

        let statusMessage = '';
        if (diffMinutes < 1) {
          statusMessage = 'vừa xong';
        } else if (diffMinutes < 60) {
          statusMessage = `${diffMinutes} phút trước`;
        } else if (diffMinutes < 1440) {
          statusMessage = `${Math.floor(diffMinutes / 60)} giờ trước`;
        } else {
          statusMessage = `${Math.floor(diffMinutes / 1440)} ngày trước`;
        }

        const session: Session = {
          id,
          agentId: 'copilot',
          agentName: 'GitHub Copilot',
          badgeColor: '#6366f1',
          title,
          repo,
          branch,
          status,
          statusMessage,
          lastUserPrompt: lastUserPrompt ? `> ${lastUserPrompt.substring(0, 200)}` : undefined,
          lastAssistantResponse: lastAssistantResponse ? lastAssistantResponse.substring(0, 150) : undefined,
          updatedAt: mtimeMs,
          filePath: dbPath,
          source: 'IDE',
          modelName: 'Copilot Chat',
          inputTokensFormatted: this.formatTokens(turnCount * 800),
          outputTokensFormatted: `${this.formatTokens(turnCount * 300)} ra`,
          turnCount: turnCount || 1,
          shortId: id.substring(0, 8),
          cwd: row.cwd || undefined
        };

        this.sessionCache.set(id, {
          session,
          mtimeMs,
          cacheVersion: this.CACHE_VERSION
        });

        sessions.push(session);
      }

      return sessions;
    } catch (err) {
      console.error('Lỗi khi truy vấn sessions Copilot:', err);
      return [];
    }
  }
}
