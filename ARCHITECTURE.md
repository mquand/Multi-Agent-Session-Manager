# Multi-Agent Session Manager - Architecture Design

## Overview

This document outlines the architecture for extending the Claude Session Manager to support multiple AI agents (Claude, Cursor, Gemini, Devin, Windsurf, etc.).

## Current Architecture (Claude-only)

```
┌─────────────────────────────────────────┐
│   Claude Session Manager (Extension)    │
│   - extension.ts (main entry)           │
│   - issuesViewProvider.ts (UI)          │
│   - scanner.ts (Claude-specific)        │
│   - types.ts (ClaudeSession interface)  │
│   - updater.ts (GitHub releases)        │
└─────────────────────────────────────────┘
                    │
                    ▼
         ~/.claude/projects/*.jsonl
         ~/.claude/sessions/*.json
```

## Proposed Multi-Agent Architecture

```
┌─────────────────────────────────────────────────────────────┐
│          Multi-Agent Session Manager (Core)                  │
│  - extension.ts (main entry & orchestration)                │
│  - issuesViewProvider.ts (UI - unified for all agents)      │
│  - agent-registry.ts (manages available agents)               │
│  - types.ts (unified Session interface)                      │
│  - updater.ts (GitHub releases)                              │
└─────────────────────────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┬───────────┐
        ▼           ▼           ▼           ▼
┌──────────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ Claude       │ │ Cursor   │ │ Gemini   │ │ Other    │
│ Adapter      │ │ Adapter  │ │ Adapter  │ │ Agent    │
│              │ │          │ │          │ │ Adapter  │
│ - scanner.ts │ │ - cursor │ │ - gemini │ │ - ...    │
│ - types.ts   │ │ scanner │ │ scanner │ │          │
└──────────────┘ └──────────┘ └──────────┘ └──────────┘
     │               │              │           │
     ▼               ▼              ▼           ▼
~/.claude/      ~/.cursor/     ~/.gemini/   ~/.other/
```

## Core Interfaces

### AgentAdapter Interface

```typescript
interface AgentAdapter {
  // Agent identification
  readonly agentId: string;           // 'claude', 'cursor', 'gemini', etc.
  readonly agentName: string;         // 'Claude Code', 'Cursor AI', etc.
  readonly icon: string;              // Icon resource path

  // Configuration
  getDefaultStoragePath(): string;    // Default path for this agent
  isEnabled(): boolean;               // Check if agent is enabled in settings

  // Session scanning
  scanSessions(options?: ScanOptions): Promise<Session[]>;

  // Session management
  deleteSession(sessionId: string, filePath: string): boolean;

  // Runtime tracking (optional)
  getActiveSessionsMap(): Map<string, { status: string; pid: number }>;
}
```

### Unified Session Interface

```typescript
interface Session {
  // Common fields (required for all agents)
  id: string;
  agentId: string;                    // 'claude', 'cursor', 'gemini', etc.
  title: string;
  repo: string;
  branch: string;
  status: SessionStatus;
  statusMessage: string;
  updatedAt: number;
  filePath?: string;

  // Metadata
  source: 'VS Code' | 'Terminal';
  modelName: string;
  inputTokensFormatted: string;
  outputTokensFormatted: string;
  costUSD?: string;
  turnCount: number;
  shortId: string;
  cwd?: string;

  // Agent-specific fields (optional)
  agentSpecificData?: Record<string, any>;
}

type SessionStatus = 'need_accept' | 'done' | 'running' | 'failed' | 'question';
```

## Agent-Specific Implementations

### 1. Claude Adapter (existing, to be refactored)

**Path**: `src/adapters/claude/`

**Files**:
- `claude-adapter.ts` - Implements AgentAdapter
- `claude-scanner.ts` - Existing scanner.ts logic
- `claude-types.ts` - Claude-specific types

**Data Source**:
- `~/.claude/projects/*/session.jsonl`
- `~/.claude/sessions/*.json` (runtime PID tracking)

**Format**:
```json
{"type":"user","message":{"content":[...]}}
{"type":"assistant","message":{"content":[...]}}
```

### 2. Cursor Adapter (to be implemented)

**Path**: `src/adapters/cursor/`

**Files**:
- `cursor-adapter.ts` - Implements AgentAdapter
- `cursor-scanner.ts` - Cursor-specific scanning logic
- `cursor-types.ts` - Cursor-specific types

**Data Source**:
- `~/.cursor/projects/*/agent-transcripts/*.jsonl`

**Format** (similar to Claude):
```json
{"role":"user","message":{"content":[{"type":"text","text":"..."}]}}
{"role":"assistant","message":{"content":[{"type":"tool_use","name":"Read",...}]}}
```

**Key Differences**:
- No runtime PID tracking (cloud-based)
- Different field names (`role` vs `type`)
- May need different status detection logic

### 3. Gemini/Antigravity Adapter (to be implemented)

**Path**: `src/adapters/gemini/`

**Files**:
- `gemini-adapter.ts` - Implements AgentAdapter
- `gemini-scanner.ts` - Gemini-specific scanning logic
- `gemini-types.ts` - Gemini-specific types

**Data Source**:
- `~/.gemini/antigravity/brain/*/.system_generated/logs/transcript.jsonl`
- `~/.gemini/antigravity/brain/*/.system_generated/logs/chunks/transcript/*.jsonl`

**Format** (different from Claude):
```json
{"step_index":0,"source":"USER_EXPLICIT","type":"USER_INPUT","status":"DONE","created_at":"...","content":"..."}
{"step_index":1,"source":"MODEL","type":"PLANNER_RESPONSE","status":"DONE","created_at":"...","tool_calls":[...]}
```

**Key Differences**:
- Step-based tracking with `step_index`
- Different status fields (`DONE`, `RUNNING`, etc.)
- May need different parsing logic

### 4. Devin Adapter (future)

**Path**: `src/adapters/devin/`

**Data Source**: TBD (need to research `~/.devin/` structure)

### 5. Windsurf Adapter (future)

**Path**: `src/adapters/windsurf/`

**Data Source**: TBD (need to research `~/.windsurf/` structure)

## Configuration Structure

```json
{
  "multiAgentSessionManager": {
    "enabledAgents": ["claude", "cursor", "gemini"],
    "autoRefreshInterval": 10,
    "language": "auto",
    "showInExplorer": true,
    "showInSourceControl": true,
    "workspaceRoot": "",
    "defaultRepo": "",
    "agentPaths": {
      "claude": "~/.claude/projects",
      "cursor": "~/.cursor/projects",
      "gemini": "~/.gemini/antigravity/brain"
    }
  }
}
```

## UI Changes

### 1. Agent Filter/Selector

Add a dropdown in the toolbar to filter sessions by agent:
- "All Agents" (default)
- "Claude"
- "Cursor"
- "Gemini"
- etc.

### 2. Session Card Updates

Add agent badge to each session card:
- Show agent icon
- Show agent name (e.g., "Claude", "Cursor", "Gemini")
- Color-code by agent type

### 3. Status Bar Updates

Update status bar to show multiple agents:
- `🔔 AI: 3 Claude • 2 Cursor • 1 Gemini`
- Click to open agent-specific view

## Migration Strategy

### Phase 1: Architecture Setup
1. Create `src/adapters/` directory structure
2. Define `AgentAdapter` interface
3. Create `agent-registry.ts` to manage adapters
4. Update `types.ts` with unified `Session` interface

### Phase 2: Refactor Claude
1. Move existing Claude logic to `src/adapters/claude/`
2. Implement `ClaudeAdapter` class
3. Update main extension to use adapter pattern
4. Test to ensure no regression

### Phase 3: Implement Cursor
1. Create `src/adapters/cursor/` structure
2. Implement `CursorAdapter` class
3. Write Cursor-specific scanner
4. Test with real Cursor data
5. Add to agent registry

### Phase 4: Implement Gemini
1. Create `src/adapters/gemini/` structure
2. Implement `GeminiAdapter` class
3. Write Gemini-specific scanner
4. Test with real Gemini data
5. Add to agent registry

### Phase 5: UI Updates
1. Add agent filter to UI
2. Add agent badges to session cards
3. Update status bar for multi-agent support
4. Add agent-specific settings

### Phase 6: Additional Agents
1. Research and implement Devin adapter
2. Research and implement Windsurf adapter
3. Add any other requested agents

## File Structure After Refactor

```
src/
├── adapters/
│   ├── claude/
│   │   ├── claude-adapter.ts
│   │   ├── claude-scanner.ts
│   │   └── claude-types.ts
│   ├── cursor/
│   │   ├── cursor-adapter.ts
│   │   ├── cursor-scanner.ts
│   │   └── cursor-types.ts
│   ├── gemini/
│   │   ├── gemini-adapter.ts
│   │   ├── gemini-scanner.ts
│   │   └── gemini-types.ts
│   └── base-adapter.ts              // Base AgentAdapter interface
├── agent-registry.ts                 // Manages all adapters
├── extension.ts                       // Main entry (orchestration)
├── issuesViewProvider.ts              // UI (updated for multi-agent)
├── types.ts                           // Unified Session interface
└── updater.ts                         // GitHub releases (unchanged)
```

## Testing Strategy

### Unit Tests
- Test each adapter independently
- Test agent registry functionality
- Test session parsing for each format

### Integration Tests
- Test multi-agent scanning
- Test UI with mixed agent sessions
- Test filtering by agent

### Manual Testing
- Test with real Claude data
- Test with real Cursor data
- Test with real Gemini data
- Verify no regression in Claude functionality

## Notes

- Each adapter should be independent and testable
- Adapters should handle errors gracefully (e.g., missing agent data)
- UI should degrade gracefully if an agent is not installed
- Configuration should allow enabling/disabling specific agents
- Performance should remain acceptable even with multiple agents
