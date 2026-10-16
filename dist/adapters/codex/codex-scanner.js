"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodexSessionScanner = void 0;
const fs = require("fs");
const path = require("path");
const os = require("os");
const readline = require("readline");
class CodexSessionScanner {
    static CACHE_VERSION = 1;
    static sessionCache = new Map();
    static resolveHomePath(p) {
        if (p.startsWith('~/') || p === '~') {
            return path.join(os.homedir(), p.slice(1));
        }
        return p;
    }
    /**
     * Thư mục mặc định chứa các rollout transcript của OpenAI Codex:
     * ~/.codex/sessions/ (chứa các thư mục YYYY/MM/DD/rollout-*.jsonl)
     */
    static getDefaultStoragePath() {
        return path.join(os.homedir(), '.codex', 'sessions');
    }
    static getWatchedDirectories(customPath) {
        const rootDir = customPath ? this.resolveHomePath(customPath) : this.getDefaultStoragePath();
        if (!fs.existsSync(rootDir))
            return [];
        const resultDirs = [rootDir];
        try {
            // Quét các cấp thư mục con YYYY/MM/DD
            const findSubDirs = (dir, depth = 0) => {
                if (depth > 3)
                    return;
                try {
                    const entries = fs.readdirSync(dir, { withFileTypes: true });
                    for (const entry of entries) {
                        if (entry.isDirectory()) {
                            const full = path.join(dir, entry.name);
                            resultDirs.push(full);
                            findSubDirs(full, depth + 1);
                        }
                    }
                }
                catch { }
            };
            findSubDirs(rootDir, 0);
        }
        catch { }
        return resultDirs;
    }
    static deleteSession(sessionId, filePath) {
        try {
            if (filePath && fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            this.sessionCache.delete(sessionId);
            return true;
        }
        catch (err) {
            console.error('Lỗi khi xoá session Codex:', err);
            return false;
        }
    }
    static formatTokens(tokens) {
        if (tokens >= 1_000_000_000)
            return (tokens / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
        if (tokens >= 1_000_000)
            return (tokens / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
        if (tokens >= 1_000)
            return (tokens / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
        return tokens.toLocaleString();
    }
    static getGitInfoFromDir(dirPath) {
        try {
            if (!dirPath || !fs.existsSync(dirPath))
                return null;
            const gitPath = path.join(dirPath, '.git');
            if (!fs.existsSync(gitPath))
                return null;
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
            }
            else if (stat.isDirectory()) {
                const headPath = path.join(gitPath, 'HEAD');
                if (fs.existsSync(headPath)) {
                    const headContent = fs.readFileSync(headPath, 'utf8').trim();
                    const branch = headContent.replace(/^ref:\s*refs\/heads\//, '').trim();
                    return { branch, isWorktree: false };
                }
            }
        }
        catch { }
        return null;
    }
    /**
     * Quét đệ quy tìm tất cả file *.jsonl trong ~/.codex/sessions/
     */
    static findJsonlFiles(dir, depth = 0) {
        if (!fs.existsSync(dir) || depth > 4)
            return [];
        const files = [];
        try {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    files.push(...this.findJsonlFiles(fullPath, depth + 1));
                }
                else if (entry.isFile() && entry.name.endsWith('.jsonl')) {
                    files.push(fullPath);
                }
            }
        }
        catch { }
        return files;
    }
    static async scanSessions(customPath, options) {
        const rootDir = customPath ? this.resolveHomePath(customPath) : this.getDefaultStoragePath();
        if (!fs.existsSync(rootDir))
            return [];
        const jsonlFiles = this.findJsonlFiles(rootDir);
        if (jsonlFiles.length === 0)
            return [];
        const currentFiles = new Map();
        for (const filePath of jsonlFiles) {
            try {
                const stat = fs.statSync(filePath);
                // Trích xuất sessionId từ filename dạng rollout-2026-10-15T22-15-00-019aeb67.jsonl hoặc basename
                const fileName = path.basename(filePath, '.jsonl');
                const matchUuid = fileName.match(/([0-9a-fA-F-]{8,})/);
                const sessionId = matchUuid ? matchUuid[1] : fileName;
                currentFiles.set(sessionId, {
                    filePath,
                    sessionId,
                    mtimeMs: stat.mtimeMs
                });
            }
            catch { }
        }
        // Dọn cache cho các session đã bị xoá
        for (const [cachedId] of this.sessionCache) {
            if (!currentFiles.has(cachedId)) {
                this.sessionCache.delete(cachedId);
            }
        }
        const sorted = Array.from(currentFiles.values()).sort((a, b) => b.mtimeMs - a.mtimeMs);
        const topCandidates = sorted.slice(0, 50);
        const sessions = [];
        for (const item of topCandidates) {
            const cached = this.sessionCache.get(item.sessionId);
            if (cached && cached.cacheVersion === this.CACHE_VERSION && cached.mtimeMs === item.mtimeMs) {
                const diffMinutes = Math.floor((Date.now() - item.mtimeMs) / (60 * 1000));
                if (diffMinutes < 1) {
                    cached.session.statusMessage = 'vừa xong';
                }
                else if (diffMinutes < 60) {
                    cached.session.statusMessage = `${diffMinutes} phút trước`;
                }
                else if (diffMinutes < 1440) {
                    cached.session.statusMessage = `${Math.floor(diffMinutes / 60)} giờ trước`;
                }
                else {
                    cached.session.statusMessage = `${Math.floor(diffMinutes / 1440)} ngày trước`;
                }
                sessions.push(cached.session);
                continue;
            }
            const parsed = await this.fastParseCodexSession(item.filePath, item.sessionId, item.mtimeMs, options);
            if (parsed) {
                this.sessionCache.set(item.sessionId, {
                    session: parsed,
                    mtimeMs: item.mtimeMs,
                    cacheVersion: this.CACHE_VERSION
                });
                sessions.push(parsed);
            }
        }
        return sessions;
    }
    static async fastParseCodexSession(filePath, sessionId, mtimeMs, options) {
        return new Promise((resolve) => {
            let resolvedSessionId = sessionId;
            let sessionCwd = '';
            let sessionModel = 'Codex';
            let title = '';
            let lastUserPrompt = '';
            let lastAssistantResponse = '';
            let status = 'done';
            let turnCount = 0;
            let rawInputTokens = 0;
            let rawOutputTokens = 0;
            let hasError = false;
            const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
            const rl = readline.createInterface({
                input: stream,
                crlfDelay: Infinity
            });
            rl.on('line', (line) => {
                const trimmed = line.trim();
                if (!trimmed)
                    return;
                try {
                    const item = JSON.parse(trimmed);
                    const eventType = item.type;
                    const payload = item.payload || {};
                    // 1. Session metadata
                    if (eventType === 'session_meta') {
                        if (payload.session_id)
                            resolvedSessionId = payload.session_id;
                        if (payload.cwd)
                            sessionCwd = payload.cwd;
                        if (payload.model)
                            sessionModel = payload.model;
                        return;
                    }
                    // 2. User prompt / message
                    if (eventType === 'user_message' || payload.type === 'user_message') {
                        turnCount++;
                        const rawMsg = typeof payload.message === 'string'
                            ? payload.message
                            : (payload.content || (typeof item.message === 'string' ? item.message : ''));
                        if (rawMsg) {
                            const cleanPrompt = rawMsg.replace(/^(##\s*[^\n]*\n*|>+\s*)/g, '').trim();
                            if (cleanPrompt) {
                                lastUserPrompt = cleanPrompt.length > 200 ? cleanPrompt.substring(0, 200) + '...' : cleanPrompt;
                                if (!title) {
                                    title = cleanPrompt.replace(/\r?\n.*/s, '').substring(0, 70);
                                }
                            }
                        }
                        return;
                    }
                    // 3. Assistant / Model turn
                    if (eventType === 'assistant_message' || eventType === 'model_response' || payload.type === 'assistant_message') {
                        turnCount++;
                        const content = payload.text || payload.content || payload.message || '';
                        if (typeof content === 'string' && content.trim()) {
                            lastAssistantResponse = content.substring(0, 150);
                        }
                        if (payload.input_tokens)
                            rawInputTokens += payload.input_tokens;
                        if (payload.output_tokens)
                            rawOutputTokens += payload.output_tokens;
                        if (payload.tokens?.input)
                            rawInputTokens += payload.tokens.input;
                        if (payload.tokens?.output)
                            rawOutputTokens += payload.tokens.output;
                        return;
                    }
                    // 4. Token telemetry
                    if (eventType === 'token_usage' || payload.token_usage) {
                        const usage = payload.token_usage || payload;
                        if (usage.input_tokens)
                            rawInputTokens += usage.input_tokens;
                        if (usage.output_tokens)
                            rawOutputTokens += usage.output_tokens;
                    }
                    // 5. Tool call / Error check
                    if (eventType === 'error' || payload.status === 'error' || item.status === 'error') {
                        hasError = true;
                    }
                }
                catch { }
            });
            rl.on('close', () => {
                // Tính toán trạng thái phiên
                const now = Date.now();
                const diffMinutes = Math.floor((now - mtimeMs) / (60 * 1000));
                if (hasError) {
                    status = 'failed';
                }
                else if (diffMinutes < 5) {
                    status = 'running';
                }
                else {
                    status = 'done';
                }
                // Tính toán status message
                let statusMessage = '';
                if (diffMinutes < 1) {
                    statusMessage = 'vừa xong';
                }
                else if (diffMinutes < 60) {
                    statusMessage = `${diffMinutes} phút trước`;
                }
                else if (diffMinutes < 1440) {
                    statusMessage = `${Math.floor(diffMinutes / 60)} giờ trước`;
                }
                else {
                    statusMessage = `${Math.floor(diffMinutes / 1440)} ngày trước`;
                }
                // Xác định repo và git branch từ sessionCwd
                let repo = '';
                let branch = '';
                let isWorktree = false;
                if (sessionCwd) {
                    repo = path.basename(sessionCwd);
                    const gitInfo = this.getGitInfoFromDir(sessionCwd);
                    if (gitInfo) {
                        branch = gitInfo.branch;
                        isWorktree = gitInfo.isWorktree;
                        if (gitInfo.mainRepo)
                            repo = gitInfo.mainRepo;
                    }
                }
                if (!repo) {
                    repo = options?.defaultRepo || 'codex-workspace';
                }
                const shortId = resolvedSessionId.substring(0, 8);
                if (!title) {
                    title = `Codex Session ${shortId}`;
                }
                const session = {
                    id: resolvedSessionId,
                    agentId: 'codex',
                    agentName: 'Codex',
                    badgeColor: '#10a37f',
                    title,
                    repo,
                    branch,
                    isWorktree,
                    status,
                    statusMessage,
                    lastUserPrompt: lastUserPrompt ? `> ${lastUserPrompt}` : undefined,
                    lastAssistantResponse: lastAssistantResponse || undefined,
                    updatedAt: mtimeMs,
                    filePath,
                    source: 'IDE',
                    modelName: sessionModel,
                    inputTokensFormatted: this.formatTokens(rawInputTokens),
                    outputTokensFormatted: rawOutputTokens > 0 ? `${this.formatTokens(rawOutputTokens)} ra` : '0 ra',
                    turnCount,
                    shortId,
                    cwd: sessionCwd || undefined,
                    rawInputTokens,
                    rawOutputTokens,
                    totalTokens: rawInputTokens + rawOutputTokens
                };
                resolve(session);
            });
            rl.on('error', (err) => {
                console.error('Lỗi khi đọc file rollout transcript của Codex:', err);
                resolve(null);
            });
        });
    }
}
exports.CodexSessionScanner = CodexSessionScanner;
//# sourceMappingURL=codex-scanner.js.map