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
