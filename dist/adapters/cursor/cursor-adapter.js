"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CursorAdapter = void 0;
const os = require("os");
const path = require("path");
const cursor_scanner_1 = require("./cursor-scanner");
class CursorAdapter {
    agentId = 'cursor';
    agentName = 'Cursor AI';
    icon = '$(code)';
    badgeColor = '#10B981';
    getDefaultStoragePath() {
        return path.join(os.homedir(), '.cursor', 'projects');
    }
    isEnabled(config) {
        if (!config)
            return true;
        const enabledAgents = config.get?.('enabledAgents') || ['claude', 'gemini', 'cursor'];
        return enabledAgents.includes('cursor');
    }
    getWatchedDirectories(customPath) {
        return cursor_scanner_1.CursorSessionScanner.getWatchedDirectories(customPath);
    }
    async scanSessions(customPath, options) {
        return cursor_scanner_1.CursorSessionScanner.scanSessions(customPath, options);
    }
    deleteSession(sessionId, filePath) {
        return cursor_scanner_1.CursorSessionScanner.deleteSession(sessionId, filePath);
    }
}
exports.CursorAdapter = CursorAdapter;
//# sourceMappingURL=cursor-adapter.js.map