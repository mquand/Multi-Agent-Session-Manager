# Multi-Agent Session Manager (VS Code Extension)

[![Visual Studio Code](https://img.shields.io/badge/VS%20Code-Extension-blue.svg)](https://marketplace.visualstudio.com)
[![Platform](https://img.shields.io/badge/Platform-macOS%20%7C%20Linux%20%7C%20Windows-brightgreen.svg)]()
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> A visual, lightweight, and real-time extension that helps you track, manage, categorize, and quickly switch between working sessions from **multiple AI agents** (Claude, Cursor, Gemini, Devin, etc.) directly in VS Code. Supports both **Issue/Ticket-based workflow (`#xxxx`)** and **daily free chat**.

---

## 💡 Problem Solved

When using multiple AI agents (Claude Code, Cursor, Gemini, Devin, etc.) intensively:
- You often open multiple tasks at once but don't know which task is **running**, which is **done**, which is **waiting for command approval (`need accept`)**.
- Chat history gets lost, hard to find the right old context.
- When you need to review terminal commands or return to an old conversation, you have to type commands or find IDs manually.

**Multi-Agent Session Manager** scans the runtime sessions and history of all your AI agents on your machine to create a one-click Dashboard right on the VS Code toolbar.

---

## ✨ Key Features

### 1. Multi-Agent Support
- 🤖 **Claude Code**: Full support with runtime PID tracking
- 🎯 **Cursor AI**: Session tracking from local transcripts
- ✨ **Gemini/Antigravity**: Session tracking from brain logs
- 🔧 **Devin**: Coming soon
- 🌊 **Windsurf**: Coming soon

### 2. Accurate Status Monitoring by Runtime OS
- 🔵 **RUNNING**: Detected by Process ID (PID) and runtime status of the AI agent. When the AI is actually thinking, generating code, or running scripts (`running`/`busy`), it shows as Running. When the AI has finished and switched to waiting for command (`idle`), the extension automatically updates to **Done**.
- 🟡 **NEED ACCEPT**: Detects the moment the AI stops to ask you to execute dangerous terminal commands or apply code files.
- 🟢 **DONE**: Sessions that have completed turns or processes have finished, showing relative time (`just now`, `5 minutes ago`...).

### 3. 100% Compatible with All Login Methods & Plans
The extension works by reading runtime data and local logs directly from each agent's directory:
- **Web Login**: Full support for various account types
- **API Login**: Token-based payment support
- Regardless of which plan or login method you use, the extension detects smoothly.

### 4. Automatic Adaptation to 2 Working Modes
- **Free Work (No Issue)**: If you just chat to fix bugs, discuss normally, the extension automatically takes the first question as the title, absolutely **no spam `#0`**.
- **Issue/Ticket Work**: Automatically detects `#<number>` syntax (e.g., `#100`, `#7152`, `#5433`) to attach a **green Issue Badge** and clean up duplicate text.

### 5. Multi-point Convenient Notifications (2 Locations)
- **Activity Bar (Left Sidebar)**: Unique AI icon with **orange/green number badge** jumping in real-time when there are tasks needing approval.
- **Status Bar (Bottom of screen)**: Quick display of number of tasks being processed (e.g., `🔔 AI: 1 Need Accept` or `✨ AI: 5 Tasks`), 1 click to open panel.

### 6. 1-Click Open Right Conversation (Instant Session Jump)
Click on any card on the interface ➔ VS Code will activate the corresponding AI agent and switch directly to that session immediately.

### 7. Clear Technical Statistics & Spacious Layout
The card interface is designed modernly, with increased line spacing, easy to read for people managing many sessions:
- 🕒 **Relative Time**: `just now`, `3 minutes ago`, `2 hours ago`...
- 🌿 **Git Branch & Repo**: Detects the correct repo and git branch you're working on.
- ✨ **AI Model**: `Opus 5.5`, `Sonnet 3.7`, `Haiku 3.5`, `GPT-4`, etc.
- 🗄️ **Tokens In / Out**: Clearly shows `in: 20.6M • out: 68K` (clearly distinguishing input tokens and output tokens).
- 💬 **Number of Interactions (Turns)**: Accurately counts the number of prompt exchanges in the session (1 user prompt + 1 response = 1 turn).
- 🆔 **Short Session ID**: First 8 characters for quick lookup.
- 🤖 **Agent Type**: Shows which AI agent (Claude, Cursor, Gemini, etc.)

### 8. Utility Toolbar: Refresh & Quick Settings
Next to the search bar, 2 quick action buttons are integrated:
- 🔄 **Refresh Button**: Rescans the entire session list immediately with a visual rotation effect.
- ⚙️ **Settings Button**: 1 click to open the extension configuration page in VS Code Settings.

### 9. Direct & Safe Conversation Deletion (Delete Conversation)
- Hover over any session card to reveal the **Trash (Delete)** button.
- When clicking delete, a safe confirmation dialog (`Modal`) appears to avoid accidental deletion.
- Confirming deletion will thoroughly clean up the `.jsonl` file and corresponding local data directory.

### 10. Collapsible/Expandable Groups (Accordion Dropdown) & Smooth Scrolling
- Groups **NEED ACCEPT**, **RUNNING**, **DONE** can be clicked on the title to collapse or expand as desired, keeping the interface always neat when there are many tasks.
- Automatically remembers the user's close/open state across sessions.
- Supports smooth vertical scrolling (`Smooth Scrolling`) with an aesthetically optimized scrollbar.

### 11. Auto Check & Update from GitHub Releases (Auto Updater)
- The extension automatically checks for new versions from GitHub Releases every time VS Code starts (or when clicking the **Download/Update** button on the toolbar).
- When a newer version is available on GitHub, VS Code will show a notification with an **[Update Now]** button.
- With just **1 click**, the extension will automatically download the `.vsix` file from GitHub and automatically install the latest version on your machine, no need to download or install manually anymore!

---

## 🛠️ Installation

### Method 1: Install from packaged `.vsix` file (Recommended for users)

Fully compatible with macOS, Linux, and Windows without needing Node.js or build code:

1. Download the latest **`.vsix`** from [GitHub Releases](https://github.com/mquand/Multi-Agent-Session-Manager/releases).
2. Open VS Code, press the key combination:
   - **macOS**: `Cmd + Shift + P`
   - **Windows / Linux**: `Ctrl + Shift + P`
3. Type:
   ```text
   Extensions: Install from VSIX...
   ```
4. Select the `.vsix` file you just downloaded and click **Install**.
5. Click **Reload Window** (`Developer: Reload Window`).

---

### Method 2: Install & Develop from source code (For Developers)

```bash
# 1. Clone repository
git clone https://github.com/mquand/Multi-Agent-Session-Manager.git
cd Multi-Agent-Session-Manager

# 2. Install dependencies
npm install

# 3. Compile TypeScript source code
npm run compile

# 4. Open in VS Code and press F5 to run Debug
code .
```

---

## ⚙️ Configuration (Settings)

The extension automatically searches by default paths of each AI agent on your computer:
- **Claude**: `~/.claude/projects` (conversation history `.jsonl`) and `~/.claude/sessions` (runtime PID)
- **Cursor**: `~/.cursor/projects/*/agent-transcripts` (conversation history `.jsonl`)
- **Gemini**: `~/.gemini/antigravity/brain/*/logs` (conversation history `.jsonl`)

If you change the configuration of an AI agent to another folder:
1. Open **Settings** (`Cmd + ,` or `Ctrl + ,`).
2. Search for the keyword `Multi-Agent Session Manager`.
3. Adjust:
   - `multiAgentSessionManager.storagePath`: Custom projects storage path.
   - `multiAgentSessionManager.autoRefreshInterval`: Periodic scan frequency (default: `10` seconds).
   - `multiAgentSessionManager.enabledAgents`: List of enabled agents (claude, cursor, gemini, devin, windsurf).

---

## 🤝 Contributing & Development (Contributing)

All contributions, bug reports (Issues) or new features (Pull Requests) are welcome:
1. Fork the project
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -m 'feat: add project filter'`)
4. Push branch (`git push origin feature/new-feature`)
5. Open Pull Request on GitHub

---

## 📄 License (License)

The project is released under the [MIT License](LICENSE).
