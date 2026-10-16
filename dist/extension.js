"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const fs = require("fs");
const issuesViewProvider_1 = require("./issuesViewProvider");
const updater_1 = require("./updater");
const agent_registry_1 = require("./agent-registry");
const claude_adapter_1 = require("./adapters/claude/claude-adapter");
const gemini_adapter_1 = require("./adapters/gemini/gemini-adapter");
const cursor_adapter_1 = require("./adapters/cursor/cursor-adapter");
const codex_adapter_1 = require("./adapters/codex/codex-adapter");
const copilot_adapter_1 = require("./adapters/copilot/copilot-adapter");
const windsurf_adapter_1 = require("./adapters/windsurf/windsurf-adapter");
const claude_scanner_1 = require("./adapters/claude/claude-scanner");
function activate(context) {
    // Đăng ký các adapter vào AgentRegistry
    agent_registry_1.AgentRegistry.registerAdapter(new claude_adapter_1.ClaudeAdapter());
    agent_registry_1.AgentRegistry.registerAdapter(new gemini_adapter_1.GeminiAdapter());
    agent_registry_1.AgentRegistry.registerAdapter(new cursor_adapter_1.CursorAdapter());
    agent_registry_1.AgentRegistry.registerAdapter(new codex_adapter_1.CodexAdapter());
    agent_registry_1.AgentRegistry.registerAdapter(new copilot_adapter_1.CopilotAdapter());
    agent_registry_1.AgentRegistry.registerAdapter(new windsurf_adapter_1.WindsurfAdapter());
    const provider = new issuesViewProvider_1.IssuesViewProvider(context.extensionUri, context);
    // Đăng ký cho tất cả các view container: Activity Bar, Explorer, Source Control (và legacy IDs để phòng ngừa cache cũ)
    const viewTypes = [
        issuesViewProvider_1.IssuesViewProvider.viewType,
        issuesViewProvider_1.IssuesViewProvider.explorerViewType,
        'multiAgentSessionManager.explorerView',
        'claudeSessionManager.explorerView',
        issuesViewProvider_1.IssuesViewProvider.scmViewType,
        'multiAgentSessionManager.scmView',
        'claudeSessionManager.scmView'
    ];
    for (const vt of viewTypes) {
        context.subscriptions.push(vscode.window.registerWebviewViewProvider(vt, provider, {
            webviewOptions: { retainContextWhenHidden: true }
        }));
    }
    // Cập nhật context keys khi cài đặt thay đổi
    const updateContexts = () => {
        const config = vscode.workspace.getConfiguration('multiAgentSessionManager');
        const legacyConfig = vscode.workspace.getConfiguration('claudeSessionManager');
        const showExplorer = config.get('showInExplorer', legacyConfig.get('showInExplorer', true));
        const showScm = config.get('showInSourceControl', legacyConfig.get('showInSourceControl', true));
        vscode.commands.executeCommand('setContext', 'multiAgentSessionManager.showInExplorer', showExplorer);
        vscode.commands.executeCommand('setContext', 'multiAgentSessionManager.showInSourceControl', showScm);
        vscode.commands.executeCommand('setContext', 'claudeSessionManager.showInExplorer', showExplorer);
        vscode.commands.executeCommand('setContext', 'claudeSessionManager.showInSourceControl', showScm);
    };
    updateContexts();
    const registerCmd = (name, callback) => {
        context.subscriptions.push(vscode.commands.registerCommand(`multiAgentSessionManager.${name}`, callback));
        // Alias cho tương thích ngược
        context.subscriptions.push(vscode.commands.registerCommand(`claudeSessionManager.${name}`, callback));
    };
    registerCmd('focusView', () => {
        vscode.commands.executeCommand('multiAgentSessionManager.issuesView.focus');
    });
    registerCmd('openTab', (tab) => {
        vscode.commands.executeCommand('multiAgentSessionManager.issuesView.focus');
        provider.switchTab(tab);
    });
    registerCmd('statusMenu', async () => {
        const items = [
            {
                label: '$(sync) Đang chạy & Cần review',
                description: 'Xem các task đang chạy, chờ duyệt và vừa hoàn thành',
                tab: 'active'
            },
            {
                label: '$(calendar) Hôm nay',
                description: 'Xem toàn bộ task phát sinh trong ngày hôm nay',
                tab: 'today'
            },
            {
                label: '$(list-unordered) Tất cả lịch sử',
                description: 'Xem toàn bộ lịch sử các sessions (Claude + Gemini + Cursor + Codex + Copilot + Windsurf)',
                tab: 'all'
            },
            {
                label: '$(sparkle) Lọc: Chỉ xem Gemini / Antigravity',
                description: 'Lọc các phiên làm việc của Google Antigravity & Gemini',
                tab: 'gemini'
            },
            {
                label: '$(hubot) Lọc: Chỉ xem Claude Code',
                description: 'Lọc các phiên làm việc của Claude Code',
                tab: 'claude'
            },
            {
                label: '$(code) Lọc: Chỉ xem Cursor AI',
                description: 'Lọc các phiên làm việc của Cursor AI',
                tab: 'cursor'
            },
            {
                label: '$(terminal) Lọc: Chỉ xem OpenAI Codex',
                description: 'Lọc các phiên làm việc của OpenAI Codex CLI',
                tab: 'codex'
            },
            {
                label: '$(copilot) Lọc: Chỉ xem GitHub Copilot',
                description: 'Lọc các phiên làm việc của GitHub Copilot Chat',
                tab: 'copilot'
            },
            {
                label: '$(terminal-powershell) Lọc: Chỉ xem Windsurf (Cascade)',
                description: 'Lọc các phiên làm việc của Windsurf Cascade',
                tab: 'windsurf'
            },
            {
                label: '$(folder-opened) Chọn thư mục lưu trữ Agent...',
                description: 'Duyệt và chọn thư mục lưu trữ Claude (~/.claude/projects)',
                action: 'browseStorage'
            },
            {
                label: '$(root-folder) Chọn thư mục gốc Workspace (Projects Root)...',
                description: 'Duyệt và chọn thư mục chứa các dự án',
                action: 'browseWorkspace'
            },
            {
                label: '$(gear) Cài đặt cấu hình',
                description: 'Mở thiết lập Multi-Agent Session Manager',
                action: 'settings'
            }
        ];
        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: 'Chuyển nhanh tab hoặc thao tác'
        });
        if (!selected)
            return;
        if (selected.action === 'settings') {
            vscode.commands.executeCommand('workbench.action.openSettings', 'multiAgentSessionManager');
        }
        else if (selected.action === 'browseStorage') {
            vscode.commands.executeCommand('multiAgentSessionManager.browseStoragePath');
        }
        else if (selected.action === 'browseWorkspace') {
            vscode.commands.executeCommand('multiAgentSessionManager.browseWorkspaceRoot');
        }
        else if (selected.tab) {
            vscode.commands.executeCommand('multiAgentSessionManager.issuesView.focus');
            provider.switchTab(selected.tab);
        }
    });
    registerCmd('browseStoragePath', async () => {
        const config = vscode.workspace.getConfiguration('multiAgentSessionManager');
        const currentPath = config.get('storagePath') || '~/.claude/projects';
        const resolved = claude_scanner_1.ClaudeSessionScanner.resolveHomePath(currentPath);
        const defaultUri = fs.existsSync(resolved) ? vscode.Uri.file(resolved) : undefined;
        const selected = await vscode.window.showOpenDialog({
            canSelectFiles: false,
            canSelectFolders: true,
            canSelectMany: false,
            openLabel: 'Chọn thư mục lưu trữ (Select Storage Folder)',
            title: 'Chọn thư mục chứa lịch sử hội thoại (~/.claude/projects hoặc ~/.gemini/antigravity/brain)',
            defaultUri
        });
        if (selected && selected[0]) {
            await config.update('storagePath', selected[0].fsPath, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage(`Đã cập nhật thư mục lưu trữ: ${selected[0].fsPath}`);
            provider.setupRealtimeWatchers();
            provider.refresh();
        }
    });
    registerCmd('browseWorkspaceRoot', async () => {
        const config = vscode.workspace.getConfiguration('multiAgentSessionManager');
        const currentPath = config.get('workspaceRoot');
        const resolved = currentPath ? claude_scanner_1.ClaudeSessionScanner.resolveHomePath(currentPath) : undefined;
        const defaultUri = (resolved && fs.existsSync(resolved))
            ? vscode.Uri.file(resolved)
            : (vscode.workspace.workspaceFolders?.[0]?.uri);
        const selected = await vscode.window.showOpenDialog({
            canSelectFiles: false,
            canSelectFolders: true,
            canSelectMany: false,
            openLabel: 'Chọn thư mục gốc (Select Workspace Root)',
            title: 'Chọn thư mục chứa các repo dự án của bạn',
            defaultUri
        });
        if (selected && selected[0]) {
            await config.update('workspaceRoot', selected[0].fsPath, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage(`Đã cập nhật thư mục gốc dự án: ${selected[0].fsPath}`);
            provider.setupRealtimeWatchers();
            provider.refresh();
        }
    });
    registerCmd('toggleExplorerView', async () => {
        const config = vscode.workspace.getConfiguration('multiAgentSessionManager');
        const current = config.get('showInExplorer', true);
        const next = !current;
        await config.update('showInExplorer', next, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage(next
            ? 'Đã bật hiển thị AI Sessions trong thanh Explorer (File Tree).'
            : 'Đã tắt hiển thị AI Sessions khỏi thanh Explorer.');
    });
    registerCmd('toggleSourceControlView', async () => {
        const config = vscode.workspace.getConfiguration('multiAgentSessionManager');
        const current = config.get('showInSourceControl', true);
        const next = !current;
        await config.update('showInSourceControl', next, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage(next
            ? 'Đã bật hiển thị AI Sessions trong thanh Source Control (Git).'
            : 'Đã tắt hiển thị AI Sessions khỏi thanh Source Control.');
    });
    registerCmd('refresh', () => {
        provider.refresh();
    });
    registerCmd('openSettings', () => {
        vscode.commands.executeCommand('workbench.action.openSettings', 'multiAgentSessionManager');
    });
    registerCmd('checkForUpdates', () => {
        updater_1.ExtensionUpdater.checkForUpdates(context, true);
    });
    // Lắng nghe cấu hình thay đổi để cập nhật tự động
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('multiAgentSessionManager.showInExplorer') ||
            e.affectsConfiguration('multiAgentSessionManager.showInSourceControl') ||
            e.affectsConfiguration('claudeSessionManager.showInExplorer') ||
            e.affectsConfiguration('claudeSessionManager.showInSourceControl')) {
            updateContexts();
        }
        if (e.affectsConfiguration('multiAgentSessionManager') ||
            e.affectsConfiguration('claudeSessionManager')) {
            provider.setupRealtimeWatchers();
            provider.refresh();
        }
    }));
    // Tự động làm mới khi người dùng mở lại máy (wake from sleep) hoặc focus vào VS Code
    context.subscriptions.push(vscode.window.onDidChangeWindowState(e => {
        if (e.focused) {
            provider.refresh();
        }
    }));
    // Tự động kiểm tra bản cập nhật mới trên GitHub sau 3.5 giây
    setTimeout(() => {
        updater_1.ExtensionUpdater.checkForUpdates(context, false);
    }, 3500);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map