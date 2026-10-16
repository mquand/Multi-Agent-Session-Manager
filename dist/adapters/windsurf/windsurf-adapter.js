"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WindsurfAdapter = void 0;
const windsurf_scanner_1 = require("./windsurf-scanner");
class WindsurfAdapter {
    agentId = 'windsurf';
    agentName = 'Windsurf';
    icon = '$(terminal-powershell)';
    badgeColor = '#0284c7';
    getDefaultStoragePath() {
        return windsurf_scanner_1.WindsurfSessionScanner.getDefaultCascadeDir();
    }
    isEnabled(config) {
        if (!config)
            return true;
        const enabledAgents = config.get?.('enabledAgents') || ['claude', 'gemini', 'cursor', 'codex', 'copilot', 'windsurf'];
        return enabledAgents.includes('windsurf');
    }
    getWatchedDirectories(customPath) {
        return windsurf_scanner_1.WindsurfSessionScanner.getWatchedDirectories(customPath);
    }
    async scanSessions(customPath, options) {
        return windsurf_scanner_1.WindsurfSessionScanner.scanSessions(customPath, options);
    }
    deleteSession(sessionId, filePath) {
        return windsurf_scanner_1.WindsurfSessionScanner.deleteSession(sessionId, filePath);
    }
}
exports.WindsurfAdapter = WindsurfAdapter;
//# sourceMappingURL=windsurf-adapter.js.map