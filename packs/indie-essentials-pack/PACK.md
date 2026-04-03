---
name: indie-essentials-pack
version: 1.0.0
description: "Essential skills for solo indie developers — architecture, saves, audio, input, and polish"
engine: unity

skills:
  - unity-architect
  - unity-savegame
  - unity-audio
  - unity-input
  - unity-ui

install_order:
  - unity-architect
  - unity-input
  - unity-ui
  - unity-audio
  - unity-savegame

glue:
  - file: glue/solo-workflow.md
    description: "Streamlined workflow for one-person development"
  - file: glue/quick-start-template.md
    description: "Project template for rapid prototyping"
  - file: glue/polish-checklist.md
    description: "Pre-release polish checklist for indies"

scenarios:
  - "Solo developer building first commercial game"
  - "Small team (2-3 people) with limited resources"
  - "Game jam project wanting solid foundations"
  - "Hobbyist upgrading skills to professional standards"
---

# indie-essentials-pack

Essential skills for solo indie developers — architecture, saves, audio, input, and polish.

## Why this pack exists

Indie developers face unique challenges:
- **Time constraints** — Need to ship, not perfect architecture
- **Skill breadth** — Must handle code, art, audio, marketing
- **Resource limits** — Can't afford custom solutions for everything
- **Scope creep** — Easy to over-engineer

This pack provides **production-ready foundations** without over-engineering.

## What you get

1. **Clean architecture** — Simple, extensible project structure
2. **Save system** — JSON-based with encryption option
3. **Audio management** — Addressable-based with pooling
4. **Input handling** — New Input System with device abstraction
5. **UI framework** — MVVM pattern with data binding
6. **Glue logic** — Workflow optimized for solo dev

## Glue highlights

### Solo Workflow
- Rapid prototyping to production pipeline
- Asset organization for one-person teams
- Version control best practices (Git LFS, etc.)

### Quick-Start Template
- Pre-configured project structure
- Common systems pre-wired
- First playable in 1 week target

### Polish Checklist
- "Juice" and feel improvements
- Platform-specific requirements
- Marketing-ready build checklist

## Design Principles

1. **Shippable over perfect** — Working game beats perfect architecture
2. **Readable over clever** — Future you will thank present you
3. **Modular over monolithic** — Easy to replace systems later
4. **Proven over novel** — Battle-tested patterns, not experiments

## Time Estimates

| Phase | Time | Deliverable |
|-------|------|-------------|
| Setup | 2 hours | Project structure, Git repo |
| Prototype | 1 week | Core loop playable |
| Vertical slice | 2 weeks | One complete level/feature |
| Production | 2-3 months | Full game |
| Polish | 2 weeks | Release candidate |
