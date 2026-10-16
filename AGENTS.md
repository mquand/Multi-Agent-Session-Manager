# AI Agents Research - Local Data Analysis

## Discovery Results

Scanned machine: `C:\Users\dev_mhquan`
Date: 2026-10-16

## Detected AI Agents

### ✅ Claude Code
**Status**: Already supported (to be refactored)

**Paths**:
- Sessions: `~/.claude/projects/*/session.jsonl`
- Runtime: `~/.claude/sessions/*.json`

**Format**:
```json
{"type":"user","message":{"content":[...]}}
{"type":"assistant","message":{"content":[...]}}
```

**Runtime Tracking**: ✅ Yes (PID-based)
**Token Tracking**: ✅ Yes
**Git Integration**: ✅ Yes

---

### ✅ Cursor AI
**Status**: Ready to implement

**Paths**:
- Projects: `~/.cursor/projects/`
- Transcripts: `~/.cursor/projects/*/agent-transcripts/*.jsonl`
- Tracking DB: `~/.cursor/ai-tracking/ai-code-tracking.db` (SQLite)

**Example Structure**:
```
.cursor/
├── projects/
│   ├── 1785384928162/
│   │   └── canvases/
│   └── d-StartUp2026-ZaFlow/
│       ├── agent-transcripts/
│       │   ├── cc46d0b8-9f3b-4aab-9d36-2f7acd86ad3e/
│       │   │   └── cc46d0b8-9f3b-4aab-9d36-2f7acd86ad3e.jsonl
│       ├── canvases/
│       ├── terminals/
│       └── mcps/
├── ai-tracking/
│   └── ai-code-tracking.db
└── agents/
```

**Format** (similar to Claude):
```json
{"role":"user","message":{"content":[{"type":"text","text":"..."}]}}
{"role":"assistant","message":{"content":[{"type":"tool_use","name":"Read",...}]}}
```

**Key Observations**:
- Format is very similar to Claude (role-based)
- Has SQLite tracking database (might have additional metadata)
- Multiple transcripts per project (one per session ID)
- Canvas data available (might be useful for context)

**Runtime Tracking**: ❌ No PID tracking (cloud-based)
**Token Tracking**: ✅ Likely (in JSONL or DB)
**Git Integration**: ✅ Likely (can infer from workspace)

**Implementation Priority**: 🔴 HIGH (format similar to Claude)

---

### ✅ Gemini / Antigravity
**Status**: Ready to implement

**Paths**:
- Brain data: `~/.gemini/antigravity/brain/*/`
- Logs: `~/.gemini/antigravity/brain/*/.system_generated/logs/`
- Transcript: `~/.gemini/antigravity/brain/*/.system_generated/logs/transcript.jsonl`
- Chunks: `~/.gemini/antigravity/brain/*/.system_generated/logs/chunks/transcript/*.jsonl`

**Example Structure**:
```
.gemini/
├── antigravity/
│   ├── brain/
│   │   ├── 7fff5893-c9e9-4469-a9b5-1336385d12f3/
│   │   │   └── .system_generated/
│   │   │       └── logs/
│   │   │           ├── chunks/
│   │   │           │   └── transcript/
│   │   │           │       ├── 00000000.jsonl
│   │   │           │       └── ...
│   │   │           ├── transcript.jsonl
│   │   │           └── transcript_full.jsonl
│   │   └── 85496fbb-5fd1-47c9-9398-c853d6a09663/
│   │       └── .system_generated/
│   │           └── logs/
│   │               ├── chunks/
│   │               │   └── transcript/
│   │               │       ├── 00000000.jsonl
│   │               │       ├── 00000001.jsonl
│   │               │       └── ...
│   │               ├── transcript.jsonl
│   │               └── transcript_full.jsonl
```

**Format** (different from Claude):
```json
{"step_index":0,"source":"USER_EXPLICIT","type":"USER_INPUT","status":"DONE","created_at":"2026-08-27T10:05:41Z","content":"..."}
{"step_index":1,"source":"MODEL","type":"PLANNER_RESPONSE","status":"DONE","created_at":"2026-08-27T10:05:41Z","tool_calls":[...]}
{"step_index":2,"source":"MODEL","type":"GENERIC","status":"DONE","created_at":"2026-08-27T10:05:43Z","content":"..."}
```

**Key Observations**:
- Step-based tracking with `step_index`
- Different status fields: `USER_EXPLICIT`, `MODEL`, `PLANNER_RESPONSE`, `GENERIC`
- Status tracking: `DONE`, `RUNNING`, etc.
- Timestamps in ISO format
- Has both `transcript.jsonl` and `transcript_full.jsonl`
- Chunks available for large transcripts

**Runtime Tracking**: ❌ No PID tracking (cloud-based)
**Token Tracking**: ⚠️ Unclear (may be in metadata)
**Git Integration**: ⚠️ Unclear (may need to infer from tool calls)

**Implementation Priority**: 🟡 MEDIUM (different format, needs custom parser)

---

### ⚠️ Devin
**Status**: Needs research

**Paths**:
- Main: `~/.devin/`
- Extensions: `~/.devin/extensions/`

**Example Structure**:
```
.devin/
├── argv.json
└── extensions/
    └── alfredbirk.tailwind-documentation-0.1.15-universal/
        ├── .vscode/
        ├── build/
        ├── node_modules/
        └── package.json
```

**Key Observations**:
- Only `argv.json` and extensions found
- No obvious session/transcript directory
- May need to research more or check if data is cloud-only
- May need to check AppData or other locations

**Runtime Tracking**: ❓ Unknown
**Token Tracking**: ❓ Unknown
**Git Integration**: ❓ Unknown

**Implementation Priority**: 🔵 LOW (needs more research)

---

### ⚠️ Windsurf
**Status**: Needs research

**Paths**:
- Main: `~/.windsurf/`
- Extensions: `~/.windsurf/extensions/`

**Example Structure**:
```
.windsurf/
├── argv.json
└── extensions/
    ├── codeium.windsurfpyright-1.29.6-universal/
    ├── ms-python.debugpy-2026.6.0-win32-x64/
    ├── ms-python.python-2026.4.0-universal/
    └── ms-python.vscode-python-envs-1.20.1-universal/
```

**Key Observations**:
- Similar structure to Devin
- Only `argv.json` and extensions found
- No obvious session/transcript directory
- May need to research more or check if data is cloud-only
- Windsurf is Codeium-based, may have similar data structure

**Runtime Tracking**: ❓ Unknown
**Token Tracking**: ❓ Unknown
**Git Integration**: ❓ Unknown

**Implementation Priority**: 🔵 LOW (needs more research)

---

### ℹ️ Other Detected Tools

### ✅ OpenAI Codex
**Status**: Implemented (`CodexAdapter`)

**Paths**:
- Sessions: `~/.codex/sessions/YYYY/MM/DD/rollout-*.jsonl`

**Format**:
```json
{"type":"session_meta","payload":{"session_id":"...","cwd":"...","model":"..."}}
{"type":"user_message","payload":{"message":"..."}}
{"type":"assistant_message","payload":{"content":"...","input_tokens":1200,"output_tokens":400}}
```

**Runtime Tracking**: ✅ Timestamps & activity based
**Token Tracking**: ✅ Yes (`input_tokens`, `output_tokens`)
**Git Integration**: ✅ Yes (inferred from `session_meta.cwd`)

---

### ✅ GitHub Copilot Chat
**Status**: Implemented (`CopilotAdapter`)

**Paths**:
- Storage DB: `AppData/Roaming/Code/User/globalStorage/github.copilot-chat/session-store.db` (SQLite)

**Format**:
- `sessions` table: `id`, `cwd`, `repository`, `branch`, `summary`, `created_at`, `updated_at`
- `turns` table: `user_message`, `assistant_response`, `turn_index`, `timestamp`

**Runtime Tracking**: ✅ Timestamps & activity based
**Token Tracking**: ✅ Turn based estimation
**Git Integration**: ✅ Yes (`repository` & `branch` fields directly in DB)

---

### ✅ Windsurf (Cascade)
**Status**: Implemented (`WindsurfAdapter`)

**Paths**:
- Cascade Sessions: `~/.codeium/windsurf/cascade/*.pb`
- Workspace Tracker: `~/.codeium/windsurf/code_tracker/active/`

**Format**:
- Protocol Buffer (`.pb`) blobs per session
- Workspace context mapping from `code_tracker/active`

**Runtime Tracking**: ✅ File mtime based
**Token/Size Tracking**: ✅ Size in KB/MB
**Git Integration**: ✅ Yes (mapped from active workspace tracker)

---

### ℹ️ Other Detected Tools

#### Grok
- Path: `~/.grok/`
- Status: Cloud-based

#### Kiro
- Path: `~/.kiro/`
- Status: Needs research

#### Lyra CLI
- Path: `~/.lyra-cli/`
- Status: CLI tool

#### Trae
- Path: `~/.trae/`
- Status: ByteDance IDE, cloud-based

## Implementation Summary (All Active Agents Supported!)

1. **Claude Code** - Supported with PID & transcript tracking (9 live sessions)
2. **Gemini / Antigravity** - Supported with DB & transcript parsing (50 live sessions)
3. **Windsurf (Cascade)** - Supported with Protobuf session & size tracking (38 live sessions)
4. **GitHub Copilot Chat** - Supported with SQLite `session-store.db` parsing (15 live sessions)
5. **Cursor AI** - Supported with project transcript parsing (7 live sessions)
6. **OpenAI Codex** - Supported with rollout `.jsonl` parsing

## Format Comparison

| Agent | Format Type | Role/Type Field | Status Tracking | Storage Location |
|-------|-------------|-----------------|-----------------|------------------|
| Claude | role-based | `type` (user/assistant) | PID-based | `~/.claude/projects/` |
| Cursor | role-based | `role` (user/assistant) | File mtime | `~/.cursor/projects/` |
| Gemini | step-based | `source` (USER_EXPLICIT/MODEL) | Status field | `~/.gemini/antigravity-ide/brain/` |
| Codex | event-based | `type` (session_meta, user_message) | Error check / mtime | `~/.codex/sessions/` |
| Copilot | SQLite DB | relational (`sessions` & `turns`) | Updated timestamp | `globalStorage/github.copilot-chat/` |
| Windsurf | Protobuf | binary `.pb` files | File mtime & size | `~/.codeium/windsurf/cascade/` |


