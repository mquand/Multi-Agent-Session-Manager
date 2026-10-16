"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WindsurfSessionScanner = void 0;
const fs = require("fs");
const path = require("path");
const os = require("os");
class WindsurfSessionScanner {
    static CACHE_VERSION = 1;
    static sessionCache = new Map();
    static resolveHomePath(p) {
        if (p.startsWith('~/') || p === '~') {
            return path.join(os.homedir(), p.slice(1));
        }
        return p;
    }
    /**
     * Thư mục mặc định chứa các Cascade session protobuf của Windsurf:
     * ~/.codeium/windsurf/cascade/*.pb
     */
    static getDefaultCascadeDir() {
        return path.join(os.homedir(), '.codeium', 'windsurf', 'cascade');
    }
    static getWatchedDirectories(customPath) {
        const cascadeDir = customPath ? this.resolveHomePath(customPath) : this.getDefaultCascadeDir();
        const resultDirs = [];
        if (fs.existsSync(cascadeDir)) {
            resultDirs.push(cascadeDir);
        }
        const codeTracker = path.join(os.homedir(), '.codeium', 'windsurf', 'code_tracker', 'active');
        if (fs.existsSync(codeTracker)) {
            resultDirs.push(codeTracker);
        }
        return resultDirs;
    }
    static deleteSession(sessionId, filePath) {
        try {
            if (filePath && fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            else {
                const defaultPath = path.join(this.getDefaultCascadeDir(), `${sessionId}.pb`);
                if (fs.existsSync(defaultPath)) {
                    fs.unlinkSync(defaultPath);
                }
            }
            this.sessionCache.delete(sessionId);
            return true;
        }
        catch (err) {
            console.error('Lỗi khi xoá session Windsurf:', err);
            return false;
        }
    }
    static formatBytes(bytes) {
        if (bytes >= 1024 * 1024 * 1024)
            return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
        if (bytes >= 1024 * 1024)
            return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
        if (bytes >= 1024)
            return (bytes / 1024).toFixed(0) + ' KB';
        return bytes + ' B';
    }
    /**
     * Quét thư mục code_tracker/active để lấy danh sách các workspace/repo mà Windsurf đang làm việc
     */
    static getActiveRepos() {
        const repoMap = new Map();
        try {
            const trackerDir = path.join(os.homedir(), '.codeium', 'windsurf', 'code_tracker', 'active');
            if (fs.existsSync(trackerDir)) {
                const entries = fs.readdirSync(trackerDir, { withFileTypes: true });
                for (const entry of entries) {
                    if (!entry.isDirectory())
                        continue;
                    // Ví dụ: ZaFlow_940ef054b872d57cc21dd0392784329d12503a35
                    const rawName = entry.name;
                    const match = rawName.match(/^([^_]+)_[0-9a-fA-F]{20,}/);
                    const repoName = match ? match[1] : rawName.replace(/_[^_]+$/, '');
                    repoMap.set(entry.name, repoName);
                }
            }
        }
        catch { }
        return repoMap;
    }
    static async scanSessions(customPath, options) {
        const cascadeDir = customPath ? this.resolveHomePath(customPath) : this.getDefaultCascadeDir();
        if (!fs.existsSync(cascadeDir))
            return [];
        let pbFiles = [];
        try {
            pbFiles = fs.readdirSync(cascadeDir).filter(f => f.endsWith('.pb'));
        }
        catch {
            return [];
        }
        if (pbFiles.length === 0)
            return [];
        const activeRepos = this.getActiveRepos();
        const repoList = Array.from(activeRepos.values());
        const primaryRepo = repoList.length > 0 ? repoList[0] : (options?.defaultRepo || 'windsurf-workspace');
        const currentFiles = new Map();
        for (const file of pbFiles) {
            const fullPath = path.join(cascadeDir, file);
            try {
                const stat = fs.statSync(fullPath);
                const sessionId = file.replace(/\.pb$/, '');
                currentFiles.set(sessionId, {
                    filePath: fullPath,
                    sessionId,
                    mtimeMs: stat.mtimeMs,
                    size: stat.size
                });
            }
            catch { }
        }
        // Dọn cache các session đã xoá
        for (const [cachedId] of this.sessionCache) {
            if (!currentFiles.has(cachedId)) {
                this.sessionCache.delete(cachedId);
            }
        }
        const sorted = Array.from(currentFiles.values()).sort((a, b) => b.mtimeMs - a.mtimeMs);
        const topCandidates = sorted.slice(0, 50);
        const sessions = [];
        const now = Date.now();
        for (const item of topCandidates) {
            const cached = this.sessionCache.get(item.sessionId);
            if (cached && cached.cacheVersion === this.CACHE_VERSION && cached.mtimeMs === item.mtimeMs) {
                const diffMinutes = Math.floor((now - item.mtimeMs) / (60 * 1000));
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
            const diffMinutes = Math.floor((now - item.mtimeMs) / (60 * 1000));
            let status = 'done';
            if (diffMinutes < 5) {
                status = 'running';
            }
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
            const shortId = item.sessionId.substring(0, 8);
            const sizeStr = this.formatBytes(item.size);
            const title = `Cascade Session ${shortId} (${sizeStr})`;
            const session = {
                id: item.sessionId,
                agentId: 'windsurf',
                agentName: 'Windsurf',
                badgeColor: '#0284c7',
                title,
                repo: primaryRepo,
                branch: 'main',
                status,
                statusMessage,
                lastUserPrompt: `> Cascade Chat (${sizeStr})`,
                lastAssistantResponse: `Protocol Buffer history (${sizeStr})`,
                updatedAt: item.mtimeMs,
                filePath: item.filePath,
                source: 'IDE',
                modelName: 'Cascade',
                inputTokensFormatted: sizeStr,
                outputTokensFormatted: 'Protobuf',
                turnCount: Math.max(1, Math.round(item.size / 20000)),
                shortId
            };
            this.sessionCache.set(item.sessionId, {
                session,
                mtimeMs: item.mtimeMs,
                cacheVersion: this.CACHE_VERSION
            });
            sessions.push(session);
        }
        return sessions;
    }
}
exports.WindsurfSessionScanner = WindsurfSessionScanner;
//# sourceMappingURL=windsurf-scanner.js.map