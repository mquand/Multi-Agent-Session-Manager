# Refactoring Guide - From Claude to Multi-Agent

## ✅ What's Been Done

### 1. Repository Setup
- ✅ Created new repository: `Multi-Agent Session Manager`
- ✅ Cloned all files from `Claude-Session-Manager-`
- ✅ Removed old `.git` directory (ready for fresh init)
- ✅ Updated `package.json` with new naming:
  - `name`: `multi-agent-session-manager`
  - `displayName`: `Multi-Agent Session Manager`
  - `description`: Updated to mention multiple AI agents
  - All command IDs changed from `claudeSessionManager.*` to `multiAgentSessionManager.*`
  - All configuration keys changed from `claudeSessionManager.*` to `multiAgentSessionManager.*`
  - Added new config: `multiAgentSessionManager.enabledAgents` (array of enabled agents)

### 2. Documentation
- ✅ Updated `README.md` with multi-agent description
- ✅ Updated `README.vn.md` with multi-agent description
- ✅ Created `ARCHITECTURE.md` with detailed architecture design
- ✅ Created this `REFACTORING_GUIDE.md`

### 3. Directory Structure
- ✅ Created `src/adapters/` directory
- ✅ Created subdirectories for:
  - `src/adapters/claude/`
  - `src/adapters/cursor/`
  - `src/adapters/gemini/`

## 📋 Next Steps (Refactoring Phase)

### Phase 1: Architecture Setup

#### 1.1 Create Base Adapter Interface
**File**: `src/adapters/base-adapter.ts`

```typescript
export interface AgentAdapter {
  readonly agentId: string;
  readonly agentName: string;
  readonly icon: string;

  getDefaultStoragePath(): string;
  isEnabled(): boolean;
  scanSessions(options?: ScanOptions): Promise<Session[]>;
  deleteSession(sessionId: string, filePath: string): boolean;
  getActiveSessionsMap(): Map<string, { status: string; pid: number }>;
}
```

#### 1.2 Create Agent Registry
**File**: `src/agent-registry.ts`

```typescript
import { AgentAdapter } from './adapters/base-adapter';

export class AgentRegistry {
  private adapters: Map<string, AgentAdapter> = new Map();

  register(adapter: AgentAdapter): void {
    this.adapters.set(adapter.agentId, adapter);
  }

  get(agentId: string): AgentAdapter | undefined {
    return this.adapters.get(agentId);
  }

  getAll(): AgentAdapter[] {
    return Array.from(this.adapters.values());
  }

  getEnabled(): AgentAdapter[] {
    return this.getAll().filter(adapter => adapter.isEnabled());
  }
}
```

#### 1.3 Update Types
**File**: `src/types.ts`

Add `agentId` field to `Session` interface:
```typescript
export interface Session {
  id: string;
  agentId: string;  // NEW: 'claude', 'cursor', 'gemini', etc.
  // ... existing fields
}
```

### Phase 2: Refactor Claude Adapter

#### 2.1 Move Claude Scanner
- Move `src/scanner.ts` → `src/adapters/claude/claude-scanner.ts`
- Update imports in other files

#### 2.2 Create Claude Adapter
**File**: `src/adapters/claude/claude-adapter.ts`

```typescript
import { AgentAdapter } from '../base-adapter';
import { SessionScanner } from './claude-scanner';
import * as vscode from 'vscode';

export class ClaudeAdapter implements AgentAdapter {
  readonly agentId = 'claude';
  readonly agentName = 'Claude Code';
  readonly icon = 'resources/claude-icon.svg';

  getDefaultStoragePath(): string {
    return '~/.claude/projects';
  }

  isEnabled(): boolean {
    const config = vscode.workspace.getConfiguration('multiAgentSessionManager');
    const enabledAgents = config.get<string[]>('enabledAgents', ['claude']);
    return enabledAgents.includes('claude');
  }

  async scanSessions(options?: any): Promise<Session[]> {
    const config = vscode.workspace.getConfiguration('multiAgentSessionManager');
    const storagePath = config.get<string>('storagePath', this.getDefaultStoragePath());
    return await SessionScanner.scanSessions(storagePath, options);
  }

  deleteSession(sessionId: string, filePath: string): boolean {
    return SessionScanner.deleteSession(sessionId, filePath);
  }

  getActiveSessionsMap(): Map<string, { status: string; pid: number }> {
    return SessionScanner.getActiveSessionsMap();
  }
}
```

#### 2.3 Update Main Extension
**File**: `src/extension.ts`

- Import `AgentRegistry` and `ClaudeAdapter`
- Register Claude adapter in `activate()`
- Update all command IDs to use new naming
- Update configuration key references

### Phase 3: Implement Cursor Adapter

#### 3.1 Create Cursor Scanner
**File**: `src/adapters/cursor/cursor-scanner.ts`

- Parse Cursor `.jsonl` format
- Extract session metadata
- Map to unified `Session` interface

#### 3.2 Create Cursor Adapter
**File**: `src/adapters/cursor/cursor-adapter.ts`

- Implement `AgentAdapter` interface
- Return `~/.cursor/projects` as default path
- Check if cursor is in `enabledAgents`

#### 3.3 Register Cursor Adapter
- Add to `AgentRegistry` in `extension.ts`

### Phase 4: Implement Gemini Adapter

#### 4.1 Create Gemini Scanner
**File**: `src/adapters/gemini/gemini-scanner.ts`

- Parse Gemini/Antigravity `.jsonl` format
- Handle step-based tracking
- Map to unified `Session` interface

#### 4.2 Create Gemini Adapter
**File**: `src/adapters/gemini/gemini-adapter.ts`

- Implement `AgentAdapter` interface
- Return `~/.gemini/antigravity/brain` as default path
- Check if gemini is in `enabledAgents`

#### 4.3 Register Gemini Adapter
- Add to `AgentRegistry` in `extension.ts`

### Phase 5: UI Updates

#### 5.1 Update IssuesViewProvider
**File**: `src/issuesViewProvider.ts`

- Add agent filter dropdown
- Add agent badge to session cards
- Update status message for multi-agent
- Handle agent-specific session opening

#### 5.2 Update HTML/CSS
- Add agent filter UI
- Add agent badge styling
- Add agent-specific colors

### Phase 6: Testing

#### 6.1 Test Claude (Regression)
- Ensure Claude still works after refactoring
- Verify all Claude features intact

#### 6.2 Test Cursor
- Scan Cursor sessions
- Display in UI
- Filter by Cursor
- Delete Cursor sessions

#### 6.3 Test Gemini
- Scan Gemini sessions
- Display in UI
- Filter by Gemini
- Delete Gemini sessions

#### 6.4 Test Multi-Agent
- Display sessions from multiple agents
- Filter by specific agent
- Show "All Agents" view
- Verify agent badges

## 🚀 Quick Start Commands

```bash
# Navigate to new repository
cd "/d/StartUp2026/Multi-Agent Session Manager"

# Initialize new git repository
git init
git add .
git commit -m "Initial commit: Multi-Agent Session Manager base"

# Create GitHub repository and push
# (manual step - create repo on GitHub first)
git remote add origin https://github.com/mquand/Multi-Agent-Session-Manager.git
git branch -M main
git push -u origin main
```

## 📝 Configuration Changes

Users will need to update their VS Code settings:

```json
{
  "multiAgentSessionManager.enabledAgents": ["claude", "cursor", "gemini"],
  "multiAgentSessionManager.storagePath": "~/.claude/projects",
  "multiAgentSessionManager.autoRefreshInterval": 10
}
```

## ⚠️ Breaking Changes

1. **Extension ID**: Changed from `claude-session-deck` to `multi-agent-session-manager`
2. **Configuration Keys**: All keys changed from `claudeSessionManager.*` to `multiAgentSessionManager.*`
3. **Command IDs**: All commands changed from `claudeSessionManager.*` to `multiAgentSessionManager.*`
4. **View IDs**: All view IDs changed from `claudeSessionManager.*` to `multiAgentSessionManager.*`

Users will need to:
- Uninstall old extension
- Install new extension
- Reconfigure settings (though defaults are reasonable)

## 🎯 Success Criteria

- [ ] Claude functionality unchanged (no regression)
- [ ] Cursor sessions can be scanned and displayed
- [ ] Gemini sessions can be scanned and displayed
- [ ] UI shows agent badges
- [ ] UI can filter by agent
- [ ] Configuration allows enabling/disabling agents
- [ ] Performance acceptable with multiple agents
- [ ] Documentation updated
- [ ] Tests pass
