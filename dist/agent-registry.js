"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentRegistry = void 0;
class AgentRegistry {
    static adapters = new Map();
    static registerAdapter(adapter) {
        this.adapters.set(adapter.agentId, adapter);
    }
    static getAdapter(agentId) {
        return this.adapters.get(agentId);
    }
    static getAllAdapters() {
        return Array.from(this.adapters.values());
    }
    static getAll() {
        return this.getAllAdapters();
    }
    static getEnabledAdapters(enabledAgentIds) {
        const all = this.getAllAdapters();
        if (!enabledAgentIds || enabledAgentIds.length === 0) {
            return all;
        }
        return all.filter(a => enabledAgentIds.includes(a.agentId));
    }
    static async scanAll(enabledAgentIds, storagePaths, options) {
        const activeAdapters = this.getEnabledAdapters(enabledAgentIds);
        const results = await Promise.allSettled(activeAdapters.map(adapter => {
            const customPath = storagePaths ? storagePaths[adapter.agentId] : undefined;
            return adapter.scanSessions(customPath, options);
        }));
        const allSessions = [];
        for (const res of results) {
            if (res.status === 'fulfilled' && Array.isArray(res.value)) {
                allSessions.push(...res.value);
            }
        }
        return allSessions.sort((a, b) => {
            const score = (s) => (s.status === 'running' ? 3 : s.status === 'need_accept' ? 2 : 1);
            if (score(b) !== score(a)) {
                return score(b) - score(a);
            }
            return b.updatedAt - a.updatedAt;
        });
    }
    static getAllWatchedDirectories(enabledAgentIds, storagePaths) {
        const activeAdapters = this.getEnabledAdapters(enabledAgentIds);
        const dirs = [];
        for (const adapter of activeAdapters) {
            if (adapter.getWatchedDirectories) {
                const customPath = storagePaths ? storagePaths[adapter.agentId] : undefined;
                dirs.push(...adapter.getWatchedDirectories(customPath));
            }
        }
        return Array.from(new Set(dirs));
    }
}
exports.AgentRegistry = AgentRegistry;
//# sourceMappingURL=agent-registry.js.map