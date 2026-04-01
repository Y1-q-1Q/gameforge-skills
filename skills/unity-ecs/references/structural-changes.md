# Structural Changes & EntityCommandBuffer

## Why EntityCommandBuffer (ECB)?

Structural changes (add/remove components, create/destroy entities) invalidate entity queries.
You can't do them inside a `foreach` query or parallel job. ECB defers them to a safe sync point.

## ECB Usage Patterns

### Pattern 1: System with ECB (most common)

```csharp
[BurstCompile]
public partial struct DeathSystem : ISystem
{
    [BurstCompile]
    public void OnUpdate(ref SystemState state)
    {
        var ecb = new EntityCommandBuffer(Allocator.Temp);

        foreach (var (health, entity) in
            SystemAPI.Query<RefRO<Health>>().WithEntityAccess())
        {
            if (health.ValueRO.Current <= 0)
            {
                ecb.DestroyEntity(entity);
            }
        }

        ecb.Playback(state.EntityManager);
        ecb.Dispose();
    }
}
```

### Pattern 2: ECB from BeginSimulationEntityCommandBufferSystem

```csharp
[UpdateInGroup(typeof(SimulationSystemGroup))]
public partial struct SpawnSystem : ISystem
{
    public void OnUpdate(ref SystemState state)
    {
        var ecbSingleton = SystemAPI.GetSingleton<BeginSimulationEntityCommandBufferSystem.Singleton>();
        var ecb = ecbSingleton.CreateCommandBuffer(state.WorldUnmanaged);

        foreach (var (spawner, transform) in
            SystemAPI.Query<RefRW<EnemySpawner>, RefRO<LocalTransform>>())
        {
            spawner.ValueRW.Timer -= SystemAPI.Time.DeltaTime;
            if (spawner.ValueRO.Timer <= 0)
            {
                spawner.ValueRW.Timer = spawner.ValueRO.Interval;
                var e = ecb.Instantiate(spawner.ValueRO.Prefab);
                ecb.SetComponent(e, LocalTransform.FromPosition(transform.ValueRO.Position));
            }
        }
        // No Playback needed — system handles it automatically
    }
}
```

### Pattern 3: Parallel ECB (for IJobEntity)

```csharp
[BurstCompile]
partial struct ParallelDeathJob : IJobEntity
{
    public EntityCommandBuffer.ParallelWriter ECB;

    void Execute(Entity entity, [ChunkIndexInQuery] int sortKey, in Health health)
    {
        if (health.Current <= 0)
            ECB.DestroyEntity(sortKey, entity);
    }
}

// In system:
var ecb = new EntityCommandBuffer(Allocator.TempJob);
new ParallelDeathJob { ECB = ecb.AsParallelWriter() }.ScheduleParallel();
state.Dependency.Complete();
ecb.Playback(state.EntityManager);
ecb.Dispose();
```

## Archetype Management

### What is an Archetype?

Entities with the same set of components share an archetype. Same archetype = same memory chunk = cache-friendly iteration.

```
Archetype A: [Position, Velocity, Health]     → Chunk 1, Chunk 2
Archetype B: [Position, Velocity, Enemy]      → Chunk 3
Archetype C: [Position, Sprite]               → Chunk 4
```

### Archetype Fragmentation Problem

```csharp
// ❌ Adding unique component per entity = 1 archetype per entity = no batching
ecb.AddComponent(entity, new UniqueId { Value = i }); // Each entity gets different archetype!

// ✅ Use ISharedComponentData for grouping (same value = same chunk)
// Or use IBufferElementData for per-entity variable data
```

### IEnableableComponent (Unity 6+ / Entities 1.1+)

Toggle components without structural changes:

```csharp
public struct Stunned : IComponentData, IEnableableComponent { }

// Toggle without archetype change (no ECB needed!)
SystemAPI.SetComponentEnabled<Stunned>(entity, true);  // Enable
SystemAPI.SetComponentEnabled<Stunned>(entity, false); // Disable

// Query only enabled
foreach (var (stun, entity) in SystemAPI.Query<RefRO<Stunned>>().WithEntityAccess())
{
    // Only processes entities where Stunned is enabled
}
```

**This is huge for performance** — avoids archetype moves for state changes like: stunned, poisoned, invulnerable, dead.

## Common Structural Change Mistakes

| Mistake | Impact | Fix |
|---------|--------|-----|
| Structural change in parallel job | Race condition / crash | Use ECB.ParallelWriter |
| Too many unique archetypes | Memory fragmentation, slow queries | Use IEnableableComponent or SharedComponent |
| ECB not disposed | Memory leak | Always Dispose after Playback |
| Forgetting sortKey in parallel | Non-deterministic order | Pass `[ChunkIndexInQuery]` |
