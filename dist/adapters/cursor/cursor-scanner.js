"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CursorSessionScanner = void 0;
const fs = require("fs");
const path = require("path");
const os = require("os");
const readline = require("readline");
class CursorSessionScanner {
    static CACHE_VERSION = 1;
    static sessionCache = new Map();
    static resolveHomePath(p) {
        if (p.startsWith('~/') || p === '~') {
            return path.join(os.homedir(), p.slice(1));
        }
        return p;
    }
    static getWatchedDirectories(customPath) {
        const homedir = os.homedir();
        const cursorProjects = customPath ? this.resolveHomePath(customPath) : path.join(homedir, '.cursor', 'projects');
        if (!fs.existsSync(cursorProjects))
            return [];
        const resultDirs = [cursorProjects];
        try {
            const pDirs = fs.readdirSync(cursorProjects, { withFileTypes: true });
            for (const p of pDirs) {
                if (!p.isDirectory())
                    continue;
                const transcriptsDir = path.join(cursorProjects, p.name, 'agent-transcripts');
                if (fs.existsSync(transcriptsDir)) {
                    resultDirs.push(transcriptsDir);
                    try {
                        const subEntries = fs.readdirSync(transcriptsDir, { withFileTypes: true });
                        for (const sub of subEntries) {
                            if (sub.isDirectory()) {
                                resultDirs.push(path.join(transcriptsDir, sub.name));
                            }
                        }
                    }
                    catch { }
                }
            }
        }
        catch { }
        return resultDirs;
    }
    static deleteSession(sessionId, filePath) {
        try {
            if (filePath && fs.existsSync(filePath)) {
                const sessionFolder = path.dirname(filePath);
                if (sessionFolder.endsWith(sessionId)) {
                    fs.rmSync(sessionFolder, { recursive: true, force: true });
                }
                else {
                    fs.unlinkSync(filePath);
                }
            }
            this.sessionCache.delete(sessionId);
            return true;
        }
        catch (err) {
            console.error('Lỗi khi xoá session Cursor:', err);
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
    static decodeProjectFolder(folderName) {
        let candidatePath = '';
        let repo = '';
        // Ví dụ: d-StartUp2026-ZaFlow -> D:\StartUp2026\ZaFlow
        const matchDrive = folderName.match(/^([a-zA-Z])-(.+)$/);
        if (matchDrive) {
            const drive = matchDrive[1].toUpperCase();
            const rest = matchDrive[2].replace(/-/g, path.sep);
            candidatePath = `${drive}:${path.sep}${rest}`;
            if (fs.existsSync(candidatePath)) {
                repo = path.basename(candidatePath);
            }
        }
        if (!repo) {
            const parts = folderName.split('-');
            repo = parts[parts.length - 1];
        }
        return { repo, candidatePath: candidatePath || undefined };
    }
    static async scanSessions(customPath, options) {
        const homedir = os.homedir();
        const cursorProjects = customPath ? this.resolveHomePath(customPath) : path.join(homedir, '.cursor', 'projects');
        if (!fs.existsSync(cursorProjects))
            return [];
        const currentFiles = new Map();
        try {
            const projectDirs = fs.readdirSync(cursorProjects, { withFileTypes: true });
            for (const pDir of projectDirs) {
                if (!pDir.isDirectory())
                    continue;
                const transcriptsDir = path.join(cursorProjects, pDir.name, 'agent-transcripts');
                if (!fs.existsSync(transcriptsDir))
                    continue;
                try {
                    const sDirs = fs.readdirSync(transcriptsDir, { withFileTypes: true });
                    for (const sDir of sDirs) {
                        if (!sDir.isDirectory())
                            continue;
                        const transcriptPath = path.join(transcriptsDir, sDir.name, `${sDir.name}.jsonl`);
                        if (fs.existsSync(transcriptPath)) {
                            try {
                                const stat = fs.statSync(transcriptPath);
                                currentFiles.set(sDir.name, {
                                    filePath: transcriptPath,
                                    sessionId: sDir.name,
                                    mtimeMs: stat.mtimeMs,
                                    projectFolder: pDir.name
                                });
                            }
                            catch { }
                        }
                    }
                }
                catch { }
            }
        }
        catch (err) {
            console.error('Lỗi duyệt Cursor projects:', err);
        }
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
            const parsed = await this.fastParseCursorSession(item.filePath, item.sessionId, item.mtimeMs, item.projectFolder, options);
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
            const score = (s) => (s.status === 'running' ? 3 : s.status === 'need_accept' ? 2 : 1);
            if (score(b) !== score(a)) {
                return score(b) - score(a);
            }
            return b.updatedAt - a.updatedAt;
        });
    }
    static async fastParseCursorSession(filePath, sessionId, mtimeMs, projectFolder, options) {
        try {
            const { repo: inferredRepo, candidatePath } = this.decodeProjectFolder(projectFolder);
            let meaningfulFirstPrompt = '';
            let meaningfulLastPrompt = '';
            let modelName = 'Claude 3.5 Sonnet (Cursor)';
            let turnCount = 0;
            let totalChars = 0;
            let lastTurnStatus = 'completed';
            let lastToolCwd = candidatePath || '';
            let extractedRepo = inferredRepo;
            const fileStream = fs.createReadStream(filePath, { encoding: 'utf8', highWaterMark: 64 * 1024 });
            const rl = readline.createInterface({
                input: fileStream,
                crlfDelay: Infinity
            });
            for await (const line of rl) {
                if (!line.trim())
                    continue;
                try {
                    const item = JSON.parse(line);
                    if (item.type === 'turn_ended') {
                        if (item.status === 'error') {
                            lastTurnStatus = 'error';
                        }
                    }
                    if (item.role === 'user' && item.message?.content) {
                        turnCount++;
                        for (const part of item.message.content) {
                            if (part.type === 'text' && part.text) {
                                totalChars += part.text.length;
                                const mQuery = part.text.match(/<user_query>([\s\S]*?)<\/user_query>/);
                                const q = mQuery ? mQuery[1].trim() : part.text.replace(/<[^>]+>/g, '').trim();
                                if (q) {
                                    if (!meaningfulFirstPrompt)
                                        meaningfulFirstPrompt = q;
                                    meaningfulLastPrompt = q;
                                }
                            }
                        }
                    }
                    if (item.role === 'assistant' && item.message?.content) {
                        for (const part of item.message.content) {
                            if (part.type === 'text' && part.text) {
                                totalChars += part.text.length;
                            }
                            if (part.type === 'tool_use' && part.input?.path) {
                                const toolFilePath = part.input.path;
                                if (!lastToolCwd && typeof toolFilePath === 'string') {
                                    lastToolCwd = path.dirname(toolFilePath);
                                }
                                if (!extractedRepo && typeof toolFilePath === 'string' && options?.workspaceFolders) {
                                    for (const wf of options.workspaceFolders) {
                                        if (toolFilePath.includes(wf)) {
                                            extractedRepo = path.basename(wf);
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                catch { }
            }
            // Xác định repo
            let repo = extractedRepo;
            if (!repo && options?.workspaceFolders && options.workspaceFolders.length > 0) {
                repo = path.basename(options.workspaceFolders[0]);
            }
            else if (!repo && options?.defaultRepo) {
                repo = options.defaultRepo;
            }
            // Xác định branch từ lastToolCwd
            let branch = '';
            let isWorktree = false;
            if (lastToolCwd && fs.existsSync(lastToolCwd)) {
                const gitInfo = this.getGitInfoFromDir(lastToolCwd);
                if (gitInfo) {
                    branch = gitInfo.branch;
                    if (gitInfo.isWorktree)
                        isWorktree = true;
                    if (!repo && gitInfo.mainRepo)
                        repo = gitInfo.mainRepo;
                }
            }
            // Status calculation
            const diffMinutes = Math.floor((Date.now() - mtimeMs) / (60 * 1000));
            let status = 'done';
            let statusMessage = '';
            if (lastTurnStatus === 'error') {
                status = 'failed';
                statusMessage = 'giới hạn / lỗi';
            }
            else if (diffMinutes < 5) {
                status = 'running';
                statusMessage = 'đang chạy';
            }
            else {
                status = 'done';
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
            }
            // Title
            let title = meaningfulFirstPrompt
                ? meaningfulFirstPrompt.split('\n')[0].slice(0, 100)
                : `Cursor Session ${sessionId.slice(0, 8)}`;
            const issueMatch = title.match(/#(\d+)/);
            let issueId = undefined;
            if (issueMatch) {
                issueId = issueMatch[0];
                title = title.replace(/#\d+\s*/g, '').trim();
            }
            const estimatedTokens = Math.max(50, Math.floor(totalChars / 3.8));
            const inTokens = Math.floor(estimatedTokens * 0.4);
            const outTokens = Math.floor(estimatedTokens * 0.6);
            return {
                id: sessionId,
                agentId: 'cursor',
                agentName: 'Cursor AI',
                agentIcon: '$(code)',
                badgeColor: '#10B981',
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
                source: 'IDE',
                modelName,
                inputTokensFormatted: this.formatTokens(inTokens),
                outputTokensFormatted: this.formatTokens(outTokens),
                turnCount: turnCount || 1,
                shortId: sessionId.slice(0, 8),
                cwd: lastToolCwd || undefined,
                rawInputTokens: inTokens,
                rawOutputTokens: outTokens,
                totalTokens: inTokens + outTokens
            };
        }
        catch {
            return null;
        }
    }
}
exports.CursorSessionScanner = CursorSessionScanner;
//# sourceMappingURL=cursor-scanner.js.map