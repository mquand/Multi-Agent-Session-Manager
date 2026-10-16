"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiAdapter = void 0;
const os = require("os");
const path = require("path");
const gemini_scanner_1 = require("./gemini-scanner");
class GeminiAdapter {
    agentId = 'gemini';
    agentName = 'Gemini / Antigravity';
    icon = '$(sparkle)';
    badgeColor = '#4285F4';
    getDefaultStoragePath() {
        const homedir = os.homedir();
        const ideBrain = path.join(homedir, '.gemini', 'antigravity-ide', 'brain');
        if (require('fs').existsSync(ideBrain)) {
            return ideBrain;
        }
        return path.join(homedir, '.gemini', 'antigravity', 'brain');
    }
    isEnabled(config) {
        if (!config)
            return true;
        const enabledAgents = config.get?.('enabledAgents') || ['claude', 'gemini'];
        return enabledAgents.includes('gemini');
    }
    getWatchedDirectories(customPath) {
        return gemini_scanner_1.GeminiSessionScanner.getWatchedDirectories(customPath);
    }
    async scanSessions(customPath, options) {
        return gemini_scanner_1.GeminiSessionScanner.scanSessions(customPath, options);
    }
    deleteSession(sessionId, filePath) {
        return gemini_scanner_1.GeminiSessionScanner.deleteSession(sessionId, filePath);
    }
}
exports.GeminiAdapter = GeminiAdapter;
//# sourceMappingURL=gemini-adapter.js.map