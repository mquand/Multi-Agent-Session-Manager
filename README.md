# Multi-Agent Session Manager (VS Code Extension)

[![Visual Studio Code](https://img.shields.io/badge/VS%20Code-Extension-blue.svg)](https://marketplace.visualstudio.com)
[![Platform](https://img.shields.io/badge/Platform-macOS%20%7C%20Linux%20%7C%20Windows-brightgreen.svg)]()
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Release](https://img.shields.io/badge/Release-v0.1.0-orange.svg)](https://github.com/mquand/Multi-Agent-Session-Manager/releases)

> A visual, high-performance, real-time extension to track, monitor, inspect, and switch between sessions across **multiple AI coding agents** (Claude Code, Google Antigravity / Gemini, Cursor AI, OpenAI Codex, GitHub Copilot Chat, and Windsurf Cascade) directly inside VS Code.

---

## 💡 Why Multi-Agent Session Manager?

Modern developers frequently leverage multiple AI coding assistants simultaneously:
- **Claude Code** for terminal-based agentic refactoring.
- **Google Antigravity / Gemini** for deep reasoning tasks and workspace changes.
- **Cursor AI** for project-wide chat and composer sessions.
- **OpenAI Codex** for rollout CLI workflows.
- **GitHub Copilot Chat** for in-editor chat and patch suggestions.
- **Windsurf (Cascade)** for multi-file flow editing.

When running multiple tasks, chat histories become fragmented across different directories, proprietary databases, and formats. You lose track of which agent is **running**, which is **waiting for approval (`need accept`)**, and which has completed.

**Multi-Agent Session Manager** scans your machine's local agent storage directories, normalizes their metadata into a unified interface, and presents a responsive dashboard right in your VS Code sidebar, explorer, and status bar.

---

## ✨ Supported AI Agents

| Agent | Storage Format | Default Path | Features |
| :--- | :--- | :--- | :--- |
| 🤖 **Claude Code** | JSONL + JSON runtime | `~/.claude/projects/` | PID runtime tracking, token telemetry, command approval detection |
| ✨ **Google Antigravity / Gemini** | JSONL transcript + SQLite DB | `~/.gemini/antigravity/brain/` | Step-based planner tracking, repo & branch detection |
| 🎯 **Cursor AI** | JSONL transcript | `~/.cursor/projects/` | Project transcripts, turn history, issue tag detection |
| 💻 **OpenAI Codex** | Rollout JSONL | `~/.codex/sessions/` | Recursive rollout discovery, prompt and token tracking |
| 🐙 **GitHub Copilot Chat** | SQLite Database | `AppData/.../github.copilot-chat/` | Native `session-store.db` relational queries, branch & repo mapping |
| 🌊 **Windsurf (Cascade)** | Protocol Buffer (`.pb`) | `~/.codeium/windsurf/cascade/` | Session size tracking, safe deletion of bloated files |

---

## 🚀 Key Features

### 1. Unified Real-Time Dashboard
- 🔵 **RUNNING**: Identifies actively executing tasks (via PID on Claude, or recent activity on other agents).
- 🟡 **NEED ACCEPT**: Flags tasks pausing for user confirmation on terminal commands or file changes.
- 🟢 **DONE**: Displays finished sessions with relative timestamps (`just now`, `5m ago`, `2h ago`).

### 2. Multi-Agent Filter Bar
- Quick-filter pills at the top of the view: **All AI**, **Claude**, **Gemini**, **Cursor**, **Codex**, **Copilot**, and **Windsurf**.
- Live badges with real-time session counters for each agent.
- Color-coded badges for immediate visual recognition on every session card.

### 3. Git Branch & Worktree Intelligence
- Automatically detects the Git repository and branch for each session.
- Seamlessly resolves Git Worktrees (`.git` file referencing `gitdir`).
- Filter sessions by current workspace or by Git branch/worktree with a single click.

### 4. Status Bar Integration
- Live summary on the bottom status bar:  
  `AI: 9 Claude • 50 Gemini • 7 Cursor • 15 Copilot • 38 Windsurf`
- Click to open the quick-filter menu and jump directly into any agent's sessions.

### 5. Multi-Container Placement
- **Activity Bar**: Dedicated AI Sessions icon on the primary sidebar.
- **Explorer View**: Accessible right inside your File Tree view.
- **Source Control (SCM) View**: Conveniently located alongside your Git changes.

### 6. Safe Session Deletion & Disk Cleanup
- Delete old or bloated conversation files directly from the UI.
- Particularly helpful for **Windsurf Cascade**, where bloated `.pb` files can cause IDE startup freezes.

### 7. Instant Session Jump & Transcript Viewing
- Click on any session card to activate the agent or open the transcript file directly in VS Code.

### 8. Auto-Updater via GitHub Releases
- Automatically checks for new releases on GitHub.
- 1-click update: downloads and installs the latest `.vsix` package seamlessly.

---

## ⚙️ Configuration

Open your VS Code Settings (`Ctrl+,` or `Cmd+,`) and search for `multiAgentSessionManager`:

| Setting | Default | Description |
| :--- | :--- | :--- |
| `enabledAgents` | `["claude", "gemini", "cursor", "codex", "copilot", "windsurf"]` | List of AI agents to scan and display |
| `autoRefreshInterval` | `10` | Auto-refresh interval in seconds |
| `language` | `"auto"` | Interface language (`auto`, `vi`, `en`) |
| `showInExplorer` | `true` | Display AI Sessions in the Explorer view |
| `showInSourceControl` | `true` | Display AI Sessions in the Source Control view |
| `storagePath` | `~/.claude/projects` | Custom path for Claude Code sessions |
| `geminiStoragePath` | `""` | Custom path for Gemini/Antigravity storage |
| `cursorStoragePath` | `""` | Custom path for Cursor AI projects |
| `codexStoragePath` | `""` | Custom path for OpenAI Codex sessions |
| `copilotStoragePath` | `""` | Custom path for GitHub Copilot `session-store.db` |
| `windsurfStoragePath` | `""` | Custom path for Windsurf Cascade `.pb` files |

---

## 📦 Installation

### From VSIX Package (Recommended)
1. Download the latest `.vsix` from [GitHub Releases](https://github.com/mquand/Multi-Agent-Session-Manager/releases).
2. In VS Code, press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS).
3. Type `Extensions: Install from VSIX...` and select the downloaded file.
4. Reload VS Code.

### From Source
```bash
git clone https://github.com/mquand/Multi-Agent-Session-Manager.git
cd "Multi-Agent-Session-Manager"
npm install
npm run compile
```

---

## 📄 License

MIT © [mhquan](https://github.com/mquand)
