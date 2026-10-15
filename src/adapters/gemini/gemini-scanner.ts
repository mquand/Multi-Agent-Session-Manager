import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as readline from 'readline';
import { Session, SessionStatus, ScanOptions } from '../../types';

export class GeminiSessionScanner {
  private static readonly CACHE_VERSION = 1;
  private static sessionCache = new Map<string, { session: Session; mtimeMs: number; cacheVersion?: number }>();

  public static resolveHomePath(p: string): string {
    if (p.startsWith('~/') || p === '~') {
      return path.join(os.homedir(), p.slice(1));
    }
    return p;
  }

  public static getWatchedDirectories(customPath?: string): string[] {
    const homedir = os.homedir();
    const candidateDirs = [
      customPath ? this.resolveHomePath(customPath) : null,
      path.join(homedir, '.gemini', 'antigravity-ide', 'brain'),
      path.join(homedir, '.gemini', 'antigravity', 'brain'),
      path.join(homedir, '.gemini', 'antigravity-ide', 'conversations'),
      path.join(homedir, '.gemini', 'antigravity', 'conversations')
    ].filter((dir): dir is string => Boolean(dir && fs.existsSync(dir)));

    const resultDirs: string[] = [];
    for (const d of candidateDirs) {
      resultDirs.push(d);
      try {
        const subEntries = fs.readdirSync(d, { withFileTypes: true });
        for (const entry of subEntries) {
          if (entry.isDirectory()) {
            resultDirs.push(path.join(d, entry.name));
          }
        }
      } catch {}
    }
    return Array.from(new Set(resultDirs));
  }

  public static deleteSession(sessionId: string, filePath?: string): boolean {
    try {
      const homedir = os.homedir();
      // Xoá brain dir
      if (filePath && fs.existsSync(filePath)) {
        const brainDir = path.dirname(path.dirname(path.dirname(filePath)));
        if (brainDir.endsWith(sessionId)) {
          fs.rmSync(brainDir, { recursive: true, force: true });
        }
      }

      // Xoá .db nếu có
      const dbPaths = [
        path.join(homedir, '.gemini', 'antigravity-ide', 'conversations', `${sessionId}.db`),
        path.join(homedir, '.gemini', 'antigravity', 'conversations', `${sessionId}.db`)
      ];
      for (const dbp of dbPaths) {
        if (fs.existsSync(dbp)) {
          try { fs.unlinkSync(dbp); } catch {}
          try { fs.unlinkSync(`${dbp}-shm`); } catch {}
          try { fs.unlinkSync(`${dbp}-wal`); } catch {}
        }
      }

      this.sessionCache.delete(sessionId);
      return true;
    } catch (err) {
      console.error('Lỗi khi xoá session Gemini:', err);
      return false;
    }
  }

  private static formatTokens(tokens: number): string {
    if (tokens >= 1_000_000_000) return (tokens / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
    if (tokens >= 1_000_000) return (tokens / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (tokens >= 1_000) return (tokens / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
    return tokens.toLocaleString();
  }

  private static cleanPromptText(text: string): string {
    if (!text) return '';
    return text
      .replace(/<USER_REQUEST>([\s\S]*?)<\/USER_REQUEST>/g, '$1')
      .replace(/<ADDITIONAL_METADATA>[\s\S]*?<\/ADDITIONAL_METADATA>/g, '')
      .replace(/<USER_SETTINGS_CHANGE>[\s\S]*?<\/USER_SETTINGS_CHANGE>/g, '')
      .replace(/<[^>]+>/g, '')
      .trim();
  }

  public static getGitInfoFromDir(dirPath: string): { branch: string; isWorktree: boolean; mainRepo?: string } | null {
    try {
      if (!dirPath || !fs.existsSync(dirPath)) return null;
      const gitPath = path.join(dirPath, '.git');
      if (!fs.existsSync(gitPath)) return null;

      const stat = fs.statSync(gitPath);
      if (stat.isFile()) {
        const content = fs.readFileSync(gitPath, 'utf8');
        const match = content.match(/gitdir:\s*(.*)/i);
        if (match) {
          const gitDir = match[1].trim();
          const headPath = path.isAbsolute(gitDir) ? path.join(gitDir, 'HEAD') : path.resolve(dirPath, gitDir, 'HEAD');
          let branch = '';
          if (fs.existsSync(headPath)) {
            const headContent = fs.readFileSync(headPath, 'utf8').trim();
            branch = headContent.replace(/^ref:\s*refs\/heads\//, '').trim();
          }
          const parts = gitDir.split(path.sep);
          const gitIdx = parts.indexOf('.git');
          const mainRepo = gitIdx > 0 ? parts[gitIdx - 1] : undefined;
          return { branch, isWorktree: true, mainRepo };
        }
      } else if (stat.isDirectory()) {
        const headPath = path.join(gitPath, 'HEAD');
        if (fs.existsSync(headPath)) {
          const headContent = fs.readFileSync(headPath, 'utf8').trim();
          const branch = headContent.replace(/^ref:\s*refs\/heads\//, '').trim();
          return { branch, isWorktree: false };
        }
      }
    } catch {}
    return null;
  }

  private static extractRepoAndBranchFromDb(sessionId: string): { repo: string; branch: string; workspaceUri?: string } {
    const homedir = os.homedir();
    const candidateDbs = [
      path.join(homedir, '.gemini', 'antigravity-ide', 'conversations', `${sessionId}.db`),
      path.join(homedir, '.gemini', 'antigravity', 'conversations', `${sessionId}.db`)
    ];

    for (const dbPath of candidateDbs) {
      if (!fs.existsSync(dbPath)) continue;
      try {
        const buf = fs.readFileSync(dbPath);
        const text = buf.toString('latin1');

        let repo = '';
        let branch = '';
        let workspaceUri = '';

        const mRepo = text.match(/github\.com\/[^\/\s\x00"]+\/([^\/\s\x00"\.]+)/);
        if (mRepo) {
          repo = mRepo[1].replace('.git', '');
        } else {
          const mFile = text.match(/file:\/\/\/([^\s\x00"]+)/);
          if (mFile) {
            const cleanPath = decodeURIComponent(mFile[1]).replace(/%3A/i, ':');
            repo = path.basename(cleanPath);
            workspaceUri = cleanPath;
          }
        }

        const mBranch = text.match(/"[\x01-\x1f]([a-zA-Z0-9_\-\.\/]+)/);
        if (mBranch) {
          branch = mBranch[1];
        }

        return { repo, branch, workspaceUri };
      } catch {}
    }

    return { repo: '', branch: '' };
  }

  public static async scanSessions(customPath?: string, options?: ScanOptions): Promise<Session[]> {
    const homedir = os.homedir();
    const brainSearchDirs = [
      customPath ? this.resolveHomePath(customPath) : null,
      path.join(homedir, '.gemini', 'antigravity-ide', 'brain'),
      path.join(homedir, '.gemini', 'antigravity', 'brain')
    ].filter((dir): dir is string => Boolean(dir && fs.existsSync(dir)));

    const currentFiles = new Map<string, { filePath: string; sessionId: string; mtimeMs: number; isIde: boolean }>();

    for (const bDir of brainSearchDirs) {
      try {
        const entries = fs.readdirSync(bDir, { withFileTypes: true });
        for (const entry of entries) {
          if (!entry.isDirectory()) continue;
          const sessionId = entry.name;
          const transcriptPath = path.join(bDir, sessionId, '.system_generated', 'logs', 'transcript.jsonl');
          if (fs.existsSync(transcriptPath)) {
            try {
              const stat = fs.statSync(transcriptPath);
              if (!currentFiles.has(sessionId) || stat.mtimeMs > currentFiles.get(sessionId)!.mtimeMs) {
                currentFiles.set(sessionId, {
                  filePath: transcriptPath,
                  sessionId,
                  mtimeMs: stat.mtimeMs,
                  isIde: bDir.includes('antigravity-ide')
                });
              }
            } catch {}
          }
        }
      } catch {}
    }

    // Dọn dẹp cache
    for (const [cachedId] of this.sessionCache) {
      if (!currentFiles.has(cachedId)) {
        this.sessionCache.delete(cachedId);
      }
    }

    const sorted = Array.from(currentFiles.values()).sort((a, b) => b.mtimeMs - a.mtimeMs);
    const topCandidates = sorted.slice(0, 50);

    const sessions: Session[] = [];

    for (const item of topCandidates) {
      const cached = this.sessionCache.get(item.sessionId);
      if (cached && cached.cacheVersion === this.CACHE_VERSION && cached.mtimeMs === item.mtimeMs) {
        const diffMinutes = Math.floor((Date.now() - item.mtimeMs) / (60 * 1000));
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

      const parsed = await this.fastParseGeminiSession(item.filePath, item.sessionId, item.mtimeMs, item.isIde, options);
      if (parsed) {
        this.sessionCache.set(item.sessionId, {
          session: parsed,
          mtimeMs: item.mtimeMs,
          cacheVersion: this.CACHE_VERSION
        });
        sessions.push(parsed);
      }
    }

    return sessions.sort((a, b) => {
      const score = (s: Session) => (s.status === 'running' ? 3 : s.status === 'need_accept' ? 2 : 1);
      if (score(b) !== score(a)) {
        return score(b) - score(a);
      }
      return b.updatedAt - a.updatedAt;
    });
  }

  private static async fastParseGeminiSession(
    filePath: string,
    sessionId: string,
    mtimeMs: number,
    isIde: boolean,
    options?: ScanOptions
  ): Promise<Session | null> {
    try {
      let meaningfulFirstPrompt = '';
      let meaningfulLastPrompt = '';
      let modelName = 'Gemini 3.8 Flash (High)';
      let turnCount = 0;
      let totalChars = 0;
      let lastStepType = '';
      let lastStepStatus = 'DONE';
      let lastCwd = '';
      let extractedRepo = '';
      let extractedBranch = '';

      // Trích xuất từ .db trước nếu có
      const dbInfo = this.extractRepoAndBranchFromDb(sessionId);
      if (dbInfo.repo) extractedRepo = dbInfo.repo;
      if (dbInfo.branch) extractedBranch = dbInfo.branch;
      if (dbInfo.workspaceUri) lastCwd = dbInfo.workspaceUri;

      const fileStream = fs.createReadStream(filePath, { encoding: 'utf8', highWaterMark: 64 * 1024 });
      const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
      });

      for await (const line of rl) {
        if (!line.trim()) continue;
        try {
          const item = JSON.parse(line);
          lastStepType = item.type || lastStepType;
          lastStepStatus = item.status || lastStepStatus;

          const content = item.content || '';
          if (content) {
            totalChars += content.length;
          }

          if (item.type === 'USER_INPUT' && content) {
            turnCount++;
            const cleaned = this.cleanPromptText(content);
            if (cleaned) {
              if (!meaningfulFirstPrompt) {
                meaningfulFirstPrompt = cleaned;
              }
              meaningfulLastPrompt = cleaned;
            }

            // Phát hiện Model Selection
            const mModel = content.match(/Model Selection` from None to ([^.\n]+)/);
            if (mModel && mModel[1]) {
              modelName = mModel[1].trim();
            }

            // Phát hiện Active Document hoặc file để suy ra Workspace / Repo
            if (!extractedRepo) {
              const mDoc = content.match(/Active Document:\s*([^\n]+)/);
              if (mDoc && mDoc[1]) {
                const docPath = mDoc[1].trim();
                const parentDir = path.dirname(docPath);
                if (options?.workspaceFolders) {
                  for (const wf of options.workspaceFolders) {
                    if (docPath.includes(wf)) {
                      extractedRepo = path.basename(wf);
                      break;
                    }
                  }
                }
                if (!extractedRepo) {
                  extractedRepo = path.basename(parentDir);
                }
                if (!lastCwd) lastCwd = parentDir;
              }
            }
          }

          // Kiểm tra tool calls để tìm Cwd / SearchPath
          if (item.tool_calls && Array.isArray(item.tool_calls)) {
            for (const tc of item.tool_calls) {
              if (tc.args) {
                const candidate = tc.args.Cwd || tc.args.SearchPath || tc.args.DirectoryPath;
                if (typeof candidate === 'string' && candidate) {
                  const cleaned = candidate.replace(/^"|"$/g, '');
                  if (!lastCwd) lastCwd = cleaned;
                  if (!extractedRepo && options?.workspaceFolders) {
                    for (const wf of options.workspaceFolders) {
                      if (cleaned.includes(wf)) {
                        extractedRepo = path.basename(wf);
                        break;
                      }
                    }
                  }
                }
              }
            }
          }
        } catch {}
      }

      // Xác định repo
      let repo = extractedRepo;
      if (!repo && options?.workspaceFolders && options.workspaceFolders.length > 0) {
        repo = path.basename(options.workspaceFolders[0]);
      } else if (!repo && options?.defaultRepo) {
        repo = options.defaultRepo;
      }

      // Xác định Git Branch
      let branch = extractedBranch;
      let isWorktree = false;
      if (!branch && lastCwd && fs.existsSync(lastCwd)) {
        const gitInfo = this.getGitInfoFromDir(lastCwd);
        if (gitInfo) {
          branch = gitInfo.branch;
          if (gitInfo.isWorktree) isWorktree = true;
          if (!repo && gitInfo.mainRepo) repo = gitInfo.mainRepo;
        }
      }

      // Xác định status
      const diffMinutes = Math.floor((Date.now() - mtimeMs) / (60 * 1000));
      let status: SessionStatus = 'done';
      let statusMessage = '';

      if (lastStepStatus === 'RUNNING' || (lastStepType === 'USER_INPUT' && diffMinutes < 10)) {
        status = 'running';
        statusMessage = 'đang chạy';
      } else if (lastStepType === 'PLANNER_RESPONSE' && lastStepStatus === 'RUNNING') {
        status = 'running';
        statusMessage = 'đang suy nghĩ';
      } else if (lastStepStatus === 'ERROR') {
        status = 'failed';
        statusMessage = 'gặp lỗi';
      } else {
        status = 'done';
        if (diffMinutes < 1) {
          statusMessage = 'vừa xong';
        } else if (diffMinutes < 60) {
          statusMessage = `${diffMinutes} phút trước`;
        } else if (diffMinutes < 1440) {
          statusMessage = `${Math.floor(diffMinutes / 60)} giờ trước`;
        } else {
          statusMessage = `${Math.floor(diffMinutes / 1440)} ngày trước`;
        }
      }

      // Title tinh gọn
      let title = meaningfulFirstPrompt ? meaningfulFirstPrompt.split('\n')[0].slice(0, 100) : `Gemini ${sessionId.slice(0, 8)}`;
      
      const issueMatch = title.match(/#(\d+)/);
      let issueId: string | undefined = undefined;
      if (issueMatch) {
        issueId = issueMatch[0];
        title = title.replace(/#\d+\s*/g, '').trim();
      }

      // Token estimation
      const estimatedTokens = Math.max(100, Math.floor(totalChars / 3.8));
      const inTokens = Math.floor(estimatedTokens * 0.4);
      const outTokens = Math.floor(estimatedTokens * 0.6);

      const source: 'IDE' | 'Terminal' = isIde ? 'IDE' : 'Terminal';

      return {
        id: sessionId,
        agentId: 'gemini',
        agentName: 'Gemini / Antigravity',
        agentIcon: '$(sparkle)',
        badgeColor: '#4285F4',
        issueId,
        title,
        repo: repo || '',
        branch: branch || '',
        isWorktree,
        status,
        statusMessage,
        lastUserPrompt: meaningfulLastPrompt ? meaningfulLastPrompt.split('\n')[0] : undefined,
        updatedAt: mtimeMs,
        filePath,
        source,
        modelName,
        inputTokensFormatted: this.formatTokens(inTokens),
        outputTokensFormatted: this.formatTokens(outTokens),
        turnCount: turnCount || 1,
        shortId: sessionId.slice(0, 8),
        cwd: lastCwd || undefined,
        rawInputTokens: inTokens,
        rawOutputTokens: outTokens,
        totalTokens: inTokens + outTokens
      };
    } catch {
      return null;
    }
  }
}
