# Changelog

All notable changes to the Islamic Banking FTE plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] — 2026-07-05

### Added
- `/if-journal` command for generating jurisdiction-aware journal entries and amortisation schedules
- `musharaka-dm` standalone skill for Diminishing Musharakah (separated from musharakah-mudarabah-specialist)
- Full 5-step Shariah screening workflow (Sector → Financial Ratio → NPI → Purification → Conflict Resolution)
- Quarterly rebalancing workflow and SSB report structure in shariah-compliance-checker
- `run-evals.py` automated eval runner script
- Accounting label verification in PostToolUse hook (AAOIFI vs IFRS labels)

### Changed
- Router updated to route Diminishing Musharakah queries to `musharaka-dm` skill
- `musharakah-mudarabah-specialist` now focuses on general Musharakah/Mudarabah (DM content removed)
- SessionStart hook updated to reflect 18 skills and new capabilities
- Evals validated: 36 routing cases, 15 product cases, 13 jurisdiction overlays

### Fixed
- PostToolUse hook now verifies jurisdiction-specific income labels (AAOIFI "Murabaha income" vs IFRS "Profit from financing")

## [1.0.0] — 2026-07-04

### Added
- Initial release — Islamic Banking Digital FTE
- 12 product skills (murabaha, ijara, salam, istisna, sukuk-issuer, sukuk-investor, takaful, musharaka, musharakah-mudarabah, zakat, shariah-compliance, halal-calculator)
- 6 additional skills (islamic-product-explainer, pakistan-banking-navigator, islamic-banking-advisor, sukuk-takaful-specialist, roshan-digital-advisor)
- 13 jurisdiction overlays (Pakistan, UAE, Saudi, Malaysia, Bahrain, Kuwait, Qatar, Oman, Turkey, Nigeria, Indonesia, UK, GCC)
- Router with auto-detection of jurisdiction and product
- 4 slash commands (/calculate, /check-halal, /zakat, /compare)
- Full web application (chat UI, dashboard, calculators, banks directory, pricing, admin)
- Serverless API (chat, auth, payments, rates, history)
- Neon PostgreSQL database
- Stripe payment integration
- PWA support
- Bilingual disclaimer (English + Urdu)
- AgentFactory plugin structure (.claude-plugin, hooks, evals, skills)
