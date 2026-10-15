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
- [ ] Create `src/adapters/base-adapter.ts`
- [ ] Define `AgentAdapter` interface
- [ ] Define common types

#### 1.2 Agent Registry
- [ ] Create `src/agent-registry.ts`
- [ ] Implement `AgentRegistry` class
- [ ] Add methods: register, get, getAll, getEnabled

#### 1.3 Update Types
- [ ] Update `src/types.ts`
- [ ] Add `agentId` field to `Session` interface
- [ ] Ensure backward compatibility

### Phase 2: Refactor Claude

#### 2.1 Move Claude Scanner
- [ ] Move `src/scanner.ts` → `src/adapters/claude/claude-scanner.ts`
- [ ] Update all imports in the codebase
- [ ] Test that no imports are broken

#### 2.2 Create Claude Adapter
- [ ] Create `src/adapters/claude/claude-adapter.ts`
- [ ] Implement `AgentAdapter` interface
- [ ] Map Claude-specific methods to adapter
- [ ] Add Claude icon resource

#### 2.3 Update Main Extension
- [ ] Update `src/extension.ts`
- [ ] Import `AgentRegistry` and `ClaudeAdapter`
- [ ] Register Claude adapter in `activate()`
- [ ] Update all command IDs (claudeSessionManager → multiAgentSessionManager)
- [ ] Update all configuration key references
- [ ] Update view container IDs
- [ ] Update view IDs

#### 2.4 Update IssuesViewProvider
- [ ] Update `src/issuesViewProvider.ts`
- [ ] Update view type IDs
- [ ] Ensure Claude sessions still display correctly
- [ ] Test all existing functionality

#### 2.5 Test Claude (Regression)
- [ ] Compile project
- [ ] Run in VS Code debug mode
- [ ] Verify Claude sessions are scanned
- [ ] Verify sessions display correctly
- [ ] Verify status tracking works
- [ ] Verify delete functionality works
- [ ] Verify all commands work

### Phase 3: Implement Cursor

#### 3.1 Create Cursor Scanner
- [ ] Create `src/adapters/cursor/cursor-scanner.ts`
- [ ] Implement Cursor `.jsonl` parsing
- [ ] Extract session metadata (title, repo, branch, etc.)
- [ ] Map to unified `Session` interface
- [ ] Handle Cursor-specific fields
- [ ] Add error handling

#### 3.2 Create Cursor Adapter
- [ ] Create `src/adapters/cursor/cursor-adapter.ts`
- [ ] Implement `AgentAdapter` interface
- [ ] Return `~/.cursor/projects` as default path
- [ ] Check if cursor is in `enabledAgents` config
- [ ] Add Cursor icon resource

#### 3.3 Register Cursor Adapter
- [ ] Import `CursorAdapter` in `extension.ts`
- [ ] Register in `AgentRegistry`
- [ ] Test registration

#### 3.4 Test Cursor
- [ ] Compile project
- [ ] Enable Cursor in settings
- [ ] Run in VS Code debug mode
- [ ] Verify Cursor sessions are scanned
- [ ] Verify sessions display correctly
- [ ] Verify agent badge shows "Cursor"
- [ ] Verify filter by Cursor works
- [ ] Verify delete functionality works

### Phase 4: Implement Gemini

#### 4.1 Create Gemini Scanner
- [ ] Create `src/adapters/gemini/gemini-scanner.ts`
- [ ] Implement Gemini/Antigravity `.jsonl` parsing
- [ ] Handle step-based tracking (`step_index`)
- [ ] Extract session metadata from step format
- [ ] Map to unified `Session` interface
- [ ] Handle different status fields (USER_EXPLICIT, MODEL, etc.)
- [ ] Handle chunked transcripts
- [ ] Add error handling

#### 4.2 Create Gemini Adapter
- [ ] Create `src/adapters/gemini/gemini-adapter.ts`
- [ ] Implement `AgentAdapter` interface
- [ ] Return `~/.gemini/antigravity/brain` as default path
- [ ] Check if gemini is in `enabledAgents` config
- [ ] Add Gemini icon resource

#### 4.3 Register Gemini Adapter
- [ ] Import `GeminiAdapter` in `extension.ts`
- [ ] Register in `AgentRegistry`
- [ ] Test registration

#### 4.4 Test Gemini
- [ ] Compile project
- [ ] Enable Gemini in settings
- [ ] Run in VS Code debug mode
- [ ] Verify Gemini sessions are scanned
- [ ] Verify sessions display correctly
- [ ] Verify agent badge shows "Gemini"
- [ ] Verify filter by Gemini works
- [ ] Verify delete functionality works

### Phase 5: UI Updates

#### 5.1 Agent Filter Dropdown
- [ ] Add agent filter to toolbar in `issuesViewProvider.ts`
- [ ] Implement filter logic (All, Claude, Cursor, Gemini)
- [ ] Update session list based on filter
- [ ] Persist filter selection

#### 5.2 Agent Badges
- [ ] Add agent badge to session cards
- [ ] Display agent icon
- [ ] Display agent name
- [ ] Color-code by agent type
- [ ] Style badges appropriately

#### 5.3 Status Bar Updates
- [ ] Update status bar to show multiple agents
- [ ] Format: `🔔 AI: 3 Claude • 2 Cursor • 1 Gemini`
- [ ] Click to open panel
- [ ] Update in real-time

#### 5.4 Agent-Specific Settings
- [ ] Add agent-specific configuration UI
- [ ] Allow custom paths per agent
- [ ] Allow enable/disable per agent
- [ ] Update settings schema

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
**Target**: Phase 1 + Phase 2 complete
**Status**: Not started

### Milestone 2: Cursor Integration
**Goal**: Add Cursor support
**Target**: Phase 3 complete
**Status**: Not started

### Milestone 3: Gemini Integration
**Goal**: Add Gemini support
**Target**: Phase 4 complete
**Status**: Not started

### Milestone 4: UI Polish
**Goal**: Complete UI updates for multi-agent
**Target**: Phase 5 complete
**Status**: Not started

### Milestone 5: v1.0 Release
**Goal**: Release first version with Claude, Cursor, Gemini
**Target**: Phase 6 complete
**Status**: Not started

## 📝 Notes

- Always test Claude after each phase to ensure no regression
- Each adapter should be independent and testable
- Error handling should be graceful
- UI should degrade gracefully if agent not installed
- Performance should remain acceptable
- Keep configuration simple and intuitive
