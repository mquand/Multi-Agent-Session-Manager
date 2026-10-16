"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CopilotAdapter = void 0;
const copilot_scanner_1 = require("./copilot-scanner");
class CopilotAdapter {
    agentId = 'copilot';
    agentName = 'GitHub Copilot';
    icon = '$(copilot)';
    badgeColor = '#6366f1';
    getDefaultStoragePath() {
        return copilot_scanner_1.CopilotSessionScanner.getDefaultDbPath();
    }
    isEnabled(config) {
        if (!config)
            return true;
        const enabledAgents = config.get?.('enabledAgents') || ['claude', 'gemini', 'cursor', 'codex', 'copilot'];
        return enabledAgents.includes('copilot');
    }
    getWatchedDirectories(customPath) {
        return copilot_scanner_1.CopilotSessionScanner.getWatchedDirectories(customPath);
    }
    async scanSessions(customPath, options) {
        return copilot_scanner_1.CopilotSessionScanner.scanSessions(customPath, options);
    }
    deleteSession(sessionId, filePath) {
        return copilot_scanner_1.CopilotSessionScanner.deleteSession(sessionId, filePath);
    }
}
exports.CopilotAdapter = CopilotAdapter;
//# sourceMappingURL=copilot-adapter.js.map