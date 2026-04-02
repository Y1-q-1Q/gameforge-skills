---
name: game-design-doc
version: 2.0.0
description: "Create, analyze, and iterate on Game Design Documents (GDD) for any game genre"
engine: any
category: design
license: Apache-2.0

interface:
  input:
    required:
      - design_goal                   # create, analyze, or iterate GDD
    optional:
      - game_concept                  # initial concept description
      - genre                         # rpg, fps, strategy, etc.
      - target_audience               # casual, core, hardcore
      - monetization_model            # f2p, premium, hybrid

  output:
    - type: architecture              # GDD document
    - type: documentation             # Design analysis, recommendations

  context_blocks:
    - id: gdd-template
      description: "Create complete GDD from concept"
      references: [gdd-template.md]
    - id: monetization-models
      description: "Design monetization strategy"
      references: [monetization-models.md]
    - id: balance-design
      description: "Create economy and progression balance"
      references: [balance-design.md]

references:
  - file: references/gdd-template.md
    relevance: [gdd, template, design, mechanics, core-loop, usp]
    size: 3KB
    priority: high
  - file: references/monetization-models.md
    relevance: [monetization, f2p, premium, economy, ethical]
    size: 3KB
    priority: medium
  - file: references/balance-design.md
    relevance: [balance, economy, progression, difficulty, tuning]
    size: 4KB
    priority: medium

triggers:
  keywords:
    - "game design"
    - "gdd"
    - "game design document"
    - "game concept"
    - "core gameplay loop"
    - "mechanics"
    - "monetization"
    - "progression"
    - "scope"
    - "milestone"
    - "competitive analysis"
    - "game pitch"
  files:
    - "**/GDD*.md"
    - "**/Design*.md"
    - "**/*Design*.docx"
    - "docs/design/**"
  context: {}

composition:
  combines_with:
    - unity-architect            # technical implementation planning
    - unity-netcode              # multiplayer design
    - ue5-blueprint              # UE5 implementation planning
    - ue5-multiplayer            # UE5 multiplayer design
  depends_on: []
  conflicts_with: []
  provides:
    - game-design
    - mechanics-analysis
    - scope-estimation

engine_versions:
  any: {}
  platforms: [windows, macos, linux, ios, android, webgl, playstation, xbox, switch]
---

# game-design-doc

Create, analyze, and iterate on Game Design Documents (GDD) for any game genre.

## When to use

Activate when the user mentions:
- Game Design Document, GDD
- Game concept, game pitch
- Core gameplay loop design
- Mechanics design, system design
- Monetization strategy
- Player progression design
- Competitive analysis for games
- Game scope estimation, milestone planning

## Capabilities

1. **GDD generation** — Complete design document from concept description
2. **Mechanics analysis** — Evaluate depth, clarity, feedback, mastery of game mechanics
3. **Loop design** — 30-second / 5-minute / 1-hour gameplay loop structure
4. **Monetization** — F2P, premium, hybrid models with ethical considerations
5. **Scope estimation** — Realistic milestone planning based on team size
6. **Competitive analysis** — Compare against existing games in the genre

## Architecture Decision Guide

| Game Stage | Document Focus |
|-----------|---------------|
| Concept | 1-page pitch, core loop, USP |
| Pre-production | Full GDD, art direction, tech requirements |
| Production | Living design doc, balance spreadsheets |
| Live service | Update roadmap, event design, retention analysis |

## Engine Agnostic

This skill is not Unity-specific. GDD principles apply to any engine.

## References

- [gdd-template.md](references/gdd-template.md) — Complete GDD template, mechanics analysis framework
- [monetization-models.md](references/monetization-models.md) — F2P, premium, hybrid models, ethical monetization
- [balance-design.md](references/balance-design.md) — Economy design, progression curves, difficulty tuning

## Limitations

- GDD is a living document — it should evolve with the project
- No substitute for playtesting — design on paper ≠ fun in practice
- Scope estimates are rough — multiply by 2x for realistic timelines
