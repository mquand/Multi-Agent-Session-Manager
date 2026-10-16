import * as vscode from 'vscode';
import * as fs from 'fs';
import { IssuesViewProvider } from './issuesViewProvider';
import { ExtensionUpdater } from './updater';
import { AgentRegistry } from './agent-registry';
import { ClaudeAdapter } from './adapters/claude/claude-adapter';
import { GeminiAdapter } from './adapters/gemini/gemini-adapter';
import { CursorAdapter } from './adapters/cursor/cursor-adapter';
import { CodexAdapter } from './adapters/codex/codex-adapter';
import { CopilotAdapter } from './adapters/copilot/copilot-adapter';
import { WindsurfAdapter } from './adapters/windsurf/windsurf-adapter';
import { ClaudeSessionScanner } from './adapters/claude/claude-scanner';

export function activate(context: vscode.ExtensionContext) {
  // Đăng ký các adapter vào AgentRegistry
  AgentRegistry.registerAdapter(new ClaudeAdapter());
  AgentRegistry.registerAdapter(new GeminiAdapter());
  AgentRegistry.registerAdapter(new CursorAdapter());
  AgentRegistry.registerAdapter(new CodexAdapter());
  AgentRegistry.registerAdapter(new CopilotAdapter());
  AgentRegistry.registerAdapter(new WindsurfAdapter());

  const provider = new IssuesViewProvider(context.extensionUri, context);

  // Đăng ký cho tất cả các view container: Activity Bar, Explorer, Source Control (và legacy IDs để phòng ngừa cache cũ)
  const viewTypes = [
    IssuesViewProvider.viewType,
    IssuesViewProvider.explorerViewType,
    'multiAgentSessionManager.explorerView',
    'claudeSessionManager.explorerView',
    IssuesViewProvider.scmViewType,
    'multiAgentSessionManager.scmView',
    'claudeSessionManager.scmView'
  ];

  for (const vt of viewTypes) {
    context.subscriptions.push(
      vscode.window.registerWebviewViewProvider(vt, provider, {
        webviewOptions: { retainContextWhenHidden: true }
      })
    );
  }

  // Cập nhật context keys khi cài đặt thay đổi
  const updateContexts = () => {
    const config = vscode.workspace.getConfiguration('multiAgentSessionManager');
    const legacyConfig = vscode.workspace.getConfiguration('claudeSessionManager');
    const showExplorer = config.get<boolean>('showInExplorer', legacyConfig.get<boolean>('showInExplorer', true));
    const showScm = config.get<boolean>('showInSourceControl', legacyConfig.get<boolean>('showInSourceControl', true));

    vscode.commands.executeCommand('setContext', 'multiAgentSessionManager.showInExplorer', showExplorer);
    vscode.commands.executeCommand('setContext', 'multiAgentSessionManager.showInSourceControl', showScm);
    vscode.commands.executeCommand('setContext', 'claudeSessionManager.showInExplorer', showExplorer);
    vscode.commands.executeCommand('setContext', 'claudeSessionManager.showInSourceControl', showScm);
  };
  updateContexts();

  const registerCmd = (name: string, callback: (...args: any[]) => any) => {
    context.subscriptions.push(vscode.commands.registerCommand(`multiAgentSessionManager.${name}`, callback));
    // Alias cho tương thích ngược
    context.subscriptions.push(vscode.commands.registerCommand(`claudeSessionManager.${name}`, callback));
  };

  registerCmd('focusView', () => {
    vscode.commands.executeCommand('multiAgentSessionManager.issuesView.focus');
  });

  registerCmd('openTab', (tab: string) => {
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

    if (!selected) return;

    if (selected.action === 'settings') {
      vscode.commands.executeCommand('workbench.action.openSettings', 'multiAgentSessionManager');
    } else if (selected.action === 'browseStorage') {
      vscode.commands.executeCommand('multiAgentSessionManager.browseStoragePath');
    } else if (selected.action === 'browseWorkspace') {
      vscode.commands.executeCommand('multiAgentSessionManager.browseWorkspaceRoot');
    } else if (selected.tab) {
      vscode.commands.executeCommand('multiAgentSessionManager.issuesView.focus');
      provider.switchTab(selected.tab);
    }
  });

  registerCmd('browseStoragePath', async () => {
    const config = vscode.workspace.getConfiguration('multiAgentSessionManager');
    const currentPath = config.get<string>('storagePath') || '~/.claude/projects';
    const resolved = ClaudeSessionScanner.resolveHomePath(currentPath);
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
    const currentPath = config.get<string>('workspaceRoot');
    const resolved = currentPath ? ClaudeSessionScanner.resolveHomePath(currentPath) : undefined;
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
    const current = config.get<boolean>('showInExplorer', true);
    const next = !current;
    await config.update('showInExplorer', next, vscode.ConfigurationTarget.Global);
    vscode.window.showInformationMessage(
      next
        ? 'Đã bật hiển thị AI Sessions trong thanh Explorer (File Tree).'
        : 'Đã tắt hiển thị AI Sessions khỏi thanh Explorer.'
    );
  });

  registerCmd('toggleSourceControlView', async () => {
    const config = vscode.workspace.getConfiguration('multiAgentSessionManager');
    const current = config.get<boolean>('showInSourceControl', true);
    const next = !current;
    await config.update('showInSourceControl', next, vscode.ConfigurationTarget.Global);
    vscode.window.showInformationMessage(
      next
        ? 'Đã bật hiển thị AI Sessions trong thanh Source Control (Git).'
        : 'Đã tắt hiển thị AI Sessions khỏi thanh Source Control.'
    );
  });

  registerCmd('refresh', () => {
    provider.refresh();
  });

  registerCmd('openSettings', () => {
    vscode.commands.executeCommand('workbench.action.openSettings', 'multiAgentSessionManager');
  });

  registerCmd('checkForUpdates', () => {
    ExtensionUpdater.checkForUpdates(context, true);
  });

  // Lắng nghe cấu hình thay đổi để cập nhật tự động
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(e => {
      if (
        e.affectsConfiguration('multiAgentSessionManager.showInExplorer') ||
        e.affectsConfiguration('multiAgentSessionManager.showInSourceControl') ||
        e.affectsConfiguration('claudeSessionManager.showInExplorer') ||
        e.affectsConfiguration('claudeSessionManager.showInSourceControl')
      ) {
        updateContexts();
      }
      if (
        e.affectsConfiguration('multiAgentSessionManager') ||
        e.affectsConfiguration('claudeSessionManager')
      ) {
        provider.setupRealtimeWatchers();
        provider.refresh();
      }
    })
  );

  // Tự động làm mới khi người dùng mở lại máy (wake from sleep) hoặc focus vào VS Code
  context.subscriptions.push(
    vscode.window.onDidChangeWindowState(e => {
      if (e.focused) {
        provider.refresh();
      }
    })
  );

  // Tự động kiểm tra bản cập nhật mới trên GitHub sau 3.5 giây
  setTimeout(() => {
    ExtensionUpdater.checkForUpdates(context, false);
  }, 3500);
}

export function deactivate() {}
