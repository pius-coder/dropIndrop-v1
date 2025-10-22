<!--
Sync Impact Report:
- Updated constitution with new UI/UX principles based on shadcn/ui core principles
- Added Principles VIII-XII: Open Code, Composition, Distribution, Beautiful Defaults, AI-Ready Design
- Incremented version from 1.1.0 to 1.2.0 (MINOR bump for new principles)
- Updated LAST_AMENDED_DATE to 2025-10-17
- Filled in missing RATIFIED_DATE (was TODO)
- Updated .specify/templates/plan-template.md Constitution Check section with concrete principle requirements
- No other template updates needed as constitution references are minimal
- README.md unchanged as it doesn't reference constitution
-->

# did-v1 Constitution

## Core Principles

### I. Library-First

Every feature starts as a standalone library; Libraries must be self-contained, independently testable, documented; Clear purpose required - no organizational-only libraries

### II. CLI Interface

Every library exposes functionality via CLI; Text in/out protocol: stdin/args → stdout, errors → stderr; Support JSON + human-readable formats

### III. Test-First (NON-NEGOTIABLE)

TDD mandatory: Tests written → User approved → Tests fail → Then implement; Red-Green-Refactor cycle strictly enforced

### IV. Integration Testing

Focus areas requiring integration tests: New library contract tests, Contract changes, Inter-service communication, Shared schemas

### V. Observability, VI. Versioning & Breaking Changes, VII. Simplicity

Text I/O ensures debuggability; Structured logging required; Or: MAJOR.MINOR.BUILD format; Or: Start simple, YAGNI principles

### VI. Clean Code

Code must be readable, maintainable, and self-documenting; Follow DRY principles, meaningful naming, and consistent formatting; Prioritize clarity over cleverness

### VII. Delightful User Experience

Design for intuitive, accessible, and enjoyable interactions; Anticipate user needs, provide clear feedback, and minimize friction; Balance functionality with simplicity

### VIII. Open Code

All UI components and utilities must be open-source inspired, promoting transparency and community collaboration; Code should be accessible, well-documented, and encourage contributions to foster innovation

### IX. Composition

UI components should be built through composition of smaller, reusable parts; Enable flexible assembly of complex interfaces from simple primitives, ensuring modularity and maintainability

### X. Distribution

Components must be easily distributable and installable across projects; Provide clear installation guides, minimal dependencies, and seamless integration to maximize adoption and usability

### XI. Beautiful Defaults

Offer aesthetically pleasing and functional default configurations out-of-the-box; Defaults should require minimal customization while adhering to modern design standards and accessibility guidelines

### XII. AI-Ready Design

Design interfaces and components with AI integration in mind; Ensure compatibility with AI tools, provide structured data for machine learning, and support automated workflows for enhanced productivity

## Additional Constraints

Technology stack requirements, compliance standards, deployment policies, etc.

## Development Workflow

Code review requirements, testing gates, deployment approval process, etc.

## Governance

Constitution supersedes all other practices; Amendments require documentation, approval, migration plan

All PRs/reviews must verify compliance; Complexity must be justified; Use AGENTS.md for runtime development guidance

**Version**: 1.2.0 | **Ratified**: 2025-10-17 | **Last Amended**: 2025-10-17
