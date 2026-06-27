# Changelog

All notable changes to the Islamic Banking Digital FTE will be documented in this file.

## [1.0.0] — 2026-05-30

### Added
- Router skill (`skills/islamic-finance-router/SKILL.md`) with jurisdiction detection
- 6 jurisdiction overlays: Pakistan, UAE, Saudi Arabia, Malaysia, Bahrain, Kuwait
- AAOIFI FAS references in all 10 product skills
- GOVERNING FRAMEWORK header requirement for all responses
- `hooks/hooks.json` with SessionStart and PostToolUse hooks
- Routing validation script (`scripts/validate-routing.py`)
- CHANGELOG.md for version tracking

### Changed
- Renamed `.claude-plugin/manifest.json` to `.claude-plugin/plugin.json` (AgentFactory standard)
- Updated `api/chat.js` to load router skill and jurisdiction overlay in system prompt
- Updated all skills with AAOIFI standard references (FAS 2, 3, 4, 8, 9, 32)
- Updated `marketplace.json` with proper author and repository info

### Fixed
- Duplicate CSS link in `web/index.html`
- Added `response.json` to `.gitignore`

### Architecture
- 1 router skill + 10 product skills + 6 jurisdiction overlays + 4 commands
- Keyword-based routing in `api/chat.js` for pre-selection
- Router skill provides full routing protocol for Gemini
- Jurisdiction overlays loaded dynamically based on query context
