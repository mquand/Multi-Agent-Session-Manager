"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodexAdapter = void 0;
const codex_scanner_1 = require("./codex-scanner");
class CodexAdapter {
    agentId = 'codex';
    agentName = 'Codex';
    icon = '$(terminal)';
    badgeColor = '#10a37f';
    getDefaultStoragePath() {
        return codex_scanner_1.CodexSessionScanner.getDefaultStoragePath();
    }
    isEnabled(config) {
        if (!config)
            return true;
        const enabledAgents = config.get?.('enabledAgents') || ['claude', 'gemini', 'cursor', 'codex'];
        return enabledAgents.includes('codex');
    }
    getWatchedDirectories(customPath) {
        return codex_scanner_1.CodexSessionScanner.getWatchedDirectories(customPath);
    }
    async scanSessions(customPath, options) {
        return codex_scanner_1.CodexSessionScanner.scanSessions(customPath, options);
    }
    deleteSession(sessionId, filePath) {
        return codex_scanner_1.CodexSessionScanner.deleteSession(sessionId, filePath);
    }
}
exports.CodexAdapter = CodexAdapter;
//# sourceMappingURL=codex-adapter.js.map