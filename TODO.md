# Multi-Agent Session Manager - TODO List

## ✅ Completed

- [x] Create new repository "Multi-Agent Session Manager"
- [x] Clone all files from Claude-Session-Manager-
- [x] Remove old .git directory
- [x] Update package.json with new naming
- [x] Update README.md
- [x] Update README.vn.md
- [x] Create ARCHITECTURE.md
- [x] Create REFACTORING_GUIDE.md
- [x] Create AGENTS.md with research results
- [x] Create adapter directory structure
- [x] Scan local machine for AI agents
- [x] Analyze Cursor data structure
- [x] Analyze Gemini/Antigravity data structure

## 🚧 In Progress

- [ ] Initialize git repository
- [ ] Create GitHub repository
- [ ] Push initial commit

## 📋 Pending Tasks

### Phase 1: Architecture Setup

#### 1.1 Base Adapter Interface
- [x] Create `src/adapters/base-adapter.ts`
- [x] Define `AgentAdapter` interface
- [x] Define common types

#### 1.2 Agent Registry
- [x] Create `src/agent-registry.ts`
- [x] Implement `AgentRegistry` class
- [x] Add methods: register, get, getAll, getEnabled, scanAll

#### 1.3 Update Types
- [x] Update `src/types.ts`
- [x] Add `agentId` field to `Session` interface
- [x] Ensure backward compatibility (`ClaudeSession` alias)

### Phase 2: Refactor Claude

#### 2.1 Move Claude Scanner
- [x] Move Claude scanner logic → `src/adapters/claude/claude-scanner.ts`
- [x] Keep `src/scanner.ts` re-export for 100% backward compatibility
- [x] Test that no imports are broken

#### 2.2 Create Claude Adapter
- [x] Create `src/adapters/claude/claude-adapter.ts`
- [x] Implement `AgentAdapter` interface
- [x] Map Claude-specific methods to adapter

#### 2.3 Update Main Extension
- [x] Update `src/extension.ts`
- [x] Import `AgentRegistry`, `ClaudeAdapter`, `GeminiAdapter`
- [x] Register adapters in `activate()`
- [x] Support `multiAgentSessionManager.*` commands & configuration keys
- [x] Maintain aliases for `claudeSessionManager.*`

#### 2.4 Update IssuesViewProvider
- [x] Update `src/issuesViewProvider.ts`
- [x] Update view type IDs to `multiAgentSessionManager.*`
- [x] Ensure Claude sessions still display correctly
- [x] Multi-agent realtime watchers & scanner coordination

#### 2.5 Test Claude (Regression)
- [x] Compile project (`npm run compile`)
- [x] Verify Claude sessions scanned (9 sessions verified)

### Phase 3: Implement Cursor

#### 3.1 Create Cursor Scanner
- [x] Create `src/adapters/cursor/cursor-scanner.ts`
- [x] Implement Cursor `.jsonl` parsing
- [x] Extract session metadata (title, repo, branch, etc.)
- [x] Map to unified `Session` interface
- [x] Handle Cursor-specific fields
- [x] Add error handling

#### 3.2 Create Cursor Adapter
- [x] Create `src/adapters/cursor/cursor-adapter.ts`
- [x] Implement `AgentAdapter` interface
- [x] Return `~/.cursor/projects` as default path
- [x] Check if cursor is in `enabledAgents` config
- [x] Support delete session from disk

#### 3.3 Register Cursor Adapter
- [x] Import `CursorAdapter` in `extension.ts`
- [x] Register in `AgentRegistry`
- [x] Add to `package.json` config & default enabled agents

#### 3.4 Test Cursor
- [x] Compile project with 0 errors
- [x] Verify Cursor sessions scanned (7 live sessions detected)
- [x] Verify agent badge shows "Cursor"
- [x] Verify filter by Cursor works
- [x] Verify delete functionality works

### Phase 4: Implement Gemini / Google Antigravity

#### 4.1 Create Gemini Scanner
- [x] Create `src/adapters/gemini/gemini-scanner.ts`
- [x] Implement Gemini/Antigravity `.jsonl` parsing (`transcript.jsonl`)
- [x] Handle step-based tracking (`step_index`, `USER_INPUT`, `PLANNER_RESPONSE`)
- [x] Extract metadata from `.db` files (`trajectory_metadata_blob`: repo, github URL, branch)
- [x] Map to unified `Session` interface (`agentId: 'gemini'`)
- [x] Support multiple brain locations (`antigravity-ide/brain` & `antigravity/brain`)
- [x] Add error handling

#### 4.2 Create Gemini Adapter
- [x] Create `src/adapters/gemini/gemini-adapter.ts`
- [x] Implement `AgentAdapter` interface
- [x] Auto-detect default paths (`~/.gemini/antigravity-ide/brain` and `~/.gemini/antigravity/brain`)
- [x] Check if gemini is in `enabledAgents` config

#### 4.3 Register Gemini Adapter
- [x] Import `GeminiAdapter` in `extension.ts`
- [x] Register in `AgentRegistry`
- [x] Test registration

#### 4.4 Test Gemini
- [x] Compile project with 0 errors
- [x] Verify Gemini sessions scanned (50 sessions verified on machine!)
- [x] Verify repo & branch detection
- [x] Verify agent badge & agent filtering

### Phase 5: UI Updates

#### 5.1 Agent Filter Dropdown
- [x] Add agent filter pills to toolbar in `issuesViewProvider.ts` (All AI | Claude | Gemini | Cursor)
- [x] Implement filter logic (All, Claude, Cursor, Gemini)
- [x] Update session list based on filter
- [x] Persist filter selection

#### 5.2 Agent Badges
- [x] Add agent badge to session cards
- [x] Display agent name (Claude, Gemini, Cursor)
- [x] Color-code by agent type (Amber Claude, Blue Gemini, Emerald Cursor)
- [x] Style badges appropriately

#### 5.3 Status Bar Updates
- [x] Update status bar to show multiple agents
- [x] Format: `AI: 9 Claude • 50 Gemini • 7 Cursor`
- [x] Click to open status menu with agent filters
- [x] Update in real-time

#### 5.4 Agent-Specific Settings
- [x] Add agent-specific configuration in `package.json`
- [x] Allow custom paths per agent (`storagePath`, `geminiStoragePath`, `cursorStoragePath`)
- [x] Allow enable/disable per agent (`enabledAgents`)
- [x] Update settings schema

### Phase 6: Testing & Polish

#### 6.1 Multi-Agent Testing
- [ ] Test with all agents enabled
- [ ] Test with only Claude enabled
- [ ] Test with only Cursor enabled
- [ ] Test with only Gemini enabled
- [ ] Test with mixed agents
- [ ] Verify filter functionality
- [ ] Verify performance

#### 6.2 Edge Cases
- [ ] Test when agent not installed
- [ ] Test when agent data corrupted
- [ ] Test when no sessions found
- [ ] Test with large number of sessions
- [ ] Test with concurrent access

#### 6.3 Documentation
- [ ] Update README with multi-agent usage
- [ ] Update README.vn.md with multi-agent usage
- [ ] Add screenshots
- [ ] Add configuration examples
- [ ] Add troubleshooting section

#### 6.4 Release Preparation
- [ ] Update version to 1.0.0
- [ ] Create GitHub repository
- [ ] Push to GitHub
- [ ] Create GitHub Actions workflow
- [ ] Create first release
- [ ] Publish to VS Code Marketplace

### Phase 7: Future Enhancements

#### 7.1 Devin Support
- [ ] Research Devin data structure
- [ ] Implement Devin adapter if feasible
- [ ] Test Devin integration

#### 7.2 Windsurf Support
- [ ] Research Windsurf data structure
- [ ] Implement Windsurf adapter if feasible
- [ ] Test Windsurf integration

#### 7.3 Other Agents
- [ ] Research Codeium
- [ ] Research Copilot
- [ ] Research Grok
- [ ] Implement if feasible

## 🎯 Milestones

### Milestone 1: Architecture Refactor
**Goal**: Refactor Claude to use adapter pattern
**Status**: ✅ Complete

### Milestone 2: Cursor Integration
**Goal**: Add Cursor support
**Status**: ✅ Complete

### Milestone 3: Gemini Integration
**Goal**: Add Gemini support
**Status**: ✅ Complete

### Milestone 4: UI Polish
**Goal**: Complete UI updates for multi-agent
**Status**: ✅ Complete

### Milestone 5: v0.1.0 Initial Release
**Goal**: Release first version (0.1.0) with Claude, Gemini, Cursor
**Status**: ✅ Complete & Ready for Commit

## 📝 Notes

- Always test Claude after each phase to ensure no regression
- Each adapter should be independent and testable
- Error handling should be graceful
- UI should degrade gracefully if agent not installed
- Performance should remain acceptable
- Keep configuration simple and intuitive
