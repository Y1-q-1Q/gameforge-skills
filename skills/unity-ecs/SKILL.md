---
name: unity-ecs
version: 2.0.0
description: "Implement ECS/DOTS architecture with Jobs System and Burst Compiler for high-performance Unity games"
engine: unity
category: architecture
license: Apache-2.0

interface:
  input:
    required:
      - ecs_use_case                  # why ECS is needed
    optional:
      - entity_count                  # expected number of entities
      - hybrid_approach               # true/false for MonoBehaviour mix
      - unity_version                 # e.g. 2022.3, 6000.0

  output:
    - type: code                      # ISystem, IComponentData
    - type: architecture              # ECS architecture design
    - type: configuration             # SubScene setup

  context_blocks:
    - id: ecs-quickstart
      description: "Learn core ECS concepts and minimal examples"
      references: [ecs-quickstart.md]
    - id: baking-subscene
      description: "Set up baking pipeline and SubScenes"
      references: [baking-subscene.md]
    - id: structural-changes
      description: "Handle entity creation, destruction, and archetype changes"
      references: [structural-changes.md]
    - id: hybrid-patterns
      description: "Mix ECS with MonoBehaviour when needed"
      references: [hybrid-patterns.md]

references:
  - file: references/ecs-quickstart.md
    relevance: [ecs, dots, entity, component, system, jobs, burst]
    size: 3KB
    priority: high
  - file: references/baking-subscene.md
    relevance: [baking, subscene, authoring, conversion, baker]
    size: 3KB
    priority: high
  - file: references/structural-changes.md
    relevance: [structural, command-buffer, deferred, archetype, entity]
    size: 4KB
    priority: high
  - file: references/hybrid-patterns.md
    relevance: [hybrid, monobehaviour, managed, bridge, ui]
    size: 5KB
    priority: medium

triggers:
  keywords:
    - "ecs"
    - "dots"
    - "entity component system"
    - "jobs"
    - "burst"
    - "data-oriented"
    - "isystem"
    - "icomponentdata"
    - "baking"
    - "subscene"
    - "entity command buffer"
  files:
    - "**/Systems/**/*.cs"
    - "**/Components/**/*.cs"
    - "**/*System.cs"
    - "Assets/SceneDependencyCache/**"
  context:
    - has_unity_project: true
    - has_entities_package: true

composition:
  combines_with:
    - unity-performance          # Jobs+Burst optimization
    - unity-netcode              # deterministic networking
    - unity-architect            # project structure for ECS
  depends_on: []
  conflicts_with: []
  provides:
    - ecs-architecture
    - high-performance-patterns
    - data-oriented-design

engine_versions:
  unity:
    minimum: "2022.3"
    recommended: "2022.3"
    tested: ["2022.3", "6000.0"]
  platforms: [windows, macos, linux, ios, android]
  render_pipelines: [built-in, urp, hdrp]
---

# unity-ecs

Implement ECS/DOTS architecture with Jobs System and Burst Compiler for high-performance Unity games.

## When to use

Activate when the user mentions:
- ECS, DOTS, Entity Component System
- Massive entity counts (thousands+)
- Data-oriented design in Unity
- ISystem, IComponentData, IJobEntity
- Baking, SubScene, entity conversion
- Structural changes, EntityCommandBuffer
- ECS + MonoBehaviour hybrid architecture

## Capabilities

1. **Architecture design** — When to use ECS vs MonoBehaviour, hybrid patterns
2. **Component design** — IComponentData, ISharedComponentData, IBufferElementData, IEnableableComponent
3. **System patterns** — ISystem, SystemAPI, entity queries, scheduling
4. **Baking pipeline** — Baker, SubScene, authoring components
5. **Structural changes** — EntityCommandBuffer, deferred operations
6. **Hybrid bridge** — Mixing ECS with MonoBehaviour, managed components
7. **Performance patterns** — Chunk iteration, archetype optimization, memory layout

## Architecture Decision Guide

| Scenario | Approach | Why |
|----------|----------|-----|
| < 500 entities, simple logic | MonoBehaviour | ECS overhead not worth it |
| 1K-10K similar entities | ECS | Cache-friendly, 5-40x faster |
| > 10K entities | ECS + Jobs + Burst | Only viable option |
| Mixed: few complex + many simple | Hybrid | MonoBehaviour for player, ECS for bullets/AI |
| Networked game | ECS for simulation | Deterministic, easy to snapshot/rollback |

## Unity version support

| Version | DOTS Status |
|---------|-------------|
| Unity 6+ | ✅ Entities 1.3+, production-ready |
| 2022.3 LTS | ✅ Entities 1.0-1.2 |
| 2021.3 LTS | ⚠️ Entities 0.51 (preview, API differs) |

## References

- [ecs-quickstart.md](references/ecs-quickstart.md) — Core concepts, minimal example, Jobs + Burst, performance comparison
- [baking-subscene.md](references/baking-subscene.md) — Baking pipeline, SubScene workflow, authoring components
- [structural-changes.md](references/structural-changes.md) — EntityCommandBuffer, deferred operations, archetype management
- [hybrid-patterns.md](references/hybrid-patterns.md) — Mixing ECS with MonoBehaviour, managed components, UI bridge

## Limitations

- ECS learning curve is steep; team must commit
- Some Unity features (Animation, UI) don't have full ECS support yet
- Debugging ECS is harder than MonoBehaviour (no Inspector by default, use Entities window)
- Entities 1.x API differs significantly from 0.x previews
