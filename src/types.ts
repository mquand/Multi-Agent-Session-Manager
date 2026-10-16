export type SessionStatus = 'need_accept' | 'done' | 'running' | 'failed' | 'question';

export type AgentId = 'claude' | 'gemini' | 'cursor' | 'codex' | 'copilot' | 'windsurf' | 'devin' | string;

export interface Session {
  id: string;
  agentId: AgentId;
  agentName?: string;
  agentIcon?: string;
  badgeColor?: string;
  issueId?: string;           // Ví dụ: #101, #204
  title: string;             // Tiêu đề
  repo: string;              // Ví dụ: "web-app", "backend-api"
  branch: string;            // Ví dụ: "main", "feature/login"
  isWorktree?: boolean;      // Đang chạy trên Git Worktree
  status: SessionStatus;
  statusMessage: string;     // Ví dụ: "3 phút trước", "3 ngày trước"
  lastUserPrompt?: string;   // Ví dụ: "> cập nhật giao diện..."
  lastAssistantResponse?: string;
  updatedAt: number;
  filePath?: string;

  // Metadata theo UI
  source: 'VS Code' | 'Terminal' | 'Web' | 'IDE';
  modelName: string;         // Ví dụ: "Gemini 3.8 Flash (High)", "Sonnet 3.7"
  inputTokensFormatted: string;  // Ví dụ: "1.5B", "63.2M", "12.4k"
  outputTokensFormatted: string; // Ví dụ: "2.4M ra", "308K ra"
  costUSD?: string;          // Ví dụ: "$425.02", "$1.71"
  turnCount: number;         // Ví dụ: 1049, 185
  shortId: string;           // 8 ký tự: "3fde811b"
  cwd?: string;
  rawInputTokens?: number;
  rawOutputTokens?: number;
  totalTokens?: number;
  agentSpecificData?: Record<string, any>;
}

// Backward-compatibility alias
export type ClaudeSession = Session;

export interface ScanOptions {
  workspaceFolders?: string[];
  defaultRepo?: string;
  enabledAgents?: AgentId[];
}
