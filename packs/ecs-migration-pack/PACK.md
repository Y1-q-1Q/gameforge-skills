---
name: ecs-migration-pack
version: 1.0.0
description: "Gradual migration from MonoBehaviour to DOTS/ECS without rewriting your entire game"
engine: unity

skills:
  - unity-ecs
  - unity-performance
  - unity-architect

install_order:
  - unity-architect
  - unity-performance
  - unity-ecs

glue:
  - file: glue/migration-strategy.md
    description: "Hybrid ECS-MonoBehaviour architecture for gradual migration"
  - file: glue/component-mapping.md
    description: "Mapping between MonoBehaviour and ECS components"
  - file: glue/burst-job-examples.md
    description: "Practical Burst compiler job patterns"

scenarios:
  - "Existing Unity game wanting ECS performance without full rewrite"
  - "Game with CPU bottlenecks in Update() loops"
  - "Project planning to use ECS for specific systems (physics, AI, rendering)"
  - "Team new to DOTS needing gradual learning path"
---

# ecs-migration-pack

Gradual migration from MonoBehaviour to DOTS/ECS without rewriting your entire game.

## Why this pack exists

Full ECS conversion is risky:
- Months of refactoring
- Steep learning curve for team
- Potential stability issues
- Hard to justify to stakeholders

**Hybrid ECS** lets you migrate system by system, proving value at each step.

## What you get

1. **Architecture foundation** — Project structure supporting both paradigms
2. **Performance baseline** — Profiling to identify migration candidates
3. **ECS patterns** — Component, System, Job fundamentals
4. **Glue logic** — Bridging MonoBehaviour and ECS worlds

## Glue highlights

### Migration Strategy
- Priority matrix: which systems benefit most from ECS
- Incremental migration roadmap
- Risk mitigation strategies

### Component Mapping
- MonoBehaviour → IComponentData mapping
- Shared data patterns (ScriptableObject + BlobAsset)
- Event bridging (ECS events → C# events)

### Burst Job Examples
- Practical job patterns from real games
- Common pitfalls and solutions
- Performance comparison benchmarks

## Migration Priority Matrix

| System | ECS Benefit | Migration Risk | Priority |
|--------|-------------|----------------|----------|
| Pathfinding | High | Low | 1st |
| AI logic | High | Low | 1st |
| Physics (custom) | High | Medium | 2nd |
| Animation | Medium | High | 3rd |
| Rendering | Medium | Medium | 3rd |
| UI | Low | High | Skip |
| Input | Low | Low | Skip |
