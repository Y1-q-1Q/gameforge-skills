# Hybrid ECS Migration Strategy

## The Hybrid Approach

Instead of rewriting everything, create a **hybrid architecture**:

```
MonoBehaviour World                    ECS World
───────────────────                    ─────────
GameManager         ←──events──→       SimulationSystemGroup
PlayerController                        MovementSystem
EnemySpawner      ←──entities──→       SpawnSystem
UISystem          ←──queries───→       HealthSystem
```

## Phase 1: Foundation (Week 1-2)

1. **Setup ECS packages**
   - Entities
   - Burst
   - Collections
   - Mathematics

2. **Create bridge components**
   ```csharp
   // MonoBehaviour side
   public class EntityProxy : MonoBehaviour {
       public Entity entity;
       public World world;
   }
   ```

3. **Implement basic sync**
   - Position/Rotation sync
   - Spawn/Destroy events

## Phase 2: High-Value Systems (Week 3-6)

Migrate systems with highest performance impact:
- Pathfinding
- AI decision making
- Physics simulations

## Phase 3: Validation (Week 7-8)

- Performance benchmarking
- Stability testing
- Team knowledge transfer

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Data corruption | Keep MonoBehaviour as source of truth during transition |
| Performance regression | Profile before/after each migration |
| Team resistance | Start with optional/opt-in systems |
| Build complexity | Use conditional compilation for ECS code |
