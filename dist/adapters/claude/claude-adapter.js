"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaudeAdapter = void 0;
const os = require("os");
const path = require("path");
const claude_scanner_1 = require("./claude-scanner");
class ClaudeAdapter {
    agentId = 'claude';
    agentName = 'Claude Code';
    icon = '$(hubot)';
    badgeColor = '#D97706';
    getDefaultStoragePath() {
        return path.join(os.homedir(), '.claude', 'projects');
    }
    isEnabled(config) {
        if (!config)
            return true;
        const enabledAgents = config.get?.('enabledAgents') || ['claude'];
        return enabledAgents.includes('claude');
    }
    getWatchedDirectories(customPath) {
        return claude_scanner_1.ClaudeSessionScanner.getWatchedDirectories(customPath);
    }
    async scanSessions(customPath, options) {
        return claude_scanner_1.ClaudeSessionScanner.scanSessions(customPath, options);
    }
    deleteSession(sessionId, filePath) {
        return claude_scanner_1.ClaudeSessionScanner.deleteSession(sessionId, filePath);
    }
    getActiveSessionsMap() {
        return claude_scanner_1.ClaudeSessionScanner.getActiveSessionsMap();
    }
}
exports.ClaudeAdapter = ClaudeAdapter;
//# sourceMappingURL=claude-adapter.js.map