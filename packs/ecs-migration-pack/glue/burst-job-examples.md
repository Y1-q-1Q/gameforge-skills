# Practical Burst Compiler Patterns

## Pattern 1: Parallel Job (IJobEntity)

```csharp
[BurstCompile]
public partial struct MovementJob : IJobEntity {
    public float deltaTime;
    
    void Execute(ref LocalTransform transform, in Velocity velocity) {
        transform.Position += velocity.Value * deltaTime;
    }
}

// Usage
new MovementJob { deltaTime = dt }.ScheduleParallel();
```

## Pattern 2: Batch Processing (IJobParallelFor)

```csharp
[BurstCompile]
public struct BatchProcessJob : IJobParallelFor {
    [ReadOnly] public NativeArray<float3> positions;
    [WriteOnly] public NativeArray<float> distances;
    public float3 target;
    
    public void Execute(int index) {
        distances[index] = math.distance(positions[index], target);
    }
}
```

## Pattern 3: Entity Command Buffer

```csharp
[BurstCompile]
public partial struct SpawnJob : IJobEntity {
    public EntityCommandBuffer.ParallelWriter ecb;
    public Entity prefab;
    public float deltaTime;
    
    void Execute([ChunkIndexInQuery] int chunkIndex, in Spawner spawner) {
        spawner.timer -= deltaTime;
        if (spawner.timer <= 0) {
            var entity = ecb.Instantiate(chunkIndex, prefab);
            ecb.SetComponent(chunkIndex, entity, 
                new LocalTransform { Position = spawner.position });
        }
    }
}
```

## Performance Comparison

| Operation | MonoBehaviour | ECS (no Burst) | ECS (Burst) |
|-----------|---------------|----------------|-------------|
| 10k transforms | 2.5ms | 0.8ms | 0.15ms |
| 5k pathfinding | 8ms | 3ms | 0.6ms |
| 1k physics raycasts | 4ms | 2ms | 0.4ms |

## Common Pitfalls

1. **Managed types in components** — Only blittable types allowed
2. **Frequent EntityManager calls** — Use EntityQuery instead
3. **Missing [BurstCompile]** — Always annotate hot paths
4. **Too many sync points** — Batch structural changes
