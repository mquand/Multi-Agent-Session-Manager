# Multi-Agent Session Manager - Architecture Design

## 1. Overview

**Multi-Agent Session Manager** is a visual, extensible VS Code extension built with a modular **Adapter Pattern** that allows developers to monitor, organize, inspect, and manage AI coding agent sessions from multiple tools directly inside VS Code.

---

## 2. System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                   VS Code Extension Host                               │
│                                                                        │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │               IssuesViewProvider (Webview UI)                │     │
│   │   - Real-time Dashboard (Running / Need Accept / Done)       │     │
│   │   - Agent Filter Tabs (All / Claude / Gemini / Cursor / ...) │     │
│   │   - Workspace & Worktree Filtering                           │     │
│   │   - Multi-Agent Status Bar & Tooltips                        │     │
│   └──────────────────────────────┬───────────────────────────────┘     │
│                                  │                                     │
│   ┌──────────────────────────────▼───────────────────────────────┐     │
│   │                 AgentRegistry (Orchestrator)                 │     │
│   │   - Register adapters dynamically                            │     │
│   │   - Aggregate session scans (Promise.allSettled)             │     │
│   │   - Aggregate FileSystemWatchers (**/*.{jsonl,db,pb})        │     │
│   └──────┬──────────┬──────────┬──────────┬──────────┬───────────┘     │
│          │          │          │          │          │                 │
└──────────┼──────────┼──────────┼──────────┼──────────┼─────────────────┘
           ▼          ▼          ▼          ▼          ▼
     ┌──────────┐┌──────────┐┌──────────┐┌──────────┐┌──────────┐┌──────────┐
     │  Claude  ││  Gemini  ││  Cursor  ││  Codex   ││ Copilot  ││ Windsurf │
     │ Adapter  ││ Adapter  ││ Adapter  ││ Adapter  ││ Adapter  ││ Adapter  │
     └────┬─────┘└────┬─────┘└────┬─────┘└────┬─────┘└────┬─────┘└────┬─────┘
          │           │           │           │           │           │
          ▼           ▼           ▼           ▼           ▼           ▼
      ~/.claude/  ~/.gemini/  ~/.cursor/  ~/.codex/    AppData/   ~/.codeium/
      projects/    brain/     projects/   sessions/   copilot-db/   cascade/
```

---

## 3. Core Abstractions

### 3.1 `AgentAdapter` Interface (`src/adapters/base-adapter.ts`)

Every AI agent connects to the extension by implementing `AgentAdapter`:

```typescript
export interface AgentAdapter {
  readonly agentId: string;           // 'claude' | 'gemini' | 'cursor' | 'codex' | 'copilot' | 'windsurf'
  readonly agentName: string;         // 'Claude Code' | 'Gemini' | 'Cursor AI' | ...
  readonly icon: string;              // Codicon string: '$(hubot)' | '$(sparkle)' | '$(code)' | ...
  readonly badgeColor: string;        // Hex color for UI badge

  getDefaultStoragePath(): string;
  isEnabled(config?: any): boolean;
  getWatchedDirectories?(customPath?: string): string[];
  scanSessions(customPath?: string, options?: ScanOptions): Promise<Session[]>;
  deleteSession?(sessionId: string, filePath: string): boolean;
  getActiveSessionsMap?(): Map<string, { status: string; pid: number }>;
}
```

### 3.2 `AgentRegistry` (`src/agent-registry.ts`)

The central manager that registers and orchestrates adapters:
- `registerAdapter(adapter)`: Registers an adapter.
- `getAdapter(agentId)`: Gets an adapter by ID.
- `getAllAdapters()` / `getAll()`: Returns all registered adapters.
- `getEnabledAdapters(enabledAgentIds)`: Filters adapters based on user configuration.
- `scanAll(enabledAgentIds, storagePaths, options)`: Concurrently scans all active adapters and returns a prioritized list of sessions.
- `getAllWatchedDirectories(enabledAgentIds, storagePaths)`: Collects directories to watch for file system changes.

### 3.3 Unified `Session` Interface (`src/types.ts`)

```typescript
export type SessionStatus = 'need_accept' | 'done' | 'running' | 'failed' | 'question';

export interface Session {
  id: string;
  agentId: AgentId;
  agentName?: string;
  badgeColor?: string;
  issueId?: string;           // e.g., "#101"
  title: string;
  repo: string;
  branch: string;
  isWorktree?: boolean;
  status: SessionStatus;
  statusMessage: string;     // e.g., "just now", "5 minutes ago"
  lastUserPrompt?: string;
  lastAssistantResponse?: string;
  updatedAt: number;
  filePath?: string;
  source: 'VS Code' | 'Terminal' | 'Web' | 'IDE';
  modelName: string;
  inputTokensFormatted: string;
  outputTokensFormatted: string;
  turnCount: number;
  shortId: string;
  cwd?: string;
}
```

---

## 4. Supported Agents & Storage Formats

| Agent | Storage Format | Storage Path | Key Capabilities |
| :--- | :--- | :--- | :--- |
| **Claude Code** | JSONL + JSON runtime | `~/.claude/projects/` | PID runtime tracking, token metrics, prompt history |
| **Gemini / Antigravity** | JSONL transcript + SQLite DB | `~/.gemini/antigravity/brain/` | Step-based planner responses, Git repo/branch detection |
| **Cursor AI** | JSONL transcript | `~/.cursor/projects/` | Transcripts per project folder, turn-based history |
| **OpenAI Codex** | Rollout JSONL | `~/.codex/sessions/` | Event-based rollout parsing, model and token tracking |
| **GitHub Copilot Chat** | SQLite Database | `AppData/.../github.copilot-chat/` | Structured relational sessions, repo/branch tracking, turn history |
| **Windsurf (Cascade)** | Protocol Buffer (`.pb`) | `~/.codeium/windsurf/cascade/` | Binary chat history, disk cleanup of bloated sessions |

---

## 5. UI Architecture

The extension UI is delivered through a high-performance Webview with:
- **Pill Filters**: Dynamic tabs for all AI agents with real-time session counters.
- **Accordion Groups**: Categorized by status (Waiting Approval, Running, Today, All).
- **Responsive Layout**: Designed for Activity Bar (Sidebar), Explorer panel, and Source Control view.
- **Realtime File Watcher**: Watches `**/*.{jsonl,db,pb}` with debounced updates (300ms) to ensure minimal CPU overhead.
