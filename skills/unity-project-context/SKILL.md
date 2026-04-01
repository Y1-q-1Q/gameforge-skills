# unity-project-context

Maintain persistent project context across AI coding sessions. Automatically captures architecture decisions, performance baselines, coding conventions, and team knowledge — so the AI never "forgets" your project.

## When to use

Activate when the user mentions:
- Project context, project memory, session continuity
- "Remember this decision", "we decided to..."
- Architecture decisions that should persist
- Performance baselines and regression tracking
- Team coding conventions
- Onboarding new team members (AI or human)
- "Why did we do X?" — decision archaeology

## Capabilities

1. **Project snapshot** — Auto-generate project context from codebase analysis
2. **Decision log** — Capture architecture/tech decisions with rationale
3. **Performance baseline** — Track key metrics across builds
4. **Convention extraction** — Detect and document coding patterns from existing code
5. **Context restoration** — Restore full project understanding in new sessions
6. **Team knowledge sync** — Share project context across team members

## How It Works

This skill creates and maintains a `.gameforge/` directory in your Unity project:

```
YourUnityProject/
├── .gameforge/
│   ├── PROJECT.md          # Auto-generated project overview
│   ├── DECISIONS.md        # Architecture decision records
│   ├── CONVENTIONS.md      # Detected + declared coding conventions
│   ├── PERFORMANCE.md      # Performance baselines and budgets
│   └── sessions/
│       └── YYYY-MM-DD.md   # Session logs (auto-pruned)
```

## Usage Examples

### Initialize Project Context
```
Scan my Unity project and create a project context file.
```
The skill will analyze: folder structure, assembly definitions, packages, scenes, key scripts — and generate PROJECT.md.

### Log a Decision
```
We decided to use Addressables instead of AssetBundles because we need
per-asset granularity and the team is small. Log this decision.
```

### Set Performance Baseline
```
Our current build: 45fps on Galaxy S21, 180 draw calls, 350MB memory.
Set this as our performance baseline.
```

### Restore Context
```
I'm starting a new session. Load the project context for MyGame.
```

## Architecture Decision Record Format

```markdown
## [ADR-001] Use Addressables for Asset Management

**Date**: 2026-04-01
**Status**: Accepted
**Context**: Need flexible asset loading for live-service mobile game
**Decision**: Use Addressables with remote catalog
**Rationale**:
- Per-asset granularity (vs whole-bundle in AssetBundles)
- Built-in caching and dependency resolution
- Small team can't maintain custom bundle system
**Consequences**:
- Must manage Addressable groups carefully
- Build pipeline is more complex
- Need CDN for remote assets
**Alternatives Considered**:
- Raw AssetBundles (too much boilerplate)
- Resources folder (no remote loading)
```

## Performance Baseline Format

```markdown
## Baseline: 2026-04-01 (Build #42)

**Device**: Galaxy S21 (Snapdragon 888)
**Scene**: MainGameplay

| Metric | Value | Budget | Status |
|--------|-------|--------|--------|
| FPS (avg) | 45 | 60 | ⚠️ |
| FPS (1% low) | 28 | 30 | ⚠️ |
| Draw calls | 180 | 200 | ✅ |
| SetPass | 35 | 50 | ✅ |
| Memory | 350 MB | 500 MB | ✅ |
| GC/frame | 0.2 KB | 0 KB | ⚠️ |
| Load time | 4.2s | 5s | ✅ |
```

## References

- [context-schema.md](references/context-schema.md) — PROJECT.md generation rules and schema
- [decision-patterns.md](references/decision-patterns.md) — Common Unity architecture decisions and templates

## Why This Matters

Without persistent context, every AI session starts from zero. The AI re-discovers your architecture, re-asks about conventions, and may contradict previous decisions. This skill solves that by making project knowledge a first-class, version-controlled artifact.

**Unique to GameForge** — no other AI coding tool maintains structured, game-specific project context.

## Limitations

- Context files should be committed to version control (they're documentation, not secrets)
- Performance baselines require manual input (no automated profiling yet)
- Session logs are pruned after 30 days by default
